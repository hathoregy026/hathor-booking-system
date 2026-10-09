import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { adminIdentityFromRequest, type AdminIdentity } from "@/lib/admin-server-auth";
import { enforcePublicRateLimit, PublicRequestError, RateLimitExceededError } from "@/lib/public-api-security";

export const inboxHeaders = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer" };

export async function assertInboxAdmin(request: NextRequest): Promise<AdminIdentity> {
  const identity = await adminIdentityFromRequest(request);
  if (!identity) throw new PublicRequestError("Unauthorized", 401);
  await enforcePublicRateLimit({ request, scope: "dashboard-inbox", limit: 120, windowMs: 60000 });
  return identity;
}

export function inboxRouteError(error: unknown) {
  if (error instanceof RateLimitExceededError) return NextResponse.json({ error: "Please retry later" }, { status: 429, headers: { ...inboxHeaders, "Retry-After": String(error.retryAfterSeconds) } });
  if (error instanceof PublicRequestError) return NextResponse.json({ error: error.message }, { status: error.status, headers: inboxHeaders });
  if (error instanceof ZodError) return NextResponse.json({ error: "Invalid request" }, { status: 400, headers: inboxHeaders });
  console.error("[dashboard-inbox] request could not be completed");
  return NextResponse.json({ error: "Inbox is unavailable. Please try again." }, { status: 503, headers: inboxHeaders });
}
