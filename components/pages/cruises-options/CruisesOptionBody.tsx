"use client";

import { CtaBand } from "@/components/pages/CtaBand";
import {
  CruisesListingProvider,
  CruisesPageListingsGrid,
} from "@/components/pages/CruisesPageListings";
import { CruisesFooter } from "@/components/pages/CruisesFooter";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";

/** Shared listings block for all cruises option demos. */
export function CruisesOptionBody() {
  return (
    <CruisesListingProvider cruises={HATHOR_CRUISES}>
      <CruisesPageListingsGrid />
      <CtaBand />
      <div className="cruises-column-tail">
        <CruisesFooter />
      </div>
    </CruisesListingProvider>
  );
}
