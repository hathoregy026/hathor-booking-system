import { NextRequest, NextResponse } from "next/server";
import { parseISO } from "date-fns";
import { ZodError } from "zod";
import { handleRouteError } from "@/lib/api";
import { getCruiseCalendarDays } from "@/lib/cruise-calendar";
import {
  normalizeRoomConfigsForDuration,
} from "@/lib/booking-search-config";
import { cruiseCalendarQuerySchema } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const parsed = cruiseCalendarQuerySchema.parse({
      duration: searchParams.get("duration"),
      rooms: searchParams.get("rooms"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    });

    const from = parseISO(parsed.from);
    const to = parseISO(parsed.to);

    const result = await getCruiseCalendarDays({
      duration: parsed.duration,
      roomConfigs: normalizeRoomConfigsForDuration(
        parsed.duration,
        parsed.rooms,
      ),
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
