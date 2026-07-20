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
      <div ref={rootRef} className="hathor-lux">
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
                  />
                </div>
              </div>
              <div className="dnx-chapter-shade" aria-hidden />
              <div className="dnx-panel">
                <p className="lux-kicker">{chapter.kicker}</p>
                <h3 className="lux-gold lux-gold-md" data-lux-title>
                  {chapter.title}
                </h3>
                <div className="lux-copy">
                  <p>{chapter.body}</p>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="lux-shell" style={{ padding: "clamp(4rem, 8vw, 6rem) 0" }}>
          <div className="lux-wrap">
            <p className="lux-kicker" data-lux-reveal>
              Onboard venues
            </p>
            <h2 className="lux-gold lux-gold-lg" data-lux-title>
              Dining &amp; Lounge
            </h2>
            <div
              className="spx-suite-grid"
              style={{ marginTop: "2.5rem" }}
            >
              {GASTRONOMY_PAGE.venues.map((venue, index) => (
                <article key={venue.title} className="spx-suite-card">
                  <div className="lux-mask">
                    <ManagedImage
                      name={
                        index % 2 === 0
                          ? "gastronomy-hero"
                          : "gastronomy-restaurant"
                      }
                      alt={venue.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
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
          <div className="cta-inner lux-end">
            <h2 className="lux-gold lux-gold-md" data-lux-title>
              Taste the Nile
            </h2>
            <p data-lux-reveal>
              Reserve your voyage and savor every moment — from sunrise
              breakfasts to candlelit dinners under the stars.
            </p>
            <div
              data-lux-reveal
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <BookNowTrigger className="btn btn-filled">Book Now</BookNowTrigger>
              <Link className="btn btn-dark" href="/cruises">
                View Cruises
              </Link>
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
