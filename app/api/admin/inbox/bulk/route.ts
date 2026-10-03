import { NextRequest, NextResponse } from "next/server";
import { applyDashboardEmailAction, dashboardEmailActionSchema } from "@/lib/dashboard-email-actions";
import { assertInboxAdmin, inboxHeaders, inboxRouteError } from "@/lib/inbox-api";
import { assertTrustedPublicJsonRequest, readPublicJsonBody } from "@/lib/public-api-security";

export async function POST(request: NextRequest) {
  try {
    await assertInboxAdmin(request);
    assertTrustedPublicJsonRequest(request);
    const input = dashboardEmailActionSchema.parse(await readPublicJsonBody(request));
    return NextResponse.json(await applyDashboardEmailAction(input), { headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
