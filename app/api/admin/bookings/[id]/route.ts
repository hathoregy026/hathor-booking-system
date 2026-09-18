import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { applyStaffBookingAction, assertBookingAdmin, bookingAdminSession } from "@/lib/booking-admin-api";
import { readPublicJsonBody } from "@/lib/public-api-security";
import { fetchAdminBookingById } from "@/lib/admin-bookings-fetch";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertBookingAdmin(request);
    const { id } = await context.params;
    const result = await applyStaffBookingAction(id, await readPublicJsonBody(request), bookingAdminSession(request));
    const booking = await fetchAdminBookingById(id);
    return NextResponse.json({ booking, email: result.email ?? null });
  } catch (error) { return handleRouteError(error); }
}
