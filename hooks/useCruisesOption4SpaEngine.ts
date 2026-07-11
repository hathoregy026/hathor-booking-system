/**
 * Option 4 — Venetian stripe reveal + flat horizon rail rise.
 * Sticky stage, fixed 280vh runway, NO GSAP pin, NO dome/arch shapes.
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

export const OPTION4_SPA_REFRESH_EVENT = "cruises-option-4-spa-refresh";

type Strip = { el: HTMLDivElement; colW: number; slatW: number };

type SpaEngineRefs = {
  root: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  mask: RefObject<HTMLElement | null>;
  sheet: RefObject<HTMLElement | null>;
  heroCopy: RefObject<HTMLElement | null>;
  horizon?: RefObject<HTMLElement | null>;
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

function setupLenis() {
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

export function useCruisesOption4SpaEngine(config: SpaEngineRefs) {
  const instanceId = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const root = config.root.current;
    const stage = config.stage.current;
    const maskEl = config.mask.current;
    const sheet = config.sheet.current;
    const heroCopy = config.heroCopy.current;
    const horizonEl = config.horizon?.current ?? null;

    if (!root || !stage || !maskEl || !sheet) return;

    const mask = maskEl;
    const sheetEl = sheet;
    const stageEl = stage;
    const trigger = root;
    const heroMedia = stageEl.querySelector<HTMLElement>(".pt-hero__media");

    trigger.style.setProperty("--pt-gold", PT_GOLD);
    trigger.style.setProperty("--pt-cream", PT_CREAM);

    let strips: Strip[] = [];
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let smoothScroll: ReturnType<typeof setupLenis> | null = null;

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
        const seal =
          open >= 0.98 ? mapRange(maskT, sealStart, sealEnd, 0, 1) : 0;

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
      const vh = window.innerHeight;
      const sheetH = sheetEl.offsetHeight;
      const peek = vh * PEEK_VH;
      const startY = sheetH - peek;

      const riseT = mapRange(p, 0, 0.7, 0, 1);
      let y = startY * (1 - riseT);

      const driftT = mapRange(p, 0.7, 1, 0, 1);
      const extra = Math.max(0, sheetH - vh * 0.92);
      y -= driftT * extra;

      const maskT = mapRange(p, MASK.start, MASK.end, 0, 1);

      gsap.set(sheetEl, {
        y,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        clipPath: "none",
      });

      if (horizonEl) {
        gsap.set(horizonEl, {
          scaleX: mapRange(riseT, 0, 0.5, 0.55, 1),
          opacity: mapRange(riseT, 0, 0.22, 0, 1),
        });
      }

      if (heroMedia) {
        gsap.set(heroMedia, {
          scale: 1 + mapRange(maskT, 0, 1, 0, 0.05),
        });
      }

      applyMaskReveal(p);

      if (heroCopy) {
        gsap.set(heroCopy, { opacity: mapRange(riseT, 0.35, 0.75, 1, 0) });
      }

      trigger.classList.toggle("cruises-option-4-spa--media-gone", riseT > 0.35);
      trigger.classList.toggle("cruises-option-4-spa--revealed", p >= 0.98);
    }

    function initScroll() {
      ScrollTrigger.getById(`cruises-option-4-spa-${instanceId}`)?.kill();
      if (!buildMaskStrips()) return;
      applyProgress(0);

      ScrollTrigger.create({
        id: `cruises-option-4-spa-${instanceId}`,
        trigger,
        start: "top top",
        end: "bottom bottom",
        scrub: 0,
        invalidateOnRefresh: true,
        onUpdate: (self) => applyProgress(self.progress),
      });
    }

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      smoothScroll = setupLenis();
      initScroll();
      ScrollTrigger.refresh();
    }, trigger);

    function refreshEngine() {
      const st = ScrollTrigger.getById(`cruises-option-4-spa-${instanceId}`);
      const progress = st?.progress ?? 0;
      initScroll();
      applyProgress(progress);
      ScrollTrigger.refresh();
    }

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshEngine, 150);
    };

    const onRefreshEvent = () => refreshEngine();

    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    window.addEventListener(OPTION4_SPA_REFRESH_EVENT, onRefreshEvent);

    const resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(sheetEl);
    resizeObserver.observe(stageEl);

    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.removeEventListener(OPTION4_SPA_REFRESH_EVENT, onRefreshEvent);
      resizeObserver.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
      if (smoothScroll) {
        gsap.ticker.remove(smoothScroll.ticker);
        smoothScroll.lenis.destroy();
      }
      ctx.revert();
    };
  }, [
    instanceId,
    config.root,
    config.stage,
    config.mask,
    config.sheet,
    config.heroCopy,
    config.horizon,
  ]);
}

export function refreshCruisesOption4Spa() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPTION4_SPA_REFRESH_EVENT));
}
