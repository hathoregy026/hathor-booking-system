"use client";

import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { roomCapacity, type PhysicalRoomType } from "@/lib/physical-inventory";
import { guestLabel, shortName, type Guest } from "./allocation";
import type { DragState } from "./useGuestDrag";
import { plural, type Sailing } from "./model";
import { IconAdult, IconChild } from "./icons";

/** Shared by the phone/tablet list and the desktop board, so both place guests the same way. */

export const CABIN_NOTE: Record<PhysicalRoomType, string> = {
  "Luxury King Cabin": "King bed · panoramic Nile view",
  "Luxury Twin Cabin": "Twin beds · panoramic Nile view",
  "Luxury Suite": "Separate lounge · panoramic Nile view",
  "Royal Suite": "Private lounge · premium Nile view",
};

export const CABIN_BED: Partial<Record<PhysicalRoomType, string>> = {
  "Luxury King Cabin": "King bed",
  "Luxury Twin Cabin": "Twin beds",
};

/** Public room pages and the stable slugs Favorites and the cart store. */
export const RESIDENCE_SLUG: Record<PhysicalRoomType, string> = {
  "Luxury King Cabin": "luxury-king-room",
  "Luxury Twin Cabin": "luxury-twin-room",
  "Luxury Suite": "luxury-suite",
  "Royal Suite": "royal-suite",
};

export function Counter({
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

export function GuestTile({
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
export function CountMenu({
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

/** "Arrange for me": asks which cabin types to use, then places everyone within the limits. */
export function ArrangeChooser({
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

export function DragGhost({ drag, guests }: { drag: DragState | null; guests: Guest[] }) {
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
