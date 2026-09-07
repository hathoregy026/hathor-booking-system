"use client";

import Image from "next/image";
import Link from "next/link";
import { FileText, Ship } from "lucide-react";
import {
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { AnimaTitleScroll } from "@/components/public/AnimaTitleScroll";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import {
  RoomAmenityIcon,
  resolveAmenityCaption,
} from "@/components/pages/rooms/RoomAmenityIcon";
import { useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { FavoriteButton } from "@/components/selection/FavoriteButton";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import { useCmsPathImage } from "@/hooks/useCmsPathImage";
import { useRoomCollectionEditorialScroll } from "@/hooks/useRoomCollectionEditorialScroll";
import {
  ROOM_COLLECTION_CONFIG,
  ROOM_COLLECTION_LINKS,
  type RoomCollectionVariant,
} from "@/lib/room-collection-editorial";
import { ROOM_SHOWCASES, type RoomShowcase } from "@/lib/room-showcase";
import { siteImageAnchorId } from "@/lib/site-image-preview";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
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
    <section className={`ac-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Kicker({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={`ac-kicker ${className}`.trim()}>{children}</p>;
}

function Frame({
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
  const cms = useCmsPathImage(src);
  return (
    <figure className={`ac-frame ${className}`}>
      <Image
        key={cms.src}
        src={cms.src}
        alt={cms.alt || alt}
        fill
        priority={priority}
        quality={SITE_IMAGE_QUALITY}
        sizes="(max-width: 950px) 100vw, 62vw"
        className="ac-frame__img"
        id={cms.slot ? siteImageAnchorId(cms.slot) : undefined}
        data-site-image={cms.slot ?? undefined}
      />
    </figure>
  );
}

function ApertureHeroImage({
  fallbackSrc,
  className = "",
}: {
  fallbackSrc: string;
  className?: string;
}) {
  const cms = useCmsPathImage(fallbackSrc);
  return (
    <Image
      key={cms.src}
      src={cms.src}
      alt=""
      fill
      priority
      quality={SITE_IMAGE_QUALITY}
      sizes="100vw"
      className={className}
      id={cms.slot ? siteImageAnchorId(cms.slot) : undefined}
      data-site-image={cms.slot ?? undefined}
    />
  );
}

function ApertureHeroShell({
  fallbackSrc,
  children,
}: {
  fallbackSrc: string;
  children: ReactNode;
}) {
  const cms = useCmsPathImage(fallbackSrc);
  return (
    <div
      className="rh"
      id="folio"
      style={
        {
          "--rh-img": `url("${cms.src}")`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}

function BentoFive({ room }: { room: RoomShowcase }) {
  const shots = room.images.slice(0, 5);
  const labels = ["Primary", "Detail", "Light", "Bath", "View"];

  return (
    <div className="ac-bento" aria-label={`${room.name} — five preview views`}>
      {shots.map((src, index) => (
        <Frame
          key={`${room.slug}-${index}`}
          src={src}
          alt={`${room.name} — ${labels[index] ?? "interior"} aboard Hathor`}
          className={`ac-bento__cell ac-bento__cell--${index + 1}`}
          priority={index === 0}
        />
      ))}
    </div>
  );
}

/** "Luxury King Bed" → Luxury / King Bed; "Luxury Royal Suite" → Luxury / Royal Suite */
function splitResidenceTitle(name: string): { lineA: string; lineB: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { lineA: name.trim(), lineB: "" };
  if (parts[0]?.toLowerCase() === "luxury") {
    return { lineA: "Luxury", lineB: parts.slice(1).join(" ") };
  }
  return {
    lineA: parts[0] ?? name,
    lineB: parts.slice(1).join(" "),
  };
}

function SelectionPills({ room }: { room: RoomShowcase }) {
  return (
    <div className="ac-pills">
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
      <Link
        href={`/rooms/${room.slug}`}
        className="ac-pill ac-pill--icon"
        aria-label={`Residence notes for ${room.name}`}
      >
        <FileText className="ac-pill__glyph" aria-hidden="true" />
        <span className="ac-pill__label">Residence notes</span>
      </Link>
    </div>
  );
}

/*
 * Balanced column count for a provision list: fill the fewest rows the cap
 * allows, then spread the items evenly across them. Sixteen cabin provisions
 * resolve to 8 × 2 on desktop and 4 × 4 on phone; the nine-item suite lists
 * resolve to 5 + 4 and 3 × 3 instead of leaving a lone orphan cell.
 */
function charterColumns(count: number, cap: number) {
  if (count < 1) return cap;
  return Math.max(2, Math.ceil(count / Math.ceil(count / cap)));
}

function CharterGrid({ room }: { room: RoomShowcase }) {
  const count = room.amenities.length;
  const columns = {
    lg: charterColumns(count, 8),
    md: charterColumns(count, 6),
    sm: charterColumns(count, 4),
  };

  return (
    <ul
      className="ac-charter"
      style={
        {
          "--ac-charter-lg": columns.lg,
          "--ac-charter-md": columns.md,
          "--ac-charter-sm": columns.sm,
        } as CSSProperties
      }
    >
      {room.amenities.map((item, index) => {
        const caption = resolveAmenityCaption(item);
        /* A cell that opens a row drops its column hairline at that width. */
        const opens = [
          index % columns.md === 0 ? "is-row-open-md" : "",
          index % columns.lg === 0 ? "is-row-open-lg" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <li
            key={`${room.slug}-${item}`}
            className={`ac-charter__cell${opens ? ` ${opens}` : ""}`}
            title={item}
          >
            <span className="ac-charter__cube" aria-hidden="true">
              <RoomAmenityIcon label={item} />
            </span>
            <p className="ac-charter__label">
              <span
                className="ac-charter__caption ac-charter__caption--wide"
                aria-hidden="true"
              >
                {caption.wide}
              </span>
              <span
                className="ac-charter__caption ac-charter__caption--tight"
                aria-hidden="true"
              >
                {caption.tight}
              </span>
              <span className="ac-charter__full">{item}</span>
            </p>
          </li>
        );
      })}
    </ul>
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
  const support = cms
    ? resolveCmsText(cms.overviewIntro, config.support)
    : config.support;

  useRoomCollectionEditorialScroll({ rootRef, runRef, trackRef });

  /*
   * Hero facts come from the variant ledger, so each collection engraves its
   * own numbers: 22/2 for the cabins, 46/4 for the suite, 56/4 for the royal.
   */
  const sqm = config.ledger[0];
  const guests = config.ledger[1];
  const primaryRoom = rooms[0] ?? ROOM_SHOWCASES[0];

  /*
   * The engraving is two stacked words, which the dashboard's title/subtitle
   * pair does not model — `second` holds a subtitle ("Nile Cabins"), not the
   * back half of the name. So the dashboard's main title is split on its last
   * word instead: "Luxury Rooms" engraves as LUXURY / ROOMS. Editors keep
   * control of the wording; the config supplies the split when unset.
   */
  const cmsTitleWords = (heroCopy.main || "").trim().split(/\s+/).filter(Boolean);
  /*
   * Exactly two words, or the config wins. The engraving is set nowrap at a
   * viewport-derived size, so a three-word dashboard title would run past the
   * gutters rather than wrap.
   */
  const [titlePrimary, titleSecondary] =
    cmsTitleWords.length === 2
      ? [
          cmsTitleWords.slice(0, -1).join(" "),
          cmsTitleWords[cmsTitleWords.length - 1],
        ]
      : config.titleLines;
  const heroTitle = `${titlePrimary} ${titleSecondary}`;

  /*
   * `support` is the dashboard's overview intro. When an editor has actually
   * customised it, it replaces the designed three-line stanza rather than
   * being dropped along with the old spine layout.
   */
  const heroLines =
    support && support !== config.support ? [support] : config.hero.copy;

  return (
    <div className="accom-editorial-shell">
      <AnimaTitleScroll />
      <div className="public-site hathor-site accom-nav-shell">
        <PublicNavbar />
      </div>

      <div ref={rootRef} className="accom-catalog">
        <div className="ac-progress" aria-hidden="true">
          <i data-ac-progress />
        </div>

        <main className="ac-main">
        <section
          ref={runRef}
          className="ac-run"
          aria-label={`${config.collectionLabel} aboard Hathor`}
        >
          <div className="ac-stage">
            <div ref={trackRef} className="ac-track">
              {/* 01 · Engraved hero — the collection name cut out of the room */}
              <Scene className="ac-spine">
                <ApertureHeroShell fallbackSrc={config.aperture.image}>
                  {/*
                   * The cut-out is one image read through two apertures: the
                   * glyphs of the title, and the open band between its lines.
                   * Both are driven from the same box, so the picture stays
                   * continuous across the seam — the title reads as engraved
                   * into the photograph rather than laid over it.
                   */}
                  <div className="rh__cut">
                    <h1 className="rh__type wt-page-hero" aria-label={heroTitle}>
                      <span className="rh__line" aria-hidden="true">
                        {titlePrimary}
                      </span>
                      <span className="rh__line rh__line--b" aria-hidden="true">
                        {titleSecondary}
                      </span>
                    </h1>

                    <div className="rh__band" aria-hidden="true">
                      <ApertureHeroImage
                        fallbackSrc={config.aperture.image}
                        className="rh__band-img"
                      />
                    </div>

                    <p className="rh__caption" aria-hidden="true">
                      {config.hero.caption}
                    </p>
                  </div>

                  {/*
                   * `display: contents` on desktop so each fact still positions
                   * against .rh; a flex rail once the corners close on tablet.
                   */}
                  <div className="rh__stats">
                    <p className="rh__stat rh__stat--a">
                      <span className="rh__stat-value">{sqm.value}</span>
                      <span className="rh__stat-label">{sqm.label}</span>
                      <i className="rh__lead" aria-hidden="true" />
                    </p>

                    <p className="rh__stat rh__stat--b">
                      <span className="rh__stat-value">{guests.value}</span>
                      <span className="rh__stat-label">{guests.label}</span>
                      <i className="rh__lead" aria-hidden="true" />
                    </p>
                  </div>

                  <div className="rh__foot">
                    <p className="rh__tagline" aria-hidden="true">
                      <span>{config.hero.tagline[0]}</span>
                      <span>{config.hero.tagline[1]}</span>
                    </p>

                    <p className="rh__copy wt-page-body">
                      {heroLines.map((line) => (
                        <span key={line}>{line}</span>
                      ))}
                    </p>

                    <ul className="rh__beds" aria-label="Configurations">
                      {rooms.map((room) => (
                        <li key={room.slug}>
                          <i className="rh__tick" aria-hidden="true" />
                          <Link href={`/rooms/${room.slug}`}>{room.name}</Link>
                        </li>
                      ))}
                    </ul>

                    <div className="rh__actions">
                      <FavoriteButton
                        type="residence"
                        slug={primaryRoom.slug}
                        name={primaryRoom.name}
                        variant="inline"
                        showLabel
                        className="rh__act"
                      />
                      <AddToVoyageButton
                        kind="residence"
                        slug={primaryRoom.slug}
                        name={primaryRoom.name}
                        variant="inline"
                        className="rh__act"
                      />
                      <BookNowTrigger className="rh__act rh__act--solid">
                        <span>Book now</span>
                      </BookNowTrigger>
                      <Link
                        href="/voyages"
                        className="rh__act rh__act--icon"
                        aria-label="View voyages"
                      >
                        <Ship className="rh__act-glyph" aria-hidden="true" />
                        <span className="rh__act-label">View voyages</span>
                      </Link>
                    </div>
                  </div>
                </ApertureHeroShell>
              </Scene>

              {/* 02 · Tier facts — 2×2 specs above statement, compact height */}
              <Scene className="ac-tier">
                <ul className="ac-tier__triptych">
                  {config.ledger.map((item) => (
                    <li key={item.label} className="ac-tier__cell">
                      <span className="ac-tier__value">{item.value}</span>
                      <span className="ac-tier__label">{item.label}</span>
                      <span className="ac-tier__note">{item.note}</span>
                    </li>
                  ))}
                </ul>
                <div className="ac-tier__copy">
                  <Kicker>{config.tierKicker}</Kicker>
                  <p className="ac-edit">{config.tierStatement}</p>
                </div>
              </Scene>

              {rooms.map((room, roomIndex) => {
                const { lineA, lineB } = splitResidenceTitle(room.name);

                return (
                  <div key={room.slug} className="ac-residence">
                    {/* A · Chapter text — always before imagery */}
                    <Scene
                      className="ac-chapter"
                      id={roomIndex === 0 ? "chapters" : undefined}
                    >
                      <span className="ac-chapter__glyph" aria-hidden="true">
                        {String(roomIndex + 1).padStart(2, "0")}
                      </span>
                      <div className="ac-chapter__body">
                        <Kicker>{room.eyebrow}</Kicker>
                        <h2
                          className="ac-title ac-title--chapter wt-page-title"
                          data-anima-title
                        >
                          <span className="ac-rise wt-page-hero">
                            <AnimaSplitLine line={0}>{lineA}</AnimaSplitLine>
                          </span>
                          {lineB ? (
                            <span className="ac-rise wt-page-hero-second">
                              <AnimaSplitLine line={1}>{lineB}</AnimaSplitLine>
                            </span>
                          ) : null}
                        </h2>
                        <ul className="ac-spec-rail">
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
                        </ul>
                        <p className="ac-support wt-page-body">{room.description}</p>
                        <SelectionPills room={room} />
                      </div>
                    </Scene>

                    {/* B · Five preview images only — no wipe / no frame numbers */}
                    <Scene className="ac-bento-scene">
                      <div className="ac-bento-scene__head">
                        <Kicker>Preview sequence</Kicker>
                        <p className="ac-meta">
                          Five composed views of {room.name} — light, proportion and
                          river beyond the glass.
                        </p>
                      </div>
                      <BentoFive room={room} />
                    </Scene>

                    {/* C · Guest charter — provisions grid */}
                    <Scene className="ac-charter-scene">
                      <div className="ac-charter-scene__head">
                        <Kicker>Included for your stay</Kicker>
                        <h3 className="ac-edit ac-edit--sm">{room.name}</h3>
                        <p className="ac-meta">{config.amenitiesLead}</p>
                      </div>
                      <CharterGrid room={room} />
                      <SelectionPills room={room} />
                    </Scene>
                  </div>
                );
              })}

              {/* Deck bridge — other collections */}
              <Scene className="ac-bridge">
                <Kicker>Elsewhere on board</Kicker>
                <ul className="ac-bridge__list">
                  {ROOM_COLLECTION_LINKS.map((link, index) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={
                          link.key === variant
                            ? "ac-bridge__link is-here"
                            : "ac-bridge__link"
                        }
                        aria-current={link.key === variant ? "page" : undefined}
                      >
                        <span className="ac-bridge__num">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="ac-bridge__name">{link.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Scene>

              {/* Quiet hold before vertical close */}
              <Scene className="ac-hold">
                <p className="ac-hold__line ac-edit">
                  Your quarters await between Luxor and Aswan.
                </p>
                <a className="ac-text-link" href="#reserve">
                  Continue to reserve
                </a>
              </Scene>
            </div>
          </div>
        </section>

        <section className="ac-landing" id="reserve">
          <div className="ac-landing__grid">
            <div className="ac-landing__copy">
              <Kicker>{config.epilogue.eyebrow}</Kicker>
              <h2 className="ac-title ac-title--landing">{config.epilogue.title}</h2>
              <p className="ac-support">{config.epilogue.body}</p>
              {rooms[0] ? (
                <div className="ac-pills ac-landing__pills">
                  <FavoriteButton
                    type="residence"
                    slug={rooms[0].slug}
                    name={rooms[0].name}
                    variant="inline"
                    showLabel
                  />
                  <AddToVoyageButton
                    kind="residence"
                    slug={rooms[0].slug}
                    name={rooms[0].name}
                    variant="inline"
                  />
                  <BookNowTrigger className="ac-pill ac-pill--fill">
                    <span>Book Now</span>
                  </BookNowTrigger>
                  <Link
                    href="/voyages"
                    className="ac-pill ac-pill--icon"
                    aria-label="View voyages"
                  >
                    <Ship className="ac-pill__glyph" aria-hidden="true" />
                    <span className="ac-pill__label">View voyages</span>
                  </Link>
                </div>
              ) : null}
            </div>
            {rooms[0] ? (
              <aside className="ac-landing__panel">
                <Frame
                  src={rooms[0].images[0] ?? config.aperture.image}
                  alt={rooms[0].name}
                  className="ac-landing__frame"
                />
                <p className="ac-meta">
                  {rooms[0].name} · {rooms[0].sizeSqm} m² · Nile
                </p>
              </aside>
            ) : null}
          </div>
        </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
