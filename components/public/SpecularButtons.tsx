"use client";

import { useEffect } from "react";

const SELECTOR = [
  ".public-site a.btn",
  ".public-site button.btn",
  ".public-site .public-btn-gold",
  ".public-site .public-btn-outline-gold",
  ".public-site .public-btn-dark",
  ".public-site .hero-cta",
].join(", ");

const SKIP_CLOSEST = [
  ".hathor-booking-modal",
  ".admin-shell",
  "[data-specular-skip]",
].join(", ");

/**
 * Makes the gold specular rim follow the pointer on public CTAs.
 * Base rotating rim is pure CSS (always visible).
 */
export function SpecularButtons() {
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const cleanups: Array<() => void> = [];

    const bind = (el: HTMLElement) => {
      if (el.dataset.specularLive === "1") return;
      if (el.closest(SKIP_CLOSEST)) return;
      el.dataset.specularLive = "1";

      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
        el.style.setProperty("--sb-angle", `${angle}deg`);
      };

      const onLeave = () => {
        el.style.removeProperty("--sb-angle");
        el.dataset.specularLive = "0";
        /* Resume CSS spin after leave */
        requestAnimationFrame(() => {
          if (!el.matches(":hover")) {
            delete el.dataset.specularLive;
          }
        });
      };

      const onEnter = () => {
        el.dataset.specularLive = "1";
      };

      el.addEventListener("pointerenter", onEnter);
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        el.removeEventListener("pointerenter", onEnter);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        delete el.dataset.specularLive;
        el.style.removeProperty("--sb-angle");
      });
    };

    const enhance = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLElement>(SELECTOR).forEach(bind);
    };

    enhance();

    const mo = new MutationObserver(() => enhance());
    mo.observe(document.body, { childList: true, subtree: true });
    cleanups.push(() => mo.disconnect());

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, []);

  return null;
}
