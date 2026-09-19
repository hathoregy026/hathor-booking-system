"use client";

import { useEffect, type RefObject } from "react";

/**
 * Publishes an element's height as `--hj-sticky-h`, so a sticky column that is
 * taller than the screen can use it to scroll to its end before it sticks,
 * instead of hiding its foot or scrolling inside a box of its own.
 */
export function useStickyFit(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      element.style.setProperty("--hj-sticky-h", `${Math.ceil(element.getBoundingClientRect().height)}px`);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
}
