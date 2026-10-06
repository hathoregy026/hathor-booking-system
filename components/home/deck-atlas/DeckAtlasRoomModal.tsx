"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import { FavoriteButton } from "@/components/selection/FavoriteButton";
import { useSelectionPanelOpen } from "@/components/selection/SelectionProvider";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";
import type { ShipDeckId } from "@/lib/ship-experience-shared";
import { RoomPriceUnit } from "@/components/ui/RoomPriceUnit";
import { PlanCloseUp, type AtlasState } from "./DeckAtlasPlan";

type Area = { x: number; y: number; width: number; height: number };

type SheetBase = {
  key: string;
  kicker: string;
  name: string;
  gallery: readonly string[];
  galleryAlt: string;
  /** Shown on the photograph when it is not of this exact place. */
  galleryNote: string | null;
  /** The dashboard slot the photograph comes from, for the site-image audit. */
  gallerySlot?: string | null;
  deck: ShipDeckId;
  /** Where it is on the plan: one rectangle, or several for a space found in more than one place. */
  areas: Area[];
};

export type RoomSheet = SheetBase & {
  kind: "room";
  label: string;
  spec: string | null;
  /** The room's own line from the dashboard, when there is one. */
  note?: string | null;
  state: AtlasState;
  status: string;
  price: string | null;
  roomType: string | null;
  /** Booking journey started on this cabin; null when it cannot be booked online. */
  checkHref: string | null;
  /** The room type's own page. */
  viewHref: string | null;
  /** Voyage + residence pair for Favorites and My Voyage; null when not a catalog cabin. */
  cabinSlug: string | null;
};

export type SpaceSheet = SheetBase & { kind: "space"; line: string };

export type AtlasSheet = RoomSheet | SpaceSheet;

/**
 * A room or a shared space, opened over the page. Rooms keep to what a guest
 * needs to decide — photograph, name, size, and check availability / view the
 * room / save / add to My Voyage. Spaces have no page of their own: they open
 * as a photograph and a close-up of where they sit on the deck.
 * Same native <dialog> pattern as the room pages.
 */
