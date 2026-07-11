/**
 * Cruises hero stripes — same engine as Homepage 2 (mask, pin, Lenis, scrub).
 * Stripe height = full hero stage; no dome / sheet animation.
 */
"use client";

import { useLayoutEffect, useId, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const PT_GOLD = "#B69F64";

/** Homepage 2 / transition index.html timeline */
const MASK = {
  start: 0,
  end: 0.37,
  gapRatio: 0.94,
  rotSpread: 0.23 / 0.37,
  rotWindow: 0.08 / 0.37,
  gapSealWindow: 0.06 / 0.37,
};

const PIN_VH = 4.2;
const SCRUB = 1.2;

export const CRUISES_HERO_REFRESH_EVENT = "cruises-hero-stripe-refresh";

type Strip = { el: HTMLDivElement; colW: number; slatW: number };

type CruisesHeroStripeRefs = {
  runway: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  mask: RefObject<HTMLElement | null>;
  headline: RefObject<HTMLElement | null>;
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

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutQuad(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
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
    duration: 2.1,
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

export function useCruisesHeroStripes(config: CruisesHeroStripeRefs) {
  const instanceId = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const runway = config.runway.current;
    const stage = config.stage.current;
    const maskEl = config.mask.current;
    const headline = config.headline.current;

    if (!runway || !stage || !maskEl) return;

    const mask = maskEl;
    const stageEl = stage;
    const trigger = runway;

    trigger.style.setProperty("--cruises-gold", PT_GOLD);

    let strips: Strip[] = [];
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const smoothScroll = setupSmoothScroll();

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
        col.className = "cruises-hero-mask__col";
        col.style.left = `${i * colW}px`;
        col.style.width =
          i === n - 1 ? `${w - (n - 1) * colW}px` : `${colW}px`;

        const strip = document.createElement("div");
        strip.className = "cruises-hero-mask__strip";
        col.appendChild(strip);
        mask.appendChild(col);
        strips.push({ el: strip, colW, slatW });
      }
      return true;
    }

    function releasePinWidth() {
      gsap.set(stageEl, { clearProps: "width,maxWidth,minWidth" });
      stageEl.style.width = "100%";

      const pinSpacer = stageEl.parentElement;
      if (pinSpacer?.classList.contains("pin-spacer")) {
        pinSpacer.style.removeProperty("width");
        pinSpacer.style.removeProperty("max-width");
      }
    }

    function applyMaskReveal(p: number) {
      const maskT = clamp(mapRange(p, MASK.start, MASK.end, 0, 1), 0, 1);
      const n = strips.length;

      if (maskT <= 0 || n === 0) {
        mask.classList.remove("is-active");
        gsap.set(mask, { opacity: 0 });
        strips.forEach(({ el, slatW }) =>
          gsap.set(el, { rotationY: -90, opacity: 0, width: slatW }),
        );
        return;
      }

      mask.classList.add("is-active");
      gsap.set(mask, { opacity: 1 });

      strips.forEach(({ el, colW, slatW }, i) => {
        const rotStart = (i / n) * MASK.rotSpread;
        const rotEnd = rotStart + MASK.rotWindow;
        const open = easeOutCubic(mapRange(maskT, rotStart, rotEnd, 0, 1));

        let seal = 0;
        if (open >= 0.98) {
          const sealStart = rotEnd;
          const sealEnd = sealStart + MASK.gapSealWindow;
          seal = easeInOutQuad(mapRange(maskT, sealStart, sealEnd, 0, 1));
        }

        const width = slatW + (colW - slatW) * seal;

        gsap.set(el, {
          rotationY: -90 + open * 90,
          opacity: open,
          width,
        });
      });
    }

    function applyProgress(p: number) {
      applyMaskReveal(p);

      if (headline) {
        const riseT = mapRange(p, 0, 0.7, 0, 1);
        gsap.set(headline, { opacity: mapRange(riseT, 0.35, 0.75, 1, 0) });
      }
    }

    function initScroll() {
      ScrollTrigger.getById(`cruises-hero-${instanceId}`)?.kill();
      if (!buildMaskStrips()) return;
      applyProgress(0);

      ScrollTrigger.create({
        id: `cruises-hero-${instanceId}`,
        trigger,
        start: "top top",
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: stageEl,
        pinSpacing: true,
        scrub: SCRUB,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => applyProgress(self.progress),
      });
    }

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      initScroll();
      ScrollTrigger.refresh();
    }, trigger);

    function refreshEngine() {
      const st = ScrollTrigger.getById(`cruises-hero-${instanceId}`);
      const progress = st?.progress ?? 0;
      releasePinWidth();
      initScroll();
      applyProgress(progress);
      ScrollTrigger.refresh();
    }

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(refreshEngine, 150);
    };

    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    window.addEventListener(CRUISES_HERO_REFRESH_EVENT, refreshEngine);

    const resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(stageEl);
    resizeObserver.observe(mask);

    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.removeEventListener(CRUISES_HERO_REFRESH_EVENT, refreshEngine);
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
    config.runway,
    config.stage,
    config.mask,
    config.headline,
  ]);
}

export function refreshCruisesHeroStripes() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CRUISES_HERO_REFRESH_EVENT));
}
