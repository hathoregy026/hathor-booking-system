"use client";

import { useRef } from "react";
import {
  CruisesListingProvider,
  CruisesPageFilters,
} from "@/components/pages/CruisesPageListings";
import { CruisesOption4SpaHero } from "@/components/pages/cruises-options/CruisesOption4SpaHero";
import { CruisesOptionBody } from "@/components/pages/cruises-options/CruisesOptionBody";
import { useCruisesOption4ListingsEntrance } from "@/hooks/useCruisesOption4ListingsEntrance";
import { CRUISES_PAGE } from "@/lib/page-content";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";

/**
 * Option 4 — Stripe wipe hero, then title/filters/listings in normal flow.
 */
export function CruisesOption4PageContent() {
  const listingsRef = useRef<HTMLElement>(null);
  useCruisesOption4ListingsEntrance(listingsRef);

  return (
    <CruisesListingProvider cruises={HATHOR_CRUISES}>
      <div className="cruises-option-4-root">
        <CruisesOption4SpaHero
          heroTitle="Experience Egypt."
          breadcrumb="Cruises"
          imageName="cruises-hero"
        />

        <section className="co4-main" aria-label="Cruise discovery">
          <div className="co4-intro hathor-container">
            <h2 className="co4-intro__title">{CRUISES_PAGE.hero.title}</h2>
            <div className="co4-intro__filters">
              <CruisesPageFilters />
            </div>
          </div>
        </section>

        <section
          ref={listingsRef}
          className="co4-listings cruises-option-4-listings"
          aria-label="Cruise listings"
        >
          <CruisesOptionBody />
        </section>
      </div>
    </CruisesListingProvider>
  );
}
