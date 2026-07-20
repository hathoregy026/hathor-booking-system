"use client";

import { useRef } from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PublicSiteHero } from "@/components/pages/PublicSiteHero";
import { useHathorLuxBodyMotion } from "@/hooks/useHathorLuxBodyMotion";
import { splitHeroTitle } from "@/lib/split-hero-title";
import { HIGHLIGHTS_PAGE } from "@/lib/page-content";

const PANEL_IMAGES = [
  "/pages-redesign/highlights-1.webp",
  "/pages-redesign/highlights-2.webp",
  "/pages-redesign/hl-lux-1.webp",
  "/pages-redesign/hl-lux-2.webp",
  "/pages-redesign/hl-lux-3.webp",
  "/pages-redesign/sport-5.webp",
] as const;

const EXTRA_PANELS = [
  {
    kicker: "Privacy",
    title: "Intimate Dahabiya",
    body: "Twelve guests at most — cabins and suites composed for silence, Nile light, and unhurried hospitality.",
  },
  {
    kicker: "Cuisine",
    title: "Hathor Flavors",
    body: "Egyptian and international cuisine, candlelit dinners, and lounge bars as the river turns gold.",
  },
  {
    kicker: "Wellness",
    title: "Seneb Spa",
    body: "Spa rituals and Historia Fitness — restoration timed between temples and sunset sails.",
  },
] as const;

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [lineRight, lineLeft] = splitHeroTitle(HIGHLIGHTS_PAGE.hero.title);
  useHathorLuxBodyMotion(rootRef);

  const panels = [
    ...HIGHLIGHTS_PAGE.landmarks.map((landmark, index) => ({
      kicker: "Landmark",
      title: landmark.title,
      body: landmark.body,
      src: PANEL_IMAGES[index]!,
    })),
    ...EXTRA_PANELS.map((panel, index) => ({
      ...panel,
      src: PANEL_IMAGES[index + 3]!,
    })),
  ];

  return (
    <div ref={rootRef} className="venetian-page lux-page">
      <PublicSiteHero
        lineRight={lineRight}
        lineLeft={lineLeft}
        subtitle={HIGHLIGHTS_PAGE.hero.subtitle}
        posterImageName="highlights-hero"
      />

      <section className="hlx" id="programs">
        <header className="hlx-head">
          <p className="lux-kicker" data-lux-reveal>
            The Hathor Experience
          </p>
          <h2 className="lux-gold lux-gold-xl" data-lux-title>
            {HIGHLIGHTS_PAGE.hero.title}
          </h2>
          <p className="lux-lead" data-lux-reveal>
            {HIGHLIGHTS_PAGE.hero.subtitle}
          </p>
          <div className="lux-copy" data-lux-reveal>
            {HIGHLIGHTS_PAGE.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
          <BookNowTrigger className="btn btn-dark" data-lux-reveal>
            Book Your Cruise Now
          </BookNowTrigger>
        </header>

        <div className="hlx-pin">
          <div className="hlx-track" id="hlx-track">
            {panels.map((panel, index) => (
              <article key={panel.title} className="hlx-panel">
                <div className="hlx-panel-media">
                  <div className="lux-mask">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={panel.src} alt={panel.title} />
                  </div>
                </div>
                <div className="hlx-panel-copy">
                  <div className="hlx-panel-num">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <p className="lux-kicker">{panel.kicker}</p>
                  <h3>{panel.title}</h3>
                  <p>{panel.body}</p>
                  <BookNowTrigger className="btn btn-dark">
                    Book Your Cruise Now
                  </BookNowTrigger>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="hlx-progress" aria-hidden="true">
          {panels.map((panel) => (
            <span key={panel.title}>
              <i />
            </span>
          ))}
        </div>
      </section>

      <section className="hlx-manifesto">
        <div className="hlx-manifesto-grid">
          <article className="hlx-manifesto-item">
            <p className="lux-kicker">I</p>
            <h3>Private by design</h3>
            <p>
              No crowds. No theatre. Only the Nile, your suite, and a crew that listens
              as carefully as they serve.
            </p>
          </article>
          <article className="hlx-manifesto-item">
            <p className="lux-kicker">II</p>
            <h3>Temples by day</h3>
            <p>
              Landmarks paced with grace — Unfinished Obelisk, Hatshepsut, Valley of
              the Kings — then return to river quiet.
            </p>
          </article>
          <article className="hlx-manifesto-item">
            <p className="lux-kicker">III</p>
            <h3>Voyage-native</h3>
            <p>
              Dining, spa, and rest bend to itinerary: ports, walls of light, and gold
              hour decks are part of the protocol.
            </p>
          </article>
        </div>
      </section>

      <section className="hlx-compare">
        <div className="hlx-compare-inner">
          <div className="hlx-compare-row is-head">
            <span>Inclusion</span>
            <span>Scheduled Voyage</span>
            <span>Private Charter</span>
          </div>
          <div className="hlx-compare-row">
            <strong>Cabins &amp; suites</strong>
            <span>Per booking</span>
            <span>Full ship</span>
          </div>
          <div className="hlx-compare-row">
            <strong>Itinerary</strong>
            <span>Fixed sailings</span>
            <span>Your route</span>
          </div>
          <div className="hlx-compare-row">
            <strong>Dining &amp; spa</strong>
            <span>Included onboard</span>
            <span>Fully composed</span>
          </div>
          <div className="hlx-compare-row">
            <strong>Privacy</strong>
            <span>Intimate ship</span>
            <span>Yours alone</span>
          </div>
        </div>
      </section>

      <section className="cta-section" id="reserve">
        <div className="cta-inner">
          <h2 className="lux-gold lux-gold-md" data-lux-title>
            Book Your Cruise Now
          </h2>
          <p data-lux-reveal>
            Reserve your voyage and unlock the Hathor highlights — temples, suites, and
            river cinema composed entirely around you.
          </p>
          <BookNowTrigger className="btn btn-filled">
            Book Your Cruise Now
          </BookNowTrigger>
          <div style={{ marginTop: "1rem" }}>
            <Link className="btn btn-dark" href="/cruises">
              View Voyages
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
