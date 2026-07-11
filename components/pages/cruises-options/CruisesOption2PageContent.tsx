"use client";

import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { CruisesPageFilters } from "@/components/pages/CruisesPageListings";
import { CruisesOptionBody } from "@/components/pages/cruises-options/CruisesOptionBody";
import { CRUISES_PAGE } from "@/lib/page-content";

/** Option 2 — one elevator: all listings inside the rising cream sheet. */
export function CruisesOption2PageContent() {
  return (
    <div className="cruises-option-2-root" data-cruises-option-2>
      <PageScrollTransition
        heroTitle="Experience Egypt."
        title={CRUISES_PAGE.hero.title}
        breadcrumb="Cruises"
        imageName="cruises-hero"
        sheetBelowLanding={<CruisesPageFilters />}
      >
        <CruisesOptionBody />
      </PageScrollTransition>
    </div>
  );
}
