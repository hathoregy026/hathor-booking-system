import {
  classifyDbRoomType,
  durationSupportsRoomType,
  type LuxuryRoomTypeValue,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import {
  HATHOR_AMENITIES,
  HATHOR_CRUISES,
  type HathorCruiseSeed,
} from "@/lib/hathor-catalog";
import {
  getMaxCapacityForLuxuryType,
  MAX_GUESTS_PER_ROOM,
} from "@/lib/room-capacity";
import { findRoomShowcase, type RoomShowcase } from "@/lib/room-showcase";
import {
  CHARTER_SLUG,
  favoriteKey,
  type FavoriteRef,
  type FavoritesState,
  type VoyageSelectionState,
} from "@/lib/selection-types";

/**
 * Presentation resolver for Favorites and My Voyage.
 *
 * Authority split (agreed):
 * - This module resolves what the guest SEES — names, routes, durations and
 *   indicative catalog prices — from the same static catalog the marketing
 *   pages already render.
 * - The database / API stays authoritative for live availability and for the
 *   final price of an actual booking. Nothing here is a booking price, and no
 *   price is ever read back out of localStorage.
 */

/**
 * Primary residence classifier. `ROOM_SHOWCASES[].amenities` is assigned the
 * `HATHOR_AMENITIES.*` arrays BY REFERENCE, so identity is an exact, existing
 * link between the marketing showcase and the catalog tier — no new mapping
 * table, nothing to keep in sync.
 */
const AMENITIES_TO_LUXURY_TYPE: ReadonlyArray<
  readonly [readonly string[], LuxuryRoomTypeValue]
> = [
  [HATHOR_AMENITIES.luxuryRooms, "luxury-rooms"],
  [HATHOR_AMENITIES.luxurySuites, "luxury-suites"],
  [HATHOR_AMENITIES.luxuryRoyalSuites, "luxury-royal-suites"],
];

export function luxuryTypeForResidence(
  residence: RoomShowcase,
): LuxuryRoomTypeValue | null {
  for (const [amenities, luxuryType] of AMENITIES_TO_LUXURY_TYPE) {
    if (residence.amenities === amenities) return luxuryType;
  }
  /* Fallback if a showcase ever inlines its own amenity list. */
  return classifyDbRoomType(residence.name);
}

/* ------------------------------------------------------------------ */
/* Voyage resolution                                                    */
/* ------------------------------------------------------------------ */

export function findVoyage(slug: string): HathorCruiseSeed | null {
  return HATHOR_CRUISES.find((cruise) => cruise.slug === slug) ?? null;
}

export function isKnownVoyageSlug(slug: string): slug is StayDurationValue {
  return findVoyage(slug) !== null;
}

/* ------------------------------------------------------------------ */
/* Residence resolution                                                 */
/* ------------------------------------------------------------------ */

export function findResidence(slug: string): RoomShowcase | null {
  return findRoomShowcase(slug) ?? null;
}

export function isKnownResidenceSlug(slug: string): boolean {
  return findResidence(slug) !== null;
}

export function luxuryTypeForResidenceSlug(
  slug: string,
): LuxuryRoomTypeValue | null {
  const residence = findResidence(slug);
  return residence ? luxuryTypeForResidence(residence) : null;
}

/* ------------------------------------------------------------------ */
/* Cabin pairs — the twelve sellable listings on /cruises-list          */
/* ------------------------------------------------------------------ */

/**
 * A "cabin" is one itinerary paired with one cabin: 3 voyages x 4 cabins = the
 * twelve products a guest actually books. The pair is carried as a single
 * composite slug so FavoriteRef stays {type, slug, addedAt}.
 */
export const CABIN_SLUG_SEPARATOR = "::";

export function buildCabinSlug(
  voyageSlug: string,
  residenceSlug: string,
): string {
  return `${voyageSlug}${CABIN_SLUG_SEPARATOR}${residenceSlug}`;
}

export function parseCabinSlug(
  slug: string,
): { voyageSlug: string; residenceSlug: string } | null {
  const parts = slug.split(CABIN_SLUG_SEPARATOR);
  if (parts.length !== 2) return null;
  const [voyageSlug, residenceSlug] = parts;
  if (!voyageSlug || !residenceSlug) return null;
  if (!isKnownVoyageSlug(voyageSlug)) return null;
  if (!isKnownResidenceSlug(residenceSlug)) return null;
  return { voyageSlug, residenceSlug };
}

/**
 * Catalog cabin NAME to marketing residence slug — a genuine 1:1 map.
 *
 * Note this keys on `room.name` ("Luxury King Bed"), not `room.roomType`
 * ("Luxury Room"). The name distinguishes king from twin; the type does not.
 * Built by matching the catalog against ROOM_SHOWCASES rather than hand-listing
 * pairs, so a renamed showcase surfaces as an unresolved cabin instead of a
 * silently wrong one.
 */
const RESIDENCE_SLUG_BY_CABIN_NAME: Record<string, string> = {
  "luxury king bed": "luxury-king-room",
  "luxury twin bed": "luxury-twin-room",
  "luxury suite": "luxury-suite",
  "luxury royal suite": "royal-suite",
};

export function residenceSlugForCabinName(cabinName: string): string | null {
  const slug = RESIDENCE_SLUG_BY_CABIN_NAME[cabinName.trim().toLowerCase()];
  if (!slug) return null;
  return isKnownResidenceSlug(slug) ? slug : null;
}

/** Composite slug for a /cruises-list card, or null if it cannot be resolved. */
export function cabinSlugForListing(
  voyageSlug: string,
  cabinName: string,
): string | null {
  if (!isKnownVoyageSlug(voyageSlug)) return null;
  const residenceSlug = residenceSlugForCabinName(cabinName);
  if (!residenceSlug) return null;
  return buildCabinSlug(voyageSlug, residenceSlug);
}

/* ------------------------------------------------------------------ */
/* Compatibility — reuses the existing predicate, never re-implements it */
/* ------------------------------------------------------------------ */

export function isVoyageResidenceCompatible(
  voyageSlug: StayDurationValue | null,
  roomType: LuxuryRoomTypeValue | null,
): boolean {
  if (!voyageSlug || !roomType) return true;
  return durationSupportsRoomType(voyageSlug, roomType);
}

/**
 * Indicative catalog price for a journey + tier, in integer cents.
 *
 * Display only. Returns null unless BOTH a journey and a tier are known, because
 * a residence has no price until an itinerary is chosen — the three itineraries
 * carry three different price tables. Never summed, never persisted, never sent
 * to the server as an authoritative amount.
 */
export function indicativeFromPriceCents(
  voyageSlug: StayDurationValue | null,
  roomType: LuxuryRoomTypeValue | null,
): number | null {
  if (!voyageSlug || !roomType) return null;

  const voyage = findVoyage(voyageSlug);
  if (!voyage) return null;

  const prices = voyage.rooms
    .filter((room) => classifyDbRoomType(room.roomType) === roomType)
    .map((room) => room.priceCents)
    .filter((cents) => Number.isFinite(cents) && cents > 0);

  return prices.length ? Math.min(...prices) : null;
}

/* ------------------------------------------------------------------ */
/* Pruning — obsolete slugs are dropped, never rendered, never crash     */
/* ------------------------------------------------------------------ */

export function isFavoriteResolvable(ref: FavoriteRef): boolean {
  switch (ref.type) {
    case "voyage":
      return isKnownVoyageSlug(ref.slug);
    case "residence":
      return isKnownResidenceSlug(ref.slug);
    case "charter":
      return ref.slug === CHARTER_SLUG;
    case "cabin":
      return parseCabinSlug(ref.slug) !== null;
    default:
      return false;
  }
}

/**
 * Drop favorites whose slug no longer resolves in the catalog (renamed voyage,
 * retired residence, a key hand-edited in devtools). Returns the SAME object
 * when nothing changed, so callers can skip a needless write and re-render.
 */
export function pruneFavorites(state: FavoritesState): FavoritesState {
  const seen = new Set<string>();
  const items: FavoriteRef[] = [];

  for (const ref of state.items) {
    if (!isFavoriteResolvable(ref)) continue;
    const key = favoriteKey(ref);
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(ref);
  }

  return items.length === state.items.length ? state : { ...state, items };
}

function clampGuestCount(
  value: number | null,
  min: number,
  max: number,
): number | null {
  if (value === null) return null;
  if (!Number.isFinite(value)) return null;
  return Math.max(min, Math.min(Math.trunc(value), max));
}

/**
 * Bring a persisted My Voyage selection back to something the current catalog
 * can actually render:
 *
 * - unknown journey slug        → journey cleared
 * - unknown residence slug      → residence and tier cleared
 * - tier always re-derived from the residence (residence is the source of truth)
 * - journey + residence no longer compatible → residence cleared, journey kept
 *   (the guest chose the journey first in the overwhelming majority of flows,
 *   and clearing both would erase more than the catalog change justifies)
 * - guest counts clamped to the existing RAW_DATA capacity for the tier
 *
 * Returns the SAME object when nothing changed.
 */
export function pruneVoyageSelection(
  state: VoyageSelectionState,
): VoyageSelectionState {
  let voyageSlug = state.voyageSlug;
  let residenceSlug = state.residenceSlug;

  if (voyageSlug !== null && !isKnownVoyageSlug(voyageSlug)) {
    voyageSlug = null;
  }

  if (residenceSlug !== null && !isKnownResidenceSlug(residenceSlug)) {
    residenceSlug = null;
  }

  let roomType = residenceSlug
    ? luxuryTypeForResidenceSlug(residenceSlug)
    : null;

  if (!isVoyageResidenceCompatible(voyageSlug, roomType)) {
    residenceSlug = null;
    roomType = null;
  }

  const maxGuests = roomType
    ? getMaxCapacityForLuxuryType(roomType)
    : MAX_GUESTS_PER_ROOM;

  const adults = clampGuestCount(state.adults, 1, maxGuests);
  const children = clampGuestCount(
    state.children,
    0,
    Math.max(0, maxGuests - (adults ?? 1)),
  );

  const charter = state.charter === true;

  const unchanged =
    voyageSlug === state.voyageSlug &&
    residenceSlug === state.residenceSlug &&
    roomType === state.roomType &&
    adults === state.adults &&
    children === state.children &&
    charter === state.charter;

  if (unchanged) return state;

  return {
    ...state,
    voyageSlug,
    residenceSlug,
    roomType,
    adults,
    children,
    charter,
  };
}

/* ------------------------------------------------------------------ */
/* Display resolution — everything the Favorites panel renders          */
/* ------------------------------------------------------------------ */

/**
 * Voyage imagery lives in the Site Images CMS. The canonical slug→slot map is
 * `IMAGE_SLOT_BY_SLUG` in lib/homepage-accordion-cruises.ts, which cannot be
 * imported here: that module pulls in `next/cache`, `react.cache` and the CMS
 * client, and would drag the server graph into a client bundle. This mirrors
 * the same four slot names — presentation only, no compatibility or pricing
 * logic is duplicated.
 */
const VOYAGE_IMAGE_SLOT_BY_SLUG: Record<string, string> = {
  "3-nights-aswan-luxor": "home-voyage-3n-aswan-luxor",
  "4-nights-luxor-aswan": "home-voyage-4n-luxor-aswan",
  "7-nights-luxor-aswan-luxor": "home-voyage-7n-roundtrip",
};

const CHARTER_IMAGE_SLOT = "home-voyage-nile-majesty";

/** A static file under /public, or a CMS-managed Site Images slot. */
export type ResolvedFavoriteImage =
  | { kind: "static"; src: string }
  | { kind: "slot"; name: string };

export type ResolvedFavorite = {
  /** Stable list key — same shape as the storage set key. */
  key: string;
  ref: FavoriteRef;
  title: string;
  /** Human category, e.g. "Luxury Suite", "Voyage", "Private Charter". */
  typeLabel: string;
  /** Route, duration, size — whatever the catalog genuinely provides. */
  meta: string | null;
  href: string;
  image: ResolvedFavoriteImage;
};

const LUXURY_TYPE_LABEL: Record<LuxuryRoomTypeValue, string> = {
  "luxury-rooms": "Luxury Room",
  "luxury-suites": "Luxury Suite",
  "luxury-royal-suites": "Royal Suite",
};

/**
 * Resolve one saved reference against the LIVE catalog.
 *
 * Returns null when the slug no longer names anything — the panel drops it
 * rather than rendering a placeholder. Nothing here reads from storage, so a
 * stale title, image or route can never be displayed.
 *
 * Deliberately carries NO price. A residence has no price until an itinerary is
 * chosen (three itineraries, three price tables), and a booking price is the
 * server's to state — never the browser's.
 */
export function resolveFavorite(ref: FavoriteRef): ResolvedFavorite | null {
  const key = favoriteKey(ref);

  if (ref.type === "charter") {
    if (ref.slug !== CHARTER_SLUG) return null;
    return {
      key,
      ref,
      title: "Private Charter",
      typeLabel: "Charter",
      meta: "The Dahabiya, yours alone",
      href: "/charter",
      image: { kind: "slot", name: CHARTER_IMAGE_SLOT },
    };
  }

  if (ref.type === "cabin") {
    const pair = parseCabinSlug(ref.slug);
    if (!pair) return null;

    const voyage = findVoyage(pair.voyageSlug);
    const residence = findResidence(pair.residenceSlug);
    if (!voyage || !residence) return null;

    return {
      key,
      ref,
      title: residence.name,
      typeLabel: "Cabin · Voyage",
      meta: `${voyage.nights} Nights / ${voyage.days} Days · ${voyage.ports} · Up to ${residence.capacity} guests`,
      href: "/cruises-list",
      image: { kind: "static", src: residence.images[0] ?? "" },
    };
  }

  if (ref.type === "voyage") {
    const voyage = findVoyage(ref.slug);
    if (!voyage) return null;

    const slot = VOYAGE_IMAGE_SLOT_BY_SLUG[voyage.slug];

    return {
      key,
      ref,
      title: voyage.ports,
      typeLabel: "Voyage",
      meta: `${voyage.nights} Nights / ${voyage.days} Days · Departs ${voyage.departureDay}`,
      href: "/cruises-list",
      image: slot
        ? { kind: "slot", name: slot }
        : { kind: "slot", name: CHARTER_IMAGE_SLOT },
    };
  }

  const residence = findResidence(ref.slug);
  if (!residence) return null;

  const luxuryType = luxuryTypeForResidence(residence);

  return {
    key,
    ref,
    title: residence.name,
    typeLabel: luxuryType ? LUXURY_TYPE_LABEL[luxuryType] : "Residence",
    meta: `${residence.sizeSqm} m² · Up to ${residence.capacity} guests`,
    href: `/rooms/${residence.slug}`,
    image: { kind: "static", src: residence.images[0] ?? "" },
  };
}

/** Newest first. Unresolvable references are dropped silently. */
export function resolveFavorites(state: FavoritesState): ResolvedFavorite[] {
  return state.items
    .map(resolveFavorite)
    .filter((item): item is ResolvedFavorite => item !== null)
    .sort((left, right) => right.ref.addedAt - left.ref.addedAt);
}
