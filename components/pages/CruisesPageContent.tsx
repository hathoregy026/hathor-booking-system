"use client";

import { CtaBand } from "@/components/pages/CtaBand";
import {
  CruisesListingProvider,
  CruisesPageFilters,
  CruisesPageListingsGrid,
} from "@/components/pages/CruisesPageListings";
import { CruisesFooter } from "@/components/pages/CruisesFooter";
import { CruisesScrollReveal } from "@/components/pages/CruisesScrollReveal";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";

export function CruisesPageContent() {
  return (
    <CruisesListingProvider cruises={HATHOR_CRUISES}>
      <div className="cruises-scroll-root">
        <CruisesScrollReveal
          heroTitle="Experience Egypt."
          title={CRUISES_PAGE.hero.title}
          subtitle={CRUISES_PAGE.hero.subtitle}
          breadcrumb="Cruises"
          imageName="cruises-hero"
          sheetBelowLanding={<CruisesPageFilters />}
        >
          <CruisesPageListingsGrid />
          <CtaBand />
          <div className="cruises-column-tail">
            <CruisesFooter />
          </div>
        </CruisesScrollReveal>
      </div>
    </CruisesListingProvider>
  );
}
