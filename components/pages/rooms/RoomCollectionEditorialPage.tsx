"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { FavoriteButton } from "@/components/selection/FavoriteButton";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import { RoomAmenityIcon } from "@/components/pages/rooms/RoomAmenityIcon";
import { useRoomCollectionEditorialScroll } from "@/hooks/useRoomCollectionEditorialScroll";
import {
  ROOM_COLLECTION_CONFIG,
  ROOM_COLLECTION_LINKS,
  type RoomCollectionVariant,
} from "@/lib/room-collection-editorial";
import { ROOM_SHOWCASES, type RoomShowcase } from "@/lib/room-showcase";
import { resolveCmsText } from "@/lib/website-text-shared";

type RoomCollectionEditorialPageProps = {
  variant: RoomCollectionVariant;
  rooms?: readonly RoomShowcase[];
};

function Scene({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={`rm-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="rm-eyebrow">({children})</p>;
}

function RoomMedia({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <figure className={`rm-media ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 70vw"
        className="rm-media__image"
      />
    </figure>
  );
}

function RoomGallery({ room }: { room: RoomShowcase }) {
  const frames = room.images.slice(0, 5);
  return (
    <div className="rm-gallery" aria-label={`${room.name} preview gallery`}>
      {frames.map((src, index) => (
        <RoomMedia
          key={`${room.slug}-${index}`}
          src={src}
          alt={`${room.name} — view ${index + 1} aboard Hathor Dahabiya`}
          className={`rm-gallery__frame rm-gallery__frame--${index + 1}`}
          priority={index === 0}
        />
      ))}
      <p className="rm-gallery__count" aria-hidden="true">
        <span>{String(frames.length).padStart(2, "0")}</span> views
      </p>
    </div>
  );
}

function RoomAmenities({ room }: { room: RoomShowcase }) {
  return (
    <ol className="rm-amenities">
      {room.amenities.map((item, index) => (
        <li
          key={`${room.slug}-${item}`}
          className="rm-amenity"
          style={{ ["--rm-stagger" as string]: `${index * 0.04}s` }}
        >
          <RoomAmenityIcon label={item} />
          <span className="rm-amenity__label">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function RoomSelectionActions({ room }: { room: RoomShowcase }) {
  return (
    <div className="rm-select-stack">
      <FavoriteButton
        type="residence"
        slug={room.slug}
        name={room.name}
        variant="inline"
      />
      <AddToVoyageButton
        kind="residence"
        slug={room.slug}
        name={room.name}
        variant="inline"
      />
    </div>
  );
}

export function RoomCollectionEditorialPage({
  variant,
  rooms: roomsProp,
}: RoomCollectionEditorialPageProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const config = ROOM_COLLECTION_CONFIG[variant];
  const rooms =
    roomsProp ??
    ROOM_SHOWCASES.filter((room) => {
      if (variant === "cabins") return room.slug.includes("room");
      if (variant === "suites") return room.slug === "luxury-suite";
      return room.slug === "royal-suite";
    });

  const { pages } = useWebsiteText();
  const cms =
    variant === "cabins"
      ? pages.cabins
      : variant === "suites"
        ? pages.rooms
        : pages.royal;

  const support = cms
    ? resolveCmsText(cms.overviewIntro, config.support)
    : config.support;

  useRoomCollectionEditorialScroll({ rootRef, runRef, trackRef });

  const lineClass = ["rm-line--a", "rm-line--b"] as const;

  return (
    <div ref={rootRef} className="rooms-editorial">
      <div className="rm-progress" aria-hidden="true">
        <i data-rm-progress />
      </div>

      <PublicNavbar />

      <main>
        <section
          ref={runRef}
          className="rm-run"
          aria-label={`${config.titleLines.join(" ")} aboard Hathor`}
        >
          <div className="rm-stage">
            <div ref={trackRef} className="rm-track">
              {/* 01 — Collection introduction */}
              <Scene className="rm-intro">
                <nav className="rm-intro__nav" aria-label="Page sections">
                  <a href="#residences">Residences</a>
                  <a href="#gallery">Gallery</a>
                  <a href="#provisions">Provisions</a>
                  <a href="#reserve">Reserve</a>
                </nav>

                <div className="rm-intro__inner">
                  <Eyebrow>{config.eyebrow}</Eyebrow>
                  <div className="rm-intro__title" data-anima-title>
                    <h1 className="rm-display rm-display--xl">
                      {config.titleLines.map((line, index) => (
                        <span
                          key={line}
                          className={`rm-line ${lineClass[index] ?? ""}`}
                        >
                          <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                        </span>
                      ))}
                    </h1>
                  </div>
                  <p className="rm-intro__body">{support}</p>
                </div>

                <p className="rm-intro__mark">
                  Hathor Cruise <span className="rm-reg">®</span> 2026
                </p>
                <p className="rm-intro__scroll">
                  <i />
                  Scroll
                </p>
              </Scene>

              {/* 02 — Tier ledger */}
              <Scene className="rm-ledger">
                <div className="rm-ledger__head">
                  <Eyebrow>{config.manifesto.label}</Eyebrow>
                  <h2 className="rm-edit rm-edit--l" data-anima-title>
                    <span className="rm-line">
                      <AnimaSplitLine line={0}>
                        {config.manifesto.headline[0]}
                      </AnimaSplitLine>
                    </span>
                    <span className="rm-line rm-line--indent">
                      <AnimaSplitLine line={1}>
                        {config.manifesto.headline[1]}
                      </AnimaSplitLine>
                    </span>
                    <span className="rm-line rm-line--c">
                      <AnimaSplitLine line={2}>
                        {config.manifesto.headline[2]}
                      </AnimaSplitLine>
                    </span>
                  </h2>
                </div>
                <ol className="rm-ledger__grid">
                  {config.ledger.map((item) => (
                    <li key={item.label} className="rm-ledger__item">
                      <span className="rm-ledger__value">{item.value}</span>
                      <span className="rm-ledger__label">{item.label}</span>
                      <span className="rm-ledger__note">{item.note}</span>
                    </li>
                  ))}
                </ol>
                <p className="rm-ledger__body">{config.manifesto.body}</p>
              </Scene>

              {/* 03 — Nile aperture */}
              <Scene className="rm-aperture">
                <RoomMedia
                  src={config.aperture.image}
                  alt={`${config.titleLines.join(" ")} aboard Hathor Dahabiya`}
                  priority
                  className="rm-aperture__main"
                />
                <p className="rm-aperture__caption">
                  <span>({config.aperture.caption})</span> {config.aperture.sub}
                </p>
              </Scene>

              {/* Per-room scenes */}
              {rooms.map((room, roomIndex) => (
                <div key={room.slug} className="rm-room-group">
                  <Scene
                    className="rm-room"
                    id={roomIndex === 0 ? "residences" : undefined}
                  >
                    <div className="rm-room__copy">
                      <span className="rm-room__index">
                        {String(roomIndex + 1).padStart(2, "0")}
                      </span>
                      <Eyebrow>{room.eyebrow}</Eyebrow>
                      <h2 className="rm-display rm-display--l" data-anima-title>
                        <span className="rm-line">
                          <AnimaSplitLine line={0}>{room.name}</AnimaSplitLine>
                        </span>
                      </h2>
                      <p className="rm-room__body">{room.description}</p>
                      <dl className="rm-room__meta">
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
                          <dd>Panoramic Nile</dd>
                        </div>
                      </dl>
                      <RoomSelectionActions room={room} />
                      <Link
                        href={`/rooms/${room.slug}`}
                        className="rm-link"
                      >
                        Full residence details <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                    <RoomMedia
                      src={room.images[0] ?? config.aperture.image}
                      alt={`${room.name} aboard Hathor Dahabiya`}
                      className="rm-room__lead"
                    />
                  </Scene>

                  <Scene
                    className="rm-gallery-scene"
                    id={roomIndex === 0 ? "gallery" : undefined}
                  >
                    <div className="rm-gallery-scene__head">
                      <Eyebrow>Preview</Eyebrow>
                      <h3 className="rm-edit rm-edit--m">{room.name}</h3>
                      <p className="rm-meta-copy">
                        Five views of your private quarters — interiors, light and
                        the river beyond.
                      </p>
                    </div>
                    <RoomGallery room={room} />
                  </Scene>

                  <Scene
                    className="rm-provisions"
                    id={roomIndex === 0 ? "provisions" : undefined}
                  >
                    <div className="rm-provisions__head">
                      <Eyebrow>Guest provisions</Eyebrow>
                      <h3 className="rm-edit rm-edit--m">
                        {config.amenitiesTitle}
                      </h3>
                      <p className="rm-meta-copy">{config.amenitiesLead}</p>
                    </div>
                    <RoomAmenities room={room} />
                    <div className="rm-provisions__actions">
                      <RoomSelectionActions room={room} />
                    </div>
                  </Scene>
                </div>
              ))}

              {/* Collection compass */}
              <Scene className="rm-compass">
                <div className="rm-compass__head">
                  <Eyebrow>{config.crosslinksEyebrow}</Eyebrow>
                  <p className="rm-meta-copy">
                    Three ways to wake beside the Nile — each with its own rhythm
                    and proportion.
                  </p>
                </div>
                <ol className="rm-compass__list">
                  {ROOM_COLLECTION_LINKS.map((link, index) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={
                          link.key === variant ? "rm-compass__link is-active" : "rm-compass__link"
                        }
                        aria-current={link.key === variant ? "page" : undefined}
                      >
                        <span className="rm-compass__num">
                          0{index + 1}
                        </span>
                        <span className="rm-compass__label">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </Scene>
            </div>
          </div>
        </section>

        {/* Vertical epilogue */}
        <section className="rm-epilogue" id="reserve">
          <div className="rm-epilogue__inner">
            <Eyebrow>{config.epilogue.eyebrow}</Eyebrow>
            <h2 className="rm-display rm-display--l">{config.epilogue.title}</h2>
            <p className="rm-meta-copy rm-epilogue__body">
              {config.epilogue.body}
            </p>
            <div className="rm-epilogue__pills">
              <BookNowTrigger className="rm-btn rm-btn--solid">
                <span>Book Now</span>
              </BookNowTrigger>
              <Link href="/voyages" className="rm-btn">
                <span>Explore voyages</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
