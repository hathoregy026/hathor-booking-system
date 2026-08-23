import { AsyncLocalStorage } from "node:async_hooks";
import { invalidatePrismaClient } from "@/lib/prisma-state";

const TRANSIENT_PATTERNS = [
  "connection terminated",
  "connection terminated unexpectedly",
  "econnreset",
  "connection refused",
  "can't reach database",
  "server closed the connection",
  "connection closed",
  "socket hang up",
  "server has closed the connection",
  "client has encountered a connection error",
  "is not queryable",
];

/**
 * Pool exhaustion is NOT a transient network fault — the database is fine and
 * simply has not been asked anything. Retrying adds load to a queue that is
 * already full, so these fail fast.
 *
 * "timeout exceeded when trying to connect" is what `pg` raises when the local
 * pool is saturated. It used to sit in TRANSIENT_PATTERNS above, which meant a
 * saturated pool was retried four times per call. With nested calls that
 * compounded to ~16 attempts and multi-minute page loads.
 *
 * Prisma's own P2024 carries the same meaning, but the pg driver adapter
 * surfaces the raw pg error without that code, so the message must be matched.
 */
const POOL_EXHAUSTION_PATTERNS = [
  "max clients reached",
  "emaxconnsession",
  "emaxconn",
  "timeout exceeded when trying to connect",
  "timed out fetching a new connection",
];

const NON_RETRY_PATTERNS = [
  "transaction already closed",
  "rollback cannot be executed",
  "unique constraint failed",
];

const TRANSIENT_PRISMA_CODES = new Set(["P1001", "P1002", "P1017"]);

/**
 * Marks that we are already inside a withDbRetry scope. A nested call then runs
 * its operation directly instead of wrapping it in a second retry loop —
 * otherwise an inner 4-attempt loop inside an outer 4-attempt loop becomes 16
 * attempts against the same failing resource.
 */
const retryScope = new AsyncLocalStorage<true>();

export function isConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return TRANSIENT_PATTERNS.some((pattern) => message.includes(pattern));
}

export function isPoolExhaustionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as { code?: string }).code;
  if (code === "P2024") return true;
  const message = error.message.toLowerCase();
  return POOL_EXHAUSTION_PATTERNS.some((pattern) => message.includes(pattern));
}

export function isTransientDbError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const code = (error as { code?: string }).code;
  const message = error.message.toLowerCase();

  if (NON_RETRY_PATTERNS.some((pattern) => message.includes(pattern))) {
    return false;
  }
  if (code === "P2002" || code === "P2034") return false;
  if (isPoolExhaustionError(error)) return false;
  if (code && TRANSIENT_PRISMA_CODES.has(code)) return true;

  return TRANSIENT_PATTERNS.some((pattern) => message.includes(pattern));
}

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  options: { retries?: number; delay?: number } = {},
): Promise<T> {
  // Already inside a retry scope: run once and let the outermost caller own
  // the retry policy. Prevents nested loops multiplying attempt counts.
  if (retryScope.getStore()) {
    return operation();
  }

  const { retries = 3, delay = 500 } = options;
  let lastError: unknown;

  return retryScope.run(true, async () => {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.error(
          `[db-retry] attempt ${attempt + 1}/${retries + 1} failed:`,
          error instanceof Error ? error.message : error,
        );

        if (
          isPoolExhaustionError(error) ||
          attempt === retries ||
          !isTransientDbError(error)
        ) {
          throw error;
        }

        // Rebind Prisma to the live pool — never $disconnect() or pool.end()
        // mid-request. Skip the SELECT 1 probe: under layout concurrency it
        // steals another pool slot.
        if (isConnectionError(error)) {
          invalidatePrismaClient();
        }

        await new Promise((resolve) =>
          setTimeout(resolve, delay * 2 ** attempt),
        );
      }
    }
    throw lastError;
  });
}
