"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";
import { useHomePage2GiantLogo } from "@/app/(public)/homepage-2/useHomePage2GiantLogo";
import { useHomePage2ScrollTransition } from "@/hooks/useHomePage2ScrollTransition";
import {
  refreshPageScrollTransition,
} from "@/components/pages/pageScrollTransitionEngine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";

const PIN_VH = 4.2;

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

export type CruisesPageTransitionProps = {
  title: string;
  heroTitle?: string;
  subtitle?: string;
  breadcrumb: string;
  imageName: string;
  imageAlt?: string;
  sheetBelowLanding?: ReactNode;
  children: ReactNode;
};

/**
 * Cruises-only: Homepage 2 Venetian engine + giant logo on the pin theater,
 * with the original PageScrollTransition sheet content (landing, filters, listings).
 */
export function CruisesPageTransition({
  title,
  heroTitle,
  subtitle,
  breadcrumb,
  imageName,
  imageAlt,
  sheetBelowLanding,
  children,
}: CruisesPageTransitionProps) {
  const image = useSiteImage(imageName);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const giantLogoRef = useRef<HTMLDivElement>(null);

  useHomePage2ScrollTransition({
    root: rootRef,
    stage: stageRef,
    mask: maskRef,
    sheet: sheetRef,
    heroCopy: heroCopyRef,
  });

  useHomePage2GiantLogo(rootRef, giantLogoRef);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const syncMediaVisibility = () => {
      const vh = window.innerHeight;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const scroll = window.scrollY;
      const pinProgress = Math.max(0, (scroll - top) / (vh * PIN_VH));

      const inHeroZone = pinProgress < 0.12;
      const hideMedia = !inHeroZone && pinProgress > 0.82;
      const pastPin = pinProgress >= 0.92;

      root.classList.toggle("hathor-page-scroll--media-gone", hideMedia);
      root.classList.toggle("hathor-page-scroll--past-pin", pastPin);
    };

    syncMediaVisibility();
    window.addEventListener("scroll", syncMediaVisibility, { passive: true });
    window.addEventListener("resize", syncMediaVisibility);

    return () => {
      window.removeEventListener("scroll", syncMediaVisibility);
      window.removeEventListener("resize", syncMediaVisibility);
    };
  }, []);

  return (
    <div className="cruises-pin-wrapper">
      <section
        ref={rootRef}
        data-page-transition
        data-cruises-transition
        className="hathor-page-scroll-transition hathor-page-hero"
      >
        <div ref={stageRef} className="pt-stage">
          <div className="pt-hero">
            <div className="pt-hero__media">
              <img
                src={image.src}
                alt={imageAlt ?? image.alt}
                fetchPriority="high"
                decoding="async"
                onLoad={() => refreshPageScrollTransition()}
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
                  {heroTitle ?? title}
                </h1>
                {subtitle ? (
                  <p className="hathor-page-hero__subtitle">{subtitle}</p>
                ) : null}
                <div className="hathor-gold-line" />
              </div>
            </div>
          </div>
          <div ref={sheetRef} className="pt-sheet">
            <div className="pt-sheet__landing" aria-labelledby="cruises-landing-title">
              <div className="hathor-container">
                <h2 id="cruises-landing-title" className="pt-sheet__landing-title">
                  {title}
                </h2>
              </div>
            </div>
            {sheetBelowLanding ? (
              <div className="pt-sheet__filters">{sheetBelowLanding}</div>
            ) : null}
            <div className="pt-sheet__rise-cap" aria-hidden="true" />
            <div className="pt-sheet__content">{children}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
