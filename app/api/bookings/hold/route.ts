import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { acquireBookingHold } from "@/lib/booking-engine";
import { holdRequestSchema } from "@/lib/booking-request-validation";
import { assertBookingAccessTokenConfiguration, createBookingAccessToken } from "@/lib/booking-access-token";
import { assertTrustedPublicJsonRequest, enforcePublicRateLimit, readPublicJsonBody, requireIdempotencyKey } from "@/lib/public-api-security";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  try {
    assertTrustedPublicJsonRequest(request);
    await enforcePublicRateLimit({ request, scope: "booking-hold", limit: 20, windowMs: 10 * 60_000 });
    const idempotencyKey = requireIdempotencyKey(request);
    const parsed = holdRequestSchema.parse(await readPublicJsonBody(request));
    assertBookingAccessTokenConfiguration();
    const booking = await acquireBookingHold({ ...parsed, idempotencyKey });
    return NextResponse.json({
      bookingId: booking.id, accessToken: createBookingAccessToken(booking.id),
      holdExpiresAt: booking.holdExpiresAt, status: booking.status,
      totalPriceCents: booking.totalPriceCents, currency: booking.currency,
      rooms: booking.bookingRooms.map(r => ({ roomType: r.room.roomType, adults: r.adults, children: r.children, unitPriceCents: r.unitPriceCents })),
      paymentSchedule: booking.paymentSchedule,
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return handleRouteError(error); }
}
