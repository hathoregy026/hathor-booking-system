"use client";

import { useCabinPrices } from "@/components/public/CabinPricesProvider";
import { livePriceFor } from "@/lib/cabin-prices-shared";
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
import { useHomeThreePhoneSlide } from "@/hooks/useHomeThreePhoneSlide";
import { EX_HERO } from "@/lib/ex-page-content";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { HOME_CAROUSEL_IMAGE_BY_ROOM } from "@/lib/home-carousel-images";
import { AddToVoyageButton } from "@/components/selection/AddToVoyageButton";
import { FavoriteButton } from "@/components/selection/FavoriteButton";
import { cabinSlugForListing } from "@/lib/selection-catalog";
import type { HeroLogoTune } from "@/lib/hero-logo-tune-shared";
import { NILE_TOTAL_KM } from "@/lib/nile-route";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { DeckAtlas } from "@/components/home/deck-atlas/DeckAtlas";
import { HomeGuide } from "@/components/pages/home-three/HomeGuide";
import { usePublicLocale } from "@/hooks/usePublicLocale";
import { HOME_COPY } from "@/lib/i18n/home-copy";
import { localizedHref } from "@/lib/i18n/locale";
import { localizedMoorings } from "@/lib/i18n/route-copy";

type HomeThreeProps = {
  heroLogoTune: HeroLogoTune;
  heroLogoTuneMobile: HeroLogoTune;
  /** Server-rendered guest reviews, set in the vertical document after the guide. */
  reviews?: ReactNode;
};

/* ------------------------------------------------------------------ atoms */

/** A plain plate. The chart column sizes its own frames through this. */
function Frame({
  slot,
  alt,
  className = "",
  ratio,
  sizes = "(max-width: 1024px) 100vw, 50vw",
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
  sizes = "(max-width: 1024px) 100vw, 50vw",
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
  sizes = "(max-width: 1024px) 100vw, 50vw",
  anchor,
  linked = false,
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
  /** Read `--h3-flip` from an ancestor the hook measures, so frames can wipe as a pair. */
  linked?: boolean;
}) {
  const underImage = useSiteImage(under);
  const overImage = useSiteImage(over);
  return (
    <div
      className={`h3-flip h3-flip--${variant} ${className}`.trim()}
      /* the hook reads the axis to pick its horizontal or vertical formula */
      data-h3-flip={linked ? undefined : variant === "upDown" ? "up" : "side"}
      data-h3-flip-anchor={linked ? undefined : anchor}
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
/* Words for each (nights, route, note, alt) live in HOME_COPY.voyages.items, in this order. */
const VOYAGES = [
  {
    slot: "home-voyage-3n-aswan-luxor",
    slug: "3-nights-aswan-luxor",
    tone: "a",
  },
  {
    slot: "home-voyage-4n-luxor-aswan",
    slug: "4-nights-luxor-aswan",
    tone: "b",
  },
  {
    slot: "home-voyage-7n-roundtrip",
    slug: "7-nights-luxor-aswan-luxor",
    tone: "c",
  },
] as const;

/* 03 — the sailings rail.
   Built from the catalogue, never retyped: `HATHOR_CRUISES` carries the real
   itineraries and the real per-cabin price, and `HOME_CAROUSEL_IMAGE_BY_ROOM`
   carries the CMS slot each cabin already owns. Only the cabins that have a
   slot of their own can appear — one card, one photograph — and the first
   eight of those are what the homepage shows before the door to the list. */
/* The tier's label is HOME_COPY.sailings.tiers[roomType]. */
const TIER: Record<string, string> = {
  "Luxury Room": "room",
  "Luxury Suite": "suite",
  "Luxury Royal Suite": "royal",
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
      return {
        key: `${cruise.slug}-${room.roomNumber}`,
        slot: HOME_CAROUSEL_IMAGE_BY_ROOM[
          room.roomNumber as keyof typeof HOME_CAROUSEL_IMAGE_BY_ROOM
        ],
        roomName: room.name,
        ports: cruise.ports,
        /* the card names the voyage, not the cabin: the grade is already the
           line above it and the wall behind it, so repeating "Royal Suite"
           twice on one card only spends the display line
           ("Luxor → Aswan → Luxor" is the round trip, and reads better as
           that than as three place names on a card this narrow) */
        roundTrip: cruise.ports.split("→").length > 2,
        nights: cruise.nights,
        day: cruise.departureDay,
        priceCents: room.priceCents,
        /* the dashboard's price for this voyage and cabin replaces the published one */
        voyageSlug: cruise.slug,
        roomNumber: room.roomNumber,
        tier: TIER[room.roomType] ?? "room",
        roomType: room.roomType,
        /* the composite slug the selection store keys a cabin on; null when a
           cabin has no marketing residence, which hides its controls rather
           than rendering ones that cannot work */
        cabinSlug: cabinSlugForListing(cruise.slug, room.name),
        cabinName: room.name,
        href: "/cruises-list",
      };
    }),
).slice(0, 8);

