"use client";

import { useRef, useState } from "react";
import { CharterHero } from "@/components/pages/charter/CharterHero";
import { CharterRouteSelector } from "@/components/pages/charter/CharterRouteSelector";
import { CharterRequestForm } from "@/components/pages/charter/CharterRequestForm";
import {
  CharterEditorialImage,
  CharterExperienceBand,
  CharterFinalCta,
  CharterIntroduction,
  CharterPrivileges,
} from "@/components/pages/charter/CharterSections";
import { useWebsiteText } from "@/components/public/WebsiteTextProvider";
import {
  useTypographySettings,
} from "@/components/public/TypographySettingsProvider";
import { useCharterPageMotion } from "@/hooks/useCharterPageMotion";
import { CHARTER_PAGE } from "@/lib/page-content";
import { normalizeOptionalText } from "@/lib/website-text-shared";
import { resolveHeroPageCopy } from "@/lib/typography-settings-shared";

const BENEFIT_FALLBACKS = [
  {
    title: "Complete Privacy",
    body: "The entire vessel is reserved exclusively for you and your invited guests.",
  },
  {
    title: "Dedicated Service",
    body: "A private crew and chef shape every day around your preferences.",
  },
  {
    title: "Refined Accommodation",
    body: "Elegant suites, intimate spaces and attentive five-star hospitality.",
  },
  {
    title: "A Personal Itinerary",
    body: "Choose your pace, destinations and moments along the Nile.",
  },
] as const;

function splitBenefit(raw: string, index: number): { title: string; body: string } {
  const fallback = BENEFIT_FALLBACKS[index] ?? BENEFIT_FALLBACKS[0];
  const cleaned = raw.trim();
  if (!cleaned) return fallback;

  const dashSplit = cleaned.split(/\s+[—–-]\s+/);
  if (dashSplit.length >= 2) {
    return {
      title: dashSplit[0].trim(),
      body: dashSplit.slice(1).join(" — ").trim() || fallback.body,
    };
  }

  // Short CMS titles → keep title, use refined fallback body
  if (cleaned.length <= 48) {
    return { title: cleaned, body: fallback.body };
  }

  return { title: fallback.title, body: cleaned };
}

export function CharterPageContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { pages } = useWebsiteText();
  const typography = useTypographySettings();
  const charter = pages.charter;
  const routes = CHARTER_PAGE.overview.routes;
  const [preferredRoute, setPreferredRoute] = useState<string>(routes[0]);

  useCharterPageMotion(rootRef);

  const overviewTitle = normalizeOptionalText(charter.overviewTitle);
  const overviewIntro = normalizeOptionalText(charter.overviewIntro);
  const benefitsIntro = normalizeOptionalText(charter.benefitsIntro);
  const cta = normalizeOptionalText(charter.cta);

  const benefits = charter.benefits
    .map((benefit, index) => {
      const text = normalizeOptionalText(benefit);
      if (!text) return null;
      return splitBenefit(text, index);
    })
    .filter((benefit): benefit is { title: string; body: string } =>
      Boolean(benefit),
    );

  const resolvedBenefits =
    benefits.length > 0
      ? benefits
      : BENEFIT_FALLBACKS.map((item) => ({ ...item }));

  const heroCopy = resolveHeroPageCopy(typography, "charter", {
    main: CHARTER_PAGE.hero.title,
    second: CHARTER_PAGE.hero.secondTitle,
  });

  // Map known default CMS hero labels to the editorial two-line treatment.
  const mainKey = heroCopy.main.trim().toLowerCase().replace(/\s+/g, " ");
  const secondKey = heroCopy.second.trim().toLowerCase().replace(/\s+/g, " ");
  const isDefaultMain =
    !mainKey ||
    mainKey === CHARTER_PAGE.hero.title.toLowerCase() ||
    mainKey.includes("charter dahabiya") ||
    mainKey.includes("dahabiya charter");
  const isDefaultSecond =
    !secondKey ||
    secondKey === CHARTER_PAGE.hero.secondTitle.toLowerCase() ||
    secondKey.includes("private voyage");

  const titleMain = isDefaultMain ? "THE NILE" : heroCopy.main.toUpperCase();
  const titleSecond = isDefaultSecond
    ? "EXCLUSIVELY YOURS"
    : heroCopy.second.toUpperCase();

  return (
    <div ref={rootRef} data-charter-page className="charter-page">
      <CharterHero
        titleMain={titleMain}
        titleSecond={titleSecond}
        subtitle="A voyage composed entirely around you."
        supporting="Charter Hathor in complete privacy and discover the Nile through an itinerary, rhythm and service created exclusively for your party."
      />

      <CharterIntroduction
        overviewTitle={overviewTitle}
        overviewIntro={overviewIntro}
        benefitsIntro={benefitsIntro}
        cta={cta}
      />

      <CharterPrivileges benefits={resolvedBenefits} />

      <CharterEditorialImage />

      <CharterRouteSelector
        routes={routes}
        value={preferredRoute}
        onChange={setPreferredRoute}
      />

      <CharterExperienceBand />

      <CharterRequestForm
        preferredRoute={preferredRoute}
        routes={routes}
        onPreferredRouteChange={setPreferredRoute}
      />

      <CharterFinalCta />
    </div>
  );
}
