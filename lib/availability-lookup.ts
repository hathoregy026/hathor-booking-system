import {
  canAssignRoomConfigs,
  computeStayDates,
  filterRoomsForConfigs,
  getSchedulesFromCheckIn,
  resolveCruiseByDuration,
  sortRoomsForBooking,
  type AvailabilityRoomRecord,
} from "@/lib/availability-search";
import { getSchedulesInDateRange, getUnavailableRoomsBySchedule } from "@/lib/booking";
import type { AvailabilityReason } from "@/lib/booking-types";
import type {
  RoomSearchConfig,
  StayDurationValue,
} from "@/lib/booking-search-config";
import { withDb } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";
import {
  availabilityRoomSelect,
  availabilityTicketSelect,
} from "@/lib/query-selects";

type AvailabilityLookupInput = {
  cruiseId: string;
  roomId?: string;
  startDate: string;
  endDate: string;
  checkInDate?: string;
  roomConfigs?: RoomSearchConfig[];
  /** When true, do not create schedules — used by calendar preview. */
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

function mapRoomWithPrices(
  room: AvailabilityRoomRecord,
  ticketTypes: {
    id: string;
    name: string;
    description: string | null;
    priceCents: number;
    roomType: string | null;
  }[],
) {

  return {
    id: room.id,
    name: room.name,
    capacity: room.capacity,
    description: room.description,
    roomType: room.roomType,
    prices: ticketTypes.filter(t => t.roomType === room.roomType).map((ticketType) => ({
      ticketTypeId: ticketType.id,
      name: ticketType.name,
      description: ticketType.description,
      priceCents: ticketType.priceCents,
    })),
  };
}

type ScheduleRef = { id: string; departureTime: Date; arrivalTime: Date };

/** Shared check-in availability — used by search and calendar so both stay in sync. */
export function computeCheckInAvailability(input: {
  roomsForSearch: AvailabilityRoomRecord[];
  roomConfigs?: RoomSearchConfig[];
  schedules: ScheduleRef[];
  unavailableBySchedule: Map<string, Set<string>>;
  previewIfNoSchedule: boolean;
}): {
  openRooms: AvailabilityRoomRecord[];
  reason?: AvailabilityReason;
  needsScheduleCreation: boolean;
} {
  const { roomsForSearch, roomConfigs, schedules, unavailableBySchedule } =
    input;

  if (roomConfigs && roomsForSearch.length === 0) {
    return {
      openRooms: [],
      reason: "NO_MATCHING_ROOMS",
      needsScheduleCreation: false,
    };
  }

  if (schedules.length === 0) {
    return { openRooms: [], reason: "NO_SCHEDULES", needsScheduleCreation: false };
  }

  const openByRoomId = new Map<string, AvailabilityRoomRecord>();

  for (const schedule of schedules) {
    const unavailableSet = unavailableBySchedule.get(schedule.id) ?? new Set<string>();
    const openRooms = roomsForSearch.filter((room) => !unavailableSet.has(room.id));

    const assignableRooms =
      roomConfigs && openRooms.length > 0
        ? canAssignRoomConfigs(openRooms, roomConfigs)
          ? openRooms
          : []
        : openRooms;

    for (const room of assignableRooms) {
      openByRoomId.set(room.id, room);
    }
  }

  const openRooms = [...openByRoomId.values()];

  return {
    openRooms,
    reason: openRooms.length === 0 ? "FULLY_BOOKED" : undefined,
    needsScheduleCreation: false,
  };
}

export async function runAvailabilityLookup(
  input: AvailabilityLookupInput,
): Promise<AvailabilityLookupResult> {
  const {
    cruiseId,
    roomId,
    startDate,
    endDate,
    checkInDate,
    roomConfigs,
    previewOnly = false,
  } = input;

  const context = await withDb(async () => {
    const cruise = await prisma.cruise.findFirst({
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
          select: {
            ...availabilityRoomSelect,
            roomNumber: true,
          },
        },
      },
    });

    const schedules = checkInDate
      ? await getSchedulesFromCheckIn(cruiseId, checkInDate, endDate)
      : await getSchedulesInDateRange(cruiseId, startDate, endDate);

    const ticketTypes = await prisma.ticketType.findMany({
      where: { cruiseId },
      orderBy: { priceCents: "asc" },
      select: { ...availabilityTicketSelect, roomType: true },
    });

    return { cruise, schedules, ticketTypes };
  });

  if (!context.cruise) {
    return {
      cruiseId,
      startDate,
      endDate,
      schedules: [],
      reason: "CRUISE_NOT_FOUND",
    };
  }

  const { cruise } = context;
  const allRooms = sortRoomsForBooking(cruise.rooms);

  if (allRooms.length === 0) {
    return {
      cruiseId,
      startDate,
      endDate,
      cruise,
      schedules: [],
      reason: "NO_ROOMS",
    };
  }

  const roomsMatchingConfig: AvailabilityRoomRecord[] = roomConfigs
    ? filterRoomsForConfigs(allRooms, roomConfigs)
    : allRooms;

  const roomsForSearch = roomId
    ? roomsMatchingConfig.filter((room) => room.id === roomId)
    : roomsMatchingConfig;

  if ((roomConfigs || roomId) && roomsForSearch.length === 0) {
    return {
      cruiseId,
      startDate,
      endDate,
      cruise,
      schedules: [],
      reason: "NO_MATCHING_ROOMS",
    };
  }

  const ticketTypes = context.ticketTypes;
  const schedules: ScheduleRef[] = context.schedules;

  const scheduleIds = schedules.map((schedule) => schedule.id);
  const roomIds = roomsForSearch.map((room) => room.id);

  const unavailableBySchedule =
    scheduleIds.length > 0
      ? await withDb(() =>
          getUnavailableRoomsBySchedule({
            cruiseScheduleIds: scheduleIds,
            roomIds,
          }),
        )
      : new Map<string, Set<string>>();

  const availability = computeCheckInAvailability({
    roomsForSearch,
    roomConfigs,
    schedules,
    unavailableBySchedule,
    previewIfNoSchedule: previewOnly,
  });

  const openRoomIds = new Set(availability.openRooms.map((room) => room.id));

  const availableBySchedule = schedules
    .map((schedule) => {
      const unavailableSet =
        unavailableBySchedule.get(schedule.id) ?? new Set<string>();

      const assignableRooms = roomsForSearch.filter(
        (room) => !unavailableSet.has(room.id) && openRoomIds.has(room.id),
      );

      const availableRooms = assignableRooms.map((room) =>
        mapRoomWithPrices(room, ticketTypes),
      );

      return {
        scheduleId: schedule.id,
        departureTime: schedule.departureTime.toISOString(),
        arrivalTime: schedule.arrivalTime.toISOString(),
        availableRooms,
      };
    })
    .filter((schedule) => schedule.availableRooms.length > 0);

  const totalRooms = availableBySchedule.reduce(
    (count, schedule) => count + schedule.availableRooms.length,
    0,
  );

  let reason: AvailabilityReason | undefined = availability.reason;

  if (totalRooms === 0 && !reason) {
    if (schedules.length === 0) {
      reason = "NO_SCHEDULES";
    } else {
      reason = "FULLY_BOOKED";
    }
  }

  return {
    cruiseId,
    startDate,
    endDate,
    cruise,
    schedules: availableBySchedule,
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
