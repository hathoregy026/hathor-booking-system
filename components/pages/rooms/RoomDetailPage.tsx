"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  X,
} from "lucide-react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { FavoriteButton } from "@/components/selection/FavoriteButton";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import { useCabinPrices } from "@/components/public/CabinPricesProvider";
import { useCmsPathImage } from "@/hooks/useCmsPathImage";
import {
  RoomAmenityIcon,
  resolveAmenityCaption,
} from "@/components/pages/rooms/RoomAmenityIcon";
import { RoomFolioAccordion } from "@/components/pages/rooms/RoomFolioAccordion";
import { livePriceFor } from "@/lib/cabin-prices-shared";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { ROOM_COLLECTION_LINKS } from "@/lib/room-collection-editorial";
import { folioVariantForRoomSlug } from "@/lib/room-folio-panels";
import { useLocalizedHref, usePublicLocale } from "@/hooks/usePublicLocale";
import { amenityIn, placesIn, weekdayIn } from "@/lib/i18n/catalog-copy";
import { ROOMS_COPY, roomFolioPanels, roomShowcaseIn } from "@/lib/i18n/rooms-copy";
import type { RoomShowcase } from "@/lib/room-showcase";
import { siteImageAnchorId } from "@/lib/site-image-preview";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";

/** Whole dollars, the way every other fare on the site is written. */
function fare(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

/** The five stops of the room folio, in the order the page tells them (labels: copy.tabs). */
const TABS = ["overview", "fare", "amenities", "stay-notes", "notes"] as const;

function RoomCmsImage({
  path,
  alt,
  priority = false,
  sizes,
  className,
}: {
  path: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
}) {
  const cms = useCmsPathImage(path);
  /* The dashboard's image descriptions are English; other languages use the page's own. */
  const english = usePublicLocale() === "en";
  return (
    <Image
      key={cms.src}
      src={cms.src}
      alt={english ? cms.alt || alt : alt}
      fill
      priority={priority}
      quality={SITE_IMAGE_QUALITY}
      sizes={sizes}
      className={className}
      id={cms.slot ? siteImageAnchorId(cms.slot) : undefined}
      data-site-image={cms.slot ?? undefined}
    />
  );
}

/** A small square of the room, used inside the fare ledger. */
function RoomThumb({ path, alt }: { path: string; alt: string }) {
  const cms = useCmsPathImage(path);
  const english = usePublicLocale() === "en";
  return (
    <span className="rf-ledger__thumb">
      <Image
        key={cms.src}
        src={cms.src}
        alt={english ? cms.alt || alt : alt}
        fill
        quality={SITE_IMAGE_QUALITY}
        sizes="140px"
        data-site-image={cms.slot ?? undefined}
      />
    </span>
  );
}

/** The tab that matches the section the reader has reached. */
function useSectionSpy(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      /* A section counts as "here" once it reaches the band under the tabs. */
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export function RoomDetailPage({
  room: roomProp,
  reviews,
}: {
  room: RoomShowcase;
  /** Server-rendered guest reviews, closing the page before the footer. */
  reviews?: ReactNode;
}) {
  const locale = usePublicLocale();
  const t = ROOMS_COPY[locale].detail;
  const localHref = useLocalizedHref();
  const room = useMemo(() => roomShowcaseIn(roomProp, locale), [roomProp, locale]);
  const variant = folioVariantForRoomSlug(room.slug);
  const panels = roomFolioPanels(variant, locale);
  const collection =
    ROOM_COLLECTION_LINKS.find((link) => link.key === variant) ??
    ROOM_COLLECTION_LINKS[0];
  const prices = useCabinPrices();
  const words = ROOMS_COPY[locale];

  /* Every sailing this room is sold on, with the price the booking charges. */
  const voyages = useMemo(
    () =>
      HATHOR_CRUISES.flatMap((cruise) => {
        const cabin = cruise.rooms.find((entry) => entry.name === room.name);
        if (!cabin) return [];
        return [
          {
            slug: cruise.slug,
            ports: cruise.ports,
            departureDay: cruise.departureDay,
            nights: cruise.nights,
            days: cruise.days,
            capacity: cabin.capacity,
            priceCents:
              livePriceFor(prices, cruise.slug, cabin.roomNumber) ??
              cabin.priceCents,
          },
        ];
      }),
    [prices, room.name],
  );

  const longest = voyages.reduce(
    (best, voyage) => (voyage.nights > (best?.nights ?? 0) ? voyage : best),
    voyages[0],
  );
  const [voyageSlug, setVoyageSlug] = useState<string | null>(null);
  const voyage = voyages.find((entry) => entry.slug === voyageSlug) ?? longest;

  /* Photographs open full screen, and step with the arrow keys. */
  const photoCount = room.images.length;
  const viewer = useRef<HTMLDialogElement | null>(null);
  const [photo, setPhoto] = useState(0);
  /* Stepping reads the live index, so two quick presses both count. */
  const stepPhoto = (delta: number) =>
    setPhoto((current) => (current + delta + photoCount) % photoCount);
  const openPhoto = (index: number) => {
    setPhoto(index);
    viewer.current?.showModal();
  };
  /* Twelve columns share out between the frames below the opening pair. */
  const tail = Math.max(0, photoCount - 3);
  const tailSpan = tail > 0 ? Math.max(2, Math.floor(12 / tail)) : 12;

  const activeTab = useSectionSpy(TABS);
  /* Route and departure day in the page language; prices and choices are unchanged. */
  const ports = (value: string) => placesIn(locale, value);
  const day = (value: string) => weekdayIn(locale, value);
  const inclusionHighlights = panels.include.slice(0, 4);

  return (
    <div className="public-site hathor-site room-folio-route">
      <PublicNavbar />

      <main className="rf">
        <div className="rf__wrap">
          <nav className="rf__crumbs" aria-label={t.breadcrumb}>
            <Link href={localHref("/")}>Home</Link>
            <span aria-hidden="true">/</span>
            <Link href={localHref(collection.href)}>{collection.label}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{room.name}</span>
          </nav>

          <header className="rf__head">
            <div className="rf__head-copy">
              <p className="rf__kicker">{collection.label}</p>
              <h1 className="rf__title">{room.name}</h1>
              <p className="rf__script">{room.eyebrow}</p>
              {voyage ? (
                <p className="rf__meta">
                  {ports(voyage.ports)} · {t.nightsDays(voyage.nights, voyage.days)}
                </p>
              ) : null}
            </div>
            <div className="rf__head-acts">
              <FavoriteButton
                type="residence"
                slug={room.slug}
                name={room.name}
                variant="inline"
                showLabel
              />
              <AddToVoyageButton
                kind="residence"
                slug={room.slug}
                name={room.name}
                variant="inline"
              />
            </div>
          </header>

          <nav className="rf__tabs" aria-label={t.sections}>
            {TABS.map((id, index) => (
              <a
                key={id}
                href={`#${id}`}
                className={`rf__tab${activeTab === id ? " is-active" : ""}`}
                aria-current={activeTab === id ? "true" : undefined}
              >
                {t.tabs[index]}
              </a>
            ))}
          </nav>

          <section className="rf__stage" aria-label={t.photographs(room.name)}>
            {/* Desktop reads the set as one plate and two; a phone swipes it. */}
            <div
              className="rf__frames"
              style={{ "--rf-tail-span": tailSpan } as CSSProperties}
            >
              {room.images.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  className="rf__frame"
                  onClick={() => openPhoto(index)}
                  aria-label={t.openPhoto(index + 1, photoCount)}
                >
                  <RoomCmsImage
                    path={src}
                    alt={t.photoAlt(room.name, index + 1)}
                    priority={index === 0}
                    sizes={
                      index === 0
                        ? "(max-width: 760px) 86vw, (max-width: 1024px) 100vw, 46vw"
                        : "(max-width: 760px) 86vw, (max-width: 1024px) 50vw, 22vw"
                    }
                  />
                </button>
              ))}
            </div>

            <ul className="rf__specs">
              <li>
                <span>{words.space}</span>
                <strong>{room.sizeSqm} m²</strong>
              </li>
              <li>
                <span>{words.guests}</span>
                <strong>{words.upTo(room.capacity)}</strong>
              </li>
              <li>
                <span>{words.outlook}</span>
                <strong>{words.panoramicNile}</strong>
              </li>
              <li>
                <span>{t.children}</span>
                <strong>{room.childrenAllowed ? t.childrenWelcome : t.childrenNo}</strong>
              </li>
            </ul>
            <aside className="rf__card" aria-label={t.fareLabel}>
              <p className="rf__card-kicker">{t.yourVoyage}</p>
              {voyage ? (
                <>
                  <p className="rf__price">{fare(voyage.priceCents)}</p>
                  <p className="rf__price-note">{t.perCabinNights(voyage.nights)}</p>
                  <p className="rf__price-fine">{t.vatIncluded}</p>

                  <dl className="rf__rows">
                    <div className="rf__row">
                      <dt>
                        <MapPin aria-hidden="true" /> {t.route}
                      </dt>
                      <dd>
                        <label className="rf__select">
                          <span className="sr-only">{t.chooseVoyage}</span>
                          <select
                            value={voyage.slug}
                            onChange={(event) => setVoyageSlug(event.target.value)}
                          >
                            {voyages.map((entry) => (
                              <option key={entry.slug} value={entry.slug}>
                                {t.voyageOption(ports(entry.ports), entry.nights)}
                              </option>
                            ))}
                          </select>
                        </label>
                      </dd>
                    </div>
                    <div className="rf__row">
                      <dt>
                        <Calendar aria-hidden="true" /> {t.departs}
                      </dt>
                      <dd>
                        {t.every(day(voyage.departureDay))}
                        <small>{t.nightsDays(voyage.nights, voyage.days)}</small>
                      </dd>
                    </div>
                    <div className="rf__row">
                      <dt>
                        <Users aria-hidden="true" /> {words.guests}
                      </dt>
                      <dd>
                        {t.oneCabin}
                        <small>{t.upToGuests(room.capacity)}</small>
                      </dd>
                    </div>
                  </dl>
                </>
              ) : null}

              <BookNowTrigger className="room-pill rf__act">
                <span>{t.checkAvailability}</span>
                <ArrowRight aria-hidden="true" />
              </BookNowTrigger>
              <a className="rf__card-link" href="#notes">
                {t.conditions}
              </a>
            </aside>
          </section>


          <section className="rf__story" id="overview">
            <div className="rf__story-title">
              <p className="rf__kicker">{t.insideKicker}</p>
              <h2 className="rf__display">
                <span>{t.insideTitle[0]}</span>
                <em>{t.insideTitle[1]}</em>
              </h2>
            </div>
            <div className="rf__story-body">
              <p className="rf__lead">{room.description}</p>
              <p className="rf__note">{t.childrenNote(room.childrenAllowed)}</p>
              <div className="rf__amenities-head">
                <p className="rf__kicker">{t.comfortsKicker}</p>
                <h3 className="rf__amenities-title">{t.comfortsTitle}</h3>
              </div>
              <ul className="rf__amenities" id="amenities">
                {room.amenities.map((amenity) => (
                  <li key={amenity} title={amenityIn(locale, amenity)}>
                    <span className="rf__amenity-glyph" aria-hidden="true">
                      <RoomAmenityIcon label={amenity} />
                    </span>
                    <span className="rf__amenity-label">
                      {resolveAmenityCaption(amenity, locale).wide}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rf__fare" id="fare">
            <header className="rf__fare-head">
              <p className="rf__kicker">{t.reservationKicker}</p>
              <h2 className="rf__display rf__display--row">{t.fareTitle}</h2>
              <p className="rf__meta">
                {voyage
                  ? t.portsEvery(ports(voyage.ports), day(voyage.departureDay))
                  : t.requestDate}
              </p>
            </header>

            <div className="rf-ledger">
              <div className="rf-ledger__row rf-ledger__row--head" aria-hidden="true">
                {t.ledgerHead(voyage ? voyage.nights : null).map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <div className="rf-ledger__row">
                <div className="rf-ledger__cell rf-ledger__cell--room">
                  <RoomThumb path={room.images[0] ?? ""} alt={room.name} />
                  <div>
                    <h3>{room.name}</h3>
                    <p>{t.sizeGuests(room.sizeSqm, room.capacity)}</p>
                    <p>{room.eyebrow}</p>
                  </div>
                </div>
                <div className="rf-ledger__cell">
                  <ul className="rf-ledger__ticks">
                    {inclusionHighlights.map((item) => (
                      <li key={item}>{resolveAmenityCaption(item, locale).tight}</li>
                    ))}
                  </ul>
                  <a className="rf__text-link" href="#notes">
                    {t.allInclusions}
                  </a>
                </div>
                <div className="rf-ledger__cell rf-ledger__cell--price">
                  {voyage ? (
                    <>
                      <p className="rf-ledger__price">
                        {fare(voyage.priceCents)}
                      </p>
                      <p>{t.perCabin}</p>
                      <p className="rf__note">{t.vatIncluded}</p>
                    </>
                  ) : (
                    <p className="rf__note">{t.requestDate}</p>
                  )}
                </div>
                <div className="rf-ledger__cell rf-ledger__cell--count">
                  <p className="rf-ledger__count">1</p>
                  <p className="rf__note">{t.cabin}</p>
                </div>
              </div>
            </div>

            <div className="rf__total">
              <p className="rf__total-line">
                {t.totalLine(voyage ? voyage.nights : null, room.capacity)}
              </p>
              <p className="rf__total-sum">
                <span>{t.total}</span>
                <strong>{voyage ? fare(voyage.priceCents) : t.onRequest}</strong>
              </p>
              <BookNowTrigger className="room-pill rf__act rf__act--wide">
                <span>{t.continueToReservation}</span>
                <ArrowRight aria-hidden="true" />
              </BookNowTrigger>
            </div>
          </section>

          <section className="rf__notes" id="notes">
            <div className="rf__included">
              <h2 className="rf__display rf__display--sm">
                <span>{t.includedTitle[0]}</span>
                <em>{t.includedTitle[1]}</em>
              </h2>
              <ul className="rf__included-list">
                {panels.include.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rf__know">
              <h2 className="rf__display rf__display--sm">{t.goodToKnow}</h2>
              <ul className="rf__know-list">
                {panels.exclude.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p className="rf__note">{panels.availability.note}</p>
            </div>
          </section>

          {/* The full folio: overview, itineraries, inclusions and sailings. */}
          <RoomFolioAccordion variant={variant} className="rf__folio" />
        </div>

        <dialog
          className="rf-view"
          ref={viewer}
          aria-label={t.photographs(room.name)}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") stepPhoto(1);
            if (event.key === "ArrowLeft") stepPhoto(-1);
          }}
          onClick={(event) => {
            /* A click on the dark surround closes, as the X does. */
            if (event.target === event.currentTarget) viewer.current?.close();
          }}
        >
          <div className="rf-view__stage">
            <RoomCmsImage
              path={room.images[photo] ?? ""}
              alt={t.viewerAlt(room.name, photo + 1, photoCount)}
              sizes="100vw"
              className="rf-view__img"
            />
          </div>
          <button
            type="button"
            className="rf-view__close"
            aria-label={t.closePhotos}
            onClick={() => viewer.current?.close()}
          >
            <X aria-hidden="true" />
          </button>
          <button
            type="button"
            className="rf-view__nav rf-view__nav--prev"
            aria-label={t.previousPhoto}
            onClick={() => stepPhoto(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            className="rf-view__nav rf-view__nav--next"
            aria-label={t.nextPhoto}
            onClick={() => stepPhoto(1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
          <span className="rf-view__caption">
            {room.name} · {photo + 1} / {photoCount}
          </span>
        </dialog>

      </main>

      {reviews}

      {/* The site footer every public page ends on: reservations desk and links. */}
      <Footer />
    </div>
  );
}
