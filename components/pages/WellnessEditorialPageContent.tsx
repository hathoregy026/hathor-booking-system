"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useRef,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { AnimaSplitLine } from "@/components/public/AnimaSplitLine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { useWellnessEditorialScroll } from "@/hooks/useWellnessEditorialScroll";
import { WELLNESS_PAGE } from "@/lib/page-content";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import { SITE_IMAGE_QUALITY } from "@/lib/site-image-quality";
import { originSrcForNextImage } from "@/lib/local-optimized-site-images";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";
import { stackedHeroLines } from "@/lib/website-text-shared";
import { useLocalizedHref, usePublicLocale } from "@/hooks/usePublicLocale";
import { WELLNESS_COPY } from "@/lib/i18n/wellness-copy";

function WellnessMedia({
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
      className={`we-media ${className}`}
      data-site-image={image.slot ?? slot}
      style={
        ratio ? ({ ["--we-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={originSrcForNextImage(image.src)}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 70vw"
        quality={SITE_IMAGE_QUALITY}
        className="we-media__image"
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
    <div className={`we-flip we-flip--${axis} ${className}`} data-we-flip>
      <WellnessMedia
        slot={front}
        alt={frontAlt}
        className="we-flip__base"
        ratio={ratio}
      />
      <WellnessMedia
        slot={back}
        alt={backAlt}
        className="we-flip__overlay"
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
    <section className={`we-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="we-eyebrow">{children}</p>;
}

/** Break a title into short display lines without splitting words. */
function splitDisplayLines(text: string, maxWords = 3): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return [words.join(" ")];
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += maxWords) {
    lines.push(words.slice(i, i + maxWords).join(" "));
  }
  return lines;
}

/* The four rituals; their words come from WELLNESS_COPY.rituals, in this order. */
const RITUALS = [
  { number: "01", slot: "wellness-hero" },
  { number: "02", slot: "home-story-craft-large" },
  { number: "03", slot: "room-suite" },
  { number: "04", slot: "room-royal" },
] as const;

/* Chapter anchors; labels come from WELLNESS_COPY.index, in this order. */
const INDEX = ["#seneb", "#rituals", "#historia", "#reserve"] as const;

export function WellnessEditorialPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const t = WELLNESS_COPY[usePublicLocale()];
  const localHref = useLocalizedHref();
  const { pages } = useWebsiteText();
  const wellness = pages.wellness;
  const typography = useTypographySettings();
  const wellnessHero = resolveHeroPageCopy(typography, "wellness");
  const wellnessHeroLines = stackedHeroLines(
    wellnessHero.main,
    wellnessHero.second,
  ).flatMap((line) => splitDisplayLines(line, 3));
  const lineClass = [
    "we-line--a",
    "we-line--b",
    "we-line--c",
    "we-line--d",
  ] as const;
  useWellnessEditorialScroll({ rootRef, runRef, trackRef });

  const introBody = wellness.heroSupport.trim() || t.introFallback;

  const spaTitle = wellness.spaTitle.trim() || WELLNESS_PAGE.spa.title;
  const spaTitleLines = splitDisplayLines(spaTitle, 3);
  const spaParagraphs =
    wellness.spaParagraphs.filter((p) => p.trim()).length > 0
      ? wellness.spaParagraphs.filter((p) => p.trim())
      : [...WELLNESS_PAGE.spa.paragraphs];
  const fitnessTitle =
    wellness.fitnessTitle.trim() || WELLNESS_PAGE.fitness.title;
  const fitnessBody =
    wellness.fitnessBody.trim() || WELLNESS_PAGE.fitness.body;

  return (
    <div ref={rootRef} className="wellness-editorial">
      <div className="we-progress" aria-hidden="true">
        <i data-we-progress />
      </div>

      <main>
        <section
          ref={runRef}
          className="we-run"
          aria-label={t.runLabel}
        >
          <div className="we-stage">
            <div ref={trackRef} className="we-track">
              {/* 01 — Threshold with portrait media */}
              <Scene className="we-threshold">
                <ol className="we-threshold__index" aria-label={t.indexLabel}>
                  {INDEX.map((href, i) => (
                    <li key={href}>
                      <a href={href}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        {t.index[i]}
                      </a>
                    </li>
                  ))}
                </ol>

                <div className="we-threshold__field">
                  <Eyebrow>{t.eyebrow}</Eyebrow>
                  <div
                    className="we-threshold__title"
                    id="wellness"
                    data-anima-title
                  >
                    <h1 className="we-display we-display--xl wt-page-hero">
                      {wellnessHeroLines.map((line, index) => (
                        <span
                          key={`${line}-${index}`}
                          className={`we-line ${lineClass[index] ?? "we-line--a"}`}
                        >
                          <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                        </span>
                      ))}
                    </h1>
                  </div>
                  <p className="we-threshold__body wt-page-body">{introBody}</p>
                </div>

                <WellnessMedia
                  slot="wellness-hero"
                  alt={t.alt("Seneb Spa aboard Hathor Dahabiya")}
                  priority
                  className="we-threshold__media"
                  ratio="3 / 4"
                />

                <p className="we-threshold__mark">
                  {t.route[0]} <i /> {t.route[1]}
                </p>
                <p className="we-threshold__cue">
                  {t.cue}
                  <i />
                </p>
              </Scene>

              {/* 02 — Inhale with flip pair */}
              <Scene className="we-inhale">
                <FlipImage
                  className="we-inhale__media"
                  axis="left"
                  ratio="3 / 4"
                  front="wellness-fitness"
                  back="home-call-to-action"
                  frontAlt={t.alt("Seneb Spa aboard Hathor")}
                  backAlt={t.alt("Open-air calm on the Nile deck")}
                />
                <p className="we-inhale__lyric we-edit">
                  {t.lyric[0]}
                  <em>{t.lyric[1]}</em>
                  {t.lyric[2]}
                </p>
              </Scene>

              {/* 03 — Seneb immersive */}
              <Scene className="we-seneb" id="seneb">
                <div className="we-seneb__visual">
                  <WellnessMedia
                    slot="wellness-hero"
                    alt={t.alt("Restorative spa treatments aboard Hathor")}
                    className="we-seneb__main"
                    ratio="1279 / 960"
                  />
                  <FlipImage
                    className="we-seneb__inset"
                    axis="up"
                    ratio="668 / 554"
                    front="room-suite"
                    back="wellness-fitness"
                    frontAlt={t.alt("Suite rest aboard Hathor")}
                    backAlt={t.alt("Historia Fitness overlooking the Nile")}
                  />
                </div>

                <div className="we-seneb__plane">
                  <Eyebrow>Seneb Spa</Eyebrow>
                  <h2 className="we-display we-display--l" data-anima-title>
                    {spaTitleLines.map((line, index) => (
                      <span
                        key={`${line}-${index}`}
                        className={`we-line ${index === 1 ? "we-line--indent" : ""}`}
                      >
                        <AnimaSplitLine line={index}>{line}</AnimaSplitLine>
                      </span>
                    ))}
                  </h2>
                  <div className="we-seneb__copy">
                    {spaParagraphs.slice(0, 2).map((paragraph) => (
                      <p key={paragraph.slice(0, 48)} className="we-meta-copy">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                  <WellnessMedia
                    slot="home-story-legacy-large"
                    alt={t.alt("Egyptian character aboard Hathor")}
                    className="we-seneb__accent"
                    ratio="5 / 3"
                  />
                </div>
              </Scene>

              {/* 04 — Ritual catalogue with thumbnails */}
              <Scene className="we-rituals" id="rituals">
                <div className="we-rituals__head">
                  <Eyebrow>{t.ritualsEyebrow}</Eyebrow>
                  <p className="we-meta-copy">{t.ritualsIntro}</p>
                </div>

                <ol className="we-rituals__list">
                  {RITUALS.map((ritual, index) => {
                    const words = t.rituals[index];
                    return (
                      <li key={ritual.number} className="we-rite">
                        <span className="we-rite__num">{ritual.number}</span>
                        <WellnessMedia
                          slot={ritual.slot}
                          alt={t.ritualAlt(words.word)}
                          className="we-rite__media"
                          ratio="1 / 1"
                        />
                        <h3 className="we-rite__word we-display">{words.word}</h3>
                        <div className="we-rite__detail">
                          <p className="we-rite__meta">{words.meta}</p>
                          <p className="we-rite__text">{words.detail}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Scene>

              {/* 05 — Image gallery bridge */}
              <Scene className="we-gallery" aria-label={t.galleryLabel}>
                <FlipImage
                  className="we-gallery__a"
                  axis="up"
                  ratio="4 / 5"
                  front="wellness-fitness"
                  back="home-amenities-13"
                  frontAlt={t.alt("Historia Fitness aboard Hathor")}
                  backAlt={t.alt("Active wellness overlooking the Nile")}
                />
                <WellnessMedia
                  slot="room-luxury"
                  alt={t.alt("Luxury cabin repose aboard Hathor")}
                  className="we-gallery__b"
                  ratio="5 / 4"
                />
                <FlipImage
                  className="we-gallery__c"
                  axis="left"
                  ratio="3 / 4"
                  front="home-story-way-of-life"
                  back="home-split-courtyard"
                  frontAlt={t.alt("Life aboard Hathor")}
                  backAlt={t.alt("Deck living aboard Hathor")}
                />
              </Scene>

              {/* 06 — Historia framed datum */}
              <Scene className="we-historia" id="historia">
                <div className="we-historia__frame">
                  <span className="we-historia__corner we-historia__corner--tl">
                    {t.historia.tl}
                  </span>
                  <span className="we-historia__corner we-historia__corner--tr">
                    {t.historia.tr}
                  </span>

                  <p className="we-historia__datum we-edit">
                    <span>360</span>
                    <i>°</i>
                  </p>

                  <h2 className="we-historia__title we-display">{fitnessTitle}</h2>
                  <p className="we-historia__body we-meta-copy">{fitnessBody}</p>

                  <span className="we-historia__corner we-historia__corner--bl">
                    {t.historia.bl}
                  </span>
                  <span className="we-historia__corner we-historia__corner--br">
                    {t.historia.br}
                  </span>
                </div>

                <div className="we-historia__media-col">
                  <WellnessMedia
                    slot="wellness-fitness"
                    alt={t.alt("Historia Fitness Center with panoramic Nile views")}
                    className="we-historia__media"
                    ratio="4 / 5"
                  />
                  <WellnessMedia
                    slot="home-call-to-action"
                    alt={t.alt("River light from the fitness deck")}
                    className="we-historia__media we-historia__media--small"
                    ratio="5 / 3"
                  />
                </div>
              </Scene>

              {/* 07 — Asymmetric visual essay */}
              <Scene className="we-essay">
                <div className="we-essay__stack">
                  <FlipImage
                    className="we-essay__tall"
                    axis="left"
                    ratio="3 / 4"
                    front="wellness-fitness"
                    back="home-voyage-nile-majesty"
                    frontAlt={t.alt("Movement aboard Hathor")}
                    backAlt={t.alt("Sailing the Nile aboard Hathor")}
                  />
                  <WellnessMedia
                    slot="room-royal"
                    alt={t.alt("Royal Suite repose aboard Hathor")}
                    className="we-essay__wide"
                    ratio="5 / 3"
                  />
                  <WellnessMedia
                    slot="home-story-craft-large"
                    alt={t.alt("Crafted detail aboard Hathor")}
                    className="we-essay__peek"
                    ratio="1 / 1"
                  />
                </div>
                <div className="we-essay__copy">
                  <Eyebrow>{t.essayEyebrow}</Eyebrow>
                  <div data-anima-title>
                    <h2 className="we-edit we-edit--xl">
                      <span className="we-line">
                        <AnimaSplitLine line={0}>{t.essayLines[0]}</AnimaSplitLine>
                      </span>
                      <span className="we-line we-line--indent">
                        <AnimaSplitLine line={1}>{t.essayLines[1]}</AnimaSplitLine>
                      </span>
                      <span className="we-line">
                        <AnimaSplitLine line={2}>{t.essayLines[2]}</AnimaSplitLine>
                      </span>
                    </h2>
                  </div>
                  <p className="we-meta-copy">{t.essayBody}</p>
                  <Link href={localHref("/suites")} className="we-btn">
                    <span>{t.exploreSuites}</span>
                  </Link>
                </div>
              </Scene>

              {/* 08 — Pulse with image */}
              <Scene className="we-pulse" aria-label={t.pauseLabel}>
                <WellnessMedia
                  slot="home-cinematic-still"
                  alt={t.alt("Quiet river light aboard Hathor")}
                  className="we-pulse__media"
                  ratio="4 / 5"
                />
                <p className="we-pulse__phrase we-edit">
                  {t.pulse[0]}
                  <br />
                  {t.pulse[1]}
                </p>
              </Scene>

              {/* 09 — Closing wipe */}
              <Scene className="we-closing">
                <FlipImage
                  className="we-closing__media"
                  axis="right"
                  ratio="1483 / 960"
                  front="home-voyage-nile-majesty"
                  back="wellness-hero"
                  frontAlt={t.alt("Sailing the Nile aboard Hathor")}
                  backAlt={t.alt("Seneb Spa calm aboard Hathor")}
                />
                <div className="we-closing__copy">
                  <Eyebrow>{t.nextEyebrow}</Eyebrow>
                  <p className="we-display we-display--l">{t.nextTitle}</p>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        <section className="we-epilogue" id="reserve">
          <header className="we-epilogue__head">
            <Eyebrow>{t.reserveEyebrow}</Eyebrow>
            <h2 className="we-display we-display--xl" data-anima-title>
              <span className="we-line">
                <AnimaSplitLine line={0}>{t.reserveLines[0]}</AnimaSplitLine>
              </span>
              <span className="we-line we-line--indent">
                <AnimaSplitLine line={1}>{t.reserveLines[1]}</AnimaSplitLine>
              </span>
            </h2>
          </header>

          <div className="we-epilogue__pair">
            <WellnessMedia
              slot="wellness-fitness"
              alt={t.alt("Historia Fitness aboard Hathor")}
              ratio="668 / 554"
            />
            <WellnessMedia
              slot="wellness-hero"
              alt={t.alt("Seneb Spa aboard Hathor")}
              ratio="668 / 720"
            />
          </div>

          <div className="we-epilogue__board">
            <div className="we-epilogue__statement">
              <p className="we-edit we-edit--l">{t.statement}</p>
              <div className="we-epilogue__pills">
                <BookNowTrigger className="we-btn we-btn--solid">
                  <span>{t.bookNow}</span>
                </BookNowTrigger>
                <Link href={localHref("/contact")} className="we-btn">
                  <span>{t.enquire}</span>
                </Link>
              </div>
              <a
                className="we-link we-meta-copy"
                href={`mailto:${PUBLIC_CONTACT.email}`}
              >
                {PUBLIC_CONTACT.email}
              </a>
            </div>

            <aside className="we-epilogue__card">
              <span className="we-card__tag">{t.cardTag}</span>
              <WellnessMedia
                slot="room-royal"
                alt={t.alt("Royal Suite repose aboard Hathor")}
                className="we-epilogue__card-media"
                ratio="356 / 460"
              />
              <h3 className="we-display">Seneb</h3>
              <p className="we-epilogue__card-body">
                {t.cardBody[0]}
                <br />
                {t.cardBody[1]}
              </p>
              <div className="we-epilogue__card-links">
                <a
                  className="we-link"
                  href="https://www.instagram.com/hathorcruise/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <Link className="we-link" href={localHref("/suites")}>
                  {t.suites}
                </Link>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
