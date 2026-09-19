import type { HathorCruiseSeed } from "@/lib/hathor-catalog";
import type { LuxuryRoomTypeValue } from "@/lib/booking-search-config";
import { PHYSICAL_ROOM_TYPES, type PhysicalRoomType } from "@/lib/physical-inventory";

/**
 * Cabin prices as the booking engine charges them: TicketType.priceCents per
 * voyage (Cruise.slug) and cabin type, set in Dashboard → Prices. Client-safe.
 */
export type CabinPriceTable = Record<string, Partial<Record<PhysicalRoomType, number>>>;

const TYPE_BY_ROOM_PREFIX: Record<string, PhysicalRoomType> = {
  KING: "Luxury King Cabin",
  TWIN: "Luxury Twin Cabin",
  SUITE: "Luxury Suite",
  ROYAL: "Royal Suite",
};

/** The static catalog marks its cabins "KING-3N", "ROYAL-7N"…; this is their booking type. */
export function physicalTypeForCatalogRoom(roomNumber: string): PhysicalRoomType | null {
  return TYPE_BY_ROOM_PREFIX[roomNumber.split("-")[0]?.toUpperCase() ?? ""] ?? null;
}

export function isPhysicalRoomType(value: string | null | undefined): value is PhysicalRoomType {
  return PHYSICAL_ROOM_TYPES.includes(value as PhysicalRoomType);
}

/** The live price for a catalog cabin, or null when the table does not have it. */
export function livePriceFor(table: CabinPriceTable | null, voyageSlug: string, roomNumber: string): number | null {
  const type = physicalTypeForCatalogRoom(roomNumber);
  const cents = type ? table?.[voyageSlug]?.[type] : undefined;
  return typeof cents === "number" && cents > 0 ? cents : null;
}

/** The static catalog with the dashboard's prices in place (unchanged where a price is missing). */
export function withLivePrices(cruises: HathorCruiseSeed[], table: CabinPriceTable | null): HathorCruiseSeed[] {
  if (!table) return cruises;
  return cruises.map(cruise => {
    const rooms = cruise.rooms.map(room => {
      const cents = livePriceFor(table, cruise.slug, room.roomNumber);
      return cents === null ? room : { ...room, priceCents: cents };
    });
    const lowest = Math.min(...rooms.map(room => room.priceCents));
    return { ...cruise, rooms, basePriceCents: Number.isFinite(lowest) ? lowest : cruise.basePriceCents };
  });
}

const LUXURY_TYPE_BY_CABIN: Record<PhysicalRoomType, LuxuryRoomTypeValue> = {
  "Luxury King Cabin": "luxury-rooms",
  "Luxury Twin Cabin": "luxury-rooms",
  "Luxury Suite": "luxury-suites",
  "Royal Suite": "luxury-royal-suites",
};

/** The cart's "from" price for a voyage and cabin grade: the lowest live price in that grade. */
export function liveIndicativeFor(
  table: CabinPriceTable | null,
  voyageSlug: string | null,
  luxuryType: LuxuryRoomTypeValue | null,
): number | null {
  if (!table || !voyageSlug || !luxuryType) return null;
  const prices = Object.entries(table[voyageSlug] ?? {})
    .filter(([type, cents]) => isPhysicalRoomType(type) && LUXURY_TYPE_BY_CABIN[type] === luxuryType && (cents ?? 0) > 0)
    .map(([, cents]) => cents as number);
  return prices.length ? Math.min(...prices) : null;
}
