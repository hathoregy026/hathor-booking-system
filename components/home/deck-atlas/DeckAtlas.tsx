"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CABIN_NOTE, RESIDENCE_SLUG } from "@/components/booking/journey/SuitesParts";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";
import type { SailingAvailability } from "@/lib/availability-service";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { bookingHorizonYear } from "@/lib/booking-horizon";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { PHYSICAL_ROOM_TYPES, roomCapacity, type PhysicalRoomType } from "@/lib/physical-inventory";
import { buildCabinSlug } from "@/lib/selection-catalog";
import type { ShipRoom } from "@/lib/ship-experience";
import { DEFAULT_SHIP_EXPERIENCE, SHIP_REGIONS, type ShipDeckId, type ShipExperienceConfig, type ShipSlotId } from "@/lib/ship-experience-shared";
import { DeckAtlasPlan, type AtlasPlanRoom, type AtlasState, type SpotId } from "./DeckAtlasPlan";
import { DeckAtlasRoomModal, type AtlasSheet, type RoomSheet } from "./DeckAtlasRoomModal";
import { RoomPriceUnit } from "@/components/ui/RoomPriceUnit";
import { facilitiesWith, facilityMark, isFacilityId, type Facility, type FacilityId } from "./facilities";
import { DeckElevation } from "./DeckElevation";
import "./deck-atlas.css";

type Payload = { config: ShipExperienceConfig; rooms: ShipRoom[]; sailings: SailingAvailability[]; availabilityError?: boolean };
type AtlasRoom = AtlasPlanRoom & {
  /** The room's own name on the ship ("Room 3"); `label` is its number on the plan. */
  plan: string;
  /** An optional line from the dashboard, shown in the room's pop-up. */
  blurb: string | null;
  room?: ShipRoom;
  /** The booking catalogue's type; null until the catalogue has answered. */
  type: string | null;
  sizeSqm: number | null;
  capacity: number | null;
  note: string | null;
  gallery: readonly string[];
  /** The plan room is not in the booking catalogue, so its photographs show a comparable cabin. */
  comparable: boolean;
};

const VOYAGES: { value: StayDurationValue; label: string }[] = [
  { value: "3-nights-aswan-luxor", label: "3 nights · Aswan to Luxor" },
  { value: "4-nights-luxor-aswan", label: "4 nights · Luxor to Aswan" },
  { value: "7-nights-luxor-aswan-luxor", label: "7 nights · Round trip" },
];
const DECK_ORDER: ShipDeckId[] = ["lower", "main", "sun"];
const DECK_NO: Record<ShipDeckId, string> = { lower: "01", main: "02", sun: "03" };
const REQUEST_GROUP = "On request";
const isPhysical = (type: string): type is PhysicalRoomType => (PHYSICAL_ROOM_TYPES as readonly string[]).includes(type);
const SPACE_KIND: Record<Facility["kind"], string> = { guest: "Shared space", crew: "Crew & service" };
/* All four suites sleep in a king bed; the catalogue notes name the lounge instead. */
const noteOf = (type: PhysicalRoomType) => type === "Luxury Suite" || type === "Royal Suite" ? `King bed · ${CABIN_NOTE[type]}` : CABIN_NOTE[type];
/** Deep link from the dashboard: `/?ship-room=K02&ship-voyage=4-nights-luxor-aswan&ship-date=2026-11-21#explore-hathor`. */
type ShipTarget = { room: string; date: string | null };

const utc = { timeZone: "UTC" } as const;
const shortDate = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", ...utc }).format(new Date(iso));
const dayDate = (iso: string) => new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", ...utc }).format(new Date(iso));
/** "21 – 25 Nov 2026" (or across months, "29 Nov – 2 Dec 2026"): the nights a booked room is taken. */
const stayRange = (from: string, to: string) => {
  const start = new Date(from), end = new Date(to);
  const sameMonth = start.getUTCMonth() === end.getUTCMonth() && start.getUTCFullYear() === end.getUTCFullYear();
  const head = new Intl.DateTimeFormat("en-GB", sameMonth ? { day: "numeric", ...utc } : { day: "numeric", month: "short", ...utc }).format(start);
  return `${head} – ${shortDate(to)}`;
};
const usd = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(cents / 100);

