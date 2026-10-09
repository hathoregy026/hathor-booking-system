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
  if (!(await adminIdentityFromRequest(request))) throw new PublicRequestError("Unauthorized", 401);
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
    const input = z.union([notificationDismissSchema, notificationSeenSchema]).parse(await readPrivateEmailJson(request));
    if ("notifications" in input) await dismissNotifications(input);
    else await markNotificationBookingsSeen(input);
    return NextResponse.json({ ok: true }, { headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
