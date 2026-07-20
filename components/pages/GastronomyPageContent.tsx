"use client";

import { useRef } from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { useHathorLuxBodyMotion } from "@/hooks/useHathorLuxBodyMotion";
import { GASTRONOMY_PAGE } from "@/lib/page-content";

const CHAPTERS = [
  {
    kicker: "First Light",
    title: "The opening breath",
    body: GASTRONOMY_PAGE.restaurant.service,
    src: "/pages-redesign/dining-1.webp",
    right: false,
  },
  {
    kicker: "Deep Ember",
    title: GASTRONOMY_PAGE.restaurant.atmosphereTitle,
    body: GASTRONOMY_PAGE.restaurant.atmosphere,
    src: "/pages-redesign/dining-2.webp",
    right: true,
  },
  {
    kicker: "Last Whisper",
    title: "A finish that lingers",
    body: GASTRONOMY_PAGE.restaurant.closing,
    src: "/pages-redesign/dining-hero.webp",
    right: false,
  },
] as const;

export function GastronomyPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useHathorLuxBodyMotion(rootRef);

  return (
    <PageScrollTransition
      title={GASTRONOMY_PAGE.hero.title}
      subtitle={GASTRONOMY_PAGE.hero.subtitle}
      breadcrumb="Dining"
      imageName="gastronomy-hero"
    >
      <div ref={rootRef} className="venetian-page lux-page">
        <section className="dnx" id="table">
          <div className="lux-end" style={{ paddingBottom: "2rem" }}>
            <p className="lux-kicker" data-lux-reveal>
              03 / Gastronomy
            </p>
            <h2 className="lux-gold lux-gold-xl" data-lux-title>
              {GASTRONOMY_PAGE.hero.subtitle}
            </h2>
            <p className="lux-lead" data-lux-reveal>
              A sensory voyage where every plate tells a story of the Nile.
            </p>
            <div className="lux-copy" data-lux-reveal>
              {GASTRONOMY_PAGE.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </div>

          {CHAPTERS.map((chapter) => (
            <article
              key={chapter.kicker}
              className={`dnx-chapter${chapter.right ? " dnx-chapter--right" : ""}`}
            >
              <div className="dnx-chapter-media">
                <div className="lux-mask">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={chapter.src} alt={chapter.title} />
                </div>
              </div>
              <div className="dnx-chapter-shade" aria-hidden="true" />
              <div className="dnx-panel">
                <p className="lux-kicker">{chapter.kicker}</p>
                <h3 className="lux-gold lux-gold-md" data-lux-title>
                  {chapter.title}
                </h3>
                <div className="lux-copy">
                  <p>{chapter.body}</p>
                </div>
                {chapter.kicker === "Last Whisper" ? (
                  <BookNowTrigger className="btn btn-dark">
                    Reserve Your Table
                  </BookNowTrigger>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <section className="cta-section" id="reserve">
          <div className="cta-inner">
            <h2 className="lux-gold lux-gold-md" data-lux-title>
              Reserve Your Table
            </h2>
            <p data-lux-reveal>
              An evening held for few. Request a table when you are ready to linger
              aboard Hathor Dahabiya.
            </p>
            <BookNowTrigger className="btn btn-filled">
              Book Your Cruise Now
            </BookNowTrigger>
            <div style={{ marginTop: "1rem" }}>
              <Link className="btn btn-dark" href="/wellness">
                Return to Wellness
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
