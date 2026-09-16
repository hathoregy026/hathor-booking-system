import { bookingQuery } from "@/lib/booking-database";
import {
  PHYSICAL_ROOM_TYPES,
  type PhysicalRoomType,
} from "@/lib/physical-inventory";
import type {
  RoomSearchConfig,
  StayDurationValue,
} from "@/lib/booking-search-config";

/**
 * The one authoritative availability read for the whole site.
 *
 * Every public caller (booking flow, calendars, search) resolves free cabins
 * here, so no second code path can count inventory differently. It reads the
 * real physical cabins and every active allocation — holds, submitted
 * requests, confirmed bookings, manual blocks, maintenance and charters — and
 * never writes: a public availability request can never create or repair a
 * sailing. The 7N/4N/3N overlap follows from comparing each allocation's date
 * range with the sailing's own range, the same rule the hold function applies
 * when it allocates a cabin.
 *
 * It reads in three small statements — sailings, the cabin/rate catalog, and
 * the free cabin pairs — instead of one wide join. Sailing and rate text would
 * otherwise repeat on every cabin row, and large results are exactly what a
 * constrained connection drops.
 */

export type FreeCabin = {
  id: string;
  name: string;
  roomNumber: string | null;
  description: string | null;
  capacity: number;
  roomType: PhysicalRoomType;
  priceMultiplier: number;
};

export type RoomTypeAvailability = {
  roomType: PhysicalRoomType;
  sizeSqm: number;
  maxOccupancy: number;
  priceCents: number;
  ticketTypeId: string;
  ticketName: string;
  ticketDescription: string | null;
  totalCabins: number;
  availableCabins: number;
  freeCabins: FreeCabin[];
  soldOut: boolean;
  fitsOccupancy: boolean;
  hasRequestedQuantity: boolean;
  status: "AVAILABLE" | "SOLD_OUT" | "OVER_OCCUPANCY" | "NOT_ENOUGH_CABINS";
};

export type SailingAvailability = {
  scheduleId: string;
  cruiseId: string;
  duration: StayDurationValue;
  voyage: string;
  route: string | null;
  nights: number;
  departureTime: string;
  arrivalTime: string;
  types: RoomTypeAvailability[];
  availableCabins: number;
  soldOut: boolean;
  matchesRequest: boolean;
};

export type AvailabilityRequest = {
  duration: StayDurationValue;
  /** A single departure day (UTC); only real bookable sailings are returned. */
  departureDate?: string | Date | null;
  from?: string | Date | null;
  to?: string | Date | null;
  adults?: number;
  children?: number;
  rooms?: number;
  /** Legacy per-room configurations used by the calendar and search endpoints. */
  roomConfigs?: RoomSearchConfig[];
  /** Legacy single-cabin filter, resolved to that cabin's guest-facing type. */
  roomId?: string | null;
};

type SailingRow = {
  scheduleId: string;
  cruiseId: string;
  slug: StayDurationValue;
  voyage: string;
  route: string | null;
  departureTime: Date;
  arrivalTime: Date;
};

type CatalogRow = {
  cabinId: string;
  cabinName: string;
  roomNumber: string | null;
  cabinDescription: string | null;
  priceMultiplier: number;
  roomType: PhysicalRoomType;
  capacity: number;
  sizeSqm: number;
  ticketTypeId: string;
  ticketName: string;
  ticketDescription: string | null;
  priceCents: number;
};

type FreePairRow = { scheduleId: string; cabinId: string };

const dayMs = 86_400_000;

function toUtcDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const parsed = value instanceof Date
    ? value
    : new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function windowOf(input: AvailabilityRequest): [Date, Date] {
  const departure = toUtcDate(input.departureDate);
  // Always send a real range. The connection pooler stalls on NULL timestamp
  // parameters, and open bounds cost nothing: the query already limits itself
  // to future bookable sailings.
  const from = (departure ? startOfUtcDay(departure) : toUtcDate(input.from)) ?? new Date(0);
  const to = departure
    ? new Date(startOfUtcDay(departure).getTime() + dayMs)
    : toUtcDate(input.to) ?? new Date(Date.UTC(2999, 11, 31));
  return [from, to];
}

