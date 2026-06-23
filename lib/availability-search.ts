import { addDays } from "date-fns";
import {
  findStayDurationOption,
  LUXURY_TO_DB_ROOM_TYPES,
  matchCruiseByDuration,
  type LuxuryRoomTypeValue,
  type RoomSearchConfig,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { parseToUtcDate } from "@/lib/dates";
import { withDb } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";

export type AvailabilityRoomRecord = {
  id: string;
  name: string;
  capacity: number;
  description: string | null;
  roomType: string | null;
  priceMultiplier: number;
};

export function computeStayDates(
  checkInDateIso: string,
  duration: StayDurationValue,
): { startDate: string; endDate: string; nights: number } {
  const option = findStayDurationOption(duration);
  if (!option) {
    throw new Error("Invalid stay duration");
  }

  const checkIn = parseToUtcDate(checkInDateIso);
  const endDate = addDays(checkIn, option.nights);

  return {
    startDate: checkIn.toISOString(),
    endDate: endDate.toISOString(),
    nights: option.nights,
  };
}

export async function resolveCruiseByDuration(duration: StayDurationValue) {
  return withDb(async () => {
    const bySlug = await prisma.cruise.findFirst({
      where: { slug: duration, deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        basePriceCents: true,
      },
    });

    if (bySlug) return bySlug;

    const cruises = await prisma.cruise.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        description: true,
        basePriceCents: true,
      },
      orderBy: { name: "asc" },
    });

    return matchCruiseByDuration(cruises, duration);
  });
}

export function roomMatchesLuxuryType(
  roomType: string | null,
  luxuryType: LuxuryRoomTypeValue,
): boolean {
  const allowedTypes = LUXURY_TO_DB_ROOM_TYPES[luxuryType].map((value) =>
    value.toLowerCase(),
  );

  if (!roomType) {
    return allowedTypes.includes("standard");
  }

  const normalized = roomType.trim().toLowerCase();
  return allowedTypes.some(
    (allowed) =>
      normalized === allowed || normalized.includes(allowed),
  );
}

export function roomMatchesConfig(
  room: AvailabilityRoomRecord,
  config: RoomSearchConfig,
): boolean {
  const guestCount = config.adults + config.children;
  return (
    room.capacity >= guestCount &&
    roomMatchesLuxuryType(room.roomType, config.roomType)
  );
}

export function filterRoomsForConfigs(
  rooms: AvailabilityRoomRecord[],
  configs: RoomSearchConfig[],
): AvailabilityRoomRecord[] {
  return rooms.filter((room) =>
    configs.some((config) => roomMatchesConfig(room, config)),
  );
}

function countMatchingRooms(
  rooms: AvailabilityRoomRecord[],
  config: RoomSearchConfig,
): number {
  return rooms.filter((room) => roomMatchesConfig(room, config)).length;
}

/** Whether distinct available rooms can satisfy every requested room configuration. */
export function canAssignRoomConfigs(
  rooms: AvailabilityRoomRecord[],
  configs: RoomSearchConfig[],
): boolean {
  const sortedConfigs = [...configs].sort(
    (a, b) => countMatchingRooms(rooms, a) - countMatchingRooms(rooms, b),
  );
  const usedRoomIds = new Set<string>();

  for (const config of sortedConfigs) {
    const match = rooms.find(
      (room) =>
        !usedRoomIds.has(room.id) && roomMatchesConfig(room, config),
    );

    if (!match) return false;
    usedRoomIds.add(match.id);
  }

  return true;
}

export async function getSchedulesFromCheckIn(
  cruiseId: string,
  checkInDateIso: string,
  endDateIso: string,
) {
  const checkInDate = parseToUtcDate(checkInDateIso);
  const endDate = parseToUtcDate(endDateIso);

  return prisma.cruiseSchedule.findMany({
    where: {
      cruiseId,
      departureTime: { gte: checkInDate, lt: endDate },
      arrivalTime: { gt: checkInDate },
    },
    orderBy: { departureTime: "asc" },
    select: {
      id: true,
      departureTime: true,
      arrivalTime: true,
    },
  });
}
