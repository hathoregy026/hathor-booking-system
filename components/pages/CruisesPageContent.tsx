"use client";

import { CtaBand } from "@/components/pages/CtaBand";
import {
  CruisesListingProvider,
  CruisesPageFilters,
  CruisesPageListingsGrid,
} from "@/components/pages/CruisesPageListings";
import { CruisesHero } from "@/components/pages/CruisesHero";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";

export function CruisesPageContent() {
  return (
    <CruisesListingProvider cruises={HATHOR_CRUISES}>
      <div className="cruises-page">
        <CruisesHero
          eyebrow="Ultra Luxury"
          title="Dahabiya Cruise"
          subtitle="Your Luxury Trip Begins With Hathor Dahabiya"
          breadcrumb="Cruises"
          imageName="cruises-hero"
        />

        <div className="cruises-sheet">
          <div className="cruises-sheet__edge" aria-hidden="true" />

          <header className="cruises-sheet__header hathor-container">
            <h2 className="cruises-sheet__title">{CRUISES_PAGE.hero.title}</h2>
          </header>

          <div className="cruises-sheet__filters">
            <CruisesPageFilters />
          </div>

          <div className="cruises-sheet__body">
            <CruisesPageListingsGrid />
            <CtaBand />
          </div>
        </div>
      </div>
    </CruisesListingProvider>
  );
}