function bookingMonths(now: Date) {
  const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", ...utc });
  const endYear = bookingHorizonYear(now);
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const months: { value: string; label: string }[] = [];
  while (cursor.getUTCFullYear() <= endYear) {
    months.push({ value: cursor.toISOString().slice(0, 7), label: monthName.format(cursor) });
    cursor.setUTCMonth(cursor.getUTCMonth() + 1);
  }
  return months;
}

const specOf = (room: AtlasRoom) =>
  [room.sizeSqm ? `${room.sizeSqm} m²` : null, room.capacity ? `Up to ${room.capacity} guests` : null, room.note].filter(Boolean).join(" · ") || null;

/** A boxed field, as in the original ship section: label above, native select inside a warm-wash box. */
function Field({ label, wide, disabled, value, onChange, children }: {
  label: string; wide?: boolean; disabled?: boolean; value: string;
  onChange: (value: string) => void; children: ReactNode;
}) {
  return (
    <label className={`da-box${wide ? " da-box--wide" : ""}`} data-disabled={disabled || undefined}>
      <span className="da-box__label">{label}</span>
      <span className="da-box__control">
        <select value={value} disabled={disabled} onChange={event => onChange(event.target.value)}>{children}</select>
      </span>
    </label>
  );
}

export function DeckAtlas() {
  const rootRef = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const [inView, setInView] = useState(false);
  const [duration, setDuration] = useState<StayDurationValue>("7-nights-luxor-aswan-luxor");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const months = useMemo(() => bookingMonths(new Date()), []);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [deckId, setDeckId] = useState<ShipDeckId>("lower");
  const [sailingId, setSailingId] = useState("");
  const [selected, setSelected] = useState<ShipSlotId | null>(null);
  const [hovered, setHovered] = useState<SpotId | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  /* A shared space opened closer; spaces are never "selected" like cabins. */
  const [openSpace, setOpenSpace] = useState<FacilityId | null>(null);
  const [swiped, setSwiped] = useState(false);
  const [target, setTarget] = useState<ShipTarget | null>(null);

  /* Arriving from a booking in the dashboard: open that voyage and month, then the room. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("ship-room");
    if (!room) return;
    const voyage = params.get("ship-voyage");
    const date = params.get("ship-date");
    const validDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : null;
    if (voyage && VOYAGES.some(item => item.value === voyage)) setDuration(voyage as StayDurationValue); // eslint-disable-line react-hooks/set-state-in-effect -- read once from the address
    const thisMonth = new Date().toISOString().slice(0, 7);
    if (validDate && validDate.slice(0, 7) >= thisMonth) setMonth(validDate.slice(0, 7));
    setTarget({ room, date: validDate });
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(([entry]) => {
      setInView(entry.isIntersecting);
      if (entry.isIntersecting || still) setRevealed(true);
    }, { threshold: 0.18 });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/ship-experience?duration=${encodeURIComponent(duration)}&month=${encodeURIComponent(month)}`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Live availability is temporarily unavailable. You can still explore the decks.");
        return response.json() as Promise<Payload>;
      })
      .then(payload => {
        setData(payload);
        setSailingId(current => payload.sailings.some(sailing => sailing.scheduleId === current) ? current : payload.sailings.find(sailing => !sailing.soldOut)?.scheduleId ?? payload.sailings[0]?.scheduleId ?? "");
        /* The rooms arrived from the booking catalogue even when the dates did not. */
        setError(payload.availabilityError ? "Live availability is temporarily unavailable. You can still explore the decks." : null);
      })
      .catch(reason => { if (!controller.signal.aborted) { setSailingId(""); setError(reason instanceof Error ? reason.message : "Availability could not be loaded."); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [duration, month, retry]);

  useEffect(() => {
    if (!selected || modalOpen || openSpace) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, modalOpen, openSpace]);

  const config = data?.config ?? DEFAULT_SHIP_EXPERIENCE;
  const decks = config.decks.filter(item => item.visible);
  const deck = decks.find(item => item.id === deckId) ?? decks[0];
  const tabs = DECK_ORDER.flatMap(id => decks.filter(item => item.id === id));
  const slots = config.rooms.filter(slot => slot.visible && SHIP_REGIONS[slot.slotId].deck === deck.id);
  const allSpaces = facilitiesWith(config);
  const spaceById = new Map(allSpaces.map(item => [item.id, item]));
  const spaces = allSpaces.filter(space => space.deck === deck.id && space.visible !== false);
  const sailing = !loading && !error ? data?.sailings.find(item => item.scheduleId === sailingId) ?? null : null;
  const bookedLine = sailing ? `Booked · ${stayRange(sailing.departureTime, sailing.arrivalTime)}` : "Booked";

  /* Once the voyage has loaded (or failed to), take the linked room: its deck, its
     departure when that date is on sale, and its pop-up. */
  useEffect(() => {
    if (!target || loading) return;
    const slot = (data?.config ?? DEFAULT_SHIP_EXPERIENCE).rooms.find(item => item.roomId === target.room || item.slotId === target.room);
    const departure = target.date ? data?.sailings.find(item => item.departureTime.slice(0, 10) === target.date) : null;
    setTarget(null); // eslint-disable-line react-hooks/set-state-in-effect -- a one-time hand-off from the address
    if (departure) setSailingId(departure.scheduleId);
    if (!slot) return;
    setDeckId(SHIP_REGIONS[slot.slotId].deck);
    setSelected(slot.slotId);
    const section = rootRef.current;
    if (section) ensurePublicScrollController().scrollTo(section.getBoundingClientRect().top + window.scrollY, { immediate: true });
    window.setTimeout(() => setModalOpen(true), 450);
  }, [target, loading, data]);

  const rooms: AtlasRoom[] = slots.map(slot => {
    const room = slot.roomId ? data?.rooms.find(item => item.id === slot.roomId) : undefined;
    const state: AtlasState = !slot.roomId ? "request"
      : !room || !sailing ? "unknown"
      : sailing.types.some(type => type.freeCabins.some(cabin => cabin.id === room.id)) ? "open" : "closed";
    /* The booking catalogue is the only source of a room's type, name and size;
       nothing is guessed from the cabin code or the drawing while it loads. */
    const type = !slot.roomId ? REQUEST_GROUP : room?.roomType ?? null;
    const name = room?.name || slot.name;
    const visuals = !slot.roomId ? getBookingRoomVisuals(name, "Luxury King Cabin") : type ? getBookingRoomVisuals(name, type) : null;
    return {
      slotId: slot.slotId, label: slot.number, plan: slot.name, blurb: slot.description || null, name, state, room, type,
      sizeSqm: room?.sizeSqm ?? null,
      capacity: room?.capacity ?? (type && isPhysical(type) ? roomCapacity(type) : null),
      note: type && isPhysical(type) ? noteOf(type) : null,
      gallery: visuals?.gallery ?? [],
      comparable: !slot.roomId,
    };
  });

  const groups: { type: string; rooms: AtlasRoom[] }[] = [];
  for (const room of rooms) {
    if (!room.type) continue;
    const group = groups.find(item => item.type === room.type);
    if (group) group.rooms.push(room); else groups.push({ type: room.type, rooms: [room] });
  }
  groups.sort((a, b) => Number(a.type === REQUEST_GROUP) - Number(b.type === REQUEST_GROUP));

  const bookable = rooms.filter(room => room.state !== "request");
  const openCount = rooms.filter(room => room.state === "open").length;
  const priceOf = (type: string | null) => type ? sailing?.types.find(item => item.roomType === type)?.priceCents ?? null : null;

  const focusId: SpotId | null = hovered ?? openSpace ?? selected;
  const focus = rooms.find(room => room.slotId === focusId) ?? null;
  const focusSpace = isFacilityId(focusId) && spaceById.get(focusId)?.deck === deck.id ? spaceById.get(focusId) ?? null : null;
  const pick = rooms.find(room => room.slotId === selected) ?? null;
  const pickRoomId = slots.find(slot => slot.slotId === selected)?.roomId ?? null;
  const pickPrice = pick && pick.state !== "request" ? priceOf(pick.type) : null;
  const pickStatus = !pick ? "" : pick.state === "request" ? "Contact us about this room"
    : pick.state === "open" && sailing ? `Available · ${shortDate(sailing.departureTime)}`
    : pick.state === "closed" && sailing ? `Booked for ${dayDate(sailing.departureTime)} – ${dayDate(sailing.arrivalTime)}`
    : loading ? "Checking availability…" : "Choose a departure to check availability";
  /* The journey re-checks the cabin live; a departure is carried only when it is free on it. */
  const checkHref = pick && pickRoomId
    ? `/booking?duration=${encodeURIComponent(duration)}&roomId=${encodeURIComponent(pickRoomId)}${pick.state === "open" && sailing ? `&sailing=${sailing.departureTime.slice(0, 10)}` : ""}` : null;
  const residence = pick?.type && isPhysical(pick.type) ? RESIDENCE_SLUG[pick.type] : null;
  const sheet: RoomSheet | null = pick ? {
    kind: "room", key: pick.slotId, kicker: `${deck.name} · ${pick.plan}`, label: pick.label, name: pick.name,
    spec: [pick.sizeSqm ? `${pick.sizeSqm} m²` : null, pick.capacity ? `Up to ${pick.capacity} guests` : null].filter(Boolean).join(" · ") || null,
    note: pick.blurb,
    gallery: pick.gallery, galleryAlt: pick.comparable ? "A comparable cabin" : pick.name, galleryNote: pick.comparable ? "A comparable cabin" : null,
    deck: deck.id, areas: [SHIP_REGIONS[pick.slotId]],
    state: pick.state, status: pickStatus, price: pickPrice !== null ? usd(pickPrice) : null,
    roomType: pick.type,
    checkHref, viewHref: residence ? `/rooms/${residence}` : null,
    cabinSlug: residence && pickRoomId ? buildCabinSlug(duration, residence) : null,
  } : null;
  const space = openSpace ? spaceById.get(openSpace) ?? null : null;
  /* The space's own dashboard photo (Website Images → Ship deck plan). The hook runs
     on every render; its answer is used only when the open space has a slot. */
  const spacePhoto = useSiteImage(space?.photoSlot ?? "");
  const activeSheet: AtlasSheet | null = space ? {
    kind: "space", key: space.id, kicker: `${config.decks.find(item => item.id === space.deck)?.name ?? ""} · ${SPACE_KIND[space.kind]}`,
    name: space.name, line: space.line, gallery: space.photoSlot ? [originSrcForNextImage(spacePhoto.src)] : [],
    galleryAlt: spacePhoto.alt, gallerySlot: space.photoSlot ? spacePhoto.slot ?? space.photoSlot : null, galleryNote: null,
    deck: space.deck, areas: space.areas,
  } : modalOpen ? sheet : null;

  function chooseDeck(id: ShipDeckId) { setDeckId(id); setSelected(null); setHovered(null); setModalOpen(false); setOpenSpace(null); }
  function chooseRoom(id: ShipSlotId) { setSelected(id); setModalOpen(true); }
  function showSpace(id: FacilityId) { setOpenSpace(id); setHovered(null); }
  function changeVoyage(next: () => void) { setLoading(true); setError(null); setSailingId(""); next(); }

  const sailings = data?.sailings ?? [];
  const departureEmpty = loading ? "Checking dates…" : error ? "Please retry" : "No scheduled dates";

  return (
    <section ref={rootRef} id="explore-hathor" className="deck-atlas" aria-labelledby="da-title" data-revealed={revealed || undefined} data-in-view={inView || undefined}>
      <header className="da-mast">
        <div className="da-mast__copy">
          <p className="da-kicker">{config.kicker}</p>
          <h2 id="da-title" className="da-title"><span>{config.title}</span></h2>
          <p className="da-standfirst"><span className="da-standfirst__lead">{config.eyebrow}</span> {config.introduction}</p>
        </div>
        <DeckElevation decks={config.decks} active={deck.id} onChange={chooseDeck} />
      </header>

      <div className="da-stage" data-has-selection={pick ? "" : undefined}>
        <figure className="da-plan" data-deck={deck.id}>
          <div className="da-plan__meta">
            <p className="da-plan__caption" key={focusId ?? deck.id} aria-hidden={focus || focusSpace ? "true" : undefined}>
              {focusSpace ? <>
                <span className="da-plan__plate">{facilityMark(focusSpace.id)} · {SPACE_KIND[focusSpace.kind]}</span>
                <span className="da-plan__title">{focusSpace.name}</span>
                <span className="da-plan__aside">{focusSpace.kind === "crew" ? "Not open to guests" : "Select to see it closer"}</span>
              </> : focus ? <>
                <span className="da-plan__plate">{focus.plan}</span>
                <span className="da-plan__title">{focus.name}</span>
                <span className="da-plan__aside">{focus.state === "request" ? "On request" : focus.state === "closed" ? bookedLine : specOf(focus)?.split(" · ").slice(0, 2).join(" · ")}</span>
              </> : <>
                <span className="da-plan__plate">Deck {DECK_NO[deck.id]}</span>
                <span className="da-plan__title">{deck.name}</span>
                <span className="da-plan__aside">{rooms.length ? `${deck.subtitle} · ${rooms.length} rooms` : deck.subtitle}</span>
              </>}
            </p>
            <div className="da-tabs" role="group" aria-label="Deck">
              {tabs.map(item => (
                <button key={item.id} type="button" className="da-tab" aria-pressed={item.id === deck.id} onClick={() => chooseDeck(item.id)}>
                  <small>{DECK_NO[item.id]}</small><span>{item.name.replace(/\s*deck$/i, "")}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Phones swipe across a full-size deck, as on the homepage; wider screens see it whole. */}
          <div className="da-plan__viewport" data-swiped={swiped || undefined}>
            <div className="da-plan__scroll" onScroll={swiped ? undefined : () => setSwiped(true)}>
              <DeckAtlasPlan key={deck.id} deck={deck.id} rooms={rooms} spaces={spaces} focusId={focusId} selectedId={pick ? selected : null}
                revealed={revealed} onFocus={setHovered} onSelect={chooseRoom} onOpenSpace={showSpace} />
            </div>
            <span className="da-plan__swipe" aria-hidden="true">Swipe across the deck ↔</span>
          </div>

          {spaces.length ? <div className="da-key">
            {(["guest", "crew"] as const).map(kind => {
              const items = spaces.filter(item => item.kind === kind);
              return items.length ? <div key={kind} className="da-key__group" data-kind={kind}>
                <h3 className="da-key__label" id={`da-key-${kind}`}>{kind === "guest" ? "Spaces on this deck" : "Crew & service"}</h3>
                <ol className="da-key__list" aria-labelledby={`da-key-${kind}`}>
                  {items.map(item => {
                    const mark = facilityMark(item.id);
                    return (
                      <li key={item.id}>
                        <button type="button" className="da-key__item" data-focus={focusId === item.id || undefined}
                          onPointerEnter={() => setHovered(item.id)} onPointerLeave={() => setHovered(null)}
                          onFocus={() => setHovered(item.id)} onBlur={() => setHovered(null)}
                          onClick={() => showSpace(item.id)}>
                          <b className="da-key__num" aria-hidden="true">{mark}</b>{item.name}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div> : null;
            })}
          </div> : null}

          <figcaption className="da-plan__foot">
            <p>{deck.description} <span>Illustrated deck plans. Furnishings are indicative.</span></p>
            <div className="da-plan__key">
              <p className="da-plan__heading" aria-hidden="true">
                <span className="da-plan__heading-wide">Stern <i /> Bow</span>
              </p>
              {rooms.length && !sailing ? <p className="da-legend-note">{loading ? "Checking which cabins are free…" : "Choose a departure to see which cabins are free."}</p> : null}
              {rooms.length && sailing ? <ul className="da-legend" aria-label="Plan key">
                <li data-state="open"><i />Available</li>
                <li data-state="closed"><i />Booked on this date</li>
                <li data-state="selected"><i />Your choice</li>
                {rooms.some(room => room.state === "request") ? <li data-state="request"><i />On request</li> : null}
              </ul> : null}
            </div>
          </figcaption>
        </figure>

        <div className="da-voyage">
          <p className="da-kicker">Make it your journey</p>
          <h3 className="da-voyage__title">Find your departure</h3>
          <div className="da-boxes">
            <Field label="Voyage" wide value={duration} onChange={value => changeVoyage(() => setDuration(value as StayDurationValue))}>
              {VOYAGES.map(voyage => <option key={voyage.value} value={voyage.value}>{voyage.label}</option>)}
            </Field>
            <Field label="From month" value={month} onChange={value => { if (value) changeVoyage(() => setMonth(value)); }}>
              {months.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
            </Field>
            <Field label="Departure" value={sailingId} disabled={loading || !!error || !sailings.length} onChange={setSailingId}>
              {!loading && !error && sailings.length
                ? sailings.map(item => <option key={item.scheduleId} value={item.scheduleId}>{dayDate(item.departureTime)}{item.soldOut ? " · fully booked" : ""}</option>)
                : <option value="">{departureEmpty}</option>}
            </Field>
          </div>
          <div className="da-summary" role="status">
            {loading ? <p>Checking live cabin availability…</p>
              : error ? <p role="alert">{error} <button type="button" className="da-textlink" onClick={() => { setLoading(true); setError(null); setRetry(value => value + 1); }}>Try again</button></p>
              : !sailing ? <p>No scheduled departures in this period. Choose a later month or <Link className="da-textlink" href="/contact">contact reservations</Link>.</p>
              : bookable.length ? <p><strong>{openCount}</strong> of {bookable.length} cabins free on the {deck.name.toLowerCase()} for {shortDate(sailing.departureTime)}.</p>
              : <p>Departing {dayDate(sailing.departureTime)}.</p>}
          </div>
        </div>

        <div className="da-cabins">
          {pick && sheet ? <article className="da-detail" key={pick.slotId} aria-labelledby="da-detail-title">
            <button type="button" className="da-textlink da-detail__back" onClick={() => setSelected(null)}><span aria-hidden="true">←</span> All cabins on this deck</button>
            <div className="da-detail__body">
              <p className="da-kicker">{deck.name} · {pick.plan}</p>
              <h3 id="da-detail-title" className="da-detail__title">{pick.name}</h3>
              {sheet.spec ? <p className="da-detail__spec">{sheet.spec}</p> : null}
              {pick.blurb ? <p className="da-detail__line">{pick.blurb}</p> : null}
              <button type="button" className="da-textlink da-detail__photos" onClick={() => setModalOpen(true)}>View the room photographs <span aria-hidden="true">↗</span></button>
            </div>
            <div className="da-detail__terms">
              <p className="da-status" data-state={pick.state}>{pickStatus}</p>
              {sheet.price ? <p className="da-price">{sheet.price}<RoomPriceUnit roomType={sheet.roomType} /><small>entire voyage</small></p> : null}
            </div>
            <div className="da-detail__act">
              {sheet.checkHref ? <Link className="btn" data-hathor-btn="primary" href={sheet.checkHref}>{pick.state === "closed" ? "See other dates" : "Check availability"}</Link>
                : <Link className="btn" data-hathor-btn="primary" href="/contact">Contact reservations</Link>}
              {sheet.viewHref ? <Link className="btn" href={sheet.viewHref}>View room</Link> : null}
            </div>
          </article> : null}

          <div className="da-index">
            {rooms.length ? <>
              <div className="da-index__head">
                <h3 className="da-kicker">Cabins on this deck</h3>
                {sailing ? <span>Per cabin · entire voyage</span> : null}
              </div>
              <ul className="da-groups">
                {groups.map(group => {
                  const price = group.type === REQUEST_GROUP ? null : priceOf(group.type);
                  const first = group.rooms[0];
                  return (
                    <li key={group.type} className="da-group">
                      <div className="da-group__head">
                        <p className="da-group__name">{group.type}</p>
                        {price !== null ? <p className="da-group__price">{usd(price)}<RoomPriceUnit roomType={group.type} /></p> : null}
                      </div>
                      <p className="da-group__spec">{group.type === REQUEST_GROUP ? "Contact us about this room." : specOf(first)}</p>
                      <div className="da-group__rooms">
                        {group.rooms.map(room => (
                          <button key={room.slotId} type="button" className="da-chip" data-state={room.state}
                            data-focus={focusId === room.slotId || undefined} aria-pressed={selected === room.slotId}
                            aria-label={`${room.plan}, ${room.name}${room.state === "closed" ? ", booked on this departure" : ""}`}
                            onPointerEnter={() => setHovered(room.slotId)} onPointerLeave={() => setHovered(null)}
                            onFocus={() => setHovered(room.slotId)} onBlur={() => setHovered(null)}
                            onClick={() => chooseRoom(room.slotId)}>{room.label}</button>
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {!groups.length ? <p className="da-group__spec da-index__wait" role="status">{loading ? "Loading the cabins from the booking system…" : "The cabins could not be loaded just now. Please try again in a moment."}</p> : null}
            </> : null}
            {!rooms.length ? <div className="da-open-air">
              <h3 className="da-open-air__title">A little closer to the sky.</h3>
              <p>Explore the lower and main decks to choose your room.</p>
              <div className="da-open-air__links">
                {decks.filter(item => item.id !== "sun").map(item => (
                  <button key={item.id} type="button" className="da-textlink" onClick={() => chooseDeck(item.id)}>View the {item.name.toLowerCase()} <span aria-hidden="true">↗</span></button>
                ))}
              </div>
            </div> : null}
          </div>
        </div>
      </div>

      <DeckAtlasRoomModal open={!!activeSheet} sheet={activeSheet} onClose={() => { setModalOpen(false); setOpenSpace(null); }} />
    </section>
  );
}
