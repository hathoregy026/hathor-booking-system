/**
 * Homepage-2 only — after dome pin completes, reset sheet Y so drift
 * does not leave a gap above the cream column. Does not touch radius or hero.
 */
"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";

const PIN_VH = 4.2;

export function useHomePage2PinHandoff() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(
      ".homepage-2-root [data-page-transition]",
    );
    const sheet = document.querySelector<HTMLElement>(
      ".homepage-2-root [data-page-transition] .pt-sheet",
    );
    if (!root || !sheet) return;

    const rootEl = root;
    const sheetEl = sheet;

    function sync() {
      const vh = window.innerHeight;
      const top = rootEl.getBoundingClientRect().top + window.scrollY;
      const pinProgress = Math.max(0, (window.scrollY - top) / (vh * PIN_VH));

      if (pinProgress >= 0.94) {
        gsap.set(sheetEl, { y: 0 });
      }
    }

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);
}