export function DeckAtlasRoomModal({ open, sheet, onClose }: { open: boolean; sheet: AtlasSheet | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [photo, setPhoto] = useState(0);
  const [photoFor, setPhotoFor] = useState(sheet?.key);
  if (sheet?.key !== photoFor) { setPhotoFor(sheet?.key); setPhoto(0); }

  /*
   * The X, the surround and Esc report straight to the parent, which clears the
   * open state and lets the cleanup below close the dialog. The native `close`
   * event is only a backstop: Chrome holds it back while the page is hidden.
   */
  const closed = useRef(onClose);
  useEffect(() => { closed.current = onClose; });
  const requestClose = () => closed.current();
  useEffect(() => {
    const element = dialog.current;
    if (!element || !open) return;
    element.showModal();
    /* Start on the title (read first by screen readers) rather than ringing the close button. */
    element.querySelector<HTMLElement>(".da-modal__title")?.focus({ preventScroll: true });
    const scroll = ensurePublicScrollController();
    scroll.stop();
    const handleCancel = (event: Event) => { event.preventDefault(); closed.current(); };
    const handleClose = () => closed.current();
    element.addEventListener("cancel", handleCancel);
    element.addEventListener("close", handleClose);
    return () => {
      element.removeEventListener("cancel", handleCancel);
      element.removeEventListener("close", handleClose);
      if (element.open) element.close();
      scroll.start();
      scroll.syncToCurrentScroll();
    };
  }, [open]);

  /* Adding to My Voyage opens its sheet; step aside so it is not hidden behind this dialog. */
  const selectionOpen = useSelectionPanelOpen();
  useEffect(() => { if (open && selectionOpen) closed.current(); }, [open, selectionOpen]);

  const count = sheet?.gallery.length ?? 0;
  const step = (delta: number) => setPhoto(current => (current + delta + count) % count);
  const room = sheet?.kind === "room" ? sheet : null;
  const saveName = room ? `${room.name}, cabin ${room.label}` : "";

  return (
    <dialog ref={dialog} className="da-modal" aria-labelledby="da-modal-title" data-lenis-prevent
      onClick={event => { if (event.target === event.currentTarget) requestClose(); }}
      onKeyDown={event => {
        if (count < 2) return;
        if (event.key === "ArrowRight") step(1);
        if (event.key === "ArrowLeft") step(-1);
      }}>
      {sheet ? <div className="da-modal__panel" key={sheet.key} data-kind={sheet.kind}>
        <button type="button" className="da-modal__close" aria-label={`Close ${sheet.name}`} onClick={requestClose}><X aria-hidden="true" /></button>
        <figure className="da-modal__media">
          {count ? <Image key={photo} className="da-modal__img" src={sheet.gallery[photo]} data-site-image={sheet.gallerySlot ?? undefined}
            alt={count > 1 ? `${sheet.galleryAlt}, photograph ${photo + 1} of ${count}` : sheet.galleryAlt}
            fill sizes="(max-width: 640px) 100vw, (max-width: 1100px) 560px, 540px" loading="eager" />
            : <PlanCloseUp className="da-closeup--hero" deck={sheet.deck} areas={sheet.areas} label={sheet.name} />}
          {room?.cabinSlug ? <div className="da-modal__save">
            <FavoriteButton type="cabin" slug={room.cabinSlug} name={saveName} variant="card" />
            <AddToVoyageButton kind="cabin" slug={room.cabinSlug} name={saveName} variant="card" />
          </div> : null}
          {count > 1 ? <>
            <button type="button" className="da-modal__nav da-modal__nav--prev" aria-label="Previous photograph" onClick={() => step(-1)}><ChevronLeft aria-hidden="true" /></button>
            <button type="button" className="da-modal__nav da-modal__nav--next" aria-label="Next photograph" onClick={() => step(1)}><ChevronRight aria-hidden="true" /></button>
          </> : null}
          {count > 1 || sheet.galleryNote ? <figcaption className="da-modal__count">{[sheet.galleryNote, count > 1 ? `${photo + 1} / ${count}` : null].filter(Boolean).join(" · ")}</figcaption> : null}
        </figure>

        <div className="da-modal__info">
          <p className="da-kicker">{sheet.kicker}</p>
          <h3 id="da-modal-title" className="da-modal__title" tabIndex={-1}>{sheet.name}</h3>
          {room ? <>
            {room.spec ? <p className="da-modal__spec">{room.spec}</p> : null}
            {room.note ? <p className="da-modal__line">{room.note}</p> : null}
            <div className="da-modal__terms">
              <p className="da-status" data-state={room.state}>{room.status}</p>
              {room.price ? <p className="da-price">{room.price}<RoomPriceUnit roomType={room.roomType} /><small>entire voyage</small></p> : null}
            </div>
            <div className="da-modal__act">
              {room.checkHref ? <Link className="btn" data-hathor-btn="primary" href={room.checkHref}>{room.state === "closed" ? "See other dates" : "Check availability"}</Link>
                : <Link className="btn" data-hathor-btn="primary" href="/contact">Contact reservations</Link>}
              {room.viewHref ? <Link className="btn" href={room.viewHref}>View room</Link> : null}
            </div>
          </> : sheet.kind === "space" ? <>
            <p className="da-modal__line">{sheet.line}</p>
            {count ? <div className="da-modal__where">
              <p className="da-kicker">Where it is</p>
              <PlanCloseUp deck={sheet.deck} areas={sheet.areas} label={sheet.name} ratio={3} />
            </div> : null}
            <button type="button" className="da-textlink da-modal__back" onClick={requestClose}><span aria-hidden="true">←</span> Back to the deck plan</button>
          </> : null}
        </div>
      </div> : null}
    </dialog>
  );
}
