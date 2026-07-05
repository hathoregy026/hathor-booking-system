import { CtaBand } from "@/components/pages/CtaBand";
import { CruisesPageListings } from "@/components/pages/CruisesPageListings";
import { PageScrollTransition } from "@/components/pages/PageScrollTransition";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { CRUISES_PAGE } from "@/lib/page-content";

export function CruisesPageContent() {
  return (
    <PageScrollTransition
      title={CRUISES_PAGE.hero.title}
      subtitle={CRUISES_PAGE.hero.subtitle}
      breadcrumb="Cruises"
      imageName="cruises-hero"
    >
      <div className="page-layout__main">
        <CruisesPageListings cruises={HATHOR_CRUISES} />
      </div>
      <CtaBand />
    </PageScrollTransition>
  );
}
