"use client";

import { useEffect, useRef } from "react";
import { BookNowTrigger } from "@/components/public/BookNowTrigger";
import {
  HATHOR_HERO_POSTER_SRC,
  HATHOR_HERO_VIDEO_SRC,
} from "@/lib/branding";
import { usePageScrollTransition } from "@/components/pages/pageScrollTransitionEngine";

const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

const PIN_VH = 4.2;

export function HomePage2Content() {
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
    document.documentElement.setAttribute("data-homepage2-experience", "");
    return () => {
      document.documentElement.removeAttribute("data-homepage2-experience");
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const syncMediaVisibility = () => {
      const vh = window.innerHeight;
      const top = root.getBoundingClientRect().top + window.scrollY;
      const scroll = window.scrollY;
      const pinProgress = Math.max(0, (scroll - top) / (vh * PIN_VH));

      root.classList.toggle(
        "hathor-page-scroll--media-gone",
        pinProgress > 0.82,
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
    <>
      <section
        ref={rootRef}
        data-page-transition
        data-homepage2-transition
        className="hathor-page-scroll-transition hathor-page-hero homepage-2-transition"
      >
        <div ref={stageRef} className="pt-stage">
          <div className="pt-hero">
            {/* LAYER 1: Video Background (z-0) */}
            <div className="pt-hero__media homepage-2-hero-bg">
              <video
                className="homepage-2-hero-video"
                src={HATHOR_HERO_VIDEO_SRC}
                poster={HATHOR_HERO_POSTER_SRC}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="Hathor Dahabiya sailing on the Nile"
              />
              <div className="homepage-2-hero-shade" aria-hidden />
              <div className="homepage-2-hero-stripes" aria-hidden />
            </div>

            <div ref={maskRef} className="pt-mask" aria-hidden="true" />

            {/* LAYER 2: Giant Logo (z-10) */}
            <div ref={heroCopyRef} className="homepage-2-logo-layer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BACK_LOGO_SRC} className="giant-logo" alt="Hathor" />
            </div>
          </div>

          {/* LAYER 4: Cream Dome Sheet (z-20) */}
          <div ref={sheetRef} className="pt-sheet homepage-2-sheet">
            <div className="pt-sheet__landing homepage-2-sheet-landing" />
            <div className="pt-sheet__rise-cap homepage-2-rise-cap" aria-hidden />
            <div className="pt-sheet__content">
              <section className="homepage-2-placeholder">
                <p className="homepage-2-placeholder__eyebrow">Hathor</p>
                <h1>The Hathor Experience</h1>
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* LAYER 3: Book Now buttons only. Standard site nav remains unchanged. */}
      <div className="homepage-2-book-now-layer" aria-label="Booking shortcuts">
        <BookNowTrigger className="book-now-btn">BOOK NOW</BookNowTrigger>
        <BookNowTrigger className="book-now-btn">BOOK NOW</BookNowTrigger>
      </div>
    </>
  );
}
