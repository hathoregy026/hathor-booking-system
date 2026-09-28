import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { createBookingAccessToken } from "@/lib/booking-access-token";
import { parseBookingReference } from "@/lib/booking-code";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import {
  assertTrustedPublicJsonRequest,
  enforceKeyedRateLimit,
  enforcePublicRateLimit,
  PublicRequestError,
} from "@/lib/public-api-security";
import { bookingLookupSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    assertTrustedPublicJsonRequest(request);
    await enforcePublicRateLimit({
      request,
      scope: "booking-lookup",
      limit: 6,
      windowMs: 15 * 60_000,
    });
    const parsed = bookingLookupSchema.parse(await request.json());
    /*
     * Also throttle per targeted email, independent of the caller's IP.
     * Otherwise one attacker spread across many IPs (or one honest IP
     * spraying many harvested emails) can brute-force the 8-char booking
     * code against a specific victim at the full per-IP rate.
     */
    await enforceKeyedRateLimit({
      scope: "booking-lookup-email",
      keyValue: createHash("sha256").update(parsed.email.trim().toLowerCase()).digest("hex"),
      limit: 6,
      windowMs: 15 * 60_000,
      bookingScoped: true,
    });
    const reference = parseBookingReference(parsed.bookingId);
    const booking = await prisma.booking.findFirst({
      where: {
        id: "prefix" in reference ? { startsWith: reference.prefix } : reference.id,
        customerEmail: { equals: parsed.email, mode: "insensitive" },
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!booking) {
      throw new PublicRequestError("Booking code and email did not match", 404);
    }
    const token = createBookingAccessToken(booking.id);
    return NextResponse.json({ bookingId: booking.id, accessToken: token });
  } catch (error) {
    return handleRouteError(error);
  }
}
