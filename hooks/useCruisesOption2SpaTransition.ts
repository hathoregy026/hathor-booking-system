/**
 * Option 2 — Venetian/spa one-elevator engine (sticky stage, NO GSAP pin-spacer).
 * Ported from transition-for-pages.js: end "bottom bottom", content in .pt-sheet.
 */
"use client";

import { useLayoutEffect, useId, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const PT_CREAM = "#f4f1ea";
const PT_GOLD = "#B69F64";

const MASK = {
  start: 0.02,
  end: 0.88,
  gapRatio: 0.94,
  rotSpread: 0.82,
  rotWindow: 0.04,
  gapSealStart: 0.48,
  gapSealStagger: 0.32,
  gapSealWindow: 0.022,
};

const PEEK_VH = 0.065;
const BASE_RUNWAY_VH = 2.8;

export const OPTION2_SPA_REFRESH_EVENT = "cruises-option-2-spa-refresh";

type Strip = { el: HTMLDivElement; colW: number; slatW: number };

type SpaTransitionRefs = {
  root: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  mask: RefObject<HTMLElement | null>;
  sheet: RefObject<HTMLElement | null>;
  heroCopy: RefObject<HTMLElement | null>;
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function mapRange(
  p: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
) {
  const t = clamp((p - inMin) / (inMax - inMin), 0, 1);
  return outMin + t * (outMax - outMin);
}

function stripCount() {
  const w = window.innerWidth;
  if (w <= 767) return 25;
  if (w <= 1024) return 35;
  return 52;
}

function setupSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  const lenis = new Lenis({
    duration: 1.4,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
  });

  lenis.on("scroll", ScrollTrigger.update);

  const ticker = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);

  return { lenis, ticker };
}

