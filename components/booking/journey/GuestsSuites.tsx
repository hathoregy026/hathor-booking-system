"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { ManagedSourceImage as Image } from "@/components/public/ManagedSourceImage";
import { FavoriteButton } from "@/components/selection/FavoriteButton";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import { buildCabinSlug } from "@/lib/selection-catalog";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { itineraryFor } from "@/lib/booking-itineraries";
import { PHYSICAL_ROOM_TYPES, roomCapacity, type PhysicalRoomType } from "@/lib/physical-inventory";
import {
  EMPTY_ARRANGEMENT,
  MAX_ADULTS,
  MAX_CHILDREN,
  cabinCountOptions,
  cabinLabel,
  clearCabin,
  guestLabel,
  occupants,
  placeGuest,
  parseSlot,
  placementReminder,
  setCabinCount,
  shortName,
  slotId,
  unplaceGuest,
  unplacedGuests,
  type Arrangement,
  type Guest,
  type GuestKind,
  type Offers,
  type PlaceResult,
} from "./allocation";
import { useGuestDrag } from "./useGuestDrag";
import { money, plural, type Sailing } from "./model";
import { PanelHead } from "./JourneyChrome";
import { IconBed, IconCheck, IconClose, IconGuests, IconOpen, IconSize, IconUndo, IconWand } from "./icons";

/** What each cabin includes and leaves out: the room pages' own lists. */
const inclusionsFor = (type: PhysicalRoomType) => ROOM_FOLIO_PANELS[folioVariantForRoomSlug(RESIDENCE_SLUG[type])];
import { ArrangeChooser, CABIN_BED, CABIN_NOTE, CountMenu, Counter, DragGhost, GuestTile, RESIDENCE_SLUG } from "./SuitesParts";
import { SuitesBrowse } from "./SuitesBrowse";
import { ROOM_FOLIO_PANELS, folioVariantForRoomSlug } from "@/lib/room-folio-panels";
import { useDesktop } from "./useDesktop";
import { useStickyFit } from "./useStickyFit";

type Notice = { tone: "ok" | "warn"; text: string } | null;

function RoomFilter({
  sailing,
  selected,
  onToggle,
  onAll,
}: {
  sailing: Sailing;
  selected: PhysicalRoomType[];
  onToggle: (type: PhysicalRoomType) => void;
  onAll: () => void;
}) {
  const info = (type: PhysicalRoomType) => sailing.types.find(entry => entry.roomType === type);
  const count = (types: readonly PhysicalRoomType[], key: "totalCabins" | "availableCabins") =>
    types.reduce<number>((sum, type) => sum + (info(type)?.[key] ?? 0), 0);
  const shown: readonly PhysicalRoomType[] = selected.length === 0 ? PHYSICAL_ROOM_TYPES : selected;

  return (
    <div className="hj-filter">
      <div className="hj-filter__pills" role="group" aria-label="Filter cabins by type">
        <button type="button" className="hj-filter__pill" aria-pressed={selected.length === 0} onClick={onAll}>
          All rooms
          <span className="hj-filter__count" aria-label={`${count(PHYSICAL_ROOM_TYPES, "totalCabins")} cabins`}>{count(PHYSICAL_ROOM_TYPES, "totalCabins")}</span>
        </button>
        {PHYSICAL_ROOM_TYPES.map(type => (
          <button
            key={type}
            type="button"
            className={`hj-filter__pill${(info(type)?.availableCabins ?? 0) === 0 ? " hj-filter__pill--out" : ""}`}
            aria-pressed={selected.includes(type)}
            onClick={() => onToggle(type)}
          >
            {shortName(type)}
            <span className="hj-filter__count" aria-label={`${info(type)?.totalCabins ?? 0} cabins`}>{info(type)?.totalCabins ?? 0}</span>
          </button>
        ))}
      </div>
      <p className="hj-filter__shown" aria-live="polite">
        Showing {plural(count(shown, "totalCabins"), "cabin")} · {count(shown, "availableCabins")} free on this date
      </p>
    </div>
  );
}

