import { computeStayDates } from "@/lib/availability-search";
import type {
  LuxuryRoomTypeValue,
  RoomSearchConfig,
  StayDurationValue,
} from "@/lib/booking-search-config";
import {
  durationSupportsRoomType,
  findStayDurationOption,
} from "@/lib/booking-search-config";
import { InvalidBookingError } from "@/lib/booking";
import {
  departureDateKeyFromTime,
  departureWeekdayForDuration,
  isValidDepartureDateKey,
} from "@/lib/departure-dates";
import { parseToUtcDate, utcDateKeyFromDate } from "@/lib/dates";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import {
  getMaxCapacityForLuxuryType,
  getRoomGuestTotal,
  resolveLuxuryTypeFromDbRoomType,
  validateRoomGuestCapacity,
  validateRoomGuestCapacityForDbRoom,
} from "@/lib/room-capacity";
import type { PrismaClient } from "@/app/generated/prisma/client";
import { BookingStatus, type Prisma } from "@/app/generated/prisma/client";

/** Editable placeholder — RAW_DATA 4-night Royal Suite list price (USD). */
export const RAW_DATA_FOUR_NIGHT_ROYAL_SUITE_USD = 6500;

/** Total physical inventory per category aboard Hathor (RAW_DATA.md). */
export const RAW_DATA_CATEGORY_INVENTORY: Record<LuxuryRoomTypeValue, number> = {
  "luxury-rooms": 8,
  "luxury-suites": 2,
  "luxury-royal-suites": 2,
};

export type BookingValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validationError(message: string): BookingValidationResult {
  return { ok: false, message };
}

export function assertValid(message: string): void {
  throw new InvalidBookingError(message);
}

export function cruiseSlugToDuration(slug: string | null | undefined): StayDurationValue | null {
  if (!slug) return null;
  if (
    slug === "3-nights-aswan-luxor" ||
    slug === "4-nights-luxor-aswan" ||
    slug === "7-nights-luxor-aswan-luxor"
  ) {
    return slug;
  }
  return null;
}

export function departureDayLabel(duration: StayDurationValue): string {
  return departureWeekdayForDuration(duration);
}

/** Reject check-in dates that do not match the itinerary departure weekday. */
export function validateDepartureDate(
  checkInIso: string,
  duration: StayDurationValue,
): BookingValidationResult {
  const dateKey = utcDateKeyFromDate(parseToUtcDate(checkInIso));

  if (!isValidDepartureDateKey(dateKey, duration)) {
    const option = findStayDurationOption(duration);
    const nights = option?.nights ?? "";
    const day = departureDayLabel(duration);
    return validationError(
      `${nights}-night cruises depart on ${day}s only. Please select a valid ${day}.`,
    );
  }

  return { ok: true };
}

export function assertDepartureDate(
  checkInIso: string,
  duration: StayDurationValue,
): void {
  const result = validateDepartureDate(checkInIso, duration);
  if (!result.ok) assertValid(result.message);
}

/** Ensure stay window matches itinerary length from RAW_DATA. */
export function validateStayWindow(
  checkInIso: string,
  endIso: string,
  duration: StayDurationValue,
): BookingValidationResult {
  const expected = computeStayDates(checkInIso, duration);
  const actualEnd = parseToUtcDate(endIso).toISOString();
  const expectedEnd = parseToUtcDate(expected.endDate).toISOString();

  if (actualEnd !== expectedEnd) {
    return validationError(
      "Stay dates do not match the selected itinerary length.",
    );
  }

  return { ok: true };
}

export function assertStayWindow(
  checkInIso: string,
  endIso: string,
  duration: StayDurationValue,
): void {
  const result = validateStayWindow(checkInIso, endIso, duration);
  if (!result.ok) assertValid(result.message);
}

