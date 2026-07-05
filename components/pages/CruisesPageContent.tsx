import { CtaBand } from "@/components/pages/CtaBand";
import { CruisesPageListings } from "@/components/pages/CruisesPageListings";
import { CruisesScrollReveal } from "@/components/pages/CruisesScrollReveal";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";

export function CruisesPageContent() {
  return (
    <>
      <CruisesScrollReveal title={CRUISES_PAGE.hero.title}>
        <CtaBand />
      </CruisesScrollReveal>

      <div className="hathor-page-body hathor-page-cream-floor cruises-page-cream">
        <div className="page-layout__main">
          <CruisesPageListings cruises={HATHOR_CRUISES} />
        </div>
      </div>
    </>
  );
}
