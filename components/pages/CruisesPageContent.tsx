"use client";

import { CtaBand } from "@/components/pages/CtaBand";
import { CruisesScrollReveal } from "@/components/pages/CruisesScrollReveal";
import {
  CruisesListingProvider,
  CruisesPageFilters,
  CruisesPageListingsGrid,
} from "@/components/pages/CruisesPageListings";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";

export function CruisesPageContent() {
  return (
    <CruisesListingProvider cruises={HATHOR_CRUISES}>
      <CruisesScrollReveal
        title={CRUISES_PAGE.hero.title}
        subtitle={CRUISES_PAGE.hero.subtitle}
        breadcrumb="Cruises"
        imageName="cruises-hero"
        revealContent={
          <>
            <div className="cruises-scroll-reveal__landing hathor-container">
              <h2 className="cruises-scroll-reveal__landing-title">
                {CRUISES_PAGE.hero.title}
              </h2>
            </div>
            <CruisesPageFilters />
          </>
        }
      >
        <div className="page-layout__main">
          <CruisesPageListingsGrid />
        </div>
        <CtaBand />
      </CruisesScrollReveal>
    </CruisesListingProvider>
  );
}
