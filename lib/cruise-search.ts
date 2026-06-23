import type { AvailabilityReason } from "@/lib/booking-types";
import {
  computeStayDates,
  resolveCruiseByDuration,
} from "@/lib/availability-search";
import { runAvailabilityLookup } from "@/lib/availability-lookup";
import {
  findStayDurationOption,
  normalizeRoomConfigsForDuration,
  matchCruiseByDuration,
  type RoomSearchConfig,
  type StayDurationValue,
  STAY_DURATION_OPTIONS,
} from "@/lib/booking-search-config";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { withDb } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";

export type CruiseSearchRoomResult = {
  id: string;
  name: string;
  roomNumber: string | null;
  roomType: string | null;
  capacity: number;
  description: string | null;
  priceCents: number;
  scheduleId: string;
  departureTime: string;
  arrivalTime: string;
  prices: {
    ticketTypeId: string;
    name: string;
    description: string | null;
    priceCents: number;
  }[];
};

export type CruiseSearchItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  ports: string | null;
  nights: number;
  days: number;
  departureDay: string | null;
  basePriceCents: number;
  rooms: CruiseSearchRoomResult[];
};

export type CruiseSearchResponse = {
  cruiseId: string;
  startDate: string;
  endDate: string;
  checkInDate: string;
  duration: StayDurationValue;
  cruises: CruiseSearchItem[];
  schedules: {
    scheduleId: string;
    departureTime: string;
    arrivalTime: string;
    availableRooms: {
      id: string;
      name: string;
      capacity: number;
      description: string | null;
      roomType: string | null;
      prices: {
        ticketTypeId: string;
        name: string;
        description: string | null;
        priceCents: number;
      }[];
    }[];
  }[];
  reason?: AvailabilityReason;
};

const NIGHT_COUNT_TO_DURATION: Record<string, StayDurationValue> = {
  "3": "3-nights-aswan-luxor",
  "4": "4-nights-luxor-aswan",
  "7": "7-nights-luxor-aswan-luxor",
};

export function normalizeDurationParam(
  value: string,
): StayDurationValue | undefined {
  if (STAY_DURATION_OPTIONS.some((option) => option.value === value)) {
    return value as StayDurationValue;
  }

  return NIGHT_COUNT_TO_DURATION[value];
}

export function buildRoomConfigsFromParams(input: {
  rooms?: RoomSearchConfig[];
  roomType?: RoomSearchConfig["roomType"];
  adults?: number;
  children?: number;
}): RoomSearchConfig[] {
  if (input.rooms && input.rooms.length > 0) {
    return input.rooms;
  }

  if (!input.roomType || input.adults === undefined) {
    return [];
  }

  return [
    {
      roomType: input.roomType,
      adults: input.adults,
      children: input.children ?? 0,
    },
  ];
}

function departureDayForSlug(slug: string): string | null {
  return HATHOR_CRUISES.find((cruise) => cruise.slug === slug)?.departureDay ?? null;
}

function computeRoomPriceCents(
  basePriceCents: number,
  priceMultiplier: number,
): number {
  const multiplier = priceMultiplier > 0 ? priceMultiplier : 1;
  return Math.round(basePriceCents * multiplier);
}

function buildCruiseSearchRooms(
  cruise: {
    id: string;
    basePriceCents: number;
    rooms: {
      id: string;
      name: string;
      roomNumber: string | null;
      roomType: string | null;
      capacity: number;
      description: string | null;
      priceMultiplier: number;
    }[];
  },
  schedules: {
    scheduleId: string;
    departureTime: string;
    arrivalTime: string;
    availableRooms: {
      id: string;
      prices: CruiseSearchRoomResult["prices"];
    }[];
  }[],
): CruiseSearchRoomResult[] {
  const rooms: CruiseSearchRoomResult[] = [];

  for (const schedule of schedules) {
    for (const availRoom of schedule.availableRooms) {
      const dbRoom = cruise.rooms.find((room) => room.id === availRoom.id);
      if (!dbRoom) continue;

      const priceCents = computeRoomPriceCents(
        cruise.basePriceCents,
        dbRoom.priceMultiplier,
      );

      rooms.push({
        id: dbRoom.id,
        name: dbRoom.name,
        roomNumber: dbRoom.roomNumber,
        roomType: dbRoom.roomType,
        capacity: dbRoom.capacity,
        description: dbRoom.description,
        priceCents,
        scheduleId: schedule.scheduleId,
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        prices: availRoom.prices.length
          ? availRoom.prices
          : [
              {
                ticketTypeId: "standard",
                name: "Standard",
                description: null,
                priceCents,
              },
            ],
      });
    }
  }

  return rooms;
}

