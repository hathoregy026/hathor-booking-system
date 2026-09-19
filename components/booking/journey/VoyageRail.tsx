"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { itineraryFor } from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { folioRange, money, plural, shortDate, type Sailing } from "./model";
import type { CabinView } from "./allocation";
import { IconBed, IconCalendar, IconChevron, IconGuests, IconPencil, IconTemple } from "./icons";
import type { JourneyStep } from "./JourneyChrome";
import { useStickyFit } from "./useStickyFit";

function Row({
  icon,
  label,
  children,
  onEdit,
  canEdit,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  onEdit?: () => void;
  canEdit?: boolean;
}) {
  return (
    <div className="hj-rail__row">
      <span className="hj-rail__icon" aria-hidden>{icon}</span>
      <span className="hj-rail__body">
        <span className="hj-rail__label">{label}</span>
        <span className="hj-rail__value">{children}</span>
      </span>
      {onEdit ? (
        <button type="button" className="hj-rail__edit" disabled={!canEdit} onClick={onEdit}>
          <IconPencil className="hj-rail__pencil" />
          <span className="hj-rail__edit-text">Edit</span>
        </button>
      ) : null}
    </div>
  );
}

const partyLine = (adults: number, children: number) =>
  [plural(adults, "Adult"), children > 0 ? plural(children, "Child", "Children") : null].filter(Boolean).join(" · ");

/**
 * The running summary. Rates come from the availability read; the total is
 * the sum of the chosen cabins' per-voyage rates, and the database recomputes
 * it when the request is sent.
 */
export function VoyageRail({
  duration,
  sailing,
  adults,
  childCount,
  cabins,
  totalCents,
  step,
  onJump,
}: {
  duration: StayDurationValue;
  sailing: Sailing | null;
  adults: number;
  childCount: number;
  cabins: CabinView[];
  totalCents: number | null;
  step: JourneyStep;
  onJump: (step: JourneyStep) => void;
}) {
  const voyage = itineraryFor(duration);
  const railRef = useRef<HTMLElement | null>(null);
  useStickyFit(railRef);

  return (
    <aside className="hj-rail" aria-label="Your voyage summary" ref={railRef}>
      <div className="hj-rail__head">
        <h2 className="hj-rail__title">Your Voyage</h2>
        <span className="hj-rail__ankh" aria-hidden>☥</span>
      </div>
      <div className="hj-rail__rule" />
      <Image className="hj-rail__media" src={voyage.image} alt="" width={640} height={360} sizes="340px" />

      <Row icon={<IconTemple />} label="Journey" canEdit={step > 1} onEdit={() => onJump(1)}>
        {voyage.title} · {voyage.route}
      </Row>
      <Row icon={<IconCalendar />} label="Dates" canEdit={step > 1} onEdit={() => onJump(1)}>
        {sailing ? folioRange(sailing.departureTime, sailing.arrivalTime) : "Select your dates"}
      </Row>
      <Row icon={<IconGuests />} label="Guests" canEdit={step > 2} onEdit={() => onJump(2)}>
        {partyLine(adults, childCount)}
      </Row>
      <Row icon={<IconBed />} label="Accommodation" canEdit={step > 2} onEdit={() => onJump(2)}>
        {cabins.length === 0 ? (
          "Not selected yet"
        ) : (
          <span className="hj-rail__cabins">
            {cabins.map(cabin => (
              <span key={cabin.id} className="hj-rail__cabin">
                <span>{cabin.label}</span>
                <span className="hj-rail__cabin-guests">
                  {cabin.guests.length === 0
                    ? "No guests yet"
                    : partyLine(
                        cabin.guests.filter(guest => guest.kind === "adult").length,
                        cabin.guests.filter(guest => guest.kind === "child").length,
                      )}
                </span>
              </span>
            ))}
          </span>
        )}
      </Row>

      <div className="hj-total-block">
        <span className="hj-total-block__label">{cabins.length > 1 ? `Total · ${plural(cabins.length, "cabin")}` : "Voyage total"}</span>
        {totalCents === null ? (
          <p className="hj-total-block__pending">Select accommodation</p>
        ) : (
          <div className="hj-total-block__amount">{money(totalCents)}</div>
        )}
        <p className="hj-deposit__fine">
          {totalCents === null
            ? "The voyage total appears once your guests have a cabin."
            : `Entire ${voyage.nights}-night voyage, per cabin rates. Taxes and service charges included.`}
        </p>
      </div>

      <p className="hj-rail__brand">Hathor</p>
      <span className="hj-rail__tagline">A higher rhythm</span>
    </aside>
  );
}

