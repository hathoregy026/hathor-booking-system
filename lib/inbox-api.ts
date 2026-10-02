import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { enforcePublicRateLimit, PublicRequestError, RateLimitExceededError } from "@/lib/public-api-security";

export const inboxHeaders = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };

export async function assertInboxAdmin(request: NextRequest) {
  if (!verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) throw new PublicRequestError("Unauthorized", 401);
  await enforcePublicRateLimit({ request, scope: "dashboard-inbox", limit: 120, windowMs: 60000 });
}

export function inboxRouteError(error: unknown) {
  if (error instanceof RateLimitExceededError) return NextResponse.json({ error: "Please retry later" }, { status: 429, headers: { ...inboxHeaders, "Retry-After": String(error.retryAfterSeconds) } });
  if (error instanceof PublicRequestError) return NextResponse.json({ error: error.message }, { status: error.status, headers: inboxHeaders });
  if (error instanceof ZodError) return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: inboxHeaders });
  console.error("[dashboard-inbox] request could not be completed");
  return NextResponse.json({ error: "Inbox is unavailable. Please try again." }, { status: 503, headers: inboxHeaders });
}
