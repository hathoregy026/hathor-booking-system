/**
 * Tripadvisor rating and reviews for the public site, read through the
 * official Tripadvisor API (Terra) and cached for a week.
 *
 * Shown as Tripadvisor returns them: each review keeps its author, its
 * Tripadvisor bubble rating and a link back to the review on Tripadvisor.
 *
 * Environment:
 *   TRIPADVISOR_API_KEY      server-only Tripadvisor API key
 *   TRIPADVISOR_LOCATION_ID  optional; otherwise read from the listing URL
 */

import { tripadvisorUrl, type GuestReview, type GuestReviewsData } from "@/lib/guest-reviews";

const TERRA_API = "https://terra.tripadvisor.com/api";
/* Weekly: the free Tripadvisor allowance is one-time, not monthly, and
   reviews there change slowly — two calls a week keeps it for years. */
const CACHE_SECONDS = 60 * 60 * 24 * 7;
const REVIEW_COUNT = 10;

type TripadvisorUrls = {
  main?: string;
  write_review?: string;
};

type TripadvisorLocation = {
  traveler_ratings?: {
    overall?: { rating?: number | string; count?: number | string };
  };
  urls?: { tripadvisor?: TripadvisorUrls };
};

/* Review field names are read defensively: the API documents the shape
   loosely, so every likely spelling is accepted. */
type TripadvisorReview = {
  rating?: unknown;
  title?: unknown;
  text?: unknown;
  body?: unknown;
  url?: string;
  urls?: { tripadvisor?: string | { main?: string } };
  publish_ts?: number | string;
  published_date?: string;
  publish_date?: string;
  user?: {
    username?: unknown;
    display_name?: unknown;
    name?: unknown;
    avatar?: string | { url?: string; small?: string; thumbnail?: string };
    avatar_url?: string;
  };
};

/** Tripadvisor's photo hosts; the site's image policy (next.config.ts) allows the same. */
const TRIPADVISOR_IMAGE_HOST = /(^|\.)(tripadvisor\.com|tacdn\.com)$/i;

function tripadvisorHttps(value: unknown, hosts?: Set<string>): string | null {
  if (typeof value !== "string" || !value.startsWith("https://")) return null;
  try {
    const host = new URL(value).hostname;
    if (hosts) return hosts.has(host) ? value : null;
    return /(^|\.)tripadvisor\.[a-z.]+$/i.test(host) ? value : null;
  } catch {
    return null;
  }
}

function locationId(): string | null {
  const pinned = process.env.TRIPADVISOR_LOCATION_ID?.trim();
  if (pinned && /^\d+$/.test(pinned)) return pinned;
  const fromUrl = tripadvisorUrl()?.match(/-d(\d+)-/)?.[1];
  return fromUrl ?? null;
}

/** Text that may arrive as a string, a {text|value|…} object or a list of those. */
function plain(value: unknown, depth = 0): string {
  if (typeof value === "string") return value.trim();
  if (depth > 3 || value == null || typeof value !== "object") return "";
  if (Array.isArray(value)) {
    for (const item of value) {
      const text = plain(item, depth + 1);
      if (text) return text;
    }
    return "";
  }
  const record = value as Record<string, unknown>;
  for (const field of ["text", "value", "content", "original", "translated", "en", "name", "username", "display_name"]) {
    const text = plain(record[field], depth + 1);
    if (text) return text;
  }
  return "";
}

/** The shape (keys, types and link hosts, never the text) of a review, for the build log. */
function describe(value: unknown, depth = 0): unknown {
  if (typeof value === "string" && value.startsWith("https://")) {
    try {
      return `url:${new URL(value).hostname}`;
    } catch {
      return "string";
    }
  }
  if (value == null || typeof value !== "object") return typeof value;
  if (depth > 4) return Array.isArray(value) ? "array" : "object";
  if (Array.isArray(value)) return [describe(value[0], depth + 1)];
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, describe(v, depth + 1)]),
  );
}

function toNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : null;
}

