/**
 * Homepage-2 sheet–footer seam logo — rises from the gap onto the sheet,
 * then dips behind the footer on further scroll.
 */
"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";

const PIN_VH = 4.2;

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

export function useHomePage2SheetFooterLogo(
  transitionRef: RefObject<HTMLElement | null>,
  logoRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const transition = transitionRef.current;
    const logo = logoRef.current;
    if (!transition || !logo) return;

    const transitionEl = transition;
    const logoEl = logo;

    function sync() {
      const vh = window.innerHeight;
      const footer = document.querySelector<HTMLElement>(".public-site > .owo-footer");
      if (!footer) return;

      const transitionTop = transitionEl.getBoundingClientRect().top + window.scrollY;
      const pinProgress = Math.max(
        0,
        (window.scrollY - transitionTop) / (vh * PIN_VH),
      );

      if (pinProgress < 0.88) {
        gsap.set(logoEl, {
          xPercent: -50,
          y: vh * 0.5,
          opacity: 0,
          visibility: "hidden",
        });
        logoEl.classList.remove("is-behind-footer");
        return;
      }

      const footerTop = footer.getBoundingClientRect().top;
      const riseP = easeOutCubic(mapRange(footerTop, vh, vh * 0.58, 0, 1));
      const dipP = easeOutCubic(mapRange(footerTop, vh * 0.58, vh * 0.18, 0, 1));

      let y: number;
      if (dipP <= 0) {
        y = mapRange(riseP, 0, 1, vh * 0.46, vh * -0.14);
        logoEl.classList.remove("is-behind-footer");
      } else {
        y = mapRange(dipP, 0, 1, vh * -0.14, vh * 0.32);
        logoEl.classList.toggle("is-behind-footer", dipP > 0.35);
      }

      gsap.set(logoEl, {
        xPercent: -50,
        y,
        opacity: riseP > 0.02 ? 1 : 0,
        visibility: riseP > 0.02 ? "visible" : "hidden",
      });
    }

    gsap.set(logoEl, { xPercent: -50, opacity: 0, visibility: "hidden" });

    const onScroll = () => sync();
    const onResize = () => sync();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    sync();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      logoEl.classList.remove("is-behind-footer");
      gsap.set(logoEl, { clearProps: "transform,opacity,visibility" });
    };
  }, [transitionRef, logoRef]);
}
