"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";

const PIN_VH = 4.2;

/** Lock follower to the cream runway transform (read from GSAP sheet). */
export function useCruisesSheetFollower(
  root: RefObject<HTMLElement | null>,
  sheet: RefObject<HTMLElement | null>,
  follower: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const rootEl = root.current;
    const sheetEl = sheet.current;
    const followerEl = follower.current;
    if (!rootEl || !sheetEl || !followerEl) return;

    const sync = () => {
      const vh = window.innerHeight;
      const top = rootEl.getBoundingClientRect().top + window.scrollY;
      const progress = Math.max(0, Math.min(1, (window.scrollY - top) / (vh * PIN_VH)));
      const pastPin = progress >= 0.92;

      if (pastPin) {
        gsap.set(followerEl, { clearProps: "transform" });
        return;
      }

      const sheetY = gsap.getProperty(sheetEl, "y");
      gsap.set(followerEl, { y: sheetY });
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [root, sheet, follower]);
}
