/**
 * Tripadvisor rating and reviews for the public site, read through the
 * official Tripadvisor Content API and cached for half a day.
 *
 * Shown as Tripadvisor returns them: each review keeps its author, its
 * Tripadvisor bubble rating and a link back to the review on Tripadvisor.
 *
 * Environment:
 *   TRIPADVISOR_API_KEY      server-only Content API key
 *   TRIPADVISOR_LOCATION_ID  optional; otherwise read from the listing URL
 */

import { tripadvisorUrl, type GuestReview, type GuestReviewsData } from "@/lib/guest-reviews";
import { getSiteBaseUrl } from "@/lib/public-url";

const CONTENT_API = "https://api.content.tripadvisor.com/api/v1";
const CACHE_SECONDS = 60 * 60 * 12;

type TripadvisorDetails = {
  location_id?: string;
  web_url?: string;
  write_review?: string;
  rating?: string;
  num_reviews?: string;
};

type TripadvisorReview = {
  rating?: number;
  title?: string;
  text?: string;
  url?: string;
  published_date?: string;
  user?: {
    username?: string;
    avatar?: { small?: string; thumbnail?: string };
  };
};

const TRIPADVISOR_IMAGE_HOSTS = new Set([
  "media-cdn.tripadvisor.com",
  "dynamic-media-cdn.tripadvisor.com",
]);

function tripadvisorHttps(value: string | undefined, hosts?: Set<string>): string | null {
  if (!value?.startsWith("https://")) return null;
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

/** "March 2026" — a fixed date reads correctly however long the page stays cached. */
function monthYear(iso: string | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
}

async function getJson<T>(path: string, key: string): Promise<T | null> {
  const url = `${CONTENT_API}${path}${path.includes("?") ? "&" : "?"}language=en&key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    headers: {
      accept: "application/json",
      // Keys restricted to the site's domain are checked against the referer.
      referer: `${getSiteBaseUrl()}/`,
    },
    signal: AbortSignal.timeout(6000),
    next: { revalidate: CACHE_SECONDS },
  });
  if (!res.ok) {
    let message = "";
    try {
      const body = (await res.json()) as { error?: { message?: string }; message?: string };
      message = body.error?.message ?? body.message ?? "";
    } catch {
      /* not JSON */
    }
    console.error(`[guest-reviews] Tripadvisor ${res.status}${message ? ` — ${message}` : ""}`);
    return null;
  }
  return (await res.json()) as T;
}

/** The live Tripadvisor rating and reviews, or null when there is no key or Tripadvisor does not answer. */
export async function loadTripadvisorReviews(): Promise<GuestReviewsData | null> {
  const key = process.env.TRIPADVISOR_API_KEY?.trim();
  const id = locationId();
  if (!key || !id) return null;

  try {
    const [details, list] = await Promise.all([
      getJson<TripadvisorDetails>(`/location/${id}/details`, key),
      getJson<{ data?: TripadvisorReview[] }>(`/location/${id}/reviews`, key),
    ]);
    if (!details) return null;

    const reviews = (list?.data ?? [])
      .map((review): GuestReview | null => {
        const text = review.text?.trim();
        const author = review.user?.username?.trim();
        if (!text || !author) return null;
        return {
          author,
          authorUrl: null,
          photo: tripadvisorHttps(
            review.user?.avatar?.small ?? review.user?.avatar?.thumbnail,
            TRIPADVISOR_IMAGE_HOSTS,
          ),
          rating: Math.max(0, Math.min(5, Math.round(review.rating ?? 0))),
          title: review.title?.trim() || undefined,
          text,
          when: monthYear(review.published_date),
          url: tripadvisorHttps(review.url),
        };
      })
      .filter((review): review is GuestReview => review !== null);

    const rating = Number.parseFloat(details.rating ?? "");
    const count = Number.parseInt(details.num_reviews ?? "", 10);
    return {
      source: "tripadvisor",
      rating: Number.isFinite(rating) ? rating : null,
      count: Number.isFinite(count) ? count : null,
      readUrl: tripadvisorHttps(details.web_url) ?? tripadvisorUrl() ?? "https://www.tripadvisor.com",
      writeUrl: tripadvisorHttps(details.write_review),
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
