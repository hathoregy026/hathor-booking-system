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
import { useAboutEditorialFlow } from "@/hooks/useAboutEditorialFlow";
import { ABOUT_PAGE } from "@/lib/page-content";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import { stackedHeroLines } from "@/lib/website-text-shared";
import { useLocalizedHref, usePublicLocale } from "@/hooks/usePublicLocale";
import { ABOUT_COPY } from "@/lib/i18n/about-copy";

function AboutMedia({
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
      className={`ab-media ${className}`}
      data-site-image={image.slot ?? slot}
      style={
        ratio ? ({ ["--ab-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 70vw"
        quality={SITE_IMAGE_QUALITY}
        className="ab-media__image"
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
    <div className={`ab-flip ab-flip--${axis} ${className}`} data-ab-flip>
      <AboutMedia slot={front} alt={frontAlt} className="ab-flip__base" ratio={ratio} />
      <AboutMedia slot={back} alt={backAlt} className="ab-flip__overlay" ratio={ratio} />
    </div>
  );
}

function Scene({
  className = "",
  children,
  ...props
}: ComponentPropsWithoutRef<"section">) {
  return (
    <section className={`ab-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

/*
 * The numbered manifesto rows: a giant word, a number, a narrow column of
 * copy. Words come from ABOUT_COPY.principles, in this order.
 */
const PRINCIPLES = [
  { number: "01", count: "08", slot: "room-luxury" },
  { number: "02", count: "02", slot: "room-suite" },
  { number: "03", count: "02", slot: "room-royal" },
] as const;

/*
 * Full-panel wall cards: four data points pinned to the corners of the frame.
 * Words come from ABOUT_COPY.stays, in this order.
 */
const STAYS = [
  {
    number: "01",
    /* The gallery views, so the wall cards do not repeat the deck panels. */
    slot: "scraped-cabin-3",
    href: "/rooms",
    tone: "cream",
  },
  {
    number: "02",
    slot: "scraped-luxsuite-2",
    href: "/luxury-cabins-Nile-Cruise",
    tone: "ink",
  },
  {
    number: "03",
    slot: "scraped-royal-2",
    href: "/royal-suites",
    tone: "gold",
  },
] as const;

export function AboutPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const t = ABOUT_COPY[usePublicLocale()];
  const localHref = useLocalizedHref();
  const { pages } = useWebsiteText();
  const about = pages.about;
  const typography = useTypographySettings();
  const aboutHero = resolveHeroPageCopy(typography, "about");
  const aboutHeroLines = stackedHeroLines(aboutHero.main, aboutHero.second);
  const aboutLineClass = ["ab-line--a", "ab-line--b", "ab-line--c"] as const;
  useAboutEditorialFlow({ rootRef, runRef, trackRef });

  const lead = about.intro[0] ?? ABOUT_PAGE.intro[0];
  const second = about.intro[1] ?? ABOUT_PAGE.intro[1];

  return (
    <div ref={rootRef} className="about-boring">
      <div className="ab-progress" aria-hidden="true">
        <i data-ab-progress />
      </div>

      <main>
        <section ref={runRef} className="ab-run" aria-label={t.runLabel}>
          <div className="ab-stage">
            <div ref={trackRef} className="ab-track">
              {/* 01 — Intro: a ragged three-part display setting */}
              <Scene className="ab-intro">
                <nav className="ab-intro__nav" aria-label={t.navLabel}>
                  <a href="#about">{t.nav.about}</a>
                  <a href="#stay">{t.nav.stay}</a>
                  <Link href={localHref("/gastronomy")}>{t.nav.dining}</Link>
                  <a href="#reserve">{t.nav.reserve}</a>
                </nav>

                <div className="ab-intro__inner">
                  <div className="ab-intro__title" id="about">
                    <h1 className="ab-display ab-display--xl wt-page-hero">
                      {aboutHeroLines.map((line, index) => (
                        <span
                          key={`${line}-${index}`}
                          className={`ab-line ${aboutLineClass[index] ?? ""}`}
                        >
                          {line}
                        </span>
                      ))}
                    </h1>
                  </div>

                  <p className="ab-intro__body wt-page-body">
                    {about.heroSupport.trim() || ABOUT_PAGE.hero.subtitle}
                  </p>
                </div>

                <p className="ab-intro__mark">
                  Hathor Cruise <span className="ab-reg">®</span> 2026
                </p>
                <p className="ab-intro__scroll">
                  <i />
                  {t.scroll}
                </p>
              </Scene>

              {/* 02 — Image lead with an overlapping second frame */}
              <Scene className="ab-lead">
                <AboutMedia
                  slot="about-hero"
                  alt={t.alts.hero}
                  priority
                  className="ab-lead__main"
                />
                <FlipImage
                  className="ab-lead__inset"
                  axis="left"
                  ratio="835 / 557"
                  front="room-suite"
                  back="about-dining"
                  frontAlt={t.alts.suite}
                  backAlt={t.alts.dining}
                />
                <p className="ab-lead__caption">{t.leadCaption}</p>
              </Scene>

              {/* 03 — Manifesto */}
              <Scene className="ab-manifesto">
                <div className="ab-manifesto__aside">
                  <p className="ab-meta-copy">{lead}</p>
                </div>
                <div className="ab-manifesto__headline" data-anima-title>
                  <h2 className="ab-edit ab-edit--xl">
                    <span className="ab-line">
                      <AnimaSplitLine line={0}>{t.manifesto[0]}</AnimaSplitLine>
                    </span>
                    <span className="ab-line">
                      <AnimaSplitLine line={1}>{t.manifesto[1]}</AnimaSplitLine>
                    </span>
                    <span className="ab-line">
                      <AnimaSplitLine line={2}>{t.manifesto[2]}</AnimaSplitLine>
                    </span>
                    <span className="ab-line ab-line--indent">
                      <AnimaSplitLine line={3}>{t.manifesto[3]}</AnimaSplitLine>
                    </span>
                  </h2>
                </div>
              </Scene>

              {/* 04 — Collage: two unequal tiles, deliberately off-grid */}
              <Scene className="ab-collage">
                <FlipImage
                  className="ab-collage__tile ab-collage__tile--one"
                  axis="up"
                  ratio="668 / 554"
                  front="home-story-way-of-life"
                  back="home-cinematic-still"
                  frontAlt={t.alts.life}
                  backAlt={t.alts.river}
                />
                <FlipImage
                  className="ab-collage__tile ab-collage__tile--two"
                  axis="right"
                  ratio="1090 / 960"
                  front="home-story-craft-large"
                  back="scraped-cabin-1"
                  frontAlt={t.alts.craft}
                  backAlt={t.alts.cabin}
                />
                <p className="ab-collage__copy ab-meta-copy">{second}</p>
              </Scene>

              {/* 05 — Numbered manifesto: giant word, number, narrow copy */}
              <Scene className="ab-principles" id="stay">
                <div className="ab-principles__head">
                  <p className="ab-display ab-display--l">
                    {about.accommodationsTitle}
                  </p>
                  <p className="ab-meta-copy">{about.accommodationsIntro}</p>
                </div>

                <ol className="ab-principles__list">
                  {PRINCIPLES.map((item, index) => (
                    <li className="ab-principle" key={item.number}>
                      <span className="ab-principle__num">{item.number}</span>
                      <h3 className="ab-principle__word ab-display">
                        {t.principles[index].title}
                      </h3>
                      <p className="ab-principle__count ab-edit">{item.count}</p>
                      <p className="ab-principle__copy">{t.principles[index].text}</p>
                      <AboutMedia
                        slot={item.slot}
                        alt={t.aboardAlt(t.principles[index].title)}
                        className="ab-principle__peek"
                        ratio="4 / 5"
                      />
                    </li>
                  ))}
                </ol>
              </Scene>

              {/* 06 — Wall cards: one full-panel wash each, data at the corners */}
              {STAYS.map((stay, index) => (
                <Scene
                  className={`ab-card ab-card--${stay.tone}`}
                  key={stay.number}
                >
                  <div className="ab-card__frame">
                    <AboutMedia
                      slot={stay.slot}
                      alt={t.aboardAlt(t.stays[index].title)}
                      className="ab-card__media"
                      ratio="1279 / 820"
                    />

                    <div className="ab-card__plate">
                      <span className="ab-card__corner ab-card__corner--tl ab-edit">
                        {t.stays[index].meta}
                      </span>
                      <span className="ab-card__corner ab-card__corner--tr">
                        {t.stays[index].place}
                      </span>

                      <h2 className="ab-card__title ab-display" data-anima-title>
                        {t.stays[index].title}
                      </h2>

                      <span className="ab-card__corner ab-card__corner--bl">
                        {stay.number}
                      </span>
                      <Link
                        className="ab-btn ab-card__corner ab-card__corner--br"
                        href={localHref(stay.href)}
                      >
                        <span>{t.experience}</span>
                      </Link>
                    </div>
                  </div>
                </Scene>
              ))}

              {/* 07 — Dining: stacked media against a display statement */}
              <Scene className="ab-dining">
                <div className="ab-dining__media">
                  <AboutMedia
                    slot="gastronomy-restaurant"
                    alt={t.alts.restaurant}
                    className="ab-dining__main"
                    ratio="1090 / 960"
                  />
                  <FlipImage
                    className="ab-dining__stack"
                    axis="left"
                    ratio="668 / 554"
                    front="gastronomy-wine"
                    back="about-dining"
                    frontAlt={t.alts.bar}
                    backAlt={t.alts.fineDining}
                  />
                </div>

                <div className="ab-dining__copy">
                  <div data-anima-title>
                    <h2 className="ab-edit ab-edit--l">
                      <span className="ab-line">
                        <AnimaSplitLine line={0}>{about.diningTitle}</AnimaSplitLine>
                      </span>
                      <span className="ab-line">
                        <AnimaSplitLine line={1}>{t.diningLines[0]}</AnimaSplitLine>
                      </span>
                      <span className="ab-line">
                        <AnimaSplitLine line={2}>{t.diningLines[1]}</AnimaSplitLine>
                      </span>
                      <span className="ab-line ab-line--indent">
                        <AnimaSplitLine line={3}>{t.diningLines[2]}</AnimaSplitLine>
                      </span>
                    </h2>
                  </div>
                  <p className="ab-meta-copy wt-page-body">
                    {about.diningIntro.trim() || ABOUT_PAGE.diningPromo.body}
                  </p>
                  <Link href={localHref("/gastronomy")} className="ab-btn">
                    <span>{t.exploreDining}</span>
                  </Link>
                </div>
              </Scene>

              {/* 08 — Closing frame */}
              <Scene className="ab-closing">
                <FlipImage
                  className="ab-closing__media"
                  axis="up"
                  ratio="1483 / 960"
                  front="home-story-legacy-large"
                  back="home-split-courtyard"
                  frontAlt={t.alts.legacy}
                  backAlt={t.alts.deck}
                />
                <div className="ab-closing__copy">
                  <p className="ab-display ab-display--l wt-page-title">
                    {about.welcomeTitle.trim() || t.welcomeFallback}
                  </p>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue — always vertical, on the deepest wash */}
        <section className="ab-epilogue" id="reserve">
          <header className="ab-epilogue__head">
            <h2 className="ab-display ab-display--xl" data-anima-title>
              <span className="ab-line">
                <AnimaSplitLine line={0}>{t.epilogue[0]}</AnimaSplitLine>
              </span>
              <span className="ab-line ab-line--indent">
                <AnimaSplitLine line={1}>{t.epilogue[1]}</AnimaSplitLine>
              </span>
            </h2>
          </header>

          <div className="ab-epilogue__pair">
            <AboutMedia
              slot="room-royal"
              alt={t.alts.royalExperience}
              ratio="668 / 554"
            />
            <AboutMedia
              slot="about-dining"
              alt={t.alts.diningExperience}
              ratio="668 / 720"
            />
          </div>

          <div className="ab-epilogue__board">
            <div className="ab-epilogue__statement">
              <p className="ab-edit ab-edit--l">{about.welcomeBody}</p>
              <div className="ab-epilogue__pills">
                <BookNowTrigger className="ab-btn ab-btn--solid">
                  <span>{t.bookNow}</span>
                </BookNowTrigger>
                <Link href={localHref("/cruises-list")} className="ab-btn">
                  <span>{t.exploreCruises}</span>
                </Link>
              </div>
              <p className="ab-meta-copy">{about.diningOutro}</p>
            </div>

            <aside className="ab-epilogue__card">
              <AboutMedia
                slot="about-hero"
                alt={t.alts.card}
                className="ab-epilogue__card-media"
                ratio="356 / 460"
              />
              <h3 className="ab-display">{t.cardTitle}</h3>
              <p className="ab-epilogue__card-body">
                {t.cardBody[0]}
                <br />
                {t.cardBody[1]}
              </p>
              <div className="ab-epilogue__card-links">
                <a
                  className="ab-link"
                  href="https://www.instagram.com/hathorcruise/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <a
                  className="ab-link"
                  href="mailto:reservations@hathorcruise.com"
                >
                  reservations@hathorcruise.com
                </a>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
