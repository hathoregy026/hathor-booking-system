"use client";

import { useRef, useState, type ReactNode } from "react";
import { getBookingRoomVisuals } from "@/lib/booking-room-media";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { bookingItinerary } from "@/lib/i18n/booking-itineraries-it";
import { localizedHref } from "@/lib/i18n/locale";
import type { PhysicalRoomType } from "@/lib/physical-inventory";
import { occupants, shortName, type Arrangement, type Guest } from "./allocation";
import type { Sailing } from "./model";
import { RESIDENCE_SLUG } from "./SuitesParts";
import { useStickyFit } from "./useStickyFit";
import { useBookingCopy } from "./useBookingCopy";
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

/** Direct file URL. Skips /_next/image, whose earlier misses were stored as immutable. */
function gallerySrc(src: string): string {
  return src.includes("?") ? src : `${src}?v=2`;
}

/**
 * What each type offers, from the room pages' own facts: the icon of each
 * line here, its words in the booking copy. The size comes from the live
 * availability.
 */
const FEATURE_ICONS: Record<PhysicalRoomType, ReactNode[]> = {
  "Luxury King Cabin": [<IconBed key="bed" />, <IconSize key="size" />, <IconView key="view" />, <IconGuests key="guests" />, <IconLink key="link" />, <IconWifi key="wifi" />],
  "Luxury Twin Cabin": [<IconBed key="bed" />, <IconSize key="size" />, <IconView key="view" />, <IconGuests key="guests" />, <IconLink key="link" />, <IconWifi key="wifi" />],
  "Luxury Suite": [<IconBath key="bath" />, <IconSize key="size" />, <IconView key="view" />, <IconGuests key="guests" />, <IconLink key="link" />, <IconWifi key="wifi" />],
  "Royal Suite": [<IconView key="view" />, <IconBath key="bath" />, <IconSize key="size" />, <IconGuests key="guests" />, <IconWifi key="wifi" />],
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
  const t = useBookingCopy();
  const [photo, setPhoto] = useState<{ type: PhysicalRoomType; index: number }>({ type: previewType, index: 0 });
  const browseRef = useRef<HTMLElement | null>(null);
  useStickyFit(browseRef);
  /** Full-screen photographs: opened from the picture, closed with the X or Esc. */
  const viewer = useRef<HTMLDialogElement | null>(null);

  const voyage = bookingItinerary(duration, t.locale);
  const type = sailing.types.find(entry => entry.roomType === previewType) ?? sailing.types[0];
  const visuals = getBookingRoomVisuals(type.roomType, type.roomType);
  const photoCount = visuals.gallery.length;
  const photoIndex = photo.type === type.roomType ? photo.index : 0;
  const showPhoto = (index: number) => setPhoto({ type: type.roomType, index: (index + photoCount) % photoCount });
  const features = t.suites.browse.features[type.roomType](type.sizeSqm).map((text, index) => ({ icon: FEATURE_ICONS[type.roomType][index], text }));
  const placed = arrangement.cabins
    .filter(cabin => cabin.roomType === type.roomType)
    .reduce((sum, cabin) => sum + occupants(arrangement, guests, cabin.id).length, 0);
  const roomHref = localizedHref(`/rooms/${RESIDENCE_SLUG[type.roomType]}`, t.locale);

  return (
    <section className="hj-browse" aria-label={t.suites.browse.preview(type.roomType)} ref={browseRef}>
      <div className="hj-gallery" aria-label={t.suites.browse.photos(type.roomType)}>
        <div
          className="hj-gallery__frame"
          tabIndex={0}
          aria-label={t.suites.browse.photoOf(photoIndex + 1, photoCount)}
          onKeyDown={event => {
            if (event.key === "ArrowRight") showPhoto(photoIndex + 1);
            if (event.key === "ArrowLeft") showPhoto(photoIndex - 1);
            if (event.key === "Enter") viewer.current?.showModal();
          }}
        >
          <img
            key={visuals.gallery[photoIndex]}
            onClick={() => viewer.current?.showModal()}
            className="hj-gallery__img"
            src={gallerySrc(visuals.gallery[photoIndex])}
            alt={t.suites.browse.photoAlt(type.roomType, photoIndex + 1, photoCount)}
          />
          {placed > 0 ? (
            <span className="hj-gallery__badge"><IconCheck /> {t.suites.browse.inBooking}</span>
          ) : null}
          <button type="button" className="hj-gallery__nav hj-gallery__nav--prev" aria-label={t.suites.browse.previousPhoto} onClick={() => showPhoto(photoIndex - 1)}>
            <IconChevron direction="left" />
          </button>
          <button type="button" className="hj-gallery__nav hj-gallery__nav--next" aria-label={t.suites.browse.nextPhoto} onClick={() => showPhoto(photoIndex + 1)}>
            <IconChevron direction="right" />
          </button>
          <span className="hj-gallery__count" aria-hidden>{photoIndex + 1} / {photoCount}</span>
          <a className="hj-gallery__view" href={roomHref} target="_blank" rel="noopener noreferrer" aria-label={t.suites.viewRoomLabel(type.roomType)}>
            {t.suites.viewRoom} <IconOpen />
          </a>
        </div>

        <dialog
          className="hj-lightbox"
          ref={viewer}
          aria-label={t.suites.browse.photos(type.roomType)}
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
            <img
              key={`full-${visuals.gallery[photoIndex]}`}
              className="hj-lightbox__img"
              src={gallerySrc(visuals.gallery[photoIndex])}
              alt={t.suites.browse.photoAlt(type.roomType, photoIndex + 1, photoCount)}
            />
          </div>
          <button type="button" className="hj-lightbox__close" aria-label={t.suites.browse.closePhotos} onClick={() => viewer.current?.close()}>
            <IconClose />
          </button>
          <button type="button" className="hj-lightbox__nav hj-lightbox__nav--prev" aria-label={t.suites.browse.previousPhoto} onClick={() => showPhoto(photoIndex - 1)}>
            <IconChevron direction="left" />
          </button>
          <button type="button" className="hj-lightbox__nav hj-lightbox__nav--next" aria-label={t.suites.browse.nextPhoto} onClick={() => showPhoto(photoIndex + 1)}>
            <IconChevron direction="right" />
          </button>
          <span className="hj-lightbox__caption">{type.roomType} · {photoIndex + 1} / {photoCount}</span>
        </dialog>
        <div className="hj-gallery__dots" role="group" aria-label={t.suites.browse.photosGroup}>
          {visuals.gallery.map((src, index) => (
            <button
              key={src}
              type="button"
              className="hj-gallery__dot"
              aria-label={t.suites.browse.photo(index + 1)}
              aria-pressed={index === photoIndex}
              onClick={() => showPhoto(index)}
            />
          ))}
        </div>
      </div>

      <div className="hj-detail">
        <span className="hj-detail__kicker">{t.suites.browse.selected(previewLabel)}</span>
        <span className="hj-detail__name">{type.roomType}</span>
        <span className="hj-detail__tag">{t.suites.browse.tagline[type.roomType]}</span>
        <ul className="hj-detail__features">
          {features.map(feature => (
            <li key={feature.text}>
              <span className="hj-detail__icon" aria-hidden>{feature.icon}</span>
              <span>{feature.text}</span>
            </li>
          ))}
        </ul>
        <div className="hj-detail__price">
          <span className="hj-detail__row">
            <span className="hj-detail__from">{t.suites.browse.perCabin}</span>
            <span className="hj-detail__amount">{t.money(type.priceCents)}</span>
          </span>
          <span className="hj-detail__per">{t.suites.browse.voyageMeals(voyage.nights)}</span>
        </div>
        <button
          type="button"
          className="hj-detail__show"
          disabled={type.availableCabins === 0}
          onClick={() => onShowCabins(type.roomType)}
        >
          {type.availableCabins === 0
            ? t.suites.browse.fullyBooked
            : t.suites.browse.showType(type.totalCabins, shortName(type.roomType), type.availableCabins)}
          <IconChevron direction="right" />
        </button>
        <a className="hj-detail__link" href={roomHref} target="_blank" rel="noopener noreferrer">
          {t.suites.browse.fullDetails} <span aria-hidden>›</span>
        </a>
      </div>
    </section>
  );
}
