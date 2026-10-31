"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
} from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { usePartnersEditorialScroll } from "@/hooks/usePartnersEditorialScroll";
import { PartnersCompanyStrip } from "@/components/partners/PartnersCompanyStrip";
import { HOMEPAGE_PARTNERS } from "@/lib/homepage-content";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import { useLocalizedHref, usePublicLocale } from "@/hooks/usePublicLocale";
import { PARTNERS_COPY } from "@/lib/i18n/partners-copy";
import {
  normalizeOptionalText,
  stackedHeroLines,
} from "@/lib/website-text-shared";

function PartnersMedia({
  slot,
  alt,
  priority = false,
  className = "",
  ratio,
}: {
  slot: string;
  alt: string;
  priority?: boolean;
  className?: string;
  ratio?: string;
}) {
  const image = useSiteImage(slot);
  return (
    <figure
      className={`pn-media ${className}`}
      data-site-image={image.slot ?? slot}
      style={
        ratio ? ({ ["--pn-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 70vw"
        quality={SITE_IMAGE_QUALITY}
        className="pn-media__image"
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
    <div className={`pn-flip pn-flip--${axis} ${className}`} data-pn-flip>
      <PartnersMedia
        slot={front}
        alt={frontAlt}
        className="pn-flip__base"
        ratio={ratio}
      />
      <PartnersMedia
        slot={back}
        alt={backAlt}
        className="pn-flip__overlay"
        ratio={ratio}
      />
    </div>
  );
}

function Scene({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={`pn-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

/**
 * Partner circle — roles describe how each name meets Hathor guests. Role,
 * region and note come from PARTNERS_COPY.circle, in this order.
 */
const CIRCLE = [
  {
    number: "01",
    name: "Easy Trav Tourism",
    short: "Easy Trav",
    slot: "home-story-way-of-life",
  },
  {
    number: "02",
    name: "Booking",
    short: "Booking",
    slot: "room-suite",
  },
  {
    number: "03",
    name: "Expedia",
    short: "Expedia",
    slot: "home-voyage-nile-majesty",
  },
  {
    number: "04",
    name: "X Luxury Hospitality",
    short: "X Luxury",
    slot: "room-royal",
  },
] as const;

export function PartnersPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const t = PARTNERS_COPY[usePublicLocale()];
  const localHref = useLocalizedHref();
  const { pages } = useWebsiteText();
  const partners = pages.partners;
  const typography = useTypographySettings();
  const partnersHero = resolveHeroPageCopy(typography, "partners");
  const heroLines = stackedHeroLines(partnersHero.main, partnersHero.second);
  const lineClass = ["pn-line--a", "pn-line--b", "pn-line--c"] as const;
  usePartnersEditorialScroll({ rootRef, runRef, trackRef });

  const lead = normalizeOptionalText(partners.lead) ?? t.leadFallback;

  const circleNames = CIRCLE.map((item, index) => ({
    ...item,
    ...t.circle[index],
    name:
      HOMEPAGE_PARTNERS.partners.length > 0
        ? (HOMEPAGE_PARTNERS.partners[index] ?? item.name)
        : item.name,
  }));

  return (
    <div ref={rootRef} className="partners-editorial">
      <div className="pn-progress" aria-hidden="true">
        <i data-pn-progress />
      </div>

      <main>
        <section
          ref={runRef}
          className="pn-run"
          aria-label={t.runLabel}
        >
          <div className="pn-stage">
            <div ref={trackRef} className="pn-track">
              {/* 01 — Opening: title + edge portrait, footer strip in flow */}
              <Scene className="pn-open">
                <div className="pn-open__grid">
                  <ol className="pn-open__spine" aria-label={t.spineLabel}>
                    {circleNames.map((item) => (
                      <li key={item.number}>
                        <span>{item.number}</span>
                        <em>{item.short}</em>
                      </li>
                    ))}
                  </ol>

                  <div className="pn-open__inner">
                    <div className="pn-open__title" id="partners" data-anima-title>
                      <h1 className="pn-display pn-display--xl wt-page-hero">
                        {heroLines.map((line, index) => (
                          <span
                            key={`${line}-${index}`}
                            className={`pn-line ${lineClass[index] ?? ""}`}
                          >
                            <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                          </span>
                        ))}
                      </h1>
                    </div>

                    <p className="pn-open__count pn-edit">
                      <span>0{circleNames.length}</span>
                      <i aria-hidden="true" />
                      <span>{t.names}</span>
                    </p>
                  </div>

                  <PartnersMedia
                    slot="about-hero"
                    alt={t.alts.portrait}
                    priority
                    className="pn-open__portrait"
                    ratio="4 / 5"
                  />
                </div>

                <div className="pn-open__bar">
                  <p className="pn-open__mark">
                    Hathor Cruise <span className="pn-reg">®</span> 2026
                  </p>
                  <p className="pn-open__scroll">
                    {t.scroll}
                    <i />
                  </p>
                  <nav className="pn-open__nav" aria-label={t.navLabel}>
                    <a href="#circle">{t.nav[0]}</a>
                    <a href="#craft">{t.nav[1]}</a>
                    <a href="#converse">{t.nav[2]}</a>
                    <Link href={localHref("/contact")}>{t.nav[3]}</Link>
                  </nav>
                </div>
              </Scene>

              <Scene className="pn-art" aria-label={t.artLabel}>
                <PartnersCompanyStrip variant="intro" />
              </Scene>

              {/* 02 — Image field: layered Nile imagery */}
              <Scene className="pn-gallery">
                <FlipImage
                  className="pn-gallery__main"
                  axis="left"
                  ratio="1279 / 860"
                  front="home-cinematic-still"
                  back="home-story-legacy-large"
                  frontAlt={t.alts.river}
                  backAlt={t.alts.legacy}
                />
                <FlipImage
                  className="pn-gallery__inset"
                  axis="up"
                  ratio="668 / 554"
                  front="room-luxury"
                  back="about-dining"
                  frontAlt={t.alts.cabin}
                  backAlt={t.alts.dining}
                />
                <p className="pn-gallery__caption">
                  <span>{t.aboard}</span> {t.route}
                </p>
              </Scene>

              {/* 03 — Covenant with supporting photograph */}
              <Scene className="pn-covenant">
                <div className="pn-covenant__copy">
                  <div className="pn-covenant__statement" data-anima-title>
                    <h2 className="pn-edit pn-edit--xl">
                      {t.covenant.map((line, index) => (
                        <span className="pn-line" key={index}>
                          <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                        </span>
                      ))}
                    </h2>
                  </div>
                  <p className="pn-covenant__lead wt-page-body">{lead}</p>
                </div>
                <FlipImage
                  className="pn-covenant__media"
                  axis="right"
                  ratio="835 / 1100"
                  front="home-split-courtyard"
                  back="home-collage-living"
                  frontAlt={t.alts.deck}
                  backAlt={t.alts.living}
                />
              </Scene>

              {/* 04 — Partner constellation with portrait peeks */}
              <Scene className="pn-orbit" id="circle">
                <header className="pn-orbit__head">
                  <p className="pn-display pn-display--l">{t.orbitTitle}</p>
                  <p className="pn-meta-copy">{t.orbitBody}</p>
                </header>

                <ol className="pn-orbit__list">
                  {circleNames.map((item) => (
                    <li key={item.number} className="pn-star">
                      <span className="pn-star__num">{item.number}</span>
                      <div className="pn-star__body">
                        <h3 className="pn-star__name pn-display">{item.name}</h3>
                        <p className="pn-star__meta">
                          {item.role} · {item.region}
                        </p>
                        <p className="pn-star__note">{item.note}</p>
                      </div>
                      <PartnersMedia
                        slot={item.slot}
                        alt={t.partnerAlt(item.name)}
                        className="pn-star__peek"
                        ratio="4 / 5"
                      />
                    </li>
                  ))}
                </ol>
              </Scene>

              {/* 05 — Craft essay: three images + copy, no absolute overlap */}
              <Scene className="pn-craft" id="craft">
                <div className="pn-craft__visual">
                  <FlipImage
                    className="pn-craft__tall"
                    axis="up"
                    ratio="668 / 920"
                    front="about-dining"
                    back="gastronomy-restaurant"
                    frontAlt={t.alts.fineDining}
                    backAlt={t.alts.restaurant}
                  />
                  <FlipImage
                    className="pn-craft__wide"
                    axis="left"
                    ratio="1090 / 720"
                    front="home-story-dining"
                    back="gastronomy-wine"
                    frontAlt={t.alts.atmosphere}
                    backAlt={t.alts.wine}
                  />
                  <PartnersMedia
                    slot="home-amenities-1"
                    alt={t.alts.amenity}
                    className="pn-craft__accent"
                    ratio="1 / 1"
                  />
                </div>
                <div className="pn-craft__copy">
                  <p className="pn-edit pn-edit--l" data-anima-title>
                    {t.craft.map((line, index) => (
                      <span className="pn-line" key={index}>
                        <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                      </span>
                    ))}
                  </p>
                  <p className="pn-meta-copy">{t.craftBody}</p>
                </div>
              </Scene>

              {/* 06 — Datum with photographic wash */}
              <Scene className="pn-datum">
                <PartnersMedia
                  slot="home-call-to-action"
                  alt={t.alts.wash}
                  className="pn-datum__wash"
                  ratio="16 / 10"
                />
                <div className="pn-datum__frame">
                  <span className="pn-datum__corner pn-datum__corner--tl">
                    {t.datum.tl}
                  </span>
                  <span className="pn-datum__corner pn-datum__corner--tr">
                    {t.datum.tr}
                  </span>

                  <p className="pn-datum__figure pn-edit">
                    <span>0{circleNames.length}</span>
                    <i aria-hidden="true" />
                    <span>{t.datum.one}</span>
                  </p>

                  <span className="pn-datum__corner pn-datum__corner--bl">
                    {t.datum.bl}
                  </span>
                  <span className="pn-datum__corner pn-datum__corner--br">
                    {t.datum.br}
                  </span>
                </div>
              </Scene>

              {/* 07 — Bridge: dual imagery + phrase */}
              <Scene className="pn-bridge">
                <div className="pn-bridge__pair">
                  <PartnersMedia
                    slot="home-story-craft-large"
                    alt={t.alts.craft}
                    className="pn-bridge__media"
                    ratio="16 / 10"
                  />
                  <FlipImage
                    className="pn-bridge__side"
                    axis="up"
                    ratio="4 / 5"
                    front="home-alt-highlights"
                    back="home-wheel-image"
                    frontAlt={t.alts.highlights}
                    backAlt={t.alts.wheel}
                  />
                </div>
                <p className="pn-bridge__phrase pn-display pn-display--l">
                  {t.bridge[0]}
                  <br />
                  {t.bridge[1]}
                </p>
              </Scene>
            </div>
          </div>
        </section>

        <section className="pn-epilogue" id="converse">
          <header className="pn-epilogue__head">
            <h2 className="pn-display pn-display--l" data-anima-title>
              {t.epilogue.map((line, index) => (
                <span className="pn-line" key={index}>
                  <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                </span>
              ))}
            </h2>
          </header>

          <div className="pn-epilogue__pair">
            <PartnersMedia
              slot="room-royal"
              alt={t.alts.royal}
              ratio="668 / 554"
            />
            <PartnersMedia
              slot="about-dining"
              alt={t.alts.dining}
              ratio="668 / 720"
            />
          </div>

          <div className="pn-epilogue__board">
            <div className="pn-epilogue__statement">
              <p className="pn-edit pn-edit--l">{t.statement}</p>
              <div className="pn-epilogue__pills">
                <Link href={localHref("/contact")} className="pn-btn pn-btn--solid">
                  <span>{t.contactHathor}</span>
                </Link>
                <BookNowTrigger className="pn-btn">
                  <span>{t.bookVoyage}</span>
                </BookNowTrigger>
              </div>
              <p className="pn-meta-copy">{t.epilogueMeta}</p>
            </div>

            <aside className="pn-epilogue__card">
              <PartnersMedia
                slot="contact-hero"
                alt={t.alts.card}
                className="pn-epilogue__card-media"
                ratio="356 / 460"
              />
              <h3 className="pn-display">{t.cardTitle}</h3>
              <p className="pn-epilogue__card-body">
                {t.cardBody[0]}
                <br />
                {t.cardBody[1]}
              </p>
              <div className="pn-epilogue__card-links">
                <Link className="pn-link" href={localHref("/about")}>
                  {t.aboutHathor}
                </Link>
                <Link className="pn-link" href={localHref("/contact")}>
                  {t.writeToUs}
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
