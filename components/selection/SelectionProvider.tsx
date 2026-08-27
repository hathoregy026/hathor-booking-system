"use client";

import { useEffect, type ReactNode } from "react";
import { create } from "zustand";
import type { StayDurationValue } from "@/lib/booking-search-config";
import {
  isVoyageResidenceCompatible,
  luxuryTypeForResidenceSlug,
  pruneFavorites,
  pruneVoyageSelection,
} from "@/lib/selection-catalog";
import {
  readFavorites,
  readVoyageSelection,
  subscribeToSelectionStorage,
  writeFavorites,
  writeVoyageSelection,
} from "@/lib/selection-storage";
import {
  CHARTER_SLUG,
  EMPTY_FAVORITES,
  EMPTY_VOYAGE_SELECTION,
  favoriteKey,
  SELECTION_SCHEMA_VERSION,
  voyageSelectionCount,
  type FavoriteRef,
  type FavoritesState,
  type FavoriteType,
  type VoyageSelectionState,
} from "@/lib/selection-types";

/**
 * Favorites + My Voyage state.
 *
 * SSR / hydration: the store is created with the shared EMPTY_* constants, so
 * the server render and the first client render are byte-identical. Persisted
 * state is read only after mount, inside <SelectionProvider>. Anything that
 * renders a count must gate on `hydrated` (see `useSelectionHydrated`) so a
 * returning visitor never causes a hydration mismatch.
 *
 * Zustand rather than a bespoke store: it is already a dependency and already
 * how bookingStore works. No persist middleware — persistence goes through
 * lib/selection-storage.ts so every write is validated and version-tagged.
 */

export type SelectionPanelId = "none" | "favorites" | "voyage";

type SelectionState = {
  hydrated: boolean;
  favorites: FavoritesState;
  voyage: VoyageSelectionState;
  /**
   * Which selection surface is open. Lives in the store rather than a context
   * because the header control and the panel sit in different React subtrees
   * (Header is inside the route tree; the panel is mounted once in
   * SiteBookingChrome). Both are under SelectionProvider in app/layout.tsx.
   */
  panel: SelectionPanelId;
};

type SelectionActions = {
  /** Read + prune from localStorage. Safe to call repeatedly. */
  hydrateFromStorage: () => void;

  openFavorites: () => void;
  openVoyage: () => void;
  openPanel: (panel: Exclude<SelectionPanelId, "none">) => void;
  closePanel: () => void;

  isFavorite: (type: FavoriteType, slug: string) => boolean;
  addFavorite: (type: FavoriteType, slug: string) => void;
  removeFavorite: (type: FavoriteType, slug: string) => void;
  /** Returns the state AFTER the toggle: true = now saved. */
  toggleFavorite: (type: FavoriteType, slug: string) => boolean;
  clearFavorites: () => void;

  setVoyage: (slug: StayDurationValue | null) => void;
  setResidence: (slug: string | null) => void;
  setGuests: (adults: number | null, children: number | null) => void;
  setCharter: (charter: boolean) => void;
  clearVoyageSelection: () => void;
};

export type SelectionStore = SelectionState & SelectionActions;

function now(): number {
  return Date.now();
}

function persistFavorites(next: FavoritesState): FavoritesState {
  const pruned = pruneFavorites(next);
  writeFavorites(pruned);
  return pruned;
}

