import { CtaBand } from "@/components/pages/CtaBand";
import { CruisesScrollReveal } from "@/components/pages/CruisesScrollReveal";
import { CRUISES_PAGE } from "@/lib/page-content";

export function CruisesPageContent() {
  return (
    <CruisesScrollReveal title={CRUISES_PAGE.hero.title}>
      <CtaBand />
    </CruisesScrollReveal>
  );
}
