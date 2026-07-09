"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  refreshPageScrollTransition,
  usePageScrollTransition,
} from "@/components/pages/pageScrollTransitionEngine";
import { useHomePage2GiantLogo } from "./useHomePage2GiantLogo";

const PIN_VH = 4.2;
const HP2_CREAM = "#f4f1ea";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

export type HomePage2ScrollRevealProps = {
  imageName: string;
  imageAlt?: string;
  children?: ReactNode;
};

/** Same DOM + engine as cruises PageScrollTransition — giant logo replaces hero copy. */
export function HomePage2ScrollReveal({
  imageName,
  imageAlt,
  children,
}: HomePage2ScrollRevealProps) {
  const image = useSiteImage(imageName);
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const giantLogoRef = useRef<HTMLDivElement>(null);

  usePageScrollTransition({
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

    const applyCreamTheme = () => {
      root.style.setProperty("--pt-cream", HP2_CREAM);
      root.style.setProperty("--pt-gold", "#b69f64");
      document.body.style.backgroundColor = HP2_CREAM;
    };

    applyCreamTheme();
    const onTick = () => applyCreamTheme();
    gsap.ticker.add(onTick);

    return () => {
      gsap.ticker.remove(onTick);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const sheet = sheetRef.current;
    if (!root) return;

    const syncMediaVisibility = () => {
      const vh = window.innerHeight;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const scroll = window.scrollY;
      const pinProgress = Math.max(0, (scroll - top) / (vh * PIN_VH));

      const hideMedia = pinProgress > 0.82;
      const pastPin = pinProgress >= 0.88;

      root.classList.toggle("hathor-page-scroll--media-gone", hideMedia);
      root.classList.toggle("hathor-page-scroll--past-pin", pastPin);

      if (pastPin && sheet) {
        gsap.set(sheet, {
          y: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        });
      }
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
    <>
      <svg
        aria-hidden="true"
        focusable="false"
        width="0"
        height="0"
        className="hathor-text-filter-defs"
      >
        <filter
          id="hathor-title-inner-shadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feOffset in="SourceAlpha" dx="10" dy="0" result="offsetAlpha" />
          <feGaussianBlur in="offsetAlpha" stdDeviation="4" result="blurredOffset" />
          <feComposite
            in="blurredOffset"
            in2="SourceAlpha"
            operator="in"
            result="innerShadowAlpha"
          />
          <feFlood floodColor="#000000" floodOpacity="0.38" result="shadowColor" />
          <feComposite
            in="shadowColor"
            in2="innerShadowAlpha"
            operator="in"
            result="innerShadow"
          />
          <feMerge>
            <feMergeNode in="SourceGraphic" />
            <feMergeNode in="innerShadow" />
          </feMerge>
        </filter>
      </svg>
      <section
        ref={rootRef}
        data-page-transition
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
            <div className="pt-hero__copy">
              <div ref={giantLogoRef} className="giant-logo-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={BACK_LOGO_SRC} alt="Hathor" />
              </div>
            </div>
          </div>
          <div ref={sheetRef} className="pt-sheet">
            <div className="pt-sheet__rise-cap" aria-hidden="true" />
            <div className="pt-sheet__content">{children}</div>
          </div>
        </div>
      </section>
    </>
  );
}
