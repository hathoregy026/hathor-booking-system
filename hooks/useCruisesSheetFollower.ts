"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import {
  CRUISES_PIN_DISTANCE_VH,
  CRUISES_RISE_END,
} from "@/hooks/useCruisesScrollTransition";

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/** Lock follower to the cream runway, then scroll with the page after rise completes. */
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
      const pastPin = rootEl.classList.contains("hathor-page-scroll--past-pin");

      if (pastPin) {
        return;
      }

      const vh = window.innerHeight;
      const top = rootEl.getBoundingClientRect().top + window.scrollY;
      const pinDistance = vh * CRUISES_PIN_DISTANCE_VH;
      const scrollInPin = clamp(window.scrollY - top, 0, pinDistance);
      const riseEndScroll = pinDistance * CRUISES_RISE_END;
      const tailScroll = Math.max(0, scrollInPin - riseEndScroll);

      const sheetY = Number(gsap.getProperty(sheetEl, "y") ?? 0);
      gsap.set(followerEl, { y: sheetY - tailScroll });
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    const observer = new MutationObserver(sync);
    observer.observe(rootEl, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      observer.disconnect();
      gsap.set(followerEl, { clearProps: "transform" });
    };
  }, [root, sheet, follower]);
}
