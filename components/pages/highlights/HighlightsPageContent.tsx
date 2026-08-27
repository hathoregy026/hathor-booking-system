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
import { useHighlightsEditorialScroll } from "@/hooks/useHighlightsEditorialScroll";
import {
  extractHighlightsPullQuote,
  HIGHLIGHTS_JOURNEY_LINKS,
  HIGHLIGHTS_LANDMARK_META,
  HIGHLIGHTS_MANIFESTO,
  HIGHLIGHTS_PRINCIPLES,
  layoutHighlightsIntro,
} from "@/lib/highlights-content";
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
}: {
  slot: string;
  alt: string;
  priority?: boolean;
  className?: string;
  ratio?: string;
  objectPosition?: string;
}) {
  const image = useSiteImage(slot);
  return (
    <figure
      className={`hl-media ${className}`}
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
        sizes="(max-width: 950px) 100vw, 70vw"
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
    <div className={`hl-flip hl-flip--${axis} ${className}`} data-hl-flip>
      <HighlightsMedia
        slot={front}
        alt={frontAlt}
        className="hl-flip__base"
        ratio={ratio}
      />
      <HighlightsMedia
        slot={back}
        alt={backAlt}
        className="hl-flip__overlay"
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
    <section className={`hl-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="hl-eyebrow">({children})</p>;
}

const LIFE_ABOARD = [
  {
    number: "01",
    count: "Taste",
    title: "Dining",
    text: "Egyptian flavours and international craft: breakfast light, lunches that linger, candlelit dinners under the stars.",
    slot: "gastronomy-restaurant",
  },
  {
    number: "02",
    count: "Rest",
    title: "Suite",
    text: "Cabins and royal suites composed for Nile light: private quarters after every day of discovery.",
    slot: "room-royal",
  },
  {
    number: "03",
    count: "Air",
    title: "Deck",
    text: "Sun, soft current, and the quiet theatre of the river: a sanctuary waiting after every shore.",
    slot: "highlights-lifestyle",
  },
] as const;

const RIVER_RHYTHM = [
  {
    number: "01",
    word: "Dawn",
    label: "Silver water",
    value: "The Nile wakes slowly. Mist lifts from the banks while coffee finds the softest corner of the deck.",
    meta: "First light",
  },
  {
    number: "02",
    word: "Noon",
    label: "Heat held away",
    value: "Shade, cool interiors, and unhurried passage between temples and quiet villages.",
    meta: "Midday",
  },
  {
    number: "03",
    word: "Gold",
    label: "Stone warmed",
    value: "Landmarks catch amber light. The river turns copper. Time stretches.",
    meta: "Golden hour",
  },
  {
    number: "04",
    word: "Night",
    label: "Lanterns",
    value: "When the shore dissolves, Hathor becomes a sealed world of soft music and slow conversation.",
    meta: "After dark",
  },
] as const;

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
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
  const pullQuote = extractHighlightsPullQuote(highlights.intro);
  const collageCopy =
    introLayout.groups.flat().slice(0, 2).join(" ") ||
    HIGHLIGHTS_PAGE.intro[1];

  const landmarks = highlights.landmarks.map((landmark, index) => {
    const meta = HIGHLIGHTS_LANDMARK_META[index]!;
    const tones = ["cream", "ink", "gold"] as const;
    return {
      ...landmark,
      meta,
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
          aria-label="Hathor cruise highlights"
        >
          <div className="hl-stage">
            <div ref={trackRef} className="hl-track">
              {/* 01 — Editorial introduction */}
              <Scene className="hl-intro">
                <nav
                  className="hl-intro__nav"
                  aria-label="Highlights page sections"
                >
                  <a href="#highlights">Highlights</a>
                  <a href="#landmarks">Landmarks</a>
                  <a href="#aboard">Aboard</a>
                  <a href="#reserve">Reserve</a>
                </nav>

                <div className="hl-intro__inner">
                  <Eyebrow>Highlights</Eyebrow>

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

                  <p className="hl-intro__body wt-page-body">
                    {introLayout.lead}
                  </p>
                </div>

                <p className="hl-intro__mark">
                  Hathor Cruise <span className="hl-reg">®</span> 2026
                </p>
                <p className="hl-intro__scroll">
                  <i />
                  Scroll
                </p>
              </Scene>

              {/* 02 — Image lead */}
              <Scene className="hl-lead">
                <HighlightsMedia
                  slot="highlights-hero"
                  alt="Hathor Dahabiya highlights on the Nile"
                  priority
                  className="hl-lead__main"
                />
                <FlipImage
                  className="hl-lead__inset"
                  axis="left"
                  ratio="835 / 557"
                  front="highlights-lifestyle"
                  back="landmark-hatshepsut"
                  frontAlt="Morning light aboard Hathor"
                  backAlt="Temple of Hatshepsut"
                />
                <p className="hl-lead__caption">
                  <span>(Nile)</span> Luxor — Aswan
                </p>
              </Scene>

              {/* 03 — Manifesto */}
              <Scene className="hl-manifesto">
                <div className="hl-manifesto__aside">
                  <Eyebrow>First light</Eyebrow>
                  <p className="hl-meta-copy">{pullQuote}</p>
                </div>
                <div className="hl-manifesto__headline" data-anima-title>
                  <h2 className="hl-edit hl-edit--xl">
                    <span className="hl-line">
                      <AnimaSplitLine line={0}>Cruise in</AnimaSplitLine>
                    </span>
                    <span className="hl-line">
                      <AnimaSplitLine line={1}>true elegance</AnimaSplitLine>
                    </span>
                    <span className="hl-line hl-line--indent">
                      <AnimaSplitLine line={2}>on the Nile</AnimaSplitLine>
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
                  frontAlt="River rhythm aboard Hathor"
                  backAlt="Private deck living"
                />
                <FlipImage
                  className="hl-collage__tile hl-collage__tile--two"
                  axis="right"
                  ratio="1090 / 960"
                  front="landmark-obelisk"
                  back="highlights-lifestyle"
                  frontAlt="Unfinished Obelisk, Aswan"
                  backAlt="Life aboard Hathor"
                />
                <p className="hl-collage__copy hl-meta-copy">{collageCopy}</p>
              </Scene>

              {/* 05 — Numbered principles (manifesto pillars) */}
              <Scene className="hl-principles" id="pillars">
                <div className="hl-principles__head">
                  <Eyebrow>Three notes</Eyebrow>
                  <p className="hl-meta-copy">
                    The river, the landmarks, and the return — the grammar of a
                    Hathor voyage.
                  </p>
                </div>

                <ol className="hl-principles__list">
                  {HIGHLIGHTS_MANIFESTO.map((item, index) => {
                    const principle = HIGHLIGHTS_PRINCIPLES[index];
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
                          {item.title}
                        </h3>
                        <p className="hl-principle__count hl-edit">
                          {item.numeral}
                        </p>
                        <p className="hl-principle__copy">
                          {principle?.body ?? item.body}
                        </p>
                        <HighlightsMedia
                          slot={peekSlots[index] ?? "highlights-lifestyle"}
                          alt={`${item.title} aboard Hathor`}
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
                      alt={landmark.meta.caption}
                      className="hl-card__media"
                      ratio="1279 / 820"
                      objectPosition={landmark.meta.objectPosition}
                    />

                    <div className="hl-card__plate">
                      <span className="hl-card__corner hl-card__corner--tl hl-edit">
                        {landmark.meta.category}
                      </span>
                      <span className="hl-card__corner hl-card__corner--tr">
                        {landmark.meta.location}
                      </span>

                      <h2
                        className="hl-card__title hl-display"
                        data-anima-title
                      >
                        {
                          (
                            [
                              "Obelisk",
                              "Hatshepsut",
                              "Valley",
                            ] as const
                          )[Number(landmark.number) - 1] ?? landmark.title
                        }
                      </h2>

                      <span className="hl-card__corner hl-card__corner--bl">
                        {landmark.number}
                      </span>
                      <a
                        className="hl-btn hl-card__corner hl-card__corner--br"
                        href="#reserve"
                      >
                        <span>The voyage</span>
                      </a>
                    </div>
                  </div>
                </Scene>
              ))}

              {/* 07 — Life aboard editorial split */}
              <Scene className="hl-dining" id="aboard">
                <div className="hl-dining__media">
                  <HighlightsMedia
                    slot="gastronomy-restaurant"
                    alt="Dining aboard Hathor"
                    className="hl-dining__main"
                    ratio="1090 / 960"
                  />
                  <FlipImage
                    className="hl-dining__stack"
                    axis="left"
                    ratio="668 / 554"
                    front="room-royal"
                    back="highlights-lifestyle"
                    frontAlt="Royal suite aboard Hathor"
                    backAlt="Deck living on the Nile"
                  />
                </div>

                <div className="hl-dining__copy">
                  <Eyebrow>Life aboard</Eyebrow>
                  <div data-anima-title>
                    <h2 className="hl-edit hl-edit--l">
                      <span className="hl-line">
                        <AnimaSplitLine line={0}>Dining · Suite</AnimaSplitLine>
                      </span>
                      <span className="hl-line">
                        <AnimaSplitLine line={1}>· Deck — the</AnimaSplitLine>
                      </span>
                      <span className="hl-line hl-line--indent">
                        <AnimaSplitLine line={2}>return each day</AnimaSplitLine>
                      </span>
                    </h2>
                  </div>
                  <p className="hl-meta-copy wt-page-body">
                    {LIFE_ABOARD.map((item) => item.text).join(" ")}
                  </p>
                  <Link href="/gastronomy" className="hl-btn">
                    <span>Explore dining</span>
                  </Link>
                </div>
              </Scene>

              {/* 08 — River rhythm ledger */}
              <Scene className="hl-principles" id="rhythm">
                <div className="hl-principles__head">
                  <Eyebrow>River rhythm</Eyebrow>
                  <p className="hl-meta-copy">
                    Light changes. The day answers — dawn to night aboard
                    Hathor.
                  </p>
                </div>

                <ol className="hl-principles__list">
                  {RIVER_RHYTHM.map((item) => (
                    <li className="hl-principle" key={item.number}>
                      <span className="hl-principle__num">{item.number}</span>
                      <h3 className="hl-principle__word hl-display">
                        {item.word}
                      </h3>
                      <p className="hl-principle__count hl-edit">{item.meta}</p>
                      <p className="hl-principle__copy">
                        {item.label}. {item.value}
                      </p>
                    </li>
                  ))}
                </ol>
              </Scene>

              {/* 09 — Closing frame */}
              <Scene className="hl-closing">
                <FlipImage
                  className="hl-closing__media"
                  axis="up"
                  ratio="1483 / 960"
                  front="home-voyage-nile-majesty"
                  back="highlights-hero"
                  frontAlt="Sailing the Nile aboard Hathor"
                  backAlt="Sunset aboard Hathor"
                />
                <div className="hl-closing__copy">
                  <Eyebrow>Next</Eyebrow>
                  <p className="hl-display hl-display--l wt-page-title">
                    Sail with Hathor
                  </p>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue */}
        <section className="hl-epilogue" id="reserve">
          <header className="hl-epilogue__head">
            <Eyebrow>Reserve</Eyebrow>
            <h2 className="hl-display hl-display--xl" data-anima-title>
              <span className="hl-line">
                <AnimaSplitLine line={0}>Continue the</AnimaSplitLine>
              </span>
              <span className="hl-line hl-line--indent">
                <AnimaSplitLine line={1}>voyage</AnimaSplitLine>
              </span>
            </h2>
          </header>

          <div className="hl-epilogue__pair">
            <HighlightsMedia
              slot="landmark-valley-kings"
              alt="Valley of the Kings"
              ratio="668 / 554"
            />
            <HighlightsMedia
              slot="room-royal"
              alt="Royal suite aboard Hathor"
              ratio="668 / 720"
            />
          </div>

          <div className="hl-epilogue__board">
            <div className="hl-epilogue__statement">
              <p className="hl-edit hl-edit--l">
                Reserve a scheduled sailing, or charter the entire Dahabiya for
                your party alone.
              </p>
              <div className="hl-epilogue__pills">
                <BookNowTrigger className="hl-btn hl-btn--solid">
                  Book Now
                </BookNowTrigger>
                <Link href="/charter" className="hl-btn">
                  <span>Private charter</span>
                </Link>
              </div>
                      <ul className="hl-meta-copy" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {HIGHLIGHTS_JOURNEY_LINKS.map((link) => (
                  <li key={link.href + link.label} style={{ marginBottom: "0.75rem" }}>
                    <Link className="hl-link" href={link.href}>
                      {link.label}
                    </Link>
                    {" — "}
                    {link.body}
                  </li>
                ))}
              </ul>
            </div>

            <aside className="hl-epilogue__card">
              <span className="hl-card__tag">(Voyage)</span>
              <HighlightsMedia
                slot="highlights-hero"
                alt="Hathor Dahabiya on the Nile"
                className="hl-epilogue__card-media"
                ratio="356 / 460"
              />
              <h3 className="hl-display">Nile</h3>
              <p className="hl-epilogue__card-body">
                Ancient landmarks
                <br />
                private river living
              </p>
              <div className="hl-epilogue__card-links">
                <Link className="hl-link" href="/cruises-list">
                  Explore cruises
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

          <div className="hl-epilogue__legal">
            <span>
              Hathor Cruise <span className="hl-reg">®</span> 2026
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
