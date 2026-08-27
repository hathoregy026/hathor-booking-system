import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { clampRoomSearchConfig } from "@/lib/room-capacity";

export type StayDurationValue =
  | "3-nights-aswan-luxor"
  | "4-nights-luxor-aswan"
  | "7-nights-luxor-aswan-luxor";

export type LuxuryRoomTypeValue =
  | "luxury-rooms"
  | "luxury-suites"
  | "luxury-royal-suites";

export type RoomSearchConfig = {
  roomType: LuxuryRoomTypeValue;
  adults: number;
  children: number;
};

export type StayDurationOption = {
  value: StayDurationValue;
  label: string;
  nights: number;
  /** Terms used to match against Cruise.name / Cruise.description */
  searchTerms: string[];
};

export const STAY_DURATION_OPTIONS: StayDurationOption[] = [
  {
    value: "3-nights-aswan-luxor",
    label: "⛵ 3 Nights / 4 Days - Aswan Luxor",
    nights: 3,
    searchTerms: [
      "3 nights",
      "4 days",
      "aswan luxor",
      "aswan - luxor",
      "3-nights-aswan-luxor",
    ],
  },
  {
    value: "4-nights-luxor-aswan",
    label: "⛵ 4 Nights / 5 Days - Luxor Aswan",
    nights: 4,
    searchTerms: [
      "4 nights",
      "5 days",
      "luxor aswan",
      "luxor - aswan",
      "4-nights-luxor-aswan",
    ],
  },
  {
    value: "7-nights-luxor-aswan-luxor",
    label: "⛵ 7 Nights / 8 Days - Luxor Aswan Luxor",
    nights: 7,
    searchTerms: [
      "7 nights",
      "8 days",
      "luxor aswan luxor",
      "luxor - aswan - luxor",
      "7-nights-luxor-aswan-luxor",
    ],
  },
];

export const LUXURY_ROOM_TYPE_OPTIONS: {
  value: LuxuryRoomTypeValue;
  label: string;
}[] = [
  { value: "luxury-rooms", label: "Luxury Rooms" },
  { value: "luxury-suites", label: "Luxury Suites" },
  { value: "luxury-royal-suites", label: "Luxury Royal Suites" },
];

/** Maps luxury UI labels to database roomType values */
export const LUXURY_TO_DB_ROOM_TYPES: Record<LuxuryRoomTypeValue, string[]> = {
  "luxury-rooms": ["Luxury Room", "Luxury King Bed", "Luxury Twin Bed"],
  "luxury-suites": ["Luxury Suite", "Suite", "Deluxe"],
  "luxury-royal-suites": ["Luxury Royal Suite", "Royal Suite", "Presidential"],
};

/**
 * Categories in MOST-SPECIFIC-FIRST order.
 *
 * The alias table above is matched by substring, and `luxury-suites` lists the
 * generic alias "Suite". A scan in object order therefore classifies
 * "Luxury Royal Suite" as `luxury-suites` — `"luxury royal suite".includes("suite")`
 * is true — and the `luxury-royal-suites` branch becomes unreachable for any
 * label containing "suite". Walking royal suites first makes the match
 * deterministic and the most specific category always win.
 */
const LUXURY_TYPES_MOST_SPECIFIC_FIRST: readonly LuxuryRoomTypeValue[] = [
  "luxury-royal-suites",
  "luxury-suites",
  "luxury-rooms",
];

/**
 * THE single room-type classifier. Every caller — classifiers, predicates and
 * search filters alike — must go through this so one label can never resolve to
 * two different categories in two different files.
 *
 * Returns null when no alias matches; each caller applies its own documented
 * fallback so existing contracts are preserved.
 */
export function classifyDbRoomType(
  dbRoomType: string | null | undefined,
): LuxuryRoomTypeValue | null {
  const normalized = dbRoomType?.trim().toLowerCase() ?? "";
  if (!normalized) return null;

  for (const luxuryType of LUXURY_TYPES_MOST_SPECIFIC_FIRST) {
    const matched = LUXURY_TO_DB_ROOM_TYPES[luxuryType].some((alias) => {
      const candidate = alias.trim().toLowerCase();
      return normalized === candidate || normalized.includes(candidate);
    });
    if (matched) return luxuryType;
  }

  return null;
}

/** Shared predicate — "does this label belong to exactly this category?" */
export function dbRoomTypeMatchesLuxuryType(
  dbRoomType: string | null | undefined,
  luxuryType: LuxuryRoomTypeValue,
): boolean {
  return classifyDbRoomType(dbRoomType) === luxuryType;
}

export const DEFAULT_ROOM_SEARCH_CONFIG: RoomSearchConfig = {
  roomType: "luxury-rooms",
  adults: 1,
  children: 0,
};

