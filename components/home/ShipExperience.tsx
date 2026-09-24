"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShipDeckPlan, type PlanRoomView } from "@/components/ship/ShipDeckPlan";
import type { SailingAvailability } from "@/lib/availability-service";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { bookingHorizonYear } from "@/lib/booking-horizon";
import type { ShipRoom } from "@/lib/ship-experience";
import { DEFAULT_SHIP_EXPERIENCE, SHIP_REGIONS, type ShipDeckId, type ShipExperienceConfig, type ShipSlotId } from "@/lib/ship-experience-shared";

type Payload = { config: ShipExperienceConfig; rooms: ShipRoom[]; sailings: SailingAvailability[] };
const VOYAGES: { value: StayDurationValue; label: string }[] = [
  { value: "3-nights-aswan-luxor", label: "3 nights · Aswan to Luxor" },
  { value: "4-nights-luxor-aswan", label: "4 nights · Luxor to Aswan" },
  { value: "7-nights-luxor-aswan-luxor", label: "7 nights · Round trip" },
];
const shortDate = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso));

export function ShipExperience() {
  const [duration, setDuration] = useState<StayDurationValue>("7-nights-luxor-aswan-luxor");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [deckId, setDeckId] = useState<ShipDeckId>("lower");
  const [sailingId, setSailingId] = useState("");
  const [selected, setSelected] = useState<ShipSlotId | null>(null);

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
        setError(null);
      })
      .catch(reason => { if (!controller.signal.aborted) { setSailingId(""); setError(reason instanceof Error ? reason.message : "Availability could not be loaded."); } })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [duration, month, retry]);

  const config = data?.config ?? DEFAULT_SHIP_EXPERIENCE;
  const decks = config.decks.filter(item => item.visible);
  const deck = decks.find(item => item.id === deckId) ?? decks[0];
  const slots = config.rooms.filter(slot => slot.visible && SHIP_REGIONS[slot.slotId].deck === deck.id);
  const sailing = !loading && !error ? data?.sailings.find(item => item.scheduleId === sailingId) ?? null : null;
  const views: PlanRoomView[] = slots.map(slot => {
    const room = data?.rooms.find(item => item.id === slot.roomId);
    return {
      slotId: slot.slotId, name: room?.name || slot.name, number: room?.roomNumber || slot.number,
      state: !room || !sailing ? "unknown" : sailing.types.some(type => type.freeCabins.some(cabin => cabin.id === room.id)) ? "open" : "closed",
    };
  });
  const slot = slots.find(item => item.slotId === selected);
  const view = views.find(item => item.slotId === selected);
  const room = slot ? data?.rooms.find(item => item.id === slot.roomId) : undefined;
  const roomPrice = room && sailing ? sailing.types.find(type => type.roomType === room.roomType)?.priceCents ?? null : null;
  const bookingUrl = room && sailing && view?.state === "open"
    ? `/booking?duration=${encodeURIComponent(duration)}&roomId=${encodeURIComponent(room.id)}&sailing=${encodeURIComponent(sailing.departureTime.slice(0, 10))}&adults=2` : null;

  function chooseRoom(id: ShipSlotId) {
    setSelected(id);
  }

  return (
    <section id="explore-hathor" className="h3-scene h3-ship-experience" aria-labelledby="h3-ship-title">
      <header className="h3-ship__masthead">
        <div><p className="h3-ship__eyebrow">Hathor · An intimate river residence</p><h2 id="h3-ship-title">{config.title}</h2></div>
        <div className="h3-ship__invitation"><p className="h3-ship__eyebrow">{config.eyebrow}</p><p>{config.introduction}</p><span aria-hidden="true">Explore the ship ↓</span></div>
      </header>

      <div className="h3-ship__deck-bar">
        <div className="h3-ship__deck-tabs" role="group" aria-label="Explore a deck">
          {decks.map((item, index) => <button key={item.id} type="button" aria-pressed={deck.id === item.id} onClick={() => { setDeckId(item.id); setSelected(null); }}><small>0{index + 1}</small><span>{item.name}</span><i aria-hidden="true">↗</i></button>)}
        </div>
        <span className="h3-ship__instruction">{deck.id === "sun" ? "An open-air retreat" : "Select a room on the plan"}</span>
      </div>

      <div className="h3-ship__workspace">
      <div className="h3-ship__theatre">
        <div className="h3-ship__deck-heading"><div><p className="h3-ship__eyebrow">{deck.subtitle}</p><h3>{deck.name}</h3></div><span className="h3-ship__orientation" aria-hidden="true">Stern <span>⟶</span> Bow</span></div>
        <span className="h3-ship__swipe-hint" aria-hidden="true">Swipe across the deck ↔</span>
        <div key={deck.id} className="h3-ship__deck-reveal">
          <ShipDeckPlan deck={deck.id} rooms={views} selected={view ? selected : null} onSelect={chooseRoom} vertical compact />
        </div>
        <div className="h3-ship__plan-footer"><p>{deck.description}</p>{slots.length ? <div className="h3-ship__legend" aria-label="Room status key"><span><i data-state="open" />Available</span><span><i data-state="closed" />Unavailable</span><span><i data-state="selected" />Selected</span><span><i data-state="unknown" />Not checked</span></div> : <span className="h3-ship__context-note">No guest rooms on this deck</span>}</div>
      </div>
      <aside className="h3-ship__console" aria-label="Room and departure details">
      <div className="h3-ship__reservation">
        <div className="h3-ship__reservation-label"><p className="h3-ship__eyebrow">Make it your journey</p><h3>Find your departure</h3></div>
        <div className="h3-ship__voyage">
          <label>Voyage<select value={duration} onChange={event => { setLoading(true); setError(null); setSailingId(""); setDuration(event.target.value as StayDurationValue); }}>{VOYAGES.map(voyage => <option key={voyage.value} value={voyage.value}>{voyage.label}</option>)}</select></label>
          <label>From month<input type="month" min={new Date().toISOString().slice(0, 7)} max={`${bookingHorizonYear()}-12`} value={month} onChange={event => { if (event.target.value) { setLoading(true); setError(null); setSailingId(""); setMonth(event.target.value); } }} /></label>
          <label>Departure<select value={sailingId} onChange={event => setSailingId(event.target.value)} disabled={loading || !!error || !data?.sailings.length}>
            {!loading && !error && data?.sailings.length ? data.sailings.map(item => <option key={item.scheduleId} value={item.scheduleId}>{shortDate(item.departureTime)}{item.soldOut ? " · fully booked" : ""}</option>) : <option value="">{loading ? "Checking dates…" : error ? "Please retry" : "No scheduled dates"}</option>}
          </select></label>
        </div>
      </div>
      {loading ? <p className="h3-ship__notice" role="status">Checking live cabin availability…</p> : error ? <p className="h3-ship__notice" role="alert">{error} <button type="button" onClick={() => { setLoading(true); setError(null); setRetry(value => value + 1); }}>Try again ↗</button></p> : !sailing ? <p className="h3-ship__notice">No scheduled departures in this period. Choose a later month or <Link href="/contact">contact reservations</Link>.</p> : null}

      <div className="h3-ship__detail" aria-live="polite" aria-atomic="true">
        {slot && view ? <>
          <div className="h3-ship__room-copy"><p className="h3-ship__eyebrow">{deck.name} · Room {view.number}</p><h3>{view.name}</h3>{room ? <p className="h3-ship__room-spec">{room.roomType} <span>·</span> {room.sizeSqm} m² <span>·</span> Up to {room.capacity} guests</p> : null}<p>{(room?.description || slot.description)?.split("\n\nAmenities:")[0].trim() || "Select your preferred departure to plan your stay aboard Hathor."}</p></div>
          <div className="h3-ship__room-booking"><p className="h3-ship__status" data-state={view.state}>{!slot.roomId ? "Contact us about this room" : view.state === "open" ? `Available · ${shortDate(sailing!.departureTime)}` : view.state === "closed" ? "Unavailable on this departure" : "Choose a departure to check availability"}</p>
            {roomPrice !== null ? <p className="h3-ship__price">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(roomPrice / 100)}<small>per cabin · entire voyage</small></p> : null}
            {bookingUrl ? <Link className="h3-ship__book" href={bookingUrl}>Continue with this cabin <span aria-hidden="true">↗</span></Link> : !slot.roomId ? <Link className="h3-ship__book" href="/contact">Contact reservations <span aria-hidden="true">↗</span></Link> : <p className="h3-ship__availability-note">{view.state === "closed" ? "Try another departure above, or select another room." : "Live availability must load before this cabin can be requested."}</p>}
            {bookingUrl ? <p className="h3-ship__availability-note">Your exact cabin is rechecked during booking.</p> : null}
          </div>
          <button className="h3-ship__close" type="button" onClick={() => setSelected(null)} aria-label="Close room details">×</button>
        </> : <div className="h3-ship__welcome"><span aria-hidden="true">✧</span><div><h3>{deck.id === "sun" ? "A little closer to the sky." : "Which room will be yours?"}</h3><p>{deck.id === "sun" ? "Explore the lower and main decks to choose your room." : "Tap a numbered room on the plan to see its details and availability here."}</p></div></div>}
      </div>
      </aside>
      </div>
      <p className="h3-ship__fineprint">Illustrated deck plans. Furnishings are indicative. Only guest rooms are selectable.</p>
    </section>
  );
}
