"use client";

import { useRef } from "react";
import {
  CruisesListingProvider,
  CruisesPageFilters,
} from "@/components/pages/CruisesPageListings";
import { CruisesOption4SpaHero } from "@/components/pages/cruises-options/CruisesOption4SpaHero";
import { CruisesOptionBody } from "@/components/pages/cruises-options/CruisesOptionBody";
import { useCruisesOption4ListingsEntrance } from "@/hooks/useCruisesOption4ListingsEntrance";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";

/**
 * Option 4 — Venetian stripes + flat horizon rail (no dome).
 * Listings/footer in normal document flow (filter-safe).
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
          sheetBelowLanding={<CruisesPageFilters />}
        />
        <section
          ref={listingsRef}
          className="cruises-option-4-listings"
          aria-label="Cruise listings"
        >
          <CruisesOptionBody />
        </section>
      </div>
    </CruisesListingProvider>
  );
}
