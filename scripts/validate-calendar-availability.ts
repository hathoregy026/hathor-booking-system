/**
 * Read-only availability audit: calendar vs search preview, RAW_DATA catalog rules.
 * Does NOT create bookings or modify existing booking data.
 * Search uses previewOnly (no schedule creation).
 *
 * Usage:
 *   npm run validate:availability
 *   npm run validate:availability -- --remote   (hits production API; search may create schedules)
 */
import { config } from "dotenv";
config();

import { addMonths, endOfMonth, startOfMonth } from "date-fns";
import { HATHOR_CRUISES } from "../lib/hathor-catalog";
import {
  LUXURY_TO_DB_ROOM_TYPES,
  STAY_DURATION_OPTIONS,
  durationSupportsRoomType,
  normalizeRoomConfigsForDuration,
  type LuxuryRoomTypeValue,
  type StayDurationValue,
} from "../lib/booking-search-config";
import { getCruiseCalendarDays } from "../lib/cruise-calendar";
import {
  checkInIsoFromDateKey,
  isValidDepartureDateKey,
} from "../lib/departure-dates";
import { utcDateKeyFromDate, utcNow } from "../lib/dates";
import {
  computeStayDates,
  resolveCruiseByDuration,
} from "../lib/availability-search";
import { runAvailabilityLookup } from "../lib/availability-lookup";
import { prisma } from "../lib/prisma";

const REMOTE = process.argv.includes("--remote");
const BASE_URL =
  process.env.BASE_URL?.replace(/\/$/, "") ??
  "https://hathor-booking-system.vercel.app";

const ROOM_TYPES: LuxuryRoomTypeValue[] = [
  "luxury-rooms",
  "luxury-suites",
  "luxury-royal-suites",
];

type Failure = {
  kind: string;
  duration: string;
  roomType: string;
  date: string;
  detail: string;
};

const failures: Failure[] = [];

function fail(
  kind: string,
  duration: StayDurationValue,
  roomType: LuxuryRoomTypeValue,
  date: string,
  detail: string,
) {
  failures.push({ kind, duration, roomType, date, detail });
}

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

async function fetchRemoteCalendar(
  duration: StayDurationValue,
  rooms: ReturnType<typeof normalizeRoomConfigsForDuration>,
  from: Date,
  to: Date,
) {
  const params = new URLSearchParams({
    duration,
    rooms: JSON.stringify(rooms),
    from: from.toISOString(),
    to: to.toISOString(),
  });
  const response = await fetch(`${BASE_URL}/api/cruises/calendar?${params}`);
  if (!response.ok) {
    throw new Error(`Calendar HTTP ${response.status} for ${duration}`);
  }
  return response.json() as Promise<{
    days: { date: string; priceCents: number; status: string }[];
  }>;
}

async function fetchRemoteSearch(
  duration: StayDurationValue,
  checkInDate: string,
  rooms: ReturnType<typeof normalizeRoomConfigsForDuration>,
) {
  const params = new URLSearchParams({
    duration,
    checkInDate,
    rooms: JSON.stringify(rooms),
    previewOnly: "true",
  });
  const response = await fetch(`${BASE_URL}/api/cruises?${params}`);
  if (!response.ok) {
    throw new Error(`Search HTTP ${response.status} for ${checkInDate}`);
  }
  return response.json() as Promise<{
    reason?: string;
    schedules?: { departureTime?: string; availableRooms?: unknown[] }[];
    cruises?: { rooms?: unknown[] }[];
  }>;
}

