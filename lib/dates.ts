import { addMinutes, isValid, parseISO } from "date-fns";

/** Parse any ISO/date string into a UTC Date (never uses local server components). */
export function parseToUtcDate(input: string): Date {
  const parsed = parseISO(input);
  if (!isValid(parsed)) {
    throw new Error(`Invalid date: ${input}`);
  }
  return new Date(parsed.toISOString());
}

/** Current instant in UTC. */
export function utcNow(): Date {
  return new Date(new Date().toISOString());
}

/** Add minutes to the current UTC instant. */
export function addUtcMinutes(minutes: number): Date {
  return addMinutes(utcNow(), minutes);
}

/** Inclusive UTC midnight start and exclusive next-day end for a calendar day. */
export function exactUtcDayBounds(iso: string): { dayStart: Date; dayEnd: Date } {
  const dayStart = parseToUtcDate(iso);
  const dayEnd = new Date(dayStart);
  dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
  return { dayStart, dayEnd };
}

/** UTC calendar date key (yyyy-MM-dd) for a Date value. */
export function utcDateKeyFromDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Start-of-day UTC ISO for a schedule departure (used as public check-in date). */
export function departureTimeToCheckInDate(departureTimeIso: string): string {
  const departure = parseToUtcDate(departureTimeIso);
  return new Date(
    Date.UTC(
      departure.getUTCFullYear(),
      departure.getUTCMonth(),
      departure.getUTCDate(),
    ),
  ).toISOString();
}
