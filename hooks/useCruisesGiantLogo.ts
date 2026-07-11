/**
 * Giant Hathor logo — slow smooth landing, hides fully behind content on scroll.
 */
"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";

const PIN_VH = 1.05;
const LANDED_Y_OFFSET = 10;

const LOGO_LAND = {
  duration: 3.4,
  delay: 0.5,
  ease: "power3.out",
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function mapRange(
  p: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) {
  const t = clamp((p - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function useCruisesGiantLogo(
  runwayRef: RefObject<HTMLElement | null>,
  logoRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const runway = runwayRef.current;
    const logo = logoRef.current;
    if (!runway || !logo) return;

    const runwayEl = runway;
    const logoEl = logo;

    let landingTween: gsap.core.Tween | null = null;
    let hasScrolled = false;

    function getRunwayScrollDistance() {
      return window.innerHeight * PIN_VH;
    }

    function getLogoHideDistance() {
      const logoHeight = logoEl.offsetHeight || window.innerHeight * 0.42;
      return logoHeight * 0.62 + window.innerHeight * 0.14;
    }

    function getLandingStartY() {
      return getLogoHideDistance() + LANDED_Y_OFFSET;
    }

    function setupLanding() {
      landingTween?.kill();
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;

      gsap.set(logoEl, {
        xPercent: -50,
        y: reduced ? LANDED_Y_OFFSET : getLandingStartY(),
        opacity: 1,
      });

      if (reduced) return;

      landingTween = gsap.to(logoEl, {
        y: LANDED_Y_OFFSET,
        duration: LOGO_LAND.duration,
        delay: LOGO_LAND.delay,
        ease: LOGO_LAND.ease,
      });
    }

    function syncFromScroll() {
      const top = runwayEl.getBoundingClientRect().top + window.scrollY;
      const scroll = window.scrollY;
      const pinProgress = Math.max(
        0,
        (scroll - top) / getRunwayScrollDistance(),
      );
      const hideT = easeOutCubic(mapRange(pinProgress, 0, 1, 0, 1));

      if (pinProgress > 0.001) {
        hasScrolled = true;
        landingTween?.kill();
        landingTween = null;
        gsap.set(logoEl, {
          y: LANDED_Y_OFFSET + hideT * getLogoHideDistance(),
        });
      } else if (!hasScrolled && !landingTween) {
        setupLanding();
      }
    }

    setupLanding();

    const onScroll = () => syncFromScroll();
    const onResize = () => {
      if (hasScrolled) syncFromScroll();
      else setupLanding();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      landingTween?.kill();
      gsap.set(logoEl, { clearProps: "transform,opacity" });
    };
  }, [runwayRef, logoRef]);
}