export function GuestsSuitesScreen({
  duration,
  sailing,
  sailingDate,
  offers,
  guests,
  adults,
  childCount,
  onCounts,
  arrangement,
  onArrangement,
  onArrange,
  preferredType,
  issues,
  alert,
  busy,
  onBack,
  onContinue,
  verifyCabinType,
  rail,
  mobileBar,
}: {
  duration: StayDurationValue;
  sailing: Sailing;
  sailingDate: string;
  offers: Offers;
  guests: Guest[];
  adults: number;
  childCount: number;
  onCounts: (adults: number, children: number) => void;
  arrangement: Arrangement;
  onArrangement: (next: Arrangement) => void;
  /** Places everyone in the chosen types; returns a message when they cannot fit. */
  onArrange: (types: PhysicalRoomType[]) => string | null;
  preferredType: PhysicalRoomType | null;
  issues: string[];
  alert: string | null;
  busy: boolean;
  onBack: () => void;
  onContinue: () => void;
  /** Live availability check for the cart: a message when the type is gone. */
  verifyCabinType: (roomType: PhysicalRoomType) => Promise<string | null>;
  rail: ReactNode;
  /** Phone and tablet: the total and Continue, at the foot of the guests tray. */
  mobileBar?: ReactNode;
}) {
  const voyage = itineraryFor(duration);
  const desktop = useDesktop();
  const [picked, setPicked] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [filter, setFilter] = useState<PhysicalRoomType[]>([]);
  const [choosing, setChoosing] = useState(false);
  const partyRef = useRef<HTMLElement | null>(null);
  useStickyFit(partyRef);
  const undoDialog = useRef<HTMLDialogElement | null>(null);
  /** Desktop: the cabin on show in the preview, chosen by clicking any cabin card. */
  const [previewCabin, setPreviewCabin] = useState<string>(() => {
    const types = sailing.types;
    if (preferredType && types.some(type => type.roomType === preferredType)) return slotId(preferredType, 0);
    if (arrangement.cabins[0]) return arrangement.cabins[0].id;
    return slotId((types.find(type => type.availableCabins > 0) ?? types[0]).roomType, 0);
  });
  const previewType = parseSlot(previewCabin)?.roomType ?? sailing.types[0].roomType;
  const setPreviewType = (type: PhysicalRoomType) => setPreviewCabin(slotId(type, 0));

  const pickedGuest = picked ? guests.find(guest => guest.id === picked) ?? null : null;
  const waiting = unplacedGuests(arrangement, guests);
  const placedIn = (guestId: string) => {
    const cabinId = arrangement.placement[guestId];
    return cabinId && arrangement.cabins.some(cabin => cabin.id === cabinId) ? cabinLabel(cabinId) : null;
  };

  function settle(result: PlaceResult, success: string | null) {
    if ("error" in result) {
      setNotice({ tone: "warn", text: result.error });
      return;
    }
    onArrangement(result.next);
    setPicked(null);
    setNotice(success ? { tone: "ok", text: success } : null);
  }

  function drop(guestId: string, target: string) {
    const guest = guests.find(entry => entry.id === guestId) ?? null;
    if (target === "pool") {
      onArrangement(unplaceGuest(arrangement, guestId));
      setPicked(null);
      if (guest) setNotice({ tone: "ok", text: `${guestLabel(guest)} is waiting for a cabin.` });
      return;
    }
    if (!target.startsWith("cabin:")) return;
    const cabinId = target.slice(6);
    settle(placeGuest(arrangement, guests, guestId, { cabinId }, offers), guest ? `${guestLabel(guest)} is in ${cabinLabel(cabinId)}.` : null);
  }

  function choose(cabinId: string, kind: GuestKind, count: number) {
    settle(
      setCabinCount(arrangement, guests, cabinId, kind, count, offers),
      `${cabinLabel(cabinId)}: ${plural(count, kind === "adult" ? "adult" : "child", kind === "adult" ? "adults" : "children")}.`,
    );
  }

  function clear(cabinId: string) {
    const label = cabinLabel(cabinId);
    onArrangement(clearCabin(arrangement, cabinId));
    setNotice({ tone: "ok", text: `${label} is empty. Its guests are waiting in Who Is Travelling.` });
  }

  const { drag, begin, justDragged } = useGuestDrag(drop);

  function tap(guestId: string) {
    if (justDragged()) return;
    setPicked(current => (current === guestId ? null : guestId));
  }

  useEffect(() => {
    if (!picked) return;
    const cancel = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPicked(null);
    };
    window.addEventListener("keydown", cancel);
    return () => window.removeEventListener("keydown", cancel);
  }, [picked]);

  const tileProps = (guest: Guest) => ({
    guest,
    where: placedIn(guest.id),
    picked: picked === guest.id,
    lifted: drag?.guestId === guest.id,
    onBegin: begin,
    onTap: tap,
  });

  function arrange(types: PhysicalRoomType[]): string | null {
    const failure = onArrange(types);
    if (!failure) {
      setPicked(null);
      setNotice({ tone: "ok", text: "Your guests are in their cabins. Move anyone you like." });
    }
    return failure;
  }

  /** Every guest back to Who Is Travelling, after the guest confirms it in the dialog. */
  function undoAll() {
    onArrangement(EMPTY_ARRANGEMENT);
    setPicked(null);
    setChoosing(false);
    setNotice({ tone: "ok", text: "Every arrangement was undone. Your guests are waiting in Who Is Travelling." });
    undoDialog.current?.close();
  }

  /** From the desktop preview: list just this type's cabins and bring them into view. */
  function showCabins(type: PhysicalRoomType) {
    setFilter([type]);
    setPreviewType(type);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.requestAnimationFrame(() =>
      document.getElementById("hj-cabins")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" }),
    );
  }

  const visibleTypes = sailing.types.filter(type => filter.length === 0 || filter.includes(type.roomType));
  const hiddenWithGuests = arrangement.cabins.filter(cabin => !visibleTypes.some(type => type.roomType === cabin.roomType));

  const pool = (variant: "panel" | "tray") => (
    <div className={`hj-pool hj-pool--${variant}${drag?.over === "pool" ? " hj-drop--over" : ""}`} data-hj-drop="pool">
      {waiting.length > 0 ? (
        <>
          <span className="hj-pool__label">{waiting.length === 1 ? "1 guest to place" : `${waiting.length} guests to place`}</span>
          <div className="hj-pool__tiles">
            {waiting.map(guest => <GuestTile key={guest.id} {...tileProps(guest)} />)}
          </div>
        </>
      ) : (
        <span className="hj-pool__done"><span aria-hidden>✓</span> Everyone has a cabin</span>
      )}
      {pickedGuest && placedIn(pickedGuest.id) ? (
        <button type="button" className="hj-linkbtn" onClick={() => drop(pickedGuest.id, "pool")}>
          Take {guestLabel(pickedGuest)} out of {placedIn(pickedGuest.id)}
        </button>
      ) : null}
    </div>
  );

  const ready = issues.length === 0;
  const reminder = placementReminder(arrangement, guests);
  const actions = (compact: boolean) => (
    <div className="hj-party__actions">
      <button type="button" className="hj-btn hj-btn--wide" disabled={busy || !ready} onClick={onContinue}>
        {busy ? "Checking availability…" : "Continue to details"} <span aria-hidden>→</span>
      </button>
      {!ready ? <p className="hj-party__blocker">{reminder ?? issues[0]}</p> : null}
      <button type="button" className="hj-btn hj-btn--ghost" aria-label="Back to journey" onClick={onBack}>
        ← {compact ? "Back" : "Back to journey"}
      </button>
    </div>
  );

  return (
    <>
      <div className="hj-suites-head">
        {alert ? <p className="hj-alert" role="alert">{alert}</p> : null}
        <PanelHead
          step={2}
          titleId="hj-suites-title"
          title="Select Your Cabin or Suite"
          lede="Every cabin on the boat for your date. Put your guests into the cabins you want — drag them in, or choose how many adults and children on the cabin."
        />
      </div>

      {desktop ? (
        <SuitesBrowse
          duration={duration}
          sailing={sailing}
          previewType={previewType}
          previewLabel={cabinLabel(previewCabin)}
          arrangement={arrangement}
          guests={guests}
          onShowCabins={showCabins}
        />
      ) : null}

      <section className="hj-panel hj-suites" id="hj-cabins" aria-labelledby="hj-suites-title">
        <span className="hj-suites__label">Every cabin on this sailing · place your guests</span>
        <RoomFilter
          sailing={sailing}
          selected={filter}
          onToggle={type => setFilter(current => (current.includes(type) ? current.filter(entry => entry !== type) : [...current, type]))}
          onAll={() => setFilter([])}
        />

        {hiddenWithGuests.length > 0 ? (
          <p className="hj-filter__hidden">
            {plural(hiddenWithGuests.length, "cabin")} with your guests {hiddenWithGuests.length === 1 ? "is" : "are"} hidden by the filter.{" "}
            <button type="button" className="hj-linkbtn" onClick={() => setFilter([])}>Show all rooms</button>
          </p>
        ) : null}

        <div className={`hj-rooms${drag || pickedGuest ? " hj-rooms--moving" : ""}`}>
          {visibleTypes.map(type => {
            const visuals = getBookingRoomVisuals(type.roomType, type.roomType);
            const slug = buildCabinSlug(duration, RESIDENCE_SLUG[type.roomType]);
            const capacity = roomCapacity(type.roomType);

            // One card's full markup, shared by cabin 1 (always shown) and the
            // rest (tablet/phone: behind a "N more" toggle, no JS).
            const cabinCard = (index: number) => {
              const unavailable = index >= type.availableCabins;
              const cabinId = slotId(type.roomType, index);
              const label = cabinLabel(cabinId);
              const inside = unavailable ? [] : occupants(arrangement, guests, cabinId);
              const adultsIn = inside.filter(guest => guest.kind === "adult").length;
              const used = inside.length > 0;
              const full = inside.length >= capacity;
              const noAdult = used && adultsIn === 0;
              const cabinKey = `cabin:${cabinId}`;
              const pickedHere = pickedGuest ? arrangement.placement[pickedGuest.id] === cabinId : false;
              const canTake = !unavailable && Boolean(pickedGuest) && !pickedHere && !full;
              const shown = desktop && previewCabin === cabinId;
              const incl = inclusionsFor(type.roomType);

              return (
                <article
                  key={cabinId}
                  className={`hj-cabin-card${used ? " hj-cabin-card--used" : ""}${full ? " hj-cabin-card--full" : ""}${noAdult ? " hj-cabin-card--warn" : ""}${unavailable ? " hj-cabin-card--out" : ""}${canTake ? " hj-cabin-card--target" : ""}${shown ? " hj-cabin-card--shown" : ""}${drag?.over === cabinKey ? " hj-drop--over" : ""}`}
                  data-hj-drop={unavailable ? undefined : cabinKey}
                  onClick={desktop ? () => setPreviewCabin(cabinId) : undefined}
                  aria-label={unavailable ? `${type.roomType}, cabin ${index + 1}, unavailable for this date` : `${type.roomType}, cabin ${index + 1}, ${inside.length} of ${capacity} guests`}
                >
                  <div className="hj-cabin-card__media">
                    <Image
                      className="hj-cabin-card__img"
                      src={visuals.cover}
                      alt=""
                      width={720}
                      height={480}
                      sizes={index === 0 ? "(max-width: 600px) 92vw, (max-width: 1080px) 300px, 150px" : "(max-width: 1080px) 96px, 150px"}
                    />
                    <div className="hj-room__save">
                      <FavoriteButton type="cabin" slug={slug} name={`${type.roomType} on the ${voyage.title} voyage`} variant="card" />
                      {unavailable ? null : (
                        <AddToVoyageButton
                          kind="cabin"
                          slug={slug}
                          name={`${type.roomType} on the ${voyage.title} voyage`}
                          variant="card"
                          context={{ sailingDate, adults, children: childCount }}
                          verify={async () => {
                            const problem = await verifyCabinType(type.roomType);
                            setNotice(problem ? { tone: "warn", text: problem } : { tone: "ok", text: `${type.roomType} for this sailing is in your cart.` });
                            return problem;
                          }}
                        />
                      )}
                    </div>
                  </div>

                  <div className="hj-cabin-card__main">
                    <div className="hj-cabin-card__top">
                      <div className="hj-cabin-card__title">
                        <h3 className="hj-room__name">{type.roomType}</h3>
                        <span className="hj-cabin-card__no">Cabin {index + 1}</span>
                      </div>
                      {desktop ? (
                        // Shows this cabin on the left; the card stays a cabin guests can go into.
                        <button
                          type="button"
                          className="hj-cabin-card__pick"
                          aria-pressed={shown}
                          aria-label={shown ? `${label} is shown in the preview` : `Show ${label} in the preview`}
                          onClick={() => setPreviewCabin(cabinId)}
                        >
                          {shown ? <><IconCheck /> Selected</> : "Select"}
                        </button>
                      ) : null}
                      <div className="hj-cabin-card__price">
                        <span className="hj-room__amount">{money(type.priceCents)}</span>
                        <span className="hj-room__per">per cabin · entire voyage</span>
                      </div>
                    </div>

                    <p className="hj-room__facts">
                      <span className="hj-limit"><IconGuests /> Up to {capacity} guests</span>
                      <span><IconSize /> {type.sizeSqm} m²</span>
                      {CABIN_BED[type.roomType] ? <span><IconBed /> {CABIN_BED[type.roomType]}</span> : <span>{CABIN_NOTE[type.roomType].split(" · ")[0]}</span>}
                      <a
                        className="hj-room__link"
                        href={`/rooms/${RESIDENCE_SLUG[type.roomType]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View the ${type.roomType} (opens in a new tab)`}
                      >
                        View room <IconOpen />
                      </a>
                    </p>

                    {unavailable ? (
                      <p className="hj-cabin-card__out">Unavailable for this date</p>
                    ) : (
                      <div className="hj-cabin-card__fill">
                        <div className="hj-cabin-card__seats" aria-label={`${inside.length} of ${capacity} places taken`}>
                          {inside.map(guest => <GuestTile key={guest.id} {...tileProps(guest)} />)}
                          {Array.from({ length: capacity - inside.length }, (_, seat) => (
                            <span key={`seat-${seat}`} className="hj-seat" aria-hidden />
                          ))}
                          <span className="hj-cabin-card__count" aria-hidden>{inside.length}/{capacity}</span>
                        </div>
                        <div className="hj-cabin-card__menus">
                          <CountMenu label="Adults" cabinLabelText={label} options={cabinCountOptions(arrangement, guests, cabinId, "adult")} onChoose={count => choose(cabinId, "adult", count)} />
                          <CountMenu label="Children" cabinLabelText={label} options={cabinCountOptions(arrangement, guests, cabinId, "child")} onChoose={count => choose(cabinId, "child", count)} />
                        </div>
                        {used ? (
                          <button
                            type="button"
                            className="hj-cabin-card__clear"
                            aria-label={`Empty ${label}`}
                            title={`Empty ${label}`}
                            onClick={() => clear(cabinId)}
                          >
                            <IconClose />
                          </button>
                        ) : null}
                      </div>
                    )}

                    {noAdult ? <p className="hj-cabin-card__warn">Every cabin needs at least one adult.</p> : null}

                    <details className="hj-cabin-card__incl" onClick={event => event.stopPropagation()}>
                      <summary>What&rsquo;s included and what&rsquo;s not</summary>
                      <div className="hj-incl">
                        <div>
                          <span className="hj-incl__title">Included</span>
                          <ul className="hj-incl__list hj-incl__list--in">
                            {incl.include.map(item => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="hj-incl__title">Not included</span>
                          <ul className="hj-incl__list hj-incl__list--out">
                            {incl.exclude.map(item => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                      </div>
                    </details>
                  </div>

                  {canTake && pickedGuest ? (
                    // Laid over the cabin, so choosing a guest never moves the page.
                    <button type="button" className="hj-cab__place" aria-label={`Place ${guestLabel(pickedGuest)} in ${label}`} onClick={() => drop(pickedGuest.id, cabinKey)}>
                      <span aria-hidden>Place here</span>
                    </button>
                  ) : null}
                </article>
              );
            };

            const extra = Math.max(0, type.totalCabins - 1);
            const extraFree = Math.max(0, type.availableCabins - 1);
            const toggleId = `hj-cabin-more-${type.roomType.replace(/\s+/g, "-")}`;

            // A React.Fragment (not a div) so cabin 1 and the "more" group sit
            // as direct children of .hj-rooms, exactly like every other card.
            return (
              <Fragment key={type.roomType}>
                {cabinCard(0)}
                {extra > 0 ? (
                  <div className="hj-cabin-more">
                    {/* A plain checkbox toggle, not <details>: some browsers keep an
                        internal box for <details> content even under display:contents. */}
                    <input type="checkbox" id={toggleId} className="hj-sr hj-cabin-more__input" />
                    <label htmlFor={toggleId} className="hj-cabin-more__toggle">
                      <span className="hj-cabin-more__label">
                        {plural(extra, "more " + shortName(type.roomType))}
                      </span>
                      {extraFree > 0 ? <span className="hj-cabin-more__free">{extraFree} free</span> : null}
                      <span className="hj-cabin-more__chevron" aria-hidden />
                    </label>
                    <div className="hj-cabin-more__list">
                      {Array.from({ length: extra }, (_, i) => cabinCard(i + 1))}
                    </div>
                  </div>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      </section>

      <section className="hj-party" id="hj-party" aria-labelledby="hj-party-title" ref={partyRef}>
        <div className="hj-party__head">
          <h2 className="hj-party__title" id="hj-party-title">Who Is Travelling</h2>
          <span className="hj-rail__ankh" aria-hidden>☥</span>
        </div>
        <p className="hj-party__lede">
          Add your guests here, then put them in cabins: drag them, tap a guest and then a cabin, or use the Adults and Children menus on the cabin.
        </p>

        <div className="hj-counters">
          <Counter label="Adults" hint="12 years and over" value={adults} min={1} max={MAX_ADULTS} onChange={next => onCounts(next, childCount)} />
          <Counter label="Children" hint="Aged 2 – 11 years" value={childCount} min={0} max={MAX_CHILDREN} onChange={next => onCounts(adults, next)} />
        </div>

        {pool("panel")}

        <p className={`hj-party__notice${notice?.tone === "warn" ? " hj-party__notice--warn" : ""}`} role="status" aria-live="polite">
          {notice?.text ?? (pickedGuest ? `Choose a cabin for ${guestLabel(pickedGuest)}. Press Esc to cancel.` : "")}
        </p>

        {choosing ? (
          <ArrangeChooser
            sailing={sailing}
            guestCount={guests.length}
            initial={preferredType && (offers[preferredType]?.available ?? 0) > 0 ? [preferredType] : []}
            onArrange={arrange}
            onClose={() => setChoosing(false)}
          />
        ) : (
          <button type="button" className="hj-party__arrange" onClick={() => setChoosing(true)}>
            <IconWand className="hj-party__wand" />
            Arrange for me
          </button>
        )}

        <button
          type="button"
          className="hj-party__undo"
          disabled={arrangement.cabins.length === 0}
          onClick={() => undoDialog.current?.showModal()}
        >
          <IconUndo className="hj-party__undo-icon" />
          Undo arrangement
        </button>
        <dialog className="hj-confirm" ref={undoDialog} aria-labelledby="hj-undo-title" aria-describedby="hj-undo-text">
          <h2 className="hj-confirm__title" id="hj-undo-title">Undo every arrangement?</h2>
          <p className="hj-confirm__text" id="hj-undo-text">
            All arrangements will be undone: every guest leaves their cabin and waits in Who Is Travelling again, and no cabin stays
            chosen. The number of adults and children stays as it is.
          </p>
          <div className="hj-confirm__actions">
            <button type="button" className="hj-btn hj-btn--quiet" onClick={() => undoDialog.current?.close()}>
              Keep my arrangement
            </button>
            <button type="button" className="hj-btn" onClick={undoAll}>
              Undo all
            </button>
          </div>
        </dialog>

        <p className="hj-note-box">Each cabin shows how many guests it takes. Every cabin needs one adult. Rates are per cabin for the whole voyage.</p>

        <div className="hj-party__desk">{actions(false)}</div>
      </section>

      <div className={`hj-tray${waiting.length > 0 || pickedGuest ? " hj-tray--placing" : ""}`} aria-label="Guests still to place">
        {pool("tray")}
        {pickedGuest ? (
          <p className="hj-tray__hint">Now tap a cabin for {guestLabel(pickedGuest)}.</p>
        ) : waiting.length > 0 ? (
          <p className="hj-tray__hint hj-tray__hint--how">Tap a guest, then a cabin — or drag them in.</p>
        ) : null}
        {notice?.tone === "warn" ? <p className="hj-tray__hint hj-tray__hint--warn">{notice.text}</p> : null}
        {actions(true)}
        {mobileBar}
      </div>

      {rail}

      <DragGhost drag={drag} guests={guests} />
    </>
  );
}
