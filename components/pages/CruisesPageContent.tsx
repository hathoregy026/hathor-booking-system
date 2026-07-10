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
          subtitle={CRUISES_PAGE.hero.subtitle}
          breadcrumb="Cruises"
          imageName="cruises-hero"
        />

        <section
          className="cruises-content-section"
          aria-labelledby="cruises-landing-title"
        >
          <div className="pt-sheet__landing">
            <div className="hathor-container">
              <h2 id="cruises-landing-title" className="pt-sheet__landing-title">
                {CRUISES_PAGE.hero.title}
              </h2>
            </div>
          </div>

          <div className="pt-sheet__filters">
            <CruisesPageFilters />
          </div>

          <div className="pt-sheet__rise-cap" aria-hidden="true" />

          <div className="pt-sheet__content">
            <CruisesPageListingsGrid />
            <CtaBand />
          </div>

          <div className="cruises-column-tail">
            <CruisesFooter />
          </div>
        </section>
      </div>
    </CruisesListingProvider>
  );
}
