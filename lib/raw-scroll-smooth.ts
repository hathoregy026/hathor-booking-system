/**
 * Slow native (raw) document scroll via wheel hijack + rAF lerp.
 * Matches display refresh via requestAnimationFrame.
 * No-ops when a page already owns Lenis (`__hathorLenis` / `html.lenis`).
 * Does not alter GSAP pin/scrub timelines.
 */

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerHathorLenis } from "@/lib/scroll-position-restore";

export const RAW_SCROLL_WHEEL_FACTOR = 0.42;
/** Per-frame approach toward target (higher = snappier). Tuned for ~60–120 Hz. */
export const RAW_SCROLL_LERP = 0.14;
const SETTLE_PX = 0.4;

/** Lenis duration (higher = slower). Raw pages only (non-home / non-rooms). */
const RAW_SCROLL_LENIS_DURATION = 1.85;

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

function isScrollableOverflow(el: Element): boolean {
  const style = window.getComputedStyle(el);
  const oy = style.overflowY;
  if (oy !== "auto" && oy !== "scroll" && oy !== "overlay") return false;
  return (el as HTMLElement).scrollHeight > (el as HTMLElement).clientHeight + 1;
}

/** Nested overflow panels (modals, dropdowns) keep native scroll. */
export function hasNestedScrollContainer(start: EventTarget | null): boolean {
  let el: Element | null =
    start instanceof Element
      ? start
      : start instanceof Node
        ? start.parentElement
        : null;

  while (el && el !== document.documentElement && el !== document.body) {
    if (el instanceof HTMLElement) {
      const tag = el.tagName;
      if (tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.isContentEditable) return true;
      if (el.getAttribute("role") === "dialog" || el.getAttribute("aria-modal") === "true") {
        if (isScrollableOverflow(el)) return true;
      }
    }
    if (isScrollableOverflow(el)) return true;
    el = el.parentElement;
  }
  return false;
}

function normalizeWheelDelta(event: WheelEvent): { x: number; y: number } {
  let { deltaX, deltaY } = event;
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    deltaX *= 16;
    deltaY *= 16;
  } else if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    deltaX *= window.innerWidth;
    deltaY *= window.innerHeight;
  }
  return { x: deltaX, y: deltaY };
}

function maxScrollY(): number {
  const doc = document.documentElement;
  return Math.max(0, doc.scrollHeight - window.innerHeight);
}

function clampScrollY(y: number): number {
  return Math.min(maxScrollY(), Math.max(0, y));
}

/**
 * Bind slowed raw document scroll using Lenis (RAF-based).
 * Only activates when the page does not already own Lenis.
 */
export function bindRawScrollSmooth(
  _factor: number = RAW_SCROLL_WHEEL_FACTOR,
  _lerp: number = RAW_SCROLL_LERP,
): () => void {
  if (typeof window === "undefined") return () => {};
  if (prefersReducedMotion()) return () => {};

  // If the page already has its own Lenis (home/rooms), do nothing.
  if (pageOwnsLenis()) return () => {};

  const lenis = new Lenis({
    duration: RAW_SCROLL_LENIS_DURATION,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  });

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
