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
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";
import { ManagedImage } from "@/components/ui/ManagedImage";

export function CruisesPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  useCruisesRedesignMotion(rootRef);

  const totalRooms = HATHOR_CRUISES.reduce(
    (sum, cruise) => sum + cruise.rooms.length,
    0,
  );
  const nightOptions = [...new Set(HATHOR_CRUISES.map((c) => c.nights))].length;

  return (
    <CruisesListingProvider cruises={HATHOR_CRUISES}>
      <div ref={rootRef} className="venetian-page page-cruises cruises-page">
        <PublicSiteHero
          lineRight={CRUISES_PAGE.hero.title}
          lineLeft={CRUISES_PAGE.hero.secondTitle}
          subtitle={CRUISES_PAGE.hero.subtitle}
          posterImageName="cruises-hero"
        />

        <section className="about-section cruise-intro" id="intro">
          <div className="section-inner cruise-intro-inner">
            <p className="cruise-eyebrow cruise-reveal">Hathor Voyages</p>
            <h2 className="cruise-intro-title">
              <span className="cruise-intro-line">{CRUISES_PAGE.sectionTitle}</span>
            </h2>
            <p className="cruise-intro-copy cruise-reveal">
              {CRUISES_PAGE.hero.subtitle}
            </p>
            <div className="cruise-stats cruise-reveal">
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
                <span className="cruise-intro-line">Continue exploring</span>
                <span className="cruise-intro-line">aboard Hathor</span>
              </h2>
              <ul className="cruise-exp-list">
                <li className="cruise-reveal">
                  <Link href="/luxury-cabins-Nile-Cruise">Luxury Rooms</Link>
                </li>
                <li className="cruise-reveal">
                  <Link href="/rooms">Luxury Suites</Link>
                </li>
                <li className="cruise-reveal">
                  <Link href="/Luxury-Royal-Suites-Nile-Dahabiya-Cruise">
                    Royal Suites
                  </Link>
                </li>
                <li className="cruise-reveal">
                  <Link href="/gastronomy">Dining — Hathor Flavors</Link>
                </li>
              </ul>
            </div>
            <div className="cruise-exp-visual cruise-reveal">
              <ManagedImage
                name="wellness-hero"
                alt="Wellness aboard Hathor Dahabiya"
                fill
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 50vw"
              />
            </div>
          </div>
        </section>

        <section className="cta-section" id="book">
          <div className="cta-inner">
            <h2>Reserve your voyage</h2>
            <p>{CRUISES_PAGE.hero.subtitle}</p>
            <BookNowTrigger className="btn btn-filled">Book Now</BookNowTrigger>
            <div style={{ marginTop: "1rem" }}>
              <Link className="btn btn-dark" href="/luxury-cabins-Nile-Cruise">
                Luxury Rooms
              </Link>
            </div>
          </div>
        </section>
      </div>
    </CruisesListingProvider>
  );
}
