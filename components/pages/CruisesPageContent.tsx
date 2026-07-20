"use client";

import { useRef } from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { MarketingCtaBand } from "@/components/pages/MarketingCtaBand";
import { PublicSiteHero } from "@/components/pages/PublicSiteHero";
import {
  CruisesListingProvider,
  CruisesPageFilters,
  CruisesPageListingsGrid,
} from "@/components/pages/CruisesPageListings";
import { useHathorLuxBodyMotion } from "@/hooks/useHathorLuxBodyMotion";
import { splitHeroTitle } from "@/lib/split-hero-title";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";
import { ManagedImage } from "@/components/ui/ManagedImage";

export function CruisesPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [lineRight, lineLeft] = splitHeroTitle(CRUISES_PAGE.hero.title);
  useHathorLuxBodyMotion(rootRef);

  return (
    <CruisesListingProvider cruises={HATHOR_CRUISES}>
      <div ref={rootRef} className="hathor-lux page-cruises cruises-page">
        <PublicSiteHero
          lineRight={lineRight}
          lineLeft={lineLeft}
          subtitle={CRUISES_PAGE.hero.subtitle}
          posterImageName="cruises-hero"
        />

        <div className="cruises-sheet">
          <section className="cruise-intro" id="intro">
            <div className="cruise-intro-inner">
              <p className="cruise-eyebrow" data-lux-reveal>
                Hathor Voyages
              </p>
              <h2 className="cruise-intro-title" data-lux-title>
                <span className="cruise-intro-line">Voyages composed</span>
                <span className="cruise-intro-line">like a ritual.</span>
              </h2>
              <p className="cruise-intro-copy" data-lux-reveal>
                Each Hathor sailing is a carefully paced escape — Nile-view suites,
                gold-hour decks, and service that anticipates without interruption.
                Choose a voyage, check availability, and reserve your place onboard.
              </p>
              <div className="cruise-stats" data-lux-reveal>
                <div className="cruise-stat">
                  <span className="cruise-stat-num">{HATHOR_CRUISES.length}</span>
                  <span className="cruise-stat-label">Itineraries</span>
                </div>
                <div className="cruise-stat">
                  <span className="cruise-stat-num">12</span>
                  <span className="cruise-stat-label">Cabins &amp; Suites</span>
                </div>
                <div className="cruise-stat">
                  <span className="cruise-stat-num">∞</span>
                  <span className="cruise-stat-label">Quiet Hours</span>
                </div>
              </div>
            </div>
          </section>

          <section className="cruise-filter-bar" aria-label="Filter voyages">
            <CruisesPageFilters />
          </section>

          <section className="cruise-grid-section" id="voyage-grid">
            <CruisesPageListingsGrid />
          </section>

          <section className="cruise-experience">
            <div className="cruise-experience-inner">
              <div className="cruise-exp-copy">
                <p className="cruise-eyebrow" data-lux-reveal>
                  Onboard
                </p>
                <h2 className="cruise-exp-title" data-lux-title>
                  <span className="cruise-intro-line">The river does not</span>
                  <span className="cruise-intro-line">end at the shore.</span>
                </h2>
                <ul className="cruise-exp-list">
                  <li data-lux-reveal>Seneb Spa rituals with Nile light</li>
                  <li data-lux-reveal>Panoramic suites &amp; private decks</li>
                  <li data-lux-reveal>Historia Fitness overlooking the river</li>
                  <li data-lux-reveal>Candlelit dining under Egyptian stars</li>
                </ul>
              </div>
              <div className="cruise-exp-visual" data-lux-reveal>
                <ManagedImage
                  name="wellness-hero"
                  alt="Wellness and spa aboard Hathor Dahabiya"
                  fill
                  className="object-cover"
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              </div>
            </div>
          </section>

          <section className="lux-shell" style={{ padding: "clamp(3rem, 7vw, 5rem) 0" }}>
            <div className="lux-wrap" style={{ textAlign: "center" }}>
              <p className="lux-kicker" data-lux-reveal>
                Continue exploring
              </p>
              <h3 className="lux-gold lux-gold-md" data-lux-title>
                Suites, dining &amp; wellness
              </h3>
              <div
                data-lux-reveal
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  marginTop: "1.5rem",
                }}
              >
                <Link className="btn btn-dark" href="/rooms">
                  Accommodation
                </Link>
                <Link className="btn btn-dark" href="/gastronomy">
                  Dining
                </Link>
                <Link className="btn btn-dark" href="/wellness">
                  Wellness
                </Link>
                <Link className="btn btn-dark" href="/highlights">
                  Highlights
                </Link>
                <BookNowTrigger className="btn btn-filled">Book Now</BookNowTrigger>
              </div>
            </div>
          </section>

          <MarketingCtaBand />
        </div>
      </div>
    </CruisesListingProvider>
  );
}
