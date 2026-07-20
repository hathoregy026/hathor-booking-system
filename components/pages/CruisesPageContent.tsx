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

export function CruisesPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [lineRight, lineLeft] = splitHeroTitle(CRUISES_PAGE.hero.title);
  useHathorLuxBodyMotion(rootRef);

  const totalRooms = HATHOR_CRUISES.reduce(
    (sum, cruise) => sum + cruise.rooms.length,
    0,
  );
  const nightOptions = [...new Set(HATHOR_CRUISES.map((c) => c.nights))].length;

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
              <h2 className="lux-gold lux-gold-xl" data-lux-title>
                {CRUISES_PAGE.sectionTitle}
              </h2>
              <p className="cruise-intro-copy" data-lux-reveal>
                {CRUISES_PAGE.hero.subtitle}
              </p>
              <div className="cruise-stats" data-lux-reveal>
                <div className="cruise-stat">
                  <span className="cruise-stat-num">{HATHOR_CRUISES.length}</span>
                  <span className="cruise-stat-label">Itineraries</span>
                </div>
                <div className="cruise-stat">
                  <span className="cruise-stat-num">{nightOptions}</span>
                  <span className="cruise-stat-label">Duration options</span>
                </div>
                <div className="cruise-stat">
                  <span className="cruise-stat-num">{totalRooms}</span>
                  <span className="cruise-stat-label">Cabin listings</span>
                </div>
              </div>
            </div>
          </section>

          <div className="cruise-filter-bar" aria-label="Filter voyages">
            <CruisesPageFilters />
          </div>

          <div className="cruise-grid-section" id="voyage-grid">
            <CruisesPageListingsGrid />
          </div>

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
