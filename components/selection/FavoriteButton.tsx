"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { Heart } from "lucide-react";
import { trackSelectionEvent } from "@/lib/selection-analytics";
import {
  useIsFavorite,
  useSelectionStore,
} from "@/components/selection/SelectionProvider";
import type { FavoriteType } from "@/lib/selection-types";
import "./FavoriteButton.css";

/**
 * The one Favorite control, used by every eligible card and detail page.
 *
 * Design contract:
 * - Persists a stable slug through SelectionProvider. Never a product object,
 *   never a price, never a database id.
 * - Both states render the SAME element at the SAME size — only fill and colour
 *   change — so toggling cannot shift layout.
 * - It is a plain <button type="button"> and it stops its own click, so it is
 *   safe inside the <Link> wrappers the card media already use: no navigation,
 *   no form submit, no scroll movement.
 * - State is announced through aria-pressed and a state-specific aria-label.
 *   No toast, no live region, no popup.
 */

const PULSE_MS = 260;

export type FavoriteButtonVariant = "card" | "inline";

export type FavoriteButtonProps = {
  /** Which catalog the slug belongs to. */
  type: FavoriteType;
  /** Stable catalog slug — HATHOR_CRUISES / ROOM_SHOWCASES / CHARTER_SLUG. */
  slug: string;
  /**
   * Human name of the thing being saved, e.g. "Royal Suite". Used ONLY to build
   * the accessible label — it is never persisted or sent anywhere.
   */
  name: string;
  /** `card` = overlay disc on media. `inline` = quiet text action. */
  variant?: FavoriteButtonVariant;
  /** Show the "Save" / "Saved" text. Defaults to true for the inline variant. */
  showLabel?: boolean;
  className?: string;
  /** Called after the toggle with the new state. For future analytics/UI only. */
  onToggle?: (saved: boolean) => void;
};

export function FavoriteButton({
  type,
  slug,
  name,
  variant = "card",
  showLabel,
  className,
  onToggle,
}: FavoriteButtonProps) {
  const saved = useIsFavorite(type, slug);
  const toggleFavorite = useSelectionStore((state) => state.toggleFavorite);

  const [pulsing, setPulsing] = useState(false);
  const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (pulseTimer.current) clearTimeout(pulseTimer.current);
    };
  }, []);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      /*
       * Card media is frequently wrapped in a <Link>. Without both of these the
       * heart would navigate to the detail page and lose the guest's place.
       */
      event.preventDefault();
      event.stopPropagation();

      const nowSaved = toggleFavorite(type, slug);

      trackSelectionEvent(nowSaved ? "favorite_add" : "favorite_remove", {
        item_type: type,
        item_slug: slug,
      });

      if (pulseTimer.current) clearTimeout(pulseTimer.current);
      setPulsing(true);
      pulseTimer.current = setTimeout(() => setPulsing(false), PULSE_MS);

      onToggle?.(nowSaved);
    },
    [onToggle, slug, toggleFavorite, type],
  );

  const withLabel = showLabel ?? variant === "inline";

  /*
   * Distinct labels per state, so a screen reader announces what the control
   * will DO as well as what it currently IS (via aria-pressed).
   *
   * Each label starts with the visible word for that state ("Save" / "Saved")
   * so WCAG 2.5.3 Label in Name holds when the text label is shown — a voice
   * user can say "click Saved" and hit the right control.
   */
  const accessibleLabel = saved
    ? `Saved — remove ${name} from Favorites`
    : `Save ${name} to Favorites`;

  const classes = [
    "hathor-fav",
    `hathor-fav--${variant}`,
    saved && "is-saved",
    pulsing && "is-pulsing",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={classes}
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={accessibleLabel}
      title={accessibleLabel}
      data-favorite-type={type}
      data-favorite-slug={slug}
    >
      <Heart
        className="hathor-fav__icon"
        strokeWidth={1.5}
        aria-hidden="true"
        focusable="false"
      />
      {withLabel ? (
        /* Decorative: the accessible name comes from aria-label above. */
        <span className="hathor-fav__label" aria-hidden="true">
          {saved ? "Saved" : "Save"}
        </span>
      ) : null}
    </button>
  );
}
