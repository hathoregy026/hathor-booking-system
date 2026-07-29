"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  applyTouchDeviceClass,
  bindViewportHeightVar,
} from "@/lib/touch-device";

/**
 * Debounced ScrollTrigger.refresh only.
 * Undebounced resize refresh on mobile Safari (URL bar show/hide) causes
 * lag, pin glitches, and “nothing scrolls” freezes.
 */
function bindDebouncedScrollTriggerRefresh(debounceMs = 250): () => void {
  if (typeof window === "undefined") return () => {};

  gsap.registerPlugin(ScrollTrigger);

  let timer: ReturnType<typeof setTimeout> | undefined;

  const refresh = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    }, debounceMs);
  };

  const onOrientation = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    }, 300);
  };

  window.addEventListener("resize", refresh, { passive: true });
  window.addEventListener("orientationchange", onOrientation, { passive: true });
  // Do not bind visualViewport.resize — iOS URL-bar show/hide spams it and freezes pins.

  return () => {
    if (timer) clearTimeout(timer);
    window.removeEventListener("resize", refresh);
    window.removeEventListener("orientationchange", onOrientation);
  };
}

/**
 * Real-phone bootstrap (DevTools often stays pointer:fine — phones are coarse).
 */
export function TouchDeviceBootstrap() {
  useEffect(() => {
    applyTouchDeviceClass();

    const onPointerChange = () => applyTouchDeviceClass();
    const mq = window.matchMedia("(pointer: coarse)");
    mq.addEventListener?.("change", onPointerChange);

    const unbindVh = bindViewportHeightVar();
    const unbindSt = bindDebouncedScrollTriggerRefresh(250);

    return () => {
      mq.removeEventListener?.("change", onPointerChange);
      unbindVh();
      unbindSt();
    };
  }, []);

  return null;
}
