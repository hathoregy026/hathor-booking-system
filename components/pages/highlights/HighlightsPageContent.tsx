"use client";

import { useRef } from "react";
import { HighlightsHero } from "@/components/pages/highlights/HighlightsHero";
import {
  HighlightsFinalCta,
  HighlightsIntroduction,
  HighlightsMovingStories,
} from "@/components/pages/highlights/HighlightsSections";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import { useTypographySettings } from "@/components/public/TypographySettingsProvider";
import { useHighlightsPageMotion } from "@/hooks/useHighlightsPageMotion";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";

export function HighlightsPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { pages } = useWebsiteText();
  const typography = useTypographySettings();
  const highlights = pages.highlights;

  useHighlightsPageMotion(rootRef);

  const hero = resolveHeroPageCopy(typography, "highlights", {
    main: "THE STORIES",
    second: "OF THE NILE",
  });

  const mainKey = hero.main.trim().toLowerCase();
  const secondKey = hero.second.trim().toLowerCase();
  const useDefault =
    !mainKey ||
    mainKey.includes("dahabiya") ||
    mainKey.includes("highlight") ||
    !secondKey ||
    secondKey.includes("cruise highlight");

  return (
    <div ref={rootRef} data-highlights-page="" className="hl-page">
      <HighlightsHero
        titleLine1={useDefault ? "The Stories" : hero.main}
        titleLine2={useDefault ? "of the Nile" : hero.second}
        supporting="A cinematic passage through living history — temples, quarries and quiet water between Luxor and Aswan."
      />
      <HighlightsIntroduction intro={highlights.intro} />
      <HighlightsMovingStories landmarks={highlights.landmarks} />
      <HighlightsFinalCta />
    </div>
  );
}
