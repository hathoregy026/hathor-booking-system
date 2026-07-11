"use client";

import { useRef } from "react";
import { CruisesPageFilters } from "@/components/pages/CruisesPageListings";
import { CruisesOptionBody } from "@/components/pages/cruises-options/CruisesOptionBody";
import { CruisesOption1Hero } from "@/components/pages/cruises-options/CruisesOption1Hero";
import { useCruisesOption1ContentEntrance } from "@/hooks/useCruisesOption1ContentEntrance";
import { CRUISES_PAGE } from "@/lib/page-content";

/** Option 1 — spa style: hero transition, then normal content with fade-up entrance. */
export function CruisesOption1PageContent() {
  const contentRef = useRef<HTMLElement>(null);
  useCruisesOption1ContentEntrance(contentRef);

  return (
    <div className="cruises-option-1-root">
      <CruisesOption1Hero />
      <section
        ref={contentRef}
        className="cruises-option-1-content"
        aria-label="Cruise listings"
      >
        <div className="pt-sheet__landing" data-option-1-reveal>
          <div className="hathor-container">
            <h2 className="pt-sheet__landing-title">{CRUISES_PAGE.hero.title}</h2>
          </div>
        </div>
        <div className="pt-sheet__filters" data-option-1-reveal>
          <CruisesPageFilters />
        </div>
        <div className="pt-sheet__content" data-option-1-reveal>
          <CruisesOptionBody />
        </div>
      </section>
    </div>
  );
}
