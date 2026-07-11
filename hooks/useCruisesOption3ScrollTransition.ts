/**
 * Cruises Option 3 scroll engine - native 1:1 scroll % to dome rise (no Lenis lag).
 * Real content layer rides the cream sheet (no follower title crossfade).
 */
"use client";

import { useLayoutEffect, useId, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const PT_CREAM = "#f4f1ea";
const PT_GOLD = "#B69F64";

const MASK = {
  start: 0,
  end: 0.37,
  gapRatio: 0.94,
  rotSpread: 0.23 / 0.37,
  rotWindow: 0.08 / 0.37,
  gapSealStart: 0.5,
  gapSealStagger: 0.24,
  gapSealWindow: 0.035,
};

const PEEK_VH = 0.065;
/** Match CruisesScrollReveal media-gone threshold — content rides sheet after hero clears. */
const CONTENT_REVEAL_START = 0.35;

export const CRUISES_PIN_VH = 4.2;
export const CRUISES_RISE_END = 0.7;
/** Pin travel in viewport heights — dome rise completes at this distance. */
export const CRUISES_PIN_DISTANCE_VH = CRUISES_PIN_VH * CRUISES_RISE_END;

type Strip = { el: HTMLDivElement; colW: number; slatW: number };

type CruisesScrollTransitionRefs = {
  root: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  mask: RefObject<HTMLElement | null>;
  sheet: RefObject<HTMLElement | null>;
  follower: RefObject<HTMLElement | null>;
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

export function useCruisesOption3ScrollTransition(config: CruisesScrollTransitionRefs) {
  const instanceId = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const root = config.root.current;
    const stage = config.stage.current;
    const maskEl = config.mask.current;
    const sheet = config.sheet.current;
    const followerEl = config.follower.current;
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

    let strips: Strip[] = [];
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    let lastFollowerY = Number.NaN;
    let lastFollowerRadius = "";
    let lastSyncedContentY = 0;

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

    function releasePinWidth() {
      gsap.set(stageEl, { clearProps: "width,maxWidth,minWidth" });
      stageEl.style.width = "100%";

      const pinSpacer = stageEl.parentElement;
      if (pinSpacer?.classList.contains("pin-spacer")) {
        pinSpacer.style.removeProperty("width");
        pinSpacer.style.removeProperty("max-width");
      }
    }

    function getRevealDistance() {
      return window.innerHeight * CRUISES_PIN_DISTANCE_VH;
    }

    function getDomeRadii() {
      const styles = getComputedStyle(trigger);
      return {
        start: parseFloat(styles.getPropertyValue("--pt-dome-r-start")) || 1250,
        end: parseFloat(styles.getPropertyValue("--pt-dome-r-end")) || 0,
      };
    }

    function getContentLayer() {
      return document.querySelector(
        ".cruises-option-3-content-layer",
      ) as HTMLElement | null;
    }

    /** Lock content title to the rising sheet seam — same speed, no crossfade. */
    function syncContentToSheet(riseT: number) {
      const contentLayer = getContentLayer();
      if (!contentLayer) return;

      const contentTitle = contentLayer.querySelector(
        ".pt-sheet__landing-title",
      ) as HTMLElement | null;
      if (!contentTitle) return;

      const sheetRect = sheetEl.getBoundingClientRect();
      const layerRect = contentLayer.getBoundingClientRect();
      const titleRect = contentTitle.getBoundingClientRect();
      const currentY = Number(gsap.getProperty(contentLayer, "y")) || 0;
      const layerTopNatural = layerRect.top - currentY;
      const titleOffset = titleRect.top - layerRect.top;
      const landing = contentLayer.querySelector(
        ".pt-sheet__landing",
      ) as HTMLElement | null;
      const landingPad = landing
        ? parseFloat(getComputedStyle(landing).paddingTop) || 0
        : 0;
      const targetTitleTop = sheetRect.top + landingPad;
      const targetY = targetTitleTop - (layerTopNatural + titleOffset);

      lastSyncedContentY = targetY;

      const riding = riseT > 0 && !trigger.classList.contains("hathor-page-scroll--past-pin");
      const visible = riseT >= CONTENT_REVEAL_START;

      trigger.classList.toggle("hathor-page-scroll--option-3-riding", riding);
      trigger.classList.toggle(
        "hathor-page-scroll--option-3-visible",
        visible && riding,
      );

      gsap.set(contentLayer, {
        y: targetY,
        opacity: visible ? 1 : 0,
      });
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

        const sealStart = MASK.gapSealStart + (i / n) * MASK.gapSealStagger;
        const sealEnd = sealStart + MASK.gapSealWindow;
        const seal =
          open >= 0.98 ? easeInOutQuad(mapRange(maskT, sealStart, sealEnd, 0, 1)) : 0;

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

      const riseT = clamp(p, 0, 1);
      const y = startY * (1 - riseT);
      const radius = rEnd + (rStart - rEnd) * (1 - riseT);

      gsap.set(sheetEl, {
        y,
        opacity: 1,
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
      });

      applyMaskReveal(riseT);

      if (heroCopy) {
        gsap.set(heroCopy, { opacity: mapRange(riseT, 0.35, 0.75, 1, 0) });
      }

      return { sheetY: y, radius, riseT };
    }

    function applyFollower(sheetY: number, radius: number) {
      if (!followerEl) return;
      if (trigger.classList.contains("hathor-page-scroll--past-pin")) return;

      const y = Math.round(sheetY);
      const radiusKey = String(radius);

      if (y === lastFollowerY && radiusKey === lastFollowerRadius) return;

      lastFollowerY = y;
      lastFollowerRadius = radiusKey;

      gsap.set(followerEl, {
        y,
        opacity: 1,
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
      });
    }

    function applyRevealProgress(scrollProgress: number) {
      const { sheetY, radius, riseT } = applyProgress(scrollProgress);
      applyFollower(sheetY, radius);
      syncContentToSheet(riseT);
    }

    function completeRevealHandoff() {
      const contentLayer = getContentLayer();
      const contentTitle = contentLayer?.querySelector(
        ".pt-sheet__landing-title",
      ) as HTMLElement | null;
      const titleTopBefore = contentTitle?.getBoundingClientRect().top;

      if (contentLayer) {
        gsap.set(contentLayer, { y: lastSyncedContentY, opacity: 1 });
      }

      trigger.classList.add("hathor-page-scroll--past-pin");
      trigger.classList.add("hathor-page-scroll--media-gone");
      trigger.classList.add("hathor-page-scroll--content-active");
      trigger.classList.remove(
        "hathor-page-scroll--option-3-riding",
        "hathor-page-scroll--option-3-visible",
      );

      gsap.set(sheetEl, {
        y: 0,
        opacity: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      });

      if (followerEl) {
        gsap.set(followerEl, {
          y: 0,
          opacity: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        });
      }

      mask.classList.remove("is-active");
      gsap.set(mask, { opacity: 0 });

      const pinSpacer = stageEl.parentElement;
      if (pinSpacer?.classList.contains("pin-spacer")) {
        pinSpacer.style.height = "auto";
        pinSpacer.style.minHeight = "0";
        pinSpacer.style.paddingBottom = "0";
      }

      if (contentLayer && contentTitle && titleTopBefore != null) {
        requestAnimationFrame(() => {
          const titleTopAfter = contentTitle.getBoundingClientRect().top;
          const drift = titleTopAfter - titleTopBefore;
          if (Math.abs(drift) > 0.5) {
            const y = Number(gsap.getProperty(contentLayer, "y")) || 0;
            gsap.set(contentLayer, { y: y - drift });
            lastSyncedContentY = y - drift;
          }
          requestAnimationFrame(() => {
            if (contentLayer) {
              gsap.set(contentLayer, { clearProps: "transform" });
            }
            ScrollTrigger.refresh();
          });
        });
      } else {
        requestAnimationFrame(() => {
          if (contentLayer) {
            gsap.set(contentLayer, { clearProps: "transform" });
          }
          ScrollTrigger.refresh();
        });
      }
    }

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      const setup = () => {
        if (!buildMaskStrips()) return false;
        applyRevealProgress(0);

        ScrollTrigger.create({
          id: `cruises-option-3-scroll-${instanceId}`,
          trigger,
          start: "top top",
          end: () => `+=${getRevealDistance()}`,
          pin: stage,
          pinSpacing: true,
          scrub: false,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            applyRevealProgress(self.progress);
          },
          onLeave: () => {
            completeRevealHandoff();
          },
          onEnterBack: () => {
            const contentLayer = getContentLayer();
            if (contentLayer) {
              contentLayer.style.removeProperty("margin-top");
              gsap.set(contentLayer, { clearProps: "transform,opacity" });
            }
            trigger.classList.remove(
              "hathor-page-scroll--past-pin",
              "hathor-page-scroll--media-gone",
              "hathor-page-scroll--content-active",
              "hathor-page-scroll--option-3-riding",
              "hathor-page-scroll--option-3-visible",
            );
            lastFollowerY = Number.NaN;
            lastFollowerRadius = "";
            lastSyncedContentY = 0;
            applyRevealProgress(
              ScrollTrigger.getById(`cruises-option-3-scroll-${instanceId}`)?.progress ?? 0,
            );
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
      resizeTimer = setTimeout(() => {
        const st = ScrollTrigger.getById(`cruises-option-3-scroll-${instanceId}`);
        const progress = st?.progress ?? 0;

        releasePinWidth();

        if (buildMaskStrips()) {
          if (trigger.classList.contains("hathor-page-scroll--past-pin")) {
            completeRevealHandoff();
          } else {
            applyRevealProgress(progress);
          }
        }
        ScrollTrigger.refresh();
      }, 150);
    };

    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);

    const resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(stageEl);
    resizeObserver.observe(mask);
    const contentLayer = getContentLayer();
    if (contentLayer) {
      resizeObserver.observe(contentLayer);
    }

    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
      ctx.revert();
      if (followerEl) {
        gsap.set(followerEl, {
          clearProps:
            "transform,borderTopLeftRadius,borderTopRightRadius,opacity",
        });
      }
      if (sheetEl) {
        gsap.set(sheetEl, { clearProps: "opacity" });
      }
      const contentLayer = getContentLayer();
      if (contentLayer) {
        contentLayer.style.removeProperty("margin-top");
        gsap.set(contentLayer, { clearProps: "transform,opacity" });
      }
      trigger.classList.remove(
        "hathor-page-scroll--past-pin",
        "hathor-page-scroll--media-gone",
        "hathor-page-scroll--content-active",
        "hathor-page-scroll--option-3-riding",
        "hathor-page-scroll--option-3-visible",
      );
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
    config.follower,
    config.heroCopy,
  ]);
}
