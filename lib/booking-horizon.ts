/** Publish three-year booking blocks without a calendar code change in 2029. */
export function bookingHorizonYear(now = new Date()): number {
  const year = now.getUTCFullYear();
  return year < 2029 ? 2029 : 2029 + 3 * (Math.floor((year - 2029) / 3) + 1);
}

export function bookingCalendarYears(now = new Date()): number[] {
  const first = now.getUTCFullYear();
  return Array.from({ length: bookingHorizonYear(now) - first + 1 }, (_, index) => first + index);
}
