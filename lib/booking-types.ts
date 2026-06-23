import type { StayDurationValue } from "@/lib/booking-search-config";

export type RoomPrice = {
  ticketTypeId: string;
  name: string;
  description: string | null;
  priceCents: number;
};

export type AvailableRoom = {
  id: string;
  name: string;
  capacity: number;
  description: string | null;
  roomType?: string | null;
  prices: RoomPrice[];
  scheduleId: string;
  minPriceCents: number;
  departureTime: string;
  arrivalTime: string;
  selectionKey?: string;
  duration?: StayDurationValue;
  cruiseName?: string;
  cruiseId?: string;
};

export type AvailabilitySchedule = {
  scheduleId: string;
  departureTime: string;
  arrivalTime: string;
  availableRooms: Omit<
    AvailableRoom,
    "scheduleId" | "minPriceCents" | "departureTime" | "arrivalTime"
  >[];
};

export type AvailabilityReason =
  | "NO_ROOMS"
  | "NO_MATCHING_ROOMS"
  | "FULLY_BOOKED"
  | "NO_SCHEDULES"
  | "CRUISE_NOT_FOUND";

export type AvailabilityResponse = {
  cruiseId: string;
  startDate: string;
  endDate: string;
  schedules: AvailabilitySchedule[];
  reason?: AvailabilityReason;
};

export function flattenAvailableRooms(
  schedules: AvailabilitySchedule[],
): AvailableRoom[] {
  const roomMap = new Map<string, AvailableRoom>();

  for (const schedule of schedules) {
    for (const room of schedule.availableRooms) {
      const minPriceCents = Math.min(...room.prices.map((p) => p.priceCents));

      if (!roomMap.has(room.id)) {
        roomMap.set(room.id, {
          ...room,
          scheduleId: schedule.scheduleId,
          minPriceCents,
          departureTime: schedule.departureTime,
          arrivalTime: schedule.arrivalTime,
          selectionKey: room.id,
        });
      }
    }
  }

  return Array.from(roomMap.values());
}

export function flattenPeriodSearchRooms(
  cruises: {
    id: string;
    name: string;
    slug: string;
    rooms: {
      id: string;
      name: string;
      capacity: number;
      description: string | null;
      roomType: string | null;
      scheduleId: string;
      departureTime: string;
      arrivalTime: string;
      prices: RoomPrice[];
    }[];
  }[],
): AvailableRoom[] {
  const rooms: AvailableRoom[] = [];

  for (const cruise of cruises) {
    for (const room of cruise.rooms) {
      const minPriceCents = room.prices.length
        ? Math.min(...room.prices.map((price) => price.priceCents))
        : 0;

      rooms.push({
        id: room.id,
        name: room.name,
        capacity: room.capacity,
        description: room.description,
        roomType: room.roomType,
        prices: room.prices,
        scheduleId: room.scheduleId,
        minPriceCents,
        departureTime: room.departureTime,
        arrivalTime: room.arrivalTime,
        selectionKey: `${room.scheduleId}:${room.id}`,
        duration: cruise.slug as StayDurationValue,
        cruiseName: cruise.name,
        cruiseId: cruise.id,
      });
    }
  }

  return rooms.sort(
    (left, right) =>
      new Date(left.departureTime).getTime() -
      new Date(right.departureTime).getTime(),
  );
}

function roomMatchesSelectionKey(room: AvailableRoom, key: string): boolean {
  return (room.selectionKey ?? room.id) === key || room.id === key;
}

export function computeTotalPrice(
  rooms: AvailableRoom[],
  selectedKeys: string[],
): number {
  return rooms
    .filter((room) =>
      selectedKeys.some((key) => roomMatchesSelectionKey(room, key)),
    )
    .reduce((sum, room) => sum + room.minPriceCents, 0);
}

export function getScheduleIdForSelection(
  rooms: AvailableRoom[],
  selectedKeys: string[],
): string | null {
  const selected = rooms.filter((room) =>
    selectedKeys.some((key) => roomMatchesSelectionKey(room, key)),
  );
  if (selected.length === 0) return null;

  const scheduleIds = new Set(selected.map((room) => room.scheduleId));
  if (scheduleIds.size !== 1) return null;

  return selected[0].scheduleId;
}
