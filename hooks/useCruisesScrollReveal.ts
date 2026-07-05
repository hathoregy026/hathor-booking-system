"use client";

import { useLayoutEffect, useId, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type CruisesScrollRevealRefs = {
  track: RefObject<HTMLElement | null>;
  heroTitle: RefObject<HTMLElement | null>;
  secondTitle: RefObject<HTMLElement | null>;
  creamSheet: RefObject<HTMLElement | null>;
  heroMedia: RefObject<HTMLElement | null>;
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

export function useCruisesScrollReveal(refs: CruisesScrollRevealRefs) {
  const instanceId = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const track = refs.track.current;
    const heroTitle = refs.heroTitle.current;
    const secondTitle = refs.secondTitle.current;
    const creamSheet = refs.creamSheet.current;
    const heroMedia = refs.heroMedia.current;

    if (!track || !heroTitle || !secondTitle || !creamSheet) return;

    document.body.classList.add("cruises-scroll-reveal-route");
    document.documentElement.classList.add("cruises-scroll-reveal-route");
    document.body.style.backgroundColor = "#ece8df";

    function applyProgress(p: number) {
      const heroOpacity = mapRange(p, 0.12, 0.42, 1, 0);
      const heroScale = mapRange(p, 0.12, 0.42, 1, 0.9);
      gsap.set(heroTitle, {
        opacity: heroOpacity,
        scale: heroScale,
        pointerEvents: heroOpacity > 0.05 ? "auto" : "none",
      });

      const secondOpacity = mapRange(p, 0.28, 0.58, 0, 1);
      const secondScale = mapRange(p, 0.28, 0.58, 0.92, 1);
      gsap.set(secondTitle, {
        opacity: secondOpacity,
        scale: secondScale,
      });

      const creamY = mapRange(p, 0.38, 0.88, 100, 0);
      const creamRadius = mapRange(p, 0.38, 0.72, 1250, 22);
      gsap.set(creamSheet, {
        y: `${creamY}%`,
        borderTopLeftRadius: creamRadius,
        borderTopRightRadius: creamRadius,
      });

      if (heroMedia) {
        const mediaOpacity = mapRange(p, 0.45, 0.78, 1, 0);
        gsap.set(heroMedia, { opacity: mediaOpacity });
      }
    }

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      applyProgress(0);

      ScrollTrigger.create({
        id: `cruises-scroll-reveal-${instanceId}`,
        trigger: track,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyProgress(self.progress),
      });
    }, track);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      document.body.classList.remove("cruises-scroll-reveal-route");
      document.documentElement.classList.remove("cruises-scroll-reveal-route");
      document.body.style.backgroundColor = "";
    };
  }, [
    instanceId,
    refs.track,
    refs.heroTitle,
    refs.secondTitle,
    refs.creamSheet,
    refs.heroMedia,
  ]);
}

export function refreshCruisesScrollReveal() {
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.refresh();
}
