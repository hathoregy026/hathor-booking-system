"use client";

import { CtaBand } from "@/components/pages/CtaBand";
import { CruisesPageListingsGrid } from "@/components/pages/CruisesPageListings";
import { CruisesFooter } from "@/components/pages/CruisesFooter";

/** Shared listings block for option demos — requires CruisesListingProvider ancestor. */
export function CruisesOptionBody() {
  return (
    <>
      <CruisesPageListingsGrid />
      <CtaBand />
      <div className="cruises-column-tail">
        <CruisesFooter />
      </div>
    </>
  );
}
