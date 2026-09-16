"use client";

import { itineraryFor } from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import { money, partySummary, plural, rangeLabel, type Hold, type Party, type Sailing } from "./model";
import { IconBed, IconCalendar, IconGuests, IconTemple } from "./icons";

function bedLabel(roomType: PhysicalRoomType): string {
  if (roomType.includes("King")) return "King";
  if (roomType.includes("Twin")) return "Twin";
  if (roomType.includes("Royal")) return "Royal suite";
  if (roomType.includes("Suite")) return "Luxury suite";
  return "As selected";
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="hj-rail__row">
      <span className="hj-rail__icon" aria-hidden>{icon}</span>
      <span className="hj-rail__body">
        <span className="hj-rail__label">{label}</span>
        <span className="hj-rail__value">{value}</span>
      </span>
      <span className="hj-rail__minus" aria-hidden>—</span>
    </div>
  );
}

/**
 * The running summary. Money here is always the server's: the indicative total
 * before a hold exists, the stored quote afterwards.
 */
export function VoyageRail({
  duration,
  sailing,
  party,
  roomType,
  hold,
}: {
  duration: StayDurationValue;
  sailing: Sailing | null;
  party: Party;
  roomType: PhysicalRoomType | null;
  hold: Hold | null;
}) {
  const voyage = itineraryFor(duration);
  const selectedType = roomType && sailing ? sailing.types.find(type => type.roomType === roomType) ?? null : null;
  const indicative = selectedType
    ? selectedType.priceCents * party.cabins
    : sailing ? Math.min(...sailing.types.map(type => type.priceCents)) * party.cabins : null;
  const total = hold?.totalPriceCents ?? indicative;
  const firstStage = hold?.paymentSchedule?.[0] ?? null;

  return (
    <aside className="hj-rail" aria-label="Your voyage summary">
      <span className="hj-rail__title">{hold ? "Your selection" : "Your voyage"}</span>
      <div className="hj-rail__rule" />

      <Row icon={<IconTemple />} label="Journey" value={voyage.route} />
      <Row icon={<IconCalendar />} label="Duration" value={`${voyage.nights} nights / ${voyage.days} days`} />
      <Row
        icon={<IconCalendar />}
        label="Dates"
        value={sailing ? rangeLabel(sailing.departureTime, sailing.arrivalTime) : "Choose your sailing date"}
      />
      <Row icon={<IconGuests />} label="Guests" value={partySummary(party)} />
      <Row
        icon={<IconBed />}
        label="Accommodation"
        value={roomType ? `${plural(party.cabins, "×")} ${roomType}` : "Choose your cabin"}
      />
      {roomType ? (
        <>
          <Row icon={<IconBed />} label="Bed" value={bedLabel(roomType)} />
          <Row icon={<IconTemple />} label="Rate" value="Standard" />
        </>
      ) : null}

      <div className="hj-total-block">
        <span className="hj-total-block__label">{hold ? "Voyage total" : "Indicative total"}</span>
        <div className="hj-total-block__amount">{total === null ? "—" : money(total)}</div>
        <p className="hj-deposit__fine">
          {total === null
            ? "Choose a sailing date to see your voyage total."
            : `${party.cabins > 1 ? `${plural(party.cabins, "cabin")} · ` : ""}Entire ${voyage.nights}-night voyage. Taxes and service charges included.`}
        </p>

        <div className="hj-deposit">
          {firstStage ? (
            <>
              <span className="hj-deposit__label">
                {total && total > 0
                  ? `${Math.round((firstStage.cumulativeCents / total) * 100)}% deposit after team review`
                  : "Deposit after team review"}
              </span>
              <span className="hj-deposit__amount">{money(firstStage.cumulativeCents)}</span>
              <p className="hj-deposit__fine">Non-refundable once invoiced. Hathor Reservations sends payment instructions — nothing is charged on this website.</p>
            </>
          ) : (
            <p className="hj-deposit__fine">
              No payment is taken here. Hathor Reservations reviews your request, then sends the invoice with the amount due and its date.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
