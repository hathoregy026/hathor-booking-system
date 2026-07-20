"use client";

import { useRef } from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PublicSiteHero } from "@/components/pages/PublicSiteHero";
import { ManagedImage } from "@/components/ui/ManagedImage";
import { useHathorLuxBodyMotion } from "@/hooks/useHathorLuxBodyMotion";
import { splitHeroTitle } from "@/lib/split-hero-title";
import { HIGHLIGHTS_PAGE } from "@/lib/page-content";

const LANDMARK_IMAGES = [
  "landmark-obelisk",
  "landmark-hatshepsut",
  "landmark-valley-kings",
] as const;

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [lineRight, lineLeft] = splitHeroTitle(HIGHLIGHTS_PAGE.hero.title);
  useHathorLuxBodyMotion(rootRef);

  return (
    <div ref={rootRef} className="hathor-lux">
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
          <div data-lux-reveal>
            <BookNowTrigger className="btn btn-filled">Book Now</BookNowTrigger>
          </div>
        </header>

        <div className="hlx-pin">
          <div className="hlx-track" id="hlx-track">
            {HIGHLIGHTS_PAGE.landmarks.map((landmark, index) => (
              <article
                key={landmark.title}
                className="hlx-panel"
                id={`site-image-${LANDMARK_IMAGES[index]}`}
                data-site-image={LANDMARK_IMAGES[index]}
              >
                <div className="hlx-panel-media">
                  <div className="lux-mask">
                    <ManagedImage
                      name={LANDMARK_IMAGES[index]!}
                      alt={landmark.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 88vw, 45vw"
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>
                </div>
                <div className="hlx-panel-copy">
                  <div className="hlx-panel-num">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3>{landmark.title}</h3>
                  <p>{landmark.body}</p>
                  <Link className="btn btn-dark" href="/cruises">
                    Sail this route
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="hlx-progress" aria-hidden>
          {HIGHLIGHTS_PAGE.landmarks.map((landmark) => (
            <span key={landmark.title}>
              <i />
            </span>
          ))}
        </div>

        <section className="hlx-manifesto">
          <div className="hlx-manifesto-grid">
            <article className="hlx-manifesto-item" data-lux-reveal>
              <p className="lux-kicker">Privacy</p>
              <h3>Intimate Dahabiya</h3>
              <p>
                Eight cabins and four suites — including two royal — for a
                quieter, more personal Nile voyage.
              </p>
            </article>
            <article className="hlx-manifesto-item" data-lux-reveal>
              <p className="lux-kicker">Gastronomy</p>
              <h3>Flavors of Egypt</h3>
              <p>
                Expertly prepared dishes where authentic Egyptian flavors meet
                international cuisine — fresh, daily, onboard.
              </p>
            </article>
            <article className="hlx-manifesto-item" data-lux-reveal>
              <p className="lux-kicker">Hospitality</p>
              <h3>Attentive care</h3>
              <p>
                Warm service and refined atmosphere — every detail tended so you
                can simply watch the Nile unfold.
              </p>
            </article>
          </div>
        </section>

        <section className="cta-section">
          <div className="cta-inner">
            <h2 className="lux-gold lux-gold-md" data-lux-title>
              Begin your Nile chapter
            </h2>
            <p data-lux-reveal>
              Pair these landmarks with an exclusive Hathor itinerary between
              Luxor and Aswan.
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
      </section>
    </div>
  );
}
