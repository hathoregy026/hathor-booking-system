import { NextRequest, NextResponse } from "next/server";
import { parseISO } from "date-fns";
import { ZodError } from "zod";
import { handleRouteError } from "@/lib/api";
import { InvalidBookingError } from "@/lib/booking";
import {
  assertRoomSearchConfigs,
  validateDepartureDate,
} from "@/lib/booking-validation";
import { getCruiseCalendarDays } from "@/lib/cruise-calendar";
import {
  buildRoomConfigsFromParams,
  runCruiseSearch,
} from "@/lib/cruise-search";
import { normalizeRoomConfigsForDuration } from "@/lib/booking-search-config";
import {
  availabilityWidgetSearchSchema,
  cruiseCalendarQuerySchema,
  cruiseSearchSchema,
} from "@/lib/validations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function jsonValidationError(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Strict availability API — enforces RAW_DATA departure days, guest limits,
 * and inventory rules before returning calendar or search results.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (from && to) {
      const parsed = cruiseCalendarQuerySchema.parse({
        duration: searchParams.get("duration"),
        rooms: searchParams.get("rooms"),
        from,
        to,
      });

      const roomConfigs = normalizeRoomConfigsForDuration(
        parsed.duration,
        parsed.rooms,
      );
      assertRoomSearchConfigs(parsed.duration, roomConfigs);

      const result = await getCruiseCalendarDays({
        duration: parsed.duration,
        roomConfigs,
        from: parseISO(parsed.from),
        to: parseISO(parsed.to),
      });

      return NextResponse.json({
        ...result,
        days: result.days.map((day) => ({
          ...day,
          status:
            day.status === "available" &&
            !validateDepartureDate(
              `${day.date}T00:00:00.000Z`,
              parsed.duration,
            ).ok
              ? "closed"
              : day.status,
        })),
      });
    }

    const durationParam = searchParams.get("duration");
    const checkInDate = searchParams.get("checkInDate");

    if (durationParam && checkInDate) {
      const parsed = cruiseSearchSchema.parse({
        duration: durationParam,
        checkInDate,
        rooms: searchParams.get("rooms") ?? undefined,
        roomType: searchParams.get("roomType") ?? undefined,
        adults: searchParams.get("adults") ?? undefined,
        children: searchParams.get("children") ?? undefined,
      });

      const duration = parsed.duration;

      const roomConfigs = buildRoomConfigsFromParams({
        rooms: parsed.rooms,
        roomType: parsed.roomType,
        adults: parsed.adults,
        children: parsed.children,
      });

      const normalizedRooms = normalizeRoomConfigsForDuration(
        duration,
        roomConfigs,
      );
      assertRoomSearchConfigs(duration, normalizedRooms);

      const departureCheck = validateDepartureDate(parsed.checkInDate, duration);
      if (!departureCheck.ok) {
        return jsonValidationError(departureCheck.message);
      }

      const result = await runCruiseSearch(
        duration,
        parsed.checkInDate,
        normalizedRooms,
      );

      return NextResponse.json(result);
    }

    const widget = availabilityWidgetSearchSchema.safeParse({
      duration: durationParam,
      checkInDate,
      rooms: searchParams.get("rooms"),
    });

    if (widget.success) {
      const normalizedRooms = normalizeRoomConfigsForDuration(
        widget.data.duration,
        widget.data.rooms,
      );
      assertRoomSearchConfigs(widget.data.duration, normalizedRooms);

      const departureCheck = validateDepartureDate(
        widget.data.checkInDate,
        widget.data.duration,
      );
      if (!departureCheck.ok) {
        return jsonValidationError(departureCheck.message);
      }

      const result = await runCruiseSearch(
        widget.data.duration,
        widget.data.checkInDate,
        normalizedRooms,
      );

      return NextResponse.json(result);
    }

    return NextResponse.json(
      {
        error:
          "Provide calendar params (duration, rooms, from, to) or search params (duration, checkInDate, rooms).",
      },
      { status: 400 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message ?? "Invalid availability request" },
        { status: 400 },
      );
    }

    if (error instanceof InvalidBookingError) {
      return jsonValidationError(error.message);
    }

    return handleRouteError(error);
  }
}
