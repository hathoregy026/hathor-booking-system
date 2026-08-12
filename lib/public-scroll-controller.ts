"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  isTouchDevice,
  isPhoneOrTabletViewport,
  lenisMobileSafeOptions,
} from "@/lib/touch-device";
import { registerHathorLenis } from "@/lib/scroll-position-restore";

export type ScrollMode = "native" | "lenis";

export type PublicScrollController = {
  mode: ScrollMode;
  lenis: Lenis | null;
  start: () => void;
  stop: () => void;
  scrollTo: (
    target: number | string | HTMLElement,
    options?: Record<string, unknown>,
  ) => void;
  syncToCurrentScroll: () => void;
};

type State = {
  mode: ScrollMode;
  lenis: Lenis | null;
  ticker: ((time: number) => void) | null;
};

const state: State = {
  mode: "native",
  lenis: null,
  ticker: null,
};

function wantsNativeMode() {
  if (typeof window === "undefined") return true;
  /* Admin is a normal document scroller — Lenis + nested overflow locks freeze the panel. */
  if (window.location.pathname.startsWith("/admin")) return true;
  /* Cruises listing (mask-reveal layout) needs native sticky filters. */
  if (window.location.pathname.startsWith("/cruises")) return true;
  if (window.location.pathname.startsWith("/mask-reveal")) return true;
  /* Suites native: sticky mosaic + Springs chapters + comfort pin need document scroll. */
  if (window.location.pathname.startsWith("/suites")) return true;
  /* Fixed-Background Mask Reveal uses native scroll (Lenis breaks pin:fixed math). */
  if (window.location.pathname.startsWith("/gastronomy")) return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (isTouchDevice()) return true;
  if (isPhoneOrTabletViewport()) return true;
  if (window.matchMedia("(pointer: coarse)").matches) return true;
  if (!window.matchMedia("(hover: hover)").matches) return true;
  return false;
}

function teardownLenis() {
  if (state.ticker) {
    gsap.ticker.remove(state.ticker);
    state.ticker = null;
  }
  if (state.lenis) {
    state.lenis.destroy();
    state.lenis = null;
  }
  state.mode = "native";
  registerHathorLenis(null);
  exposeScrollDebug();
}

function exposeScrollDebug() {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV === "production") return;
  const w = window as Window & {
    ScrollTrigger?: typeof ScrollTrigger;
    __hathorScrollMode?: ScrollMode;
    __hathorLenisCount?: number;
  };
  w.ScrollTrigger = ScrollTrigger;
  w.__hathorScrollMode = state.mode;
  w.__hathorLenisCount = state.lenis ? 1 : 0;
}

function isWelcomeScrollLocked() {
  if (typeof document === "undefined") return false;
  return document.documentElement.classList.contains("hathor-welcome-lock");
}

function setupLenis() {
  if (state.lenis) {
    state.mode = "lenis";
    if (isWelcomeScrollLocked()) state.lenis.stop();
    exposeScrollDebug();
    return;
  }
  const lenis = new Lenis(lenisMobileSafeOptions(1.4));
  const ticker = (time: number) => {
    lenis.raf(time * 1000);
  };
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);
  state.lenis = lenis;
  state.ticker = ticker;
  state.mode = "lenis";
  /* Welcome splash may have locked before Lenis existed — stay stopped until unlock. */
  if (isWelcomeScrollLocked()) lenis.stop();
  registerHathorLenis(lenis);
  exposeScrollDebug();
}

export function ensurePublicScrollController(): PublicScrollController {
  if (typeof window === "undefined") {
    return {
      mode: "native",
      lenis: null,
      start: () => {},
      stop: () => {},
      scrollTo: () => {},
      syncToCurrentScroll: () => {},
    };
  }

  if (wantsNativeMode()) teardownLenis();
  else setupLenis();
  exposeScrollDebug();

  return {
    mode: state.mode,
    lenis: state.lenis,
    start: () => {
      state.lenis?.start();
    },
    stop: () => {
      state.lenis?.stop();
    },
    scrollTo: (target, options) => {
      if (state.lenis) {
        state.lenis.scrollTo(target, options);
        return;
      }
      if (typeof target === "number") {
        window.scrollTo(0, target);
        return;
      }
      if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: "auto", block: "start" });
      }
    },
    syncToCurrentScroll: () => {
      const y = window.scrollY || 0;
      state.lenis?.scrollTo(y, { immediate: true, force: true });
      ScrollTrigger.update();
    },
  };
}

export function destroyPublicScrollController() {
  teardownLenis();
}
