"use client";

import { CtaBand } from "@/components/pages/CtaBand";
import {
  CruisesListingProvider,
  CruisesPageFilters,
  CruisesPageListingsGrid,
} from "@/components/pages/CruisesPageListings";
import { CruisesFooter } from "@/components/pages/CruisesFooter";
import { CruisesFooterGiantLogo } from "@/components/pages/CruisesFooterGiantLogo";
import { CruisesPageTransition } from "@/components/pages/CruisesPageTransition";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";

export function CruisesPageContent() {
  return (
    <CruisesListingProvider cruises={HATHOR_CRUISES}>
      <div className="cruises-scroll-root">
        <CruisesPageTransition
          title={CRUISES_PAGE.hero.title}
          heroTitle="Experience Egypt."
          subtitle={CRUISES_PAGE.hero.subtitle}
          breadcrumb="Cruises"
          imageName="cruises-hero"
          sheetBelowLanding={<CruisesPageFilters />}
        >
          <CruisesPageListingsGrid />
          <CtaBand />
        </CruisesPageTransition>

        <div className="cruises-column-tail">
          <CruisesFooterGiantLogo />
          <CruisesFooter />
        </div>
      </div>
    </CruisesListingProvider>
  );
}
