/**
 * Occasions — a scheduled layer that dresses the public site for a date and
 * removes itself afterward. Edited in Admin → Occasions and stored in
 * SiteSetting under `OCCASIONS_SETTINGS_KEY`; until the first save the public
 * site uses `DEFAULT_OCCASIONS_SETTINGS`.
 *
 * Validation (zod) lives in `occasions-schema.ts`, which only the server and the
 * dashboard load — this file is also part of every public page.
 *
 * Public pages receive switched-on occasions only. Signed-in dashboard users
 * can preview any saved occasion, even one switched off: add `?occasion=<id>`
 * to a public URL; the choice holds for the browser tab. `?occasion=off`
 * clears it. Visitors with the same link see nothing.
 */
import { isAdminPath, isBookingPath } from "@/lib/floating-actions-visibility";

export const OCCASIONS_SETTINGS_KEY = "occasions";

export const OCCASION_ICON_NAMES = [
  "sparkle",
  "star",
  "firework",
  "glasses",
  "hourglass",
  "clock",
  "boat",
  "sun",
  "hathor",
  "lotus",
  "crescent",
  "lantern",
  "tree",
  "gift",
  "bauble",
  "bell",
  "heart",
  "flag",
] as const;
export type OccasionIconName = (typeof OCCASION_ICON_NAMES)[number];

export const OCCASION_ICON_LABELS: Record<OccasionIconName, string> = {
  sparkle: "Sparkle",
  star: "Star",
  firework: "Firework",
  glasses: "Champagne",
  hourglass: "Hourglass",
  clock: "Clock",
  boat: "Dahabiya",
  sun: "Sun",
  hathor: "Sun disc",
  lotus: "Lotus",
  crescent: "Crescent",
  lantern: "Lantern",
  tree: "Tree",
  gift: "Gift",
  bauble: "Bauble",
  bell: "Bell",
  heart: "Heart",
  flag: "Flag",
};

export const OCCASION_STRIPE_MODES = ["glide", "rotate", "still"] as const;
export const OCCASION_STRIPE_STYLES = ["ink", "paper", "gold"] as const;
export const OCCASION_NAV_EFFECTS = ["none", "fireworks", "dust", "confetti", "petals"] as const;
export const OCCASION_EFFECT_PALETTES = ["festive", "jewel", "gold", "champagne", "midnight"] as const;
export const OCCASION_HANGINGS = ["none", "lights", "lanterns", "stars"] as const;

export type OccasionStripeItem = {
  icon: OccasionIconName;
  /** Uploaded image shown instead of `icon`. */
  imageUrl: string | null;
  /** `{countdown}` becomes the live time left to `countdownTo`. */
  text: string;
  href: string | null;
};

export type Occasion = {
  /** Stable id: preview links and visitors' "hide" choices are keyed on it. */
  id: string;
  name: string;
  /** Off keeps the occasion saved but never shows it (signed-in preview still works). */
  enabled: boolean;
  /** UTC ISO instants; the dashboard edits them as Cairo wall-clock time. */
  startsAt: string;
  endsAt: string;
  countdownTo: string | null;
  stripe: {
    enabled: boolean;
    mode: (typeof OCCASION_STRIPE_MODES)[number];
    style: (typeof OCCASION_STRIPE_STYLES)[number];
    /** 20–120: glide px per second, or how fast rotate changes message. */
    speed: number;
    dismissible: boolean;
    items: OccasionStripeItem[];
    /** Shown instead of `items` once `countdownTo` has passed (empty = keep items). */
    itemsAfterCountdown: OccasionStripeItem[];
  };
  navEffect: {
    type: (typeof OCCASION_NAV_EFFECTS)[number];
    /** 0.1–1: how bright it shows. */
    intensity: number;
    palette: (typeof OCCASION_EFFECT_PALETTES)[number];
    /** 0.25–2: motion speed, 1 = natural. */
    speed: number;
    /** 0.1–1: how many bursts, specks or petals at once. */
    density: number;
  };
  /** Decoration hanging under the nav (or under the stripe). */
  hanging: (typeof OCCASION_HANGINGS)[number];
  /**
   * Days and hours left of the menu-bar logo, minutes and seconds right of it,
   * until `countdownTo`. Keeps the key from when it sat under the home title.
   */
  heroCountdown: boolean;
  /** What that countdown is for, e.g. "Until New Year"; empty reads "Until <name>". */
  countdownLabel: string;
};

export type OccasionsSettings = {
  /** Order is priority: when two overlap, the first one in the list shows. */
  occasions: Occasion[];
};

export const OCCASION_LIMITS = {
  occasions: 30,
  items: 8,
  name: 80,
  /** Fits one line under the logo on a 375px phone. */
  label: 28,
  text: 160,
  url: 1024,
} as const;

