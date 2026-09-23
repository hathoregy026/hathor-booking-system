"use client";

import Image from "next/image";
import { useState } from "react";
import { SHIP_REGIONS, type ShipDeckId, type ShipSlotId } from "@/lib/ship-experience-shared";
import "./ship-deck-plan.css";

export type PlanRoomView = {
  slotId: ShipSlotId;
  name: string;
  number: string;
  state: "open" | "closed" | "unknown";
};

/** Art and hit areas share one coordinate system at every screen size. */
export function ShipDeckPlan({ deck, rooms, selected, onSelect, vertical = false }: {
  deck: ShipDeckId;
  rooms: PlanRoomView[];
  selected: ShipSlotId | null;
  onSelect: (id: ShipSlotId) => void;
  vertical?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [attempt, setAttempt] = useState(0);
  return (
    <div className={`ship-plan${vertical ? " ship-plan--responsive" : ""}`} data-deck={deck}>
      {failed ? <div className="ship-plan__error" role="alert">
        <p>The deck illustration could not load.</p>
        <button type="button" onClick={() => { setFailed(false); setLoaded(false); setAttempt(value => value + 1); }}>Reload illustration</button>
      </div> : <div className="ship-plan__canvas" data-ready={loaded}>
        <Image key={attempt} className="ship-plan__art" src={`/media/hathor/ship/${deck}-deck.webp${attempt ? `?retry=${attempt}` : ""}`} width={1774} height={887} unoptimized
          alt={`${deck === "lower" ? "Lower deck with two suites, nine rooms, reception and service areas" : deck === "main" ? "Main deck with two Royal Suites, library, lounge and dining areas" : "Sun deck with shaded lounge, circular bar, two pools and sun loungers"}. Furnished overhead illustration.`}
          loading={vertical ? "lazy" : "eager"} onLoad={() => setLoaded(true)} onError={() => setFailed(true)} draggable={false} />
        {!loaded ? <p className="ship-plan__loading" role="status">Preparing the deck illustration…</p> : null}
        {deck === "sun" ? <div className="ship-plan__water" aria-hidden="true" /> : null}
        {rooms.map(room => {
          const bounds = SHIP_REGIONS[room.slotId];
          if (bounds.deck !== deck) return null;
          return <button type="button" key={room.slotId} className="ship-plan__room" data-slot={room.slotId} data-state={room.state} data-edge={bounds.edge}
            style={{ left: `${bounds.x / 17.74}%`, top: `${bounds.y / 8.87}%`, width: `${bounds.width / 17.74}%`, height: `${bounds.height / 8.87}%` }}
            aria-label={`${room.name}, number ${room.number}, ${room.state === "open" ? "available" : room.state === "closed" ? "unavailable on this departure" : "availability not checked"}`}
            aria-pressed={selected === room.slotId} onClick={() => onSelect(room.slotId)}>
            <span className="ship-plan__label"><i aria-hidden="true" /><span>{room.number}</span></span>
            <span className="ship-plan__tooltip" aria-hidden="true">{room.name}</span>
          </button>;
        })}
      </div>}
    </div>
  );
}
