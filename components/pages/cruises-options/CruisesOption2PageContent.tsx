"use client";

import {
  CruisesListingProvider,
  CruisesPageFilters,
} from "@/components/pages/CruisesPageListings";
import { CruisesOption2SpaTransition } from "@/components/pages/cruises-options/CruisesOption2SpaTransition";
import { CruisesOptionBody } from "@/components/pages/cruises-options/CruisesOptionBody";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";

/** Option 2 — spa one-elevator (sticky stage, no pin-spacer dead zone). */
export function CruisesOption2PageContent() {
  return (
    <CruisesListingProvider cruises={HATHOR_CRUISES}>
      <div className="cruises-option-2-root">
        <CruisesOption2SpaTransition
          heroTitle="Experience Egypt."
          title={CRUISES_PAGE.hero.title}
          breadcrumb="Cruises"
          imageName="cruises-hero"
          sheetBelowLanding={<CruisesPageFilters />}
        >
          <CruisesOptionBody />
        </CruisesOption2SpaTransition>
      </div>
    </CruisesListingProvider>
  );
}
