"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useHomePage2GiantLogo } from "@/app/(public)/homepage-2/useHomePage2GiantLogo";
import {
  CRUISES_PIN_DISTANCE_VH,
  useCruisesScrollTransition,
} from "@/hooks/useCruisesScrollTransition";
import {
  refreshPageScrollTransition,
} from "@/components/pages/pageScrollTransitionEngine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";

const PIN_DISTANCE_VH = CRUISES_PIN_DISTANCE_VH;

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

function markCruisesScrollReady() {
  document.documentElement.classList.add("cruises-scroll-ready");
}

function clearCruisesScrollReady() {
  document.documentElement.classList.remove("cruises-scroll-ready");
}

export type CruisesScrollRevealProps = {
  heroTitle: string;
  title: string;
  subtitle?: string;
  breadcrumb: string;
  imageName: string;
  imageAlt?: string;
  sheetBelowLanding?: ReactNode;
  children: ReactNode;
};

/**
 * Empty 100svh sheet runway for dome math.
 * Content in .cruises-sheet-follower — synced to sheet, tail-scroll through listings.
 */
export function CruisesScrollReveal({
  heroTitle,
  title,
  subtitle,
  breadcrumb,
  imageName,
  imageAlt,
  sheetBelowLanding,
  children,
}: CruisesScrollRevealProps) {
  const image = useSiteImage(imageName);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const giantLogoRef = useRef<HTMLDivElement>(null);

  useCruisesScrollTransition({
    root: rootRef,
    stage: stageRef,
    mask: maskRef,
    sheet: sheetRef,
    follower: followerRef,
    heroCopy: heroCopyRef,
  });

  useHomePage2GiantLogo(rootRef, giantLogoRef);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const syncMediaVisibility = () => {
      const vh = window.innerHeight;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const scroll = window.scrollY;
      const pinProgress = Math.max(
        0,
        (scroll - top) / (vh * PIN_DISTANCE_VH),
      );

      const inHeroZone = pinProgress < 0.12;
      const hideMedia = !inHeroZone && pinProgress > 0.35;

      root.classList.toggle("hathor-page-scroll--media-gone", hideMedia);
    };

    syncMediaVisibility();
    requestAnimationFrame(() => {
      syncMediaVisibility();
      refreshPageScrollTransition();
      markCruisesScrollReady();
    });

    const onScroll = () => syncMediaVisibility();
    const onResize = () => syncMediaVisibility();
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      syncMediaVisibility();
      refreshPageScrollTransition();
      markCruisesScrollReady();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pageshow", onPageShow);
      clearCruisesScrollReady();
    };
  }, []);

  useEffect(() => {
    markCruisesScrollReady();
    return () => clearCruisesScrollReady();
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
                  {heroTitle}
                </h1>
                {subtitle ? (
                  <p className="hathor-page-hero__subtitle">{subtitle}</p>
                ) : null}
                <div className="hathor-gold-line" />
              </div>
            </div>
          </div>

          <div ref={sheetRef} className="pt-sheet cruises-sheet-runway">
            <div className="pt-sheet__rise-cap" aria-hidden="true" />
          </div>

          <div
            ref={followerRef}
            className="cruises-sheet-follower"
            aria-labelledby="cruises-landing-title"
          >
            <div className="pt-sheet__landing">
              <div className="hathor-container">
                <h2 id="cruises-landing-title" className="pt-sheet__landing-title">
                  {title}
                </h2>
              </div>
            </div>

            {sheetBelowLanding ? (
              <div className="pt-sheet__filters">{sheetBelowLanding}</div>
            ) : null}

            <div className="pt-sheet__content">{children}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