/* 09 — about, as the Suites terms module reads it: three numbered principles.
   Their words are HOME_COPY.terms.items, in this order. */
const TERMS = [
  { tone: "a", num: "01", slot: "about-hero" },
  { tone: "b", num: "02", slot: "home-story-craft-large" },
  { tone: "c", num: "03", slot: "home-story-way-of-life" },
] as const;

/* 07 — the marquee (HOME_COPY.marquee.words), doubled in the markup so the
   -50% loop is seamless. 08 — the rest of the site, named where a homepage
   has to name it (HOME_COPY.experiences.explore). */

/* 12 — four plates in the mosaic. None appear elsewhere on the page, and none
   are among the five the chart already spends on its moorings. Alt text is
   HOME_COPY.doc.mosaicAlts, in this order. */
const MOSAIC = [
  "landmark-hatshepsut",
  "home-voyage-nile-majesty",
  "home-story-dining",
  "moving-tilted-3",
] as const;

/* ------------------------------------------------------------------- page */

export function HomeThreePageContent({
  heroLogoTune,
  heroLogoTuneMobile,
  reviews,
}: HomeThreeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cabinPrices = useCabinPrices();
  const locale = usePublicLocale();
  const t = HOME_COPY[locale];
  const localHref = (target: string) => localizedHref(target, locale);
  const moorings = localizedMoorings(locale);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useExScrollMotion();
  useHomeThreeFlow({ rootRef, runRef, trackRef });
  useHomeThreePhoneSlide(rootRef);

  return (
    <>
      {/* Homepage hero stage. Phone uses the overlay titles on the phone reel,
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
              /* The homepage title is set here, not from the typography
                 dashboard: "Luxury Dahabiya" with the "Nile Cruise" script. */
              lineRight={t.hero.lineRight}
              lineLeft={t.hero.lineLeft}
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
          <section ref={runRef} className="h3-run" aria-label={t.runLabel}>
            <div className="h3-stage">
              <div ref={trackRef} className="h3-track">
                <Act name="route">
                  {/* ---------------------------------------- 01 · the opener
                      The Contact page's opening scene, carrying the homepage's
                      identity: the rail stood on end in the corner, the eyebrow,
                      the display ladder, and the mark and scroll hint at the
                      foot. */}
                  <Panel className="h3-open" label={t.open.label}>
                    <nav className="h3-open__nav" aria-label={t.open.navLabel}>
                      {t.open.nav.map((item) => (
                        <Link key={item.href} href={localHref(item.href)}>
                          {item.label}
                        </Link>
                      ))}
                    </nav>

                    <div className="h3-open__inner">
                      <p className="h3-open__eyebrow">{t.open.eyebrow}</p>

                      {/* Contact sets three SHORT lines — "Contact us / Ask any
                          / Question" — and that is what lets the ladder hold one
                          screen at 11rem. Long lines wrap into a fourth row and
                          push the mark off the foot, so the break here is kept
                          to the same measure. */}
                      <h2 className="h3-open__title">
                        <span className="h3-open__line h3-open__line--a">
                          <AnimaSplitLine line={0}>{t.open.titleLines[0]}</AnimaSplitLine>
                        </span>
                        <span className="h3-open__line h3-open__line--b">
                          <AnimaSplitLine line={1}>{t.open.titleLines[1]}</AnimaSplitLine>
                        </span>
                        <span className="h3-open__line h3-open__line--c">
                          <AnimaSplitLine line={2}>{t.open.titleLines[2]}</AnimaSplitLine>
                        </span>
                      </h2>

                      <p className="h3-open__body">{t.open.body}</p>
                    </div>

                    <p className="h3-open__mark">
                      Hathor Cruise <span className="h3-reg">®</span> 2026
                    </p>
                    <p className="h3-open__scroll">
                      <i />
                      {t.open.scroll}
                    </p>

                    {/* Compact (≤1024): the opener and the lead become one
                        composition on the lead's own three photographs. The
                        two small frames are that flip turned into a pair —
                        they trade plates off one `--h3-flip` that CSS scrubs
                        once the whole block is on screen. Hidden on desktop. */}
                    <div className="h3-np">
                      <div className="h3-np__hero">
                        <Media
                          slot="cruises-hero"
                          alt=""
                          className="h3-np__plate"
                          sizes="(max-width: 1024px) 100vw, 58vw"
                        />
                        <p className="h3-np__mark">
                          <span className="h3-np__sr">Hathor Dahabiya</span>
                          <span aria-hidden="true">
                            <AnimaSplitLine line={0}>Hathor</AnimaSplitLine>
                            <AnimaSplitLine line={1}>Dahabiya</AnimaSplitLine>
                          </span>
                        </p>
                      </div>

                      <div className="h3-np__lower">
                        <svg
                          className="h3-np__route"
                          viewBox="0 -10 642 124"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path
                            className="h3-np__route-line"
                            d="M32 0V2Q32 10 40 10H337Q347 10 347 20V78C347 98 360 104 371 94C378 87 382 76 386 68"
                            pathLength={100}
                          />
                          <circle className="h3-np__route-halo" cx="32" cy="0" r="8.5" />
                          <circle className="h3-np__route-dot" cx="32" cy="0" r="4.6" />
                        </svg>

                        <Flip
                          linked
                          className="h3-np__frame"
                          variant="leftRight"
                          over="home-split-courtyard"
                          overAlt=""
                          under="home-cinematic-still"
                          underAlt=""
                          sizes="(max-width: 1024px) 78vw, 30vw"
                        />
                        <Flip
                          linked
                          className="h3-np__arch"
                          variant="rightLeft"
                          over="home-cinematic-still"
                          overAlt=""
                          under="home-split-courtyard"
                          underAlt=""
                          sizes="(max-width: 1024px) 78vw, 30vw"
                        />

                        <p className="h3-np__copy">{t.open.npCopy}</p>

                        <h2 className="h3-np__title">
                          <span className="h3-np__sr">{t.open.npTitle}</span>
                          <span aria-hidden="true">
                            <AnimaSplitLine line={0}>{t.open.npTitle}</AnimaSplitLine>
                          </span>
                        </h2>
                      </div>
                    </div>
                  </Panel>

                  {/* ------------------------------ 02 · the cruise · the lead
                      Contact's image lead: one tall plate with a second frame
                      overlapping its right edge, lifted off the centre line. */}
                  <Panel className="h3-lead" label={t.lead.label}>
                    <Media
                      slot="cruises-hero"
                      alt={t.lead.mainAlt}
                      className="h3-lead__main"
                      sizes="(max-width: 1024px) 100vw, 58vw"
                    />
                    <Flip
                      className="h3-lead__inset"
                      variant="leftRight"
                      under="home-split-courtyard"
                      underAlt={t.lead.insetUnderAlt}
                      over="home-cinematic-still"
                      overAlt={t.lead.insetOverAlt}
                      sizes="(max-width: 1024px) 78vw, 30vw"
                    />
                    {/* Contact's lead carries ONE line here and nothing else.
                        A paragraph and a link under it grew the block into the
                        plate's foot; the invitation lives on the sailings panel
                        that follows instead. */}
                    <p className="h3-lead__aboard">
                      <span>{t.lead.aboard}</span> {t.lead.aboardRoute}
                    </p>
                  </Panel>

                  {/* -------------------- 03 · the sailings · the cruise list
                      Eight of the ten cabin sailings Hathor actually runs, on
                      the CMS slot each one already owns, then the door through
                      to the full list. The wall behind each card is its tier —
                      room, suite, Royal Suite — so the ladder of value is read
                      before a single price is. */}
                  <Panel className="h3-sailings" label={t.sailings.label}>
                    <div className="h3-sailings__head">
                      <p className="h3-kicker">{t.sailings.kicker}</p>
                      <h2 className="h3-title h3-title--sm">
                        {t.sailings.titleLines[0]}{" "}
                        <br />
                        {t.sailings.titleLines[1]}
                      </h2>
                      <p className="h3-support">{t.sailings.support}</p>
                    </div>

                    <ul className="h3-sailings__rail">
                      {SAILINGS.map((sailing, index) => {
                        const sailingName = sailing.roundTrip
                          ? t.sailings.roundTrip
                          : t.sailings.route(sailing.ports);
                        return (
                        <li
                          key={sailing.key}
                          className={`h3-sail h3-sail--${sailing.tier}`}
                          style={{ ["--i" as string]: index } as CSSProperties}
                        >
                          <Media
                            slot={sailing.slot}
                            alt={t.sailings.alt(sailing.roomName, sailing.ports)}
                            className="h3-sail__plate"
                            /* Desktop plate is 4:3 to match the sources; compact
                               cards are ~90vw. Deliver at card width, not 2×. */
                            sizes="(max-width: 1024px) 92vw, 24vw"
                          />

                          <div className="h3-sail__body">
                            <p className="h3-sail__tier">
                              {t.sailings.tiers[sailing.roomType] ?? sailing.roomType}
                            </p>
                            <Link href={localHref(sailing.href)} className="h3-sail__name">
                              {sailingName}
                            </Link>
                            <p className="h3-sail__route">
                              {t.sailings.nights(sailing.nights)}
                              <b>{t.sailings.day(sailing.day)}</b>
                            </p>
                            <p className="h3-sail__price">
                              <em>{t.sailings.from}</em>
                              {t.sailings.price(
                                livePriceFor(cabinPrices, sailing.voyageSlug, sailing.roomNumber) ??
                                  sailing.priceCents,
                              )}
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
                                    name={`${sailing.cabinName}, ${sailingName}`}
                                    variant="inline"
                                    showLabel
                                  />
                                  <AddToVoyageButton
                                    kind="cabin"
                                    slug={sailing.cabinSlug}
                                    name={`${sailing.cabinName}, ${sailingName}`}
                                    variant="inline"
                                  />
                                </>
                              ) : null}
                              <BookNowTrigger className="h3-btn">
                                {t.sailings.bookNow}
                              </BookNowTrigger>
                            </div>
                          </div>
                        </li>
                        );
                      })}

                      <li className="h3-sail h3-sail--more">
                        <Link href={localHref("/cruises-list")} className="h3-sail__link">
                          <Media
                            slot={SAILINGS[0]?.slot ?? "cruises-hero"}
                            alt={t.sailings.moreAlt}
                            className="h3-sail__plate"
                            sizes="(max-width: 1024px) 92vw, 24vw"
                          />
                          <div className="h3-sail__body h3-sail__body--more">
                            <p className="h3-sail__tier">{t.sailings.moreTier}</p>
                            <h3 className="h3-sail__name">{t.sailings.moreName}</h3>
                            <span className="h3-text-link" aria-hidden="true">
                              {t.sailings.moreLink}
                            </span>
                          </div>
                        </Link>
                      </li>
                    </ul>
                  </Panel>

                  {/* -------------------------------- 03 · the chart (sand) */}
                  <ChartPanel label={t.chart.panelLabel}>
                    <div className="h3-course">
                      <div className="h3-course__head">
                        <p className="h3-kicker">{t.chart.kicker}</p>
                        <h2 className="h3-title h3-title--sm">
                          {t.chart.titleLines[0]}{" "}
                          <br />
                          {t.chart.titleLines[1]}
                        </h2>
                        <p className="h3-support">{t.chart.support}</p>
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
                            <em>{t.chart.sailed(NILE_TOTAL_KM)}</em>
                          </p>
                          <NileHelm heading={t.chart.heading} />
                          <NileChart copy={t.chart} />

                          <div className="h3-course__berths">
                            <p className="h3-atlas-eyebrow">{t.chart.eyebrow}</p>
                            <div
                              className="h3-stop-buttons"
                              role="group"
                              aria-label={t.chart.stopsLabel}
                            >
                              {H4_STOPS.map((stop, i) => (
                                <button
                                  key={stop.name}
                                  type="button"
                                  data-h3-tag={stop.t}
                                  aria-pressed={i === 0}
                                >
                                  {t.chart.place(stop.name)}
                                </button>
                              ))}
                            </div>
                            <div className="h3-berth-stack">
                            {moorings.map((m) => (
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
                                  sizes="(max-width: 1024px) 34vw, min(38vw, 36rem)"
                                />
                                <p className="h3-berth__meta">
                                  <span>{m.day}</span>
                                  <em>
                                    {m.legKm === 0
                                      ? t.chart.embarkation
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
                                        <Link href={localHref(s.href)}>{s.name}</Link>
                                        <em>{s.era}</em>
                                      </p>
                                      <p className="h3-berth__blurb">{s.note}</p>
                                      <Link href={localHref(s.href)} className="h3-berth__more">
                                        {t.chart.readMore}
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
                  {/* The ship, deck by deck, straight after the route she sails:
                      the deck plans, the spaces aboard and live cabin choice. */}
                  <DeckAtlas />

                  {/* ------------------------- 04 · the claim · text (white) */}
                  <Panel className="h3-text" label={t.claim.label}>
                    <div className="h3-text__wrap">
                      <div className="h3-text__inner">
                        <h2 className="h3-text__title">
                          <span className="h3-text__line">
                            <AnimaSplitLine line={0}>{t.claim.lines[0]}</AnimaSplitLine>
                          </span>
                          <span className="h3-text__line">
                            <AnimaSplitLine line={1}>{t.claim.lines[1]}</AnimaSplitLine>
                          </span>
                          <span className="h3-text__line">
                            <AnimaSplitLine line={2}>{t.claim.lines[2]}</AnimaSplitLine>
                          </span>
                          <span className="h3-text__line h3-text__line--slide">
                            <span>
                              <AnimaSplitLine line={3}>{t.claim.lines[3]}</AnimaSplitLine>
                            </span>
                          </span>
                        </h2>
                        <div className="h3-text__copy h3-support">
                          <p>{t.claim.copy}</p>
                        </div>
                      </div>
                    </div>
                  </Panel>
                </Flow>

                <Act name="aboard">
                  {/* ------------------- 05 · the voyages · projects (beige) */}
                  <Panel className="h3-projects" label={t.voyages.label}>
                    <div className="h3-projects__aside">
                      <p className="h3-kicker">{t.voyages.kicker}</p>
                      <p className="h3-support">{t.voyages.support}</p>
                      <Link className="h3-text-link" href={localHref("/voyages")}>
                        {t.voyages.link}
                      </Link>
                    </div>

                    <div className="h3-projects__rail">
                    {VOYAGES.map((voyage, index) => {
                      const words = t.voyages.items[index];
                      return (
                      <article
                        key={voyage.slot}
                        className={`h3-projects__item h3-projects__item--${voyage.tone}`}
                        data-h3-item
                      >
                        <div className="h3-projects__content">
                          <Media
                            slot={voyage.slot}
                            alt={words.alt}
                            className="h3-projects__image"
                            sizes="(max-width: 1024px) 100vw, 55vw"
                          />

                          <div className="h3-projects__text">
                            <div className="h3-projects__data">
                              <div>
                                <span>{words.nights}</span>
                              </div>
                              <div>
                                <span>{`0${index + 1}`}</span>
                              </div>
                              <div>
                                <span>{words.note}</span>
                              </div>
                            </div>
                            <Link
                              href={localHref("/cruises-list")}
                              className="h3-projects__name"
                            >
                              {words.route}
                            </Link>
                            <div className="h3-pills h3-projects__acts">
                              <FavoriteButton
                                type="voyage"
                                slug={voyage.slug}
                                name={words.route}
                                variant="inline"
                                showLabel
                              />
                              <AddToVoyageButton
                                kind="voyage"
                                slug={voyage.slug}
                                name={words.route}
                                variant="inline"
                              />
                              <BookNowTrigger className="h3-btn">
                                {t.sailings.bookNow}
                              </BookNowTrigger>
                            </div>
                          </div>
                        </div>
                      </article>
                      );
                    })}
                    </div>
                  </Panel>

                  {/* ----------------- 06 · the suites · images-text (black) */}
                  <Panel className="h3-imgtext" label={t.suites.label}>
                    <div className="h3-imgtext__wrap">
                      <Flip
                        className="h3-flip--a"
                        variant="rightLeft"
                        under="scraped-royal-4"
                        underAlt={t.suites.royalBathAlt}
                        over="scraped-royal-1"
                        overAlt={t.suites.royalAlt}
                        sizes="(max-width: 1024px) 88vw, 42vw"
                      />
                      <div className="h3-imgtext__text">
                        <p className="h3-kicker">{t.suites.kicker}</p>
                        {/* ref 5 — the sentence is built, not lit. Every
                            character rises out of a clipped line in sequence,
                            which is the site's own title motion and is plainly
                            an animation; the column under it then lifts line by
                            line behind it. */}
                        <p className="h3-imgtext__line">
                          <AnimaSplitLine line={0}>{t.suites.line}</AnimaSplitLine>
                        </p>
                        <p className="h3-support h3-imgtext__copy">
                          <span>{t.suites.copy[0]}</span>{" "}
                          <span>{t.suites.copy[1]}</span>
                        </p>
                        <Link className="h3-text-link" href={localHref("/suites")}>
                          {t.suites.link}
                        </Link>
                      </div>
                      <Flip
                        className="h3-flip--b"
                        variant="leftRight"
                        under="scraped-cabin-1"
                        underAlt={t.suites.cabinAlt}
                        over="scraped-luxsuite-2"
                        overAlt={t.suites.luxurySuiteAlt}
                        sizes="(max-width: 1024px) 54vw, 24vw"
                      />
                    </div>
                  </Panel>
                </Act>

                <Flow>
                  {/* ------------- 07 · the experiences · carousel (the rail) */}
                  <Panel className="h3-carousel" label={t.marquee.label}>
                    <div className="h3-carousel__content" aria-hidden="true">
                      <span>
                        {[...t.marquee.words, ...t.marquee.words].map((word, index) => (
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
                    label={t.experiences.label}
                  >
                    <Flip
                      className="h3-flip--a"
                      variant="rightLeft"
                      under="dining-lounge"
                      underAlt={t.experiences.loungeAlt}
                      over="gastronomy-hero"
                      overAlt={t.experiences.diningAlt}
                      sizes="(max-width: 1024px) 100vw, 38vw"
                    />
                    <Flip
                      className="h3-flip--b"
                      variant="leftRight"
                      under="wellness-fitness"
                      underAlt={t.experiences.fitnessAlt}
                      over="wellness-hero"
                      overAlt={t.experiences.spaAlt}
                      sizes="(max-width: 1024px) 78vw, 30vw"
                    />
                    <nav className="h3-images__list" aria-label={t.experiences.navLabel}>
                      {t.experiences.explore.map((item) => (
                        <Link key={item.href} href={localHref(item.href)}>
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
                  <Panel className="h3-terms" label={t.terms.label}>
                    <div className="h3-terms__stack" data-h3-follow-host>
                      {TERMS.map((term, index) => {
                        const words = t.terms.items[index];
                        return (
                          <article
                            key={term.num}
                            className={`h3-terms__term h3-terms__term--${term.tone}`}
                            data-h3-term={index}
                          >
                            <p className="h3-terms__copy h3-support">{words.copy}</p>
                            <div className="h3-terms__wrap-title">
                              <span className="h3-terms__num">{term.num}</span>
                              <h2 className="h3-terms__title">{words.title}</h2>
                              {words.aside ? (
                                <p className="h3-terms__aside">{words.aside}</p>
                              ) : null}
                            </div>
                          </article>
                        );
                      })}

                      <div
                        className="h3-terms__follow"
                        data-h3-follow
                        aria-hidden="true"
                      >
                        {TERMS.map((term, index) => (
                          <TermPlate
                            key={term.num}
                            slot={term.slot}
                            alt={t.terms.items[index].imageAlt}
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
                  <Panel className="h3-cierre" label={t.close.label}>
                    <Flip
                      className="h3-cierre__image"
                      variant="upDown"
                      under="charter-hero"
                      underAlt={t.close.charterAlt}
                      over="home-call-to-action"
                      overAlt={t.close.duskAlt}
                      sizes="100vw"
                      anchor="edge"
                    />
                    <div className="h3-cierre__scrim" aria-hidden="true" />
                    <div className="h3-cierre__note">
                      <p className="h3-kicker">{t.close.kicker}</p>
                      <h2 className="h3-cierre__title">
                        <AnimaSplitLine line={0}>{t.close.title}</AnimaSplitLine>
                      </h2>
                      {/* Everything under the title, so "Come aboard" can be
                          the exact centre of the note (and of the pool). */}
                      <div className="h3-cierre__after">
                        <p className="h3-support">{t.close.support}</p>
                        <div className="h3-cierre__reveal">
                          <BookNowTrigger className="h3-btn h3-cierre__book">
                            {t.close.cta}
                          </BookNowTrigger>
                        </div>
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
            {/* ------------------------------ 11 · the guide · ledger + questions
                The plain answers a searcher needs, on the page itself: what a
                dahabiya Nile cruise is, the three voyages with their prices,
                and the questions asked before booking. */}
            <HomeGuide />

            {reviews}

            {/* ----------------------------------- 11 · title · chapter */}
            <section
              className="h3-wrapper h3-pt-md h3-pb-sm"
              aria-label={t.doc.contactLabel}
            >
              <div className="h3-chapter__intro">
                <p className="h3-kicker">{t.doc.kicker}</p>
                <p className="h3-chapter__aboard h3-support">{t.doc.support}</p>
                <i className="h3-chapter__rule" aria-hidden="true" />
              </div>
              <h2 className="h3-chapter__title" data-anima-title>
                <AnimaSplitLine line={0}>{t.doc.titleLines[0]}</AnimaSplitLine>
                <AnimaSplitLine line={1}>{t.doc.titleLines[1]}</AnimaSplitLine>
              </h2>
            </section>

            {/* ------------------------------------ 12 · media · mosaic */}
            <section
              className="h3-wrapper h3-pb-xs h3-scene"
              aria-label={t.doc.mosaicLabel}
            >
              <div className="h3-mosaic">
                {MOSAIC.map((slot, index) => (
                  <MosaicPlate
                    key={slot}
                    slot={slot}
                    alt={t.doc.mosaicAlts[index]}
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
function ChartPanel({ label, children }: { label: string; children: ReactNode }) {
  const ghost = useSiteImage("home-3-animated-map-bg");
  return (
    <section
      className="h3-scene h3-chart-panel"
      aria-label={label}
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
        sizes="(max-width: 1024px) 1px, 22vw"
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
        sizes="(max-width: 1024px) 50vw, 24vw"
        quality={SITE_IMAGE_QUALITY}
      />
    </figure>
  );
}
