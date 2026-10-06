import { classifyDbRoomType, type LuxuryRoomTypeValue } from "@/lib/booking-search-config";

const PRICE_UNITS: Record<LuxuryRoomTypeValue, string> = {
  "luxury-rooms": "per room",
  "luxury-suites": "per suite",
  "luxury-royal-suites": "per royal suite",
};

/** Display copy only; never changes a rate or a booking total. */
export function roomPriceUnit(roomType: string | null | undefined): string {
  const category = roomType && Object.hasOwn(PRICE_UNITS, roomType)
    ? roomType as LuxuryRoomTypeValue
    : classifyDbRoomType(roomType);
  return PRICE_UNITS[category ?? "luxury-rooms"];
}
