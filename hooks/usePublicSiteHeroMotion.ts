"use client";

import { useLayoutEffect, type RefObject } from "react";
import { mountHeroScrollStage } from "@/lib/hero-scroll-stage";

/** Home-style hero scroll (logo landing, gold blinds, pin) for inner public pages. */
export function usePublicSiteHeroMotion(
  heroRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useLayoutEffect(() => {
    if (!enabled) return;
    const hero = heroRef.current;
    if (!hero) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const cleanup = mountHeroScrollStage({
      prefersReduced,
      lenis: null,
      hero,
    });

    return cleanup;
  }, [enabled, heroRef]);
}
