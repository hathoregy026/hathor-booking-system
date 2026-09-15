import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { applyStaffBookingAction, assertBookingAdmin } from "@/lib/booking-admin-api";
import { readPublicJsonBody } from "@/lib/public-api-security";
import { prisma } from "@/lib/prisma";
import { bookingListSelect } from "@/lib/query-selects";
import { serializeAdminBooking } from "@/lib/admin-bookings";
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    assertBookingAdmin(request);
    const { id } = await context.params;
    await applyStaffBookingAction(id, await readPublicJsonBody(request));
    const booking = await prisma.booking.findUniqueOrThrow({ where: { id }, select: bookingListSelect });
    return NextResponse.json({ booking: serializeAdminBooking(booking) });
  } catch (error) { return handleRouteError(error); }
}
