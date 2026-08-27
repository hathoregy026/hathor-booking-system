import type {
  LuxuryRoomTypeValue,
  StayDurationValue,
} from "@/lib/booking-search-config";

/**
 * Guest selection systems — Favorites and My Voyage.
 *
 * Design rules baked into these types:
 *
 * 1. Persisted state stores STABLE CATALOG SLUGS ONLY — never a database cuid.
 *    `Cruise.id` / `Room.id` are cuids that differ per environment and re-seed,
 *    so a cuid written into a visitor's browser is guaranteed to rot.
 * 2. Persisted state stores NO prices, titles, images or availability. Those are
 *    resolved from the catalog at render time (lib/selection-catalog.ts), and
 *    final booking pricing always comes from the server.
 * 3. The persisted shape is versioned. Bump `SELECTION_SCHEMA_VERSION` and the
 *    storage keys together whenever this shape changes.
 */

export const SELECTION_SCHEMA_VERSION = 1;

export const FAVORITES_STORAGE_KEY = "hathor:favorites:v1";
export const VOYAGE_STORAGE_KEY = "hathor:voyage:v1";

/** Private Charter has no catalog record — this is its synthetic stable slug. */
export const CHARTER_SLUG = "private-charter";

export type FavoriteType = "voyage" | "residence" | "charter";

export const FAVORITE_TYPES: readonly FavoriteType[] = [
  "voyage",
  "residence",
  "charter",
];

export function isFavoriteType(value: unknown): value is FavoriteType {
  return (
    typeof value === "string" &&
    (FAVORITE_TYPES as readonly string[]).includes(value)
  );
}

export interface FavoriteRef {
  type: FavoriteType;
  /** `HATHOR_CRUISES[].slug`, `ROOM_SHOWCASES[].slug`, or `CHARTER_SLUG`. */
  slug: string;
  /** Epoch ms. Used for ordering only — never rendered as a date. */
  addedAt: number;
}

export interface FavoritesState {
  v: typeof SELECTION_SCHEMA_VERSION;
  items: FavoriteRef[];
}

/**
 * My Voyage — one journey plus one preferred residence (V1).
 *
 * Multi-room configuration deliberately stays in the existing BookingModal /
 * booking flow, which already handles up to four room configs. This is the
 * concierge brief, not a room manifest.
 */
export interface VoyageSelectionState {
  v: typeof SELECTION_SCHEMA_VERSION;
  /** Reuses the existing itinerary union — no parallel model. */
  voyageSlug: StayDurationValue | null;
  /** `ROOM_SHOWCASES[].slug`. */
  residenceSlug: string | null;
  /** Derived from `residenceSlug`; reuses the existing booking union. */
  roomType: LuxuryRoomTypeValue | null;
  adults: number | null;
  children: number | null;
  charter: boolean;
  updatedAt: number;
}

/**
 * Stable module-level identities. These are the server snapshots, so they must
 * never be mutated and must never be rebuilt per call — a new object each read
 * makes `useSyncExternalStore` loop forever.
 */
export const EMPTY_FAVORITES: FavoritesState = Object.freeze<FavoritesState>({
  v: SELECTION_SCHEMA_VERSION,
  items: [],
});

export const EMPTY_VOYAGE_SELECTION: VoyageSelectionState =
  Object.freeze<VoyageSelectionState>({
    v: SELECTION_SCHEMA_VERSION,
    voyageSlug: null,
    residenceSlug: null,
    roomType: null,
    adults: null,
    children: null,
    charter: false,
    updatedAt: 0,
  });

/** Set key for Favorites — the reason duplicates are impossible by construction. */
export function favoriteKey(ref: Pick<FavoriteRef, "type" | "slug">): string {
  return `${ref.type}:${ref.slug}`;
}

/**
 * Meaningful selections only — journey, residence, charter. Deliberately NOT a
 * room or guest count, so the indicator never reads as an ecommerce cart.
 */
export function voyageSelectionCount(state: VoyageSelectionState): number {
  let count = 0;
  if (state.voyageSlug) count += 1;
  if (state.residenceSlug) count += 1;
  if (state.charter) count += 1;
  return count;
}

export function isVoyageSelectionEmpty(state: VoyageSelectionState): boolean {
  return voyageSelectionCount(state) === 0;
}
