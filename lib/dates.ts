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
