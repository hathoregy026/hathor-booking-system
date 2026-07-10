/**
 * Second giant logo at sheet–footer seam — same landing rise as hero.
 * In front of sheet, footer sits on top (covers logo bottom).
 */
"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";

const LOGO_LAND = {
  duration: 1.85,
  delay: 0.2,
  ease: "power2.out",
};

function getLogoHiddenY() {
  return window.innerHeight * 0.34;
}

export function useHomePage2FooterGiantLogo(
  logoRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    const logoEl = logo;
    let landingTween: gsap.core.Tween | null = null;
    let hasRisen = false;

    function hideLogo() {
      landingTween?.kill();
      landingTween = null;
      hasRisen = false;
      gsap.set(logoEl, {
        xPercent: -50,
        y: getLogoHiddenY(),
        opacity: 0,
        visibility: "hidden",
      });
    }

    function riseLogo() {
      if (hasRisen) return;
      hasRisen = true;
      landingTween?.kill();

      const hiddenY = getLogoHiddenY();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.set(logoEl, {
        xPercent: -50,
        y: reducedMotion ? 0 : hiddenY,
        opacity: 1,
        visibility: "visible",
      });

      if (reducedMotion) return;

      landingTween = gsap.to(logoEl, {
        y: 0,
        duration: LOGO_LAND.duration,
        delay: LOGO_LAND.delay,
        ease: LOGO_LAND.ease,
      });
    }

    function sync() {
      const footer = document.querySelector<HTMLElement>(".homepage-2-footer");
      if (!footer) return;

      const footerTop = footer.getBoundingClientRect().top;
      const vh = window.innerHeight;

      if (footerTop <= vh * 0.94) {
        riseLogo();
      } else if (footerTop > vh * 1.08) {
        hideLogo();
      }
    }

    hideLogo();

    const onScroll = () => sync();
    const onResize = () => {
      if (hasRisen) {
        gsap.set(logoEl, { xPercent: -50, y: 0, opacity: 1, visibility: "visible" });
      } else {
        hideLogo();
      }
      sync();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    sync();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      landingTween?.kill();
      gsap.set(logoEl, { clearProps: "transform,opacity,visibility" });
    };
  }, [logoRef]);
}
