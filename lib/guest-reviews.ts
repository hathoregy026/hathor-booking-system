/**
 * Guest reviews for the public site, read live from Google through the
 * official Places API (New) and cached for half a day.
 *
 * Google and Tripadvisor only allow their reviews to be shown through their
 * own tools, so nothing here is copied or edited: the rating, count and the
 * reviews Google returns are shown as given, each attributed to its author and
 * linked back to Google.
 *
 * Environment:
 *   GOOGLE_PLACES_API_KEY  server-only key with the Places API (New) enabled
 *   GOOGLE_PLACE_ID        optional; pins the listing (otherwise found by name)
 *   TRIPADVISOR_URL        optional; the Hathor listing on Tripadvisor
 */

const PLACES_ENDPOINT = "https://places.googleapis.com/v1";
const SEARCH_QUERY = "Hathor Dahabiya cruise";
const CACHE_SECONDS = 60 * 60 * 12;
const FIELDS = [
  "id",
  "rating",
  "userRatingCount",
  "googleMapsUri",
  "reviews",
];

/** Where "read the reviews" goes when the API cannot say (no key yet). */
export const GOOGLE_REVIEWS_FALLBACK_URL =
  "https://www.google.com/search?q=Hathor+Dahabiya+cruise";

export type GuestReview = {
  author: string;
  authorUrl: string | null;
  /** The reviewer's Google profile photo (googleusercontent.com only). */
  photo: string | null;
  rating: number;
  text: string;
  when: string;
  url: string | null;
};

export type GuestReviewsData = {
  rating: number | null;
  count: number | null;
  readUrl: string;
  writeUrl: string | null;
  reviews: GuestReview[];
};

type PlacesReview = {
  rating?: number;
  text?: { text?: string };
  originalText?: { text?: string };
  relativePublishTimeDescription?: string;
  googleMapsUri?: string;
  authorAttribution?: { displayName?: string; uri?: string; photoUri?: string };
};

type PlacesPlace = {
  id?: string;
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
};

export function tripadvisorUrl(): string | null {
  const raw = process.env.TRIPADVISOR_URL?.trim();
  return raw && /^https:\/\/([a-z0-9-]+\.)*tripadvisor\.[a-z.]+\//i.test(raw) ? raw : null;
}

async function fetchPlace(key: string): Promise<PlacesPlace | null> {
  const pinned = process.env.GOOGLE_PLACE_ID?.trim();
  const init = {
    signal: AbortSignal.timeout(6000),
    next: { revalidate: CACHE_SECONDS },
  };

  if (pinned) {
    const res = await fetch(
      `${PLACES_ENDPOINT}/places/${encodeURIComponent(pinned)}?languageCode=en`,
      {
        ...init,
        headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELDS.join(",") },
      },
    );
    return res.ok ? ((await res.json()) as PlacesPlace) : null;
  }

  const res = await fetch(`${PLACES_ENDPOINT}/places:searchText`, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": FIELDS.map((field) => `places.${field}`).join(","),
    },
    body: JSON.stringify({ textQuery: SEARCH_QUERY, languageCode: "en", pageSize: 1 }),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { places?: PlacesPlace[] };
  return body.places?.[0] ?? null;
}

function httpsOrNull(value: string | undefined): string | null {
  return value && value.startsWith("https://") ? value : null;
}

/** Only Google's own photo host, which the site's image policy allows. */
function googlePhotoOrNull(value: string | undefined): string | null {
  const url = httpsOrNull(value);
  if (!url) return null;
  try {
    return new URL(url).hostname === "lh3.googleusercontent.com" ? url : null;
  } catch {
    return null;
  }
}

/** The live Google rating and reviews, or null when there is no key or Google does not answer. */
export async function loadGuestReviews(): Promise<GuestReviewsData | null> {
  const key = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!key) return null;

  try {
    const place = await fetchPlace(key);
    if (!place?.id) return null;

    const reviews = (place.reviews ?? [])
      .map((review): GuestReview | null => {
        const text = (review.text?.text ?? review.originalText?.text ?? "").trim();
        const author = review.authorAttribution?.displayName?.trim();
        if (!text || !author) return null;
        return {
          author,
          authorUrl: httpsOrNull(review.authorAttribution?.uri),
          photo: googlePhotoOrNull(review.authorAttribution?.photoUri),
          rating: Math.max(0, Math.min(5, Math.round(review.rating ?? 0))),
          text,
          when: review.relativePublishTimeDescription ?? "",
          url: httpsOrNull(review.googleMapsUri),
        };
      })
      .filter((review): review is GuestReview => review !== null);

    return {
      rating: typeof place.rating === "number" ? place.rating : null,
      count: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
      readUrl: httpsOrNull(place.googleMapsUri) ?? GOOGLE_REVIEWS_FALLBACK_URL,
      writeUrl: `https://search.google.com/local/writereview?placeid=${encodeURIComponent(place.id)}`,
      reviews,
    };
  } catch {
    return null;
  }
}
