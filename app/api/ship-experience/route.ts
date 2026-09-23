import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSailingAvailability } from "@/lib/availability-service";
import { handleRouteError } from "@/lib/api";
import { enforcePublicRateLimit, PublicRequestError } from "@/lib/public-api-security";
import { loadShipExperience } from "@/lib/ship-experience";
import { bookingHorizonYear } from "@/lib/booking-horizon";

export const dynamic = "force-dynamic";

const durationSchema = z.enum([
  "3-nights-aswan-luxor",
  "4-nights-luxor-aswan",
  "7-nights-luxor-aswan-luxor",
]);

export async function GET(request: NextRequest) {
  try {
    await enforcePublicRateLimit({ request, scope: "ship-experience", limit: 45, windowMs: 60_000 });
    const duration = durationSchema.parse(request.nextUrl.searchParams.get("duration") ?? "7-nights-luxor-aswan-luxor");
    const now = new Date();
    const requestedMonth = request.nextUrl.searchParams.get("month");
    const month = requestedMonth ? z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).parse(requestedMonth) : now.toISOString().slice(0, 7);
    const monthStart = new Date(`${month}-01T00:00:00.000Z`);
    const horizonEnd = new Date(`${bookingHorizonYear(now)}-12-31T23:59:59.999Z`);
    if (monthStart.getTime() > horizonEnd.getTime() || month < now.toISOString().slice(0, 7)) {
      throw new PublicRequestError("Month is outside the booking calendar", 400);
    }
    const from = new Date(Math.max(now.getTime(), monthStart.getTime()));
    const to = new Date(Math.min(from.getTime() + 183 * 86_400_000, horizonEnd.getTime()));
    const ship = await loadShipExperience();
    const sailings = await getSailingAvailability({ duration, from, to, adults: 1, children: 0, rooms: 1 });
    return NextResponse.json(
      { ...ship, sailings },
      { headers: { "Cache-Control": "no-store", "CDN-Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
