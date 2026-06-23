import { invalidatePrismaClient } from "@/lib/prisma";

const TRANSIENT_PATTERNS = [
  "connection terminated",
  "connection terminated unexpectedly",
  "timeout exceeded when trying to connect",
  "econnreset",
  "connection refused",
  "can't reach database",
  "server closed the connection",
  "connection closed",
  "socket hang up",
  "server has closed the connection",
];

const POOL_EXHAUSTION_PATTERNS = [
  "max clients reached",
  "emaxconnsession",
  "emaxconn",
];

const NON_RETRY_PATTERNS = [
  "transaction already closed",
  "rollback cannot be executed",
  "unique constraint failed",
];

const TRANSIENT_PRISMA_CODES = new Set(["P1001", "P1002", "P1017"]);

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
  const { retries = 2, delay = 400 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      console.error(
        `[db-retry] attempt ${attempt + 1}/${retries + 1} failed:`,
        error instanceof Error ? error.message : error,
      );

      if (isPoolExhaustionError(error) || attempt === retries || !isTransientDbError(error)) {
        throw error;
      }

      // Rebind Prisma to the live pool — never $disconnect() or pool.end() mid-request.
      if (isConnectionError(error)) {
        invalidatePrismaClient();
      }

      await new Promise((resolve) =>
        setTimeout(resolve, delay * (attempt + 1)),
      );
    }
  }

  throw lastError;
}