async function auditDurationRoomType(
  duration: StayDurationValue,
  roomType: LuxuryRoomTypeValue,
  rangeStart: Date,
  rangeEnd: Date,
) {
  if (!durationSupportsRoomType(duration, roomType)) {
    return;
  }

  const roomConfigs = normalizeRoomConfigsForDuration(duration, [
    { roomType, adults: 1, children: 0 },
  ]);
  const expectedPrice = expectedCatalogMinCents(duration, roomType);
  const cruise = REMOTE ? null : await resolveCruiseByDuration(duration);

  if (!REMOTE && !cruise) {
    fail("cruise_missing", duration, roomType, "*", "Cruise not found in DB");
    return;
  }

  let monthCursor = startOfMonth(rangeStart);
  const lastMonth = startOfMonth(rangeEnd);

  while (monthCursor <= lastMonth) {
    const from = startOfMonth(monthCursor);
    const to = endOfMonth(monthCursor);

    const calendarResult = REMOTE
      ? await fetchRemoteCalendar(duration, roomConfigs, from, to)
      : await getCruiseCalendarDays({
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

      const validDeparture = isValidDepartureDateKey(dateKey, duration);
      if (!validDeparture) {
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

      let searchHasRooms = false;
      let searchReason: string | undefined;
      let searchDeparture: string | undefined;

      if (REMOTE) {
        const search = await fetchRemoteSearch(duration, checkInDate, roomConfigs);
        searchHasRooms =
          (search.schedules ?? []).some(
            (s) => (s.availableRooms?.length ?? 0) > 0,
          ) || (search.cruises?.[0]?.rooms?.length ?? 0) > 0;
        searchReason = search.reason;
        searchDeparture = search.schedules?.[0]?.departureTime?.slice(0, 10);
      } else {
        const search = await runAvailabilityLookup({
          cruiseId: cruise!.id,
          startDate,
          endDate,
          checkInDate,
          roomConfigs,
          previewOnly: true,
        });
        searchHasRooms = search.schedules.some(
          (schedule) => schedule.availableRooms.length > 0,
        );
        searchReason = search.reason;
        searchDeparture = search.schedules[0]?.departureTime?.slice(0, 10);
      }

      if (day.status === "available" && !searchHasRooms) {
        fail(
          "calendar_search_mismatch",
          duration,
          roomType,
          dateKey,
          `Calendar available but search empty (${searchReason ?? "no reason"})`,
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

async function main() {
  const rangeStart = utcNow();
  const rangeEnd = addMonths(rangeStart, 18);

  console.log(
    `Availability audit (${REMOTE ? `remote ${BASE_URL}` : "local DB, read-only preview"})`,
  );
  console.log(
    `Range: ${utcDateKeyFromDate(rangeStart)} → ${utcDateKeyFromDate(rangeEnd)}`,
  );
  console.log("Rules: RAW_DATA.md via hathor-catalog\n");

  for (const option of STAY_DURATION_OPTIONS) {
    for (const roomType of ROOM_TYPES) {
      if (!durationSupportsRoomType(option.value, roomType)) {
        continue;
      }
      process.stdout.write(`Checking ${option.value} / ${roomType}... `);
      await auditDurationRoomType(
        option.value,
        roomType,
        rangeStart,
        rangeEnd,
      );
      const count = failures.filter(
        (f) => f.duration === option.value && f.roomType === roomType,
      ).length;
      console.log(count === 0 ? "OK" : `${count} issue(s)`);
    }
  }

  console.log("\n--- Summary ---");
  if (failures.length === 0) {
    console.log("All departure dates align: calendar, search preview, RAW_DATA catalog.");
    return;
  }

  const byKind = new Map<string, number>();
  for (const f of failures) {
    byKind.set(f.kind, (byKind.get(f.kind) ?? 0) + 1);
  }
  for (const [kind, count] of byKind) {
    console.log(`  ${kind}: ${count}`);
  }

  console.log("\nFirst 25 failures:");
  for (const f of failures.slice(0, 25)) {
    console.log(
      `  [${f.kind}] ${f.duration} / ${f.roomType} / ${f.date}: ${f.detail}`,
    );
  }

  if (failures.length > 25) {
    console.log(`  ... and ${failures.length - 25} more`);
  }

  process.exitCode = 1;
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
