"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { itineraryFor } from "@/lib/booking-itineraries";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import { occupants, shortName, type Arrangement, type Guest } from "./allocation";
import { money, plural, type Sailing } from "./model";
import { RESIDENCE_SLUG } from "./SuitesParts";
import {
  IconBath,
  IconBed,
  IconCheck,
  IconChevron,
  IconGuests,
  IconLink,
  IconSize,
  IconView,
  IconWifi,
} from "./icons";

/** What each type offers, from the room pages' own facts. The size comes from the live availability. */
const STORY: Record<PhysicalRoomType, { tagline: string; features: (size: number) => { icon: ReactNode; text: string }[] }> = {
  "Luxury King Cabin": {
    tagline: "A calm retreat for two.",
    features: size => [
      { icon: <IconBed />, text: "King bed" },
      { icon: <IconSize />, text: `${size} m²` },
      { icon: <IconView />, text: "Panoramic Nile view" },
      { icon: <IconGuests />, text: "Up to 2 guests" },
      { icon: <IconLink />, text: "Connected cabins available" },
      { icon: <IconWifi />, text: "Wi-Fi, room service and daily minibar refill" },
    ],
  },
  "Luxury Twin Cabin": {
    tagline: "Twin beds and wide Nile glass.",
    features: size => [
      { icon: <IconBed />, text: "Twin beds" },
      { icon: <IconSize />, text: `${size} m²` },
      { icon: <IconView />, text: "Panoramic Nile view" },
      { icon: <IconGuests />, text: "Up to 2 guests" },
      { icon: <IconLink />, text: "Connected cabins available" },
      { icon: <IconWifi />, text: "Wi-Fi, room service and daily minibar refill" },
    ],
  },
  "Luxury Suite": {
    tagline: "Generous space and a private Jacuzzi.",
    features: size => [
      { icon: <IconBath />, text: "Private Jacuzzi" },
      { icon: <IconSize />, text: `${size} m² with a separate lounge` },
      { icon: <IconView />, text: "Panoramic Nile view" },
      { icon: <IconGuests />, text: "Up to 4 guests" },
      { icon: <IconLink />, text: "Wide walkways for easy movement" },
      { icon: <IconWifi />, text: "Wi-Fi, room service and daily minibar refill" },
    ],
  },
  "Royal Suite": {
    tagline: "Hathor’s most spacious residence.",
    features: size => [
      { icon: <IconView />, text: "Private balcony on the Main Deck" },
      { icon: <IconBath />, text: "Two bathrooms" },
      { icon: <IconSize />, text: `${size} m² with a private lounge` },
      { icon: <IconGuests />, text: "Up to 4 guests" },
      { icon: <IconWifi />, text: "Wi-Fi, room service and daily minibar refill" },
    ],
  },
};

/**
 * Desktop only: look through the cabin types before placing anyone — the type
 * list, its photographs (16:9) and what it offers. Every booking control stays
 * in the cabin cards and Who Is Travelling below and beside it.
 */