export async function runPeriodCruiseSearch(
  periodStart: string,
  periodEnd: string,
  roomConfigsInput: RoomSearchConfig[],
): Promise<CruiseSearchResponse> {
  const cruises: CruiseSearchItem[] = [];
  const allSchedules: CruiseSearchResponse["schedules"] = [];

  for (const option of STAY_DURATION_OPTIONS) {
    const duration = option.value;
    const roomConfigs = normalizeRoomConfigsForDuration(
      duration,
      roomConfigsInput,
    );

    const resolvedCruise = await resolveCruiseByDuration(duration);

    if (!resolvedCruise) continue;

    const availability = await runAvailabilityLookup({
      cruiseId: resolvedCruise.id,
      startDate: periodStart,
      endDate: periodEnd,
      roomConfigs,
    });

    if (!availability.cruise || availability.schedules.length === 0) continue;

    const matchingRooms = buildCruiseSearchRooms(
      availability.cruise,
      availability.schedules,
    );

    if (matchingRooms.length === 0) continue;

    cruises.push({
      id: availability.cruise.id,
      name: availability.cruise.name,
      slug: availability.cruise.slug,
      description: availability.cruise.description,
      ports: availability.cruise.ports,
      nights: option.nights,
      days: option.nights + 1,
      departureDay: departureDayForSlug(availability.cruise.slug),
      basePriceCents: availability.cruise.basePriceCents,
      rooms: matchingRooms,
    });
    allSchedules.push(...availability.schedules);
  }

  const totalRooms = cruises.reduce(
    (count, cruise) => count + cruise.rooms.length,
    0,
  );

  return {
    cruiseId: cruises.length === 1 ? cruises[0].id : "",
    startDate: periodStart,
    endDate: periodEnd,
    checkInDate: "",
    duration: "7-nights-luxor-aswan-luxor",
    cruises,
    schedules: allSchedules,
    ...(totalRooms === 0 ? { reason: "NO_SCHEDULES" as const } : {}),
  };
}

export async function runCruiseSearch(
  duration: StayDurationValue,
  checkInDate: string,
  roomConfigsInput: RoomSearchConfig[],
): Promise<CruiseSearchResponse> {
  const durationOption = findStayDurationOption(duration);
  const { startDate, endDate } = computeStayDates(checkInDate, duration);
  const roomConfigs = normalizeRoomConfigsForDuration(
    duration,
    roomConfigsInput,
  );

  const resolvedCruise = await resolveCruiseByDuration(duration);

  if (!resolvedCruise) {
    return {
      cruiseId: "",
      startDate,
      endDate,
      checkInDate,
      duration,
      cruises: [],
      schedules: [],
      reason: "CRUISE_NOT_FOUND",
    };
  }

  const availability = await runAvailabilityLookup({
    cruiseId: resolvedCruise.id,
    startDate,
    endDate,
    checkInDate,
    roomConfigs,
  });

  const cruise = availability.cruise;

  if (!cruise) {
    return {
      cruiseId: "",
      startDate,
      endDate,
      checkInDate,
      duration,
      cruises: [],
      schedules: [],
      reason: "CRUISE_NOT_FOUND",
    };
  }

  const matchingRooms = buildCruiseSearchRooms(cruise, availability.schedules);

  const nights = durationOption?.nights ?? 0;
  const days = nights > 0 ? nights + 1 : 0;

  return {
    cruiseId: cruise.id,
    startDate: availability.startDate,
    endDate: availability.endDate,
    checkInDate,
    duration,
    cruises: [
      {
        id: cruise.id,
        name: cruise.name,
        slug: cruise.slug,
        description: cruise.description,
        ports: cruise.ports,
        nights,
        days,
        departureDay: departureDayForSlug(cruise.slug),
        basePriceCents: cruise.basePriceCents,
        rooms: matchingRooms,
      },
    ],
    schedules: availability.schedules,
    ...(availability.reason ? { reason: availability.reason } : {}),
  };
}

/** Resolve cruise by duration slug using DB records only. */
export async function listActiveCruises() {
  return withDb(() =>
    prisma.cruise.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        ports: true,
        basePriceCents: true,
      },
      orderBy: { name: "asc" },
    }),
  );
}

export async function resolveCruiseIdByDuration(
  duration: StayDurationValue,
): Promise<string | null> {
  return withDb(async () => {
    const bySlug = await prisma.cruise.findFirst({
      where: { slug: duration, deletedAt: null },
      select: { id: true },
    });

    if (bySlug) return bySlug.id;

    const cruises = await prisma.cruise.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, description: true },
    });

    return matchCruiseByDuration(cruises, duration)?.id ?? null;
  });
}
