import { allowedMailboxIds } from "@/lib/admin-mailbox-access";
import { adminApiGuard } from "@/lib/admin-server-auth";
import { NextRequest, NextResponse } from "next/server";
import { fetchDashboardInbox, inboxQuerySchema } from "@/lib/dashboard-inbox";
import { assertInboxAdmin, inboxHeaders, inboxRouteError } from "@/lib/inbox-api";

export async function GET(request: NextRequest) {
  const denied = await adminApiGuard("inbox.view");
  if (denied) return denied;
  try {
    const identity = await assertInboxAdmin(request);
    const allowed = allowedMailboxIds(identity);
    const input = inboxQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return NextResponse.json(await fetchDashboardInbox(input, undefined, allowed), { headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
