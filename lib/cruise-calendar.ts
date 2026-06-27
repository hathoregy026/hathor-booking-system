import { BookingStatus } from "@/app/generated/prisma/client";
import {
  canAssignRoomConfigs,
  filterRoomsForConfigs,
  resolveCruiseByDuration,
  type AvailabilityRoomRecord,
} from "@/lib/availability-search";
import type { RoomSearchConfig, StayDurationValue } from "@/lib/booking-search-config";
import { ensureDefaultTicketType } from "@/lib/cruise-setup";
import { withDb } from "@/lib/db-safe";
import { utcNow, utcDateKeyFromDate } from "@/lib/dates";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { prisma } from "@/lib/prisma";
import { availabilityRoomSelect } from "@/lib/query-selects";

export type CruiseCalendarDayStatus = "available" | "booked" | "closed";

export type CruiseCalendarDay = {
  /** UTC calendar date key yyyy-MM-dd */
  date: string;
  priceCents: number;
  status: CruiseCalendarDayStatus;
};

function localDateToUtcKey(date: Date): string {
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  return utc.toISOString().slice(0, 10);
}

function utcKeyToDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function departureDayForDuration(duration: StayDurationValue): "Wednesday" | "Saturday" {
  const seed = HATHOR_CRUISES.find((entry) => entry.slug === duration);
  return seed?.departureDay ?? "Saturday";
}

function isValidDepartureUtcKey(
  dateKey: string,
  departureDay: "Wednesday" | "Saturday",
): boolean {
  const targetDow = departureDay === "Wednesday" ? 3 : 6;
  return utcKeyToDate(dateKey).getUTCDay() === targetDow;
}

function enumerateUtcDateKeys(from: Date, to: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(
    Date.UTC(from.getFullYear(), from.getMonth(), from.getDate()),
  );
  const end = new Date(
    Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()),
  );

  while (cursor <= end) {
    keys.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return keys;
}

function scheduleDepartureKey(departureTime: Date): string {
  return utcDateKeyFromDate(departureTime);
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
  const departureDay = departureDayForDuration(input.duration);
  const todayKey = utcNow().toISOString().slice(0, 10);
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
      input.roomConfigs,
    );

    const ticketType = await ensureDefaultTicketType(
      cruiseRecord.id,
      cruiseRecord.basePriceCents,
    );

    const rangeStart = utcKeyToDate(dateKeys[0] ?? todayKey);
    const rangeEnd = utcKeyToDate(dateKeys[dateKeys.length - 1] ?? todayKey);
    rangeEnd.setUTCDate(rangeEnd.getUTCDate() + 1);

    const schedules = await prisma.cruiseSchedule.findMany({
      where: {
        cruiseId: cruiseRecord.id,
        departureTime: { gte: rangeStart, lt: rangeEnd },
      },
      select: { id: true, departureTime: true },
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

    const scheduleByDate = new Map(
      schedules.map((schedule) => [
        scheduleDepartureKey(schedule.departureTime),
        schedule,
      ]),
    );

    const priceCents = computeMinPriceCents(
      matchingRooms,
      ticketType.priceCents || cruiseRecord.basePriceCents,
    );

    return {
      matchingRooms,
      priceCents,
      scheduleByDate,
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
    if (date < todayKey || !isValidDepartureUtcKey(date, departureDay)) {
      return { date, priceCents: context.priceCents, status: "closed" };
    }

    const schedule = context.scheduleByDate.get(date);
    if (!schedule) {
      return { date, priceCents: context.priceCents, status: "available" };
    }

    const blocked = context.blockedBySchedule.get(schedule.id) ?? new Set<string>();
    const openRooms = context.matchingRooms.filter(
      (room) => !blocked.has(room.id),
    );

    const assignable =
      openRooms.length > 0 &&
      canAssignRoomConfigs(openRooms, input.roomConfigs);

    return {
      date,
      priceCents: context.priceCents,
      status: assignable ? "available" : "booked",
    };
  });

  return { days, departureDay, cruiseId: cruise.id };
}

export function calendarMetaFromLocalDate(
  date: Date,
  daysByDate: Map<string, CruiseCalendarDay>,
): CruiseCalendarDay | undefined {
  return daysByDate.get(localDateToUtcKey(date));
}
