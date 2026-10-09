import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { adminIdentityFromRequest } from "@/lib/admin-server-auth";
import { fetchAdminBookingById } from "@/lib/admin-bookings-fetch";
import { fetchBookingMessages } from "@/lib/booking-messages";
import { enforcePublicRateLimit } from "@/lib/public-api-security";
import { handleRouteError } from "@/lib/api";

const cursorSchema = z.object({ createdAt: z.iso.datetime(), id: z.uuid() });

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await adminIdentityFromRequest(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await enforcePublicRateLimit({ request, scope: "booking-messages-read", limit: 120, windowMs: 60000 });
    const { id } = await context.params;
    if (!await fetchAdminBookingById(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const before = request.nextUrl.searchParams.get("before");
    const cursorId = request.nextUrl.searchParams.get("cursorId");
    const cursor = before || cursorId ? cursorSchema.parse({ createdAt: before, id: cursorId }) : undefined;
    return NextResponse.json({ messages: await fetchBookingMessages(id, cursor) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) { return handleRouteError(error); }
}