export function createDefaultRoomConfigs(count = 1): RoomSearchConfig[] {
  return Array.from({ length: count }, () => ({
    ...DEFAULT_ROOM_SEARCH_CONFIG,
  }));
}

export function formatGuestsSummary(rooms: RoomSearchConfig[]): string {
  const roomCount = rooms.length;
  const adults = rooms.reduce((sum, room) => sum + room.adults, 0);
  const children = rooms.reduce((sum, room) => sum + room.children, 0);

  const roomLabel = roomCount === 1 ? "1 room" : `${roomCount} rooms`;
  const adultLabel = `${adults} Adults`;
  const childLabel = `${children} Child`;

  return `${roomLabel} ${adultLabel} ${childLabel}`;
}

export function findStayDurationOption(value: StayDurationValue | "") {
  return STAY_DURATION_OPTIONS.find((option) => option.value === value);
}

type CruiseMatchInput = {
  id: string;
  name: string;
  description: string | null;
};

export function getDefaultRoomTypeForDuration(
  duration: StayDurationValue,
): LuxuryRoomTypeValue {
  if (duration === "3-nights-aswan-luxor") {
    return "luxury-suites";
  }
  return "luxury-rooms";
}

export function cruiseSlugForDuration(duration: StayDurationValue): string {
  return duration;
}

export function durationSupportsRoomType(
  duration: StayDurationValue,
  roomType: LuxuryRoomTypeValue,
): boolean {
  const cruise = HATHOR_CRUISES.find((entry) => entry.slug === duration);
  if (!cruise) return true;

  return cruise.rooms.some((room) =>
    roomMatchesLuxuryTypeFromCatalog(room.roomType, roomType),
  );
}

/** Unmatched labels keep their historical `luxury-rooms` fallback. */
export function luxuryRoomTypeForDbRoomType(
  dbRoomType: string | null,
): LuxuryRoomTypeValue {
  return classifyDbRoomType(dbRoomType) ?? "luxury-rooms";
}

function roomMatchesLuxuryTypeFromCatalog(
  dbRoomType: string,
  luxuryType: LuxuryRoomTypeValue,
): boolean {
  return dbRoomTypeMatchesLuxuryType(dbRoomType, luxuryType);
}

export function normalizeRoomConfigsForDuration(
  duration: StayDurationValue,
  rooms: RoomSearchConfig[],
): RoomSearchConfig[] {
  return rooms.map((room) => {
    const withType = durationSupportsRoomType(duration, room.roomType)
      ? room
      : {
          ...room,
          roomType: getDefaultRoomTypeForDuration(duration),
        };

    return clampRoomSearchConfig(withType);
  });
}

export function describeRoomTypesOnCruise(duration: StayDurationValue): string {
  const cruise = HATHOR_CRUISES.find((entry) => entry.slug === duration);
  if (!cruise) return "Luxury Rooms, Luxury Suites, or Luxury Royal Suites";

  const labels = new Set<string>();
  for (const room of cruise.rooms) {
    const luxuryType = classifyDbRoomType(room.roomType);
    if (!luxuryType) continue;

    const option = LUXURY_ROOM_TYPE_OPTIONS.find(
      (entry) => entry.value === luxuryType,
    );
    if (option) labels.add(option.label);
  }

  return [...labels].join(", ") || "a different room type";
}

export function buildPeriodSearchQueryParams(
  periodStart: string,
  periodEnd: string,
  rooms: RoomSearchConfig[],
): URLSearchParams {
  return new URLSearchParams({
    periodStart,
    periodEnd,
    rooms: JSON.stringify(rooms),
  });
}

export function buildAvailabilityQueryParams(
  duration: StayDurationValue,
  checkInDate: string,
  rooms: RoomSearchConfig[],
  roomId?: string | null,
): URLSearchParams {
  const params = new URLSearchParams({
    duration,
    checkInDate,
    rooms: JSON.stringify(rooms),
  });

  if (roomId) params.set("roomId", roomId);

  return params;
}

export function matchCruiseByDuration(
  cruises: CruiseMatchInput[],
  duration: StayDurationValue,
): CruiseMatchInput | undefined {
  const option = findStayDurationOption(duration);
  if (!option) return undefined;

  const haystack = (cruise: CruiseMatchInput) =>
    `${cruise.name} ${cruise.description ?? ""}`.toLowerCase();

  const scored = cruises
    .map((cruise) => {
      const text = haystack(cruise);
      const score = option.searchTerms.reduce(
        (total, term) => (text.includes(term.toLowerCase()) ? total + 1 : total),
        0,
      );
      return { cruise, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.cruise ?? cruises[0];
}
