"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { refreshPageScrollTransition } from "@/components/pages/pageScrollTransitionEngine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import { useCruisesGiantLogo } from "@/hooks/useCruisesGiantLogo";
import { useHomePage2ScrollTransition } from "@/hooks/useHomePage2ScrollTransition";

const PIN_VH = 4.2;
const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

type CruisesScrollRevealProps = {
  heroTitle: string;
  subtitle?: string;
  breadcrumb: string;
  imageName: string;
  imageAlt?: string;
};

/**
 * Cruises-only shell using Homepage 2's exact Venetian engine.
 * The sheet is an animation runway; listings remain in normal document flow.
 */
export function CruisesScrollReveal({
  heroTitle,
  subtitle,
  breadcrumb,
  imageName,
  imageAlt,
}: CruisesScrollRevealProps) {
  const image = useSiteImage(imageName);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const giantLogoRef = useRef<HTMLDivElement>(null);

  useHomePage2ScrollTransition({
    root: rootRef,
    stage: stageRef,
    mask: maskRef,
    sheet: sheetRef,
    heroCopy: { current: null },
  });

  useCruisesGiantLogo(rootRef, giantLogoRef);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const syncMediaVisibility = () => {
      const viewportHeight = window.innerHeight;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const pinProgress = Math.max(
        0,
        (window.scrollY - top) / (viewportHeight * PIN_VH),
      );

      const inHeroZone = pinProgress < 0.12;
      root.classList.toggle(
        "hathor-page-scroll--media-gone",
        !inHeroZone && pinProgress > 0.82,
      );
      root.classList.toggle(
        "hathor-page-scroll--past-pin",
        pinProgress >= 0.92,
      );
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

            <div className="pt-hero__copy cruises-scroll-reveal__hero-layer">
              <div ref={giantLogoRef} className="cruises-giant-logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BACK_LOGO_SRC} alt="Hathor" />
              </div>

              <div className="hathor-container cruises-scroll-reveal__hero-content">
                <nav className="hathor-breadcrumb" aria-label="Breadcrumb">
                  <Link href="/">Home</Link>
                  <span aria-hidden>/</span>
                  <span aria-current="page">{breadcrumb}</span>
                </nav>
                <h1 className="hathor-page-hero__title hathor-page-hero__title--feature">
                  {heroTitle}
                </h1>
                {subtitle ? (
                  <p className="hathor-page-hero__subtitle">{subtitle}</p>
                ) : null}
                <div className="hathor-gold-line" />
              </div>
            </div>
          </div>

          <div ref={sheetRef} className="pt-sheet">
            <div className="pt-sheet__rise-cap" aria-hidden="true" />
            <div className="pt-sheet__content" />
          </div>
        </div>
      </section>
    </div>
  );
}
