import { addMonths, endOfMonth, startOfMonth } from "date-fns";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import {
  LUXURY_TO_DB_ROOM_TYPES,
  STAY_DURATION_OPTIONS,
  durationSupportsRoomType,
  normalizeRoomConfigsForDuration,
  type LuxuryRoomTypeValue,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { getCruiseCalendarDays } from "@/lib/cruise-calendar";
import {
  checkInIsoFromDateKey,
  isValidDepartureDateKey,
} from "@/lib/departure-dates";
import { utcDateKeyFromDate, utcNow } from "@/lib/dates";
import {
  computeStayDates,
  resolveCruiseByDuration,
} from "@/lib/availability-search";
import { runAvailabilityLookup } from "@/lib/availability-lookup";

const ROOM_TYPES: LuxuryRoomTypeValue[] = [
  "luxury-rooms",
  "luxury-suites",
  "luxury-royal-suites",
];

export type AvailabilityAuditFailure = {
  kind: string;
  duration: string;
  roomType: string;
  date: string;
  detail: string;
};

export type AvailabilityAuditResult = {
  rangeStart: string;
  rangeEnd: string;
  departureDatesChecked: number;
  failures: AvailabilityAuditFailure[];
  passed: boolean;
};

function expectedCatalogMinCents(
  duration: StayDurationValue,
  roomType: LuxuryRoomTypeValue,
): number | null {
  const cruise = HATHOR_CRUISES.find((entry) => entry.slug === duration);
  if (!cruise) return null;

  const allowed = LUXURY_TO_DB_ROOM_TYPES[roomType].map((v) => v.toLowerCase());
  const matching = cruise.rooms.filter((room) => {
    const normalized = room.roomType.trim().toLowerCase();
    return allowed.some(
      (type) => normalized === type || normalized.includes(type),
    );
  });

  if (matching.length === 0) return null;
  return Math.min(...matching.map((room) => room.priceCents));
}

function enumerateMonthKeys(from: Date, to: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getDate()),
  );
  const end = new Date(
    Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getDate()),
  );

  while (cursor <= end) {
    keys.push(utcDateKeyFromDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return keys;
}

/** Read-only audit: calendar vs search preview vs RAW_DATA catalog rules. */
export async function runCalendarAvailabilityAudit(
  monthsAhead = 18,
): Promise<AvailabilityAuditResult> {
  const failures: AvailabilityAuditFailure[] = [];
  const rangeStart = utcNow();
  const rangeEnd = addMonths(rangeStart, monthsAhead);
  let departureDatesChecked = 0;

  const fail = (
    kind: string,
    duration: StayDurationValue,
    roomType: LuxuryRoomTypeValue,
    date: string,
    detail: string,
  ) => {
    failures.push({ kind, duration, roomType, date, detail });
  };

  for (const option of STAY_DURATION_OPTIONS) {
    for (const roomType of ROOM_TYPES) {
      if (!durationSupportsRoomType(option.value, roomType)) continue;

      const duration = option.value;
      const roomConfigs = normalizeRoomConfigsForDuration(duration, [
        { roomType, adults: 1, children: 0 },
      ]);
      const expectedPrice = expectedCatalogMinCents(duration, roomType);
      const cruise = await resolveCruiseByDuration(duration);

      if (!cruise) {
        fail("cruise_missing", duration, roomType, "*", "Cruise not found in DB");
        continue;
      }

      let monthCursor = startOfMonth(rangeStart);
      const lastMonth = startOfMonth(rangeEnd);

      while (monthCursor <= lastMonth) {
        const from = startOfMonth(monthCursor);
        const to = endOfMonth(monthCursor);

        const calendarResult = await getCruiseCalendarDays({
          duration,
          roomConfigs,
          from,
          to,
        });

        const dayByDate = new Map(
          calendarResult.days.map((day) => [day.date, day]),
        );

        for (const dateKey of enumerateMonthKeys(from, to)) {
          if (dateKey < utcDateKeyFromDate(utcNow())) continue;
          if (dateKey < utcDateKeyFromDate(rangeStart)) continue;
          if (dateKey > utcDateKeyFromDate(rangeEnd)) continue;

          if (!isValidDepartureDateKey(dateKey, duration)) {
            const day = dayByDate.get(dateKey);
            if (day && day.status !== "closed") {
              fail(
                "invalid_departure_open",
                duration,
                roomType,
                dateKey,
                `Non-departure day shows ${day.status}`,
              );
            }
            continue;
          }

          departureDatesChecked += 1;
          const day = dayByDate.get(dateKey);
          if (!day) {
            fail("calendar_missing_day", duration, roomType, dateKey, "No calendar entry");
            continue;
          }

          if (
            expectedPrice !== null &&
            day.status === "available" &&
            day.priceCents !== expectedPrice
          ) {
            fail(
              "price_mismatch",
              duration,
              roomType,
              dateKey,
              `Calendar price ${day.priceCents} != catalog ${expectedPrice}`,
            );
          }

          const checkInDate = checkInIsoFromDateKey(dateKey);
          const { startDate, endDate } = computeStayDates(checkInDate, duration);

          const search = await runAvailabilityLookup({
            cruiseId: cruise.id,
            startDate,
            endDate,
            checkInDate,
            roomConfigs,
            previewOnly: true,
          });

          const searchHasRooms = search.schedules.some(
            (schedule) => schedule.availableRooms.length > 0,
          );
          const searchDeparture = search.schedules[0]?.departureTime?.slice(0, 10);

          if (day.status === "available" && !searchHasRooms) {
            fail(
              "calendar_search_mismatch",
              duration,
              roomType,
              dateKey,
              `Calendar available but search empty (${search.reason ?? "no reason"})`,
            );
          }

          if (day.status === "booked" && searchHasRooms) {
            fail(
              "calendar_search_mismatch",
              duration,
              roomType,
              dateKey,
              "Calendar booked but search has rooms",
            );
          }

          if (searchHasRooms && searchDeparture && searchDeparture !== dateKey) {
            fail(
              "wrong_departure_date",
              duration,
              roomType,
              dateKey,
              `Search returned departure ${searchDeparture}`,
            );
          }
        }

        monthCursor = addMonths(monthCursor, 1);
      }
    }
  }

  return {
    rangeStart: utcDateKeyFromDate(rangeStart),
    rangeEnd: utcDateKeyFromDate(rangeEnd),
    departureDatesChecked,
    failures,
    passed: failures.length === 0,
  };
}
