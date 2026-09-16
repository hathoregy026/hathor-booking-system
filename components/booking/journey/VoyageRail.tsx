"use client";

import { itineraryFor } from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import { folioRange, money, partySummary, plural, type Hold, type Party, type Sailing } from "./model";
import { IconBed, IconCalendar, IconGuests, IconTemple } from "./icons";
import type { JourneyStep } from "./JourneyChrome";

function Row({
  icon,
  label,
  value,
  onEdit,
  canEdit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onEdit?: () => void;
  canEdit?: boolean;
}) {
  return (
    <div className="hj-rail__row">
      <span className="hj-rail__icon" aria-hidden>{icon}</span>
      <span className="hj-rail__body">
        <span className="hj-rail__label">{label}</span>
        <span className="hj-rail__value">{value}</span>
      </span>
      {onEdit ? (
        <button type="button" className="hj-rail__edit" disabled={!canEdit} onClick={onEdit}>
          Edit
        </button>
      ) : null}
    </div>
  );
}

/**
 * The running summary. Money here is always the server's: a cabin rate once
 * a type is chosen, the stored quote after a hold exists. Never a fabricated $0.
 */
export function VoyageRail({
  duration,
  sailing,
  party,
  roomType,
  hold,
  step,
  onJump,
}: {
  duration: StayDurationValue;
  sailing: Sailing | null;
  party: Party;
  roomType: PhysicalRoomType | null;
  hold: Hold | null;
  step: JourneyStep;
  onJump: (step: JourneyStep) => void;
}) {
  const voyage = itineraryFor(duration);
  const selectedType = roomType && sailing ? sailing.types.find(type => type.roomType === roomType) ?? null : null;
  const total = hold?.totalPriceCents ?? (selectedType ? selectedType.priceCents * party.cabins : null);

  return (
    <aside className="hj-rail" aria-label="Your voyage summary">
      <div className="hj-rail__head">
        <h2 className="hj-rail__title">Your Voyage</h2>
        <span className="hj-rail__ankh" aria-hidden>☥</span>
      </div>
      <div className="hj-rail__rule" />

      <Row
        icon={<IconTemple />}
        label="Journey"
        value={`${voyage.title} · ${voyage.route}`}
        canEdit={step > 1}
        onEdit={() => onJump(1)}
      />
      <Row
        icon={<IconCalendar />}
        label="Dates"
        value={sailing ? folioRange(sailing.departureTime, sailing.arrivalTime) : "Select your dates"}
        canEdit={step > 1}
        onEdit={() => onJump(1)}
      />
      <Row
        icon={<IconGuests />}
        label="Guests"
        value={partySummary(party)}
        canEdit={step > 2}
        onEdit={() => onJump(2)}
      />
      <Row
        icon={<IconBed />}
        label="Rooms"
        value={plural(party.cabins, "Cabin")}
        canEdit={step > 2}
        onEdit={() => onJump(2)}
      />
      <Row
        icon={<IconBed />}
        label="Accommodation"
        value={roomType ? roomType : "Not selected yet"}
        canEdit={step > 3}
        onEdit={() => onJump(3)}
      />

      <div className="hj-total-block">
        <span className="hj-total-block__label">{hold ? "Total amount" : "Indicative total"}</span>
        {total === null ? (
          <p className="hj-total-block__pending">Select accommodation</p>
        ) : (
          <div className="hj-total-block__amount">{money(total)}</div>
        )}
        <p className="hj-deposit__fine">
          {total === null
            ? "The voyage total appears after a cabin is selected for this sailing."
            : `Per cabin · entire ${voyage.nights}-night voyage. Taxes and service charges included.`}
        </p>
      </div>

      <p className="hj-rail__brand">Hathor</p>
    </aside>
  );
}
