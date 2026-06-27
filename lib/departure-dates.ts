import type { StayDurationValue } from "@/lib/booking-search-config";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { utcDateKeyFromDate } from "@/lib/dates";

export type DepartureWeekday = "Wednesday" | "Saturday";

/** Departure weekday from assets/RAW_DATA.md via hathor-catalog. */
export function departureWeekdayForDuration(
  duration: StayDurationValue,
): DepartureWeekday {
  const seed = HATHOR_CRUISES.find((entry) => entry.slug === duration);
  return seed?.departureDay ?? "Saturday";
}

export function utcDateKeyToDate(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Whether a UTC calendar day is a valid published departure day for the itinerary. */
export function isValidDepartureDateKey(
  dateKey: string,
  duration: StayDurationValue,
): boolean {
  const targetDow = departureWeekdayForDuration(duration) === "Wednesday" ? 3 : 6;
  return utcDateKeyToDate(dateKey).getUTCDay() === targetDow;
}

/** UTC midnight ISO for a yyyy-MM-dd check-in key. */
export function checkInIsoFromDateKey(dateKey: string): string {
  return utcDateKeyToDate(dateKey).toISOString();
}

export function departureDateKeyFromTime(departureTime: Date): string {
  return utcDateKeyFromDate(departureTime);
}
