"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";

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
      const pastPin = rootEl.classList.contains("hathor-page-scroll--past-pin");

      if (pastPin) {
        gsap.set(followerEl, {
          clearProps: "transform,borderTopLeftRadius,borderTopRightRadius",
        });
        return;
      }

      const sheetY = Number(gsap.getProperty(sheetEl, "y") ?? 0);
      const radius = gsap.getProperty(sheetEl, "borderTopLeftRadius");

      gsap.set(followerEl, {
        y: sheetY,
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
      });
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
      gsap.set(followerEl, {
        clearProps: "transform,borderTopLeftRadius,borderTopRightRadius",
      });
    };
  }, [root, sheet, follower]);
}
