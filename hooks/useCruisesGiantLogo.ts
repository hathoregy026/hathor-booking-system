/**
 * Giant Hathor logo — rises between hero image and page content.
 */
"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";

const LOGO_LAND = {
  duration: 1.6,
  delay: 0.15,
  ease: "power2.out",
};

function getLogoHiddenY() {
  return Math.min(window.innerHeight * 0.22, 180);
}

export function useCruisesGiantLogo(logoRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const logoEl = logoRef.current;
    if (!logoEl) return;

    let landingTween: gsap.core.Tween | null = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;

    function playLanding() {
      landingTween?.kill();
      const hiddenY = getLogoHiddenY();

      gsap.set(logoEl, {
        y: reducedMotion ? 0 : hiddenY,
        opacity: reducedMotion ? 1 : 0,
      });

      if (reducedMotion) return;

      landingTween = gsap.to(logoEl, {
        y: 0,
        opacity: 1,
        duration: LOGO_LAND.duration,
        delay: LOGO_LAND.delay,
        ease: LOGO_LAND.ease,
      });
    }

    playLanding();

    const onResize = () => {
      if (!landingTween || !landingTween.isActive()) return;
      playLanding();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      landingTween?.kill();
      gsap.set(logoEl, { clearProps: "transform,opacity" });
    };
  }, [logoRef]);
}