export function validateRoomSearchConfigs(
  duration: StayDurationValue,
  rooms: RoomSearchConfig[],
): BookingValidationResult {
  if (rooms.length === 0) {
    return validationError("At least one room configuration is required.");
  }

  if (rooms.length > 4) {
    return validationError("A maximum of 4 rooms can be booked per reservation.");
  }

  const categoryCounts: Record<LuxuryRoomTypeValue, number> = {
    "luxury-rooms": 0,
    "luxury-suites": 0,
    "luxury-royal-suites": 0,
  };

  for (const room of rooms) {
    const capacityError = validateRoomGuestCapacity(room);
    if (capacityError) {
      return validationError(capacityError);
    }

    if (!durationSupportsRoomType(duration, room.roomType)) {
      const option = findStayDurationOption(duration);
      return validationError(
        `${option?.label.replace(/^⛵\s*/, "") ?? "This itinerary"} does not offer the selected room type.`,
      );
    }

    categoryCounts[room.roomType] += 1;

    const inventoryCap = RAW_DATA_CATEGORY_INVENTORY[room.roomType];
    if (categoryCounts[room.roomType] > inventoryCap) {
      return validationError(
        `Only ${inventoryCap} ${room.roomType.replace(/-/g, " ")} can be booked for this sailing.`,
      );
    }
  }

  return { ok: true };
}

export function assertRoomSearchConfigs(
  duration: StayDurationValue,
  rooms: RoomSearchConfig[],
): void {
  const result = validateRoomSearchConfigs(duration, rooms);
  if (!result.ok) assertValid(result.message);
}

export function validateDbRoomGuests(
  dbRoomType: string | null | undefined,
  adults: number,
  children: number,
): BookingValidationResult {
  const message = validateRoomGuestCapacityForDbRoom(dbRoomType, adults, children);
  if (message) return validationError(message);
  return { ok: true };
}

export function assertDbRoomGuests(
  dbRoomType: string | null | undefined,
  adults: number,
  children: number,
): void {
  const result = validateDbRoomGuests(dbRoomType, adults, children);
  if (!result.ok) assertValid(result.message);
}

function catalogRoomPriceCents(
  duration: StayDurationValue,
  dbRoomType: string,
): number | null {
  const cruise = HATHOR_CRUISES.find((entry) => entry.slug === duration);
  if (!cruise) return null;

  const normalized = dbRoomType.trim().toLowerCase();
  const match = cruise.rooms.find((room) => {
    const seedType = room.roomType.trim().toLowerCase();
    return normalized === seedType || normalized.includes(seedType);
  });

  if (!match) return null;

  const luxuryType = resolveLuxuryTypeFromDbRoomType(dbRoomType);
  if (
    duration === "4-nights-luxor-aswan" &&
    luxuryType === "luxury-royal-suites"
  ) {
    return RAW_DATA_FOUR_NIGHT_ROYAL_SUITE_USD * 100;
  }

  return match.priceCents;
}

/** Canonical per-room price in cents from RAW_DATA / hathor-catalog. */
export function getCanonicalPriceCents(
  duration: StayDurationValue,
  dbRoomType: string | null | undefined,
): number | null {
  if (!dbRoomType?.trim()) return null;
  return catalogRoomPriceCents(duration, dbRoomType);
}

export function getCanonicalPriceCentsForLuxuryType(
  duration: StayDurationValue,
  luxuryType: LuxuryRoomTypeValue,
): number | null {
  const cruise = HATHOR_CRUISES.find((entry) => entry.slug === duration);
  if (!cruise) return null;

  const match = cruise.rooms.find(
    (room) => resolveLuxuryTypeFromDbRoomType(room.roomType) === luxuryType,
  );
  if (!match) return null;

  if (
    duration === "4-nights-luxor-aswan" &&
    luxuryType === "luxury-royal-suites"
  ) {
    return RAW_DATA_FOUR_NIGHT_ROYAL_SUITE_USD * 100;
  }

  return match.priceCents;
}

