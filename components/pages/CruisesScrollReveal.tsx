"use client";

import React, { useEffect, useRef, type ReactNode } from "react";
import { refreshPageScrollTransition, usePageScrollTransition } from "@/hooks/usePageScrollTransition";

const PIN_VH = 1.5;

export type CruisesScrollRevealProps = {
  title: string;
  subtitle?: string;
  imageSrc: string;
  children: ReactNode;
};

export function CruisesScrollReveal({
  title,
  subtitle,
  imageSrc,
  children,
}: CruisesScrollRevealProps) {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);

  usePageScrollTransition({
    root: rootRef,
    stage: stageRef,
    mask: maskRef,
    sheet: sheetRef,
    heroCopy: heroCopyRef,
  });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const syncMediaVisibility = () => {
      const vh = window.innerHeight;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const scroll = window.scrollY;
      const sheet = sheetRef.current;
      const sheetTop = sheet?.getBoundingClientRect().top ?? vh;
      const pinProgress = Math.max(0, (scroll - top) / (vh * PIN_VH));

      const inHeroZone = pinProgress < 0.12;
      const hideMedia =
        !inHeroZone && (pinProgress > 0.48 || sheetTop <= vh * 0.35);
      const pastPin = pinProgress >= 0.92;

      root.classList.toggle("test-scroll-reveal--media-gone", hideMedia);
      root.classList.toggle("test-scroll-reveal--past-pin", pastPin);
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
    <section
      ref={rootRef}
      data-page-transition
      data-test-scroll-reveal
      data-cruises-scroll-reveal
      className="hathor-page-scroll-transition hathor-page-hero test-scroll-reveal cruises-scroll-reveal"
    >
      <div ref={stageRef} className="pt-stage">
        <div className="pt-hero">
          <div className="pt-hero__media">
            <img
              src={imageSrc}
              alt="Cruises Background"
              fetchPriority="high"
              decoding="async"
              onLoad={() => refreshPageScrollTransition()}
            />
            <div className="pt-hero__overlay" aria-hidden />
          </div>
          <div ref={maskRef} className="pt-mask" aria-hidden="true" />
          <div ref={heroCopyRef} className="pt-hero__copy">
            <div className="hathor-container hathor-page-hero__content">
              <h1 className="hathor-page-hero__title">{title}</h1>
              {subtitle ? (
                <p className="hathor-page-hero__subtitle">{subtitle}</p>
              ) : null}
              <div className="hathor-gold-line" />
            </div>
          </div>
        </div>
        <div ref={sheetRef} className="pt-sheet">
          <div className="pt-sheet__landing">
            <div className="hathor-container">
              <h2 className="pt-sheet__landing-title">{title}</h2>
            </div>
          </div>
          <div className="pt-sheet__rise-cap" aria-hidden="true" />
          <div className="pt-sheet__body hathor-page-cream-floor cruises-page-cream">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
