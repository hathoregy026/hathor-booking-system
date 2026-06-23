import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  runAvailabilityLookup,
  runWidgetAvailabilityLookup,
} from "@/lib/availability-lookup";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import {
  availabilitySearchSchema,
  availabilityWidgetSearchSchema,
} from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const duration = searchParams.get("duration");
    const checkInDate = searchParams.get("checkInDate");
    const rooms = searchParams.get("rooms");

    if (duration && checkInDate && rooms) {
      const parsed = availabilityWidgetSearchSchema.parse({
        duration,
        checkInDate,
        rooms,
      });

      const result = await runWidgetAvailabilityLookup(
        parsed.duration,
        parsed.checkInDate,
        parsed.rooms,
      );

      if (result.reason === "CRUISE_NOT_FOUND") {
        return NextResponse.json(
          {
            error: "No cruise matches the selected length of stay.",
            ...result,
          },
          { status: 404 },
        );
      }

      return NextResponse.json(result);
    }

    const parsed = availabilitySearchSchema.parse({
      cruiseId: searchParams.get("cruiseId"),
      startDate: searchParams.get("startDate"),
      endDate: searchParams.get("endDate"),
    });

    const result = await runAvailabilityLookup({
      cruiseId: parsed.cruiseId,
      startDate: parsed.startDate,
      endDate: parsed.endDate,
    });

    if (result.reason === "CRUISE_NOT_FOUND") {
      return NextResponse.json({ error: "Cruise not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return handleRouteError(error);
    }
    logDbError("availability.GET", error);
    return NextResponse.json({
      cruiseId: null,
      startDate: null,
      endDate: null,
      schedules: [],
    });
  }
}
