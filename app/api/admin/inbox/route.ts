import { NextRequest, NextResponse } from "next/server";
import { fetchDashboardInbox, inboxQuerySchema } from "@/lib/dashboard-inbox";
import { assertInboxAdmin, inboxHeaders, inboxRouteError } from "@/lib/inbox-api";

export async function GET(request: NextRequest) {
  try {
    await assertInboxAdmin(request);
    const input = inboxQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    return NextResponse.json(await fetchDashboardInbox(input), { headers: inboxHeaders });
  } catch (error) { return inboxRouteError(error); }
}
