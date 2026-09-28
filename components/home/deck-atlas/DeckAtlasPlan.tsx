"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { SHIP_REGIONS, shipDeckArt, type ShipDeckId, type ShipSlotId } from "@/lib/ship-experience-shared";
import { FACILITY_BY_ID, facilityMark, isFacilityId, type Facility, type FacilityId } from "./facilities";

export type AtlasState = "open" | "closed" | "unknown" | "request";
export type AtlasPlanRoom = { slotId: ShipSlotId; label: string; name: string; state: AtlasState };

/* SHIP_REGIONS are pixel bounds in the 1774 × 887 artwork; every layer below shares them. */
const ART_W = 1774;
const ART_H = 887;
const pct = (value: number, total: number) => `${((value / total) * 100).toFixed(4)}%`;

type Rect = { x: number; y: number; width: number; height: number };
/** A guest room or a shared space; both live in the same artwork coordinates. */
export type SpotId = ShipSlotId | FacilityId;
/* A room is one rectangle; a shared space may be several (a staircase at each end). */
const areasOf = (id: SpotId): Rect[] => (isFacilityId(id) ? FACILITY_BY_ID[id].areas : [SHIP_REGIONS[id]]);

function boundsStyle(b: Rect): CSSProperties {
  return { left: pct(b.x, ART_W), top: pct(b.y, ART_H), width: pct(b.width, ART_W), height: pct(b.height, ART_H) };
}

/* Every spotlight has the same number of vertices, so the light still glides between
   a single room and a space in several pieces: one rectangle simply splits apart.
   Four covers the most pieces any space has (the bow terrace). */
const SPOT_RECTS = 4;
function spotlight(rects: Rect[]) {
  const padded = Array.from({ length: SPOT_RECTS }, (_, index) => rects[Math.min(index, rects.length - 1)]);
  const at = (x: number, y: number) => `${pct(x, ART_W)} ${pct(y, ART_H)}`;
  /* Each rectangle is traced from its corner back to it; the hops between them are
     walked out and back, so they enclose nothing. */
  const outline = padded.flatMap(r => [at(r.x, r.y), at(r.x + r.width, r.y), at(r.x + r.width, r.y + r.height), at(r.x, r.y + r.height), at(r.x, r.y)]);
  const back = padded.slice(0, -1).reverse().map(r => at(r.x, r.y));
  return `polygon(${[...outline, ...back].join(", ")})`;
}
const DARK = spotlight([{ x: ART_W / 2, y: ART_H / 2, width: 0, height: 0 }]);

/* Pieces that touch are one place (the terrace's slices), so they share one frame. */
function mergeTouching(rects: Rect[]): Rect[] {
  const merged = rects.map(r => ({ ...r }));
  const touch = (a: Rect, b: Rect) => a.x <= b.x + b.width + 4 && b.x <= a.x + a.width + 4 && a.y <= b.y + b.height + 4 && b.y <= a.y + a.height + 4;
  for (let i = 0; i < merged.length; i++) {
    for (let j = i + 1; j < merged.length; j++) {
      if (!touch(merged[i], merged[j])) continue;
      const a = merged[i], b = merged[j];
      const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y);
      merged[i] = { x, y, width: Math.max(a.x + a.width, b.x + b.width) - x, height: Math.max(a.y + a.height, b.y + b.height) - y };
      merged.splice(j, 1);
      j = i;
    }
  }
  return merged;
}

/** A close-up of the deck artwork around one or more areas (width : height = ratio), each place with the plan's crop marks. */
export function PlanCloseUp({ deck, areas: pieces, label, ratio = 2, className }: { deck: ShipDeckId; areas: Rect[]; label: string; ratio?: number; className?: string }) {
  const areas = mergeTouching(pieces);
  const x0 = Math.min(...areas.map(r => r.x));
  const y0 = Math.min(...areas.map(r => r.y));
  const x1 = Math.max(...areas.map(r => r.x + r.width));
  const y1 = Math.max(...areas.map(r => r.y + r.height));
  const w = Math.min(ART_W, Math.max((x1 - x0) * 1.9, (y1 - y0) * 1.5 * ratio));
  const h = w / ratio;
  const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);
  const left = clamp((x0 + x1) / 2 - w / 2, ART_W - w);
  const top = clamp((y0 + y1) / 2 - h / 2, ART_H - h);
  const at = (offset: number, span: number) => (span > 0 ? `${((offset / span) * 100).toFixed(3)}%` : "0%");
  return (
    <div className={`da-closeup${className ? ` ${className}` : ""}`} role="img" aria-label={`${label} on the ${deck} deck plan`}
      style={{ aspectRatio: `${ratio} / 1`, backgroundImage: `url(${shipDeckArt(deck)})`, backgroundSize: `${((ART_W / w) * 100).toFixed(3)}% auto`, backgroundPosition: `${at(left, ART_W - w)} ${at(top, ART_H - h)}` }}>
      {areas.map((area, index) => (
        <span key={index} className="da-plan__crop da-closeup__mark" aria-hidden="true"
          style={{ left: pct(area.x - left, w), top: pct(area.y - top, h), width: pct(area.width, w), height: pct(area.height, h) }}><i /><i /><i /><i /></span>
      ))}
    </div>
  );
}

const ALT: Record<ShipDeckId, string> = {
  lower: "Lower deck with two suites, eight rooms, reception and service areas",
  main: "Main deck with two Royal Suites, library, gym, lounge, restaurant and outdoor terrace",
  sun: "Sun deck with shaded lounge, circular bar, two pools, sun loungers and an outdoor terrace",
};

const STATE_WORD: Record<AtlasState, string> = {
  open: "available",
  closed: "booked on this departure",
  unknown: "availability not checked yet",
  request: "contact reservations about this room",
};

