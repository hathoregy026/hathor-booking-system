"use client";

import { itineraryFor } from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { folioRange, money, plural, type Sailing } from "./model";
import type { CabinView } from "./allocation";
import { IconBed, IconCalendar, IconGuests, IconTemple } from "./icons";
import type { JourneyStep } from "./JourneyChrome";

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
          Edit
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

  return (
    <aside className="hj-rail" aria-label="Your voyage summary">
      <div className="hj-rail__head">
        <h2 className="hj-rail__title">Your Voyage</h2>
        <span className="hj-rail__ankh" aria-hidden>☥</span>
      </div>
      <div className="hj-rail__rule" />

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
    </aside>
  );
}