export function validateRoomPriceCents(
  duration: StayDurationValue,
  dbRoomType: string | null | undefined,
  priceCents: number,
): BookingValidationResult {
  const canonical = getCanonicalPriceCents(duration, dbRoomType);
  if (canonical === null) {
    return validationError("Unable to verify room price for this itinerary.");
  }

  if (priceCents !== canonical) {
    return validationError(
      "Price does not match the published rate for this room and itinerary.",
    );
  }

  return { ok: true };
}

export function assertRoomPriceCents(
  duration: StayDurationValue,
  dbRoomType: string | null | undefined,
  priceCents: number,
): void {
  const result = validateRoomPriceCents(duration, dbRoomType, priceCents);
  if (!result.ok) assertValid(result.message);
}

export function computeExpectedRoomPriceFromDb(
  duration: StayDurationValue,
  dbRoomType: string | null | undefined,
  basePriceCents: number,
  priceMultiplier: number,
): number {
  const canonical = getCanonicalPriceCents(duration, dbRoomType);
  if (canonical !== null) return canonical;

  const multiplier = priceMultiplier > 0 ? priceMultiplier : 1;
  return Math.round(basePriceCents * multiplier);
}

type RoomRecord = {
  id: string;
  roomType: string | null;
  priceMultiplier: number;
  cruise: { basePriceCents: number; slug: string | null };
};

export function validateSelectedRooms(
  duration: StayDurationValue,
  rooms: RoomRecord[],
): BookingValidationResult {
  const categoryCounts: Record<LuxuryRoomTypeValue, number> = {
    "luxury-rooms": 0,
    "luxury-suites": 0,
    "luxury-royal-suites": 0,
  };

  for (const room of rooms) {
    const luxuryType = resolveLuxuryTypeFromDbRoomType(room.roomType);
    if (!luxuryType) {
      return validationError("Unknown room type for this cruise.");
    }

    if (!durationSupportsRoomType(duration, luxuryType)) {
      return validationError(
        "One or more rooms are not offered on this itinerary.",
      );
    }

    categoryCounts[luxuryType] += 1;

    const canonical = getCanonicalPriceCents(duration, room.roomType);
    if (canonical === null) {
      return validationError(
        "Unable to verify published pricing for one or more rooms.",
      );
    }
  }

  for (const [category, count] of Object.entries(categoryCounts) as [
    LuxuryRoomTypeValue,
    number,
  ][]) {
    if (count > RAW_DATA_CATEGORY_INVENTORY[category]) {
      return validationError(
        `Cannot book more than ${RAW_DATA_CATEGORY_INVENTORY[category]} ${category.replace(/-/g, " ")} on one sailing.`,
      );
    }
  }

  return { ok: true };
}

export async function validateCategoryInventoryOnSchedule(
  prisma: PrismaClient | Prisma.TransactionClient,
  cruiseScheduleId: string,
  roomIds: string[],
  excludeBookingId?: string,
): Promise<BookingValidationResult> {
  if (roomIds.length === 0) {
    return validationError("At least one room is required.");
  }

  const rooms = await prisma.room.findMany({
    where: { id: { in: roomIds }, deletedAt: null },
    select: { id: true, roomType: true },
  });

  if (rooms.length !== roomIds.length) {
    return validationError("One or more rooms are invalid.");
  }

  const requestedByCategory: Record<LuxuryRoomTypeValue, number> = {
    "luxury-rooms": 0,
    "luxury-suites": 0,
    "luxury-royal-suites": 0,
  };

  for (const room of rooms) {
    const luxuryType = resolveLuxuryTypeFromDbRoomType(room.roomType);
    if (!luxuryType) {
      return validationError("Unknown room category.");
    }
    requestedByCategory[luxuryType] += 1;
  }

  const bookedRooms = await prisma.bookingRoom.findMany({
    where: {
      cruiseScheduleId,
      ...(excludeBookingId ? { bookingId: { not: excludeBookingId } } : {}),
      booking: {
        deletedAt: null,
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.PENDING_HOLD],
        },
      },
    },
    select: {
      room: { select: { roomType: true } },
      booking: { select: { status: true, holdExpiresAt: true } },
    },
  });

  const bookedByCategory: Record<LuxuryRoomTypeValue, number> = {
    "luxury-rooms": 0,
    "luxury-suites": 0,
    "luxury-royal-suites": 0,
  };

  const now = Date.now();
  for (const entry of bookedRooms) {
    if (entry.booking.status === BookingStatus.PENDING_HOLD) {
      const expires = entry.booking.holdExpiresAt?.getTime();
      if (expires !== undefined && expires !== null && expires <= now) {
        continue;
      }
    }

    const luxuryType = resolveLuxuryTypeFromDbRoomType(entry.room.roomType);
    if (luxuryType) bookedByCategory[luxuryType] += 1;
  }

  for (const category of Object.keys(requestedByCategory) as LuxuryRoomTypeValue[]) {
    const cap = RAW_DATA_CATEGORY_INVENTORY[category];
    const total = bookedByCategory[category] + requestedByCategory[category];
    if (total > cap) {
      return validationError(
        `No ${category.replace(/-/g, " ")} availability remains for this departure.`,
      );
    }
  }

  return { ok: true };
}