/** "March 2026" — a fixed date reads correctly however long the page stays cached. */
function monthYear(value: number | string | undefined): string {
  if (value == null || value === "") return "";
  let date: Date;
  if (typeof value === "number" || /^\d+$/.test(value)) {
    const n = Number(value);
    // Seconds or milliseconds since 1970.
    date = new Date(n < 1e12 ? n * 1000 : n);
  } else {
    date = new Date(value);
  }
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

async function getJson<T>(path: string, key: string): Promise<T | null> {
  const res = await fetch(`${TERRA_API}${path}`, {
    headers: { accept: "application/json", "X-API-Key": key },
    signal: AbortSignal.timeout(6000),
    next: { revalidate: CACHE_SECONDS },
  });
  if (!res.ok) {
    let message = "";
    try {
      message = (await res.text()).replace(/\s+/g, " ").slice(0, 300);
    } catch {
      /* no body */
    }
    console.error(`[guest-reviews] Tripadvisor ${res.status} ${path}${message ? ` — ${message}` : ""}`);
    return null;
  }
  return (await res.json()) as T;
}

/** The reviewer's photo, wherever in the user record Tripadvisor puts it. */
function reviewAvatar(user: unknown, depth = 0): string | null {
  if (typeof user === "string") {
    if (!user.startsWith("https://")) return null;
    try {
      return TRIPADVISOR_IMAGE_HOST.test(new URL(user).hostname) ? user : null;
    } catch {
      return null;
    }
  }
  if (depth > 4 || user == null || typeof user !== "object") return null;
  const entries = Array.isArray(user)
    ? user.map((value) => ["", value] as const)
    : Object.entries(user as Record<string, unknown>);
  /* Prefer a small size when several are offered. */
  const ordered = [...entries].sort(([a], [b]) => rank(a) - rank(b));
  for (const [, value] of ordered) {
    const found = reviewAvatar(value, depth + 1);
    if (found) return found;
  }
  return null;
}

function rank(key: string): number {
  if (/avatar|photo|image|picture/i.test(key)) return 0;
  if (/small|thumb|medium/i.test(key)) return 1;
  if (/large|original/i.test(key)) return 3;
  return 2;
}

function reviewUrl(review: TripadvisorReview): string | null {
  const nested = review.urls?.tripadvisor;
  return tripadvisorHttps(review.url ?? (typeof nested === "string" ? nested : nested?.main));
}

/** The live Tripadvisor rating and reviews, or null when there is no key or Tripadvisor does not answer. */
export async function loadTripadvisorReviews(): Promise<GuestReviewsData | null> {
  const key = process.env.TRIPADVISOR_API_KEY?.trim();
  const id = locationId();
  if (!key || !id) return null;

  try {
    const [location, list] = await Promise.all([
      getJson<TripadvisorLocation>(`/locations/${id}`, key),
      getJson<{ data?: TripadvisorReview[] }>(
        `/locations/${id}/reviews?page=1&size=${REVIEW_COUNT}`,
        key,
      ),
    ]);
    if (!location) return null;

    const raw = Array.isArray(list?.data) ? list.data : [];
    const reviews = raw
      .map((review): GuestReview | null => {
        const text = plain(review.text) || plain(review.body);
        const author =
          plain(review.user?.username) || plain(review.user?.display_name) || plain(review.user?.name);
        if (!text || !author) return null;
        return {
          author,
          authorUrl: null,
          photo: reviewAvatar(review.user?.avatar ?? review.user?.avatar_url ?? review.user),
          rating: Math.max(0, Math.min(5, Math.round(toNumber(review.rating) ?? 0))),
          title: plain(review.title) || undefined,
          text,
          when: monthYear(review.publish_ts ?? review.published_date ?? review.publish_date),
          url: reviewUrl(review),
        };
      })
      .filter((review): review is GuestReview => review !== null);
    console.log(
      `[guest-reviews] Tripadvisor returned ${raw.length} reviews, showing ${reviews.length}, ` +
        `${reviews.filter((review) => review.photo).length} with photos`,
    );
    if (raw.length && reviews.some((review) => !review.photo)) {
      console.log(`[guest-reviews] Tripadvisor review shape: ${JSON.stringify(describe(raw[0]))}`);
    }

    const overall = location.traveler_ratings?.overall;
    const count = toNumber(overall?.count);
    const urls = location.urls?.tripadvisor;
    return {
      source: "tripadvisor",
      rating: toNumber(overall?.rating),
      count: count == null ? null : Math.round(count),
      readUrl: tripadvisorHttps(urls?.main) ?? tripadvisorUrl() ?? "https://www.tripadvisor.com",
      writeUrl: tripadvisorHttps(urls?.write_review),
      reviews,
    };
  } catch (error) {
    console.error(
      "[guest-reviews] Tripadvisor request failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}
