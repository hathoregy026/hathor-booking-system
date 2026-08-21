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
import { useVoyagesEditorialFlow } from "@/hooks/useVoyagesEditorialFlow";
import type { HomepageAccordionCruise } from "@/lib/homepage-accordion-cruises";
import { resolveVoyagePanelContent } from "@/lib/voyage-accordion-panels";
import { VOYAGES_PAGE } from "@/lib/voyages-page-content";

function VoyageMedia({
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
      className={`vb-media ${className}`}
      style={
        ratio ? ({ ["--vb-ratio" as string]: ratio } as CSSProperties) : undefined
      }
    >
      <Image
        src={image.src}
        alt={alt || image.alt}
        fill
        priority={priority}
        sizes="(max-width: 950px) 100vw, 80vw"
        className="vb-media__image"
      />
    </figure>
  );
}

/** Two stacked frames; the second wipes across the first as the panel travels. */
function FlipImage({
  front,
  back,
  frontAlt,
  backAlt = "",
  className = "",
  axis = "left",
  ratio,
  priority = false,
}: {
  front: string;
  back: string;
  frontAlt: string;
  backAlt?: string;
  className?: string;
  axis?: "up" | "left" | "right";
  ratio?: string;
  priority?: boolean;
}) {
  return (
    <div className={`vb-flip vb-flip--${axis} ${className}`} data-vb-flip>
      <VoyageMedia
        slot={front}
        alt={frontAlt}
        className="vb-flip__base"
        ratio={ratio}
        priority={priority}
      />
      <VoyageMedia
        slot={back}
        alt={backAlt}
        className="vb-flip__overlay"
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
    <section className={`vb-scene ${className}`} {...props}>
      {children}
    </section>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="vb-eyebrow">({children})</p>;
}

/** The circular badge — this page's signature control. */
function Disc({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="vb-disc">
      <span>{children}</span>
      <i aria-hidden="true">↗</i>
    </Link>
  );
}

/** A filmstrip frame: picture first, label as a small annotation beneath. */
const STRIP = [
  {
    slot: "home-story-way-of-life",
    back: "home-cinematic-still",
    ratio: "668 / 900",
    kicker: "Embark",
  },
  {
    slot: "gastronomy-table",
    back: "gastronomy-restaurant",
    ratio: "1090 / 760",
    kicker: "Discover",
  },
  {
    slot: "highlights-lifestyle",
    back: "room-suite",
    ratio: "700 / 980",
    kicker: "Unwind",
  },
  {
    slot: "home-split-courtyard",
    back: "home-story-legacy-large",
    ratio: "980 / 720",
    kicker: "Arrive",
  },
] as const;

/** Three pictures at unequal ratios; the inclusions annotate them. */
const TRIO = [
  { slot: "gastronomy-restaurant", back: "gastronomy-wine", ratio: "668 / 860" },
  { slot: "room-suite", back: "room-royal", ratio: "1090 / 720" },
  { slot: "home-story-craft-large", back: "room-luxury", ratio: "760 / 940" },
] as const;

const TONES = ["sand", "ink", "olive", "stone"] as const;

export type VoyagesPageContentProps = {
  voyages: HomepageAccordionCruise[];
};

export function VoyagesPageContent({ voyages }: VoyagesPageContentProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const runRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useVoyagesEditorialFlow({ rootRef, runRef, trackRef });

  const itineraries = voyages.slice(0, 4);

  return (
    <div ref={rootRef} className="voyages-boring">
      <div className="vb-progress" aria-hidden="true">
        <i data-vb-progress />
      </div>

      <main>
        <section
          ref={runRef}
          className="vb-run"
          aria-label="Hathor voyages on the Nile"
        >
          <div className="vb-stage">
            <div className="vb-rail" aria-hidden="true">
              <span className="vb-rail__inner">
                {[0, 1, 2, 3].map((item) => (
                  <em key={item}>
                    Luxor ⇄ Aswan <b>✦</b> Three to seven nights <b>✦</b>
                  </em>
                ))}
              </span>
            </div>

            <div ref={trackRef} className="vb-track">
              {/* 01 — a full-bleed picture with the title set over it */}
              <Scene className="vb-open" id="voyages">
                <FlipImage
                  className="vb-open__media"
                  axis="left"
                  front="highlights-hero"
                  back="home-cinematic-still"
                  frontAlt="Sailing the Nile aboard Hathor"
                  backAlt="The dahabiya at golden hour"
                  priority
                />

                <div className="vb-open__over">
                  <Eyebrow>{VOYAGES_PAGE.opening.eyebrow}</Eyebrow>
                  <div className="vb-open__title" data-anima-title>
                    <h1 className="vb-display vb-display--xl">
                      <span className="vb-line">
                        <AnimaSplitLine line={0}>
                          {VOYAGES_PAGE.hero.title}
                        </AnimaSplitLine>
                      </span>
                    </h1>
                  </div>
                  <p className="vb-open__tracked">Luxor — Aswan</p>
                </div>

                <nav className="vb-open__nav" aria-label="Voyages page sections">
                  <a href="#itineraries">Itineraries</a>
                  <a href="#rhythm">The day</a>
                  <Link href="/charter">Charter</Link>
                  <a href="#reserve">Reserve</a>
                </nav>

                <p className="vb-open__scroll">
                  <i />
                  Scroll
                </p>
              </Scene>

              {/* 02 — the overlapping pair: one tall frame, one smaller riding it */}
              <Scene className="vb-duo">
                <FlipImage
                  className="vb-duo__main"
                  axis="up"
                  front="home-voyage-4n-luxor-aswan"
                  back="about-hero"
                  frontAlt="The Nile between Luxor and Aswan"
                  backAlt="Hathor under sail"
                />
                <FlipImage
                  className="vb-duo__inset"
                  axis="left"
                  ratio="835 / 557"
                  front="room-royal"
                  back="gastronomy-table"
                  frontAlt="Royal Suite aboard Hathor"
                  backAlt="Dining on the Nile"
                />
                <p className="vb-duo__caption">
                  <span>(Aboard)</span> Twelve guests · three decks
                </p>
              </Scene>

              {/* 03 — a narrow text pane between pictures */}
              <Scene className="vb-pane">
                <Eyebrow>Why a dahabiya</Eyebrow>
                <p className="vb-script">{VOYAGES_PAGE.opening.script}</p>
                <ol className="vb-pane__list">
                  {VOYAGES_PAGE.manifesto.map((item) => (
                    <li key={item.numeral}>
                      <span className="vb-edit">{item.numeral}</span>
                      <div>
                        <h2>{item.title}</h2>
                        <p>{item.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <p className="vb-open__tracked">{VOYAGES_PAGE.hero.subtitle}</p>
              </Scene>

              {/* 04 — the itineraries, one full-height picture each */}
              {itineraries.map((voyage, index) => {
                const panel = resolveVoyagePanelContent({
                  slug: voyage.slug,
                  name: voyage.name,
                  description: voyage.description,
                  href: voyage.href,
                });
                const tone = TONES[index % TONES.length];

                return (
                  <Scene
                    className={`vb-itin vb-itin--${tone}`}
                    key={voyage.id}
                    id={index === 0 ? "itineraries" : undefined}
                  >
                    <span className="vb-itin__ghost vb-edit" aria-hidden="true">
                      {voyage.romanNumeral}
                    </span>

                    <VoyageMedia
                      slot={voyage.imageName}
                      alt={voyage.name}
                      className="vb-itin__media"
                    />

                    <div className="vb-itin__plate">
                      <span className="vb-itin__corner vb-itin__corner--tl vb-edit">
                        {panel.durationLabel}
                      </span>
                      <span className="vb-itin__corner vb-itin__corner--tr">
                        {voyage.ports}
                      </span>

                      <h2 className="vb-itin__route vb-display" data-anima-title>
                        {panel.routeTitle}
                      </h2>

                      <span className="vb-itin__corner vb-itin__corner--bl">
                        {voyage.meta}
                      </span>
                      <span className="vb-itin__corner vb-itin__corner--br">
                        <Disc href={panel.detailsHref}>{panel.detailsLabel}</Disc>
                      </span>
                    </div>
                  </Scene>
                );
              })}

              {/* 05 — filmstrip: four pictures, unequal widths and offsets */}
              <Scene className="vb-strip" id="rhythm">
                <p className="vb-strip__title vb-display">
                  {VOYAGES_PAGE.rhythm.title}
                </p>

                {STRIP.map((frame, index) => {
                  const chapter = VOYAGES_PAGE.rhythm.chapters[index]!;
                  return (
                    <figure
                      className="vb-frame"
                      key={frame.slot}
                      style={{ ["--vb-i" as string]: index } as CSSProperties}
                    >
                      <FlipImage
                        className="vb-frame__media"
                        axis={index % 2 === 0 ? "up" : "left"}
                        ratio={frame.ratio}
                        front={frame.slot}
                        back={frame.back}
                        frontAlt={chapter.title}
                        backAlt={chapter.kicker}
                      />
                      <figcaption>
                        <span className="vb-edit">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <b>{frame.kicker}</b>
                        <em>{chapter.title}</em>
                      </figcaption>
                    </figure>
                  );
                })}
              </Scene>

              {/* 06 — three pictures, inclusions as corner annotations */}
              <Scene className="vb-trio">
                {TRIO.map((frame, index) => (
                  <FlipImage
                    key={frame.slot}
                    className={`vb-trio__frame vb-trio__frame--${index + 1}`}
                    axis={index === 1 ? "right" : "up"}
                    ratio={frame.ratio}
                    front={frame.slot}
                    back={frame.back}
                    frontAlt={VOYAGES_PAGE.features.items[index]?.label ?? "Aboard Hathor"}
                    backAlt="Aboard Hathor"
                  />
                ))}

                <div className="vb-trio__note">
                  <Eyebrow>{VOYAGES_PAGE.features.eyebrow}</Eyebrow>
                  <ul>
                    {VOYAGES_PAGE.features.items.map((item) => (
                      <li key={item.id}>
                        <i aria-hidden="true" />
                        {item.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </Scene>

              {/* 07 — charter: a dark full-bleed picture with the copy over it */}
              <Scene className="vb-charter">
                <FlipImage
                  className="vb-charter__media"
                  axis="up"
                  front={VOYAGES_PAGE.charter.image}
                  back="home-call-to-action"
                  frontAlt={VOYAGES_PAGE.charter.title}
                  backAlt="The deck at dusk"
                />
                <div className="vb-charter__over">
                  <Eyebrow>{VOYAGES_PAGE.charter.eyebrow}</Eyebrow>
                  <h2 className="vb-display vb-display--l">
                    {VOYAGES_PAGE.charter.title}
                  </h2>
                  <p className="vb-script">{VOYAGES_PAGE.charter.script}</p>
                  <Disc href={VOYAGES_PAGE.charter.cta.href}>
                    {VOYAGES_PAGE.charter.cta.label}
                  </Disc>
                </div>
              </Scene>

              {/* 08 — closing: full-bleed picture, title over it */}
              <Scene className="vb-closing">
                <FlipImage
                  className="vb-closing__media"
                  axis="up"
                  front="home-story-legacy-large"
                  back="home-voyage-7n-roundtrip"
                  frontAlt="The river at dusk"
                  backAlt="The bend of the Nile"
                />
                <div className="vb-closing__over">
                  <Eyebrow>Next</Eyebrow>
                  <p className="vb-display vb-display--l">
                    {VOYAGES_PAGE.cta.title}
                  </p>
                </div>
              </Scene>
            </div>
          </div>
        </section>

        {/* Epilogue — always vertical */}
        <section className="vb-epilogue" id="reserve">
          <div className="vb-epilogue__column">
            <Eyebrow>Reserve</Eyebrow>
            <h2 className="vb-display vb-display--xl" data-anima-title>
              <span className="vb-line">
                <AnimaSplitLine line={0}>{VOYAGES_PAGE.cta.title}</AnimaSplitLine>
              </span>
            </h2>
            <p className="vb-epilogue__body">{VOYAGES_PAGE.cta.body}</p>

            <div className="vb-epilogue__pills">
              <BookNowTrigger className="vb-btn vb-btn--xl vb-btn--solid">
                {VOYAGES_PAGE.cta.primary}
              </BookNowTrigger>
              <Link
                href={VOYAGES_PAGE.cta.secondary.href}
                className="vb-btn vb-btn--xl"
              >
                <span>{VOYAGES_PAGE.cta.secondary.label}</span>
              </Link>
            </div>
          </div>

          <div className="vb-epilogue__index">
            {itineraries.map((voyage) => {
              const panel = resolveVoyagePanelContent({
                slug: voyage.slug,
                name: voyage.name,
                description: voyage.description,
                href: voyage.href,
              });
              return (
                <Link className="vb-index-row" href={panel.detailsHref} key={voyage.id}>
                  <span className="vb-index-row__numeral vb-edit">
                    {voyage.romanNumeral}
                  </span>
                  <span className="vb-index-row__route">{panel.routeTitle}</span>
                  <span className="vb-index-row__nights">{panel.durationLabel}</span>
                  <span className="vb-index-row__go" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="vb-epilogue__legal">
            <span>
              Hathor Cruise <span className="vb-reg">®</span> 2026
            </span>
            <nav aria-label="Legal">
              <Link href="/contact">Contact</Link>
              <Link href="/cruises">Cruises</Link>
              <Link href="/charter">Charter</Link>
            </nav>
          </div>
        </section>
      </main>
    </div>
  );
}
