"use client";

import type { ReactNode } from "react";
import { PublicSiteHero } from "@/components/pages/PublicSiteHero";
import { splitHeroTitle } from "@/lib/split-hero-title";

export type PageScrollTransitionProps = {
  title: string;
  heroTitle?: string;
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
  subtitle,
  imageName,
  sheetBelowLanding,
  children,
}: PageScrollTransitionProps) {
  const displayTitle = heroTitle ?? title;
  const [lineRight, lineLeft] = splitHeroTitle(displayTitle);

  return (
    <div className="public-page-with-hero">
      <PublicSiteHero
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
