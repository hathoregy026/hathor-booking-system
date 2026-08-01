"use client";

import { useRef } from "react";
import { HighlightsHero } from "@/components/pages/highlights/HighlightsHero";
import {
  HighlightsFinalCta,
  HighlightsIntroduction,
  HighlightsJourneyPreview,
  HighlightsManifesto,
  HighlightsMovingStories,
  HighlightsPrinciples,
  HighlightsRiverInterlude,
} from "@/components/pages/highlights/HighlightsSections";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { useHighlightsPageMotion } from "@/hooks/useHighlightsPageMotion";
import { HIGHLIGHTS_PAGE } from "@/lib/page-content";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { pages } = useWebsiteText();
  const typography = useTypographySettings();
  const highlights = pages.highlights;

  useHighlightsPageMotion(rootRef);

  const hero = resolveHeroPageCopy(typography, "highlights", {
    main: "DAHABIYA",
    second: "CRUISE HIGHLIGHTS",
  });

  return (
    <div ref={rootRef} data-highlights-page="" className="hl-page">
      <HighlightsHero
        titleMain={hero.main}
        titleSecond={hero.second}
        subtitle="Discover the ancient landmarks, quiet riverbanks and intimate experiences that define a voyage aboard Hathor."
      />

      <HighlightsIntroduction
        heading={HIGHLIGHTS_PAGE.hero.subtitle}
        intro={highlights.intro}
      />

      <HighlightsManifesto />

      <HighlightsMovingStories landmarks={highlights.landmarks} />

      <HighlightsRiverInterlude />

      <HighlightsPrinciples />

      <HighlightsJourneyPreview />

      <HighlightsFinalCta />
    </div>
  );
}
