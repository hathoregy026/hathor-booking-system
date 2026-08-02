"use client";

import { useRef } from "react";
import Link from "next/link";
import "@/app/immersive-voyage.css";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useHathorLuxBodyMotion } from "@/hooks/useHathorLuxBodyMotion";
import { useImmersiveVoyageMotion } from "@/hooks/useImmersiveVoyageMotion";
import {
  extractHighlightsPullQuote,
  HIGHLIGHTS_LANDMARK_META,
  HIGHLIGHTS_MANIFESTO,
  layoutHighlightsIntro,
} from "@/lib/highlights-content";
import { HIGHLIGHTS_PAGE } from "@/lib/page-content";

const LIFE_ABOARD = [
  {
    title: "Dining",
    body: "Egyptian flavours and international craft — breakfast light, lunches that linger, candlelit dinners under the stars.",
    slot: "gastronomy-restaurant" as const,
  },
  {
    title: "Suite",
    body: "Cabins and royal suites composed for Nile light — private quarters after every day of discovery.",
    slot: "room-royal" as const,
  },
  {
    title: "Deck",
    body: "Sun, soft current, and the quiet theatre of the river — a sanctuary waiting after every shore.",
    slot: "highlights-lifestyle" as const,
  },
] as const;

const RIVER_RHYTHM = [
  {
    kicker: "Dawn",
    title: "Silver water, first light",
    body: "The Nile wakes slowly. Mist lifts from the banks while coffee finds the softest corner of the deck.",
    slot: "highlights-lifestyle" as const,
  },
  {
    kicker: "Midday",
    title: "Heat held at a distance",
    body: "Shade, cool interiors, and unhurried passage between temples and quiet villages.",
    slot: "charter-rhythm" as const,
  },
  {
    kicker: "Golden hour",
    title: "Stone warmed by the sun",
    body: "Landmarks catch amber light. The river turns copper. Time stretches.",
    slot: "landmark-hatshepsut" as const,
  },
  {
    kicker: "Night",
    title: "Lanterns and dark silk",
    body: "When the shore dissolves, Hathor becomes a sealed world of soft music and slow conversation.",
    slot: "gastronomy-hero" as const,
  },
] as const;

const DETAIL_CELLS = [
  { slot: "room-royal" as const, caption: "Royal suite light" },
  { slot: "gastronomy-restaurant" as const, caption: "The table" },
  { slot: "charter-privacy" as const, caption: "Private deck" },
  { slot: "landmark-obelisk" as const, caption: "Unfinished stone" },
  { slot: "highlights-lifestyle" as const, caption: "River living" },
  { slot: "charter-service" as const, caption: "Attentive hospitality" },
] as const;

