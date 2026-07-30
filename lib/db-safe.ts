import { withDbRetry } from "@/lib/db-retry";

export function logDbError(context: string, error: unknown) {
  console.error(`[db] ${context}:`, error);
}

/** Run a database operation with connection-drop retries. Errors are logged and rethrown. */
export async function withDb<T>(operation: () => Promise<T>): Promise<T> {
  return withDbRetry(operation);
}

/** Serialize public read queries — PrismaPg + Supabase transaction pooler can stall under concurrent findMany. */
let readChain: Promise<unknown> = Promise.resolve();

/**
 * Read-only CMS/path queries — single attempt, serialized.
 * Avoids 4× retry storms and concurrent-adapter stalls against a 5-connection pooler.
 */
export async function withDbRead<T>(operation: () => Promise<T>): Promise<T> {
  const run = readChain.then(() =>
    withDbRetry(operation, { retries: 0, delay: 0 }),
  );
  readChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

/** @deprecated Use withDb — kept for call-site compatibility; no longer swallows errors. */
export async function safeDbQuery<T>(
  context: string,
  operation: () => Promise<T>,
  _fallback?: T,
): Promise<T> {
  try {
    return await withDb(operation);
  } catch (error) {
    logDbError(context, error);
    throw error;
  }
}
