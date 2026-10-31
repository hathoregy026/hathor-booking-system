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
import { useHighlightsEditorialScroll } from "@/hooks/useHighlightsEditorialScroll";
import {
  extractHighlightsPullQuote,
  HIGHLIGHTS_JOURNEY_LINKS,
  HIGHLIGHTS_LANDMARK_META,
  HIGHLIGHTS_MANIFESTO,
  layoutHighlightsIntro,
} from "@/lib/highlights-content";
import { useLocalizedHref, usePublicLocale } from "@/hooks/usePublicLocale";
import { HIGHLIGHTS_COPY } from "@/lib/i18n/highlights-copy";
import { HIGHLIGHTS_PAGE } from "@/lib/page-content";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import { stackedHeroLines } from "@/lib/website-text-shared";

function HighlightsMedia({
  slot,
  alt,
  priority = false,
  className = "",
  ratio,
  objectPosition,
  sizes = "(max-width: 950px) 100vw, 70vw",
}: {
  slot: string;
  alt: string;
  priority?: boolean;
  className?: string;
  ratio?: string;
  objectPosition?: string;
  sizes?: string;
}) {
  const image = useSiteImage(slot);
  return (
    <figure
      className={`hl-media ${className}`}
      data-site-image={image.slot ?? slot}
      style={
        {
          ...(ratio ? { ["--hl-ratio" as string]: ratio } : {}),
        } as CSSProperties
      }
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes={sizes}
        quality={SITE_IMAGE_QUALITY}
        className="hl-media__image"
        style={objectPosition ? { objectPosition } : undefined}
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
  priority = false,
  objectPosition,
}: {
  front: string;
  back: string;
  frontAlt: string;
  backAlt?: string;
  className?: string;
  axis?: "up" | "left" | "right";
  ratio?: string;
  priority?: boolean;
  objectPosition?: string;
}) {
  return (
    <div className={`hl-flip hl-flip--${axis} ${className}`} data-hl-flip>
      <HighlightsMedia
        slot={front}
        alt={frontAlt}
        className="hl-flip__base"
        ratio={ratio}
        priority={priority}
        objectPosition={objectPosition}
      />
      <HighlightsMedia
        slot={back}
        alt={backAlt}
        className="hl-flip__overlay"
        ratio={ratio}
        objectPosition={objectPosition}
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
    <section className={`hl-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

/* Three beats of life aboard; words come from HIGHLIGHTS_COPY.life, in this order. */
const LIFE_ABOARD = [
  { number: "01", slot: "gastronomy-restaurant" },
  { number: "02", slot: "room-royal" },
  { number: "03", slot: "highlights-lifestyle" },
] as const;

/* Dawn to night; words come from HIGHLIGHTS_COPY.rhythm, in this order. */
const RIVER_RHYTHM = ["01", "02", "03", "04"] as const;

/* Section anchors; labels come from HIGHLIGHTS_COPY.nav, in this order. */
const SECTIONS = ["#highlights", "#landmarks", "#aboard", "#reserve"] as const;

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const t = HIGHLIGHTS_COPY[usePublicLocale()];
  const localHref = useLocalizedHref();
  const { pages } = useWebsiteText();
  const highlights = pages.highlights;
  const typography = useTypographySettings();
  const highlightsHero = resolveHeroPageCopy(typography, "highlights");
  const highlightsHeroLines = stackedHeroLines(
    highlightsHero.main,
    highlightsHero.second,
  );
  const lineClass = ["hl-line--a", "hl-line--b", "hl-line--c"] as const;
  useHighlightsEditorialScroll({ rootRef, runRef, trackRef });

  const introLayout = layoutHighlightsIntro(highlights.intro);
  const introLead = t.intro?.lead ?? introLayout.lead;
  const pullQuote = t.intro?.quote ?? extractHighlightsPullQuote(highlights.intro);
  const collageCopy =
    t.intro?.collage ??
    (introLayout.groups.flat().slice(0, 2).join(" ") || HIGHLIGHTS_PAGE.intro[1]);

  const landmarks = highlights.landmarks.map((landmark, index) => {
    const meta = HIGHLIGHTS_LANDMARK_META[index]!;
    const tones = ["cream", "ink", "gold"] as const;
    return {
      ...landmark,
      meta,
      words: t.landmarks[index],
      tone: tones[index] ?? "cream",
      number: String(index + 1).padStart(2, "0"),
    };
  });

  return (
    <div ref={rootRef} className="highlights-editorial">
      <div className="hl-progress" aria-hidden="true">
        <i data-hl-progress />
      </div>

      <main>
        <section
          ref={runRef}
          className="hl-run"
          aria-label={t.runLabel}
        >
          <div className="hl-stage">
            <div ref={trackRef} className="hl-track">
              {/* 01 — Editorial introduction */}
              <Scene className="hl-intro">
                <nav
                  className="hl-intro__nav"
                  aria-label={t.navLabel}
                >
                  {SECTIONS.map((href, index) => (
                    <a key={href} href={href}>
                      {t.nav[index]}
                    </a>
                  ))}
                </nav>

                <div className="hl-intro__text">
                  <div className="hl-intro__copy">
                    <div
                      className="hl-intro__title"
                      id="highlights"
                      data-anima-title
                    >
                      <h1 className="hl-display hl-display--xl wt-page-hero">
                        {highlightsHeroLines.map((line, index) => (
                          <span
                            key={`${line}-${index}`}
                            className={`hl-line ${lineClass[index] ?? ""}`}
                          >
                            <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                          </span>
                        ))}
                      </h1>
                    </div>
                  </div>

                  <p className="hl-intro__body wt-page-body">
                    {introLead}
                  </p>
                </div>

                <div className="hl-intro__hero">
                  <HighlightsMedia
                    slot="highlights-lifestyle"
                    alt={t.alts.guests}
                    priority
                    className="hl-intro__portrait"
                    ratio="3 / 4"
                    objectPosition="50% 18%"
                    sizes="(max-width: 950px) 92vw, 42vw"
                  />
                </div>

                <div className="hl-intro__bar">
                  <p className="hl-intro__mark">
                    Hathor Cruise <span className="hl-reg">®</span> 2026
                  </p>
                  <p className="hl-intro__scroll">
                    <i />
                    {t.scroll}
                  </p>
                </div>
              </Scene>

              {/* 02 — Image lead */}
              <Scene className="hl-lead">
                <HighlightsMedia
                  slot="highlights-hero"
                  alt={t.alts.lead}
                  className="hl-lead__main"
                  ratio="16 / 10"
                  objectPosition="50% 42%"
                />
                <FlipImage
                  className="hl-lead__inset"
                  axis="left"
                  ratio="835 / 557"
                  front="landmark-hatshepsut"
                  back="landmark-obelisk"
                  frontAlt={t.alts.hatshepsut}
                  backAlt={t.alts.obelisk}
                />
                <p className="hl-lead__caption">{t.leadCaption}</p>
              </Scene>

              {/* 03 — Manifesto */}
              <Scene className="hl-manifesto">
                <div className="hl-manifesto__aside">
                  <p className="hl-meta-copy">{pullQuote}</p>
                </div>
                <div className="hl-manifesto__headline" data-anima-title>
                  <h2 className="hl-edit hl-edit--xl">
                    <span className="hl-line">
                      <AnimaSplitLine line={0}>{t.manifesto[0]}</AnimaSplitLine>
                    </span>
                    <span className="hl-line">
                      <AnimaSplitLine line={1}>{t.manifesto[1]}</AnimaSplitLine>
                    </span>
                    <span className="hl-line hl-line--indent">
                      <AnimaSplitLine line={2}>{t.manifesto[2]}</AnimaSplitLine>
                    </span>
                  </h2>
                </div>
              </Scene>

              {/* 04 — Collage */}
              <Scene className="hl-collage">
                <FlipImage
                  className="hl-collage__tile hl-collage__tile--one"
                  axis="up"
                  ratio="668 / 554"
                  front="charter-rhythm"
                  back="charter-privacy"
                  frontAlt={t.alts.rhythm}
                  backAlt={t.alts.deck}
                />
                <FlipImage
                  className="hl-collage__tile hl-collage__tile--two"
                  axis="right"
                  ratio="1090 / 960"
                  front="landmark-obelisk"
                  back="highlights-lifestyle"
                  frontAlt={t.alts.obelisk}
                  backAlt={t.alts.life}
                />
                <p className="hl-collage__copy hl-meta-copy">{collageCopy}</p>
              </Scene>

              {/* 05 — Shore slides: three landmark frames wipe as the scene travels */}
              <Scene className="hl-slides" aria-label={t.slidesLabel}>
                <div className="hl-slides__copy">
                  <p className="hl-display hl-display--l">{t.ashore}</p>
                  <p className="hl-meta-copy">{t.ashoreBody}</p>
                </div>
                <div className="hl-slides__stage">
                  <HighlightsMedia
                    slot="landmark-obelisk"
                    alt={t.landmarks[0].caption}
                    className="hl-slides__layer hl-slides__layer--0"
                    ratio="4 / 5"
                    objectPosition="50% 45%"
                  />
                  <HighlightsMedia
                    slot="landmark-hatshepsut"
                    alt={t.landmarks[1].caption}
                    className="hl-slides__layer hl-slides__layer--1"
                    ratio="4 / 5"
                    objectPosition="50% 40%"
                  />
                  <HighlightsMedia
                    slot="landmark-valley-kings"
                    alt={t.landmarks[2].caption}
                    className="hl-slides__layer hl-slides__layer--2"
                    ratio="4 / 5"
                    objectPosition="50% 50%"
                  />
                </div>
                <ol className="hl-slides__index">
                  <li>{t.slidesIndex[0]}</li>
                  <li>{t.slidesIndex[1]}</li>
                  <li>{t.slidesIndex[2]}</li>
                </ol>
              </Scene>

              {/* 06 — Numbered principles (manifesto pillars) */}
              <Scene className="hl-principles" id="pillars">
                <div className="hl-principles__head">
                  <p className="hl-display hl-display--l">{t.notesTitle}</p>
                  <p className="hl-meta-copy">{t.notesBody}</p>
                </div>

                <ol className="hl-principles__list">
                  {HIGHLIGHTS_MANIFESTO.map((item, index) => {
                    const note = t.notes[index] ?? { title: item.title, body: item.body };
                    const peekSlots = [
                      "highlights-lifestyle",
                      "landmark-hatshepsut",
                      "room-royal",
                    ] as const;
                    return (
                      <li className="hl-principle" key={item.numeral}>
                        <span className="hl-principle__num">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="hl-principle__word hl-display">
                          {note.title}
                        </h3>
                        <p className="hl-principle__count hl-edit">
                          {item.numeral}
                        </p>
                        <p className="hl-principle__copy">{note.body}</p>
                        <HighlightsMedia
                          slot={peekSlots[index] ?? "highlights-lifestyle"}
                          alt={t.noteAlt(note.title)}
                          className="hl-principle__peek"
                          ratio="4 / 5"
                        />
                      </li>
                    );
                  })}
                </ol>
              </Scene>

              {/* 06 — Landmark museum wall cards */}
              {landmarks.map((landmark) => (
                <Scene
                  className={`hl-card hl-card--${landmark.tone}`}
                  key={landmark.meta.slot}
                  id={
                    landmark.meta.slot === "landmark-obelisk"
                      ? "landmarks"
                      : undefined
                  }
                >
                  <div className="hl-card__frame">
                    <HighlightsMedia
                      slot={landmark.meta.slot}
                      alt={landmark.words?.caption ?? landmark.meta.caption}
                      className="hl-card__media"
                      ratio="1279 / 820"
                      objectPosition={landmark.meta.objectPosition}
                    />

                    <div className="hl-card__plate">
                      <span className="hl-card__corner hl-card__corner--tl hl-edit">
                        {landmark.words?.category ?? landmark.meta.category}
                      </span>
                      <span className="hl-card__corner hl-card__corner--tr">
                        {landmark.words?.location ?? landmark.meta.location}
                      </span>

                      <h2
                        className="hl-card__title hl-display"
                        data-anima-title
                      >
                        {landmark.words?.title ?? landmark.title}
                      </h2>

                      <span className="hl-card__corner hl-card__corner--bl">
                        {landmark.number}
                      </span>
                      <a
                        className="hl-btn hl-card__corner hl-card__corner--br"
                        href="#reserve"
                      >
                        <span>{t.theVoyage}</span>
                      </a>
                    </div>
                  </div>
                </Scene>
              ))}

              {/* 08 — Life aboard: three staggered beats */}
              <Scene className="hl-aboard" id="aboard">
                <div className="hl-aboard__head">
                  <h2 className="hl-edit hl-edit--l">{t.aboardTitle}</h2>
                  <p className="hl-meta-copy">{t.aboardBody}</p>
                </div>
                <div className="hl-aboard__row">
                  {LIFE_ABOARD.map((item, index) => {
                    const backs = [
                      "charter-privacy",
                      "room-suite",
                      "home-voyage-nile-majesty",
                    ] as const;
                    const axes = ["left", "up", "right"] as const;
                    const axis = axes[index] ?? "left";
                    const beat = t.life[index];
                    return (
                      <article className="hl-aboard__item" key={item.number}>
                        <FlipImage
                          className="hl-aboard__media"
                          axis={axis}
                          ratio="4 / 5"
                          front={item.slot}
                          back={backs[index] ?? "charter-privacy"}
                          frontAlt={t.aboardAlt(beat.title)}
                          backAlt={t.aboardBackAlts?.[index]}
                        />
                        <span className="hl-aboard__num">{item.number}</span>
                        <h3 className="hl-aboard__title hl-display">
                          {beat.title}
                        </h3>
                        <p className="hl-aboard__copy">{beat.text}</p>
                      </article>
                    );
                  })}
                </div>
                <Link href={localHref("/gastronomy")} className="hl-btn">
                  <span>{t.exploreDining}</span>
                </Link>
              </Scene>

              {/* 08 — River rhythm ledger */}
              <Scene className="hl-principles" id="rhythm">
                <div className="hl-principles__head">
                  <p className="hl-display hl-display--l">{t.rhythmTitle}</p>
                  <p className="hl-meta-copy">{t.rhythmBody}</p>
                </div>

                <ol className="hl-principles__list">
                  {RIVER_RHYTHM.map((number, index) => {
                    const item = t.rhythm[index];
                    return (
                      <li className="hl-principle" key={number}>
                        <span className="hl-principle__num">{number}</span>
                        <h3 className="hl-principle__word hl-display">
                          {item.word}
                        </h3>
                        <p className="hl-principle__count hl-edit">{item.meta}</p>
                        <p className="hl-principle__copy">
                          {item.label}. {item.value}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </Scene>

              {/* 09 — Closing frame */}
              <Scene className="hl-closing">
                <FlipImage
                  className="hl-closing__media"
                  axis="up"
                  ratio="1483 / 960"
                  front="landmark-hatshepsut"
                  back="highlights-hero"
                  frontAlt={t.alts.sailing}
                  backAlt={t.alts.sunset}
                />
                <div className="hl-closing__copy">
                  <p className="hl-display hl-display--l wt-page-title">
                    {t.closing}
                  </p>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue */}
        <section className="hl-epilogue" id="reserve">
          <header className="hl-epilogue__head">
            <h2 className="hl-display hl-display--xl" data-anima-title>
              <span className="hl-line">
                <AnimaSplitLine line={0}>{t.epilogue[0]}</AnimaSplitLine>
              </span>
              <span className="hl-line hl-line--indent">
                <AnimaSplitLine line={1}>{t.epilogue[1]}</AnimaSplitLine>
              </span>
            </h2>
          </header>

          <div className="hl-epilogue__pair">
            <HighlightsMedia
              slot="landmark-valley-kings"
              alt={t.alts.valley}
              ratio="668 / 554"
            />
            <HighlightsMedia
              slot="room-royal"
              alt={t.alts.royal}
              ratio="668 / 720"
            />
          </div>

          <div className="hl-epilogue__board">
            <div className="hl-epilogue__statement">
              <p className="hl-edit hl-edit--l">{t.statement}</p>
              <div className="hl-epilogue__pills">
                <BookNowTrigger className="hl-btn hl-btn--solid">
                  <span>{t.bookNow}</span>
                </BookNowTrigger>
                <Link href={localHref("/charter")} className="hl-btn">
                  <span>{t.privateCharter}</span>
                </Link>
              </div>
              <ul className="hl-epilogue__journey">
                {HIGHLIGHTS_JOURNEY_LINKS.map((link, index) => (
                  <li key={link.href + link.label}>
                    <Link className="hl-link" href={localHref(link.href)}>
                      {t.journeys[index]?.label ?? link.label}
                    </Link>
                    {" — "}
                    {t.journeys[index]?.body ?? link.body}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="hl-epilogue__card">
              <HighlightsMedia
                slot="highlights-hero"
                alt={t.alts.card}
                className="hl-epilogue__card-media"
                ratio="356 / 460"
              />
              <h3 className="hl-display">{t.cardTitle}</h3>
              <p className="hl-epilogue__card-body">
                {t.cardBody[0]}
                <br />
                {t.cardBody[1]}
              </p>
              <div className="hl-epilogue__card-links">
                <Link className="hl-link" href={localHref("/cruises-list")}>
                  {t.exploreCruises}
                </Link>
                <a
                  className="hl-link"
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
