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

const RITUALS = [
  {
    number: "01",
    word: "Massage",
    detail: "Warm-oil recovery after temple days",
    meta: "Seneb · 60–90 min",
    slot: "wellness-hero",
  },
  {
    number: "02",
    word: "Botanical",
    detail: "Egyptian plant therapies for skin and calm",
    meta: "Signature · daily",
    slot: "home-story-craft-large",
  },
  {
    number: "03",
    word: "Recovery",
    detail: "Quieting treatments between shore and sail",
    meta: "Balance · as needed",
    slot: "room-suite",
  },
  {
    number: "04",
    word: "Stillness",
    detail: "Private suite rest as part of the ritual",
    meta: "Cabin · continuous",
    slot: "room-royal",
  },
] as const;

const INDEX = [
  { href: "#seneb", label: "Seneb" },
  { href: "#rituals", label: "Rituals" },
  { href: "#historia", label: "Historia" },
  { href: "#reserve", label: "Reserve" },
] as const;

export function WellnessEditorialPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
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

  const introBody =
    wellness.heroSupport.trim() ||
    "In a world that rarely pauses, Hathor creates time for the body to soften. Seneb Spa, Historia Fitness, and restful suites move with you between Luxor and Aswan.";

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
          aria-label="Hathor wellness on the Nile"
        >
          <div className="we-stage">
            <div ref={trackRef} className="we-track">
              {/* 01 — Threshold with portrait media */}
              <Scene className="we-threshold">
                <ol className="we-threshold__index" aria-label="Wellness chapters">
                  {INDEX.map((item, i) => (
                    <li key={item.href}>
                      <a href={item.href}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ol>

                <div className="we-threshold__field">
                  <Eyebrow>Wellness</Eyebrow>
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
                  alt="Seneb Spa aboard Hathor Dahabiya"
                  priority
                  className="we-threshold__media"
                  ratio="3 / 4"
                />

                <p className="we-threshold__mark">
                  Luxor <i /> Aswan
                </p>
                <p className="we-threshold__cue">
                  Drift
                  <i />
                </p>
              </Scene>

              {/* 02 — Inhale with flip pair */}
              <Scene className="we-inhale">
                <FlipImage
                  className="we-inhale__media"
                  axis="left"
                  ratio="3 / 4"
                  front="wellness-hero"
                  back="home-call-to-action"
                  frontAlt="Seneb Spa aboard Hathor"
                  backAlt="Open-air calm on the Nile deck"
                />
                <p className="we-inhale__lyric we-edit">
                  Health, in the Egyptian sense —
                  <em> seneb </em>
                  as quiet continuity.
                </p>
              </Scene>

              {/* 03 — Seneb immersive */}
              <Scene className="we-seneb" id="seneb">
                <div className="we-seneb__visual">
                  <WellnessMedia
                    slot="wellness-hero"
                    alt="Restorative spa treatments aboard Hathor"
                    className="we-seneb__main"
                    ratio="1279 / 960"
                  />
                  <FlipImage
                    className="we-seneb__inset"
                    axis="up"
                    ratio="668 / 554"
                    front="room-suite"
                    back="wellness-fitness"
                    frontAlt="Suite rest aboard Hathor"
                    backAlt="Historia Fitness overlooking the Nile"
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
                    alt="Egyptian character aboard Hathor"
                    className="we-seneb__accent"
                    ratio="5 / 3"
                  />
                </div>
              </Scene>

              {/* 04 — Ritual catalogue with thumbnails */}
              <Scene className="we-rituals" id="rituals">
                <div className="we-rituals__head">
                  <Eyebrow>Onboard rituals</Eyebrow>
                  <p className="we-meta-copy">
                    Four ways the body returns to itself while the Nile keeps
                    moving.
                  </p>
                </div>

                <ol className="we-rituals__list">
                  {RITUALS.map((ritual) => (
                    <li key={ritual.number} className="we-rite">
                      <span className="we-rite__num">{ritual.number}</span>
                      <WellnessMedia
                        slot={ritual.slot}
                        alt={`${ritual.word} ritual aboard Hathor`}
                        className="we-rite__media"
                        ratio="1 / 1"
                      />
                      <h3 className="we-rite__word we-display">{ritual.word}</h3>
                      <div className="we-rite__detail">
                        <p className="we-rite__meta">{ritual.meta}</p>
                        <p className="we-rite__text">{ritual.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Scene>

              {/* 05 — Image gallery bridge */}
              <Scene className="we-gallery" aria-label="Wellness imagery">
                <FlipImage
                  className="we-gallery__a"
                  axis="up"
                  ratio="4 / 5"
                  front="wellness-fitness"
                  back="home-amenities-13"
                  frontAlt="Historia Fitness aboard Hathor"
                  backAlt="Active wellness overlooking the Nile"
                />
                <WellnessMedia
                  slot="room-luxury"
                  alt="Luxury cabin repose aboard Hathor"
                  className="we-gallery__b"
                  ratio="5 / 4"
                />
                <FlipImage
                  className="we-gallery__c"
                  axis="left"
                  ratio="3 / 4"
                  front="home-story-way-of-life"
                  back="home-split-courtyard"
                  frontAlt="Life aboard Hathor"
                  backAlt="Deck living aboard Hathor"
                />
              </Scene>

              {/* 06 — Historia framed datum */}
              <Scene className="we-historia" id="historia">
                <div className="we-historia__frame">
                  <span className="we-historia__corner we-historia__corner--tl">
                    Fitness
                  </span>
                  <span className="we-historia__corner we-historia__corner--tr">
                    Nile view
                  </span>

                  <p className="we-historia__datum we-edit">
                    <span>360</span>
                    <i>°</i>
                  </p>

                  <h2 className="we-historia__title we-display">{fitnessTitle}</h2>
                  <p className="we-historia__body we-meta-copy">{fitnessBody}</p>

                  <span className="we-historia__corner we-historia__corner--bl">
                    Daily · open
                  </span>
                  <span className="we-historia__corner we-historia__corner--br">
                    Movement
                  </span>
                </div>

                <div className="we-historia__media-col">
                  <WellnessMedia
                    slot="wellness-fitness"
                    alt="Historia Fitness Center with panoramic Nile views"
                    className="we-historia__media"
                    ratio="4 / 5"
                  />
                  <WellnessMedia
                    slot="home-call-to-action"
                    alt="River light from the fitness deck"
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
                    frontAlt="Movement aboard Hathor"
                    backAlt="Sailing the Nile aboard Hathor"
                  />
                  <WellnessMedia
                    slot="room-royal"
                    alt="Royal Suite repose aboard Hathor"
                    className="we-essay__wide"
                    ratio="5 / 3"
                  />
                  <WellnessMedia
                    slot="home-story-craft-large"
                    alt="Crafted detail aboard Hathor"
                    className="we-essay__peek"
                    ratio="1 / 1"
                  />
                </div>
                <div className="we-essay__copy">
                  <Eyebrow>After movement</Eyebrow>
                  <div data-anima-title>
                    <h2 className="we-edit we-edit--xl">
                      <span className="we-line">
                        <AnimaSplitLine line={0}>Rest is not</AnimaSplitLine>
                      </span>
                      <span className="we-line we-line--indent">
                        <AnimaSplitLine line={1}>the absence of</AnimaSplitLine>
                      </span>
                      <span className="we-line">
                        <AnimaSplitLine line={2}>the voyage</AnimaSplitLine>
                      </span>
                    </h2>
                  </div>
                  <p className="we-meta-copy">
                    Suites become part of the ritual: soft morning light, deep
                    sleep, and the rare luxury of waking beside a different Nile
                    horizon.
                  </p>
                  <Link href="/suites" className="we-btn">
                    <span>Explore suites</span>
                  </Link>
                </div>
              </Scene>

              {/* 08 — Pulse with image */}
              <Scene className="we-pulse" aria-label="Quiet pause">
                <WellnessMedia
                  slot="home-cinematic-still"
                  alt="Quiet river light aboard Hathor"
                  className="we-pulse__media"
                  ratio="4 / 5"
                />
                <p className="we-pulse__phrase we-edit">
                  The river keeps time —
                  <br />
                  so you do not have to.
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
                  frontAlt="Sailing the Nile aboard Hathor"
                  backAlt="Seneb Spa calm aboard Hathor"
                />
                <div className="we-closing__copy">
                  <Eyebrow>Next</Eyebrow>
                  <p className="we-display we-display--l">Book stillness</p>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        <section className="we-epilogue" id="reserve">
          <header className="we-epilogue__head">
            <Eyebrow>Reserve</Eyebrow>
            <h2 className="we-display we-display--xl" data-anima-title>
              <span className="we-line">
                <AnimaSplitLine line={0}>A quieter Nile</AnimaSplitLine>
              </span>
              <span className="we-line we-line--indent">
                <AnimaSplitLine line={1}>awaits</AnimaSplitLine>
              </span>
            </h2>
          </header>

          <div className="we-epilogue__pair">
            <WellnessMedia
              slot="wellness-fitness"
              alt="Historia Fitness aboard Hathor"
              ratio="668 / 554"
            />
            <WellnessMedia
              slot="wellness-hero"
              alt="Seneb Spa aboard Hathor"
              ratio="668 / 720"
            />
          </div>

          <div className="we-epilogue__board">
            <div className="we-epilogue__statement">
              <p className="we-edit we-edit--l">
                Shape a private voyage with time for Seneb Spa, Historia Fitness,
                restorative suite rituals, and the temples of Egypt.
              </p>
              <div className="we-epilogue__pills">
                <BookNowTrigger className="we-btn we-btn--solid">
                  <span>Book Now</span>
                </BookNowTrigger>
                <Link href="/contact" className="we-btn">
                  <span>Enquire</span>
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
              <span className="we-card__tag">Floating oasis</span>
              <WellnessMedia
                slot="room-royal"
                alt="Royal Suite repose aboard Hathor"
                className="we-epilogue__card-media"
                ratio="356 / 460"
              />
              <h3 className="we-display">Seneb</h3>
              <p className="we-epilogue__card-body">
                Spa · Fitness · Suite rest
                <br />
                between Luxor and Aswan
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
                <Link className="we-link" href="/suites">
                  Suites
                </Link>
              </div>
            </aside>
          </div>

          <div className="we-epilogue__legal">
            <span>
              Hathor Cruise <span className="we-reg">®</span> 2026
            </span>
            <nav aria-label="Legal">
              <Link href="/contact">Privacy</Link>
              <Link href="/contact">Cookies</Link>
              <Link href="/contact">Legal</Link>
            </nav>
          </div>
        </section>
      </main>
    </div>
  );
}