function persistVoyage(next: VoyageSelectionState): VoyageSelectionState {
  const pruned = pruneVoyageSelection({ ...next, updatedAt: now() });
  writeVoyageSelection(pruned);
  return pruned;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  hydrated: false,
  favorites: EMPTY_FAVORITES,
  voyage: EMPTY_VOYAGE_SELECTION,
  panel: "none",

  openFavorites: () => set({ panel: "favorites" }),
  openVoyage: () => set({ panel: "voyage" }),
  openPanel: (panel) => set({ panel }),
  closePanel: () => set({ panel: "none" }),

  hydrateFromStorage: () => {
    const storedFavorites = readFavorites();
    const storedVoyage = readVoyageSelection();

    const favorites = pruneFavorites(storedFavorites);
    const voyage = pruneVoyageSelection(storedVoyage);

    /*
     * Write back only when pruning actually removed something, so a visitor
     * whose saved items are all still valid causes zero writes on every load.
     */
    if (favorites !== storedFavorites) writeFavorites(favorites);
    if (voyage !== storedVoyage) writeVoyageSelection(voyage);

    set({ hydrated: true, favorites, voyage });
  },

  isFavorite: (type, slug) => {
    const key = favoriteKey({ type, slug });
    return get().favorites.items.some((ref) => favoriteKey(ref) === key);
  },

  addFavorite: (type, slug) => {
    if (get().isFavorite(type, slug)) return;
    const ref: FavoriteRef = { type, slug, addedAt: now() };
    const { favorites } = get();
    set({
      favorites: persistFavorites({
        v: SELECTION_SCHEMA_VERSION,
        items: [...favorites.items, ref],
      }),
    });
  },

  removeFavorite: (type, slug) => {
    const key = favoriteKey({ type, slug });
    const { favorites } = get();
    const items = favorites.items.filter((ref) => favoriteKey(ref) !== key);
    if (items.length === favorites.items.length) return;
    set({
      favorites: persistFavorites({ v: SELECTION_SCHEMA_VERSION, items }),
    });
  },

  toggleFavorite: (type, slug) => {
    if (get().isFavorite(type, slug)) {
      get().removeFavorite(type, slug);
      return false;
    }
    get().addFavorite(type, slug);
    return true;
  },

  clearFavorites: () => {
    set({ favorites: persistFavorites(EMPTY_FAVORITES) });
  },

  setVoyage: (slug) => {
    const { voyage } = get();
    set({ voyage: persistVoyage({ ...voyage, voyageSlug: slug }) });
  },

  setResidence: (slug) => {
    const { voyage } = get();
    const roomType = slug ? luxuryTypeForResidenceSlug(slug) : null;
    set({
      voyage: persistVoyage({ ...voyage, residenceSlug: slug, roomType }),
    });
  },

  setGuests: (adults, children) => {
    const { voyage } = get();
    set({ voyage: persistVoyage({ ...voyage, adults, children }) });
  },

  setCharter: (charter) => {
    const { voyage } = get();
    set({ voyage: persistVoyage({ ...voyage, charter }) });
  },

  clearVoyageSelection: () => {
    set({ voyage: persistVoyage(EMPTY_VOYAGE_SELECTION) });
  },
}));

/* ------------------------------------------------------------------ */
/* Read hooks — used from Stage 2 onwards                               */
/* ------------------------------------------------------------------ */

/** False during SSR and on the first client render. Gate all counts on this. */
export function useSelectionPanel(): SelectionPanelId {
  return useSelectionStore((state) => state.panel);
}

/** True whenever any selection sheet is open — used to park fixed page chrome. */
export function useSelectionPanelOpen(): boolean {
  return useSelectionStore((state) => state.panel !== "none");
}

export function useFavoritesPanelOpen(): boolean {
  return useSelectionStore((state) => state.panel === "favorites");
}

export function useSelectionHydrated(): boolean {
  return useSelectionStore((state) => state.hydrated);
}

export function useFavorites(): FavoritesState {
  return useSelectionStore((state) => state.favorites);
}

export function useFavoritesCount(): number {
  return useSelectionStore((state) =>
    state.hydrated ? state.favorites.items.length : 0,
  );
}

export function useVoyageSelection(): VoyageSelectionState {
  return useSelectionStore((state) => state.voyage);
}

export function useVoyageSelectionCount(): number {
  return useSelectionStore((state) =>
    state.hydrated ? voyageSelectionCount(state.voyage) : 0,
  );
}

export function useIsFavorite(type: FavoriteType, slug: string): boolean {
  return useSelectionStore((state) => {
    if (!state.hydrated) return false;
    const key = favoriteKey({ type, slug });
    return state.favorites.items.some((ref) => favoriteKey(ref) === key);
  });
}

/**
 * Would adding this residence conflict with the currently selected journey?
 * Reuses the shared compatibility predicate — never re-implements it.
 */
export function useResidenceCompatibleWithSelection(
  residenceSlug: string,
): boolean {
  return useSelectionStore((state) =>
    isVoyageResidenceCompatible(
      state.voyage.voyageSlug,
      luxuryTypeForResidenceSlug(residenceSlug),
    ),
  );
}

/** Re-exported so Stage 2 components import one module for charter favorites. */
export const CHARTER_FAVORITE_SLUG = CHARTER_SLUG;

/* ------------------------------------------------------------------ */
/* Provider                                                             */
/* ------------------------------------------------------------------ */

/**
 * Renders nothing of its own. It exists to hydrate the store after mount and to
 * keep tabs in sync. Mounted once, in app/layout.tsx, which is the only host
 * above every route tree — the same place BookingModalProvider already lives.
 */
export function SelectionProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const { hydrateFromStorage } = useSelectionStore.getState();
    hydrateFromStorage();
    return subscribeToSelectionStorage(hydrateFromStorage);
  }, []);

  return <>{children}</>;
}
