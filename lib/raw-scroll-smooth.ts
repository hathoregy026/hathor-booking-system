/**
 * Slow native (raw) document scroll via wheel hijack.
 * No-ops when a page already owns Lenis (`__hathorLenis` / `html.lenis`).
 * Does not alter GSAP pin/scrub timelines — only scales wheel → scrollY.
 */

export const RAW_SCROLL_WHEEL_FACTOR = 0.42;

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

/**
 * Bind slowed raw wheel scroll. Returns cleanup.
 * Safe to call on Lenis routes — each wheel checks ownership and passes through.
 */
export function bindRawScrollSmooth(
  factor: number = RAW_SCROLL_WHEEL_FACTOR,
): () => void {
  if (typeof window === "undefined") return () => {};
  if (prefersReducedMotion()) return () => {};

  const onWheel = (event: WheelEvent) => {
    if (pageOwnsLenis()) return;
    if (event.ctrlKey) return; /* browser zoom */
    if (event.defaultPrevented) return;
    if (hasNestedScrollContainer(event.target)) return;

    const { x, y } = normalizeWheelDelta(event);
    if (x === 0 && y === 0) return;

    event.preventDefault();
    window.scrollBy({
      top: y * factor,
      left: x * factor,
      behavior: "auto",
    });
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  return () => {
    window.removeEventListener("wheel", onWheel);
  };
}
