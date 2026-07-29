/**
 * Slow native (raw) document scroll via wheel hijack + rAF lerp.
 * Matches display refresh via requestAnimationFrame.
 * No-ops when a page already owns Lenis (`__hathorLenis` / `html.lenis`).
 * Does not alter GSAP pin/scrub timelines — only drives wheel → scrollY.
 */

export const RAW_SCROLL_WHEEL_FACTOR = 0.42;
/** Per-frame approach toward target (higher = snappier). Tuned for ~60–120 Hz. */
export const RAW_SCROLL_LERP = 0.14;
const SETTLE_PX = 0.4;

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
 * Bind slowed raw wheel scroll with rAF smoothing. Returns cleanup.
 * Safe on Lenis routes — each wheel checks ownership and passes through.
 */
export function bindRawScrollSmooth(
  factor: number = RAW_SCROLL_WHEEL_FACTOR,
  lerp: number = RAW_SCROLL_LERP,
): () => void {
  if (typeof window === "undefined") return () => {};
  if (prefersReducedMotion()) return () => {};

  let targetY = window.scrollY || 0;
  let currentY = targetY;
  let rafId = 0;

  const stopLoop = () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const tick = () => {
    rafId = 0;
    if (pageOwnsLenis()) {
      stopLoop();
      return;
    }

    const delta = targetY - currentY;
    if (Math.abs(delta) < SETTLE_PX) {
      currentY = targetY;
      window.scrollTo(0, currentY);
      return;
    }

    currentY += delta * lerp;
    window.scrollTo(0, currentY);
    rafId = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (!rafId) rafId = requestAnimationFrame(tick);
  };

  const onWheel = (event: WheelEvent) => {
    if (pageOwnsLenis()) return;
    if (event.ctrlKey) return; /* browser zoom */
    if (event.defaultPrevented) return;
    if (hasNestedScrollContainer(event.target)) return;

    const { y } = normalizeWheelDelta(event);
    if (y === 0) return;

    event.preventDefault();

    /* Re-sync if something else moved the page between frames */
    if (!rafId) {
      currentY = window.scrollY || 0;
      targetY = currentY;
    }

    targetY = clampScrollY(targetY + y * factor);
    startLoop();
  };

  window.addEventListener("wheel", onWheel, { passive: false });

  return () => {
    stopLoop();
    window.removeEventListener("wheel", onWheel);
  };
}
