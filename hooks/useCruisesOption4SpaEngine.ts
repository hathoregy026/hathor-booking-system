/**
 * Option 4 — Venetian stripe wipe only.
 * Sticky runway, gold blinds L→R, flat cream behind stripes. NO rising sheet / NO dome.
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

export const OPTION4_SPA_REFRESH_EVENT = "cruises-option-4-spa-refresh";

type Strip = { el: HTMLDivElement; colW: number; slatW: number };

type HeroEngineRefs = {
  root: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  mask: RefObject<HTMLElement | null>;
  cream: RefObject<HTMLElement | null>;
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

export function useCruisesOption4SpaEngine(config: HeroEngineRefs) {
  const instanceId = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const root = config.root.current;
    const stage = config.stage.current;
    const maskEl = config.mask.current;
    const creamEl = config.cream.current;
    const heroCopy = config.heroCopy.current;

    if (!root || !stage || !maskEl || !creamEl) return;

    const mask = maskEl;
    const stageEl = stage;
    const trigger = root;
    const heroMedia = stageEl.querySelector<HTMLElement>(".co4-media");
    const giantLogo = stageEl.querySelector<HTMLElement>(".co4-giant-logo");

    trigger.style.setProperty("--co4-gold", PT_GOLD);
    trigger.style.setProperty("--co4-cream", PT_CREAM);

    let strips: Strip[] = [];
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let smoothScroll: ReturnType<typeof setupLenis> | null = null;
    let logoTween: gsap.core.Tween | null = null;

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
        col.className = "co4-mask__col";
        col.style.left = `${i * colW}px`;
        col.style.width =
          i === n - 1 ? `${w - (n - 1) * colW}px` : `${colW}px`;

        const strip = document.createElement("div");
        strip.className = "co4-mask__strip";
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
      const maskT = mapRange(p, MASK.start, MASK.end, 0, 1);
      const heroFade = mapRange(p, 0.06, 0.68, 1, 0);
      const copyFade = mapRange(p, 0.16, 0.55, 1, 0);
      const creamShow = Math.max(
        mapRange(maskT, 0.12, 0.88, 0, 1),
        mapRange(p, 0.72, 1, 0, 1),
      );

      gsap.set(creamEl, { opacity: creamShow });

      if (heroMedia) {
        gsap.set(heroMedia, {
          opacity: heroFade,
          scale: 1 + maskT * 0.05,
        });
      }

      if (heroCopy) {
        gsap.set(heroCopy, { opacity: copyFade });
      }

      if (giantLogo) {
        gsap.set(giantLogo, {
          opacity: copyFade,
          y: mapRange(p, 0, 0.5, 0, -18),
        });
      }

      applyMaskReveal(p);
      trigger.classList.toggle("co4-runway--revealed", p >= 0.98);
    }

    function initScroll() {
      ScrollTrigger.getById(`cruises-option-4-${instanceId}`)?.kill();
      if (!buildMaskStrips()) return;
      applyProgress(0);

      ScrollTrigger.create({
        id: `cruises-option-4-${instanceId}`,
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

      if (giantLogo) {
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches;
        if (reduced) {
          gsap.set(giantLogo, { opacity: 1, y: 0 });
        } else {
          gsap.set(giantLogo, { opacity: 0, y: 36 });
          logoTween = gsap.to(giantLogo, {
            opacity: 1,
            y: 0,
            duration: 1.35,
            delay: 0.18,
            ease: "power2.out",
          });
        }
      }

      initScroll();
      ScrollTrigger.refresh();
    }, trigger);

    function refreshEngine() {
      const st = ScrollTrigger.getById(`cruises-option-4-${instanceId}`);
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
    resizeObserver.observe(stageEl);

    return () => {
      logoTween?.kill();
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
    config.cream,
    config.heroCopy,
  ]);
}

export function refreshCruisesOption4Spa() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPTION4_SPA_REFRESH_EVENT));
}
