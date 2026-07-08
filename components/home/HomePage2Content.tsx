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
      const creamStage = pinProgress > 0.38;
      const hideMedia = !inHeroZone && pinProgress > 0.45;
      const pastPin = pinProgress >= 0.85;

      root.classList.toggle("hathor-page-scroll--cream-stage", creamStage);
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
        { y: 40, opacity: 0.84 },
        {
          y: 0,
          opacity: 1,
          duration: 1.35,
          ease: "power3.out",
          delay: 0.15,
        },
      );

      gsap.to(logo, {
        y: () => -window.innerHeight * 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${window.innerHeight * PIN_VH}`,
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <>
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

            <div ref={heroCopyRef} className={styles.heroCopy}>
              <p className={styles.heroEyebrow}>Ultra Luxury</p>
              <h1 className={styles.heroTitle}>Dahabiya Cruise</h1>
              <p className={styles.heroSubtitle}>
                Your Luxury Trip Begins With Hathor Dahabiya
              </p>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={backLogoRef}
            src={BACK_LOGO_SRC}
            alt=""
            className={`homepage-2-back-logo ${styles.backLogo}`}
            aria-hidden
          />
          </div>

          <div ref={sheetRef} className={`pt-sheet ${styles.sheet}`}>
            <div className={styles.sheetCap} aria-hidden />
          </div>
        </div>
      </section>

      <div className="homepage-2-cream-floor" aria-hidden="true">
        <div className="homepage-2-cream-floor__inner" />
      </div>
    </>
  );
}
