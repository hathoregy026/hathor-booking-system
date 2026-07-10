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

function getMaxScroll() {
  return Math.max(
    document.documentElement.scrollHeight - window.innerHeight,
    0,
  );
}

function isNearPageBottom(thresholdPx = 64) {
  return window.scrollY >= getMaxScroll() - thresholdPx;
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

    function setLogoResting() {
      landingTween?.kill();
      landingTween = null;
      gsap.set(logoEl, {
        xPercent: -50,
        y: 0,
        opacity: 1,
        visibility: "visible",
      });
    }

    function hideLogo() {
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

    function riseLogo() {
      if (hasRisen) {
        setLogoResting();
        return;
      }

      hasRisen = true;
      landingTween?.kill();

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (reducedMotion || isNearPageBottom()) {
        setLogoResting();
        return;
      }

      const hiddenY = getLogoHiddenY();
      gsap.set(logoEl, {
        xPercent: -50,
        y: hiddenY,
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
      const footer = document.querySelector<HTMLElement>(".homepage-2-footer");
      if (!footer) return;

      if (isNearPageBottom()) {
        if (hasRisen) {
          setLogoResting();
        } else {
          riseLogo();
        }
        return;
      }

      const footerTop = footer.getBoundingClientRect().top;
      const vh = window.innerHeight;

      if (footerTop <= vh * 0.94) {
        riseLogo();
        return;
      }

      if (!hasRisen && footerTop > vh * 1.2) {
        hideLogo();
      }
    }

    hideLogo();

    const onScroll = () => sync();
    const onResize = () => {
      if (hasRisen) {
        setLogoResting();
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
