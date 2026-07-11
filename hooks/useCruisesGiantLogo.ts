/**
 * Giant Hathor logo — same animation as Homepage 2 / previous cruises hero.
 * Rises from behind the cream content section (not a rising sheet).
 */
"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";

const LOGO_LAND = {
  duration: 1.85,
  delay: 0.2,
  ease: "power2.out",
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

function getLogoHiddenY() {
  return window.innerHeight * 0.34;
}

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

    function getRunwayScrollDistance() {
      const vh = window.innerHeight;
      return Math.max(vh * 0.5, rootEl.offsetHeight - vh);
    }

    function setupGiantLogoLanding() {
      landingTween?.kill();
      const hiddenY = getLogoHiddenY();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;

      gsap.set(logoEl, {
        xPercent: -50,
        y: reducedMotion ? 0 : hiddenY,
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

    function syncLogoFromScroll() {
      const vh = window.innerHeight;
      const top = rootEl.getBoundingClientRect().top + window.scrollY;
      const scroll = window.scrollY;
      const pinProgress = Math.max(0, (scroll - top) / getRunwayScrollDistance());
      const riseT = mapRange(pinProgress, 0, 0.7, 0, 1);

      if (pinProgress > 0.001) {
        hasScrolled = true;
        landingTween?.kill();
        landingTween = null;
        const scrollLogoY = mapRange(riseT, 0, 1, 0, getLogoHiddenY());
        gsap.set(logoEl, { y: scrollLogoY });
      } else if (!hasScrolled && !landingTween) {
        setupGiantLogoLanding();
      }
    }

    setupGiantLogoLanding();

    const onScroll = () => syncLogoFromScroll();
    const onResize = () => {
      if (hasScrolled) syncLogoFromScroll();
      else setupGiantLogoLanding();
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
