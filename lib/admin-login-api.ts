import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { AdminAuthConfigError } from "@/lib/admin-auth-crypto";
import {
  assertTrustedPublicJsonRequest,
  PublicRequestError,
  RateLimitExceededError,
  readPublicJsonBody,
} from "@/lib/public-api-security";

/* Sign-in responses must never be cached or leak the URL onward. */
export const LOGIN_RESPONSE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Pragma: "no-cache",
  "Referrer-Policy": "no-referrer",
};

export function loginJson(body: unknown, status = 200): NextResponse {
  return NextResponse.json(body, { status, headers: LOGIN_RESPONSE_HEADERS });
}

/** Same-origin JSON only, size-capped, then validated against `schema`. */
export async function readLoginBody<T extends z.ZodType>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  assertTrustedPublicJsonRequest(request);
  const parsed = schema.safeParse(await readPublicJsonBody(request));
  if (!parsed.success) throw new PublicRequestError("Invalid request", 400);
  return parsed.data;
}

/**
 * Generic, detail-free answers for the browser; specifics stay in the server
 * log (without secrets).
 */
export function loginRouteError(error: unknown, scope: string): NextResponse {
  if (error instanceof RateLimitExceededError) {
    const response = loginJson(
      { error: "Too many attempts. Please wait a few minutes and try again." },
      429,
    );
    response.headers.set("Retry-After", String(error.retryAfterSeconds));
    return response;
  }
  if (error instanceof PublicRequestError) {
    return loginJson({ error: error.message }, error.status);
  }
  if (error instanceof ZodError) {
    return loginJson({ error: "Invalid request" }, 400);
  }
  if (error instanceof AdminAuthConfigError) {
    console.error(`[admin-auth] ${scope}: ${error.message}`);
    return loginJson({ error: "Sign-in is not configured on this server." }, 503);
  }
  // Name and driver code only: messages can echo request values such as emails.
  const name = error instanceof Error ? error.name : "unknown";
  const code = (error as { code?: unknown } | null)?.code;
  console.error(`[admin-auth] ${scope} failed: ${name}${typeof code === "string" ? ` (${code})` : ""}`);
  return loginJson({ error: "Something went wrong. Please try again." }, 500);
}

export const SIGN_IN_EXPIRED = "Your sign-in timed out. Please enter your password again.";
