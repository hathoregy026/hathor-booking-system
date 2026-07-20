"use client";

import { useRef } from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHathorLuxBodyMotion } from "@/hooks/useHathorLuxBodyMotion";
import { GASTRONOMY_PAGE } from "@/lib/page-content";

const CHAPTERS = [
  {
    kicker: "01 / Service",
    title: GASTRONOMY_PAGE.restaurant.title,
    body: GASTRONOMY_PAGE.restaurant.service,
    imageName: "gastronomy-restaurant" as const,
    right: false,
  },
  {
    kicker: "02 / Atmosphere",
    title: GASTRONOMY_PAGE.restaurant.atmosphereTitle,
    body: GASTRONOMY_PAGE.restaurant.atmosphere,
    imageName: "gastronomy-hero" as const,
    right: true,
  },
  {
    kicker: "03 / Memory",
    title: "Meals that linger",
    body: GASTRONOMY_PAGE.restaurant.closing,
    imageName: "gastronomy-restaurant" as const,
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
              Dining aboard Hathor
            </p>
            <h2 className="lux-gold lux-gold-xl" data-lux-title>
              {GASTRONOMY_PAGE.hero.subtitle}
            </h2>
            <p className="lux-lead" data-lux-reveal>
              A sensory journey through Egypt&apos;s culinary heritage on the Nile.
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
                  <ManagedImage
                    name={chapter.imageName}
                    alt={chapter.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    previewAnchor={!chapter.right}
                  />
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
                {chapter.kicker === "03 / Memory" ? (
                  <BookNowTrigger className="btn btn-dark">Book Now</BookNowTrigger>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <section className="spx-suite" id="venues">
          <div className="lux-wrap">
            <header className="spx-intro" style={{ paddingTop: 0, paddingBottom: "2rem" }}>
              <p className="lux-kicker" data-lux-reveal>
                Venues
              </p>
              <h2 className="lux-gold lux-gold-lg" data-lux-title>
                Where you dine
              </h2>
            </header>
            <div className="spx-suite-grid">
              {GASTRONOMY_PAGE.venues.map((venue) => (
                <article key={venue.title} className="spx-suite-card">
                  <div className="spx-suite-body">
                    <h3>{venue.title}</h3>
                    <p>{venue.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-section" id="reserve">
          <div className="cta-inner">
            <h2 className="lux-gold lux-gold-md" data-lux-title>
              Reserve Your Table
            </h2>
            <p data-lux-reveal>
              Request a table when you are ready to linger aboard Hathor Dahabiya.
            </p>
            <BookNowTrigger className="btn btn-filled">Book Now</BookNowTrigger>
            <div style={{ marginTop: "1rem" }}>
              <Link className="btn btn-dark" href="/wellness">
                Wellness
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PageScrollTransition>
  );
}
