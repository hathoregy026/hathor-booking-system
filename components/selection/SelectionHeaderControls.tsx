"use client";

import { Compass, Heart } from "lucide-react";
import {
  useFavoritesCount,
  useSelectionStore,
  useVoyageSelectionCount,
} from "@/components/selection/SelectionProvider";
import "./SelectionHeaderControls.css";

/**
 * The single header entry point to the guest's selections.
 *
 * One control on every breakpoint — desktop and mobile alike — so the header
 * never becomes crowded. When My Voyage arrives it joins this same control
 * rather than adding a second button on phones.
 *
 * The count renders 0 (and is hidden) until the store hydrates, so the server
 * render and the first client render are identical.
 */
export function SelectionHeaderControls() {
  const favoritesCount = useFavoritesCount();
  const voyageCount = useVoyageSelectionCount();
  const openFavorites = useSelectionStore((state) => state.openFavorites);
  const openVoyage = useSelectionStore((state) => state.openVoyage);

  const favoritesLabel =
    favoritesCount > 0
      ? `My Favorites, ${favoritesCount} saved`
      : "My Favorites, nothing saved yet";

  const voyageLabel =
    voyageCount > 0
      ? `My Voyage, ${voyageCount} ${voyageCount === 1 ? "selection" : "selections"}`
      : "My Voyage, nothing selected yet";

  return (
    <>
      <button
        type="button"
        className={`hsc${favoritesCount > 0 ? " has-items" : ""}`}
        onClick={openFavorites}
        aria-label={favoritesLabel}
        aria-haspopup="dialog"
        title="My Favorites"
      >
        <Heart className="hsc__icon" strokeWidth={1.5} aria-hidden="true" focusable="false" />
        {favoritesCount > 0 ? (
          <span className="hsc__count" aria-hidden="true">
            {favoritesCount > 99 ? "99+" : favoritesCount}
          </span>
        ) : null}
      </button>

      {/*
        Desktop/tablet only. On phones the heart opens the same sheet and the
        in-sheet tabs reach My Voyage, so no third icon crowds the header.
      */}
      <button
        type="button"
        className={`hsc hsc--voyage${voyageCount > 0 ? " has-items" : ""}`}
        onClick={openVoyage}
        aria-label={voyageLabel}
        aria-haspopup="dialog"
        title="My Voyage"
      >
        <Compass className="hsc__icon" strokeWidth={1.5} aria-hidden="true" focusable="false" />
        {voyageCount > 0 ? (
          <span className="hsc__count" aria-hidden="true">
            {voyageCount}
          </span>
        ) : null}
      </button>
    </>
  );
}
