/**
 * Cruises scroll — Venetian dome (frozen HP2 reference) + split content layer.
 * Content syncs to follower Y every frame so listings ride the cream sheet.
 */
"use client";

import { useLayoutEffect, useId, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const PT_CREAM = "#f4f1ea";
const PT_GOLD = "#B69F64";

const MASK = {
  start: 0.05,
  end: 0.37,
  gapRatio: 0.94,
  rotSpread: 0.23 / 0.37,
  rotWindow: 0.08 / 0.37,
  gapSealWindow: 0.06 / 0.37,
};

const PEEK_VH = 0.065;
/** Fade listings in once dome is visibly rising. */
const CONTENT_BLEND_START = 0.55;
const SCRUB = 1.2;

export const CRUISES_PIN_VH = 4.2;
export const CRUISES_RISE_END = 0.7;
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

export function useCruisesScrollTransition(config: CruisesScrollTransitionRefs) {
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

    function getContentLayer() {
      return document.querySelector(
        ".cruises-content-layer",
      ) as HTMLElement | null;
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

    function applyMaskReveal(p: number) {
      const maskT = clamp(mapRange(p, MASK.start, MASK.end, 0, 1), 0, 1);
      const n = strips.length;

      if (maskT <= 0 || p <= 0 || n === 0) {
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

        const fullW = colW + 1;
        const width = slatW + (fullW - slatW) * seal;

        gsap.set(el, {
          rotationY: -90 + open * 90,
          opacity: open,
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
      const easedRiseT = easeOutCubic(riseT);
      const radius = rEnd + (rStart - rEnd) * (1 - easedRiseT);

      gsap.set(sheetEl, {
        y,
        opacity: 1,
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
      });

      applyMaskReveal(riseT);

      if (heroCopy) {
        gsap.set(heroCopy, { opacity: mapRange(easedRiseT, 0.35, 0.75, 1, 0) });
      }

      return { sheetY: y, radius, riseT };
    }

    function syncContentLayer(blend: number) {
      const contentLayer = getContentLayer();
      trigger.style.setProperty("--cruises-handoff-blend", String(blend));

      if (!contentLayer || !followerEl || blend <= 0) {
        trigger.classList.remove("hathor-page-scroll--handoff-active");
        if (contentLayer) {
          gsap.set(contentLayer, { clearProps: "transform,opacity" });
        }
        return;
      }

      trigger.classList.toggle(
        "hathor-page-scroll--handoff-active",
        !trigger.classList.contains("hathor-page-scroll--past-pin"),
      );

      const followerLanding = followerEl.querySelector(
        ".pt-sheet__landing",
      ) as HTMLElement | null;
      const contentLanding = contentLayer.querySelector(
        ".cruises-content-layer__landing",
      ) as HTMLElement | null;
      if (!followerLanding || !contentLanding) return;

      const followerTop = followerLanding.getBoundingClientRect().top;
      const layerRect = contentLayer.getBoundingClientRect();
      const landingRect = contentLanding.getBoundingClientRect();
      const currentY = Number(gsap.getProperty(contentLayer, "y")) || 0;
      const layerTop = layerRect.top - currentY;
      const landingOffset = landingRect.top - layerRect.top;
      const targetY = followerTop - (layerTop + landingOffset);

      gsap.set(contentLayer, {
        y: targetY,
        opacity: Math.min(1, blend),
      });
    }

    function finalizeContentLayer() {
      const contentLayer = getContentLayer();
      if (!contentLayer) return;

      const currentY = Number(gsap.getProperty(contentLayer, "y")) || 0;
      if (currentY !== 0) {
        const margin = parseFloat(getComputedStyle(contentLayer).marginTop) || 0;
        contentLayer.style.marginTop = `${margin + currentY}px`;
      }
      gsap.set(contentLayer, { clearProps: "transform", opacity: 1 });
    }

    function applyFollower(
      revealP: number,
      sheetY: number,
      radius: number,
    ) {
      if (!followerEl) return;
      if (trigger.classList.contains("hathor-page-scroll--past-pin")) return;

      const blend = mapRange(revealP, CONTENT_BLEND_START, 0.98, 0, 1);
      const y = Math.round(sheetY);
      const radiusKey = revealP < 0.98 ? String(radius) : "0";

      trigger.classList.toggle(
        "hathor-page-scroll--content-active",
        revealP >= 0.9,
      );

      if (y === lastFollowerY && radiusKey === lastFollowerRadius) {
        syncContentLayer(blend);
        return;
      }

      lastFollowerY = y;
      lastFollowerRadius = radiusKey;

      if (revealP < 0.98) {
        gsap.set(followerEl, {
          y,
          opacity: 1 - blend,
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
        });
      } else {
        gsap.set(followerEl, {
          y,
          opacity: 1 - blend,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        });
      }

      syncContentLayer(blend);
    }

    function applyRevealProgress(scrollProgress: number) {
      const { sheetY, radius, riseT } = applyProgress(scrollProgress);
      applyFollower(riseT, sheetY, radius);
    }

    function completePinHandoff() {
      syncContentLayer(1);
      finalizeContentLayer();

      trigger.classList.add("hathor-page-scroll--past-pin");
      trigger.classList.add("hathor-page-scroll--media-gone");
      trigger.classList.add("hathor-page-scroll--gold-complete");
      trigger.classList.add("hathor-page-scroll--content-active");
      trigger.classList.remove("hathor-page-scroll--handoff-active");

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

      applyMaskReveal(1);
    }

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      const setup = () => {
        if (!buildMaskStrips()) return false;
        applyRevealProgress(0);

        ScrollTrigger.create({
          id: `cruises-scroll-${instanceId}`,
          trigger,
          start: "top top",
          end: () => `+=${getRevealDistance()}`,
          pin: stage,
          pinSpacing: true,
          scrub: SCRUB,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            applyRevealProgress(self.progress);
          },
          onLeave: () => {
            completePinHandoff();
          },
          onEnterBack: () => {
            const contentLayer = getContentLayer();
            if (contentLayer) {
              contentLayer.style.removeProperty("margin-top");
              gsap.set(contentLayer, { clearProps: "transform,opacity" });
            }
            trigger.style.removeProperty("--cruises-handoff-blend");
            trigger.classList.remove(
              "hathor-page-scroll--past-pin",
              "hathor-page-scroll--media-gone",
              "hathor-page-scroll--gold-complete",
              "hathor-page-scroll--content-active",
              "hathor-page-scroll--handoff-active",
            );
            lastFollowerY = Number.NaN;
            lastFollowerRadius = "";
            applyRevealProgress(
              ScrollTrigger.getById(`cruises-scroll-${instanceId}`)?.progress ?? 0,
            );
          },
        });

        return true;
      };

      if (!setup()) {
        requestAnimationFrame(() => {
          setup();
          ScrollTrigger.refresh();
          applyRevealProgress(0);
        });
      } else {
        requestAnimationFrame(() => applyRevealProgress(0));
      }
    }, trigger);

    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const st = ScrollTrigger.getById(`cruises-scroll-${instanceId}`);
        const progress = st?.progress ?? 0;

        releasePinWidth();

        if (buildMaskStrips()) {
          if (trigger.classList.contains("hathor-page-scroll--past-pin")) {
            completePinHandoff();
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
      const layer = getContentLayer();
      if (layer) {
        layer.style.removeProperty("margin-top");
        gsap.set(layer, { clearProps: "transform,opacity" });
      }
      trigger.style.removeProperty("--cruises-handoff-blend");
      trigger.classList.remove(
        "hathor-page-scroll--past-pin",
        "hathor-page-scroll--media-gone",
        "hathor-page-scroll--content-active",
        "hathor-page-scroll--gold-complete",
        "hathor-page-scroll--handoff-active",
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
