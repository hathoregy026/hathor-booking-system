import { addDays, parseISO } from "date-fns";
import {
  findStayDurationOption,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { formatUtcDate } from "@/lib/client-dates";
import {
  checkInIsoFromDateKey,
  departureWeekdayForDuration,
} from "@/lib/departure-dates";

export const BOOKING_MODAL_YEARS = [2026, 2027] as const;

export type BookingModalYear = (typeof BOOKING_MODAL_YEARS)[number];

export const MONTH_ROW_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function embarkationLabel(duration: StayDurationValue): string {
  const option = findStayDurationOption(duration);
  if (!option) return "";
  return option.label.replace(/^⛵\s*/, "");
}

export function departureDayPlural(duration: StayDurationValue): string {
  return `${departureWeekdayForDuration(duration)}s`;
}

export function formatCheckInFromDateKey(dateKey: string | null): string {
  if (!dateKey) return "—";
  return formatUtcDate(checkInIsoFromDateKey(dateKey));
}

export function formatCheckoutFromDateKey(
  dateKey: string | null,
  duration: StayDurationValue | "",
): string {
  if (!dateKey || !duration) return "—";
  const option = findStayDurationOption(duration);
  if (!option) return "—";
  const endDate = addDays(parseISO(checkInIsoFromDateKey(dateKey)), option.nights);
  return formatUtcDate(endDate.toISOString());
}

export function utcDateKeyFromParts(year: number, monthIndex: number, day: number): string {
  const month = String(monthIndex + 1).padStart(2, "0");
  const dayPart = String(day).padStart(2, "0");
  return `${year}-${month}-${dayPart}`;
}
