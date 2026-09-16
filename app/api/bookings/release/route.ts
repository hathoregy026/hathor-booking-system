import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/lib/api";
import { releaseBookingHold } from "@/lib/booking-engine";
import { verifyBookingAccessToken } from "@/lib/booking-access-token";
import { assertTrustedPublicJsonRequest, enforcePublicRateLimit, readPublicJsonBody, PublicRequestError } from "@/lib/public-api-security";

export const dynamic = "force-dynamic";

const releaseSchema = z.object({
  bookingId: z.string().min(1).max(128),
  accessToken: z.string().min(1).max(1024),
}).strict();

/** Releases the caller's own temporary hold after its request could not be sent. */
export async function POST(request: NextRequest) {
  try {
    assertTrustedPublicJsonRequest(request);
    await enforcePublicRateLimit({ request, scope: "booking-release", limit: 20, windowMs: 10 * 60_000 });
    const parsed = releaseSchema.parse(await readPublicJsonBody(request));
    if (!verifyBookingAccessToken(parsed.bookingId, parsed.accessToken)) throw new PublicRequestError("Invalid booking authorization", 401);
    const booking = await releaseBookingHold(parsed.bookingId);
    return NextResponse.json({ bookingId: booking.id, status: booking.status }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return handleRouteError(error); }
}
