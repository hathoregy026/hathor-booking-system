"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  applyTouchDeviceClass,
  bindViewportHeightVar,
} from "@/lib/touch-device";

function bindDebouncedScrollTriggerRefresh(debounceMs = 200): () => void {
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

  window.addEventListener("resize", refresh, { passive: true });
  window.addEventListener("orientationchange", refresh, { passive: true });
  window.visualViewport?.addEventListener("resize", refresh);

  return () => {
    if (timer) clearTimeout(timer);
    window.removeEventListener("resize", refresh);
    window.removeEventListener("orientationchange", refresh);
    window.visualViewport?.removeEventListener("resize", refresh);
  };
}

/**
 * Client-side touch bootstrap:
 * - Keeps `is-touch-device` class in sync
 * - Maintains `--vh` for iOS dynamic viewport fallback
 * - Debounced ScrollTrigger.refresh on resize/orientation (pin fix)
 */
export function TouchDeviceBootstrap() {
  useEffect(() => {
    applyTouchDeviceClass();

    const onPointerChange = () => applyTouchDeviceClass();
    const mq = window.matchMedia("(pointer: coarse)");
    mq.addEventListener?.("change", onPointerChange);

    const unbindVh = bindViewportHeightVar();
    const unbindSt = bindDebouncedScrollTriggerRefresh(200);

    return () => {
      mq.removeEventListener?.("change", onPointerChange);
      unbindVh();
      unbindSt();
    };
  }, []);

  return null;
}