/** Real, bookable, future sailings only — this never creates or repairs one. */
function readSailings(duration: StayDurationValue, from: Date, to: Date) {
  return bookingQuery<SailingRow>(`
    SELECT s.id AS "scheduleId", c.id AS "cruiseId", c.slug, c.name AS voyage, c.ports AS route,
      s."departureTime", s."arrivalTime"
    FROM "CruiseSchedule" s
    JOIN "Cruise" c ON c.id = s."cruiseId"
    WHERE c.slug = $1 AND c."deletedAt" IS NULL AND s."isBookable"
      AND s."departureTime" > clock_timestamp()
      AND s."departureTime" >= $2::timestamp AND s."departureTime" < $3::timestamp
    ORDER BY s."departureTime"
  `, [duration, from, to]);
}

/** The 12 physical cabins of this voyage with their stored per-cabin rate. */
function readCatalog(duration: StayDurationValue) {
  return bookingQuery<CatalogRow>(`
    SELECT r.id AS "cabinId", r.name AS "cabinName", r."roomNumber",
      r.description AS "cabinDescription", r."priceMultiplier",
      r."roomType", r.capacity, r."sizeSqm",
      t.id AS "ticketTypeId", t.name AS "ticketName", t.description AS "ticketDescription", t."priceCents"
    FROM "Cruise" c
    JOIN "_CruiseRooms" cr ON cr."A" = c.id
    JOIN "Room" r ON r.id = cr."B"
    JOIN "TicketType" t ON t."cruiseId" = c.id AND t."roomType" = r."roomType"
    WHERE c.slug = $1 AND c."deletedAt" IS NULL AND r."deletedAt" IS NULL
    ORDER BY r."roomType", r."roomNumber"
  `, [duration]);
}

/**
 * Cabin/sailing pairs with no overlapping active allocation. Holds, submitted
 * requests, confirmed bookings, manual blocks, maintenance and charter blocks
 * are all allocations, so each one removes its cabin here.
 */
function readFreePairs(duration: StayDurationValue, from: Date, to: Date) {
  return bookingQuery<FreePairRow>(`
    SELECT s.id AS "scheduleId", r.id AS "cabinId"
    FROM "CruiseSchedule" s
    JOIN "Cruise" c ON c.id = s."cruiseId"
    JOIN "_CruiseRooms" cr ON cr."A" = c.id
    JOIN "Room" r ON r.id = cr."B"
    WHERE c.slug = $1 AND c."deletedAt" IS NULL AND r."deletedAt" IS NULL
      AND s."isBookable" AND s."departureTime" > clock_timestamp()
      AND s."departureTime" >= $2::timestamp AND s."departureTime" < $3::timestamp
      AND NOT EXISTS (
        SELECT 1 FROM "InventoryAllocation" a
        WHERE a."roomId" = r.id AND a.active
          AND a."startsAt" < s."arrivalTime" AND a."endsAt" > s."departureTime"
          AND (a."expiresAt" IS NULL OR a."expiresAt" > clock_timestamp())
      )
  `, [duration, from, to]);
}

/** Smallest cabin size that still seats the request when guests spread evenly. */
function guestsPerCabin(input: AvailabilityRequest): number {
  if (input.roomConfigs?.length) {
    return Math.max(...input.roomConfigs.map(config => config.adults + config.children));
  }
  const cabins = Math.max(1, input.rooms ?? 1);
  const guests = (input.adults ?? 1) + (input.children ?? 0);
  return Math.max(1, Math.ceil(guests / cabins));
}