/**
 * Desktop Guests & Suites: the same summary as a bar along the bottom, so the
 * cabin photographs keep the full height of the screen.
 */
export function VoyageBar({
  duration,
  sailing,
  adults,
  childCount,
  cabins,
  totalCents,
  onEdit,
  details,
  ready,
  busy,
  onContinue,
}: {
  duration: StayDurationValue;
  sailing: Sailing | null;
  adults: number;
  childCount: number;
  cabins: CabinView[];
  totalCents: number | null;
  onEdit: () => void;
  /** The full voyage summary (every row with its Edit), opened from the bar. */
  details: ReactNode;
  ready: boolean;
  busy: boolean;
  onContinue: () => void;
}) {
  const voyage = itineraryFor(duration);
  const [open, setOpen] = useState(false);
  return (
    <section className={`hj-voyagebar${open ? " hj-voyagebar--open" : ""}`} aria-label="Your voyage">
      {open ? <div className="hj-voyagebar__panel" id="hj-voyagebar-panel">{details}</div> : null}
      <button
        type="button"
        className="hj-voyagebar__toggle"
        aria-expanded={open}
        aria-controls="hj-voyagebar-panel"
        onClick={() => setOpen(current => !current)}
      >
        <span className="hj-voyagebar__title">Your Voyage</span>
        <IconChevron direction={open ? "down" : "up"} />
      </button>
      <Image className="hj-voyagebar__img" src={voyage.image} alt="" width={240} height={140} sizes="120px" />
      <span className="hj-voyagebar__cell">
        <span className="hj-voyagebar__main">{voyage.title}</span>
        <span className="hj-voyagebar__sub">{voyage.route}</span>
      </span>
      <span className="hj-voyagebar__cell hj-voyagebar__cell--ruled">
        <IconCalendar />
        <span>
          <span className="hj-voyagebar__main">{sailing ? shortDate(sailing.departureTime) : "Select your dates"}</span>
          <span className="hj-voyagebar__sub">{sailing ? `to ${shortDate(sailing.arrivalTime)}` : `${voyage.departureDay} departures`}</span>
        </span>
      </span>
      <span className="hj-voyagebar__cell hj-voyagebar__cell--ruled">
        <IconGuests />
        <span>
          <span className="hj-voyagebar__main">{partyLine(adults, childCount)}</span>
          <span className="hj-voyagebar__sub">{cabins.length === 0 ? "No cabin yet" : plural(cabins.length, "Cabin")}</span>
        </span>
      </span>
      <span className="hj-voyagebar__cell hj-voyagebar__cell--ruled hj-voyagebar__total">
        <span className="hj-voyagebar__sub">{cabins.length > 1 ? `Total · ${plural(cabins.length, "cabin")}` : "Voyage total"}</span>
        <span className="hj-voyagebar__amount">{totalCents === null ? "Place your guests" : money(totalCents)}</span>
      </span>
      <button type="button" className="hj-voyagebar__edit" onClick={onEdit}>Edit</button>
      <button
        type="button"
        className="hj-voyagebar__go"
        aria-label="Continue to guest details"
        disabled={busy || !ready}
        onClick={onContinue}
      >
        Continue <IconChevron direction="right" />
      </button>
    </section>
  );
}
