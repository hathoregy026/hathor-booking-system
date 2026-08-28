"use client";

import { useCallback, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import {
  describeRoomTypesOnCruise,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import {
  findVoyage,
  isVoyageResidenceCompatible,
  luxuryTypeForResidenceSlug,
  parseCabinSlug,
} from "@/lib/selection-catalog";
import { HathorCartIcon } from "@/components/selection/SelectionIcons";
import { trackSelectionEvent } from "@/lib/selection-analytics";
import { useSelectionStore, useVoyageSelection } from "@/components/selection/SelectionProvider";
import "./AddToVoyageButton.css";

/**
 * "Add to My Voyage" — the selection action, shared by voyage cards, residence
 * cards, residence detail pages and the Favorites list.
 *
 * Compatibility is never hard-coded here. It is decided by the shared
 * predicates in lib/selection-catalog.ts, which wrap the project's existing
 * durationSupportsRoomType(); the copy shown when a pairing is refused comes
 * from the project's existing describeRoomTypesOnCruise().
 *
 * A guest's selection is never discarded silently: replacing a journey that
 * would invalidate the chosen accommodation raises a confirmation first.
 */

export type AddToVoyageKind = "voyage" | "residence" | "cabin";
export type AddToVoyageVariant = "card" | "inline" | "panel";

type PendingChange = {
  voyageSlug: StayDurationValue;
  voyageLabel: string;
  residenceName: string;
};

export type AddToVoyageButtonProps = {
  kind: AddToVoyageKind;
  slug: string;
  name: string;
  variant?: AddToVoyageVariant;
  className?: string;
};

export function AddToVoyageButton({
  kind,
  slug,
  name,
  variant = "inline",
  className,
}: AddToVoyageButtonProps) {
  const selection = useVoyageSelection();
  const setVoyage = useSelectionStore((state) => state.setVoyage);
  const setResidence = useSelectionStore((state) => state.setResidence);
  const openVoyage = useSelectionStore((state) => state.openVoyage);

  const [pending, setPending] = useState<PendingChange | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const cabinPair = kind === "cabin" ? parseCabinSlug(slug) : null;

  const selected =
    kind === "voyage"
      ? selection.voyageSlug === slug
      : kind === "cabin"
        ? Boolean(cabinPair) &&
          selection.voyageSlug === cabinPair?.voyageSlug &&
          selection.residenceSlug === cabinPair?.residenceSlug
        : selection.residenceSlug === slug;

  const applyVoyage = useCallback(
    (voyageSlug: StayDurationValue, dropResidence: boolean) => {
      if (dropResidence) setResidence(null);
      setVoyage(voyageSlug);
      trackSelectionEvent("voyage_add", { voyage_slug: voyageSlug });
    },
    [setResidence, setVoyage],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      /* Safe inside linked cards: never navigate, never move the scroll. */
      event.preventDefault();
      event.stopPropagation();
      setNotice(null);

      /*
       * A cabin listing is a cruise + cabin PAIR — one click sets both halves of
       * My Voyage. The pair comes from the catalog, so it is compatible by
       * construction; the guard stays as a safety net.
       */
      if (kind === "cabin") {
        if (!cabinPair) return;

        const pairType = luxuryTypeForResidenceSlug(cabinPair.residenceSlug);
        if (
          !isVoyageResidenceCompatible(
            cabinPair.voyageSlug as StayDurationValue,
            pairType,
          )
        ) {
          setNotice(
            `This journey offers ${describeRoomTypesOnCruise(cabinPair.voyageSlug as StayDurationValue)}.`,
          );
          return;
        }

        setVoyage(cabinPair.voyageSlug as StayDurationValue);
        setResidence(cabinPair.residenceSlug);
        trackSelectionEvent("voyage_add", { voyage_slug: cabinPair.voyageSlug });
        trackSelectionEvent("accommodation_add", {
          residence_slug: cabinPair.residenceSlug,
        });
        openVoyage();
        return;
      }

      if (kind === "voyage") {
        const voyage = findVoyage(slug);
        if (!voyage) return;
        const voyageSlug = voyage.slug as StayDurationValue;

        if (selection.voyageSlug === voyageSlug) {
          openVoyage();
          return;
        }

        const residenceType = selection.residenceSlug
          ? luxuryTypeForResidenceSlug(selection.residenceSlug)
          : null;

        if (
          selection.residenceSlug &&
          !isVoyageResidenceCompatible(voyageSlug, residenceType)
        ) {
          setPending({
            voyageSlug,
            voyageLabel: voyage.ports,
            residenceName: selection.residenceSlug,
          });
          return;
        }

        applyVoyage(voyageSlug, false);
        openVoyage();
        return;
      }

      const residenceType = luxuryTypeForResidenceSlug(slug);

      if (
        selection.voyageSlug &&
        !isVoyageResidenceCompatible(selection.voyageSlug, residenceType)
      ) {
        setNotice(
          `This journey offers ${describeRoomTypesOnCruise(selection.voyageSlug)}.`,
        );
        return;
      }

      setResidence(slug);
      trackSelectionEvent("accommodation_add", { residence_slug: slug });

      if (!selection.voyageSlug) {
        setNotice("Choose a voyage to complete your selection.");
      }
      openVoyage();
    },
    [
      applyVoyage,
      cabinPair,
      kind,
      openVoyage,
      selection.residenceSlug,
      selection.voyageSlug,
      setResidence,
      setVoyage,
      slug,
    ],
  );

  const label = selected
    ? `${name} is in My Voyage`
    : `Add ${name} to My Voyage`;

  const classes = [
    "hathor-atv",
    `hathor-atv--${variant}`,
    selected && "is-selected",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const showText = variant !== "card";

  const confirmDialog =
    pending && typeof document !== "undefined"
      ? createPortal(
          <div className="hathor-atv-confirm" role="presentation">
            <button
              type="button"
              className="hathor-atv-confirm__backdrop"
              aria-label="Keep current voyage"
              onClick={() => setPending(null)}
            />
            <div
              className="hathor-atv-confirm__panel"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="hathor-atv-confirm-title"
            >
              <p className="hathor-atv-confirm__eyebrow">My Voyage</p>
              <h2 id="hathor-atv-confirm-title">
                Changing your voyage may update your selected accommodation.
              </h2>
              <p>
                {pending.voyageLabel} does not offer your current accommodation.
                Continuing will keep the new journey and clear the accommodation
                so you can choose again.
              </p>
              <div className="hathor-atv-confirm__actions">
                <button
                  type="button"
                  className="hathor-atv-confirm__primary"
                  onClick={() => {
                    applyVoyage(pending.voyageSlug, true);
                    setPending(null);
                    openVoyage();
                  }}
                >
                  Continue
                </button>
                <button
                  type="button"
                  className="hathor-atv-confirm__secondary"
                  onClick={() => setPending(null)}
                >
                  Keep Current Voyage
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        className={classes}
        onClick={handleClick}
        aria-label={label}
        title={label}
        aria-pressed={selected}
        data-voyage-kind={kind}
        data-voyage-slug={slug}
      >
        <HathorCartIcon className="hathor-atv__icon" filled={selected} />
        {showText ? (
          <span className="hathor-atv__label" aria-hidden="true">
            {selected ? "In My Voyage" : "Add to My Voyage"}
          </span>
        ) : null}
      </button>

      {notice ? (
        <p className="hathor-atv__notice" role="status">
          {notice}
        </p>
      ) : null}

      {confirmDialog}
    </>
  );
}