export async function getSailingAvailability(
  input: AvailabilityRequest,
): Promise<SailingAvailability[]> {
  const [from, to] = windowOf(input);
  const sailingRows = await readSailings(input.duration, from, to);
  if (sailingRows.length === 0) return [];

  const [catalog, freePairs] = await Promise.all([
    readCatalog(input.duration),
    readFreePairs(input.duration, from, to),
  ]);

  const requestedCabins = Math.max(1, input.rooms ?? input.roomConfigs?.length ?? 1);
  const perCabin = guestsPerCabin(input);
  const onlyRoomType = input.roomId
    ? catalog.find(cabin => cabin.cabinId === input.roomId)?.roomType
      ?? catalog.find(cabin => cabin.roomType === input.roomId)?.roomType
      ?? null
    : null;

  const free = new Set(freePairs.map(pair => `${pair.scheduleId}|${pair.cabinId}`));
  const order = new Map(PHYSICAL_ROOM_TYPES.map((type, index) => [type, index]));
  const cabins = onlyRoomType
    ? catalog.filter(cabin => cabin.roomType === onlyRoomType)
    : catalog;

  return sailingRows.map(sailing => {
    const types = new Map<PhysicalRoomType, RoomTypeAvailability>();

    for (const cabin of cabins) {
      let type = types.get(cabin.roomType);
      if (!type) {
        type = {
          roomType: cabin.roomType,
          sizeSqm: cabin.sizeSqm,
          maxOccupancy: cabin.capacity,
          priceCents: cabin.priceCents,
          ticketTypeId: cabin.ticketTypeId,
          ticketName: cabin.ticketName,
          ticketDescription: cabin.ticketDescription,
          totalCabins: 0,
          availableCabins: 0,
          freeCabins: [],
          soldOut: true,
          fitsOccupancy: cabin.capacity >= perCabin,
          hasRequestedQuantity: false,
          status: "SOLD_OUT",
        };
        types.set(cabin.roomType, type);
      }

      type.totalCabins += 1;
      if (free.has(`${sailing.scheduleId}|${cabin.cabinId}`)) {
        type.availableCabins += 1;
        type.freeCabins.push({
          id: cabin.cabinId,
          name: cabin.cabinName,
          roomNumber: cabin.roomNumber,
          description: cabin.cabinDescription,
          capacity: cabin.capacity,
          roomType: cabin.roomType,
          priceMultiplier: cabin.priceMultiplier,
        });
      }
    }

    const roomTypes = [...types.values()].sort(
      (a, b) => (order.get(a.roomType) ?? 9) - (order.get(b.roomType) ?? 9),
    );

    let availableCabins = 0;
    for (const type of roomTypes) {
      type.soldOut = type.availableCabins === 0;
      type.hasRequestedQuantity = type.availableCabins >= requestedCabins;
      type.status = type.soldOut
        ? "SOLD_OUT"
        : !type.fitsOccupancy
          ? "OVER_OCCUPANCY"
          : !type.hasRequestedQuantity
            ? "NOT_ENOUGH_CABINS"
            : "AVAILABLE";
      availableCabins += type.availableCabins;
    }

    return {
      scheduleId: sailing.scheduleId,
      cruiseId: sailing.cruiseId,
      duration: sailing.slug,
      voyage: sailing.voyage,
      route: sailing.route,
      nights: Math.round((sailing.arrivalTime.getTime() - sailing.departureTime.getTime()) / dayMs),
      departureTime: sailing.departureTime.toISOString(),
      arrivalTime: sailing.arrivalTime.toISOString(),
      types: roomTypes,
      availableCabins,
      soldOut: availableCabins === 0,
      matchesRequest: roomTypes.some(type => type.status === "AVAILABLE"),
    };
  });
}

/** Free cabins across a sailing, for callers that still assign individual rooms. */
export function freeCabinsOf(sailing: SailingAvailability): FreeCabin[] {
  return sailing.types.flatMap(type => type.freeCabins);
}

export type { PhysicalRoomType };
