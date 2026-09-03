"use client";

import {
  HathorCartIcon,
  HathorHeartIcon,
} from "@/components/selection/SelectionIcons";
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
        {/* Outline heart, per the navbar reference — the filled silhouette
            is the card/saved state, not the header mark. */}
        <span className="hsc__mark" aria-hidden="true">
          <HathorHeartIcon className="hsc__icon" filled={false} />
        </span>
        {favoritesCount > 0 ? (
          <span className="hsc__count" aria-hidden="true">
            {favoritesCount > 99 ? "99+" : favoritesCount}
          </span>
        ) : null}
      </button>

      {/* Two marks only, at every width — matches the supplied reference. */}
      <button
        type="button"
        className={`hsc hsc--voyage${voyageCount > 0 ? " has-items" : ""}`}
        onClick={openVoyage}
        aria-label={voyageLabel}
        aria-haspopup="dialog"
        title="My Voyage"
      >
        <span className="hsc__mark" aria-hidden="true">
          <HathorCartIcon className="hsc__icon" />
        </span>
        {voyageCount > 0 ? (
          <span className="hsc__count" aria-hidden="true">
            {voyageCount}
          </span>
        ) : null}
      </button>
    </>
  );
}
