import { allowedMailboxIds } from "@/lib/admin-mailbox-access";
import { adminApiGuard } from "@/lib/admin-server-auth";
import { NextRequest, NextResponse } from "next/server";
import { adminIdentityFromRequest } from "@/lib/admin-server-auth";
import { dismissNotifications, fetchAdminNotifications, markNotificationBookingsSeen, notificationDismissSchema, notificationSeenSchema } from "@/lib/admin-notifications";
import { z } from "zod";
import { inboxHeaders, inboxRouteError } from "@/lib/inbox-api";
import { assertTrustedPublicJsonRequest, enforcePublicRateLimit, PublicRequestError } from "@/lib/public-api-security";
import { readPrivateEmailJson } from "@/lib/private-email";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

async function authorize(request: NextRequest) {
  const identity = await adminIdentityFromRequest(request);
  if (!identity) throw new PublicRequestError("Unauthorized", 401);
  await enforcePublicRateLimit({ request, scope: "booking-admin-notifications", limit: 90, windowMs: 60000 });
  return identity;
}

export async function GET(request: NextRequest) {
  const denied = await adminApiGuard("bookings.view");
  if (denied) return denied;
  try {
    const identity = await authorize(request);
    return NextResponse.json(await fetchAdminNotifications(undefined, allowedMailboxIds(identity)), { headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}

export async function POST(request: NextRequest) {
  const denied = await adminApiGuard("bookings.view");
  if (denied) return denied;
  try {
    const identity = await authorize(request);
    assertTrustedPublicJsonRequest(request);
    const input = z.union([notificationDismissSchema, notificationSeenSchema]).parse(await readPrivateEmailJson(request));
    if ("notifications" in input) await dismissNotifications(input, undefined, allowedMailboxIds(identity));
    else await markNotificationBookingsSeen(input);
    return NextResponse.json({ ok: true }, { headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
