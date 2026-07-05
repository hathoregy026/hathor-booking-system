import { CtaBand } from "@/components/pages/CtaBand";
import { CruisesPageListings } from "@/components/pages/CruisesPageListings";
import { CruisesScrollReveal } from "@/components/pages/CruisesScrollReveal";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";

export function CruisesPageContent() {
  return (
    <CruisesScrollReveal>
      <div className="page-layout__main">
        <CruisesPageListings cruises={HATHOR_CRUISES} />
      </div>
      <CtaBand />
    </CruisesScrollReveal>
  );
}
