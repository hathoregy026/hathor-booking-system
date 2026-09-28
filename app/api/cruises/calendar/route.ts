import { NextRequest, NextResponse } from "next/server";
import { parseISO } from "date-fns";
import { ZodError } from "zod";
import { handleRouteError } from "@/lib/api";
import { getCruiseCalendarDays } from "@/lib/cruise-calendar";
import {
  normalizeRoomConfigsForDuration,
} from "@/lib/booking-search-config";
import { cruiseCalendarQuerySchema } from "@/lib/validations";
import { enforcePublicRateLimit } from "@/lib/public-api-security";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    await enforcePublicRateLimit({
      request,
      scope: "cruises-calendar",
      limit: 60,
      windowMs: 60_000,
    });
    const { searchParams } = request.nextUrl;
    const parsed = cruiseCalendarQuerySchema.parse({
      duration: searchParams.get("duration"),
      rooms: searchParams.get("rooms"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
      roomId: searchParams.get("roomId") ?? undefined,
    });

    const from = parseISO(parsed.from);
    const to = parseISO(parsed.to);

    const result = await getCruiseCalendarDays({
      duration: parsed.duration,
      roomConfigs: normalizeRoomConfigsForDuration(
        parsed.duration,
        parsed.rooms,
      ),
      roomId: parsed.roomId,
      from,
      to,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid calendar request" },
        { status: 400 },
      );
    }

    return handleRouteError(error);
  }
}
