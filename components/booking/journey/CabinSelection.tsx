"use client";

import Image from "next/image";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import { PHYSICAL_ROOM_TYPES, type PhysicalRoomType } from "@/lib/physical-inventory";
import { money, plural, type RoomTypeAvailability, type Sailing } from "./model";
import { IconGuests, IconSize } from "./icons";

const CABIN_NOTE: Record<PhysicalRoomType, string> = {
  "Luxury King Cabin": "King bed · panoramic Nile view.",
  "Luxury Twin Cabin": "Twin beds · panoramic Nile view.",
  "Luxury Suite": "Separate lounge · panoramic Nile view.",
  "Royal Suite": "Private lounge · premium Nile view.",
};

/** The public room pages, so "view details" stays inside the Hathor site. */
const CABIN_PAGE: Record<PhysicalRoomType, string> = {
  "Luxury King Cabin": "/rooms/luxury-king-room",
  "Luxury Twin Cabin": "/rooms/luxury-twin-room",
  "Luxury Suite": "/rooms/luxury-suite",
  "Royal Suite": "/rooms/royal-suite",
};

function availabilityLine(type: RoomTypeAvailability, cabins: number) {
  if (type.soldOut) return { text: "Sold out", tone: "out" as const };
  if (!type.fitsOccupancy) return { text: `Holds up to ${plural(type.maxOccupancy, "guest")}`, tone: "out" as const };
  if (!type.hasRequestedQuantity) return { text: `Only ${plural(type.availableCabins, "cabin")} left for ${plural(cabins, "cabin")}`, tone: "out" as const };
  if (type.availableCabins <= 2) return { text: `Only ${plural(type.availableCabins, "cabin")} left`, tone: "low" as const };
  return { text: `${plural(type.availableCabins, "cabin")} available`, tone: "open" as const };
}

function CabinFacts({ maxOccupancy, sizeSqm }: { maxOccupancy: number; sizeSqm: number }) {
  return (
    <>
      <span className="hj-cabin__fact hj-cabin__fact--guests">
        <IconGuests />
        <span><strong>Up to {maxOccupancy}</strong> guests</span>
      </span>
      <span className="hj-cabin__fact hj-cabin__fact--size">
        <IconSize />
        <span><strong>{sizeSqm} m²</strong> cabin size</span>
      </span>
    </>
  );
}

/** Read-only rates shown with the journey, before availability is checked. */
export function CabinPriceList({ sailing }: { sailing: Sailing | null }) {
  return (
    <ul className="hj-cabins">
      {PHYSICAL_ROOM_TYPES.map(roomType => {
        const type = sailing?.types.find(entry => entry.roomType === roomType) ?? null;
        const visuals = getBookingRoomVisuals(roomType, roomType);
        return (
          <li key={roomType} className="hj-cabin hj-cabin--static">
            <Image className="hj-cabin__img" src={visuals.cover} alt="" width={224} height={160} sizes="(max-width: 720px) 78px, 112px" />
            <span className="hj-cabin__head">
              <span className="hj-cabin__name">{roomType}</span>
              <span className="hj-cabin__desc">{CABIN_NOTE[roomType]}</span>
            </span>
            <CabinFacts maxOccupancy={type?.maxOccupancy ?? (roomType.includes("Cabin") ? 2 : 4)} sizeSqm={type?.sizeSqm ?? (roomType.includes("Cabin") ? 22 : roomType === "Luxury Suite" ? 46 : 56)} />
            <span className="hj-cabin__price">
              <span className="hj-cabin__amount">{type ? money(type.priceCents) : "—"}</span>
              <span className="hj-cabin__per">per cabin · entire voyage</span>
            </span>
            <span aria-hidden />
          </li>
        );
      })}
    </ul>
  );
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
            <Image className="hj-cabin__img" src={visuals.cover} alt={type.roomType} width={224} height={160} sizes="(max-width: 720px) 78px, 112px" />
            <span className="hj-cabin__head">
              <span className="hj-cabin__name">{type.roomType}</span>
              <span className="hj-cabin__desc">{CABIN_NOTE[type.roomType]}</span>
              <a className="hj-cabin__link" href={CABIN_PAGE[type.roomType]} target="_blank" rel="noopener noreferrer">
                View details <span aria-hidden>→</span>
              </a>
            </span>
            <CabinFacts maxOccupancy={type.maxOccupancy} sizeSqm={type.sizeSqm} />
            <span className="hj-cabin__price">
              <span className="hj-cabin__amount">{money(type.priceCents)}</span>
              <span className="hj-cabin__per">per cabin · entire voyage</span>
              <span className={`hj-cabin__state hj-cabin__state--${state.tone}`}>{state.text}</span>
            </span>
            <span className="hj-cabin__radio" aria-hidden />
          </label>
        );
      })}
    </div>
  );
}
