import {
  LUXURY_TO_DB_ROOM_TYPES,
  type LuxuryRoomTypeValue,
  type RoomSearchConfig,
} from "@/lib/booking-search-config";

/**
 * Maximum guests per cabin category — sourced from assets/RAW_DATA.md:
 * - Luxury Rooms (cabins): max 2 persons
 * - Luxury Suites: max 4 persons
 * - Luxury Royal Suites: max 4 persons
 */
export const RAW_DATA_ROOM_CAPACITY: Record<LuxuryRoomTypeValue, number> = {
  "luxury-rooms": 2,
  "luxury-suites": 4,
  "luxury-royal-suites": 4,
};

export const MAX_GUESTS_PER_ROOM = 4;

export function getMaxCapacityForLuxuryType(
  roomType: LuxuryRoomTypeValue,
): number {
  return RAW_DATA_ROOM_CAPACITY[roomType];
}

export function resolveLuxuryTypeFromDbRoomType(
  dbRoomType: string | null | undefined,
): LuxuryRoomTypeValue | null {
  if (!dbRoomType?.trim()) return null;

  const normalized = dbRoomType.trim().toLowerCase();

  for (const [luxuryType, dbTypes] of Object.entries(LUXURY_TO_DB_ROOM_TYPES) as [
    LuxuryRoomTypeValue,
    string[],
  ][]) {
    if (
      dbTypes.some(
        (dbType) =>
          normalized === dbType.toLowerCase() ||
          normalized.includes(dbType.toLowerCase()),
      )
    ) {
      return luxuryType;
    }
  }

  return null;
}

export function getMaxCapacityForDbRoomType(
  dbRoomType: string | null | undefined,
): number {
  const luxuryType = resolveLuxuryTypeFromDbRoomType(dbRoomType);
  return luxuryType
    ? getMaxCapacityForLuxuryType(luxuryType)
    : MAX_GUESTS_PER_ROOM;
}

export function getRoomGuestTotal(room: Pick<RoomSearchConfig, "adults" | "children">): number {
  return room.adults + room.children;
}

export function validateRoomGuestCapacity(
  room: RoomSearchConfig,
): string | null {
  const max = getMaxCapacityForLuxuryType(room.roomType);
  const total = getRoomGuestTotal(room);

  if (room.adults < 1) {
    return "At least one adult is required per room.";
  }

  if (room.children < 0) {
    return "Invalid number of children.";
  }

  if (total > max) {
    return `This room type allows a maximum of ${max} guest${max === 1 ? "" : "s"}.`;
  }

  return null;
}

export function validateRoomGuestCapacityForDbRoom(
  dbRoomType: string | null | undefined,
  adults: number,
  children: number,
): string | null {
  const max = getMaxCapacityForDbRoomType(dbRoomType);
  const total = adults + children;

  if (adults < 1) {
    return "At least one adult is required.";
  }

  if (total > max) {
    return `This room allows a maximum of ${max} guest${max === 1 ? "" : "s"}.`;
  }

  return null;
}

/** Clamp guest counts to RAW_DATA limits when room type or counts change. */
export function clampRoomSearchConfig(room: RoomSearchConfig): RoomSearchConfig {
  const max = getMaxCapacityForLuxuryType(room.roomType);
  let adults = Math.max(1, Math.min(room.adults, max));
  let children = Math.max(0, room.children);

  while (adults + children > max) {
    if (children > 0) {
      children -= 1;
    } else {
      adults = max;
      break;
    }
  }

  return { ...room, adults, children };
}

export function clampRoomSearchConfigs(
  rooms: RoomSearchConfig[],
): RoomSearchConfig[] {
  return rooms.map(clampRoomSearchConfig);
}
