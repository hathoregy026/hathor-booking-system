"use client";

import Image from "next/image";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import { money, plural, type RoomTypeAvailability, type Sailing } from "./model";
import { IconBed, IconGuests, IconSize } from "./icons";

const CABIN_NOTE: Record<PhysicalRoomType, string> = {
  "Luxury King Cabin": "King bed · panoramic Nile view.",
  "Luxury Twin Cabin": "Twin beds · panoramic Nile view.",
  "Luxury Suite": "Separate lounge · panoramic Nile view.",
  "Royal Suite": "Private lounge · premium Nile view.",
};

const CABIN_BED: Partial<Record<PhysicalRoomType, string>> = {
  "Luxury King Cabin": "King bed",
  "Luxury Twin Cabin": "Twin beds",
};

/** The public room pages, so "view details" stays inside the Hathor site. */
const CABIN_PAGE: Record<PhysicalRoomType, string> = {
  "Luxury King Cabin": "/rooms/luxury-king-room",
  "Luxury Twin Cabin": "/rooms/luxury-twin-room",
  "Luxury Suite": "/rooms/luxury-suite",
  "Royal Suite": "/rooms/royal-suite",
};

function availabilityLine(type: RoomTypeAvailability, cabins: number) {
  if (type.soldOut) return { text: "Currently unavailable for this sailing", tone: "out" as const };
  if (!type.fitsOccupancy) return { text: `Holds up to ${plural(type.maxOccupancy, "guest")}`, tone: "out" as const };
  if (!type.hasRequestedQuantity) return { text: `Only ${plural(type.availableCabins, "cabin")} left for ${plural(cabins, "cabin")}`, tone: "out" as const };
  if (type.availableCabins <= 2) return { text: `${plural(type.availableCabins, "cabin")} remain`, tone: "low" as const };
  return { text: `${plural(type.availableCabins, "cabin")} available`, tone: "open" as const };
}

/** Selectable cabins, shown after the single availability check. */
export function CabinCards({
  sailing,
  cabins,
  selected,
  onSelect,
}: {
  sailing: Sailing;
  cabins: number;
  selected: PhysicalRoomType | null;
  onSelect: (roomType: PhysicalRoomType) => void;
}) {
  return (
    <div className="hj-cabins" role="group" aria-label="Select your cabin or suite">
      {sailing.types.map(type => {
        const visuals = getBookingRoomVisuals(type.roomType, type.roomType);
        const state = availabilityLine(type, cabins);
        const disabled = type.status !== "AVAILABLE";
        const on = selected === type.roomType;

        return (
          <label
            key={type.roomType}
            className={`hj-cabin${on ? " hj-cabin--on" : ""}${disabled ? " hj-cabin--off" : ""}`}
          >
            <input
              className="hj-sr"
              type="radio"
              name="hj-cabin-choice"
              value={type.roomType}
              checked={on}
              disabled={disabled}
              onChange={() => onSelect(type.roomType)}
            />
            <Image className="hj-cabin__img" src={visuals.cover} alt={type.roomType} width={336} height={216} sizes="(max-width: 480px) 86px, 168px" />
            <span className="hj-cabin__head">
              <span className="hj-cabin__name">{type.roomType}</span>
              <span className="hj-cabin__desc">{CABIN_NOTE[type.roomType]}</span>
              <a className="hj-cabin__link" href={CABIN_PAGE[type.roomType]} target="_blank" rel="noopener noreferrer">
                View details <span aria-hidden>›</span>
              </a>
            </span>
            <span className="hj-cabin__facts">
              <span className="hj-cabin__fact"><IconGuests /> Up to {type.maxOccupancy} guests</span>
              <span className="hj-cabin__fact"><IconSize /> {type.sizeSqm} m²</span>
              {CABIN_BED[type.roomType] ? (
                <span className="hj-cabin__fact"><IconBed /> {CABIN_BED[type.roomType]}</span>
              ) : null}
            </span>
            <span className="hj-cabin__price">
              <span className="hj-cabin__amount">{money(type.priceCents)}</span>
              <span className="hj-cabin__per">per cabin · entire voyage</span>
              <span className={`hj-cabin__state hj-cabin__state--${state.tone}`}>{state.text}</span>
              <span className="hj-cabin__select" aria-hidden>{disabled ? "Unavailable" : on ? "Selected" : "Select"}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
