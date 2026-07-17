"use client";

import { MarketingCtaBand } from "@/components/pages/MarketingCtaBand";
import { PublicSiteHero } from "@/components/pages/PublicSiteHero";
import {
  CruisesListingProvider,
  CruisesPageFilters,
  CruisesPageListingsGrid,
} from "@/components/pages/CruisesPageListings";
import { splitHeroTitle } from "@/lib/split-hero-title";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";

export function CruisesPageContent() {
  const [lineRight, lineLeft] = splitHeroTitle(CRUISES_PAGE.hero.title);

  return (
    <CruisesListingProvider cruises={HATHOR_CRUISES}>
      <div className="cruises-page">
        <PublicSiteHero
          lineRight={lineRight}
          lineLeft={lineLeft}
          subtitle={CRUISES_PAGE.hero.subtitle}
          posterImageName="cruises-hero"
        />

        <div className="cruises-sheet">
          <header className="cruises-sheet__header hathor-container">
            <h2 className="cruises-sheet__title">{CRUISES_PAGE.hero.title}</h2>
          </header>

          <div className="cruises-sheet__filters">
            <CruisesPageFilters />
          </div>

          <div className="cruises-sheet__body">
            <CruisesPageListingsGrid />
            <MarketingCtaBand />
          </div>
        </div>
      </div>
    </CruisesListingProvider>
  );
}