export function SuitesBrowse({
  duration,
  sailing,
  arrangement,
  guests,
  preferredType,
  onShowCabins,
}: {
  duration: StayDurationValue;
  sailing: Sailing;
  arrangement: Arrangement;
  guests: Guest[];
  preferredType: PhysicalRoomType | null;
  /** Filters the cabin cards to this type and brings them into view. */
  onShowCabins: (type: PhysicalRoomType) => void;
}) {
  const [activeType, setActiveType] = useState<PhysicalRoomType>(() => {
    const types = sailing.types;
    if (preferredType && types.some(type => type.roomType === preferredType)) return preferredType;
    return arrangement.cabins[0]?.roomType ?? (types.find(type => type.availableCabins > 0) ?? types[0]).roomType;
  });
  const [photo, setPhoto] = useState<{ type: PhysicalRoomType; index: number }>({ type: activeType, index: 0 });

  const voyage = itineraryFor(duration);
  const type = sailing.types.find(entry => entry.roomType === activeType) ?? sailing.types[0];
  const visuals = getBookingRoomVisuals(type.roomType, type.roomType);
  const photoCount = visuals.gallery.length;
  const photoIndex = photo.type === type.roomType ? photo.index : 0;
  const showPhoto = (index: number) => setPhoto({ type: type.roomType, index: (index + photoCount) % photoCount });
  const story = STORY[type.roomType];
  const guestsIn = (roomType: PhysicalRoomType) =>
    arrangement.cabins.filter(cabin => cabin.roomType === roomType).reduce((sum, cabin) => sum + occupants(arrangement, guests, cabin.id).length, 0);

  return (
    <section className="hj-browse" aria-label="Look through the cabin types">
      <div className="hj-browse__types">
        <span className="hj-browse__label">Select your cabin</span>
        <div className="hj-typelist" role="radiogroup" aria-label="Cabin types">
          {sailing.types.map(entry => {
            const on = entry.roomType === type.roomType;
            const placed = guestsIn(entry.roomType);
            const out = entry.availableCabins === 0;
            return (
              <button
                key={entry.roomType}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={`${entry.roomType}, ${money(entry.priceCents)} per cabin, ${entry.availableCabins} of ${entry.totalCabins} free${placed ? `, ${plural(placed, "guest")} placed` : ""}`}
                className={`hj-typecard${on ? " hj-typecard--on" : ""}${out ? " hj-typecard--out" : ""}`}
                onClick={() => setActiveType(entry.roomType)}
              >
                <span className="hj-typecard__mark" aria-hidden>{on ? <IconCheck /> : null}</span>
                <Image
                  className="hj-typecard__img"
                  src={getBookingRoomVisuals(entry.roomType, entry.roomType).cover}
                  alt=""
                  width={260}
                  height={220}
                  sizes="130px"
                />
                <span className="hj-typecard__body">
                  <span className="hj-typecard__name">{entry.roomType}</span>
                  <span className="hj-typecard__tag">{STORY[entry.roomType].tagline}</span>
                  <span className="hj-typecard__from">Per cabin</span>
                  <span className="hj-typecard__amount">{money(entry.priceCents)}</span>
                  <span className="hj-typecard__per">
                    {out ? "Fully booked on this date" : `entire voyage · ${entry.availableCabins} of ${entry.totalCabins} free`}
                  </span>
                  {placed ? <span className="hj-typecard__placed">{plural(placed, "guest")} placed</span> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="hj-gallery" aria-label={`${type.roomType} photos`}>
        <div
          className="hj-gallery__frame"
          tabIndex={0}
          aria-label={`Photo ${photoIndex + 1} of ${photoCount}. Use the arrow keys for more.`}
          onKeyDown={event => {
            if (event.key === "ArrowRight") showPhoto(photoIndex + 1);
            if (event.key === "ArrowLeft") showPhoto(photoIndex - 1);
          }}
        >
          <Image
            key={visuals.gallery[photoIndex]}
            className="hj-gallery__img"
            src={visuals.gallery[photoIndex]}
            alt={`${type.roomType}, photo ${photoIndex + 1} of ${photoCount}`}
            fill
            priority
            sizes="(min-width: 1081px) 42vw, 100vw"
          />
          {guestsIn(type.roomType) > 0 ? (
            <span className="hj-gallery__badge"><IconCheck /> Selected</span>
          ) : null}
          <button type="button" className="hj-gallery__nav hj-gallery__nav--prev" aria-label="Previous photo" onClick={() => showPhoto(photoIndex - 1)}>
            <IconChevron direction="left" />
          </button>
          <button type="button" className="hj-gallery__nav hj-gallery__nav--next" aria-label="Next photo" onClick={() => showPhoto(photoIndex + 1)}>
            <IconChevron direction="right" />
          </button>
          <span className="hj-gallery__count" aria-hidden>{photoIndex + 1} / {photoCount}</span>
        </div>
        <div className="hj-gallery__dots" role="group" aria-label="Photos">
          {visuals.gallery.map((src, index) => (
            <button
              key={src}
              type="button"
              className="hj-gallery__dot"
              aria-label={`Photo ${index + 1}`}
              aria-pressed={index === photoIndex}
              onClick={() => showPhoto(index)}
            />
          ))}
        </div>
      </div>

      <div className="hj-detail">
        <span className="hj-detail__name">{type.roomType}</span>
        <span className="hj-detail__tag">{story.tagline}</span>
        <ul className="hj-detail__features">
          {story.features(type.sizeSqm).map(feature => (
            <li key={feature.text}>
              <span className="hj-detail__icon" aria-hidden>{feature.icon}</span>
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
        <div className="hj-detail__price">
          <span className="hj-detail__row">
            <span className="hj-detail__from">Per cabin</span>
            <span className="hj-detail__amount">{money(type.priceCents)}</span>
          </span>
          <span className="hj-detail__per">Entire {voyage.nights}-night voyage, all meals and soft drinks included.</span>
        </div>
        <button
          type="button"
          className="hj-detail__show"
          disabled={type.availableCabins === 0}
          onClick={() => onShowCabins(type.roomType)}
        >
          {type.availableCabins === 0
            ? "Fully booked on this date"
            : `Show the ${plural(type.totalCabins, shortName(type.roomType))} · ${type.availableCabins} free`}
          <IconChevron direction="down" />
        </button>
        <a className="hj-detail__link" href={`/rooms/${RESIDENCE_SLUG[type.roomType]}`} target="_blank" rel="noopener noreferrer">
          Full cabin details <span aria-hidden>›</span>
        </a>
      </div>
    </section>
  );
}
