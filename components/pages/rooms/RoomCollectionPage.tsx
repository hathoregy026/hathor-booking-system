"use client";

import Image from "next/image";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { FavoriteButton } from "@/components/selection/FavoriteButton";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import { ROOM_SHOWCASES, type RoomShowcase } from "@/lib/room-showcase";
import { resolveCmsText } from "@/lib/website-text-shared";

type RoomCollectionVariant = "cabins" | "suites" | "royal";

type RoomCollectionPageProps = {
  rooms?: readonly RoomShowcase[];
  variant?: RoomCollectionVariant;
  eyebrow?: string;
  title?: string;
  secondTitle?: string;
  support?: string;
  heroImage?: string;
};

const COLLECTION_LINKS = [
  { href: "/luxury-cabins-Nile-Cruise", label: "Luxury Rooms" },
  { href: "/rooms", label: "Luxury Suites" },
  { href: "/royal-suites", label: "Royal Suites" },
] as const;

export function RoomCollectionPage({
  rooms = ROOM_SHOWCASES,
  variant,
  eyebrow = "Hathor accommodation",
  title = "Rooms",
  secondTitle = "Made for the Nile",
  support = "Four distinct ways to wake beside the river.",
  heroImage = "/media/hathor/scraped/suites-hero.webp",
}: RoomCollectionPageProps) {
  const { pages } = useWebsiteText();
  const cms =
    variant === "cabins"
      ? pages.cabins
      : variant === "suites"
        ? pages.rooms
        : variant === "royal"
          ? pages.royal
          : null;
  const resolvedTitle = cms
    ? resolveCmsText(cms.overviewTitle, title)
    : title;
  const resolvedSupport = cms
    ? resolveCmsText(cms.overviewIntro, support)
    : support;

  return (
    <div className="public-site hathor-site room-showcase-route">
      <PublicNavbar />
      <main className="room-collection">
        <section className="room-collection__hero">
          <Image
            src={heroImage}
            alt={`${title} aboard Hathor Dahabiya`}
            fill
            priority
            sizes="100vw"
          />
          <div className="room-collection__wash" aria-hidden="true" />
          <div className="room-collection__hero-copy">
            <p className="wt-page-kicker">{eyebrow}</p>
            <h1 className="wt-page-hero">
              <span>{title}</span>
              <em className="wt-page-hero-second">{secondTitle}</em>
            </h1>
            <p className="room-collection__hero-support wt-page-body">
              {resolvedSupport}
            </p>
          </div>
          <p className="room-collection__hero-mark" aria-hidden="true">
            Hathor Cruise <span>®</span> 2026
          </p>
          <a className="room-collection__scroll" href="#collection-intro">
            <i aria-hidden="true" />
            Discover
          </a>
        </section>

        <section
          id="collection-intro"
          className="room-collection__intro"
          aria-labelledby="rooms-heading"
        >
          <p className="room-kicker wt-page-kicker">Your private space aboard</p>
          <h2 id="rooms-heading" className="wt-page-title">
            A residence shaped<br />by the river
          </h2>
          <p className="room-collection__intro-lead wt-page-body">
            {resolvedTitle}
          </p>
          <p className="wt-page-body">
            Every room carries Hathor&apos;s quiet cream-and-gold character,
            panoramic river views and attentive service. Explore the
            photography and details before choosing an itinerary.
          </p>
        </section>

        <ol className="room-collection__list">
          {rooms.map((room, index) => (
            <li key={room.slug} className="room-collection__item">
              {/*
                The media element keeps its class, grid cell, dimensions and
                position: relative exactly as before. It is a <div> rather than
                an <a> so the Favorite control can be a SIBLING of the link —
                a <button> inside an <a> is invalid HTML. Navigation is restored
                by a transparent stretched link covering the same area.
              */}
              <div className="room-collection__media">
                <Image
                  src={room.images[0]}
                  alt={`${room.name} interior aboard Hathor Dahabiya`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 62vw"
                />
                <Link
                  href={`/rooms/${room.slug}`}
                  className="room-collection__media-link"
                  aria-label={`Explore ${room.name}`}
                />
                {/*
                  Both controls live in one absolutely-positioned stack, so the
                  card's dimensions, grid and image crop are untouched.
                */}
                <div className="hathor-select-stack room-collection__select">
                  <FavoriteButton
                    type="residence"
                    slug={room.slug}
                    name={room.name}
                    variant="card"
                  />
                  <AddToVoyageButton
                    kind="residence"
                    slug={room.slug}
                    name={room.name}
                    variant="card"
                  />
                </div>
                <span className="room-collection__number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="room-collection__media-caption">
                  Nile residence · Hathor
                </span>
              </div>
              <div className="room-collection__copy">
                <p className="room-kicker wt-page-kicker">{room.eyebrow}</p>
                <h2 className="wt-page-title">{room.name}</h2>
                <p className="wt-page-body">{room.description}</p>
                <dl>
                  <div>
                    <dt>Space</dt>
                    <dd>{room.sizeSqm} m²</dd>
                  </div>
                  <div>
                    <dt>Guests</dt>
                    <dd>Up to {room.capacity}</dd>
                  </div>
                  <div>
                    <dt>View</dt>
                    <dd>Nile</dd>
                  </div>
                </dl>
                <Link href={`/rooms/${room.slug}`} className="room-text-link">
                  View residence <span aria-hidden="true">→</span>
                </Link>
              </div>
            </li>
          ))}
        </ol>

        <nav
          className="room-collection__crosslinks"
          aria-label="Accommodation collections"
        >
          <p className="room-kicker wt-page-kicker">Explore the collection</p>
          <ul>
            {COLLECTION_LINKS.map((link, index) => (
              <li key={link.href}>
                <Link href={link.href}>
                  <span>0{index + 1}</span>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className="room-collection__cta">
          <p className="room-kicker wt-page-kicker">Your Nile story awaits</p>
          <h2 className="wt-page-title">Find your sailing</h2>
          <p className="wt-page-body">
            Let our reservations team pair your preferred residence with the
            right journey between Luxor and Aswan.
          </p>
          <BookNowTrigger className="room-pill">Check availability</BookNowTrigger>
        </section>
      </main>
    </div>
  );
}
