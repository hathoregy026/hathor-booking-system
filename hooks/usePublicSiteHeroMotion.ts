"use client";

import { useLayoutEffect } from "react";
import { mountHeroScrollStage } from "@/lib/hero-scroll-stage";

/** Home-style hero scroll (logo landing, gold blinds, pin) for inner public pages. */
export function usePublicSiteHeroMotion(enabled = true) {
  useLayoutEffect(() => {
    if (!enabled) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const cleanup = mountHeroScrollStage({ prefersReduced, lenis: null });

    return cleanup;
  }, [enabled]);
}
