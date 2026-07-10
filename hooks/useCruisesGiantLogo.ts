"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";

const PIN_VH = 4.2;
const LOGO_LAND = {
  duration: 1.85,
  delay: 0.2,
  ease: "power2.out",
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function mapRange(
  progress: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) {
  const t = clamp((progress - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

function getLogoHiddenY() {
  return window.innerHeight * 0.34;
}

/** Cruises-local copy of the proven Homepage 2 giant-logo motion. */
export function useCruisesGiantLogo(
  rootRef: RefObject<HTMLElement | null>,
  giantLogoRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    const giantLogo = giantLogoRef.current;
    if (!root || !giantLogo) return;

    const rootEl = root;
    const logoEl = giantLogo;
    let landingTween: gsap.core.Tween | null = null;
    let hasScrolled = false;

    function setupLanding() {
      landingTween?.kill();
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      gsap.set(logoEl, {
        xPercent: -50,
        y: reducedMotion ? 0 : getLogoHiddenY(),
        opacity: 1,
      });

      if (reducedMotion) return;

      landingTween = gsap.to(logoEl, {
        y: 0,
        duration: LOGO_LAND.duration,
        delay: LOGO_LAND.delay,
        ease: LOGO_LAND.ease,
      });
    }

    function syncFromScroll() {
      const viewportHeight = window.innerHeight;
      const top = rootEl.getBoundingClientRect().top + window.scrollY;
      const pinProgress = Math.max(
        0,
        (window.scrollY - top) / (viewportHeight * PIN_VH),
      );
      const riseProgress = mapRange(pinProgress, 0, 0.7, 0, 1);

      if (pinProgress > 0.001) {
        hasScrolled = true;
        landingTween?.kill();
        landingTween = null;
        gsap.set(logoEl, {
          y: mapRange(riseProgress, 0, 1, 0, getLogoHiddenY()),
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
  }, [rootRef, giantLogoRef]);
}
