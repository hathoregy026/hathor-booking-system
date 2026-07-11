"use client";

import { CruisesPageFilters } from "@/components/pages/CruisesPageListings";
import { CruisesOption3ScrollReveal } from "@/components/pages/cruises-options/CruisesOption3ScrollReveal";
import { CruisesOptionBody } from "@/components/pages/cruises-options/CruisesOptionBody";
import { CRUISES_PAGE } from "@/lib/page-content";

/** Option 3 — two layers: pinned animation + synced content column. */
export function CruisesOption3PageContent() {
  return (
    <div className="cruises-option-3-root">
      <CruisesOption3ScrollReveal
        heroTitle="Experience Egypt."
        title={CRUISES_PAGE.hero.title}
        breadcrumb="Cruises"
        imageName="cruises-hero"
        sheetBelowLanding={<CruisesPageFilters />}
      >
        <CruisesOptionBody />
      </CruisesOption3ScrollReveal>
    </div>
  );
}
