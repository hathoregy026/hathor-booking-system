import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ADMIN_SESSION_COOKIE, getAdminIdentity } from "@/lib/admin-auth";
import { hasAdminPermission } from "@/lib/admin-permissions";
import { PublicRequestError, RateLimitExceededError, enforcePublicRateLimit } from "@/lib/public-api-security";
import { checkRateLimit } from "@/lib/rate-limit";
import { bulkUsesLocalStorage } from "@/lib/bulk-email-store";

export const bulkHeaders = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
export function assertBulkSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host") || new URL(request.url).host;
  let trusted = false;
  try {
    const url = new URL(origin || "");
    trusted = url.origin === origin && url.host === host && /^[a-z\d.-]+$/i.test(url.hostname) && (url.protocol === "https:" || (process.env.NODE_ENV !== "production" && url.protocol === "http:"));
  } catch { /* reject missing or malformed origins */ }
  // Host is the public request authority. Next dev may reconstruct request.url
  // with localhost even when the browser addressed 127.0.0.1.
  if (!trusted || request.headers.get("sec-fetch-site") === "cross-site") throw new PublicRequestError("Request origin rejected.", 403);
}
export async function requireBulkAdmin(request: NextRequest, action = "read") {
  const identity = await getAdminIdentity(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
  if (!identity) throw new PublicRequestError("Please sign in to the dashboard.", 401);
  if (!hasAdminPermission(identity, "administrator")) throw new PublicRequestError("Access denied.", 403);
  const session = identity.sessionId;
  if (action !== "read") {
    assertBulkSameOrigin(request);
  }
  const limit = action === "import" ? 10 : action === "send" ? 10 : 90;
  if (bulkUsesLocalStorage()) {
    const rate = checkRateLimit(`bulk:${action}:${createHash("sha256").update(session).digest("hex")}`, limit);
    if (!rate.allowed) throw new RateLimitExceededError(rate.retryAfterSeconds);
  } else {
    await enforcePublicRateLimit({ request, scope: `booking-bulk-${action}`, limit, windowMs: 60000 });
  }
  return session;
}
export async function readBulkBody(request: Request, maximum = 96 * 1024): Promise<Uint8Array> {
  if (Number(request.headers.get("content-length")) > maximum) throw new PublicRequestError("Request is too large.", 413);
  if (!request.body) throw new PublicRequestError("A request body is required.", 400);
  const reader = request.body.getReader(); let size = 0; const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const result = await reader.read(); if (result.done) break;
      size += result.value.length;
      if (size > maximum) { await reader.cancel(); throw new PublicRequestError("Request is too large.", 413); }
      chunks.push(result.value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}
export async function readBulkJson(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0] !== "application/json") throw new PublicRequestError("Use a JSON request.", 415);
  try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(await readBulkBody(request))); }
  catch (error) { if (error instanceof PublicRequestError) throw error; throw new PublicRequestError("Invalid request.", 400); }
}
export function bulkRouteError(error: unknown) {
  if (error instanceof RateLimitExceededError) return NextResponse.json({ error: "Please wait before trying again." }, { status: 429, headers: { ...bulkHeaders, "Retry-After": String(error.retryAfterSeconds) } });
  if (error instanceof PublicRequestError) return NextResponse.json({ error: error.message }, { status: error.status, headers: bulkHeaders });
  if (error instanceof ZodError) return NextResponse.json({ error: error.issues.some(issue => issue.path[0] === "template") ? "Check the template fields. Use valid colours and a valid footer email address, or leave that address empty." : "Check the subject, message and recipient list. Select between 1 and 100 unique, valid addresses." }, { status: 400, headers: bulkHeaders });
  // Log fixed diagnostic labels only: never include addresses, payloads, SQL,
  // connection strings or the error's free-form message in runtime logs.
  const failure = error instanceof Error ? error : null;
  const code = failure && "code" in failure ? String(failure.code) : "";
  const safeCodes = new Set(["42P01", "42501", "28P01", "28000", "53300", "57P01", "08P01", "42703", "42883", "ECONNREFUSED", "ECONNRESET", "ETIMEDOUT", "ENOTFOUND", "ERR_TLS_CERT_ALTNAME_INVALID", "UNABLE_TO_VERIFY_LEAF_SIGNATURE", "UNABLE_TO_GET_ISSUER_CERT_LOCALLY", "DEPTH_ZERO_SELF_SIGNED_CERT", "SELF_SIGNED_CERT_IN_CHAIN", "CERT_HAS_EXPIRED"]);
  const knownMessages: Record<string, string> = {
    "Bulk email encryption is not configured.": "encryption-configuration",
    "Unsupported state or unable to authenticate data": "history-authentication",
    "Invalid encrypted value.": "invalid-encrypted-record",
    "Invalid record identifier.": "invalid-record-id",
    "Query read timeout": "database-read-timeout",
  };
  const reason = safeCodes.has(code) ? code : knownMessages[failure?.message || ""] || (failure?.message.toLowerCase().includes("timeout") ? "database-timeout" : failure instanceof TypeError ? "type-error" : failure instanceof SyntaxError ? "invalid-json" : "unclassified");
  console.error("[bulk-email] request could not be completed", { reason });
  return NextResponse.json({ error: "Bulk emails are temporarily unavailable. Please try again." }, { status: 503, headers: bulkHeaders });
}
