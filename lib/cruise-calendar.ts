import { BookingStatus } from "@/app/generated/prisma/client";
import {
  filterRoomsForConfigs,
  resolveCruiseByDuration,
  type AvailabilityRoomRecord,
} from "@/lib/availability-search";
import { computeCheckInAvailability } from "@/lib/availability-lookup";
import {
  normalizeRoomConfigsForDuration,
  type RoomSearchConfig,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { ensureDefaultTicketType } from "@/lib/cruise-setup";
import {
  departureDateKeyFromTime,
  departureWeekdayForDuration,
  isValidDepartureDateKey,
  utcDateKeyToDate,
} from "@/lib/departure-dates";
import { withDb } from "@/lib/db-safe";
import { utcDateKeyFromDate, utcNow } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { availabilityRoomSelect } from "@/lib/query-selects";

export type CruiseCalendarDayStatus = "available" | "booked" | "closed";

export type CruiseCalendarDay = {
  /** UTC calendar date key yyyy-MM-dd */
  date: string;
  priceCents: number;
  status: CruiseCalendarDayStatus;
};

function enumerateUtcDateKeys(from: Date, to: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(
    Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()),
  );
  const end = new Date(
    Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()),
  );

  while (cursor <= end) {
    keys.push(utcDateKeyFromDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return keys;
}

function computeMinPriceCents(
  rooms: AvailabilityRoomRecord[],
  basePriceCents: number,
): number {
  if (rooms.length === 0) return basePriceCents;

  return Math.min(
    ...rooms.map((room) => {
      const multiplier = room.priceMultiplier > 0 ? room.priceMultiplier : 1;
      return Math.round(basePriceCents * multiplier);
    }),
  );
}

export async function getCruiseCalendarDays(input: {
  duration: StayDurationValue;
  roomConfigs: RoomSearchConfig[];
  from: Date;
  to: Date;
}): Promise<{
  days: CruiseCalendarDay[];
  departureDay: "Wednesday" | "Saturday";
  cruiseId: string | null;
}> {
  const departureDay = departureWeekdayForDuration(input.duration);
  const roomConfigs = normalizeRoomConfigsForDuration(
    input.duration,
    input.roomConfigs,
  );
  const todayKey = utcDateKeyFromDate(utcNow());
  const dateKeys = enumerateUtcDateKeys(input.from, input.to);

  const cruise = await resolveCruiseByDuration(input.duration);
  if (!cruise) {
    return {
      days: dateKeys.map((date) => ({
        date,
        priceCents: 0,
        status: "closed" as const,
      })),
      departureDay,
      cruiseId: null,
    };
  }

  const context = await withDb(async () => {
    const cruiseRecord = await prisma.cruise.findFirst({
      where: { id: cruise.id, deletedAt: null },
      select: {
        id: true,
        basePriceCents: true,
        rooms: {
          where: { deletedAt: null },
          orderBy: { name: "asc" },
          select: availabilityRoomSelect,
        },
      },
    });

    if (!cruiseRecord) return null;

    const matchingRooms = filterRoomsForConfigs(
      cruiseRecord.rooms,
      roomConfigs,
    );

    const ticketType = await ensureDefaultTicketType(
      cruiseRecord.id,
      cruiseRecord.basePriceCents,
    );

    const rangeStart = utcDateKeyToDate(dateKeys[0] ?? todayKey);
    const rangeEnd = utcDateKeyToDate(dateKeys[dateKeys.length - 1] ?? todayKey);
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

    const schedules = await prisma.cruiseSchedule.findMany({
      where: {
        cruiseId: cruiseRecord.id,
        departureTime: { gte: rangeStart, lt: rangeEnd },
      },
      select: { id: true, departureTime: true, arrivalTime: true },
    });

    const scheduleIds = schedules.map((schedule) => schedule.id);
    const roomIds = matchingRooms.map((room) => room.id);
    const now = utcNow();

    const blockedRows =
      scheduleIds.length > 0 && roomIds.length > 0
        ? await prisma.bookingRoom.findMany({
            where: {
              cruiseScheduleId: { in: scheduleIds },
              roomId: { in: roomIds },
              booking: {
                deletedAt: null,
                OR: [
                  { status: BookingStatus.CONFIRMED },
                  {
                    status: BookingStatus.PENDING_HOLD,
                    OR: [
                      { holdExpiresAt: null },
                      { holdExpiresAt: { gt: now } },
                    ],
                  },
                ],
              },
            },
            select: { cruiseScheduleId: true, roomId: true },
          })
        : [];

    const blockedBySchedule = new Map<string, Set<string>>();
    for (const row of blockedRows) {
      const set =
        blockedBySchedule.get(row.cruiseScheduleId) ?? new Set<string>();
      set.add(row.roomId);
      blockedBySchedule.set(row.cruiseScheduleId, set);
    }

    const schedulesByDate = new Map<string, typeof schedules>();
    for (const schedule of schedules) {
      const dateKey = departureDateKeyFromTime(schedule.departureTime);
      const bucket = schedulesByDate.get(dateKey) ?? [];
      bucket.push(schedule);
      schedulesByDate.set(dateKey, bucket);
    }

    const priceCents = computeMinPriceCents(
      matchingRooms,
      ticketType.priceCents || cruiseRecord.basePriceCents,
    );

    return {
      matchingRooms,
      priceCents,
      schedulesByDate,
      blockedBySchedule,
    };
  });

  if (!context || context.matchingRooms.length === 0) {
    return {
      days: dateKeys.map((date) => ({
        date,
        priceCents: 0,
        status: "closed" as const,
      })),
      departureDay,
      cruiseId: cruise.id,
    };
  }

  const days: CruiseCalendarDay[] = dateKeys.map((date) => {
    if (date < todayKey || !isValidDepartureDateKey(date, input.duration)) {
      return { date, priceCents: context.priceCents, status: "closed" };
    }

    const daySchedules = context.schedulesByDate.get(date) ?? [];

    const availability = computeCheckInAvailability({
      roomsForSearch: context.matchingRooms,
      roomConfigs,
      schedules: daySchedules,
      unavailableBySchedule: context.blockedBySchedule,
      previewIfNoSchedule: true,
    });

    if (availability.reason === "NO_MATCHING_ROOMS") {
      return { date, priceCents: context.priceCents, status: "closed" };
    }

    const status: CruiseCalendarDayStatus =
      availability.openRooms.length > 0 ? "available" : "booked";

    return {
      date,
      priceCents: context.priceCents,
      status,
    };
  });

  return { days, departureDay, cruiseId: cruise.id };
}

export function calendarMetaFromLocalDate(
  date: Date,
  daysByDate: Map<string, CruiseCalendarDay>,
): CruiseCalendarDay | undefined {
  const key = utcDateKeyFromDate(
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())),
  );
  return daysByDate.get(key);
}
