"use client";

import { CtaBand } from "@/components/pages/CtaBand";
import {
  CruisesListingProvider,
  CruisesPageFilters,
  CruisesPageListingsGrid,
} from "@/components/pages/CruisesPageListings";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";

export function CruisesPageContent() {
  return (
    <CruisesListingProvider cruises={HATHOR_CRUISES}>
      <PageScrollTransition
        title={CRUISES_PAGE.hero.title}
        subtitle={CRUISES_PAGE.hero.subtitle}
        breadcrumb="Cruises"
        imageName="cruises-hero"
        sheetBelowLanding={<CruisesPageFilters />}
      >
        <div className="page-layout__main">
          <CruisesPageListingsGrid />
        </div>
        <CtaBand />
      </PageScrollTransition>
    </CruisesListingProvider>
  );
}
