import { withDbRetry } from "@/lib/db-retry";

export function logDbError(context: string, error: unknown) {
  console.error(`[db] ${context}:`, error);
}

/** Run a database operation with connection-drop retries. Errors are logged and rethrown. */
export async function withDb<T>(operation: () => Promise<T>): Promise<T> {
  return withDbRetry(operation);
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
