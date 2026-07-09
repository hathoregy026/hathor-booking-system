/**
 * Homepage-2-only scroll engine — cruises logic with elliptical dome (no corner ears).
 * Does not modify shared usePageScrollTransition used by /cruises.
 */
"use client";

import { useLayoutEffect, useId, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const PT_CREAM = "#F4F1EA";
const PT_GOLD = "#B69F64";

const MASK = {
  start: 0.01,
  end: 0.24,
  gapRatio: 0.94,
  rotSpread: 0.38,
  rotWindow: 0.09,
  gapSealStart: 0.5,
  gapSealStagger: 0.24,
  gapSealWindow: 0.035,
};

const PEEK_VH = 0.065;
const PIN_VH = 4.2;

type Strip = { el: HTMLDivElement; colW: number; slatW: number };

const LOGO_LAND = {
  duration: 1.85,
  delay: 0.2,
  ease: "power2.out",
};

/** Below rEnd — flat top without reintroducing base corner ears (never 0). */
const DOME_TOP_OPEN_P_START = 0.92;
const DOME_TOP_OPEN_P_END = 0.98;
const DOME_TOP_OPEN_AMOUNT = 0.95;
const DOME_EAR_SAFE_MIN = 8;

type PageScrollTransitionRefs = {
  root: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  mask: RefObject<HTMLElement | null>;
  sheet: RefObject<HTMLElement | null>;
  heroCopy: RefObject<HTMLElement | null>;
  giantLogo: RefObject<HTMLElement | null>;
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

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
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

export function useHomePage2ScrollTransition(refs: PageScrollTransitionRefs) {
  const instanceId = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const root = refs.root.current;
    const stage = refs.stage.current;
    const maskEl = refs.mask.current;
    const sheet = refs.sheet.current;
    const heroCopy = refs.heroCopy.current;
    const giantLogo = refs.giantLogo.current;

    if (!root || !stage || !maskEl || !sheet) return;

    const mask = maskEl;
    const sheetEl = sheet;
    const trigger = root;

    document.body.classList.add("has-page-scroll-transition");
    document.documentElement.classList.add("has-page-scroll-transition");
    document.body.style.backgroundColor = PT_CREAM;

    trigger.style.setProperty("--pt-gold", PT_GOLD);
    trigger.style.setProperty("--pt-cream", PT_CREAM);

    let strips: Strip[] = [];
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let landingTween: gsap.core.Tween | null = null;
    const smoothScroll = setupSmoothScroll();

    function getLogoHiddenY() {
      return window.innerHeight * 0.34;
    }

    function setupGiantLogoLanding() {
      if (!giantLogo) return;

      landingTween?.kill();
      const hiddenY = getLogoHiddenY();
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.set(giantLogo, {
        xPercent: -50,
        y: reducedMotion ? 0 : hiddenY,
        opacity: 1,
      });

      if (reducedMotion) return;

      landingTween = gsap.to(giantLogo, {
        y: 0,
        duration: LOGO_LAND.duration,
        delay: LOGO_LAND.delay,
        ease: LOGO_LAND.ease,
      });
    }

    function buildMaskStrips() {
      const n = stripCount();
      const w = mask.clientWidth;
      if (!w) return false;

      const colW = w / n;
      const slatW = colW * MASK.gapRatio;
      mask.innerHTML = "";
      strips = [];

      for (let i = 0; i < n; i++) {
        const col = document.createElement("div");
        col.className = "pt-mask__col";
        col.style.left = `${i * colW}px`;
        col.style.width = `${colW}px`;

        const strip = document.createElement("div");
        strip.className = "pt-mask__strip";
        col.appendChild(strip);
        mask.appendChild(col);
        strips.push({ el: strip, colW, slatW });
      }
      return true;
    }

    function getDomeRadii() {
      const styles = getComputedStyle(trigger);
      return {
        start: parseFloat(styles.getPropertyValue("--pt-dome-r-start")) || 1250,
        end: parseFloat(styles.getPropertyValue("--pt-dome-r-end")) || 22,
      };
    }

    function applyMaskReveal(p: number) {
      const maskT = mapRange(p, MASK.start, MASK.end, 0, 1);
      const n = strips.length;

      if (maskT <= 0 || maskT >= 1 || n === 0) {
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

      const radiusProgress = easeOutCubic(mapRange(p, 0.04, 0.42, 0, 1));
      const radius = rEnd + (rStart - rEnd) * (1 - radiusProgress);
      const halfW = sheetEl.offsetWidth / 2;

      const topOpen = easeOutCubic(
        mapRange(p, DOME_TOP_OPEN_P_START, DOME_TOP_OPEN_P_END, 0, 1),
      );
      const vertFloor = Math.max(DOME_EAR_SAFE_MIN, rEnd * 0.42);
      const openBlend = topOpen * DOME_TOP_OPEN_AMOUNT;
      const vertR = Math.max(
        DOME_EAR_SAFE_MIN,
        openBlend > 0 ? radius + (vertFloor - radius) * openBlend : radius,
      );

      gsap.set(sheetEl, {
        y,
        borderTopLeftRadius: `${halfW}px ${vertR}px`,
        borderTopRightRadius: `${halfW}px ${vertR}px`,
        clipPath: "none",
      });

      applyMaskReveal(p);

      if (giantLogo) {
        const hiddenY = getLogoHiddenY();
        const scrollLogoY = mapRange(riseT, 0, 1, 0, hiddenY);

        if (p > 0.001) {
          landingTween?.kill();
          landingTween = null;
          gsap.set(giantLogo, { y: scrollLogoY });
        }
      } else if (heroCopy) {
        gsap.set(heroCopy, { opacity: 1 });
      }
    }

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      const setup = () => {
        if (!buildMaskStrips()) return false;
        setupGiantLogoLanding();
        applyProgress(0);

        ScrollTrigger.create({
          id: `homepage-2-scroll-${instanceId}`,
          trigger,
          start: "top top",
          end: () => `+=${window.innerHeight * PIN_VH}`,
          pin: stage,
          pinSpacing: true,
          scrub: 0.55,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => applyProgress(self.progress),
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
      resizeTimer = setTimeout(() => {
        buildMaskStrips();
        ScrollTrigger.refresh();
      }, 150);
    };

    window.addEventListener("resize", onResize);
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      landingTween?.kill();
      if (smoothScroll) {
        gsap.ticker.remove(smoothScroll.ticker);
        smoothScroll.lenis.destroy();
      }
      ctx.revert();
      document.body.classList.remove("has-page-scroll-transition");
      document.documentElement.classList.remove("has-page-scroll-transition");
      document.body.style.backgroundColor = "";
    };
  }, [instanceId, refs.root, refs.stage, refs.mask, refs.sheet, refs.heroCopy, refs.giantLogo]);
}

export function refreshHomePage2ScrollTransition() {
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.refresh();
}