export const DEFAULT_OCCASIONS_SETTINGS: OccasionsSettings = {
  occasions: [
    {
      id: "new-year-2027",
      name: "New Year's Eve",
      enabled: false,
      startsAt: "2026-12-25T22:00:00.000Z",
      endsAt: "2027-01-02T22:00:00.000Z",
      countdownTo: "2026-12-31T22:00:00.000Z",
      stripe: {
        enabled: true,
        mode: "glide",
        style: "ink",
        speed: 48,
        dismissible: true,
        items: [
          { icon: "hourglass", imageUrl: null, text: "2027 begins in {countdown}", href: null },
          {
            icon: "sparkle",
            imageUrl: null,
            text: "Season's greetings from everyone aboard Hathor",
            href: null,
          },
          { icon: "boat", imageUrl: null, text: "Plan your 2027 Nile voyage", href: "/cruises" },
        ],
        itemsAfterCountdown: [
          {
            icon: "sparkle",
            imageUrl: null,
            text: "Happy New Year 2027 from everyone aboard Hathor",
            href: null,
          },
          { icon: "boat", imageUrl: null, text: "Plan your 2027 Nile voyage", href: "/cruises" },
        ],
      },
      navEffect: { type: "fireworks", intensity: 0.75, palette: "festive", speed: 1, density: 0.6 },
      hanging: "lights",
      heroCountdown: true,
      countdownLabel: "Until New Year",
    },
  ],
};

export const OCCASION_PREVIEW_PARAM = "occasion";
export const OCCASION_PREVIEW_STORAGE_KEY = "hathor-occasion-preview";

/**
 * Admin → Occasions embeds the homepage with `?occasion-frame=1` and posts the
 * unsaved occasion into it. The frame obeys only a same-origin parent, and only
 * after the admin API confirms a dashboard session.
 */
export const OCCASION_FRAME_PARAM = "occasion-frame";
export const OCCASION_FRAME_MESSAGES = {
  /** frame → dashboard: listening, send the draft and view. */
  ready: "hathor-occasion-frame-ready",
  /** dashboard → frame: `{ occasion: Occasion | null }`. */
  draft: "hathor-occasion-draft",
  /** dashboard → frame: `{ scrolled: boolean }` to show the compact menu bar. */
  view: "hathor-occasion-view",
} as const;
export const OCCASION_DISMISS_STORAGE_PREFIX = "hathor-occasion-dismissed:";

export function findOccasion(occasions: Occasion[], id: string | null): Occasion | null {
  if (!id) return null;
  return occasions.find((occasion) => occasion.id === id) ?? null;
}

export function isOccasionRunning(occasion: Occasion, nowMs: number): boolean {
  return (
    occasion.enabled &&
    nowMs >= Date.parse(occasion.startsAt) &&
    nowMs < Date.parse(occasion.endsAt)
  );
}

export function findScheduledOccasion(occasions: Occasion[], nowMs: number): Occasion | null {
  return occasions.find((occasion) => isOccasionRunning(occasion, nowMs)) ?? null;
}

export type OccasionStatus = "off" | "live" | "scheduled" | "ended";

export function occasionStatus(occasion: Occasion, nowMs: number): OccasionStatus {
  if (!occasion.enabled) return "off";
  if (nowMs >= Date.parse(occasion.endsAt)) return "ended";
  if (nowMs >= Date.parse(occasion.startsAt)) return "live";
  return "scheduled";
}

/** Booking, checkout and admin stay undressed so nothing competes with payment. */
export function isOccasionExcludedPath(pathname: string | null): boolean {
  return isAdminPath(pathname) || isBookingPath(pathname);
}

export function msUntilCountdown(occasion: Occasion, nowMs: number): number | null {
  if (!occasion.countdownTo) return null;
  return Date.parse(occasion.countdownTo) - nowMs;
}

export function countdownCaption(occasion: Occasion): string {
  return occasion.countdownLabel.trim() || `Until ${occasion.name}`;
}

export function stripeItemsAt(occasion: Occasion, nowMs: number): OccasionStripeItem[] {
  const left = msUntilCountdown(occasion, nowMs);
  if (left !== null && left <= 0 && occasion.stripe.itemsAfterCountdown.length > 0) {
    return occasion.stripe.itemsAfterCountdown;
  }
  return occasion.stripe.items;
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

/* ---------------------------------------------------------------- Cairo time
 * Egypt switches between UTC+2 and UTC+3 (summer time), so offsets come from
 * the tz database rather than a constant. */

const CAIRO_TIME_ZONE = "Africa/Cairo";

function cairoOffsetMinutes(utcMs: number): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: CAIRO_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(utcMs));
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const wallAsUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return Math.round((wallAsUtc - Math.floor(utcMs / 60000) * 60000) / 60000);
}

/** ISO instant → "YYYY-MM-DDTHH:mm" in Cairo, for `<input type="datetime-local">`. */
export function isoToCairoLocal(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";
  const local = new Date(ms + cairoOffsetMinutes(ms) * 60000);
  return local.toISOString().slice(0, 16);
}

/** "YYYY-MM-DDTHH:mm" Cairo wall clock → UTC ISO instant (null when unreadable). */
export function cairoLocalToIso(local: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!match) return null;
  const [y, mo, d, h, mi] = match.slice(1).map(Number);
  const wall = Date.UTC(y, mo - 1, d, h, mi);
  let guess = wall - cairoOffsetMinutes(wall) * 60000;
  guess = wall - cairoOffsetMinutes(guess) * 60000;
  return new Date(guess).toISOString();
}

export function formatCairoDate(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: CAIRO_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(ms));
}
