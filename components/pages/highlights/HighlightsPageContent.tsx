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
    <div ref={rootRef} className="venetian-page lux-page">
      <PublicSiteHero
        heroPage="highlights"
        lineRight={lineRight}
        lineLeft={lineLeft}
        subtitle={HIGHLIGHTS_PAGE.hero.subtitle}
        posterImageName="highlights-hero"
      />

      <section className="hlx" id="programs">
        <header className="hlx-head">
          <h2 className="lux-gold lux-gold-xl" data-lux-title>
            {HIGHLIGHTS_PAGE.hero.title}
          </h2>
          <p className="lux-kicker" data-lux-reveal>
            The Hathor Experience
          </p>
          <p className="lux-lead" data-lux-reveal>
            {HIGHLIGHTS_PAGE.hero.subtitle}
          </p>
          <div className="lux-copy" data-lux-reveal>
            {HIGHLIGHTS_PAGE.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </div>
          <BookNowTrigger className="btn btn-dark" data-lux-reveal>
            Book Now
          </BookNowTrigger>
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
                  <p className="lux-kicker">Landmark</p>
                  <p>{landmark.body}</p>
                  <Link className="btn btn-dark" href="/cruises">
                    View Route
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="hlx-progress" aria-hidden="true">
          {HIGHLIGHTS_PAGE.landmarks.map((landmark) => (
            <span key={landmark.title}>
              <i />
            </span>
          ))}
        </div>
      </section>

      <section className="hlx-manifesto">
        <div className="hlx-manifesto-grid">
          <article className="hlx-manifesto-item">
            <h3>Private by design</h3>
            <p className="lux-kicker">I</p>
            <p>
              Intimate Dahabiya sailing — cabins and suites composed for Nile light and
              unhurried hospitality.
            </p>
          </article>
          <article className="hlx-manifesto-item">
            <h3>Temples by day</h3>
            <p className="lux-kicker">II</p>
            <p>
              Ancient wonders paced with grace — then return to river quiet aboard Hathor.
            </p>
          </article>
          <article className="hlx-manifesto-item">
            <h3>Voyage-native</h3>
            <p className="lux-kicker">III</p>
            <p>
              Dining, spa, and rest bend to itinerary along Luxor and Aswan.
            </p>
          </article>
        </div>
      </section>

      <section className="cta-section" id="reserve">
        <div className="cta-inner hathor-cta-copy">
          <h2 className="lux-gold lux-gold-md" data-lux-title>
            Book Your Cruise Now
          </h2>
          <p data-lux-reveal>
            Reserve your voyage and experience Hathor highlights on the Nile.
          </p>
          <div className="hathor-cta-actions">
            <BookNowTrigger className="btn btn-filled">Book Now</BookNowTrigger>
            <Link className="btn btn-dark" href="/cruises">
              View Voyages
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
