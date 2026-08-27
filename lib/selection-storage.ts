import type { LuxuryRoomTypeValue } from "@/lib/booking-search-config";
import {
  EMPTY_FAVORITES,
  EMPTY_VOYAGE_SELECTION,
  FAVORITES_STORAGE_KEY,
  favoriteKey,
  isFavoriteType,
  SELECTION_SCHEMA_VERSION,
  VOYAGE_STORAGE_KEY,
  type FavoriteRef,
  type FavoritesState,
  type VoyageSelectionState,
} from "@/lib/selection-types";

/**
 * Persistence for Favorites and My Voyage.
 *
 * Contract:
 * - Every read and every write is wrapped. Private mode, disabled site data, a
 *   full quota and a hand-edited key must all degrade to "no saved selection",
 *   never to a thrown error.
 * - This module validates SHAPE only (is it our version, are the fields the
 *   right primitive types). Whether a slug still exists in the catalog is
 *   decided by lib/selection-catalog.ts, so storage stays free of product data.
 * - Returns the shared EMPTY_* constants on the server and on any failure, so
 *   the server snapshot has a stable identity.
 */

const MAX_FAVORITES = 60;
const MAX_SLUG_LENGTH = 80;

const LUXURY_ROOM_TYPE_VALUES: readonly LuxuryRoomTypeValue[] = [
  "luxury-rooms",
  "luxury-suites",
  "luxury-royal-suites",
];

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    /* Site data blocked by the browser. */
    return null;
  }
}

function readJson(key: string): unknown {
  const storage = getStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    /* Corrupt or hand-edited value — treat as absent. */
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    /* Quota exceeded or storage disabled — selections stay in memory only. */
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasCurrentVersion(value: Record<string, unknown>): boolean {
  return value.v === SELECTION_SCHEMA_VERSION;
}

function asSlug(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_SLUG_LENGTH) return null;
  return trimmed;
}

function asTimestamp(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : 0;
}

function asCount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const truncated = Math.trunc(value);
  return truncated >= 0 ? truncated : null;
}

function asLuxuryRoomType(value: unknown): LuxuryRoomTypeValue | null {
  return typeof value === "string" &&
    (LUXURY_ROOM_TYPE_VALUES as readonly string[]).includes(value)
    ? (value as LuxuryRoomTypeValue)
    : null;
}

/* ------------------------------------------------------------------ */
/* Favorites                                                            */
/* ------------------------------------------------------------------ */

function parseFavorites(value: unknown): FavoritesState {
  if (!isRecord(value) || !hasCurrentVersion(value)) return EMPTY_FAVORITES;
  if (!Array.isArray(value.items)) return EMPTY_FAVORITES;

  const seen = new Set<string>();
  const items: FavoriteRef[] = [];

  for (const entry of value.items) {
    if (items.length >= MAX_FAVORITES) break;
    if (!isRecord(entry)) continue;

    const type = entry.type;
    if (!isFavoriteType(type)) continue;

    const slug = asSlug(entry.slug);
    if (!slug) continue;

    const key = favoriteKey({ type, slug });
    if (seen.has(key)) continue;
    seen.add(key);

    items.push({ type, slug, addedAt: asTimestamp(entry.addedAt) });
  }

  return items.length ? { v: SELECTION_SCHEMA_VERSION, items } : EMPTY_FAVORITES;
}

export function readFavorites(): FavoritesState {
  return parseFavorites(readJson(FAVORITES_STORAGE_KEY));
}

export function writeFavorites(state: FavoritesState): void {
  writeJson(FAVORITES_STORAGE_KEY, state);
}

/* ------------------------------------------------------------------ */
/* My Voyage                                                            */
/* ------------------------------------------------------------------ */

function parseVoyageSelection(value: unknown): VoyageSelectionState {
  if (!isRecord(value) || !hasCurrentVersion(value)) {
    return EMPTY_VOYAGE_SELECTION;
  }

  return {
    v: SELECTION_SCHEMA_VERSION,
    /*
     * Cast is safe: the catalog prune immediately after this drops any slug that
     * is not a real itinerary, so an invalid string can never reach the UI.
     */
    voyageSlug: (asSlug(value.voyageSlug) ??
      null) as VoyageSelectionState["voyageSlug"],
    residenceSlug: asSlug(value.residenceSlug),
    roomType: asLuxuryRoomType(value.roomType),
    adults: asCount(value.adults),
    children: asCount(value.children),
    charter: value.charter === true,
    updatedAt: asTimestamp(value.updatedAt),
  };
}

export function readVoyageSelection(): VoyageSelectionState {
  return parseVoyageSelection(readJson(VOYAGE_STORAGE_KEY));
}

export function writeVoyageSelection(state: VoyageSelectionState): void {
  writeJson(VOYAGE_STORAGE_KEY, state);
}

/* ------------------------------------------------------------------ */
/* Cross-tab                                                            */
/* ------------------------------------------------------------------ */

/**
 * Notify when another tab changes either key. The `storage` event fires only in
 * OTHER tabs, so this cannot loop back on the writer. Deliberately minimal —
 * no BroadcastChannel, no polling.
 */
export function subscribeToSelectionStorage(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handle = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === FAVORITES_STORAGE_KEY ||
      event.key === VOYAGE_STORAGE_KEY
    ) {
      onChange();
    }
  };

  window.addEventListener("storage", handle);
  return () => window.removeEventListener("storage", handle);
}