export async function assertHoldBookingRequest(
  prisma: PrismaClient | Prisma.TransactionClient,
  input: {
    cruiseId: string;
    cruiseScheduleId: string;
    roomIds: string[];
    startDate: string;
    endDate: string;
    excludeBookingId?: string;
  },
): Promise<StayDurationValue> {
  const schedule = await prisma.cruiseSchedule.findFirst({
    where: { id: input.cruiseScheduleId, cruiseId: input.cruiseId },
    select: {
      id: true,
      departureTime: true,
      arrivalTime: true,
      cruise: { select: { id: true, slug: true, basePriceCents: true } },
    },
  });

  if (!schedule) {
    throw new InvalidBookingError("Cruise schedule not found for this cruise.");
  }

  const duration = cruiseSlugToDuration(schedule.cruise.slug);
  if (!duration) {
    throw new InvalidBookingError(
      "This cruise itinerary is not configured for booking validation.",
    );
  }

  const checkInKey = departureDateKeyFromTime(schedule.departureTime);
  const checkInIso = parseToUtcDate(input.startDate).toISOString();

  assertDepartureDate(checkInIso, duration);

  if (checkInKey !== utcDateKeyFromDate(parseToUtcDate(checkInIso))) {
    assertValid("Check-in date does not match the selected sailing departure.");
  }

  assertStayWindow(checkInIso, input.endDate, duration);

  const rooms = await prisma.room.findMany({
    where: {
      id: { in: input.roomIds },
      cruiseId: input.cruiseId,
      deletedAt: null,
    },
    select: {
      id: true,
      roomType: true,
      priceMultiplier: true,
      cruise: { select: { basePriceCents: true, slug: true } },
    },
  });

  if (rooms.length !== input.roomIds.length) {
    assertValid("One or more rooms are invalid for this cruise.");
  }

  const roomValidation = validateSelectedRooms(duration, rooms);
  if (!roomValidation.ok) assertValid(roomValidation.message);

  const inventory = await validateCategoryInventoryOnSchedule(
    prisma,
    input.cruiseScheduleId,
    input.roomIds,
    input.excludeBookingId,
  );
  if (!inventory.ok) assertValid(inventory.message);

  return duration;
}

/** Sum guest capacity check for multi-room configs (search / availability). */
export function validateTotalGuestsWithinRoomLimits(
  rooms: RoomSearchConfig[],
): BookingValidationResult {
  for (const room of rooms) {
    const max = getMaxCapacityForLuxuryType(room.roomType);
    const total = getRoomGuestTotal(room);
    if (total > max) {
      return validationError(
        `A ${room.roomType.replace(/-/g, " ")} allows a maximum of ${max} guests.`,
      );
    }
  }
  return { ok: true };
}
