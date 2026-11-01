"use client";
import { RoomPriceUnit } from "@/components/ui/RoomPriceUnit";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { ManagedSourceImage as Image } from "@/components/public/ManagedSourceImage";
import { FavoriteButton } from "@/components/selection/FavoriteButton";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import { buildCabinSlug } from "@/lib/selection-catalog";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { bookingItinerary } from "@/lib/i18n/booking-itineraries";
import { roomFolioPanels } from "@/lib/i18n/rooms-copy";
import { localizedHref } from "@/lib/i18n/locale";
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
import type { Sailing } from "./model";
import { CurrencyAmount } from "@/components/public/CurrencyProvider";
import { PanelHead } from "./JourneyChrome";
import { IconBed, IconCheck, IconClose, IconGuests, IconOpen, IconSize, IconUndo, IconWand } from "./icons";

import { ArrangeChooser, CountMenu, Counter, DragGhost, GuestTile, RESIDENCE_SLUG } from "./SuitesParts";
import { SuitesBrowse } from "./SuitesBrowse";
import { folioVariantForRoomSlug } from "@/lib/room-folio-panels";
import { useDesktop } from "./useDesktop";
import { useStickyFit } from "./useStickyFit";
import { useBookingCopy } from "./useBookingCopy";

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
  const t = useBookingCopy();
  const info = (type: PhysicalRoomType) => sailing.types.find(entry => entry.roomType === type);
  const count = (types: readonly PhysicalRoomType[], key: "totalCabins" | "availableCabins") =>
    types.reduce<number>((sum, type) => sum + (info(type)?.[key] ?? 0), 0);
  const shown: readonly PhysicalRoomType[] = selected.length === 0 ? PHYSICAL_ROOM_TYPES : selected;

  return (
    <div className="hj-filter">
      <div className="hj-filter__pills" role="group" aria-label={t.suites.filterLabel}>
        <button type="button" className="hj-filter__pill" aria-pressed={selected.length === 0} onClick={onAll}>
          {t.suites.allRooms}
          <span className="hj-filter__count" aria-label={t.suites.cabinCount(count(PHYSICAL_ROOM_TYPES, "totalCabins"))}>{count(PHYSICAL_ROOM_TYPES, "totalCabins")}</span>
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
            <span className="hj-filter__count" aria-label={t.suites.cabinCount(info(type)?.totalCabins ?? 0)}>{info(type)?.totalCabins ?? 0}</span>
          </button>
        ))}
      </div>
      <p className="hj-filter__shown" aria-live="polite">
        {t.suites.showing(count(shown, "totalCabins"), count(shown, "availableCabins"))}
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
  preferredRoomId,
  onReleasePreferredRoom,
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
  preferredRoomId: string | null;
  onReleasePreferredRoom: () => void;
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
  const t = useBookingCopy();
  const voyage = bookingItinerary(duration, t.locale);
  /** What each cabin includes and leaves out: the room pages' own lists. */
  const inclusionsFor = (type: PhysicalRoomType) => roomFolioPanels(folioVariantForRoomSlug(RESIDENCE_SLUG[type]), t.locale);
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
    return cabinId && arrangement.cabins.some(cabin => cabin.id === cabinId) ? cabinLabel(cabinId, t) : null;
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
      if (guest) setNotice({ tone: "ok", text: t.suites.notices.waiting(guestLabel(guest, t)) });
      return;
    }
    if (!target.startsWith("cabin:")) return;
    const cabinId = target.slice(6);
    settle(placeGuest(arrangement, guests, guestId, { cabinId }, offers, t), guest ? t.suites.notices.placed(guestLabel(guest, t), cabinLabel(cabinId, t)) : null);
  }

  function choose(cabinId: string, kind: GuestKind, count: number) {
    settle(
      setCabinCount(arrangement, guests, cabinId, kind, count, offers, t),
      t.suites.notices.counted(cabinLabel(cabinId, t), t.kindCount(count, kind)),
    );
  }

  function clear(cabinId: string) {
    const label = cabinLabel(cabinId, t);
    onArrangement(clearCabin(arrangement, cabinId));
    setNotice({ tone: "ok", text: t.suites.notices.emptied(label) });
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
      setNotice({ tone: "ok", text: t.suites.notices.arranged });
    }
    return failure;
  }

  /** Every guest back to Who Is Travelling, after the guest confirms it in the dialog. */
  function undoAll() {
    onArrangement(EMPTY_ARRANGEMENT);
    setPicked(null);
    setChoosing(false);
    setNotice({ tone: "ok", text: t.suites.notices.undone });
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
          <span className="hj-pool__label">{t.suites.toPlace(waiting.length)}</span>
          <div className="hj-pool__tiles">
            {waiting.map(guest => <GuestTile key={guest.id} {...tileProps(guest)} />)}
          </div>
        </>
      ) : (
        <span className="hj-pool__done"><span aria-hidden>✓</span> {t.suites.everyoneHasCabin}</span>
      )}
      {pickedGuest && placedIn(pickedGuest.id) ? (
        <button type="button" className="hj-linkbtn" onClick={() => drop(pickedGuest.id, "pool")}>
          {t.suites.takeOut(guestLabel(pickedGuest, t), placedIn(pickedGuest.id) ?? "")}
        </button>
      ) : null}
    </div>
  );

  const ready = issues.length === 0;
  const reminder = placementReminder(arrangement, guests, t);
  const actions = (compact: boolean) => (
    <div className="hj-party__actions">
      <button type="button" className="hj-btn hj-btn--wide" disabled={busy || !ready} onClick={onContinue}>
        {busy ? t.journey.checking : t.suites.continueToDetails} <span aria-hidden>→</span>
      </button>
      {!ready ? <p className="hj-party__blocker">{reminder ?? issues[0]}</p> : null}
      <button type="button" className="hj-btn hj-btn--ghost" aria-label={t.suites.backToJourney} onClick={onBack}>
        ← {compact ? t.suites.back : t.suites.backToJourney}
      </button>
    </div>
  );

  return (
    <>
      <div className="hj-suites-head">
        {alert ? <p className="hj-alert" role="alert">{alert}</p> : null}
        {preferredRoomId ? <div className="hj-map-choice" role="status"><span>{t.suites.mapChoice(preferredRoomId)}</span><button type="button" onClick={onReleasePreferredRoom}>{t.journey.chooseFreely}</button></div> : null}
        <PanelHead
          step={2}
          titleId="hj-suites-title"
          title={t.suites.title}
          lede={t.suites.lede}
        />
      </div>

      {desktop ? (
        <SuitesBrowse
          duration={duration}
          sailing={sailing}
          previewType={previewType}
          previewLabel={cabinLabel(previewCabin, t)}
          arrangement={arrangement}
          guests={guests}
          onShowCabins={showCabins}
        />
      ) : null}

      <section className="hj-panel hj-suites" id="hj-cabins" aria-labelledby="hj-suites-title">
        <span className="hj-suites__label">{t.suites.everyCabin}</span>
        <RoomFilter
          sailing={sailing}
          selected={filter}
          onToggle={type => setFilter(current => (current.includes(type) ? current.filter(entry => entry !== type) : [...current, type]))}
          onAll={() => setFilter([])}
        />

        {hiddenWithGuests.length > 0 ? (
          <p className="hj-filter__hidden">
            {t.suites.hiddenByFilter(hiddenWithGuests.length)}{" "}
            <button type="button" className="hj-linkbtn" onClick={() => setFilter([])}>{t.suites.showAllRooms}</button>
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
              const label = cabinLabel(cabinId, t);
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
                  aria-label={unavailable ? t.suites.cabinOutAria(type.roomType, index + 1) : t.suites.cabinAria(type.roomType, index + 1, inside.length, capacity)}
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
                      <FavoriteButton type="cabin" slug={slug} name={t.suites.saveName(type.roomType, voyage.title)} variant="card" />
                      {unavailable ? null : (
                        <AddToVoyageButton
                          kind="cabin"
                          slug={slug}
                          name={t.suites.saveName(type.roomType, voyage.title)}
                          variant="card"
                          context={{ sailingDate, adults, children: childCount }}
                          verify={async () => {
                            const problem = await verifyCabinType(type.roomType);
                            setNotice(problem ? { tone: "warn", text: problem } : { tone: "ok", text: t.suites.inCart(type.roomType) });
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
                        <span className="hj-cabin-card__no">{t.suites.cabinNumber(index + 1)}</span>
                      </div>
                      {desktop ? (
                        // Shows this cabin on the left; the card stays a cabin guests can go into.
                        <button
                          type="button"
                          className="hj-cabin-card__pick"
                          aria-pressed={shown}
                          aria-label={shown ? t.suites.shownInPreview(label) : t.suites.showInPreview(label)}
                          onClick={() => setPreviewCabin(cabinId)}
                        >
                          {shown ? <><IconCheck /> {t.suites.selected}</> : t.suites.select}
                        </button>
                      ) : null}
                      <div className="hj-cabin-card__price">
                        <span className="hj-room__amount"><CurrencyAmount cents={type.priceCents} /><RoomPriceUnit roomType={type.roomType} locale={t.locale} /></span>
                        <span className="hj-room__per">{t.suites.entireVoyage}</span>
                      </div>
                    </div>

                    <p className="hj-room__facts">
                      <span className="hj-limit"><IconGuests /> {t.suites.upTo(capacity)}</span>
                      <span><IconSize /> {type.sizeSqm} m²</span>
                      {t.suites.bed[type.roomType] ? <span><IconBed /> {t.suites.bed[type.roomType]}</span> : <span>{t.suites.note[type.roomType]}</span>}
                      <a
                        className="hj-room__link"
                        href={localizedHref(`/rooms/${RESIDENCE_SLUG[type.roomType]}`, t.locale)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t.suites.viewRoomLabel(type.roomType)}
                      >
                        {t.suites.viewRoom} <IconOpen />
                      </a>
                    </p>

                    {unavailable ? (
                      <p className="hj-cabin-card__out">{t.suites.unavailableDate}</p>
                    ) : (
                      <div className="hj-cabin-card__fill">
                        <div className="hj-cabin-card__seats" aria-label={t.suites.seatsTaken(inside.length, capacity)}>
                          {inside.map(guest => <GuestTile key={guest.id} {...tileProps(guest)} />)}
                          {Array.from({ length: capacity - inside.length }, (_, seat) => (
                            <span key={`seat-${seat}`} className="hj-seat" aria-hidden />
                          ))}
                          <span className="hj-cabin-card__count" aria-hidden>{inside.length}/{capacity}</span>
                        </div>
                        <div className="hj-cabin-card__menus">
                          <CountMenu label={t.counters.adults} cabinLabelText={label} options={cabinCountOptions(arrangement, guests, cabinId, "adult")} onChoose={count => choose(cabinId, "adult", count)} />
                          <CountMenu label={t.counters.children} cabinLabelText={label} options={cabinCountOptions(arrangement, guests, cabinId, "child")} onChoose={count => choose(cabinId, "child", count)} />
                        </div>
                        {used ? (
                          <button
                            type="button"
                            className="hj-cabin-card__clear"
                            aria-label={t.suites.empty(label)}
                            title={t.suites.empty(label)}
                            onClick={() => clear(cabinId)}
                          >
                            <IconClose />
                          </button>
                        ) : null}
                      </div>
                    )}

                    {noAdult ? <p className="hj-cabin-card__warn">{t.suites.needsAdult}</p> : null}

                    <details className="hj-cabin-card__incl" onClick={event => event.stopPropagation()}>
                      <summary>{t.suites.inclusions}</summary>
                      <div className="hj-incl">
                        <div>
                          <span className="hj-incl__title">{t.suites.included}</span>
                          <ul className="hj-incl__list hj-incl__list--in">
                            {incl.include.map(item => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="hj-incl__title">{t.suites.notIncluded}</span>
                          <ul className="hj-incl__list hj-incl__list--out">
                            {incl.exclude.map(item => <li key={item}>{item}</li>)}
                          </ul>
                        </div>
                      </div>
                    </details>
                  </div>

                  {canTake && pickedGuest ? (
                    // Laid over the cabin, so choosing a guest never moves the page.
                    <button type="button" className="hj-cab__place" aria-label={t.suites.placeIn(guestLabel(pickedGuest, t), label)} onClick={() => drop(pickedGuest.id, cabinKey)}>
                      <span aria-hidden>{t.suites.placeHere}</span>
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
                        {t.suites.more(extra, shortName(type.roomType))}
                      </span>
                      {extraFree > 0 ? <span className="hj-cabin-more__free">{t.suites.free(extraFree)}</span> : null}
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
          <h2 className="hj-party__title" id="hj-party-title">{t.suites.party}</h2>
          <span className="hj-rail__ankh" aria-hidden>☥</span>
        </div>
        <p className="hj-party__lede">
          {t.suites.partyLede}
        </p>

        <div className="hj-counters">
          <Counter label={t.counters.adults} hint={t.counters.adultsHint} value={adults} min={1} max={MAX_ADULTS} onChange={next => onCounts(next, childCount)} />
          <Counter label={t.counters.children} hint={t.counters.childrenHint} value={childCount} min={0} max={MAX_CHILDREN} onChange={next => onCounts(adults, next)} />
        </div>

        {pool("panel")}

        <p className={`hj-party__notice${notice?.tone === "warn" ? " hj-party__notice--warn" : ""}`} role="status" aria-live="polite">
          {notice?.text ?? (pickedGuest ? t.suites.choosing(guestLabel(pickedGuest, t)) : "")}
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
            {t.suites.arrangeForMe}
          </button>
        )}

        <button
          type="button"
          className="hj-party__undo"
          disabled={arrangement.cabins.length === 0}
          onClick={() => undoDialog.current?.showModal()}
        >
          <IconUndo className="hj-party__undo-icon" />
          {t.suites.undoArrangement}
        </button>
        <dialog className="hj-confirm" ref={undoDialog} aria-labelledby="hj-undo-title" aria-describedby="hj-undo-text">
          <h2 className="hj-confirm__title" id="hj-undo-title">{t.suites.undoTitle}</h2>
          <p className="hj-confirm__text" id="hj-undo-text">
            {t.suites.undoText}
          </p>
          <div className="hj-confirm__actions">
            <button type="button" className="hj-btn hj-btn--quiet" onClick={() => undoDialog.current?.close()}>
              {t.suites.keep}
            </button>
            <button type="button" className="hj-btn" onClick={undoAll}>
              {t.suites.undoAll}
            </button>
          </div>
        </dialog>

        <p className="hj-note-box">{t.suites.noteBox}</p>

        <div className="hj-party__desk">{actions(false)}</div>
      </section>

      <div className={`hj-tray${waiting.length > 0 || pickedGuest ? " hj-tray--placing" : ""}`} aria-label={t.suites.trayLabel}>
        {pool("tray")}
        {pickedGuest ? (
          <p className="hj-tray__hint">{t.suites.tapCabinFor(guestLabel(pickedGuest, t))}</p>
        ) : waiting.length > 0 ? (
          <p className="hj-tray__hint hj-tray__hint--how">{t.suites.howTo}</p>
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
