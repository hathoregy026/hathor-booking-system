"use client";

import { useRef } from "react";
import Link from "next/link";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import { PublicSiteHero } from "@/components/pages/PublicSiteHero";
import {
  CruisesListingProvider,
  CruisesPageFilters,
  CruisesPageListingsGrid,
} from "@/components/pages/CruisesPageListings";
import { useCruisesRedesignMotion } from "@/hooks/useCruisesRedesignMotion";
import { splitHeroTitle } from "@/lib/split-hero-title";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";

export function CruisesPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [lineRight, lineLeft] = splitHeroTitle(CRUISES_PAGE.hero.title);
  useCruisesRedesignMotion(rootRef);

  return (
    <CruisesListingProvider cruises={HATHOR_CRUISES}>
      <div ref={rootRef} className="venetian-page page-cruises cruises-page">
        <PublicSiteHero
          lineRight={lineRight}
          lineLeft={lineLeft}
          subtitle={CRUISES_PAGE.hero.subtitle}
          posterImageName="cruises-hero"
        />

        <section className="about-section cruise-intro" id="intro">
          <div className="section-inner cruise-intro-inner">
            <p className="cruise-eyebrow cruise-reveal">The Collection</p>
            <h2 className="cruise-intro-title">
              <span className="cruise-intro-line">Voyages composed</span>
              <span className="cruise-intro-line">like a ritual.</span>
            </h2>
            <p className="cruise-intro-copy cruise-reveal">
              Each Hathor cruise is a carefully paced escape — Nile-view suites that open
              to the river, gold-hour decks, and service that anticipates without
              interruption. Choose a voyage, check availability, and reserve your place
              onboard.
            </p>
            <div className="cruise-stats cruise-reveal">
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
              <p className="cruise-eyebrow cruise-reveal">Onboard</p>
              <h2 className="cruise-exp-title">
                <span className="cruise-intro-line">The river does not</span>
                <span className="cruise-intro-line">end at the shore.</span>
              </h2>
              <ul className="cruise-exp-list">
                <li className="cruise-reveal">Seneb Spa rituals with Nile light</li>
                <li className="cruise-reveal">Panoramic suites &amp; private decks</li>
                <li className="cruise-reveal">Historia Fitness overlooking the river</li>
                <li className="cruise-reveal">Candlelit dining under Egyptian stars</li>
              </ul>
            </div>
            <div className="cruise-exp-visual cruise-reveal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/pages-redesign/escape.webp"
                alt="Quiet luxury detail aboard Hathor"
              />
            </div>
          </div>
        </section>

        <section className="cta-section" id="book">
          <div className="cta-inner">
            <h2>Reserve your voyage</h2>
            <p>
              Tell us when you wish to sail. We will confirm suite availability and craft
              the rest around you.
            </p>
            <BookNowTrigger className="btn btn-filled">Explore Voyages</BookNowTrigger>
            <div style={{ marginTop: "1rem" }}>
              <Link className="btn btn-dark" href="/rooms">
                Accommodation
              </Link>
            </div>
          </div>
        </section>
      </div>
    </CruisesListingProvider>
  );
}
