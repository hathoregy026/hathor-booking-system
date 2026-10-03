import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { fetchAdminNotifications, markNotificationBookingsSeen, notificationSeenSchema } from "@/lib/admin-notifications";
import { inboxHeaders, inboxRouteError } from "@/lib/inbox-api";
import { assertTrustedPublicJsonRequest, enforcePublicRateLimit, PublicRequestError } from "@/lib/public-api-security";
import { readPrivateEmailJson } from "@/lib/private-email";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

async function authorize(request: NextRequest) {
  if (!verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value)) throw new PublicRequestError("Unauthorized", 401);
  await enforcePublicRateLimit({ request, scope: "booking-admin-notifications", limit: 90, windowMs: 60000 });
}

export async function GET(request: NextRequest) {
  try {
    await authorize(request);
    return NextResponse.json(await fetchAdminNotifications(), { headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}

export async function POST(request: NextRequest) {
  try {
    await authorize(request);
    assertTrustedPublicJsonRequest(request);
    await markNotificationBookingsSeen(notificationSeenSchema.parse(await readPrivateEmailJson(request)));
    return NextResponse.json({ ok: true }, { headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
