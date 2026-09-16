import {
  canAssignRoomConfigs,
  computeStayDates,
  filterRoomsForConfigs,
  resolveCruiseByDuration,
  sortRoomsForBooking,
} from "@/lib/availability-search";
import {
  getSailingAvailability,
  type FreeCabin,
  type RoomTypeAvailability,
} from "@/lib/availability-service";
import type { AvailabilityReason } from "@/lib/booking-types";
import type {
  RoomSearchConfig,
  StayDurationValue,
} from "@/lib/booking-search-config";
import { withDb } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";
import { availabilityRoomSelect } from "@/lib/query-selects";

type AvailabilityLookupInput = {
  cruiseId: string;
  roomId?: string;
  startDate: string;
  endDate: string;
  checkInDate?: string;
  roomConfigs?: RoomSearchConfig[];
  /** Kept for callers; availability never creates a sailing to preview. */
  previewOnly?: boolean;
};

type AvailabilityLookupResult = {
  cruiseId: string;
  startDate: string;
  endDate: string;
  cruise?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    ports: string | null;
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
  };
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

/**
 * Catalog details plus availability from the one availability service, in the
 * response shape the existing search endpoints already publish.
 */
export async function runAvailabilityLookup(
  input: AvailabilityLookupInput,
): Promise<AvailabilityLookupResult> {
  const { cruiseId, roomId, startDate, endDate, checkInDate, roomConfigs } = input;

  const cruise = await withDb(() =>
    prisma.cruise.findFirst({
      where: { id: cruiseId, deletedAt: null },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        ports: true,
        basePriceCents: true,
        rooms: {
          where: { deletedAt: null },
          orderBy: { name: "asc" },
          select: { ...availabilityRoomSelect, roomNumber: true },
        },
      },
    }),
  );

  if (!cruise) {
    return { cruiseId, startDate, endDate, schedules: [], reason: "CRUISE_NOT_FOUND" };
  }

  const catalogRooms = sortRoomsForBooking(cruise.rooms);

  if (catalogRooms.length === 0) {
    return { cruiseId, startDate, endDate, cruise, schedules: [], reason: "NO_ROOMS" };
  }

  const roomsMatchingConfig = roomConfigs
    ? filterRoomsForConfigs(catalogRooms, roomConfigs)
    : catalogRooms;
  const catalogForSearch = roomId
    ? roomsMatchingConfig.filter(room => room.id === roomId)
    : roomsMatchingConfig;

  if ((roomConfigs || roomId) && catalogForSearch.length === 0) {
    return {
      cruiseId,
      startDate,
      endDate,
      cruise,
      schedules: [],
      reason: "NO_MATCHING_ROOMS",
    };
  }

  const sailings = await getSailingAvailability({
    duration: cruise.slug as StayDurationValue,
    departureDate: checkInDate ?? null,
    from: checkInDate ? null : startDate,
    to: checkInDate ? null : endDate,
    roomConfigs,
    roomId: roomId ?? null,
  });

  const priceOf = (type: RoomTypeAvailability) => ({
    ticketTypeId: type.ticketTypeId,
    name: type.ticketName,
    description: type.ticketDescription,
    priceCents: type.priceCents,
  });

  const schedules = sailings
    .map(sailing => {
      const cabins: { cabin: FreeCabin; type: RoomTypeAvailability }[] = [];

      for (const type of sailing.types) {
        for (const cabin of type.freeCabins) {
          if (roomId && cabin.id !== roomId) continue;
          if (
            roomConfigs?.length &&
            !roomConfigs.some(config => cabin.capacity >= config.adults + config.children)
          ) {
            continue;
          }
          cabins.push({ cabin, type });
        }
      }

      const assignable =
        !roomConfigs?.length ||
        canAssignRoomConfigs(cabins.map(entry => entry.cabin), roomConfigs);

      return {
        scheduleId: sailing.scheduleId,
        departureTime: sailing.departureTime,
        arrivalTime: sailing.arrivalTime,
        availableRooms: assignable
          ? cabins.map(({ cabin, type }) => ({
              id: cabin.id,
              name: cabin.name,
              capacity: cabin.capacity,
              description: cabin.description,
              roomType: cabin.roomType as string | null,
              prices: [priceOf(type)],
            }))
          : [],
      };
    })
    .filter(schedule => schedule.availableRooms.length > 0);

  const reason: AvailabilityReason | undefined =
    schedules.length > 0
      ? undefined
      : sailings.length === 0
        ? "NO_SCHEDULES"
        : "FULLY_BOOKED";

  return {
    cruiseId,
    startDate,
    endDate,
    cruise,
    schedules,
    ...(reason ? { reason } : {}),
  };
}

export async function runWidgetAvailabilityLookup(
  duration: StayDurationValue,
  checkInDate: string,
  roomConfigs: RoomSearchConfig[],
): Promise<AvailabilityLookupResult> {
  const cruise = await resolveCruiseByDuration(duration);

  if (!cruise) {
    return {
      cruiseId: "",
      startDate: checkInDate,
      endDate: checkInDate,
      schedules: [],
      reason: "CRUISE_NOT_FOUND",
    };
  }

  const { startDate, endDate } = computeStayDates(checkInDate, duration);

  return runAvailabilityLookup({
    cruiseId: cruise.id,
    startDate,
    endDate,
    checkInDate,
    roomConfigs,
  });
}
