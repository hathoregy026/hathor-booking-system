"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { FavoriteButton } from "@/components/selection/FavoriteButton";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import { useRoomCollectionEditorialScroll } from "@/hooks/useRoomCollectionEditorialScroll";
import {
  ROOM_COLLECTION_CONFIG,
  ROOM_COLLECTION_LINKS,
  type RoomCollectionVariant,
} from "@/lib/room-collection-editorial";
import { ROOM_SHOWCASES, type RoomShowcase } from "@/lib/room-showcase";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import { resolveCmsText, stackedHeroLines } from "@/lib/website-text-shared";

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
  ratio,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  ratio?: string;
}) {
  return (
    <figure
      className={`rm-media ${className}`}
      style={
        ratio ? ({ ["--rm-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
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

function FlipImage({
  front,
  back,
  frontAlt,
  backAlt = "",
  className = "",
  axis = "left",
  ratio,
}: {
  front: string;
  back: string;
  frontAlt: string;
  backAlt?: string;
  className?: string;
  axis?: "up" | "left" | "right";
  ratio?: string;
}) {
  return (
    <div className={`rm-flip rm-flip--${axis} ${className}`} data-rm-flip>
      <RoomMedia
        src={front}
        alt={frontAlt}
        className="rm-flip__base"
        ratio={ratio}
      />
      <RoomMedia
        src={back}
        alt={backAlt}
        className="rm-flip__overlay"
        ratio={ratio}
      />
    </div>
  );
}

function splitNameLines(name: string): string[] {
  const words = name.trim().split(/\s+/);
  if (words.length <= 2) return words;
  if (words.length === 3) return [words.slice(0, 2).join(" "), words[2]!];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
}

function amenityWord(label: string): string {
  const token = label.split(/\s+/).find((part) => part.length > 2);
  return (token ?? label).replace(/[^a-zA-Z]/g, "").slice(0, 12) || "Included";
}

function RoomSelectionPills({ room }: { room: RoomShowcase }) {
  return (
    <div className="rm-card__pills">
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
      <Link href={`/rooms/${room.slug}`} className="rm-btn">
        <span>Details</span>
      </Link>
    </div>
  );
}

function RoomAmenityLedger({ room }: { room: RoomShowcase }) {
  return (
    <ol className="rm-ledger__list">
      {room.amenities.map((item, index) => (
        <li key={`${room.slug}-${item}`} className="rm-row">
          <span className="rm-row__num">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="rm-row__word rm-display">{amenityWord(item)}</h3>
          <div className="rm-row__detail">
            <p className="rm-row__label">Included · Guest provision</p>
            <p className="rm-row__value">{item}</p>
          </div>
          <span className="rm-row__spacer" aria-hidden="true" />
        </li>
      ))}
    </ol>
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
  const typography = useTypographySettings();
  const heroPageKey =
    variant === "cabins"
      ? "luxury_cabins"
      : variant === "suites"
        ? "suites"
        : "royal_suites";
  const cmsKey =
    variant === "cabins" ? "cabins" : variant === "suites" ? "rooms" : "royal";
  const cms = pages[cmsKey];
  const heroCopy = resolveHeroPageCopy(typography, heroPageKey);
  const heroLines = stackedHeroLines(
    heroCopy.main || config.titleLines[0],
    heroCopy.second || config.titleLines[1],
  );
  const support = cms
    ? resolveCmsText(cms.overviewIntro, config.support)
    : config.support;

  useRoomCollectionEditorialScroll({ rootRef, runRef, trackRef });

  const lineClass = ["rm-line--a", "rm-line--b", "rm-line--c"] as const;
  const primaryRoom = rooms[0];

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
              {/* 01 — Typography-led introduction (Contact cadence) */}
              <Scene className="rm-intro">
                <nav className="rm-intro__nav" aria-label="Accommodation sections">
                  <a href="#residences">Residences</a>
                  <a href="#provisions">Provisions</a>
                  <a href="#collection">Collection</a>
                  <a href="#reserve">Reserve</a>
                </nav>

                <div className="rm-intro__inner">
                  <Eyebrow>{config.eyebrow}</Eyebrow>
                  <div className="rm-intro__title" id="residences" data-anima-title>
                    <h1 className="rm-display rm-display--xl wt-page-hero">
                      {heroLines.map((line, index) => (
                        <span
                          key={`${line}-${index}`}
                          className={`rm-line ${lineClass[index] ?? ""}`}
                        >
                          <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                        </span>
                      ))}
                    </h1>
                  </div>
                  <p className="rm-intro__body wt-page-body">{support}</p>
                </div>

                <p className="rm-intro__mark">
                  Hathor Cruise <span className="rm-reg">®</span> 2026
                </p>
                <p className="rm-intro__scroll">
                  <i />
                  Scroll
                </p>
              </Scene>

              {/* 02 — Collection manifesto: text before any room imagery */}
              <Scene className="rm-manifesto">
                <div className="rm-manifesto__aside">
                  <Eyebrow>{config.manifesto.label}</Eyebrow>
                  <p className="rm-meta-copy">{config.manifesto.body}</p>
                </div>
                <div className="rm-manifesto__headline" data-anima-title>
                  <h2 className="rm-edit rm-edit--xl">
                    <span className="rm-line">
                      <AnimaSplitLine line={0}>
                        {config.manifesto.headline[0]}
                      </AnimaSplitLine>
                    </span>
                    <span className="rm-line">
                      <AnimaSplitLine line={1}>
                        {config.manifesto.headline[1]}
                      </AnimaSplitLine>
                    </span>
                    <span className="rm-line rm-line--indent">
                      <AnimaSplitLine line={2}>
                        {config.manifesto.headline[2]}
                      </AnimaSplitLine>
                    </span>
                  </h2>
                </div>
              </Scene>

              {/* 03 — Tier specification frame */}
              <Scene className="rm-spec">
                <div className="rm-spec__frame">
                  <span className="rm-spec__corner rm-spec__corner--tl">
                    {config.titleLines.join(" ")}
                  </span>
                  <span className="rm-spec__corner rm-spec__corner--tr">
                    Hathor Dahabiya
                  </span>
                  <p className="rm-spec__times">
                    <span>{config.ledger[0]?.value}</span>
                    <i />
                    <span>{config.ledger[1]?.value}</span>
                  </p>
                  <span className="rm-spec__corner rm-spec__corner--bl">
                    {config.ledger[0]?.label} · {config.ledger[0]?.note}
                  </span>
                  <span className="rm-spec__corner rm-spec__corner--br">
                    {config.ledger[1]?.label} · up to {config.ledger[1]?.value}{" "}
                    guests
                  </span>
                </div>
              </Scene>

              {rooms.map((room, roomIndex) => {
                const images = room.images.slice(0, 5);
                const nameLines = splitNameLines(room.name);
                const collageCopy =
                  room.description.length > 120
                    ? `${room.description.slice(0, 118)}…`
                    : room.description;

                return (
                  <div key={room.slug} className="rm-residence-act">
                    {/* A — Text first (Contact manifesto grammar) */}
                    <Scene
                      className="rm-manifesto rm-room-manifesto"
                      id={roomIndex === 0 ? "provisions" : undefined}
                    >
                      <div className="rm-manifesto__aside">
                        <span className="rm-room__index">
                          {String(roomIndex + 1).padStart(2, "0")}
                        </span>
                        <Eyebrow>{room.eyebrow}</Eyebrow>
                        <p className="rm-meta-copy">{room.description}</p>
                        <dl className="rm-room__specs">
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
                        <RoomSelectionPills room={room} />
                      </div>
                      <div className="rm-manifesto__headline" data-anima-title>
                        <h2 className="rm-edit rm-edit--xl">
                          {nameLines.map((line, index) => (
                            <span
                              key={`${room.slug}-${line}`}
                              className={`rm-line ${index === 1 ? "rm-line--indent" : ""}`}
                            >
                              <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                            </span>
                          ))}
                        </h2>
                      </div>
                    </Scene>

                    {/* B — Image lead (Contact ce-lead) */}
                    <Scene className="rm-lead rm-room-lead">
                      <RoomMedia
                        src={images[0] ?? config.aperture.image}
                        alt={`${room.name} aboard Hathor Dahabiya`}
                        priority={roomIndex === 0}
                        className="rm-lead__main"
                        ratio="1279 / 960"
                      />
                      {images[1] && images[2] ? (
                        <FlipImage
                          className="rm-lead__inset"
                          axis="left"
                          ratio="835 / 557"
                          front={images[1]}
                          back={images[2]}
                          frontAlt={`${room.name} interior detail`}
                          backAlt={`${room.name} Nile view`}
                        />
                      ) : null}
                      <p className="rm-lead__caption">
                        <span>(Residence)</span> {room.sizeSqm} m² · Nile
                      </p>
                    </Scene>

                    {/* C — Five-image collage (remaining frames) */}
                    {images[2] && images[3] && images[4] ? (
                      <Scene className="rm-collage">
                        <FlipImage
                          className="rm-collage__tile rm-collage__tile--one"
                          axis="up"
                          ratio="668 / 554"
                          front={images[2]}
                          back={images[3]}
                          frontAlt={`${room.name} lounge`}
                          backAlt={`${room.name} bath`}
                        />
                        <FlipImage
                          className="rm-collage__tile rm-collage__tile--two"
                          axis="right"
                          ratio="1090 / 960"
                          front={images[4]}
                          back={images[0]}
                          frontAlt={`${room.name} suite view`}
                          backAlt={`${room.name} overview`}
                        />
                        <p className="rm-collage__copy rm-meta-copy">{collageCopy}</p>
                      </Scene>
                    ) : null}

                    {/* D — Guest provisions ledger */}
                    <Scene className="rm-ledger rm-room-ledger">
                      <div className="rm-ledger__head">
                        <Eyebrow>Guest provisions</Eyebrow>
                        <p className="rm-meta-copy">{config.amenitiesLead}</p>
                      </div>
                      <RoomAmenityLedger room={room} />
                    </Scene>
                  </div>
                );
              })}

              {/* Collection compass */}
              <Scene className="rm-ledger rm-compass" id="collection">
                <div className="rm-ledger__head">
                  <Eyebrow>{config.crosslinksEyebrow}</Eyebrow>
                  <p className="rm-meta-copy">
                    Three residences aboard Hathor — each composed for a different
                    rhythm on the Nile.
                  </p>
                </div>
                <ol className="rm-ledger__list">
                  {ROOM_COLLECTION_LINKS.map((link, index) => (
                    <li key={link.href} className="rm-row">
                      <span className="rm-row__num">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="rm-row__word rm-display">{link.label}</h3>
                      <div className="rm-row__detail">
                        <p className="rm-row__label">Collection · Hathor</p>
                        <Link href={link.href} className="rm-row__value rm-link">
                          Explore {link.label.toLowerCase()}
                        </Link>
                      </div>
                      <Link
                        href={link.href}
                        className="rm-btn"
                        aria-current={link.key === variant ? "page" : undefined}
                      >
                        <span>View</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </Scene>

              {/* Closing frame */}
              <Scene className="rm-closing">
                <FlipImage
                  className="rm-closing__media"
                  axis="up"
                  ratio="1483 / 960"
                  front={primaryRoom?.images[0] ?? config.aperture.image}
                  back={primaryRoom?.images[1] ?? config.aperture.image}
                  frontAlt="Hathor residence on the Nile"
                  backAlt="Interior aboard Hathor Dahabiya"
                />
                <div className="rm-closing__copy">
                  <Eyebrow>Reserve</Eyebrow>
                  <p className="rm-display rm-display--l">Your Nile quarters</p>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue — Contact grammar + site footer */}
        <section className="rm-epilogue" id="reserve">
          <header className="rm-epilogue__head">
            <Eyebrow>{config.epilogue.eyebrow}</Eyebrow>
            <h2 className="rm-display rm-display--l" data-anima-title>
              {config.epilogue.title}
            </h2>
            <p className="rm-meta-copy">{config.epilogue.body}</p>
          </header>

          <div className="rm-epilogue__board">
            <div className="rm-epilogue__compose">
              <p className="rm-epilogue__lead">
                Save your preferred residence to Favorites or add it to My Voyage.
                Our reservations team will pair your cabin with the right sailing
                between Luxor and Aswan.
              </p>
              {primaryRoom ? (
                <div className="rm-card__pills rm-epilogue__pills">
                  <FavoriteButton
                    type="residence"
                    slug={primaryRoom.slug}
                    name={primaryRoom.name}
                    variant="inline"
                    showLabel
                  />
                  <AddToVoyageButton
                    kind="residence"
                    slug={primaryRoom.slug}
                    name={primaryRoom.name}
                    variant="inline"
                  />
                  <BookNowTrigger className="rm-btn rm-btn--solid">
                    <span>Book Now</span>
                  </BookNowTrigger>
                  <Link href="/voyages" className="rm-btn">
                    <span>Explore voyages</span>
                  </Link>
                </div>
              ) : null}
            </div>

            {primaryRoom ? (
              <aside className="rm-epilogue__card">
                <span className="rm-card__tag">Residence</span>
                <RoomMedia
                  src={primaryRoom.images[0] ?? config.aperture.image}
                  alt={primaryRoom.name}
                  className="rm-card__media"
                  ratio="356 / 460"
                />
                <h3 className="rm-display">{primaryRoom.name}</h3>
                <p className="rm-card__body">
                  {primaryRoom.sizeSqm} m² · up to {primaryRoom.capacity} guests
                  <br />
                  Panoramic Nile views aboard Hathor
                </p>
                <div className="rm-card__pills">
                  <Link href={`/rooms/${primaryRoom.slug}`} className="rm-btn">
                    <span>Full details</span>
                  </Link>
                </div>
              </aside>
            ) : null}
          </div>

          <div className="rm-epilogue__legal">
            <span>
              Hathor Cruise <span className="rm-reg">®</span> 2026
            </span>
            <nav aria-label="Legal">
              <Link href="/contact">Privacy</Link>
              <Link href="/contact">Cookies</Link>
              <Link href="/contact">Legal</Link>
            </nav>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
