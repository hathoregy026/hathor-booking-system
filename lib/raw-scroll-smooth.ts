/** Homepage-equivalent Lenis for public pages without their own scroll engine. */

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerHathorLenis } from "@/lib/scroll-position-restore";
import { isTouchDevice, lenisMobileSafeOptions } from "@/lib/touch-device";

/** Match the proven homepage pacing; higher values felt laggy with hero scrub. */
export const RAW_SCROLL_LENIS_DURATION = 1.4;

type HathorWindow = Window & {
  __hathorLenis?: unknown;
};

export function pageOwnsLenis(): boolean {
  if (typeof window === "undefined") return false;
  if ((window as HathorWindow).__hathorLenis) return true;
  return document.documentElement.classList.contains("lenis");
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Bind slowed raw document scroll using Lenis (RAF-based).
 * Only activates when the page does not already own Lenis.
 */
export function bindRawScrollSmooth(): () => void {
  if (typeof window === "undefined") return () => {};
  if (prefersReducedMotion()) return () => {};
  // Touch devices: native scroll only (Lenis causes finger-scroll jumping).
  if (isTouchDevice()) return () => {};

  // If the page already has its own Lenis (home/rooms), do nothing.
  if (pageOwnsLenis()) return () => {};

  const lenis = new Lenis(lenisMobileSafeOptions(RAW_SCROLL_LENIS_DURATION));

  // Keep ScrollTrigger in sync with Lenis.
  lenis.on("scroll", ScrollTrigger.update);
  registerHathorLenis(lenis);

  const ticker = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);

  return () => {
    try {
      gsap.ticker.remove(ticker);
      lenis.destroy();
    } finally {
      // Only clear ownership if this bind instance is still registered.
      try {
        const current = (window as HathorWindow).__hathorLenis;
        if (current === lenis) registerHathorLenis(null);
      } catch {
        /* ignore */
      }
    }
  };
}
