"use client";

import { useEffect, useMemo, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import Image from "next/image";
import { FavoriteButton } from "@/components/selection/FavoriteButton";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import { buildCabinSlug } from "@/lib/selection-catalog";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { itineraryFor } from "@/lib/booking-itineraries";
import { PHYSICAL_ROOM_TYPES, roomCapacity, type PhysicalRoomType } from "@/lib/physical-inventory";
import {
  MAX_ADULTS,
  MAX_CHILDREN,
  cabinCountLimit,
  cabinLabel,
  clearCabin,
  guestLabel,
  occupants,
  placeGuest,
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
import { useGuestDrag, type DragState } from "./useGuestDrag";
import { money, plural, type Sailing } from "./model";
import { PanelHead } from "./JourneyChrome";
import { IconAdult, IconBed, IconChild, IconClose, IconGuests, IconSize } from "./icons";

const CABIN_NOTE: Record<PhysicalRoomType, string> = {
  "Luxury King Cabin": "King bed · panoramic Nile view.",
  "Luxury Twin Cabin": "Twin beds · panoramic Nile view.",
  "Luxury Suite": "Separate lounge · panoramic Nile view.",
  "Royal Suite": "Private lounge · premium Nile view.",
};

const CABIN_BED: Partial<Record<PhysicalRoomType, string>> = {
  "Luxury King Cabin": "King bed",
  "Luxury Twin Cabin": "Twin beds",
};

/** Public room pages and the stable slugs Favorites and the cart store. */
const RESIDENCE_SLUG: Record<PhysicalRoomType, string> = {
  "Luxury King Cabin": "luxury-king-room",
  "Luxury Twin Cabin": "luxury-twin-room",
  "Luxury Suite": "luxury-suite",
  "Royal Suite": "royal-suite",
};

type Notice = { tone: "ok" | "warn"; text: string } | null;

function Counter({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="hj-counter">
      <span className="hj-counter__copy">
        <span className="hj-counter__label">{label}</span>
        <span className="hj-counter__hint">{hint}</span>
      </span>
      <span className="hj-counter__ctrl">
        <button type="button" className="hj-counter__btn" aria-label={`One fewer ${label.toLowerCase()}`} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
        <output className="hj-counter__value" aria-live="polite">{value}</output>
        <button type="button" className="hj-counter__btn" aria-label={`One more ${label.toLowerCase()}`} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
      </span>
    </div>
  );
}

function GuestTile({
  guest,
  where,
  picked,
  lifted,
  onBegin,
  onTap,
}: {
  guest: Guest;
  where: string | null;
  picked: boolean;
  lifted: boolean;
  onBegin: (event: ReactPointerEvent<HTMLElement>, guestId: string) => void;
  onTap: (guestId: string) => void;
}) {
  return (
    <button
      type="button"
      className={`hj-tile hj-tile--${guest.kind}${picked ? " hj-tile--picked" : ""}${lifted ? " hj-tile--lifted" : ""}`}
      aria-pressed={picked}
      aria-label={`${guestLabel(guest)}, ${where ? `in ${where}` : "not in a cabin yet"}. Drag to a cabin, or press and then choose a cabin.`}
      data-guest={guest.id}
      onPointerDown={event => onBegin(event, guest.id)}
      onClick={() => onTap(guest.id)}
    >
      <span className="hj-tile__icon" aria-hidden>{guest.kind === "adult" ? <IconAdult /> : <IconChild />}</span>
      <span className="hj-tile__label" aria-hidden>
        {guest.kind === "adult" ? "Adult" : "Child"} <b>{guest.number}</b>
      </span>
    </button>
  );
}

function RoomFilter({
  sailing,
  selected,
  onToggle,
  onAll,
  shownCabins,
}: {
  sailing: Sailing;
  selected: PhysicalRoomType[];
  onToggle: (type: PhysicalRoomType) => void;
  onAll: () => void;
  shownCabins: number;
}) {
  const available = (type: PhysicalRoomType) => sailing.types.find(entry => entry.roomType === type)?.availableCabins ?? 0;
  const total = PHYSICAL_ROOM_TYPES.reduce((sum, type) => sum + available(type), 0);
  return (
    <div className="hj-filter">
      <div className="hj-filter__pills" role="group" aria-label="Filter the available cabins">
        <button type="button" className="hj-filter__pill" aria-pressed={selected.length === 0} onClick={onAll}>
          All rooms
          <span className="hj-filter__count" aria-label={`${total} available`}>{total}</span>
        </button>
        {PHYSICAL_ROOM_TYPES.map(type => (
          <button
            key={type}
            type="button"
            className="hj-filter__pill"
            aria-pressed={selected.includes(type)}
            disabled={available(type) === 0}
            onClick={() => onToggle(type)}
          >
            {shortName(type)}
            <span className="hj-filter__count" aria-label={`${available(type)} available`}>{available(type)}</span>
          </button>
        ))}
      </div>
      <p className="hj-filter__shown" aria-live="polite">
        {shownCabins === 1 ? "Showing 1 available cabin" : `Showing ${shownCabins} available cabins`} for this sailing
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
  arrangeImpossible,
  issues,
  alert,
  busy,
  onBack,
  onContinue,
  verifyCabinType,
  guide,
  rail,
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
  onArrange: () => void;
  arrangeImpossible: boolean;
  issues: string[];
  alert: string | null;
  busy: boolean;
  onBack: () => void;
  onContinue: () => void;
  /** Live availability check for the cart: a message when the type is gone. */
  verifyCabinType: (roomType: PhysicalRoomType) => Promise<string | null>;
  guide: ReactNode;
  rail: ReactNode;
}) {
  const voyage = itineraryFor(duration);
  const [picked, setPicked] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [filter, setFilter] = useState<PhysicalRoomType[]>([]);

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
    const result = target.startsWith("cabin:")
      ? placeGuest(arrangement, guests, guestId, { cabinId: target.slice(6) }, offers)
      : target.startsWith("type:")
        ? placeGuest(arrangement, guests, guestId, { roomType: target.slice(5) as PhysicalRoomType }, offers)
        : null;
    if (!result) return;
    settle(result, guest && "cabinId" in result ? `${guestLabel(guest)} is in ${cabinLabel(result.cabinId)}.` : null);
  }

  function choose(cabinId: string, kind: GuestKind, count: number) {
    settle(
      setCabinCount(arrangement, guests, cabinId, kind, count, offers),
      `${cabinLabel(cabinId)} now has ${plural(count, kind === "adult" ? "adult" : "child", kind === "adult" ? "adults" : "children")}.`,
    );
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

  const visibleTypes = useMemo(
    () => sailing.types.filter(type => type.availableCabins > 0 && (filter.length === 0 || filter.includes(type.roomType))),
    [filter, sailing.types],
  );
  const shownCabins = visibleTypes.reduce((sum, type) => sum + type.availableCabins, 0);
  const hiddenWithGuests = arrangement.cabins.filter(cabin => !visibleTypes.some(type => type.roomType === cabin.roomType));

  const tileProps = (guest: Guest) => ({
    guest,
    where: placedIn(guest.id),
    picked: picked === guest.id,
    lifted: drag?.guestId === guest.id,
    onBegin: begin,
    onTap: tap,
  });

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
  const actions = (compact: boolean) => (
    <div className="hj-party__actions">
      <button type="button" className="hj-btn hj-btn--wide" disabled={busy || !ready} onClick={onContinue}>
        {busy ? "Checking availability…" : "Continue to details"} <span aria-hidden>→</span>
      </button>
      {!ready ? <p className="hj-party__blocker">{issues[0]}</p> : null}
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
          lede="Every cabin still free on your sailing. Place your guests by dragging them in, or choose the number of adults and children under each cabin."
        />
        {guide}
      </div>

      <section className="hj-panel hj-suites" aria-labelledby="hj-suites-title">
        <RoomFilter
          sailing={sailing}
          selected={filter}
          onToggle={type => setFilter(current => (current.includes(type) ? current.filter(entry => entry !== type) : [...current, type]))}
          onAll={() => setFilter([])}
          shownCabins={shownCabins}
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
            const inUse = arrangement.cabins.filter(cabin => cabin.roomType === type.roomType).length;
            const typeKey = `type:${type.roomType}`;
            const capacity = roomCapacity(type.roomType);

            return (
              <section
                key={type.roomType}
                className={`hj-rtype${inUse > 0 ? " hj-rtype--chosen" : ""}${drag?.over === typeKey ? " hj-drop--over" : ""}`}
                data-hj-drop={typeKey}
                aria-label={type.roomType}
              >
                <div className="hj-rtype__head">
                  <div className="hj-room__media">
                    <Image className="hj-room__img" src={visuals.cover} alt={type.roomType} width={360} height={240} sizes="(max-width: 480px) 96px, 150px" />
                    <div className="hj-room__save">
                      <FavoriteButton type="cabin" slug={slug} name={`${type.roomType} on the ${voyage.title} voyage`} variant="card" />
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
                    </div>
                  </div>

                  <div className="hj-room__body">
                    <h3 className="hj-room__name">{type.roomType}</h3>
                    <p className="hj-room__desc">{CABIN_NOTE[type.roomType]}</p>
                    <p className="hj-room__facts">
                      <span><IconGuests /> Sleeps {type.maxOccupancy}</span>
                      <span><IconSize /> {type.sizeSqm} m²</span>
                      {CABIN_BED[type.roomType] ? <span><IconBed /> {CABIN_BED[type.roomType]}</span> : null}
                    </p>
                    <a className="hj-room__link" href={`/rooms/${RESIDENCE_SLUG[type.roomType]}`} target="_blank" rel="noopener noreferrer">
                      View details <span aria-hidden>›</span>
                    </a>
                  </div>

                  <div className="hj-room__side">
                    <span className="hj-room__amount">{money(type.priceCents)}</span>
                    <span className="hj-room__per">per cabin · entire voyage</span>
                    <span className={`hj-room__state hj-room__state--${type.availableCabins <= 2 ? "low" : "open"}`}>
                      {plural(type.availableCabins, "cabin")} free{inUse > 0 ? ` · ${inUse} chosen` : ""}
                    </span>
                  </div>
                </div>

                <div className={`hj-cabs${capacity > 2 ? " hj-cabs--suite" : ""}`}>
                  {Array.from({ length: type.availableCabins }, (_, index) => {
                    const cabinId = slotId(type.roomType, index);
                    const label = cabinLabel(cabinId);
                    const inside = occupants(arrangement, guests, cabinId);
                    const adultsIn = inside.filter(guest => guest.kind === "adult").length;
                    const childrenIn = inside.length - adultsIn;
                    const used = inside.length > 0;
                    const noAdult = used && adultsIn === 0;
                    const cabinKey = `cabin:${cabinId}`;
                    const pickedHere = pickedGuest ? arrangement.placement[pickedGuest.id] === cabinId : false;
                    const canTake = Boolean(pickedGuest) && !pickedHere && inside.length < capacity;
                    const adultLimit = cabinCountLimit(arrangement, guests, cabinId, "adult");
                    const childLimit = cabinCountLimit(arrangement, guests, cabinId, "child");

                    return (
                      <div
                        key={cabinId}
                        className={`hj-cab${used ? " hj-cab--used" : ""}${noAdult ? " hj-cab--warn" : ""}${inside.length >= capacity ? " hj-cab--full" : ""}${drag?.over === cabinKey ? " hj-drop--over" : ""}${canTake ? " hj-cab--target" : ""}`}
                        data-hj-drop={cabinKey}
                        role="group"
                        aria-label={`${label}, ${inside.length} of ${capacity} guests`}
                      >
                        <div className="hj-cab__head">
                          <span className="hj-cab__name">{label}</span>
                          <span className="hj-cab__count">{inside.length} / {capacity}</span>
                          {used ? (
                            <button
                              type="button"
                              className="hj-cab__clear"
                              aria-label={`Empty ${label}`}
                              title={`Empty ${label}`}
                              onClick={() => {
                                onArrangement(clearCabin(arrangement, cabinId));
                                setNotice({ tone: "ok", text: `${label} is empty. Its guests are waiting for a cabin.` });
                              }}
                            >
                              <IconClose />
                            </button>
                          ) : null}
                        </div>

                        <div className="hj-cab__seats">
                          {inside.map(guest => <GuestTile key={guest.id} {...tileProps(guest)} />)}
                          {Array.from({ length: capacity - inside.length }, (_, seat) => (
                            <span key={`seat-${seat}`} className="hj-seat" aria-hidden />
                          ))}
                        </div>

                        <div className="hj-cab__menus">
                          <label className="hj-cab__menu">
                            <span>Adults</span>
                            <select
                              value={adultsIn}
                              aria-label={`Adults in ${label}`}
                              disabled={adultLimit === 0 && adultsIn === 0}
                              onChange={event => choose(cabinId, "adult", Number(event.target.value))}
                            >
                              {Array.from({ length: adultLimit + 1 }, (_, count) => <option key={count} value={count}>{count}</option>)}
                            </select>
                          </label>
                          <label className="hj-cab__menu">
                            <span>Children</span>
                            <select
                              value={childrenIn}
                              aria-label={`Children in ${label}`}
                              disabled={childLimit === 0 && childrenIn === 0}
                              onChange={event => choose(cabinId, "child", Number(event.target.value))}
                            >
                              {Array.from({ length: childLimit + 1 }, (_, count) => <option key={count} value={count}>{count}</option>)}
                            </select>
                          </label>
                        </div>

                        {noAdult ? <p className="hj-cab__warn">Add an adult to this cabin.</p> : null}

                        {canTake && pickedGuest ? (
                          // Laid over the cabin, so choosing a guest never moves the page.
                          <button
                            type="button"
                            className="hj-cab__place"
                            aria-label={`Place ${guestLabel(pickedGuest)} in ${label}`}
                            onClick={() => drop(pickedGuest.id, cabinKey)}
                          >
                            <span aria-hidden>Place here</span>
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {visibleTypes.length === 0 ? (
            <p className="hj-filter__empty">
              No cabins match this filter.{" "}
              <button type="button" className="hj-linkbtn" onClick={() => setFilter([])}>Show all rooms</button>
            </p>
          ) : null}
        </div>
      </section>

      <section className="hj-party" aria-labelledby="hj-party-title">
        <div className="hj-party__head">
          <h2 className="hj-party__title" id="hj-party-title">Who Is Travelling</h2>
          <span className="hj-rail__ankh" aria-hidden>☥</span>
        </div>
        <p className="hj-party__lede">
          Drag each guest into a cabin, tap a guest and then a cabin, or use the Adults and Children menus under each cabin.
        </p>

        <div className="hj-counters">
          <Counter label="Adults" hint="12 years and over" value={adults} min={1} max={MAX_ADULTS} onChange={next => onCounts(next, childCount)} />
          <Counter label="Children" hint="Aged 2 – 11 years" value={childCount} min={0} max={MAX_CHILDREN} onChange={next => onCounts(adults, next)} />
        </div>

        {pool("panel")}

        <p className={`hj-party__notice${notice?.tone === "warn" ? " hj-party__notice--warn" : ""}`} role="status" aria-live="polite">
          {notice?.text ?? (pickedGuest ? `Choose a cabin for ${guestLabel(pickedGuest)}. Press Esc to cancel.` : "")}
        </p>

        {arrangeImpossible ? (
          <p className="hj-party__notice hj-party__notice--warn">
            There are not enough free cabins on this sailing for {plural(guests.length, "guest")}. Try fewer guests or another date.
          </p>
        ) : (
          <button
            type="button"
            className="hj-party__arrange"
            onClick={() => {
              onArrange();
              setPicked(null);
              setNotice({ tone: "ok", text: "We have arranged your guests. Move anyone you like." });
            }}
          >
            Arrange for me
          </button>
        )}

        <p className="hj-note-box">Every cabin needs one adult. Children count toward occupancy. Rates are per cabin for the whole voyage.</p>

        <div className="hj-party__desk">{actions(false)}</div>
      </section>

      <div className="hj-tray" aria-label="Guests still to place">
        {pool("tray")}
        {pickedGuest ? <p className="hj-tray__hint">Now tap a cabin for {guestLabel(pickedGuest)}.</p> : null}
        {notice?.tone === "warn" ? <p className="hj-tray__hint hj-tray__hint--warn">{notice.text}</p> : null}
        {actions(true)}
      </div>

      {rail}

      <DragGhost drag={drag} guests={guests} />
    </>
  );
}

function DragGhost({ drag, guests }: { drag: DragState | null; guests: Guest[] }) {
  if (!drag) return null;
  const guest = guests.find(entry => entry.id === drag.guestId);
  if (!guest) return null;
  return (
    <div className={`hj-ghost hj-tile hj-tile--${guest.kind}`} style={{ left: drag.x, top: drag.y }} aria-hidden>
      <span className="hj-tile__icon">{guest.kind === "adult" ? <IconAdult /> : <IconChild />}</span>
      <span className="hj-tile__label">{guest.kind === "adult" ? "Adult" : "Child"} <b>{guest.number}</b></span>
    </div>
  );
}
