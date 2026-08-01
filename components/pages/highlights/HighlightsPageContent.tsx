"use client";

import { useRef } from "react";
import { HighlightsHero } from "@/components/pages/highlights/HighlightsHero";
import {
  HighlightsFinalCta,
  HighlightsIntroduction,
  HighlightsJourneyPreview,
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
    main: "HIGHLIGHTS",
    second: "OF THE NILE",
  });

  const mainKey = hero.main.trim().toLowerCase();
  const secondKey = hero.second.trim().toLowerCase();
  const useDefault =
    !mainKey ||
    mainKey.includes("dahabiya") ||
    !secondKey ||
    secondKey.includes("cruise highlight");

  return (
    <div ref={rootRef} data-highlights-page="" className="hl-page">
      <HighlightsHero
        titleLine1={useDefault ? "Highlights" : hero.main}
        titleLine2={useDefault ? "of the Nile" : hero.second}
        supporting="Ancient landmarks, quiet riverbanks and intimate moments that define a voyage aboard Hathor."
      />

      <HighlightsIntroduction
        heading={HIGHLIGHTS_PAGE.hero.subtitle}
        intro={highlights.intro}
      />

      <HighlightsMovingStories landmarks={highlights.landmarks} />

      <HighlightsRiverInterlude />

      <HighlightsPrinciples />

      <HighlightsJourneyPreview />

      <HighlightsFinalCta />
    </div>
  );
}
