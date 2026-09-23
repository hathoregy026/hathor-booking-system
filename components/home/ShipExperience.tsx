"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { SailingAvailability } from "@/lib/availability-service";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { bookingHorizonYear } from "@/lib/booking-horizon";
import type { ShipRoom } from "@/lib/ship-experience";
import {
  DEFAULT_SHIP_EXPERIENCE,
  type ShipDeckId,
  type ShipExperienceConfig,
} from "@/lib/ship-experience-shared";

type Payload = {
  config: ShipExperienceConfig;
  rooms: ShipRoom[];
  sailings: SailingAvailability[];
};

const VOYAGES: { value: StayDurationValue; label: string }[] = [
  { value: "3-nights-aswan-luxor", label: "3 nights · Aswan to Luxor" },
  { value: "4-nights-luxor-aswan", label: "4 nights · Luxor to Aswan" },
  { value: "7-nights-luxor-aswan-luxor", label: "7 nights · Round trip" },
];

const shortDate = (iso: string) => new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
}).format(new Date(iso));

export function MapArtwork({ deck }: { deck: ShipDeckId }) {
  return (
    <svg className="h3-ship__drawing" viewBox="0 0 1200 420" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="h3-ship-wood" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#e8d8bb" />
          <stop offset=".48" stopColor="#cdbb99" />
          <stop offset="1" stopColor="#e3d0ae" />
        </linearGradient>
        <pattern id="h3-ship-planks" width="30" height="21" patternUnits="userSpaceOnUse">
          <path d="M0 20.5H30M0 0v20M15 0v20" fill="none" stroke="#8b7650" strokeOpacity=".17" strokeWidth="1" />
        </pattern>
        <linearGradient id="h3-ship-pool" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#80b8c6" /><stop offset="1" stopColor="#296a83" />
        </linearGradient>
      </defs>
      <path d="M76 50 Q60 50 54 72 L54 348 Q60 370 76 370 H1000 Q1060 368 1118 284 L1170 210 L1118 136 Q1060 52 1000 50 Z" fill="#554a39" stroke="#a78950" strokeWidth="8" />
      <path d="M78 64 H996 Q1048 66 1104 145 L1149 210 L1104 275 Q1048 354 996 356 H78 Q70 350 68 338 V82 Q70 68 78 64 Z" fill="url(#h3-ship-wood)" stroke="#f5e9ce" strokeWidth="3" />
      <path d="M78 64 H996 Q1048 66 1104 145 L1149 210 L1104 275 Q1048 354 996 356 H78 Q70 350 68 338 V82 Q70 68 78 64 Z" fill="url(#h3-ship-planks)" />
      {deck === "lower" ? (
        <g fill="none" stroke="#88785d" strokeWidth="3" opacity=".65">
          <path d="M98 210H1050" strokeDasharray="10 12" />
          {[250, 382, 514, 646, 778, 910].map(x => <path key={x} d={`M${x} 68v93m0 98v94`} />)}
          <path d="M980 100q70 110 0 220" />
        </g>
      ) : null}
      {deck === "main" ? (
        <g fill="none" stroke="#8c7959" strokeWidth="3" opacity=".55">
          <path d="M285 80v260M420 80v260M700 80v260M960 80v260" />
          <ellipse cx="563" cy="210" rx="120" ry="86" />
          {[768, 840, 912].map(x => <circle key={x} cx={x} cy="166" r="22" />)}
          {[768, 840, 912].map(x => <circle key={x} cx={x} cy="252" r="22" />)}
        </g>
      ) : null}
      {deck === "sun" ? (
        <g>
          <rect x="106" y="86" width="210" height="248" rx="12" fill="#d2bd96" stroke="#8c744c" strokeWidth="4" />
          <path d="M123 100v224m24-224v224m24-224v224m24-224v224m24-224v224m24-224v224m24-224v224" stroke="#8c744c" strokeOpacity=".38" strokeWidth="5" />
          <circle cx="545" cy="210" r="52" fill="url(#h3-ship-pool)" stroke="#f7e9cc" strokeWidth="12" />
          <rect x="660" y="143" width="184" height="134" rx="62" fill="url(#h3-ship-pool)" stroke="#f7e9cc" strokeWidth="12" />
          <path d="M340 124h90m-90 172h90m520-172h90m-90 172h90" stroke="#f7f0df" strokeWidth="14" strokeLinecap="round" opacity=".8" />
        </g>
      ) : null}
      <path d="M75 76v268M90 72v276" stroke="#fff6dd" strokeOpacity=".7" strokeWidth="2" />
      <path d="M1059 122q70 88 0 176" fill="none" stroke="#fff6dd" strokeOpacity=".55" strokeWidth="2" />
    </svg>
  );
}

function roomStatus(sailing: SailingAvailability | null, room: ShipRoom): "open" | "closed" | "unknown" {
  if (!sailing) return "unknown";
  return sailing.types.some(type => type.freeCabins.some(cabin => cabin.id === room.id)) ? "open" : "closed";
}

