/**
 * Occasions — a scheduled layer that dresses the public site for a date and
 * removes itself afterward. Times are Cairo wall-clock with an explicit
 * offset (Egypt is UTC+2 outside summer time).
 *
 * Preview before the dates: add `?occasion=<id>` to any public URL; the choice
 * holds for the browser tab. `?occasion=off` clears it.
 */
import { isAdminPath, isBookingPath } from "@/lib/floating-actions-visibility";

export type OccasionIconName = "hourglass" | "sparkle" | "boat" | "glasses" | "firework";

export type OccasionStripeItem = {
  icon: OccasionIconName;
  /** `{countdown}` becomes the live time left to `countdownTo`. */
  text: string;
  href?: string;
};

export type Occasion = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  countdownTo?: string;
  stripe: {
    mode: "glide" | "still";
    /** Glide speed in px per second. */
    speed: number;
    items: OccasionStripeItem[];
    /** Shown instead of `items` once `countdownTo` has passed. */
    itemsAfterCountdown?: OccasionStripeItem[];
    dismissible: boolean;
  };
  /** Faded fireworks inside the nav bar, masked away from the logo and tools. */
  navFireworks?: { intensity: number };
  /** Warm bulbs on a sagging wire under the nav (or under the stripe). */
  stringLights?: boolean;
  /** Days / hours / minutes / seconds under the homepage title, until `countdownTo`. */
  heroCountdown?: boolean;
};

export const OCCASIONS: Occasion[] = [
  {
    id: "new-year-2027",
    name: "New Year's Eve",
    startsAt: "2026-12-26T00:00:00+02:00",
    endsAt: "2027-01-03T00:00:00+02:00",
    countdownTo: "2027-01-01T00:00:00+02:00",
    stripe: {
      mode: "glide",
      speed: 48,
      items: [
        { icon: "hourglass", text: "2027 begins in {countdown}" },
        { icon: "sparkle", text: "Season's greetings from everyone aboard Hathor" },
        { icon: "boat", text: "Plan your 2027 Nile voyage", href: "/cruises" },
      ],
      itemsAfterCountdown: [
        { icon: "sparkle", text: "Happy New Year 2027 from everyone aboard Hathor" },
        { icon: "boat", text: "Plan your 2027 Nile voyage", href: "/cruises" },
      ],
      dismissible: true,
    },
    navFireworks: { intensity: 0.6 },
    stringLights: true,
    heroCountdown: true,
  },
];

export const OCCASION_PREVIEW_PARAM = "occasion";
export const OCCASION_PREVIEW_STORAGE_KEY = "hathor-occasion-preview";
export const OCCASION_DISMISS_STORAGE_PREFIX = "hathor-occasion-dismissed:";

export function findOccasion(id: string | null): Occasion | null {
  if (!id) return null;
  return OCCASIONS.find((occasion) => occasion.id === id) ?? null;
}

export function findScheduledOccasion(nowMs: number): Occasion | null {
  return (
    OCCASIONS.find(
      (occasion) =>
        nowMs >= Date.parse(occasion.startsAt) && nowMs < Date.parse(occasion.endsAt),
    ) ?? null
  );
}

/** Booking, checkout and admin stay undressed so nothing competes with payment. */
export function isOccasionExcludedPath(pathname: string | null): boolean {
  return isAdminPath(pathname) || isBookingPath(pathname);
}

export function msUntilCountdown(occasion: Occasion, nowMs: number): number | null {
  if (!occasion.countdownTo) return null;
  return Date.parse(occasion.countdownTo) - nowMs;
}

export function countdownParts(ms: number) {
  let s = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(s / 86400);
  s %= 86400;
  const hours = Math.floor(s / 3600);
  s %= 3600;
  return { days, hours, minutes: Math.floor(s / 60), seconds: s % 60 };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function formatCountdown(ms: number): string {
  const { days, hours, minutes, seconds } = countdownParts(ms);
  return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

export function padCountdownUnit(n: number): string {
  return pad(n);
}
