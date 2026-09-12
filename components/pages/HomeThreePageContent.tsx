"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type CSSProperties, type ReactNode } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { HathorLogoTuner } from "@/components/public/HathorLogoTuner";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { PublicSiteHero } from "@/components/pages/PublicSiteHero";
import { H4_STOPS } from "@/components/pages/home-four/atlas-data";
import { NileChart, NileHelm } from "@/components/pages/home-three/NileChart";
import { useExScrollMotion } from "@/hooks/useExScrollMotion";
import { useHomeThreeFlow } from "@/hooks/useHomeThreeFlow";
import { EX_HERO } from "@/lib/ex-page-content";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { HOME_CAROUSEL_IMAGE_BY_ROOM } from "@/lib/home-carousel-images";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import { FavoriteButton } from "@/components/selection/FavoriteButton";
import { cabinSlugForListing } from "@/lib/selection-catalog";
import type { HeroLogoTune } from "@/lib/hero-logo-tune-shared";
import { NILE_MOORINGS, NILE_TOTAL_KM } from "@/lib/nile-route";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";

type HomeThreeProps = {
  heroLogoTune: HeroLogoTune;
  heroLogoTuneMobile: HeroLogoTune;
};

/* ------------------------------------------------------------------ atoms */

/** A plain plate. The chart column sizes its own frames through this. */
function Frame({
  slot,
  alt,
  className = "",
  ratio,
  sizes = "(max-width: 950px) 100vw, 50vw",
}: {
  slot: string;
  alt: string;
  className?: string;
  ratio?: string;
  sizes?: string;
}) {
  const image = useSiteImage(slot);
  return (
    <figure
      className={`h3-frame ${className}`.trim()}
      style={
        ratio ? ({ ["--h3-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        sizes={sizes}
        quality={SITE_IMAGE_QUALITY}
        className="h3-frame__img"
      />
    </figure>
  );
}

/**
 * Suites `.media`. The source is oversized inside its wrap and slid by
 * `--transY`, which the flow hook scrubs 100% to 0% as the frame crosses —
 * the parallax `animations.js` gives every plate on that page.
 */
function Media({
  slot,
  alt,
  className = "",
  sizes = "(max-width: 950px) 100vw, 50vw",
}: {
  slot: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const image = useSiteImage(slot);
  return (
    <figure className={`h3-media ${className}`.trim()} data-h3-media>
      <span className="h3-media__wrap">
        <Image
          src={originSrcForNextImage(image.src)}
          alt={alt || image.alt}
          fill
          sizes={sizes}
          quality={SITE_IMAGE_QUALITY}
        />
      </span>
    </figure>
  );
}

/**
 * Suites `flipMedia`. Two stacked plates in a clipped box: the cover leaves
 * along the travel axis while the plate beneath settles out of its overscale.
 * `main.js :: setFlips()` scrubs it there; `--h3-flip` scrubs it here, off the
 * same per-element progress the site's other editorial pages already use.
 */
function Flip({
  under,
  underAlt,
  over,
  overAlt,
  variant,
  className = "",
  sizes = "(max-width: 950px) 100vw, 50vw",
  anchor,
}: {
  under: string;
  underAlt: string;
  over: string;
  overAlt: string;
  variant: "upDown" | "rightLeft" | "leftRight";
  className?: string;
  sizes?: string;
  /** `edge` for a frame that never travels off the stage. */
  anchor?: "edge";
}) {
  const underImage = useSiteImage(under);
  const overImage = useSiteImage(over);
  return (
    <div
      className={`h3-flip h3-flip--${variant} ${className}`.trim()}
      /* the hook reads the axis to pick its horizontal or vertical formula */
      data-h3-flip={variant === "upDown" ? "up" : "side"}
      data-h3-flip-anchor={anchor}
    >
      <div className="h3-flip__media h3-flip__media--down">
        <Image
          src={originSrcForNextImage(underImage.src)}
          alt={underAlt || underImage.alt}
          fill
          sizes={sizes}
          quality={SITE_IMAGE_QUALITY}
        />
      </div>
      <div className="h3-flip__media h3-flip__media--up">
        <Image
          src={originSrcForNextImage(overImage.src)}
          alt={overAlt || overImage.alt}
          fill
          sizes={sizes}
          quality={SITE_IMAGE_QUALITY}
        />
      </div>
    </div>
  );
}

/** One panel of the horizontal act — a `.mod-scroll > div` in Suites terms. */
function Panel({
  className,
  label,
  children,
}: {
  className: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className={`h3-scene ${className}`} aria-label={label}>
      {children}
    </section>
  );
}

/**
 * One pinned horizontal passage. Desktop runs the story as two of these with
 * vertical flow between them — the route to the chart, then the voyages to the
 * suites wall. Everywhere else all three wrappers are `display: contents`, so
 * the single act still sees every panel as one strip.
 */
function Act({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="h3-act" data-h3-act={name}>
      <div className="h3-act__stage" data-h3-act-stage>
        <div className="h3-act__track" data-h3-act-track>
          {children}
        </div>
      </div>
    </div>
  );
}

/** A vertical passage between the desktop acts; invisible to the single act. */
function Flow({ children }: { children: ReactNode }) {
  return <div className="h3-flow">{children}</div>;
}

/* ------------------------------------------------------------------- data */

/* 05 — the three sailings Hathor actually runs, on their own CMS slots. */
const VOYAGES = [
  {
    slot: "home-voyage-3n-aswan-luxor",
    slug: "3-nights-aswan-luxor",
    tone: "a",
    nights: "Three nights",
    route: "Aswan — Luxor",
    note: "With the current",
    alt: "Hathor Dahabiya sailing from Aswan to Luxor",
  },
  {
    slot: "home-voyage-4n-luxor-aswan",
    slug: "4-nights-luxor-aswan",
    tone: "b",
    nights: "Four nights",
    route: "Luxor — Aswan",
    note: "Under her own canvas",
    alt: "Hathor Dahabiya sailing from Luxor to Aswan",
  },
  {
    slot: "home-voyage-7n-roundtrip",
    slug: "7-nights-luxor-aswan-luxor",
    tone: "c",
    nights: "Seven nights",
    route: "The round trip",
    note: "Both banks, the whole river",
    alt: "Hathor Dahabiya on the full Luxor to Aswan round trip",
  },
] as const;

/* 03 — the sailings rail.
   Built from the catalogue, never retyped: `HATHOR_CRUISES` carries the real
   itineraries and the real per-cabin price, and `HOME_CAROUSEL_IMAGE_BY_ROOM`
   carries the CMS slot each cabin already owns. Only the cabins that have a
   slot of their own can appear — one card, one photograph — and the first
   eight of those are what the homepage shows before the door to the list. */
const TIER_LABEL: Record<string, { tier: string; label: string }> = {
  "Luxury Room": { tier: "room", label: "Luxury room" },
  "Luxury Suite": { tier: "suite", label: "Luxury suite" },
  "Luxury Royal Suite": { tier: "royal", label: "Royal suite" },
};

const SAILINGS = HATHOR_CRUISES.flatMap((cruise) =>
  cruise.rooms
    /* Twin and King are the same grade at the same price, so showing both
       spends two of the eight cards on one rung of the ladder. Dropping Twin
       leaves exactly eight — every duration and every grade, $4,000 through
       $12,600, no repeated price. */
    .filter(
      (room) =>
        room.roomNumber in HOME_CAROUSEL_IMAGE_BY_ROOM &&
        !room.roomNumber.startsWith("TWIN"),
    )
    .map((room) => {
      const tier = TIER_LABEL[room.roomType] ?? {
        tier: "room",
        label: room.roomType,
      };
      return {
        key: `${cruise.slug}-${room.roomNumber}`,
        slot: HOME_CAROUSEL_IMAGE_BY_ROOM[
          room.roomNumber as keyof typeof HOME_CAROUSEL_IMAGE_BY_ROOM
        ],
        alt: `${room.name} aboard Hathor, ${cruise.ports}`,
        /* the card names the voyage, not the cabin: the grade is already the
           line above it and the wall behind it, so repeating "Royal Suite"
           twice on one card only spends the display line
           ("Luxor → Aswan → Luxor" is the round trip, and reads better as
           that than as three place names on a card this narrow) */
        name:
          cruise.ports.split("→").length > 2
            ? "Round trip"
            : cruise.ports.replace("→", "—"),
        nights: `${cruise.nights} nights`,
        day: cruise.departureDay,
        price: `$${(room.priceCents / 100).toLocaleString("en-US")}`,
        tier: tier.tier,
        tierLabel: tier.label,
        /* the composite slug the selection store keys a cabin on; null when a
           cabin has no marketing residence, which hides its controls rather
           than rendering ones that cannot work */
        cabinSlug: cabinSlugForListing(cruise.slug, room.name),
        cabinName: room.name,
        href: "/cruises-list",
      };
    }),
).slice(0, 8);

/* 09 — about, as the Suites terms module reads it: three numbered principles. */
const TERMS = [
  {
    tone: "a",
    num: "01",
    slot: "about-hero",
    imageAlt: "Hathor Dahabiya under sail on the Nile",
    title: "Twelve guests",
    copy: "Eight cabins, two suites and two Royal Suites. The whole boat holds fewer people than one deck of a cruise ship, which is the entire point of her.",
  },
  {
    tone: "b",
    num: "02",
    slot: "home-story-craft-large",
    imageAlt: "Hand-worked detail aboard Hathor Dahabiya",
    title: "no engine",
    copy: "A dahabiya sails. Two lateen sails and the current do the work, and the river is the only thing you hear between the moorings.",
  },
  {
    tone: "c",
    num: "03",
    slot: "home-story-way-of-life",
    imageAlt: "Life aboard Hathor Dahabiya on the Nile",
    title: "A way of life",
    copy: "Egypt arrives without hurry: warm company, refined cabins and the river unfolding one measured bend at a time.",
  },
] as const;

/* 07 — the marquee, doubled in the markup so the -50% loop is seamless. */
const MARQUEE = [
  "Seneb Spa",
  "Two restaurants",
  "Shore days",
  "Sun deck",
  "Private charter",
] as const;

/* 08 — the rest of the site, named where a homepage has to name it. */
const EXPLORE = [
  { href: "/gastronomy", label: "Gastronomy" },
  { href: "/wellness", label: "Seneb Spa" },
  { href: "/highlights", label: "Highlights" },
  { href: "/charter", label: "Private charter" },
] as const;

/* 12 — four plates in the mosaic. None appear elsewhere on the page, and none
   are among the five the chart already spends on its moorings. */
const MOSAIC = [
  {
    slot: "landmark-hatshepsut",
    alt: "The Temple of Hatshepsut at Deir el-Bahari",
  },
  {
    slot: "home-voyage-nile-majesty",
    alt: "The Nile at first light from the deck of Hathor",
  },
  { slot: "home-story-dining", alt: "Dinner served on deck aboard Hathor" },
  { slot: "moving-tilted-3", alt: "A shore day from Hathor Dahabiya" },
] as const;

/* ------------------------------------------------------------------- page */

export function HomeThreePageContent({
  heroLogoTune,
  heroLogoTuneMobile,
}: HomeThreeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useExScrollMotion();
  useHomeThreeFlow({ rootRef, runRef, trackRef });

  return (
    <>
      {/* Homepage hero stage. Phone uses the /hero-1 overlay on the phone reel,
          fitted to the first-viewport box above the dock. Tablet keeps the
          framed film treatment; desktop choreography is unchanged. */}
      <div className="ex-root" data-hathor-logo-tuned="">
        <HathorLogoTuner />
        <div id="top">
          <div className="home-hero-runway home-three-hero">
            <PublicSiteHero
              animate={false}
              splitLetterLogo
              playVideo
              lineRight={EX_HERO.lineRight}
              lineLeft={EX_HERO.lineLeft}
              heroPage="home"
              posterImageName={EX_HERO.imageName}
              responsiveVideoFrame
              responsiveVideoFrameTarget="#home-three-story"
              logoPartsVariant={heroLogoTune.partsVariant}
              mobileLogoPartsVariant={heroLogoTuneMobile.partsVariant}
            />
          </div>
        </div>
      </div>

      <div ref={rootRef} className="home-three" id="home-three-story">
        <div className="h3-progress" aria-hidden="true">
          <i data-h3-progress />
        </div>

        <main>
          {/* ============================================ the horizontal act
              Ten panels on the Suites modules, in that page's own order of
              walls — white, beige, white, white, beige, black, rail, beige,
              blue, red — carrying the homepage story: the cruise, the
              voyages, the suites, the experiences, about, the close.
              On a desktop pointer the story splits along the wrappers: the
              route pins to the chart, the claim reads vertically, the voyages
              pin to the suites wall, and the rest is a vertical document. */}
          <section ref={runRef} className="h3-run" aria-label="Aboard Hathor">
            <div className="h3-stage">
              <div ref={trackRef} className="h3-track">
                <Act name="route">
                  {/* ---------------------------------------- 01 · the opener
                      The Contact page's opening scene, carrying the homepage's
                      identity: the rail stood on end in the corner, the eyebrow,
                      the display ladder, and the mark and scroll hint at the
                      foot. */}
                  <Panel className="h3-open" label="Hathor Dahabiya">
                    <nav className="h3-open__nav" aria-label="This page">
                      <Link href="/cruises">Cruises</Link>
                      <Link href="/voyages">Voyages</Link>
                      <Link href="/suites">Suites</Link>
                      <Link href="/contact">Contact</Link>
                    </nav>

                    <div className="h3-open__inner">
                      <p className="h3-open__eyebrow">Hathor Dahabiya</p>

                      {/* Contact sets three SHORT lines — "Contact us / Ask any
                          / Question" — and that is what lets the ladder hold one
                          screen at 11rem. Long lines wrap into a fourth row and
                          push the mark off the foot, so the break here is kept
                          to the same measure. */}
                      <h1 className="h3-open__title">
                        <span className="h3-open__line h3-open__line--a">
                          <AnimaSplitLine line={0}>Twelve</AnimaSplitLine>
                        </span>
                        <span className="h3-open__line h3-open__line--b">
                          <AnimaSplitLine line={1}>guests</AnimaSplitLine>
                        </span>
                        <span className="h3-open__line h3-open__line--c">
                          <AnimaSplitLine line={2}>One river</AnimaSplitLine>
                        </span>
                      </h1>

                      <p className="h3-open__body">
                        A private sailing dahabiya on the Egyptian Nile. Eight
                        cabins, two suites and two Royal Suites, between Luxor and
                        Aswan.
                      </p>
                    </div>

                    <p className="h3-open__mark">
                      Hathor Cruise <span className="h3-reg">®</span> 2026
                    </p>
                    <p className="h3-open__scroll">
                      <i />
                      Scroll
                    </p>
                  </Panel>

                  {/* ------------------------------ 02 · the cruise · the lead
                      Contact's image lead: one tall plate with a second frame
                      overlapping its right edge, lifted off the centre line. */}
                  <Panel className="h3-lead" label="The cruise">
                    <Media
                      slot="cruises-hero"
                      alt="Hathor Dahabiya moored on the Nile at golden hour"
                      className="h3-lead__main"
                      sizes="(max-width: 950px) 100vw, 58vw"
                    />
                    <Flip
                      className="h3-lead__inset"
                      variant="leftRight"
                      under="home-split-courtyard"
                      underAlt="The pool deck aboard Hathor Dahabiya"
                      over="home-cinematic-still"
                      overAlt="Hathor Dahabiya under sail between Luxor and Aswan"
                      sizes="(max-width: 950px) 78vw, 30vw"
                    />
                    {/* Contact's lead carries ONE line here and nothing else.
                        A paragraph and a link under it grew the block into the
                        plate's foot; the invitation lives on the sailings panel
                        that follows instead. */}
                    <p className="h3-lead__aboard">
                      <span>Aboard</span> Luxor — Aswan
                    </p>
                  </Panel>

                  {/* -------------------- 03 · the sailings · the cruise list
                      Eight of the ten cabin sailings Hathor actually runs, on
                      the CMS slot each one already owns, then the door through
                      to the full list. The wall behind each card is its tier —
                      room, suite, Royal Suite — so the ladder of value is read
                      before a single price is. */}
                  <Panel className="h3-sailings" label="Sailings">
                    <div className="h3-sailings__head">
                      <p className="h3-kicker">02 — Sailings</p>
                      <h2 className="h3-title h3-title--sm">
                        Choose
                        <br />
                        your cabin
                      </h2>
                      <p className="h3-support">
                        A five-star dahabiya where Nile history, contemporary
                        comfort and intimate sailing come together. Three
                        itineraries, four cabin grades, twelve guests aboard.
                      </p>
                    </div>

                    <ul className="h3-sailings__rail">
                      {SAILINGS.map((sailing, index) => (
                        <li
                          key={sailing.key}
                          className={`h3-sail h3-sail--${sailing.tier}`}
                          style={{ ["--i" as string]: index } as CSSProperties}
                        >
                          <Media
                            slot={sailing.slot}
                            alt={sailing.alt}
                            className="h3-sail__plate"
                            /* These sources are 4:3 landscape and the card box
                               is portrait, so the crop throws most of the width
                               away: the delivered variant has to be about twice
                               the box's own width or what survives gets upscaled
                               — which is what looked pixelated. */
                            sizes="(max-width: 950px) 92vw, 42vw"
                          />

                          <div className="h3-sail__body">
                            <p className="h3-sail__tier">{sailing.tierLabel}</p>
                            <Link href={sailing.href} className="h3-sail__name">
                              {sailing.name}
                            </Link>
                            <p className="h3-sail__route">
                              {sailing.nights}
                              <b>{sailing.day}s</b>
                            </p>
                            <p className="h3-sail__price">
                              <em>from</em>
                              {sailing.price}
                            </p>

                            {/* The site's own pills, on the site's own store.
                                `inline` is the variant the roster in
                                app/button-system.css skins — the `card` variant
                                is an absolutely-placed disc meant to be used
                                alone, which is why two of them landed on top of
                                each other. */}
                            <div className="h3-pills h3-sail__acts">
                              {sailing.cabinSlug ? (
                                <>
                                  <FavoriteButton
                                    type="cabin"
                                    slug={sailing.cabinSlug}
                                    name={`${sailing.cabinName}, ${sailing.name}`}
                                    variant="inline"
                                    showLabel
                                  />
                                  <AddToVoyageButton
                                    kind="cabin"
                                    slug={sailing.cabinSlug}
                                    name={`${sailing.cabinName}, ${sailing.name}`}
                                    variant="inline"
                                  />
                                </>
                              ) : null}
                              <BookNowTrigger className="h3-btn">
                                Book now
                              </BookNowTrigger>
                            </div>
                          </div>
                        </li>
                      ))}

                      <li className="h3-sail h3-sail--more">
                        <Link href="/cruises-list" className="h3-sail__link">
                          <Media
                            slot={SAILINGS[0]?.slot ?? "cruises-hero"}
                            alt="Hathor Dahabiya on the Nile"
                            className="h3-sail__plate"
                            sizes="(max-width: 950px) 92vw, 42vw"
                          />
                          <div className="h3-sail__body h3-sail__body--more">
                            <p className="h3-sail__tier">The full list</p>
                            <h3 className="h3-sail__name">View more</h3>
                            <span className="h3-text-link" aria-hidden="true">
                              All sailings
                            </span>
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </Panel>

                  {/* -------------------------------- 03 · the chart (sand) */}
                  <ChartPanel>
                    <div className="h3-course">
                      <div className="h3-course__head">
                        <p className="h3-kicker">The route</p>
                        <h2 className="h3-title h3-title--sm">
                          Luxor
                          <br />
                          to Aswan
                        </h2>
                        <p className="h3-support">
                          Drawn from the river&rsquo;s own coordinates. Sail it
                          here, and see what stands at each mooring before you tie
                          up there.
                        </p>
                      </div>

                      {/* The hold. Reaching the map pins the page until Hathor
                          ties up at Aswan, then the story travels on. Above
                          950px these two wrappers are `display: contents`, so
                          the desktop grid still sees head / km / helm / chart /
                          berths and the plateau lives in the scroll mapping
                          instead. On a phone km and helm flank the river. */}
                      <div className="h3-chart-hold" data-h3-chart-hold>
                        <div className="h3-chart-sticky">
                          <p className="h3-course__run">
                            <span data-h3-km>0</span>
                            <em>of {NILE_TOTAL_KM} km sailed</em>
                          </p>
                          <NileHelm />
                          <NileChart />

                          <div className="h3-course__berths">
                            <p className="h3-atlas-eyebrow">
                              A 4-night passage · Luxor to Aswan
                            </p>
                            <div
                              className="h3-stop-buttons"
                              role="group"
                              aria-label="Explore places on the Nile"
                            >
                              {H4_STOPS.map((stop, i) => (
                                <button
                                  key={stop.name}
                                  type="button"
                                  data-h3-tag={stop.t}
                                  aria-pressed={i === 0}
                                >
                                  {stop.name}
                                </button>
                              ))}
                            </div>
                            <div className="h3-berth-stack">
                            {NILE_MOORINGS.map((m) => (
                              <article
                                key={m.name}
                                className="h3-berth"
                                data-h3-berth
                              >
                                <Frame
                                  slot={m.slot}
                                  alt={m.imageAlt}
                                  className="h3-berth__media"
                                  ratio="16 / 9"
                                  sizes="(max-width: 950px) 34vw, min(38vw, 36rem)"
                                />
                                <p className="h3-berth__meta">
                                  <span>{m.day}</span>
                                  <em>
                                    {m.legKm === 0
                                      ? "Embarkation"
                                      : `+${m.legKm} km`}
                                  </em>
                                </p>
                                <h3 className="h3-berth__name">
                                  {m.name}
                                  <b>{m.arabic}</b>
                                </h3>
                                <p className="h3-berth__note">{m.note}</p>
                                <ul className="h3-berth__sites">
                                  {m.sites.map((s) => (
                                    <li key={s.name}>
                                      <p className="h3-berth__site">
                                        <Link href={s.href}>{s.name}</Link>
                                        <em>{s.era}</em>
                                      </p>
                                      <p className="h3-berth__blurb">{s.note}</p>
                                      <Link href={s.href} className="h3-berth__more">
                                        Read more
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </article>
                            ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ChartPanel>
                </Act>

                <Flow>
                  {/* ------------------------- 04 · the claim · text (white) */}
                  <Panel
                    className="h3-text"
                    label="She sails where the big ships cannot"
                  >
                    <div className="h3-text__wrap">
                      <div className="h3-text__inner">
                        <h2 className="h3-text__title">
                          <span className="h3-text__line">
                            <AnimaSplitLine line={0}>She sails</AnimaSplitLine>
                          </span>
                          <span className="h3-text__line">
                            <AnimaSplitLine line={1}>where the</AnimaSplitLine>
                          </span>
                          <span className="h3-text__line">
                            <AnimaSplitLine line={2}>big ships</AnimaSplitLine>
                          </span>
                          <span className="h3-text__line h3-text__line--slide">
                            <span>
                              <AnimaSplitLine line={3}>cannot</AnimaSplitLine>
                            </span>
                          </span>
                        </h2>
                        <div className="h3-text__copy h3-support">
                          <p>
                            A dahabiya draws little more than a metre. She moors
                            at Esna, Edfu and Kom Ombo while the floating hotels
                            pass by, and ties up at banks that have no dock at
                            all.
                          </p>
                        </div>
                      </div>
                    </div>
                  </Panel>
                </Flow>

                <Act name="aboard">
                  {/* ------------------- 05 · the voyages · projects (beige) */}
                  <Panel className="h3-projects" label="The voyages">
                    <div className="h3-projects__aside">
                      <p className="h3-kicker">02 — The voyages</p>
                      <p className="h3-support">
                        Three sailings between the two cities. The river decides
                        how long each one takes; the direction decides how it
                        feels.
                      </p>
                      <Link className="h3-text-link" href="/voyages">
                        All voyages
                      </Link>
                    </div>

                    {VOYAGES.map((voyage, index) => (
                      <article
                        key={voyage.slot}
                        className={`h3-projects__item h3-projects__item--${voyage.tone}`}
                        data-h3-item
                      >
                        <div className="h3-projects__content">
                          <Media
                            slot={voyage.slot}
                            alt={voyage.alt}
                            className="h3-projects__image"
                            sizes="(max-width: 950px) 100vw, 55vw"
                          />

                          <div className="h3-projects__text">
                            <div className="h3-projects__data">
                              <div>
                                <span>{voyage.nights}</span>
                              </div>
                              <div>
                                <span>{`0${index + 1}`}</span>
                              </div>
                              <div>
                                <span>{voyage.note}</span>
                              </div>
                            </div>
                            <Link
                              href="/cruises-list"
                              className="h3-projects__name"
                            >
                              {voyage.route}
                            </Link>
                            <div className="h3-pills h3-projects__acts">
                              <FavoriteButton
                                type="voyage"
                                slug={voyage.slug}
                                name={voyage.route}
                                variant="inline"
                                showLabel
                              />
                              <AddToVoyageButton
                                kind="voyage"
                                slug={voyage.slug}
                                name={voyage.route}
                                variant="inline"
                              />
                              <BookNowTrigger className="h3-btn">
                                Book now
                              </BookNowTrigger>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </Panel>

                  {/* ----------------- 06 · the suites · images-text (black) */}
                  <Panel className="h3-imgtext" label="The suites">
                    <div className="h3-imgtext__wrap">
                      <Flip
                        className="h3-flip--a"
                        variant="rightLeft"
                        under="scraped-royal-4"
                        underAlt="A Royal Suite bathroom aboard Hathor"
                        over="scraped-royal-1"
                        overAlt="A Royal Suite aboard Hathor Dahabiya"
                        sizes="(max-width: 950px) 88vw, 42vw"
                      />
                      <div className="h3-imgtext__text">
                        <p className="h3-kicker">03 — The suites</p>
                        {/* ref 5 — the sentence is built, not lit. Every
                            character rises out of a clipped line in sequence,
                            which is the site's own title motion and is plainly
                            an animation; the column under it then lifts line by
                            line behind it. */}
                        <p className="h3-imgtext__line">
                          <AnimaSplitLine line={0}>
                            Twelve rooms, and the river in every one of them.
                          </AnimaSplitLine>
                        </p>
                        <p className="h3-support h3-imgtext__copy">
                          <span>
                            Eight cabins, two suites and two Royal Suites, each with its
                            own window on the bank.
                          </span>{" "}
                          <span>
                            Hand-worked wood, linen, and a bed made for the quiet after
                            a shore day.
                          </span>
                        </p>
                        <Link className="h3-text-link" href="/suites">
                          See the suites
                        </Link>
                      </div>
                      <Flip
                        className="h3-flip--b"
                        variant="leftRight"
                        under="scraped-cabin-1"
                        underAlt="A river-view cabin aboard Hathor Dahabiya"
                        over="scraped-luxsuite-2"
                        overAlt="A Luxury Suite aboard Hathor Dahabiya"
                        sizes="(max-width: 950px) 54vw, 24vw"
                      />
                    </div>
                  </Panel>
                </Act>

                <Flow>
                  {/* ------------- 07 · the experiences · carousel (the rail) */}
                  <Panel className="h3-carousel" label="Aboard Hathor">
                    <div className="h3-carousel__content" aria-hidden="true">
                      <span>
                        {[...MARQUEE, ...MARQUEE].map((word, index) => (
                          <span
                            key={`${word}-${index}`}
                            className="h3-carousel__item"
                          >
                            <i className="h3-carousel__star" />
                            <b className="h3-carousel__text">{word}</b>
                          </span>
                        ))}
                      </span>
                    </div>
                  </Panel>

                  {/* ---------------- 08 · the experiences · images (beige) */}
                  <Panel
                    className="h3-images h3-images--secundario"
                    label="The experiences"
                  >
                    <Flip
                      className="h3-flip--a"
                      variant="rightLeft"
                      under="dining-lounge"
                      underAlt="The lounge aboard Hathor Dahabiya"
                      over="gastronomy-hero"
                      overAlt="Dining aboard Hathor Dahabiya"
                      sizes="(max-width: 950px) 100vw, 38vw"
                    />
                    <Flip
                      className="h3-flip--b"
                      variant="leftRight"
                      under="wellness-fitness"
                      underAlt="The fitness space aboard Hathor Dahabiya"
                      over="wellness-hero"
                      overAlt="Seneb Spa aboard Hathor Dahabiya"
                      sizes="(max-width: 950px) 78vw, 30vw"
                    />
                    <nav className="h3-images__list" aria-label="Aboard Hathor">
                      {EXPLORE.map((item) => (
                        <Link key={item.href} href={item.href}>
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </Panel>

                  {/* ---------------------------- 09 · about · terms (deep)
                      Suites' `follow__mouse`: a frame rides the cursor across
                      the wall and changes to the photograph belonging to
                      whichever principle is under the pointer — each one drawn
                      from a different part of the site. */}
                  <Panel className="h3-terms" label="About Hathor">
                    <div className="h3-terms__stack" data-h3-follow-host>
                      {TERMS.map((term, index) => (
                        <article
                          key={term.num}
                          className={`h3-terms__term h3-terms__term--${term.tone}`}
                          data-h3-term={index}
                        >
                          <p className="h3-terms__copy h3-support">{term.copy}</p>
                          <div className="h3-terms__wrap-title">
                            <span className="h3-terms__num">{term.num}</span>
                            <h2 className="h3-terms__title">{term.title}</h2>
                          </div>
                        </article>
                      ))}

                      <div
                        className="h3-terms__follow"
                        data-h3-follow
                        aria-hidden="true"
                      >
                        {TERMS.map((term, index) => (
                          <TermPlate
                            key={term.num}
                            slot={term.slot}
                            alt={term.imageAlt}
                            index={index}
                          />
                        ))}
                      </div>
                    </div>
                  </Panel>

                  {/* ----------------------------- 10 · the close · cierre
                      ref 9 + 10 — one screen wide, not one and a half, so the
                      act ends on the image instead of half a wall of nothing.
                      The photograph is full bleed; the invitation is cut out of
                      it and the pill draws itself open as the wall arrives. */}
                  <Panel className="h3-cierre" label="Sail with Hathor">
                    <Flip
                      className="h3-cierre__image"
                      variant="upDown"
                      under="charter-hero"
                      underAlt="Hathor Dahabiya chartered in full on the Nile"
                      over="home-call-to-action"
                      overAlt="Hathor Dahabiya at anchor at dusk"
                      sizes="100vw"
                      anchor="edge"
                    />
                    <div className="h3-cierre__scrim" aria-hidden="true" />
                    <div className="h3-cierre__note">
                      <p className="h3-kicker">Luxor · Aswan · Egypt</p>
                      <h2 className="h3-cierre__title">
                        <AnimaSplitLine line={0}>Come aboard</AnimaSplitLine>
                      </h2>
                      <p className="h3-support">
                        Twelve guests, five moorings and one river. The rest of
                        the arrangements are ours.
                      </p>
                      <div className="h3-cierre__reveal">
                        <BookNowTrigger className="h3-btn h3-cierre__book">
                          Check availability
                        </BookNowTrigger>
                      </div>
                    </div>
                  </Panel>
                </Flow>
              </div>
            </div>
          </section>

          {/* ============================================= the vertical run
              The document Suites runs once its horizontal story finishes:
              chapter, mosaic, display lines, two columns, the request, the
              footer. Here it carries contact, where a homepage has to end. */}
          <div className="h3-doc">
            {/* ----------------------------------- 11 · title · chapter */}
            <section
              className="h3-wrapper h3-pt-md h3-pb-sm"
              aria-label="Contact Hathor"
            >
              <div className="h3-chapter__intro">
                <p className="h3-kicker">06 — Contact</p>
                <i className="h3-chapter__rule" aria-hidden="true" />
              </div>
              <h2 className="h3-chapter__title" data-anima-title>
                <AnimaSplitLine line={0}>Begin your</AnimaSplitLine>
                <AnimaSplitLine line={1}>Nile journey</AnimaSplitLine>
              </h2>
            </section>

            {/* ------------------------------------ 12 · media · mosaic */}
            <section
              className="h3-wrapper h3-pb-xs h3-scene"
              aria-label="Aboard Hathor"
            >
              <div className="h3-mosaic">
                {MOSAIC.map((plate) => (
                  <MosaicPlate
                    key={plate.slot}
                    slot={plate.slot}
                    alt={plate.alt}
                  />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

/* --------------------------------------------------------------- fragments */

/**
 * The chart's wall. It carries the vessel herself as a watermark behind the
 * drawing — the CMS slot resolved here and handed to CSS, so the ghost follows
 * whatever photograph the dashboard is pointing at.
 */
function ChartPanel({ children }: { children: ReactNode }) {
  const ghost = useSiteImage("home-3-animated-map-bg");
  return (
    <section
      className="h3-scene h3-chart-panel"
      aria-label="The route between Luxor and Aswan"
      style={
        {
          ["--h3-chart-ghost" as string]: `url("${originSrcForNextImage(ghost.src)}")`,
        } as CSSProperties
      }
    >
      {children}
    </section>
  );
}


/** One of the three plates the cursor carries across the About wall. */
function TermPlate({
  slot,
  alt,
  index,
}: {
  slot: string;
  alt: string;
  index: number;
}) {
  const image = useSiteImage(slot);
  return (
    <figure
      className="h3-terms__plate"
      data-h3-term-plate={index}
      style={{ ["--i" as string]: index } as CSSProperties}
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        sizes="(max-width: 950px) 1px, 22vw"
        quality={SITE_IMAGE_QUALITY}
      />
    </figure>
  );
}

/** One plate in the vertical mosaic. */
function MosaicPlate({ slot, alt }: { slot: string; alt: string }) {
  const image = useSiteImage(slot);
  return (
    <figure className="h3-mosaic__item">
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        sizes="(max-width: 950px) 50vw, 24vw"
        quality={SITE_IMAGE_QUALITY}
      />
    </figure>
  );
}
