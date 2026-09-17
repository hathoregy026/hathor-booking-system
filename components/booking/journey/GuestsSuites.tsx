"use client";

import { Fragment, useEffect, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
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
  cabinCountOptions,
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
  "Luxury King Cabin": "King bed · panoramic Nile view",
  "Luxury Twin Cabin": "Twin beds · panoramic Nile view",
  "Luxury Suite": "Separate lounge · panoramic Nile view",
  "Royal Suite": "Private lounge · premium Nile view",
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
      aria-label={`${guestLabel(guest)}, ${where ? `in ${where}` : "waiting for a cabin"}. Drag to a cabin, or press and then choose a cabin.`}
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

/** A cabin's Adults or Children menu: numbers past its limit or past the waiting guests are shown but disabled. */
function CountMenu({
  label,
  cabinLabelText,
  options,
  onChoose,
}: {
  label: "Adults" | "Children";
  cabinLabelText: string;
  options: { current: number; limit: number; reachable: number };
  onChoose: (count: number) => void;
}) {
  return (
    <label className="hj-cab__menu">
      <span>{label}</span>
      <select
        value={options.current}
        aria-label={`${label} in ${cabinLabelText}`}
        onChange={event => onChoose(Number(event.target.value))}
      >
        {Array.from({ length: options.limit + 1 }, (_, count) => (
          <option key={count} value={count} disabled={count > options.reachable}>
            {count}
          </option>
        ))}
      </select>
    </label>
  );
}

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

/** "Arrange for me": asks which cabin types to use, then places everyone within the limits. */
function ArrangeChooser({
  sailing,
  guestCount,
  initial,
  onArrange,
  onClose,
}: {
  sailing: Sailing;
  guestCount: number;
  initial: PhysicalRoomType[];
  onArrange: (types: PhysicalRoomType[]) => string | null;
  onClose: () => void;
}) {
  const [types, setTypes] = useState<PhysicalRoomType[]>(initial);
  const [problem, setProblem] = useState<string | null>(null);

  return (
    <div className="hj-arrange" role="group" aria-labelledby="hj-arrange-title">
      <p className="hj-arrange__title" id="hj-arrange-title">Which cabins would you like?</p>
      <p className="hj-arrange__lede">Choose one or more types. We will place all {plural(guestCount, "guest")} within each cabin&apos;s limit.</p>
      <div className="hj-arrange__types">
        {sailing.types.map(type => {
          const free = type.availableCabins;
          const on = types.includes(type.roomType);
          return (
            <label key={type.roomType} className={`hj-arrange__type${on ? " hj-arrange__type--on" : ""}${free === 0 ? " hj-arrange__type--out" : ""}`}>
              <input
                type="checkbox"
                checked={on}
                disabled={free === 0}
                onChange={event => {
                  setProblem(null);
                  setTypes(current => (event.target.checked ? [...current, type.roomType] : current.filter(entry => entry !== type.roomType)));
                }}
              />
              <span>
                <strong>{shortName(type.roomType)}</strong>
                <span>{free === 0 ? "Unavailable for this date" : `${free} free · up to ${roomCapacity(type.roomType)} guests each`}</span>
              </span>
            </label>
          );
        })}
      </div>
      {problem ? <p className="hj-arrange__problem" role="alert">{problem}</p> : null}
      <div className="hj-arrange__actions">
        <button
          type="button"
          className="hj-btn"
          disabled={types.length === 0}
          onClick={() => {
            const failure = onArrange(types);
            if (failure) setProblem(failure);
            else onClose();
          }}
        >
          Arrange my guests
        </button>
        <button type="button" className="hj-btn hj-btn--ghost" onClick={onClose}>Cancel</button>
      </div>
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
  guide: ReactNode;
  rail: ReactNode;
}) {
  const voyage = itineraryFor(duration);
  const [picked, setPicked] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [filter, setFilter] = useState<PhysicalRoomType[]>([]);
  const [choosing, setChoosing] = useState(false);

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

  const visibleTypes = sailing.types.filter(type => filter.length === 0 || filter.includes(type.roomType));
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
          lede="Every cabin on the boat for your date. Put your guests into the cabins you want — drag them in, or choose how many adults and children on the cabin."
        />
        {guide}
      </div>

      <section className="hj-panel hj-suites" aria-labelledby="hj-suites-title">
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
            // rest (tablet/phone only: behind a native "N more" toggle, no JS —
            // see .hj-cabin-more in the CSS for how desktop forces it open).
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

              return (
                <article
                  key={cabinId}
                  className={`hj-cabin-card${used ? " hj-cabin-card--used" : ""}${full ? " hj-cabin-card--full" : ""}${noAdult ? " hj-cabin-card--warn" : ""}${unavailable ? " hj-cabin-card--out" : ""}${canTake ? " hj-cabin-card--target" : ""}${drag?.over === cabinKey ? " hj-drop--over" : ""}`}
                  data-hj-drop={unavailable ? undefined : cabinKey}
                  aria-label={unavailable ? `${type.roomType}, cabin ${index + 1}, unavailable for this date` : `${type.roomType}, cabin ${index + 1}, ${inside.length} of ${capacity} guests`}
                >
                  <div className="hj-cabin-card__media">
                    <Image className="hj-cabin-card__img" src={visuals.cover} alt="" width={360} height={240} sizes="(max-width: 480px) 96px, 150px" />
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
                      <div className="hj-cabin-card__price">
                        <span className="hj-room__amount">{money(type.priceCents)}</span>
                        <span className="hj-room__per">per cabin · entire voyage</span>
                      </div>
                    </div>

                    <p className="hj-room__facts">
                      <span className="hj-limit"><IconGuests /> Up to {capacity} guests</span>
                      <span><IconSize /> {type.sizeSqm} m²</span>
                      {CABIN_BED[type.roomType] ? <span><IconBed /> {CABIN_BED[type.roomType]}</span> : <span>{CABIN_NOTE[type.roomType].split(" · ")[0]}</span>}
                      <a className="hj-room__link" href={`/rooms/${RESIDENCE_SLUG[type.roomType]}`} target="_blank" rel="noopener noreferrer">
                        View details <span aria-hidden>›</span>
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
                            onClick={() => {
                              onArrangement(clearCabin(arrangement, cabinId));
                              setNotice({ tone: "ok", text: `${label} is empty. Its guests are waiting in Who Is Travelling.` });
                            }}
                          >
                            <IconClose />
                          </button>
                        ) : null}
                      </div>
                    )}

                    {noAdult ? <p className="hj-cabin-card__warn">Every cabin needs at least one adult.</p> : null}
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
            // as direct children of .hj-rooms, exactly like every other card —
            // no wrapper, so no CSS is needed to make desktop look unwrapped.
            return (
              <Fragment key={type.roomType}>
                {cabinCard(0)}
                {extra > 0 ? (
                  <div className="hj-cabin-more">
                    {/* A plain checkbox toggle, not <details>: some browsers keep an
                        internal box for <details> content even under display:contents,
                        so desktop's "always open" state could not be forced reliably. */}
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

      <section className="hj-party" aria-labelledby="hj-party-title">
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
            onArrange={types => {
              const failure = onArrange(types);
              if (!failure) {
                setPicked(null);
                setNotice({ tone: "ok", text: "Your guests are in their cabins. Move anyone you like." });
              }
              return failure;
            }}
            onClose={() => setChoosing(false)}
          />
        ) : (
          <button type="button" className="hj-party__arrange" onClick={() => setChoosing(true)}>
            Arrange for me
          </button>
        )}

        <p className="hj-note-box">Each cabin shows how many guests it takes. Every cabin needs one adult. Rates are per cabin for the whole voyage.</p>

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
