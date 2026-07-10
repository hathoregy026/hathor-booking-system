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

function getMaxScroll() {
  return Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    0,
  );
}

function isNearPageBottom(thresholdPx = 64) {
  return window.scrollY >= getMaxScroll() - thresholdPx;
}

/** Cruises-local copy of the proven Homepage 2 footer-logo rise. */
export function useCruisesFooterGiantLogo(
  logoRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const logo = logoRef.current;
    if (!logo) return;

    const logoEl = logo;
    let landingTween: gsap.core.Tween | null = null;
    let hasRisen = false;

    function setResting() {
      landingTween?.kill();
      landingTween = null;
      gsap.set(logoEl, {
        xPercent: -50,
        y: 0,
        opacity: 1,
        visibility: "visible",
      });
    }

    function hide() {
      if (hasRisen) return;

      landingTween?.kill();
      landingTween = null;
      gsap.set(logoEl, {
        xPercent: -50,
        y: getLogoHiddenY(),
        opacity: 0,
        visibility: "hidden",
      });
    }

    function rise() {
      if (hasRisen) {
        setResting();
        return;
      }

      hasRisen = true;
      landingTween?.kill();

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reducedMotion || isNearPageBottom()) {
        setResting();
        return;
      }

      gsap.set(logoEl, {
        xPercent: -50,
        y: getLogoHiddenY(),
        opacity: 1,
        visibility: "visible",
      });

      landingTween = gsap.to(logoEl, {
        y: 0,
        duration: LOGO_LAND.duration,
        delay: LOGO_LAND.delay,
        ease: LOGO_LAND.ease,
      });
    }

    function sync() {
      const footer = document.querySelector<HTMLElement>(".cruises-footer");
      if (!footer) return;

      if (isNearPageBottom()) {
        if (hasRisen) setResting();
        else rise();
        return;
      }

      const footerTop = footer.getBoundingClientRect().top;
      const viewportHeight = window.innerHeight;

      if (footerTop <= viewportHeight * 0.94) {
        rise();
      } else if (!hasRisen && footerTop > viewportHeight * 1.2) {
        hide();
      }
    }

    hide();

    const onScroll = () => sync();
    const onResize = () => {
      if (hasRisen) setResting();
      else hide();
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
