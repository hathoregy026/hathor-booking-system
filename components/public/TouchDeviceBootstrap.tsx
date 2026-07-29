"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  applyTouchDeviceClass,
  bindViewportHeightVar,
  isTouchDevice,
} from "@/lib/touch-device";

type WindowWithScrollTrigger = Window & {
  ScrollTrigger?: typeof ScrollTrigger;
};

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

  const touch = isTouchDevice();

  /*
   * Mobile browser chrome changes viewport height while the finger scrolls.
   * Refreshing every ScrollTrigger during that resize is the page jump.
   * Phones refresh after orientation only; fine-pointer devices keep resize.
   */
  if (!touch) {
    window.addEventListener("resize", refresh, { passive: true });
    window.visualViewport?.addEventListener("resize", refresh);
  }
  window.addEventListener("orientationchange", refresh, { passive: true });

  return () => {
    if (timer) clearTimeout(timer);
    if (!touch) {
      window.removeEventListener("resize", refresh);
      window.visualViewport?.removeEventListener("resize", refresh);
    }
    window.removeEventListener("orientationchange", refresh);
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

    gsap.registerPlugin(ScrollTrigger);
    const win = window as WindowWithScrollTrigger;
    win.ScrollTrigger = ScrollTrigger;

    const onPointerChange = () => applyTouchDeviceClass();
    const mq = window.matchMedia("(pointer: coarse)");
    mq.addEventListener?.("change", onPointerChange);

    const unbindVh = bindViewportHeightVar();
    /* Single debounced refresh path — undebounced + debounced double-fires caused scroll glitches */
    const unbindSt = bindDebouncedScrollTriggerRefresh(200);

    return () => {
      mq.removeEventListener?.("change", onPointerChange);
      unbindVh();
      unbindSt();
    };
  }, []);

  return null;
}
