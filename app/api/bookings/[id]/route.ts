import { NextRequest, NextResponse } from "next/server";
import { verifyBookingAccessToken } from "@/lib/booking-access-token";
import { paymentSchedule, netPaid, getBookingReservation } from "@/lib/booking-engine";
import { handleRouteError } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!verifyBookingAccessToken(id, request.headers.get("authorization")?.replace(/^Bearer /, ""))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const booking = await getBookingReservation(id);
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const expired = booking.status === "PENDING_HOLD" && (!booking.holdExpiresAt || booking.holdExpiresAt <= new Date());
    return NextResponse.json({
      bookingId: id, status: expired ? "EXPIRED" : booking.status,
      holdExpiresAt: booking.holdExpiresAt, totalPriceCents: booking.totalPriceCents,
      rooms: booking.bookingRooms.map(r => ({ roomType: r.room.roomType, adults: r.adults, children: r.children, unitPriceCents: r.unitPriceCents })),
      voyage: booking.cruiseSchedule.cruise.name, route: booking.cruiseSchedule.cruise.ports,
      departureTime: booking.cruiseSchedule.departureTime, arrivalTime: booking.cruiseSchedule.arrivalTime,
      paymentSchedule: booking.paymentSchedule,
      requiredCents: paymentSchedule(booking.totalPriceCents!, booking.cruiseSchedule.departureTime).requiredCents,
      amountPaidCents: netPaid(booking.payments),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return handleRouteError(error); }
}