/**
 * The deck at rest is printed into the paper (toned, multiplied). Focusing a
 * room recedes the ship and lets a full-colour copy of the same artwork show
 * through a clip-path cut to that room, so the light glides from room to room.
 */
export function DeckAtlasPlan({ deck, rooms, spaces, focusId, selectedId, revealed, onFocus, onSelect, onOpenSpace }: {
  deck: ShipDeckId;
  rooms: AtlasPlanRoom[];
  /** Spaces on this deck, numbered as in the key: lit and named on hover, opened closer on click. */
  spaces: Facility[];
  focusId: SpotId | null;
  selectedId: ShipSlotId | null;
  revealed: boolean;
  onFocus: (id: SpotId | null) => void;
  onSelect: (id: ShipSlotId) => void;
  onOpenSpace: (id: FacilityId) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  /* Keep the last lit room while the light fades out, so it never snaps to the whole deck. */
  const [spot, setSpot] = useState<SpotId | null>(focusId);
  if (focusId && focusId !== spot) setSpot(focusId);

  const src = `${shipDeckArt(deck)}${attempt ? `&retry=${attempt}` : ""}`;
  /* Larger spaces first, so the stairs and gangways inside reception or the library stay on top. */
  const marks = spaces
    .flatMap(space => {
      const places = space.areas.filter(area => area.marker !== false).length;
      let place = 0;
      return space.areas.map((area, part) => ({ space, area, part, place: area.marker === false ? 0 : ++place, places }));
    })
    .sort((a, b) => b.area.width * b.area.height - a.area.width * a.area.height);
  const zoom = selectedId ? SHIP_REGIONS[selectedId] : null;
  const origin = zoom ? {
    ["--da-ox" as string]: pct(zoom.x + zoom.width / 2, ART_W),
    ["--da-oy" as string]: pct(zoom.y + zoom.height / 2, ART_H),
  } as CSSProperties : undefined;

  return (
    <div className="da-plan__frame" data-ready={loaded || undefined} data-revealed={revealed || undefined}
      data-focus={focusId ? "" : undefined} data-zoom={zoom ? "" : undefined}>
      {failed ? <div className="da-plan__error" role="alert">
        <p>The deck plan could not load.</p>
        <button type="button" onClick={() => { setFailed(false); setLoaded(false); setAttempt(value => value + 1); }}>Reload the plan</button>
      </div> : <div className="da-plan__board">
        <div className="da-plan__sheet" style={origin}>
          <Image key={`base-${attempt}`} className="da-plan__art da-plan__art--base" src={src} width={ART_W} height={ART_H} unoptimized loading="eager"
            alt={`${ALT[deck]}. Furnished overhead illustration.`} draggable={false}
            onLoad={() => setLoaded(true)} onError={() => setFailed(true)} />
          <Image key={`lit-${attempt}`} className="da-plan__art da-plan__art--lit" src={src} width={ART_W} height={ART_H} unoptimized loading="eager"
            alt="" aria-hidden="true" draggable={false} data-on={focusId ? "" : undefined}
            style={{ clipPath: spot ? spotlight(areasOf(spot)) : DARK }} />
          {selectedId ? <span className="da-plan__crop" style={boundsStyle(SHIP_REGIONS[selectedId])} aria-hidden="true"><i /><i /><i /><i /></span> : null}
          {marks.map(({ space, area, part, place, places }, index) => {
            const mark = facilityMark(space.id);
            const pointer = {
              onPointerEnter: () => onFocus(space.id), onPointerLeave: () => onFocus(null),
              onClick: () => onOpenSpace(space.id),
            };
            const common = {
              className: "da-plan__space", style: { ...boundsStyle(area), ["--i" as string]: rooms.length + index },
              "data-kind": space.kind, "data-focus": focusId === space.id || undefined,
            };
            /* A shape-only piece answers the pointer; the numbered piece carries keyboard focus. */
            if (!place) return <span key={`${space.id}-${part}`} {...common} data-part="" aria-hidden="true" {...pointer} />;
            return (
              <button key={`${space.id}-${part}`} type="button" {...common} {...pointer}
                aria-label={`${mark}, ${space.name}${places > 1 ? ` (${place} of ${places})` : ""}${space.kind === "crew" ? ", crew only" : ""}. See it closer`}
                onFocus={() => onFocus(space.id)} onBlur={() => onFocus(null)}>
                <b className="da-plan__space-mark" aria-hidden="true">{mark}</b>
                <b className="da-plan__space-name" aria-hidden="true"><small>{mark}</small>{space.name}</b>
              </button>
            );
          })}
          {rooms.map((room, index) => (
            <button key={room.slotId} type="button" className="da-plan__room"
              style={{ ...boundsStyle(SHIP_REGIONS[room.slotId]), ["--i" as string]: index }}
              data-state={room.state} data-edge={SHIP_REGIONS[room.slotId].edge}
              data-focus={focusId === room.slotId || undefined}
              aria-pressed={selectedId === room.slotId}
              aria-label={`${room.name}, ${room.label}, ${STATE_WORD[room.state]}`}
              onPointerEnter={() => onFocus(room.slotId)} onPointerLeave={() => onFocus(null)}
              onFocus={() => onFocus(room.slotId)} onBlur={() => onFocus(null)}
              onClick={() => onSelect(room.slotId)}>
              <span className="da-plan__num"><i aria-hidden="true" />{room.label}</span>
              {room.state === "closed" ? <b className="da-plan__booked" aria-hidden="true">Booked</b> : null}
            </button>
          ))}
        </div>
      </div>}
      {!loaded && !failed ? <p className="da-plan__loading" role="status">Preparing the deck plan…</p> : null}
    </div>
  );
}
