"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useHomePage2GiantLogo } from "@/app/(public)/homepage-2/useHomePage2GiantLogo";
import { useCruisesOption4SpaEngine } from "@/hooks/useCruisesOption4SpaEngine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { CRUISES_PAGE } from "@/lib/page-content";
import type { ReactNode } from "react";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

type CruisesOption4SpaHeroProps = {
  heroTitle: string;
  breadcrumb: string;
  imageName: string;
  sheetBelowLanding?: ReactNode;
};

/**
 * Option 4 spa runway — short sheet (title + filters). Listings live below in normal flow.
 */
export function CruisesOption4SpaHero({
  heroTitle,
  breadcrumb,
  imageName,
  sheetBelowLanding,
}: CruisesOption4SpaHeroProps) {
  const image = useSiteImage(imageName);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const horizonRef = useRef<HTMLDivElement>(null);
  const giantLogoRef = useRef<HTMLDivElement>(null);

  useCruisesOption4SpaEngine({
    root: rootRef,
    stage: stageRef,
    mask: maskRef,
    sheet: sheetRef,
    heroCopy: heroCopyRef,
    horizon: horizonRef,
  });

  useHomePage2GiantLogo(rootRef, giantLogoRef);

  useEffect(() => {
    document.documentElement.setAttribute("data-cruises-option-4-experience", "");
    return () => {
      document.documentElement.removeAttribute("data-cruises-option-4-experience");
    };
  }, []);

  return (
    <section
      ref={rootRef}
      data-cruises-option-4
      className="cruises-option-4-spa hathor-page-hero"
    >
      <div ref={stageRef} className="pt-stage">
        <div className="pt-hero">
          <div className="pt-hero__media">
            <img
              src={image.src}
              alt={image.alt}
              fetchPriority="high"
              decoding="async"
            />
            <div className="pt-hero__overlay" aria-hidden />
          </div>
          <div ref={maskRef} className="pt-mask" aria-hidden="true" />
          <div ref={heroCopyRef} className="pt-hero__copy cruises-hero__copy">
            <div ref={giantLogoRef} className="giant-logo-container cruises-giant-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BACK_LOGO_SRC} alt="Hathor" />
            </div>
            <div className="hathor-container hathor-page-hero__content cruises-hero__content">
              <nav className="hathor-breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden>/</span>
                <span aria-current="page">{breadcrumb}</span>
              </nav>
              <h1 className="hathor-page-hero__title hathor-page-hero__title--feature">
                {heroTitle}
              </h1>
              <div className="hathor-gold-line" />
            </div>
          </div>
        </div>

        <div ref={sheetRef} className="pt-sheet cruises-option-4-sheet">
          <div ref={horizonRef} className="pt-sheet__horizon" aria-hidden="true" />
          <div className="pt-sheet__landing" aria-labelledby="cruises-option-4-landing-title">
            <div className="hathor-container">
              <h2 id="cruises-option-4-landing-title" className="pt-sheet__landing-title">
                {CRUISES_PAGE.hero.title}
              </h2>
            </div>
          </div>
          {sheetBelowLanding ? (
            <div className="pt-sheet__filters cruises-option-4-filters">
              {sheetBelowLanding}
            </div>
          ) : null}
          <div className="pt-sheet__rise-cap" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
