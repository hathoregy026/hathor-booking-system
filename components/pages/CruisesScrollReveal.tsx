"use client";

import React, { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  refreshPageScrollTransition,
  usePageScrollTransition,
} from "@/hooks/usePageScrollTransition";

const PIN_VH = 1.5;

export type CruisesScrollRevealProps = {
  title: string;
  subtitle?: string;
  imageSrc: string;
  children: ReactNode;
};

function alignDomeContentGap(root: HTMLElement, next: HTMLElement) {
  const dome = root.querySelector<HTMLElement>(".dome-container");
  const landing = root.querySelector<HTMLElement>(".pt-sheet__landing");
  if (!dome) return;

  const domeBottom =
    landing?.getBoundingClientRect().bottom ?? dome.getBoundingClientRect().bottom;
  const gap = next.getBoundingClientRect().top - domeBottom;
  next.style.marginTop = gap > 0 ? `-${gap}px` : "0";
  ScrollTrigger.refresh();
}

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
  const creamFloorRef = useRef<HTMLDivElement>(null);

  usePageScrollTransition(
    {
      root: rootRef,
      stage: stageRef,
      mask: maskRef,
      sheet: sheetRef,
      heroCopy: heroCopyRef,
    },
    {
      pinSpacing: false,
      scrollEnd: "bottom top",
      manualScrollTrack: true,
    },
  );

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

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const runGapFix = () => {
      const root = rootRef.current;
      const next = creamFloorRef.current;
      if (!root || !next) return;
      alignDomeContentGap(root, next);
    };

    runGapFix();
    requestAnimationFrame(runGapFix);
    setTimeout(runGapFix, 100);
    setTimeout(runGapFix, 400);

    window.addEventListener("load", runGapFix);
    window.addEventListener("resize", runGapFix);
    ScrollTrigger.addEventListener("refresh", runGapFix);

    return () => {
      window.removeEventListener("load", runGapFix);
      window.removeEventListener("resize", runGapFix);
      ScrollTrigger.removeEventListener("refresh", runGapFix);
      if (creamFloorRef.current) {
        creamFloorRef.current.style.marginTop = "";
      }
    };
  }, []);

  return (
    <>
      <section
        ref={rootRef}
        data-page-transition
        data-test-scroll-reveal
        data-cruises-scroll
        className="hathor-page-scroll-transition hathor-page-hero test-scroll-reveal"
      >
        <div className="dome-manual-spacer" aria-hidden="true" />
        <div ref={stageRef} className="pt-stage dome-container">
          <div className="pt-hero">
            <div className="pt-hero__media">
              <img
                src={imageSrc}
                alt="Cruises Background"
                fetchPriority="high"
                decoding="async"
                onLoad={() => {
                  refreshPageScrollTransition();
                  requestAnimationFrame(() => {
                    const root = rootRef.current;
                    const next = creamFloorRef.current;
                    if (root && next) alignDomeContentGap(root, next);
                  });
                }}
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
          </div>
        </div>
      </section>
      <div
        ref={creamFloorRef}
        className="test-scroll-reveal__cream-floor next-section"
      >
        <div className="dome-spacer" aria-hidden="true" />
        <div className="hathor-page-cream-floor cruises-page-cream">
          {children}
        </div>
      </div>
    </>
  );
}
