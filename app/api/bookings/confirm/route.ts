import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { submitBookingRequest } from "@/lib/booking-engine";
import { bookingRequestSchema } from "@/lib/booking-request-validation";
import { verifyBookingAccessToken } from "@/lib/booking-access-token";
import { assertTrustedPublicJsonRequest, enforcePublicRateLimit, readPublicJsonBody, requireIdempotencyKey, PublicRequestError } from "@/lib/public-api-security";
import { sendRequestEmails } from "@/lib/booking-guest-mail";
export const dynamic = "force-dynamic";
/** Submit a request only. Acceptance and payments are staff operations. */
export async function POST(request: NextRequest) {
  try {
    assertTrustedPublicJsonRequest(request);
    await enforcePublicRateLimit({ request, scope: "booking-request", limit: 20, windowMs: 10 * 60_000 });
    const key = requireIdempotencyKey(request);
    const parsed = bookingRequestSchema.parse(await readPublicJsonBody(request));
    if (!verifyBookingAccessToken(parsed.bookingId, parsed.accessToken)) throw new PublicRequestError("Invalid booking authorization", 401);
    const { booking, replay } = await submitBookingRequest(parsed, key);
    if (!replay) {
      try {
        await sendRequestEmails(booking.id, parsed.accessToken);
      } catch { console.error("[booking] request notification status unavailable"); }
    }
    return NextResponse.json({ bookingId: booking.id, accessToken: parsed.accessToken, status: booking.status,
      message: "Your booking request has been sent. Hathor reservations will contact you with the invoice and payment instructions." },
      { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return handleRouteError(error); }
}
