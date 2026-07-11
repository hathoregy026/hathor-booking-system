"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useHomePage2GiantLogo } from "@/app/(public)/homepage-2/useHomePage2GiantLogo";
import { useCruisesOption1HeroTransition } from "@/hooks/useCruisesOption1HeroTransition";
import { refreshPageScrollTransition } from "@/components/pages/pageScrollTransitionEngine";
import { useSiteImage } from "@/components/public/SiteImagesProvider";

const PIN_VH = 4.2;
const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

/** Option 1 — spa-style pinned hero (blinds + dome). Content lives below. */
export function CruisesOption1Hero() {
  const image = useSiteImage("cruises-hero");
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const giantLogoRef = useRef<HTMLDivElement>(null);

  useCruisesOption1HeroTransition({
    root: rootRef,
    stage: stageRef,
    mask: maskRef,
    sheet: sheetRef,
    heroCopy: { current: null },
  });

  useHomePage2GiantLogo(rootRef, giantLogoRef);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const syncMediaVisibility = () => {
      const vh = window.innerHeight;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const scroll = window.scrollY;
      const pinProgress = Math.max(0, (scroll - top) / (vh * PIN_VH));
      const hideMedia = pinProgress > 0.35;
      root.classList.toggle("hathor-page-scroll--media-gone", hideMedia);
    };

    const onScroll = () => syncMediaVisibility();
    syncMediaVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-cruises-option-1", "");
    return () => document.documentElement.removeAttribute("data-cruises-option-1");
  }, []);

  return (
    <section
      ref={rootRef}
      data-page-transition
      data-cruises-option-1
      className="cruises-option-1-hero hathor-page-scroll-transition hathor-page-hero"
    >
      <div ref={stageRef} className="pt-stage">
        <div className="pt-hero">
          <div className="pt-hero__media">
            <img
              src={image.src}
              alt={image.alt}
              fetchPriority="high"
              decoding="async"
              onLoad={() => refreshPageScrollTransition()}
            />
            <div className="pt-hero__overlay" aria-hidden />
          </div>
          <div ref={maskRef} className="pt-mask" aria-hidden="true" />
          <div className="pt-hero__copy cruises-hero__copy">
            <div ref={giantLogoRef} className="giant-logo-container cruises-giant-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BACK_LOGO_SRC} alt="Hathor" />
            </div>
            <div className="hathor-container hathor-page-hero__content cruises-hero__content">
              <nav className="hathor-breadcrumb" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden>/</span>
                <span aria-current="page">Cruises</span>
              </nav>
              <h1 className="hathor-page-hero__title hathor-page-hero__title--feature">
                Experience Egypt.
              </h1>
              <div className="hathor-gold-line" />
            </div>
          </div>
        </div>
        <div ref={sheetRef} className="pt-sheet cruises-option-1-sheet-runway">
          <div className="pt-sheet__rise-cap" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
