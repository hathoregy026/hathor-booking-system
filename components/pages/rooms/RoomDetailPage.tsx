"use client";

import Image from "next/image";
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
import {
  ROOM_FOLIO_PANELS,
  folioVariantForRoomSlug,
} from "@/lib/room-folio-panels";
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

/** The five stops of the room folio, in the order the page tells them. */
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "fare", label: "Availability" },
  { id: "amenities", label: "Amenities" },
  { id: "stay-notes", label: "Your voyage" },
  { id: "notes", label: "Good to know" },
] as const;

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
  return (
    <Image
      key={cms.src}
      src={cms.src}
      alt={cms.alt || alt}
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
  return (
    <span className="rf-ledger__thumb">
      <Image
        key={cms.src}
        src={cms.src}
        alt={cms.alt || alt}
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

export function RoomDetailPage({ room }: { room: RoomShowcase }) {
  const variant = folioVariantForRoomSlug(room.slug);
  const panels = ROOM_FOLIO_PANELS[variant];
  const collection =
    ROOM_COLLECTION_LINKS.find((link) => link.key === variant) ??
    ROOM_COLLECTION_LINKS[0];
  const prices = useCabinPrices();

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

  const activeTab = useSectionSpy(TABS.map((tab) => tab.id));
  const inclusionHighlights = panels.include.slice(0, 4);

  return (
    <div className="public-site hathor-site room-folio-route">
      <PublicNavbar />

      <main className="rf">
        <div className="rf__wrap">
          <nav className="rf__crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href={collection.href}>{collection.label}</Link>
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
                  {voyage.ports} · {voyage.nights} nights / {voyage.days} days
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

          <nav className="rf__tabs" aria-label="Sections of this room">
            {TABS.map((tab) => (
              <a
                key={tab.id}
                href={`#${tab.id}`}
                className={`rf__tab${activeTab === tab.id ? " is-active" : ""}`}
                aria-current={activeTab === tab.id ? "true" : undefined}
              >
                {tab.label}
              </a>
            ))}
          </nav>

          <section className="rf__stage" aria-label={`${room.name} photographs`}>
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
                  aria-label={`View photograph ${index + 1} of ${photoCount} full screen`}
                >
                  <RoomCmsImage
                    path={src}
                    alt={`${room.name}, view ${index + 1}`}
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
                <span>Space</span>
                <strong>{room.sizeSqm} m²</strong>
              </li>
              <li>
                <span>Guests</span>
                <strong>Up to {room.capacity}</strong>
              </li>
              <li>
                <span>Outlook</span>
                <strong>Panoramic Nile</strong>
              </li>
              <li>
                <span>Children</span>
                <strong>{room.childrenAllowed ? "Welcome" : "Not in this room"}</strong>
              </li>
            </ul>
            <aside className="rf__card" aria-label="Fare and availability">
              <p className="rf__card-kicker">Your voyage</p>
              {voyage ? (
                <>
                  <p className="rf__price">{fare(voyage.priceCents)}</p>
                  <p className="rf__price-note">
                    per cabin · {voyage.nights} nights
                  </p>
                  <p className="rf__price-fine">VAT &amp; service included</p>

                  <dl className="rf__rows">
                    <div className="rf__row">
                      <dt>
                        <MapPin aria-hidden="true" /> Route
                      </dt>
                      <dd>
                        <label className="rf__select">
                          <span className="sr-only">Choose a voyage</span>
                          <select
                            value={voyage.slug}
                            onChange={(event) => setVoyageSlug(event.target.value)}
                          >
                            {voyages.map((entry) => (
                              <option key={entry.slug} value={entry.slug}>
                                {entry.ports} · {entry.nights} nights
                              </option>
                            ))}
                          </select>
                        </label>
                      </dd>
                    </div>
                    <div className="rf__row">
                      <dt>
                        <Calendar aria-hidden="true" /> Departs
                      </dt>
                      <dd>
                        Every {voyage.departureDay}
                        <small>
                          {voyage.nights} nights / {voyage.days} days
                        </small>
                      </dd>
                    </div>
                    <div className="rf__row">
                      <dt>
                        <Users aria-hidden="true" /> Guests
                      </dt>
                      <dd>
                        1 cabin
                        <small>Up to {room.capacity} guests</small>
                      </dd>
                    </div>
                  </dl>
                </>
              ) : null}

              <BookNowTrigger className="room-pill rf__act">
                <span>Check availability</span>
                <ArrowRight aria-hidden="true" />
              </BookNowTrigger>
              <a className="rf__card-link" href="#notes">
                Booking conditions
              </a>
            </aside>
          </section>


          <section className="rf__story" id="overview">
            <div className="rf__story-title">
              <p className="rf__kicker">Inside your room</p>
              <h2 className="rf__display">
                <span>A private place</span>
                <em>to let the Nile in</em>
              </h2>
            </div>
            <div className="rf__story-body">
              <p className="rf__lead">{room.description}</p>
              <p className="rf__note">
                {room.childrenAllowed
                  ? "Children are welcome in this room type."
                  : "This room type does not accommodate children."}
              </p>
              <div className="rf__amenities-head">
                <p className="rf__kicker">Utilities &amp; comforts</p>
                <h3 className="rf__amenities-title">Everything, considered</h3>
              </div>
              <ul className="rf__amenities" id="amenities">
                {room.amenities.map((amenity) => (
                  <li key={amenity} title={amenity}>
                    <span className="rf__amenity-glyph" aria-hidden="true">
                      <RoomAmenityIcon label={amenity} />
                    </span>
                    <span className="rf__amenity-label">
                      {resolveAmenityCaption(amenity).wide}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rf__fare" id="fare">
            <header className="rf__fare-head">
              <p className="rf__kicker">01 — Reservation</p>
              <h2 className="rf__display rf__display--row">Your cabin &amp; fare</h2>
              <p className="rf__meta">
                {voyage
                  ? `${voyage.ports} · every ${voyage.departureDay}`
                  : "Request a date"}
              </p>
            </header>

            <div className="rf-ledger">
              <div className="rf-ledger__row rf-ledger__row--head" aria-hidden="true">
                <span>Accommodation</span>
                <span>Your voyage includes</span>
                <span>{voyage ? `${voyage.nights}-night total` : "Total"}</span>
                <span>Cabins</span>
              </div>
              <div className="rf-ledger__row">
                <div className="rf-ledger__cell rf-ledger__cell--room">
                  <RoomThumb path={room.images[0] ?? ""} alt={room.name} />
                  <div>
                    <h3>{room.name}</h3>
                    <p>
                      {room.sizeSqm} m² · Up to {room.capacity} guests
                    </p>
                    <p>{room.eyebrow}</p>
                  </div>
                </div>
                <div className="rf-ledger__cell">
                  <ul className="rf-ledger__ticks">
                    {inclusionHighlights.map((item) => (
                      <li key={item}>{resolveAmenityCaption(item).tight}</li>
                    ))}
                  </ul>
                  <a className="rf__text-link" href="#notes">
                    See all inclusions
                  </a>
                </div>
                <div className="rf-ledger__cell rf-ledger__cell--price">
                  {voyage ? (
                    <>
                      <p className="rf-ledger__price">
                        {fare(voyage.priceCents)}
                      </p>
                      <p>per cabin</p>
                      <p className="rf__note">VAT &amp; service included</p>
                    </>
                  ) : (
                    <p className="rf__note">Request a date</p>
                  )}
                </div>
                <div className="rf-ledger__cell rf-ledger__cell--count">
                  <p className="rf-ledger__count">1</p>
                  <p className="rf__note">cabin</p>
                </div>
              </div>
            </div>

            <div className="rf__total">
              <p className="rf__total-line">
                1 cabin · {voyage ? `${voyage.nights} nights` : "flexible dates"} ·
                up to {room.capacity} guests
              </p>
              <p className="rf__total-sum">
                <span>Total</span>
                <strong>{voyage ? fare(voyage.priceCents) : "On request"}</strong>
              </p>
              <BookNowTrigger className="room-pill rf__act rf__act--wide">
                <span>Continue to reservation</span>
                <ArrowRight aria-hidden="true" />
              </BookNowTrigger>
            </div>
          </section>

          <section className="rf__notes" id="notes">
            <div className="rf__included">
              <h2 className="rf__display rf__display--sm">
                <span>Included,</span>
                <em>with our care</em>
              </h2>
              <ul className="rf__included-list">
                {panels.include.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rf__know">
              <h2 className="rf__display rf__display--sm">Good to know</h2>
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
          aria-label={`${room.name} photographs`}
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
              alt={`${room.name}, photograph ${photo + 1} of ${photoCount}`}
              sizes="100vw"
              className="rf-view__img"
            />
          </div>
          <button
            type="button"
            className="rf-view__close"
            aria-label="Close photographs"
            onClick={() => viewer.current?.close()}
          >
            <X aria-hidden="true" />
          </button>
          <button
            type="button"
            className="rf-view__nav rf-view__nav--prev"
            aria-label="Previous photograph"
            onClick={() => stepPhoto(-1)}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            className="rf-view__nav rf-view__nav--next"
            aria-label="Next photograph"
            onClick={() => stepPhoto(1)}
          >
            <ChevronRight aria-hidden="true" />
          </button>
          <span className="rf-view__caption">
            {room.name} · {photo + 1} / {photoCount}
          </span>
        </dialog>

      </main>

      {/* The site footer every public page ends on: reservations desk and links. */}
      <Footer />
    </div>
  );
}
