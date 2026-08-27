"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useRouter } from "next/navigation";
import { useBookNowModal } from "@/components/booking/BookingModalProvider";
import {
  describeRoomTypesOnCruise,
  getDefaultRoomTypeForDuration,
  normalizeRoomConfigsForDuration,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { useBookingStore } from "@/store/bookingStore";
import { lockBodyScroll, unlockBodyScroll, type BodyLockOwner } from "@/lib/body-scroll-lock";
import { formatPrice } from "@/lib/client-dates";
import {
  findResidence,
  findVoyage,
  indicativeFromPriceCents,
  isVoyageResidenceCompatible,
  luxuryTypeForResidence,
  resolveFavorites,
  type ResolvedFavoriteImage,
} from "@/lib/selection-catalog";
import { trackSelectionEvent } from "@/lib/selection-analytics";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import {
  useFavorites,
  useSelectionPanel,
  useSelectionStore,
  useVoyageSelection,
} from "@/components/selection/SelectionProvider";
import "./FavoritesPanel.css";

/**
 * The guest's selection sheet — one right-hand cream surface with two views:
 * My Favorites (inspiration) and My Voyage (the journey being shaped).
 *
 * Mounted once, in SiteBookingChrome, so it is available on every route without
 * per-page wiring. Everything rendered is resolved from the live catalog at
 * render time; the browser stores only {type, slug} and the guest's own
 * choices, so stale titles, images, routes or prices cannot appear.
 *
 * The file keeps its original name so no module is orphaned; the component is
 * now the combined SelectionPanel, with FavoritesPanel exported as an alias.
 */

const SCROLL_LOCK_OWNER = "selection-panel" as BodyLockOwner;

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function PanelImage({
  image,
  sizes = "88px",
}: {
  image: ResolvedFavoriteImage;
  sizes?: string;
}) {
  if (image.kind === "slot") {
    return (
      <ManagedImage
        name={image.name}
        alt=""
        fill
        sizes={sizes}
        previewAnchor={false}
      />
    );
  }
  return image.src ? <Image src={image.src} alt="" fill sizes={sizes} /> : null;
}

/* ------------------------------------------------------------------ */
/* My Favorites                                                         */
/* ------------------------------------------------------------------ */

function FavoritesView({ onClose }: { onClose: () => void }) {
  const favorites = useFavorites();
  const removeFavorite = useSelectionStore((state) => state.removeFavorite);
  const items = useMemo(() => resolveFavorites(favorites), [favorites]);

  if (items.length === 0) {
    return (
      <div className="hfp__empty">
        <span className="hfp__empty-rule" aria-hidden="true" />
        <h3>Nothing saved yet</h3>
        <p>
          Explore Hathor&apos;s voyages, cabins and suites, and save the
          experiences that speak to you. They will be waiting here when you
          return.
        </p>
        <Link href="/voyages" className="hfp__cta" onClick={onClose}>
          Explore Hathor
        </Link>
      </div>
    );
  }

  return (
    <ul className="hfp__list">
      {items.map((item) => (
        <li key={item.key} className="hfp__item">
          <div className="hfp__media">
            <PanelImage image={item.image} />
          </div>

          <div className="hfp__copy">
            <p className="hfp__type">{item.typeLabel}</p>
            <p className="hfp__name">{item.title}</p>
            {item.meta ? <p className="hfp__meta">{item.meta}</p> : null}

            <div className="hfp__actions">
              <Link href={item.href} className="hfp__action" onClick={onClose}>
                View Details
              </Link>

              {/*
                Selecting from Favorites never removes the item — a guest may
                well want something both saved and selected.
              */}
              {item.ref.type === "voyage" || item.ref.type === "residence" ? (
                <AddToVoyageButton
                  kind={item.ref.type}
                  slug={item.ref.slug}
                  name={item.title}
                  variant="panel"
                />
              ) : null}

              <button
                type="button"
                className="hfp__remove"
                onClick={() => {
                  removeFavorite(item.ref.type, item.ref.slug);
                  trackSelectionEvent("favorite_remove", {
                    item_type: item.ref.type,
                    item_slug: item.ref.slug,
                  });
                }}
                aria-label={`Remove ${item.title} from Favorites`}
              >
                Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* My Voyage                                                            */
/* ------------------------------------------------------------------ */

function GuestCounter({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="hfp__counter">
      <span className="hfp__counter-label">{label}</span>
      <div className="hfp__counter-controls">
        <button
          type="button"
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus aria-hidden="true" focusable="false" />
        </button>
        <span className="hfp__counter-value">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          aria-label={`Increase ${label}`}
        >
          <Plus aria-hidden="true" focusable="false" />
        </button>
      </div>
    </div>
  );
}

function MyVoyageView({ onClose }: { onClose: () => void }) {
  const selection = useVoyageSelection();
  const setVoyage = useSelectionStore((state) => state.setVoyage);
  const setResidence = useSelectionStore((state) => state.setResidence);
  const setGuests = useSelectionStore((state) => state.setGuests);
  const setCharter = useSelectionStore((state) => state.setCharter);
  const { openBooking } = useBookNowModal();
  const hydrateFromModal = useBookingStore((state) => state.hydrateFromModal);
  const router = useRouter();
  const [handoffNotice, setHandoffNotice] = useState<string | null>(null);

  const voyage = selection.voyageSlug ? findVoyage(selection.voyageSlug) : null;
  const residence = selection.residenceSlug
    ? findResidence(selection.residenceSlug)
    : null;

  const adults = selection.adults ?? 2;
  const children = selection.children ?? 0;

  /*
   * Indicative only, and only when BOTH a journey and a tier are known — a
   * residence has no price until an itinerary is chosen. Read live from the
   * catalog on every render, never persisted, never summed, and never treated
   * as a booking total: the server states the amount a guest actually pays.
   */
  const indicativeCents = indicativeFromPriceCents(
    selection.voyageSlug,
    residence ? luxuryTypeForResidence(residence) : null,
  );

  /*
   * Hand off into the EXISTING booking path — hydrateFromModal + BookingModal.
   * No second booking-state path, no server call, and no price: availability and
   * the final amount stay with the existing server flow.
   */
  const handleCheckAvailability = useCallback(() => {
    setHandoffNotice(null);

    const duration = selection.voyageSlug as StayDurationValue | null;

    if (!duration) {
      setHandoffNotice("Choose a voyage to complete your selection.");
      return;
    }

    const selectedResidence = selection.residenceSlug
      ? findResidence(selection.residenceSlug)
      : null;
    const residenceType = selectedResidence
      ? luxuryTypeForResidence(selectedResidence)
      : null;

    if (residenceType && !isVoyageResidenceCompatible(duration, residenceType)) {
      setHandoffNotice(
        `This journey offers ${describeRoomTypesOnCruise(duration)}.`,
      );
      return;
    }

    /* Only the voyage chosen: the project's own default tier, not a guess. */
    const roomType = residenceType ?? getDefaultRoomTypeForDuration(duration);

    const roomConfigs = normalizeRoomConfigsForDuration(duration, [
      { roomType, adults, children },
    ]);

    hydrateFromModal({ duration, roomConfigs });
    onClose();
    openBooking();
  }, [
    adults,
    children,
    hydrateFromModal,
    onClose,
    openBooking,
    selection.residenceSlug,
    selection.voyageSlug,
  ]);

  const empty = !voyage && !residence && !selection.charter;

  if (empty) {
    return (
      <div className="hfp__empty">
        <span className="hfp__empty-rule" aria-hidden="true" />
        <h3>Your voyage begins here</h3>
        <p>
          Choose a journey and accommodation to begin shaping your experience
          aboard Hathor.
        </p>
        <Link href="/voyages" className="hfp__cta" onClick={onClose}>
          Explore Voyages
        </Link>
      </div>
    );
  }

  return (
    <div className="hfp__voyage">
      <section className="hfp__section">
        <h3 className="hfp__section-title">Journey</h3>
        {voyage ? (
          <div className="hfp__section-body">
            <p className="hfp__name">{voyage.ports}</p>
            <p className="hfp__meta">
              {voyage.nights} Nights / {voyage.days} Days · Departs{" "}
              {voyage.departureDay}
            </p>
            <div className="hfp__actions">
              <Link href="/voyages" className="hfp__action" onClick={onClose}>
                Change Journey
              </Link>
              <button
                type="button"
                className="hfp__remove"
                onClick={() => setVoyage(null)}
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="hfp__section-body">
            <p className="hfp__prompt">Choose a voyage to complete your selection.</p>
            <div className="hfp__actions">
              <Link href="/voyages" className="hfp__action" onClick={onClose}>
                Explore Voyages
              </Link>
            </div>
          </div>
        )}
      </section>

      {residence ? (
        <section className="hfp__section">
          <h3 className="hfp__section-title">Accommodation</h3>
          <div className="hfp__item hfp__item--flush">
            <div className="hfp__media">
              <PanelImage
                image={{ kind: "static", src: residence.images[0] ?? "" }}
              />
            </div>
            <div className="hfp__copy">
              <p className="hfp__name">{residence.name}</p>
              <p className="hfp__meta">
                {residence.sizeSqm} m² · Up to {residence.capacity} guests
              </p>
              <div className="hfp__actions">
                <Link
                  href={`/rooms/${residence.slug}`}
                  className="hfp__action"
                  onClick={onClose}
                >
                  View Suite
                </Link>
                <button
                  type="button"
                  className="hfp__remove"
                  onClick={() => setResidence(null)}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="hfp__section">
        <h3 className="hfp__section-title">Guests</h3>
        <div className="hfp__counters">
          <GuestCounter
            label="Adults"
            value={adults}
            min={1}
            onChange={(next) => setGuests(next, children)}
          />
          <GuestCounter
            label="Children"
            value={children}
            min={0}
            onChange={(next) => setGuests(adults, next)}
          />
        </div>
        <p className="hfp__note">
          Additional cabins are configured during availability.
        </p>
      </section>

      {selection.charter ? (
        <section className="hfp__section">
          <h3 className="hfp__section-title">Private Charter</h3>
          <div className="hfp__section-body">
            <p className="hfp__meta">The Dahabiya, yours alone.</p>
            <div className="hfp__actions">
              <Link href="/charter" className="hfp__action" onClick={onClose}>
                View Charter
              </Link>
              <button
                type="button"
                className="hfp__remove"
                onClick={() => setCharter(false)}
              >
                Remove
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {indicativeCents !== null ? (
        <section className="hfp__section hfp__section--price">
          <p className="hfp__price-label">Indicative from</p>
          <p className="hfp__price">{formatPrice(indicativeCents)}</p>
          <p className="hfp__note">
            Indicative catalog rate per cabin. Final pricing and availability are
            confirmed by our reservations team.
          </p>
        </section>
      ) : null}

      {handoffNotice ? (
        <p className="hfp__handoff" role="status">
          {handoffNotice}
        </p>
      ) : null}

      <div className="hfp__primary">
        <button
          type="button"
          className="hfp__cta"
          onClick={() => {
            trackSelectionEvent("voyage_request_start");
            onClose();
            /*
             * Private Charter is not a scheduled sailing. Route it to the
             * existing charter enquiry rather than the contact form, preserving
             * the mutual exclusion the store already enforces.
             */
            router.push(selection.charter ? "/charter" : "/contact");
          }}
        >
          Request This Voyage
        </button>
        <button
          type="button"
          className="hfp__action"
          onClick={handleCheckAvailability}
        >
          Check Availability
        </button>
        <Link href="/voyages" className="hfp__action" onClick={onClose}>
          Continue Exploring
        </Link>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shell                                                                */
/* ------------------------------------------------------------------ */

export function SelectionPanel() {
  const panel = useSelectionPanel();
  const open = panel !== "none";
  const closePanel = useSelectionStore((state) => state.closePanel);
  const openPanel = useSelectionStore((state) => state.openPanel);
  const favoritesCount = useFavorites().items.length;

  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const handleClose = useCallback(() => closePanel(), [closePanel]);

  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    returnFocusRef.current = active instanceof HTMLElement ? active : null;
  }, [open]);

  useEffect(() => {
    if (!open) return;

    lockBodyScroll(SCROLL_LOCK_OWNER);
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        handleClose();
        return;
      }
      if (event.key !== "Tab") return;

      const sheet = sheetRef.current;
      if (!sheet) return;

      const focusable = Array.from(
        sheet.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((node) => node.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown, true);
      unlockBodyScroll(SCROLL_LOCK_OWNER);
      const target = returnFocusRef.current;
      if (target && document.contains(target)) target.focus();
      returnFocusRef.current = null;
    };
  }, [open, handleClose]);

  const isFavorites = panel === "favorites";

  return (
    <div className={`hfp${open ? " is-open" : ""}`} aria-hidden={!open} hidden={!open}>
      <button
        type="button"
        className="hfp__backdrop"
        aria-label="Close selection"
        tabIndex={open ? 0 : -1}
        onClick={handleClose}
      />

      <div
        ref={sheetRef}
        className="hfp__sheet"
        role="dialog"
        aria-modal="true"
        aria-label={isFavorites ? "My Favorites" : "My Voyage"}
      >
        <header className="hfp__head">
          <div>
            <p className="hfp__eyebrow">Your selections</p>
            <h2 className="hfp__title">{isFavorites ? "My Favorites" : "My Voyage"}</h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="hfp__close"
            onClick={handleClose}
            aria-label="Close"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>

        {/* The switch lives inside the sheet, so phones need only one header control. */}
        <div className="hfp__tabs" role="tablist" aria-label="Selections">
          <button
            type="button"
            role="tab"
            id="hfp-tab-favorites"
            aria-selected={isFavorites}
            aria-controls="hfp-view-favorites"
            className={`hfp__tab${isFavorites ? " is-active" : ""}`}
            onClick={() => openPanel("favorites")}
          >
            Favorites
            {favoritesCount > 0 ? (
              <span className="hfp__tab-count" aria-hidden="true">
                {favoritesCount}
              </span>
            ) : null}
          </button>
          <button
            type="button"
            role="tab"
            id="hfp-tab-voyage"
            aria-selected={!isFavorites}
            aria-controls="hfp-view-voyage"
            className={`hfp__tab${!isFavorites ? " is-active" : ""}`}
            onClick={() => openPanel("voyage")}
          >
            My Voyage
          </button>
        </div>

        <div
          className="hfp__body"
          role="tabpanel"
          id={isFavorites ? "hfp-view-favorites" : "hfp-view-voyage"}
          aria-labelledby={isFavorites ? "hfp-tab-favorites" : "hfp-tab-voyage"}
        >
          {isFavorites ? (
            <FavoritesView onClose={handleClose} />
          ) : (
            <MyVoyageView onClose={handleClose} />
          )}
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use SelectionPanel — kept so existing imports keep working. */
export const FavoritesPanel = SelectionPanel;
