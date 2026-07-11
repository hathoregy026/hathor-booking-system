"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { useHomePage2GiantLogo } from "@/app/(public)/homepage-2/useHomePage2GiantLogo";
import {
  CRUISES_PIN_DISTANCE_VH,
  useCruisesOption3ScrollTransition,
} from "@/hooks/useCruisesOption3ScrollTransition";
import { refreshPageScrollTransition } from "@/components/pages/pageScrollTransitionEngine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";

const PIN_DISTANCE_VH = CRUISES_PIN_DISTANCE_VH;

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

function markOption3ScrollReady() {
  document.documentElement.classList.add("cruises-option-3-scroll-ready");
}

function clearOption3ScrollReady() {
  document.documentElement.classList.remove("cruises-option-3-scroll-ready");
}

export type CruisesOption3ScrollRevealProps = {
  heroTitle: string;
  title: string;
  breadcrumb: string;
  imageName: string;
  imageAlt?: string;
  sheetBelowLanding?: ReactNode;
  children: ReactNode;
};

/** Option 3 — isolated split-layer scroll (animation + synced content). */
export function CruisesOption3ScrollReveal({
  heroTitle,
  title,
  breadcrumb,
  imageName,
  imageAlt,
  sheetBelowLanding,
  children,
}: CruisesOption3ScrollRevealProps) {
  const image = useSiteImage(imageName);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const giantLogoRef = useRef<HTMLDivElement>(null);

  useCruisesOption3ScrollTransition({
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
      markOption3ScrollReady();
    });

    const onScroll = () => syncMediaVisibility();
    const onResize = () => syncMediaVisibility();
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      syncMediaVisibility();
      refreshPageScrollTransition();
      markOption3ScrollReady();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pageshow", onPageShow);
      clearOption3ScrollReady();
    };
  }, []);

  useEffect(() => {
    markOption3ScrollReady();
    return () => clearOption3ScrollReady();
  }, []);

  return (
    <>
      <div className="cruises-pin-wrapper">
        <section
          ref={rootRef}
          data-page-transition
          data-cruises-option-3
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
              aria-hidden="true"
            >
              <div className="cruises-sheet-follower__cream" aria-hidden="true" />
            </div>
          </div>
        </section>
      </div>

      <section
        className="cruises-option-3-content-layer"
        aria-label="Cruise listings"
        aria-labelledby="cruises-option-3-landing-title"
      >
        <div className="pt-sheet__landing cruises-option-3-content-layer__landing">
          <div className="hathor-container">
            <h2 id="cruises-option-3-landing-title" className="pt-sheet__landing-title">
              {title}
            </h2>
          </div>
        </div>

        {sheetBelowLanding ? (
          <div className="pt-sheet__filters">{sheetBelowLanding}</div>
        ) : null}

        <div className="pt-sheet__content">{children}</div>
      </section>
    </>
  );
}
