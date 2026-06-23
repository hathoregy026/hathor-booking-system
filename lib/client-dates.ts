import { format, parseISO } from "date-fns";

/** Convert a calendar-selected date to UTC midnight ISO string. */
export function calendarDateToUtcIso(date: Date): string {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  ).toISOString();
}

export function formatUtcDate(iso: string): string {
  return format(parseISO(iso), "MMMM d, yyyy");
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function getRemainingSeconds(expiresAtIso: string | null): number {
  if (!expiresAtIso) return 0;
  const diff = new Date(expiresAtIso).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}

export function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