export function ShipExperience() {
  const [duration, setDuration] = useState<StayDurationValue>("7-nights-luxor-aswan-luxor");
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [deckId, setDeckId] = useState<ShipDeckId>("lower");
  const [sailingId, setSailingId] = useState("");
  const [selected, setSelected] = useState<{ kind: "room" | "space"; id: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/ship-experience?duration=${encodeURIComponent(duration)}&month=${encodeURIComponent(month)}`, { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("The ship and availability could not be loaded. Please try again.");
        return response.json() as Promise<Payload>;
      })
      .then(payload => {
        setData(payload);
        setSailingId(current => payload.sailings.some(sailing => sailing.scheduleId === current)
          ? current
          : payload.sailings.find(sailing => !sailing.soldOut)?.scheduleId ?? payload.sailings[0]?.scheduleId ?? "");
        setError(null);
      })
      .catch(reason => {
        if (!controller.signal.aborted) {
          setData(null);
          setSailingId("");
          setError(reason instanceof Error ? reason.message : "The ship could not be loaded.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [duration, month, retry]);

  const config = data?.config ?? DEFAULT_SHIP_EXPERIENCE;
  const deck = config.decks.find(item => item.id === deckId && item.visible) ?? config.decks.find(item => item.visible)!;
  const rooms = useMemo(() => (data?.rooms ?? []).filter(room => config.rooms.some(point => point.roomId === room.id && point.deckId === deck.id && point.visible)), [data, config, deck.id]);
  const spaces = config.spaces.filter(space => space.deckId === deck.id && space.visible);
  const sailing = data?.sailings.find(item => item.scheduleId === sailingId) ?? null;
  const room = selected?.kind === "room" ? rooms.find(item => item.id === selected.id) ?? null : null;
  const space = selected?.kind === "space" ? spaces.find(item => item.id === selected.id) ?? null : null;
  const roomPrice = room && sailing ? sailing.types.find(type => type.roomType === room.roomType)?.priceCents ?? null : null;
  const status = room ? roomStatus(sailing, room) : "unknown";
  const bookingUrl = room && sailing
    ? `/booking?duration=${encodeURIComponent(duration)}&roomId=${encodeURIComponent(room.id)}&sailing=${encodeURIComponent(sailing.departureTime.slice(0, 10))}&adults=2`
    : null;

  return (
    <section className="h3-scene h3-ship-experience" aria-labelledby="h3-ship-title">
      <div className="h3-ship__masthead">
        <div>
          <p className="h3-ship__eyebrow">{config.eyebrow} <span>— 04</span></p>
          <h2 id="h3-ship-title">{config.title}</h2>
          <p className="h3-ship__intro">{config.introduction}</p>
        </div>
        <figure className="h3-ship__aerial">
          <Image src="/media/hathor/r2/home-split-courtyard.webp" alt="Hathor seen from above on the Nile" fill sizes="(max-width: 700px) 100vw, 33vw" />
          <figcaption>A view from above <span>01 / 03</span></figcaption>
        </figure>
      </div>

      <div className="h3-ship__controls">
        <div className="h3-ship__deck-tabs" role="group" aria-label="Explore a deck">
          {config.decks.filter(item => item.visible).map((item, index) => (
            <button key={item.id} type="button" aria-pressed={deck.id === item.id} onClick={() => { setDeckId(item.id); setSelected(null); }}>
              <small>0{index + 1}</small><span>{item.name}</span>
            </button>
          ))}
        </div>
        <div className="h3-ship__voyage">
          <label>Voyage
            <select value={duration} onChange={event => { setLoading(true); setData(null); setSailingId(""); setDuration(event.target.value as StayDurationValue); setSelected(null); }}>
              {VOYAGES.map(voyage => <option key={voyage.value} value={voyage.value}>{voyage.label}</option>)}
            </select>
          </label>
          <label>From month
            <input type="month" min={new Date().toISOString().slice(0, 7)} max={`${bookingHorizonYear()}-12`} value={month} style={{ caretColor: "transparent" }} onChange={event => { if (!event.target.value) return; setLoading(true); setData(null); setSailingId(""); setSelected(null); setMonth(event.target.value); }} />
          </label>
          <label>Departure
            <select value={sailingId} onChange={event => setSailingId(event.target.value)} disabled={loading || !data?.sailings.length}>
              {data?.sailings.length ? data.sailings.map(item => <option key={item.scheduleId} value={item.scheduleId}>{shortDate(item.departureTime)}{item.soldOut ? " · fully booked" : ""}</option>) : <option value="">No dates in this period</option>}
            </select>
          </label>
        </div>
      </div>

      <div className="h3-ship__body">
        <div className="h3-ship__chart">
          <div className="h3-ship__chart-heading"><div><p>{deck.subtitle}</p><h3>{deck.name}</h3></div><span>Bow →</span></div>
          <p className="h3-ship__deck-description">{deck.description}</p>
          <div className="h3-ship__map-scroll" aria-label={`${deck.name} ship plan`}>
            <div className="h3-ship__map">
              <MapArtwork deck={deck.id} />
              {rooms.map(item => {
                const point = config.rooms.find(entry => entry.roomId === item.id)!;
                const state = roomStatus(sailing, item);
                const chosen = selected?.kind === "room" && selected.id === item.id;
                return <button key={item.id} type="button" className="h3-ship__marker h3-ship__marker--room" data-state={state} aria-pressed={chosen} style={{ left: `${point.x}%`, top: `${point.y}%` }} onClick={() => setSelected({ kind: "room", id: item.id })} aria-label={`${point.label || item.roomNumber || item.id}, ${item.name}, ${state === "open" ? "available" : state === "closed" ? "unavailable" : "select a departure to check"}`}>
                  <span>{point.label || item.roomNumber || item.id}</span><i aria-hidden="true" />
                </button>;
              })}
              {spaces.map(item => <button key={item.id} type="button" className="h3-ship__marker h3-ship__marker--space" aria-pressed={selected?.kind === "space" && selected.id === item.id} style={{ left: `${item.x}%`, top: `${item.y}%` }} onClick={() => setSelected({ kind: "space", id: item.id })} aria-label={`Explore ${item.name}`}><span>{item.name}</span><i aria-hidden="true" /></button>)}
            </div>
          </div>
          <p className="h3-ship__legend"><span><i className="is-open" /> Available</span><span><i className="is-closed" /> Unavailable</span><span><i className="is-selected" /> Selected</span><em>Illustrative deck positions; cabin availability is checked live.</em></p>
          <div className="h3-ship__mobile-list" aria-label={`Spaces on ${deck.name}`}>
            {rooms.map(item => {
              const state = roomStatus(sailing, item);
              return <button key={item.id} type="button" data-state={state} aria-pressed={selected?.kind === "room" && selected.id === item.id} onClick={() => setSelected({ kind: "room", id: item.id })}><span><small>{item.roomNumber || item.id}</small><strong>{item.name}</strong></span><em>{state === "open" ? "Available" : state === "closed" ? "Unavailable" : "Check date"}</em></button>;
            })}
            {spaces.map(item => <button key={item.id} type="button" aria-pressed={selected?.kind === "space" && selected.id === item.id} onClick={() => setSelected({ kind: "space", id: item.id })}><span><small>Onboard</small><strong>{item.name}</strong></span><em>Explore</em></button>)}
          </div>
        </div>
        <aside className="h3-ship__detail" aria-live="polite">
          {error ? <div className="h3-ship__empty" role="alert"><span>Unable to load</span><h3>The river can wait a moment.</h3><p>{error}</p><button type="button" onClick={() => { setLoading(true); setRetry(value => value + 1); }}>Try again ↗</button></div>
            : loading && !data ? <div className="h3-ship__empty" role="status"><span>Loading the ship</span><h3>Preparing the decks…</h3><p>Checking today’s sailings and cabin availability.</p></div>
              : room ? <div className="h3-ship__detail-inner"><span className="h3-ship__detail-kicker">{room.roomNumber || room.id} · {deck.name}</span><h3>{room.name}</h3><p className="h3-ship__room-type">{room.roomType} <span>·</span> {room.sizeSqm} m² <span>·</span> Up to {room.capacity} guests</p><p className="h3-ship__detail-copy">{room.description?.split("\n\nAmenities:")[0].trim() || "A private place to watch the Nile go by."}</p><div className="h3-ship__detail-bottom"><p className="h3-ship__status" data-state={status}>{status === "open" ? "Available on this departure" : status === "closed" ? "Unavailable on this departure" : "Choose a departure to check"}</p>{roomPrice !== null ? <p className="h3-ship__price">From {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(roomPrice / 100)} <small>per cabin · entire voyage</small></p> : null}{status === "open" && bookingUrl ? <Link className="h3-ship__book" href={bookingUrl}>Continue with this cabin <span aria-hidden="true">↗</span></Link> : <Link className="h3-ship__text-link" href="/booking">Explore other dates ↗</Link>}<p className="h3-ship__availability-note">Availability is rechecked before your request is placed.</p></div></div>
                : space ? <div className="h3-ship__detail-inner"><span className="h3-ship__detail-kicker">{deck.name} · Aboard</span><h3>{space.name}</h3><p className="h3-ship__detail-copy">{space.description}</p><div className="h3-ship__detail-bottom"><p className="h3-ship__status">Discover the spaces of Hathor</p><Link className="h3-ship__text-link" href="/about">More about the ship ↗</Link></div></div>
                  : <div className="h3-ship__empty"><span>Choose a space</span><h3>Find your place aboard.</h3><p>Tap a cabin or a shared space to see its details. Choose a sailing above to see which cabins are open.</p><span className="h3-ship__empty-rule" aria-hidden="true" /></div>}
        </aside>
      </div>
    </section>
  );
}
