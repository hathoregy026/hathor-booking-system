"use client";

import type { ReactNode } from "react";
import { PublicSiteHero } from "@/components/pages/PublicSiteHero";
import { splitHeroTitle } from "@/lib/split-hero-title";
import type { HeroPageKey } from "@/lib/typography-settings-shared";

export type PageScrollTransitionProps = {
  title: string;
  heroTitle?: string;
  /**
   * Elegant second hero line (homepage-style script).
   * When set, the full title stays on the main line — no mid-title split.
   */
  secondTitle?: string;
  /** Typography dashboard hero copy for this route */
  heroPage?: HeroPageKey;
  subtitle?: string;
  breadcrumb: string;
  parentBreadcrumb?: { label: string; href: string };
  imageName: string;
  imageAlt?: string;
  variant?: "default" | "blog";
  sheetBelowLanding?: ReactNode;
  children: ReactNode;
};

/** Page shell — home-style hero + page body (titles preserved per route). */
export function PageScrollTransition({
  title,
  heroTitle,
  secondTitle,
  heroPage,
  subtitle,
  imageName,
  sheetBelowLanding,
  children,
}: PageScrollTransitionProps) {
  const displayTitle = heroTitle ?? title;
  const [lineRight, lineLeft] = secondTitle
    ? ([displayTitle, secondTitle] as [string, string])
    : splitHeroTitle(displayTitle);

  return (
    <div className="public-page-with-hero">
      <PublicSiteHero
        heroPage={heroPage}
        lineRight={lineRight}
        lineLeft={lineLeft}
        subtitle={subtitle}
        posterImageName={imageName}
      />
      <div className="public-page-body">
        {sheetBelowLanding ? (
          <div className="public-page-body__filters">{sheetBelowLanding}</div>
        ) : null}
        {children}
      </div>
    </div>
  );
}
