const DEFAULT_TIMEOUT_MS = 20_000;
/** Bookings list/calendar can wait on a cold Supabase pooler connection. */
export const ADMIN_BOOKINGS_TIMEOUT_MS = 60_000;
/** Large dashboard media uploads need time for transfer, WebP conversion, and storage. */
export const ADMIN_UPLOAD_TIMEOUT_MS = 90_000;

export function isTransientFetchError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof Error) {
    return (
      error.name === "AbortError" || error.message.includes("timed out")
    );
  }
  return false;
}

export async function adminFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const timeoutController = new AbortController();
  const timeout = setTimeout(() => timeoutController.abort(), timeoutMs);

  const externalSignal = init?.signal;
  const onExternalAbort = () => timeoutController.abort();
  externalSignal?.addEventListener("abort", onExternalAbort);

  try {
    return await fetch(input, {
      ...init,
      signal: timeoutController.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      if (externalSignal?.aborted) {
        throw error;
      }
      throw new Error("Request timed out. The database may be busy — try again.");
    }
    throw error;
  } finally {
    externalSignal?.removeEventListener("abort", onExternalAbort);
    clearTimeout(timeout);
  }
}