const LANDMARK_LAYOUTS = ["obelisk", "hatshepsut", "valley"] as const;

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useHathorLuxBodyMotion(rootRef);
  useImmersiveVoyageMotion(rootRef);

  const { pages } = useWebsiteText();
  const highlights = pages.highlights;
  const introLayout = layoutHighlightsIntro(highlights.intro);
  const pullQuote = extractHighlightsPullQuote(highlights.intro);

  const landmarks = highlights.landmarks.map((landmark, index) => ({
    ...landmark,
    meta: HIGHLIGHTS_LANDMARK_META[index]!,
    layout: LANDMARK_LAYOUTS[index] ?? "obelisk",
  }));

  return (
    <PageScrollTransition
      title={HIGHLIGHTS_PAGE.hero.title}
      secondTitle="Highlights"
      subtitle={HIGHLIGHTS_PAGE.hero.subtitle}
      breadcrumb="Highlights"
      imageName="highlights-hero"
      heroPage="highlights"
    >
      <div
        ref={rootRef}
        className="venetian-page lux-page"
        data-highlights-page=""
      >
        {/* First light */}
        <section className="iv-firstlight" aria-labelledby="hl-first-title">
          <div className="iv-wrap">
            <p className="iv-kicker" data-lux-reveal>
              First light
            </p>
            <h2
              id="hl-first-title"
              className="lux-gold lux-gold-xl"
              data-lux-title
            >
              {HIGHLIGHTS_PAGE.hero.subtitle}
            </h2>
            <p className="iv-lead" data-lux-reveal style={{ margin: "1.25rem 0 2rem" }}>
              {introLayout.lead}
            </p>

            <div className="iv-firstlight__panorama lux-mask" data-iv-parallax="">
              <ManagedImage
                name="highlights-lifestyle"
                alt="Morning light aboard Hathor on the Nile"
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>

            <div className="iv-firstlight__meta">
              <div>
                <p className="iv-firstlight__stamp" data-lux-reveal>
                  {pullQuote}
                </p>
                <div className="iv-copy" data-lux-reveal style={{ marginTop: "1.5rem" }}>
                  {introLayout.groups.flat().slice(0, 3).map((sentence) => (
                    <p key={sentence.slice(0, 48)}>{sentence}</p>
                  ))}
                </div>
              </div>
              <div className="iv-firstlight__crop lux-mask">
                <ManagedImage
                  name="charter-rhythm"
                  alt="Detail of life aboard Hathor"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Manifesto numerals */}
        <section className="iv-wrap" style={{ paddingBottom: "3rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(14rem, 1fr))",
              gap: "1.75rem",
            }}
          >
            {HIGHLIGHTS_MANIFESTO.map((item) => (
              <article key={item.numeral} data-lux-reveal>
                <p className="iv-kicker">{item.numeral}</p>
                <h3
                  className="lux-gold lux-gold-md"
                  style={{ margin: "0.35rem 0 0.65rem" }}
                >
                  {item.title}
                </h3>
                <p className="iv-copy">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Landmark chapters — three distinct layouts */}
        {landmarks.map((landmark) => {
          if (landmark.layout === "obelisk") {
            return (
              <section
                key={landmark.meta.slot}
                className="iv-wrap iv-landmark iv-landmark--obelisk"
                aria-labelledby={`hl-${landmark.meta.slot}`}
              >
                <div className="iv-landmark__media lux-mask" data-iv-parallax="">
                  <ManagedImage
                    name={landmark.meta.slot}
                    alt={landmark.meta.caption}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    style={{ objectPosition: landmark.meta.objectPosition }}
                  />
                </div>
                <div>
                  <p className="iv-kicker">{landmark.meta.category}</p>
                  <h2
                    id={`hl-${landmark.meta.slot}`}
                    className="lux-gold lux-gold-lg"
                    data-lux-title
                  >
                    {landmark.title}
                  </h2>
                  <p className="iv-script" data-lux-reveal>
                    {landmark.meta.location}
                  </p>
                  <div className="iv-copy" data-lux-reveal style={{ marginTop: "1.25rem" }}>
                    <p>{landmark.body}</p>
                  </div>
                  <p className="iv-landmark__fact" data-lux-reveal>
                    {landmark.meta.fact}
                  </p>
                </div>
              </section>
            );
          }

          if (landmark.layout === "hatshepsut") {
            return (
              <section
                key={landmark.meta.slot}
                className="iv-wrap iv-landmark iv-landmark--hatshepsut"
                aria-labelledby={`hl-${landmark.meta.slot}`}
              >
                <div className="iv-landmark__media lux-mask" data-iv-parallax="">
                  <ManagedImage
                    name={landmark.meta.slot}
                    alt={landmark.meta.caption}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    style={{ objectPosition: landmark.meta.objectPosition }}
                  />
                </div>
                <div className="iv-landmark__body">
                  <div>
                    <p className="iv-kicker">{landmark.meta.category}</p>
                    <h2
                      id={`hl-${landmark.meta.slot}`}
                      className="lux-gold lux-gold-lg"
                      data-lux-title
                    >
                      {landmark.title}
                    </h2>
                    <p className="iv-script" data-lux-reveal>
                      {landmark.meta.location}
                    </p>
                  </div>
                  <div>
                    <div className="iv-copy" data-lux-reveal>
                      <p>{landmark.body}</p>
                    </div>
                    <p className="iv-landmark__fact" data-lux-reveal>
                      {landmark.meta.fact}
                    </p>
                  </div>
                </div>
              </section>
            );
          }

          return (
            <section
              key={landmark.meta.slot}
              className="iv-landmark iv-landmark--valley"
              aria-labelledby={`hl-${landmark.meta.slot}`}
            >
              <div className="iv-landmark__media" data-iv-parallax="">
                <ManagedImage
                  name={landmark.meta.slot}
                  alt={landmark.meta.caption}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  style={{ objectPosition: landmark.meta.objectPosition }}
                />
              </div>
              <div className="iv-landmark__copy">
                <p className="iv-kicker">{landmark.meta.category}</p>
                <h2
                  id={`hl-${landmark.meta.slot}`}
                  className="lux-gold lux-gold-lg"
                  data-lux-title
                >
                  {landmark.title}
                </h2>
                <p className="iv-script" data-lux-reveal>
                  {landmark.meta.location}
                </p>
                <div className="iv-copy" data-lux-reveal style={{ marginTop: "1.25rem" }}>
                  <p>{landmark.body}</p>
                </div>
                <p className="iv-landmark__fact" data-lux-reveal>
                  {landmark.meta.fact}
                </p>
              </div>
            </section>
          );
        })}

        {/* Life aboard */}
        <section className="iv-life" aria-labelledby="hl-life-title">
          <div className="iv-wrap" style={{ marginBottom: "1.75rem" }}>
            <p className="iv-kicker" data-lux-reveal>
              Life aboard
            </p>
            <h2 id="hl-life-title" className="lux-gold lux-gold-lg" data-lux-title>
              Dining · Suite · Deck
            </h2>
          </div>

          <div className="iv-life__pin">
            <div className="iv-life__stage">
              {LIFE_ABOARD.map((item, i) => (
                <article
                  key={item.title}
                  className={`iv-life__card${i === 0 ? " is-active" : ""}`}
                >
                  <div className="iv-life__card-media">
                    <ManagedImage
                      name={item.slot}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="33vw"
                    />
                  </div>
                  <h3>{item.title}</h3>
                  <p className="iv-copy">{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="iv-wrap iv-life__rail">
            {LIFE_ABOARD.map((item) => (
              <article key={item.title} className="iv-life__card">
                <div className="iv-life__card-media lux-mask">
                  <ManagedImage
                    name={item.slot}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="80vw"
                  />
                </div>
                <h3>{item.title}</h3>
                <p className="iv-copy">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* River rhythm scrub */}
        <section
          className="iv-scrub"
          data-iv-scrub="river"
          aria-labelledby="hl-river-title"
        >
          <div className="iv-wrap iv-scrub__head">
            <p className="iv-kicker" data-lux-reveal>
              River rhythm
            </p>
            <h2 id="hl-river-title" className="lux-gold lux-gold-lg" data-lux-title>
              Light changes. The day answers.
            </h2>
          </div>

          <div className="iv-scrub__pin">
            <div className="iv-scrub__stage">
              <div className="iv-scrub__media">
                {RIVER_RHYTHM.map((item, i) => (
                  <div
                    key={item.kicker}
                    className={`iv-scrub__slide${i === 0 ? " is-active" : ""}`}
                  >
                    <ManagedImage
                      name={item.slot}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="60vw"
                    />
                  </div>
                ))}
                <div className="iv-scrub__rail" aria-hidden="true">
                  {RIVER_RHYTHM.map((item, i) => (
                    <span
                      key={item.kicker}
                      className={i === 0 ? "is-active" : undefined}
                    >
                      {item.kicker}
                    </span>
                  ))}
                </div>
              </div>
              <div className="iv-scrub__copy">
                {RIVER_RHYTHM.map((item, i) => (
                  <div
                    key={item.title}
                    className={`iv-scrub__chapter${i === 0 ? " is-active" : ""}`}
                  >
                    <p className="iv-kicker">{item.kicker}</p>
                    <h3>{item.title}</h3>
                    <p className="iv-copy">{item.body}</p>
                  </div>
                ))}
              </div>
              <div className="iv-scrub__progress" aria-hidden="true">
                <i />
              </div>
            </div>
          </div>

          <div className="iv-wrap iv-scrub__stack">
            {RIVER_RHYTHM.map((item) => (
              <article key={item.kicker} className="iv-stack-card">
                <div className="iv-stack-card__media lux-mask">
                  <ManagedImage
                    name={item.slot}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                </div>
                <p className="iv-kicker">{item.kicker}</p>
                <h3>{item.title}</h3>
                <p className="iv-copy">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Details grid */}
        <section className="iv-details" aria-labelledby="hl-details-title">
          <div className="iv-wrap">
            <p className="iv-kicker" data-lux-reveal>
              Details
            </p>
            <h2
              id="hl-details-title"
              className="lux-gold lux-gold-lg"
              data-lux-title
              style={{ marginBottom: "1.75rem" }}
            >
              Texture of the voyage
            </h2>
            <div className="iv-details__grid">
              {DETAIL_CELLS.map((cell) => (
                <figure key={cell.slot + cell.caption} className="iv-details__cell">
                  <div className="iv-details__media lux-mask">
                    <ManagedImage
                      name={cell.slot}
                      alt={cell.caption}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <figcaption>{cell.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* Closing invitation */}
        <section className="iv-close" aria-labelledby="hl-close-title">
          <div className="iv-close__media">
            <ManagedImage
              name="highlights-hero"
              alt="Sunset invitation aboard Hathor"
              fill
              className="object-cover"
              sizes="100vw"
            />
          </div>
          <div className="iv-close__shade" aria-hidden="true" />
          <div className="iv-wrap iv-close__inner">
            <p className="iv-kicker" data-lux-reveal>
              Continue the voyage
            </p>
            <h2 id="hl-close-title" className="lux-gold lux-gold-lg" data-lux-title>
              Sail with Hathor
            </h2>
            <p className="iv-lead" data-lux-reveal>
              Reserve a scheduled sailing — or charter the entire Dahabiya for your party alone.
            </p>
            <div className="iv-close__actions" data-lux-reveal>
              <BookNowTrigger className="btn btn-secondary">Book Now</BookNowTrigger>
              <Link className="btn btn-primary" href="/charter">
                Private charter
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
