import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { handleRouteError } from "@/lib/api";
import {
  buildRoomConfigsFromParams,
  listActiveCruises,
  runCruiseSearch,
  runPeriodCruiseSearch,
  type CruiseSearchResponse,
} from "@/lib/cruise-search";
import { logDbError, withDb } from "@/lib/db-safe";
import { cruiseSearchSchema, periodSearchSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function emptySearchResult(
  overrides: Partial<CruiseSearchResponse> = {},
): CruiseSearchResponse {
  return {
    cruiseId: "",
    startDate: "",
    endDate: "",
    checkInDate: "",
    duration: "7-nights-luxor-aswan-luxor",
    cruises: [],
    schedules: [],
    ...overrides,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  console.log("[api/cruises] search params:", {
    duration: searchParams.get("duration"),
    checkInDate: searchParams.get("checkInDate"),
    periodStart: searchParams.get("periodStart"),
    periodEnd: searchParams.get("periodEnd"),
    rooms: searchParams.get("rooms"),
    roomType: searchParams.get("roomType"),
    adults: searchParams.get("adults"),
    children: searchParams.get("children"),
  });

  try {
    const duration = searchParams.get("duration");
    const checkInDate = searchParams.get("checkInDate");
    const periodStart = searchParams.get("periodStart");
    const periodEnd = searchParams.get("periodEnd");

    if (periodStart && periodEnd) {
      const parsed = periodSearchSchema.parse({
        periodStart,
        periodEnd,
        rooms: searchParams.get("rooms") ?? undefined,
        roomType: searchParams.get("roomType") ?? undefined,
        adults: searchParams.get("adults") ?? undefined,
        children: searchParams.get("children") ?? undefined,
      });

      const roomConfigs = buildRoomConfigsFromParams({
        rooms: parsed.rooms,
        roomType: parsed.roomType,
        adults: parsed.adults,
        children: parsed.children,
      });

      const result = await runPeriodCruiseSearch(
        parsed.periodStart,
        parsed.periodEnd,
        roomConfigs,
      );

      console.log("[api/cruises] period search result:", {
        cruiseCount: result.cruises.length,
        scheduleCount: result.schedules.length,
        reason: result.reason,
      });

      return NextResponse.json(result);
    }

    if (duration && checkInDate) {
      const parsed = cruiseSearchSchema.parse({
        duration,
        checkInDate,
        rooms: searchParams.get("rooms") ?? undefined,
        roomType: searchParams.get("roomType") ?? undefined,
        adults: searchParams.get("adults") ?? undefined,
        children: searchParams.get("children") ?? undefined,
      });

      const roomConfigs = buildRoomConfigsFromParams({
        rooms: parsed.rooms,
        roomType: parsed.roomType,
        adults: parsed.adults,
        children: parsed.children,
      });

      const result = await runCruiseSearch(
        parsed.duration,
        parsed.checkInDate,
        roomConfigs,
      );

      console.log("[api/cruises] cruise search result:", {
        cruiseCount: result.cruises.length,
        roomCount: result.cruises[0]?.rooms.length ?? 0,
        scheduleCount: result.schedules.length,
        reason: result.reason,
      });

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

    const cruises = await withDb(() => listActiveCruises());

    return NextResponse.json({ cruises });
  } catch (error) {
    if (error instanceof ZodError) {
      return handleRouteError(error);
    }

    logDbError("public.cruises.GET", error);
    return NextResponse.json(
      {
        error:
          "Could not search sailings. Check your connection and try again.",
        ...emptySearchResult(),
      },
      { status: 503 },
    );
  }
}
