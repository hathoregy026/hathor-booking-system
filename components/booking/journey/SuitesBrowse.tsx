"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { itineraryFor } from "@/lib/booking-itineraries";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import { occupants, shortName, type Arrangement, type Guest } from "./allocation";
import { money, plural, type Sailing } from "./model";
import { RESIDENCE_SLUG } from "./SuitesParts";
import { useStickyFit } from "./useStickyFit";
import {
  IconBath,
  IconBed,
  IconCheck,
  IconChevron,
  IconClose,
  IconGuests,
  IconLink,
  IconOpen,
  IconSize,
  IconView,
  IconWifi,
} from "./icons";

/** What each type offers, from the room pages' own facts. The size comes from the live availability. */
export const STORY: Record<PhysicalRoomType, { tagline: string; features: (size: number) => { icon: ReactNode; text: string }[] }> = {
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
 * Desktop only: the preview beside the cabins — the type's photographs (16:9)
 * and what it offers. The cabin types and every cabin card sit in the column
 * beside it; choosing one shows it here.
 */
export function SuitesBrowse({
  duration,
  sailing,
  previewType,
  previewLabel,
  arrangement,
  guests,
  onShowCabins,
}: {
  duration: StayDurationValue;
  sailing: Sailing;
  /** The cabin type on show, chosen in the cabins column. */
  previewType: PhysicalRoomType;
  /** The cabin chosen ("King Cabin 3"). */
  previewLabel: string;
  arrangement: Arrangement;
  guests: Guest[];
  /** Filters the cabin cards to this type and brings them into view. */
  onShowCabins: (type: PhysicalRoomType) => void;
}) {
  const [photo, setPhoto] = useState<{ type: PhysicalRoomType; index: number }>({ type: previewType, index: 0 });
  const browseRef = useRef<HTMLElement | null>(null);
  useStickyFit(browseRef);
  /** Full-screen photographs: opened from the picture, closed with the X or Esc. */
  const viewer = useRef<HTMLDialogElement | null>(null);

  const voyage = itineraryFor(duration);
  const type = sailing.types.find(entry => entry.roomType === previewType) ?? sailing.types[0];
  const visuals = getBookingRoomVisuals(type.roomType, type.roomType);
  const photoCount = visuals.gallery.length;
  const photoIndex = photo.type === type.roomType ? photo.index : 0;
  const showPhoto = (index: number) => setPhoto({ type: type.roomType, index: (index + photoCount) % photoCount });
  const story = STORY[type.roomType];
  const placed = arrangement.cabins
    .filter(cabin => cabin.roomType === type.roomType)
    .reduce((sum, cabin) => sum + occupants(arrangement, guests, cabin.id).length, 0);
  const roomHref = `/rooms/${RESIDENCE_SLUG[type.roomType]}`;

  return (
    <section className="hj-browse" aria-label={`${type.roomType} preview`} ref={browseRef}>
      <div className="hj-gallery" aria-label={`${type.roomType} photos`}>
        <div
          className="hj-gallery__frame"
          tabIndex={0}
          aria-label={`Photo ${photoIndex + 1} of ${photoCount}. Use the arrow keys for more.`}
          onKeyDown={event => {
            if (event.key === "ArrowRight") showPhoto(photoIndex + 1);
            if (event.key === "ArrowLeft") showPhoto(photoIndex - 1);
            if (event.key === "Enter") viewer.current?.showModal();
          }}
        >
          <Image
            key={visuals.gallery[photoIndex]}
            onClick={() => viewer.current?.showModal()}
            className="hj-gallery__img"
            src={visuals.gallery[photoIndex]}
            alt={`${type.roomType}, photo ${photoIndex + 1} of ${photoCount}`}
            fill
            priority
            sizes="(min-width: 1081px) 46vw, 100vw"
          />
          {placed > 0 ? (
            <span className="hj-gallery__badge"><IconCheck /> In your booking</span>
          ) : null}
          <button type="button" className="hj-gallery__nav hj-gallery__nav--prev" aria-label="Previous photo" onClick={() => showPhoto(photoIndex - 1)}>
            <IconChevron direction="left" />
          </button>
          <button type="button" className="hj-gallery__nav hj-gallery__nav--next" aria-label="Next photo" onClick={() => showPhoto(photoIndex + 1)}>
            <IconChevron direction="right" />
          </button>
          <span className="hj-gallery__count" aria-hidden>{photoIndex + 1} / {photoCount}</span>
          <a className="hj-gallery__view" href={roomHref} target="_blank" rel="noopener noreferrer" aria-label={`View the ${type.roomType} (opens in a new tab)`}>
            View room <IconOpen />
          </a>
        </div>

        <dialog
          className="hj-lightbox"
          ref={viewer}
          aria-label={`${type.roomType} photos`}
          onKeyDown={event => {
            if (event.key === "ArrowRight") showPhoto(photoIndex + 1);
            if (event.key === "ArrowLeft") showPhoto(photoIndex - 1);
          }}
          onClick={event => {
            // A click on the dark surround closes, as the X does.
            if (event.target === event.currentTarget) viewer.current?.close();
          }}
        >
          <div className="hj-lightbox__stage">
            <Image
              key={`full-${visuals.gallery[photoIndex]}`}
              className="hj-lightbox__img"
              src={visuals.gallery[photoIndex]}
              alt={`${type.roomType}, photo ${photoIndex + 1} of ${photoCount}`}
              fill
              sizes="100vw"
            />
          </div>
          <button type="button" className="hj-lightbox__close" aria-label="Close photos" onClick={() => viewer.current?.close()}>
            <IconClose />
          </button>
          <button type="button" className="hj-lightbox__nav hj-lightbox__nav--prev" aria-label="Previous photo" onClick={() => showPhoto(photoIndex - 1)}>
            <IconChevron direction="left" />
          </button>
          <button type="button" className="hj-lightbox__nav hj-lightbox__nav--next" aria-label="Next photo" onClick={() => showPhoto(photoIndex + 1)}>
            <IconChevron direction="right" />
          </button>
          <span className="hj-lightbox__caption">{type.roomType} · {photoIndex + 1} / {photoCount}</span>
        </dialog>
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
        <span className="hj-detail__kicker">Selected · {previewLabel}</span>
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
          <IconChevron direction="right" />
        </button>
        <a className="hj-detail__link" href={roomHref} target="_blank" rel="noopener noreferrer">
          Full cabin details <span aria-hidden>›</span>
        </a>
      </div>
    </section>
  );
}
