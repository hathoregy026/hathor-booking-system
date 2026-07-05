"use client";

import { useLayoutEffect, useId, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const PT_CREAM = "#ECE8DF";
const PT_GOLD = "#C9A96E";

const MASK = {
  start: 0.1,
  end: 0.44,
  gapRatio: 0.94,
  rotSpread: 0.48,
  rotWindow: 0.09,
  gapSealStart: 0.52,
  gapSealStagger: 0.22,
  gapSealWindow: 0.028,
};

const PEEK_VH = 0.065;
const PIN_VH = 2.8;
const RISE_CAP_VH = 1.2;

type Strip = { el: HTMLDivElement; colW: number; slatW: number };

type PageScrollTransitionRefs = {
  root: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  mask: RefObject<HTMLElement | null>;
  sheet: RefObject<HTMLElement | null>;
  riseCap?: RefObject<HTMLElement | null>;
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

/** Corners close quickly early in the scroll — nearly flat before half progress. */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Animation runway only — landing + rise-cap, never page body content. */
function getSheetScrollHeight(
  sheetEl: HTMLElement,
  riseCapEl: HTMLElement | null,
) {
  const vh = window.innerHeight;
  const landing = sheetEl.querySelector<HTMLElement>(".pt-sheet__landing");
  const riseCap =
    riseCapEl ?? sheetEl.querySelector<HTMLElement>(".pt-sheet__rise-cap");
  const landingH = landing?.offsetHeight ?? 0;
  const riseCapH = riseCap?.offsetHeight ?? vh * RISE_CAP_VH;
  return landingH + riseCapH;
}

export function usePageScrollTransition(refs: PageScrollTransitionRefs) {
  const instanceId = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const root = refs.root.current;
    const stage = refs.stage.current;
    const maskEl = refs.mask.current;
    const sheet = refs.sheet.current;
    const riseCap = refs.riseCap?.current ?? null;
    const heroCopy = refs.heroCopy.current;

    if (!root || !stage || !maskEl || !sheet) return;

    const mask = maskEl;
    const sheetEl = sheet;
    const riseCapEl = riseCap;
    const trigger = root;

    document.body.classList.add("has-page-scroll-transition");
    document.documentElement.classList.add("has-page-scroll-transition");
    document.body.style.backgroundColor = PT_CREAM;

    trigger.style.setProperty("--pt-gold", PT_GOLD);
    trigger.style.setProperty("--pt-cream", PT_CREAM);

    let strips: Strip[] = [];
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;

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
        end: parseFloat(styles.getPropertyValue("--pt-dome-r-end")) || 0,
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
      const sheetH = getSheetScrollHeight(sheetEl, riseCapEl);
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

      gsap.set(sheetEl, {
        y,
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
      });

      applyMaskReveal(p);

      if (heroCopy) {
        gsap.set(heroCopy, { opacity: mapRange(riseT, 0.35, 0.75, 1, 0) });
      }
    }

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      const setup = () => {
        if (!buildMaskStrips()) return false;
        applyProgress(0);

        ScrollTrigger.create({
          id: `page-transition-${instanceId}`,
          trigger: trigger,
          start: "top top",
          end: () => `+=${window.innerHeight * 1.8}`,
          pin: stage,
          pinSpacing: true,
          scrub: 0,
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
      ctx.revert();
      document.body.classList.remove("has-page-scroll-transition");
      document.documentElement.classList.remove("has-page-scroll-transition");
      document.body.style.backgroundColor = "";
    };
  }, [instanceId, refs.root, refs.stage, refs.mask, refs.sheet, refs.riseCap, refs.heroCopy]);
}

export function refreshPageScrollTransition() {
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.refresh();
}
