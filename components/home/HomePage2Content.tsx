"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ParallaxHeroVideo } from "@/components/ui/ParallaxHeroVideo";
import {
  HATHOR_HERO_VIDEO_SRC,
  HATHOR_HERO_POSTER_SRC,
} from "@/lib/branding";
import { usePageScrollTransition } from "@/components/pages/pageScrollTransitionEngine";
import styles from "./HomePage2Experience.module.css";

const PIN_VH = 4.2;
const BACK_LOGO_SRC =
  "/branding/hathor-logo-behing-the-sheet-egypt-toors-pyramids.svg";

export function HomePage2Content() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const heroCopyRef = useRef<HTMLDivElement>(null);
  const backLogoRef = useRef<HTMLImageElement>(null);

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

  useLayoutEffect(() => {
    const root = rootRef.current;
    const logo = backLogoRef.current;
    if (!root || !logo) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        logo,
        { y: 48, opacity: 0.82 },
        {
          y: 0,
          opacity: 1,
          duration: 1.35,
          ease: "power3.out",
          delay: 0.2,
        },
      );

      gsap.to(logo, {
        y: () => -window.innerHeight * 0.18,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${window.innerHeight * PIN_VH}`,
          scrub: 1.4,
          invalidateOnRefresh: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      data-page-transition
      data-homepage2-transition
      className={`hathor-page-scroll-transition hathor-page-hero ${styles.root}`}
    >
      <div ref={stageRef} className={`pt-stage ${styles.stage}`}>
        <div className={`pt-hero ${styles.hero}`}>
          <div className={`pt-hero__media ${styles.heroMedia}`}>
            <ParallaxHeroVideo
              src={HATHOR_HERO_VIDEO_SRC}
              poster={HATHOR_HERO_POSTER_SRC}
              ariaLabel="Hathor Dahabiya sailing on the Nile"
              className={styles.heroVideo}
            />
            <div className={styles.heroShade} aria-hidden />
          </div>

          <div ref={maskRef} className="pt-mask" aria-hidden="true" />
          <div ref={heroCopyRef} className={styles.heroCopy} aria-hidden="true" />

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={backLogoRef}
            src={BACK_LOGO_SRC}
            alt=""
            className={styles.backLogo}
            aria-hidden
          />
        </div>

        <div ref={sheetRef} className={`pt-sheet ${styles.sheet}`}>
          <div className={styles.sheetCap} aria-hidden />
          <div className="pt-sheet__content">
            <div className={styles.sheetBody} />
          </div>
        </div>
      </div>
    </section>
  );
}
