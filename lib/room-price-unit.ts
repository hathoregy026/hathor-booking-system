import { classifyDbRoomType, type LuxuryRoomTypeValue } from "@/lib/booking-search-config";
import type { PublicLocale } from "@/lib/i18n/locale";

const PRICE_UNITS: Record<PublicLocale, Record<LuxuryRoomTypeValue, string>> = {
  en: {
    "luxury-rooms": "per room",
    "luxury-suites": "per suite",
    "luxury-royal-suites": "per royal suite",
  },
  it: {
    "luxury-rooms": "per cabina",
    "luxury-suites": "per suite",
    "luxury-royal-suites": "per Royal Suite",
  },
  de: {
    "luxury-rooms": "pro Zimmer",
    "luxury-suites": "pro Suite",
    "luxury-royal-suites": "pro Royal Suite",
  },
};

/** Display copy only; never changes a rate or a booking total. */
export function roomPriceUnit(roomType: string | null | undefined, locale: PublicLocale = "en"): string {
  const units = PRICE_UNITS[locale];
  const category = roomType && Object.hasOwn(units, roomType)
    ? roomType as LuxuryRoomTypeValue
    : classifyDbRoomType(roomType);
  return units[category ?? "luxury-rooms"];
}
