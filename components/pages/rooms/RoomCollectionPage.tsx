"use client";

import Image from "next/image";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { ROOM_SHOWCASES, type RoomShowcase } from "@/lib/room-showcase";
import { resolveCmsText } from "@/lib/website-text-shared";

type RoomCollectionVariant = "cabins" | "royal";

type RoomCollectionPageProps = {
  rooms?: readonly RoomShowcase[];
  variant?: RoomCollectionVariant;
  eyebrow?: string;
  title?: string;
  support?: string;
};

export function RoomCollectionPage({
  rooms = ROOM_SHOWCASES,
  variant,
  eyebrow = "Hathor accommodation",
  title = "Rooms, made for the Nile",
  support = "Four distinct ways to wake beside the river.",
}: RoomCollectionPageProps) {
  const { pages } = useWebsiteText();
  const cms =
    variant === "cabins"
      ? pages.cabins
      : variant === "royal"
        ? pages.royal
        : null;
  const resolvedTitle = cms
    ? resolveCmsText(cms.overviewTitle, title)
    : title;
  const resolvedSupport = cms
    ? resolveCmsText(cms.overviewIntro, support)
    : support;
  const [titleLead, titleTail = ""] = resolvedTitle.split(", ");

  return (
    <div className="public-site hathor-site room-showcase-route">
      <PublicNavbar />
    <main className="room-collection">
      <section className="room-collection__hero">
        <Image src="/media/hathor/scraped/suites-hero.webp" alt="Hathor rooms and suites" fill priority sizes="100vw" />
        <div className="room-collection__wash" aria-hidden="true" />
        <div className="room-collection__hero-copy">
          <p className="wt-page-kicker">{eyebrow}</p>
          <h1 className="wt-page-hero">
            {titleLead}
            {titleTail ? (
              <>
                ,<br />
                <em className="wt-page-hero-second">{titleTail}</em>
              </>
            ) : null}
          </h1>
          <span className="wt-page-body">{resolvedSupport}</span>
        </div>
      </section>

      <section className="room-collection__intro" aria-labelledby="rooms-heading">
        <p className="room-kicker wt-page-kicker">Your private space aboard</p>
        <h2 id="rooms-heading" className="wt-page-title">
          Choose the room that<br />fits your voyage
        </h2>
        <p className="wt-page-body">
          Every room carries Hathor&apos;s quiet cream-and-gold character, panoramic river views and attentive service. Explore the photography and details before choosing an itinerary.
        </p>
      </section>

      <ol className="room-collection__list">
        {rooms.map((room, index) => (
          <li key={room.slug} className="room-collection__item">
            <Link href={`/rooms/${room.slug}`} className="room-collection__media">
              <Image src={room.images[0]} alt={room.name} fill sizes="(max-width: 1024px) 100vw, 62vw" />
              <span className="room-collection__number">0{index + 1}</span>
            </Link>
            <div className="room-collection__copy">
              <p className="room-kicker wt-page-kicker">{room.eyebrow}</p>
              <h2 className="wt-page-title">{room.name}</h2>
              <p className="wt-page-body">{room.description}</p>
              <dl>
                <div><dt>Space</dt><dd>{room.sizeSqm} m²</dd></div>
                <div><dt>Guests</dt><dd>Up to {room.capacity}</dd></div>
              </dl>
              <Link href={`/rooms/${room.slug}`} className="room-text-link">View room <span aria-hidden="true">→</span></Link>
            </div>
          </li>
        ))}
      </ol>

      <section className="room-collection__cta">
        <p className="room-kicker wt-page-kicker">Your Nile story awaits</p>
        <h2 className="wt-page-title">Find your sailing</h2>
        <BookNowTrigger className="room-pill">Book now</BookNowTrigger>
      </section>
    </main>
    </div>
  );
}