export function useCruisesOption2SpaTransition(config: SpaTransitionRefs) {
  const instanceId = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const root = config.root.current;
    const stage = config.stage.current;
    const maskEl = config.mask.current;
    const sheet = config.sheet.current;
    const heroCopy = config.heroCopy.current;

    if (!root || !stage || !maskEl || !sheet) return;

    const mask = maskEl;
    const sheetEl = sheet;
    const stageEl = stage;
    const trigger = root;

    document.body.classList.add("has-page-scroll-transition");
    document.documentElement.classList.add("has-page-scroll-transition");
    document.body.style.backgroundColor = PT_CREAM;

    trigger.style.setProperty("--pt-gold", PT_GOLD);
    trigger.style.setProperty("--pt-cream", PT_CREAM);
    trigger.style.setProperty("--pt-dome-r-start", "1250px");
    trigger.style.setProperty("--pt-dome-r-end", "400px");

    let strips: Strip[] = [];
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let handedOff = false;
    const smoothScroll = setupSmoothScroll();

    function getDomeRadii() {
      const styles = getComputedStyle(trigger);
      return {
        start: parseFloat(styles.getPropertyValue("--pt-dome-r-start")) || 1250,
        end: parseFloat(styles.getPropertyValue("--pt-dome-r-end")) || 400,
      };
    }

    function computePinHeightPx() {
      const vh = window.innerHeight;
      const sheetH = sheetEl.offsetHeight;
      const extra = Math.max(0, sheetH - vh * 0.92);
      return Math.round(vh * BASE_RUNWAY_VH + extra * 0.55);
    }

    function syncPinHeight() {
      if (handedOff) {
        trigger.style.height = "auto";
        trigger.style.minHeight = "0";
        return;
      }
      const pinPx = computePinHeightPx();
      trigger.style.height = `${pinPx}px`;
      trigger.style.minHeight = `${pinPx}px`;
    }

    function buildMaskStrips() {
      const n = stripCount();
      const w = Math.max(mask.clientWidth, stageEl.clientWidth, 1);
      if (!w) return false;

      const colW = w / n;
      const slatW = colW * MASK.gapRatio;
      mask.innerHTML = "";
      strips = [];

      for (let i = 0; i < n; i++) {
        const col = document.createElement("div");
        col.className = "pt-mask__col";
        col.style.left = `${i * colW}px`;
        col.style.width =
          i === n - 1 ? `${w - (n - 1) * colW}px` : `${colW}px`;

        const strip = document.createElement("div");
        strip.className = "pt-mask__strip";
        col.appendChild(strip);
        mask.appendChild(col);
        strips.push({ el: strip, colW, slatW });
      }
      return true;
    }

    function applyMaskReveal(p: number) {
      const maskT = mapRange(p, MASK.start, MASK.end, 0, 1);
      const n = strips.length;

      if (maskT <= 0 || n === 0) {
        mask.classList.remove("is-active");
        gsap.set(mask, { opacity: 0 });
        strips.forEach(({ el, colW }) =>
          gsap.set(el, { rotationY: -90, opacity: 0, width: colW }),
        );
        return;
      }

      mask.classList.add("is-active");
      gsap.set(mask, { opacity: 1 });

      strips.forEach(({ el, colW, slatW }, i) => {
        const rotStart = (i / n) * MASK.rotSpread;
        const rotEnd = rotStart + MASK.rotWindow;
        const open = mapRange(maskT, rotStart, rotEnd, 0, 1);

        const sealStart = MASK.gapSealStart + (i / n) * MASK.gapSealStagger;
        const sealEnd = sealStart + MASK.gapSealWindow;
        const seal = open >= 0.98 ? mapRange(maskT, sealStart, sealEnd, 0, 1) : 0;

        const fullW = colW + 1;
        let width: number;
        if (open <= 0.03) {
          width = fullW;
        } else if (seal > 0) {
          width = slatW + (fullW - slatW) * seal;
        } else {
          width = slatW;
        }

        gsap.set(el, {
          rotationY: -90 + open * 90,
          opacity: open > 0.03 ? 1 : 0,
          width,
        });
      });
    }

    function applyProgress(p: number) {
      if (handedOff) return;

      const vh = window.innerHeight;
      const sheetH = sheetEl.offsetHeight;
      const peek = vh * PEEK_VH;
      const startY = sheetH - peek;
      const { start: rStart, end: rEnd } = getDomeRadii();

      const riseT = mapRange(p, 0, 0.7, 0, 1);
      let y = startY * (1 - riseT);

      const driftT = mapRange(p, 0.7, 1, 0, 1);
      const extra = Math.max(0, sheetH - vh * 0.92);
      y -= driftT * extra;

      gsap.set(sheetEl, {
        y,
        borderTopLeftRadius: rStart + (rEnd - rStart) * riseT,
        borderTopRightRadius: rStart + (rEnd - rStart) * riseT,
      });

      applyMaskReveal(p);

      if (heroCopy) {
        gsap.set(heroCopy, { opacity: mapRange(riseT, 0.35, 0.75, 1, 0) });
      }

      const hideMedia = p > 0.35;
      trigger.classList.toggle("hathor-page-scroll--media-gone", hideMedia);
    }

    function completeHandoff() {
      if (handedOff) return;
      handedOff = true;

      trigger.classList.add("hathor-page-scroll--past-pin");
      trigger.classList.add("hathor-page-scroll--media-gone");

      gsap.set(sheetEl, {
        clearProps: "transform,borderTopLeftRadius,borderTopRightRadius",
      });
      gsap.set(mask, { opacity: 0 });
      mask.classList.remove("is-active");

      trigger.style.height = "auto";
      trigger.style.minHeight = "0";
      stageEl.style.height = "auto";
      stageEl.style.minHeight = "0";
      stageEl.style.position = "relative";
      stageEl.style.overflow = "visible";
      sheetEl.style.position = "relative";
      sheetEl.style.bottom = "auto";
      sheetEl.style.transform = "none";
    }

    function restoreFromHandoff() {
      handedOff = false;
      trigger.classList.remove(
        "hathor-page-scroll--past-pin",
        "hathor-page-scroll--media-gone",
      );
      stageEl.style.removeProperty("height");
      stageEl.style.removeProperty("min-height");
      stageEl.style.removeProperty("position");
      stageEl.style.removeProperty("overflow");
      sheetEl.style.removeProperty("position");
      sheetEl.style.removeProperty("bottom");
      sheetEl.style.removeProperty("transform");
      syncPinHeight();
    }

    function refreshEngine() {
      const st = ScrollTrigger.getById(`cruises-option-2-spa-${instanceId}`);
      const progress = handedOff ? 1 : (st?.progress ?? 0);

      syncPinHeight();
      if (buildMaskStrips()) {
        if (handedOff) {
          completeHandoff();
        } else {
          applyProgress(progress);
        }
      }
      ScrollTrigger.refresh();
    }

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      const setup = () => {
        if (!buildMaskStrips()) return false;
        syncPinHeight();
        applyProgress(0);

        ScrollTrigger.create({
          id: `cruises-option-2-spa-${instanceId}`,
          trigger,
          start: "top top",
          end: "bottom bottom",
          scrub: 0,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (!handedOff) applyProgress(self.progress);
          },
          onLeave: () => completeHandoff(),
          onEnterBack: () => {
            restoreFromHandoff();
            const st = ScrollTrigger.getById(`cruises-option-2-spa-${instanceId}`);
            applyProgress(st?.progress ?? 0);
          },
        });

        return true;
      };

      if (!setup()) {
        requestAnimationFrame(() => {
          setup();
          ScrollTrigger.refresh();
        });
      }
    }, trigger);

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshEngine, 120);
    };

    const onSpaRefresh = () => refreshEngine();

    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    window.addEventListener(OPTION2_SPA_REFRESH_EVENT, onSpaRefresh);

    const resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(sheetEl);

    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.removeEventListener(OPTION2_SPA_REFRESH_EVENT, onSpaRefresh);
      resizeObserver.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
      if (smoothScroll) {
        gsap.ticker.remove(smoothScroll.ticker);
        smoothScroll.lenis.destroy();
      }
      ctx.revert();
      document.body.classList.remove("has-page-scroll-transition");
      document.documentElement.classList.remove("has-page-scroll-transition");
      document.body.style.backgroundColor = "";
    };
  }, [
    instanceId,
    config.root,
    config.stage,
    config.mask,
    config.sheet,
    config.heroCopy,
  ]);
}

export function refreshCruisesOption2SpaTransition() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPTION2_SPA_REFRESH_EVENT));
}
