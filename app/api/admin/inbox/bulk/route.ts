import { allowedMailboxIds } from "@/lib/admin-mailbox-access";
import { adminApiGuard } from "@/lib/admin-server-auth";
import { NextRequest, NextResponse } from "next/server";
import { applyDashboardEmailAction, dashboardEmailActionSchema } from "@/lib/dashboard-email-actions";
import { assertInboxAdmin, inboxHeaders, inboxRouteError } from "@/lib/inbox-api";
import { assertTrustedPublicJsonRequest, readPublicJsonBody } from "@/lib/public-api-security";

export async function POST(request: NextRequest) {
  const denied = await adminApiGuard("inbox.manage");
  if (denied) return denied;
  try {
    const identity = await assertInboxAdmin(request);
    assertTrustedPublicJsonRequest(request);
    const input = dashboardEmailActionSchema.parse(await readPublicJsonBody(request));
    return NextResponse.json(await applyDashboardEmailAction(input, undefined, allowedMailboxIds(identity)), { headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
