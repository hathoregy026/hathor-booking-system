import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/lib/api";
import { createBookingAccessToken } from "@/lib/booking-access-token";
import { parseBookingReference } from "@/lib/booking-code";
import { prisma } from "@/lib/prisma";
import {
  assertTrustedPublicJsonRequest,
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
