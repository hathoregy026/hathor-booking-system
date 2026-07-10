/**
 * Cruises scroll engine — empty sheet runway + synced follower.
 * Reveal: follower rides the sheet. Browse: follower frozen, internal scroll.
 */
"use client";

import { useLayoutEffect, useId, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const PT_CREAM = "#f4f1ea";
const PT_GOLD = "#B69F64";

const MASK = {
  start: 0,
  end: 0.37,
  gapRatio: 0.94,
  rotSpread: 0.23 / 0.37,
  rotWindow: 0.08 / 0.37,
  gapSealWindow: 0.06 / 0.37,
};

const PEEK_VH = 0.065;
export const CRUISES_PIN_VH = 4.2;
export const CRUISES_RISE_END = 0.7;
/** Pin travel in viewport heights — dome rise completes at this distance. */
export const CRUISES_PIN_DISTANCE_VH = CRUISES_PIN_VH * CRUISES_RISE_END;
const SCRUB = true;

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

function setupSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return null;
  }

  const lenis = new Lenis({
    duration: 1,
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
    let lastFollowerScrollTop = -1;
    let smoothScroll = setupSmoothScroll();

    function teardownSmoothScroll() {
      if (!smoothScroll) return;
      gsap.ticker.remove(smoothScroll.ticker);
      smoothScroll.lenis.destroy();
      smoothScroll = null;
    }

    function restoreSmoothScroll() {
      if (smoothScroll) return;
      smoothScroll = setupSmoothScroll();
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

    function getContentScrollDistance() {
      if (!followerEl) return 0;
      return Math.max(0, followerEl.scrollHeight - stageEl.offsetHeight);
    }

    function getTotalPinDistance() {
      return getRevealDistance() + getContentScrollDistance();
    }

    function getRevealProgress(scrollProgress: number) {
      const revealShare = getRevealDistance() / Math.max(getTotalPinDistance(), 1);
      return clamp(scrollProgress / revealShare, 0, 1);
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
      const vh = window.innerHeight;
      const sheetH = sheetEl.offsetHeight;
      const peek = vh * PEEK_VH;
      const startY = sheetH - peek;
      const { start: rStart, end: rEnd } = getDomeRadii();

      const riseT = clamp(p, 0, 1);
      /* Linear sheet travel — matches wheel speed; dome/mask keep eased timing. */
      const y = startY * (1 - riseT);
      const easedRiseT = easeOutCubic(riseT);
      const radius = rEnd + (rStart - rEnd) * (1 - easedRiseT);

      gsap.set(sheetEl, {
        y,
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
      });

      applyMaskReveal(riseT);

      if (heroCopy) {
        gsap.set(heroCopy, { opacity: mapRange(easedRiseT, 0.35, 0.75, 1, 0) });
      }

      return { sheetY: y, radius };
    }

    function getBrowsingScrollTop(scrollProgress: number) {
      if (!followerEl) return 0;
      const scrolledPx = scrollProgress * getTotalPinDistance();
      const contentPx = Math.max(0, scrolledPx - getRevealDistance());
      const maxScroll = Math.max(
        0,
        followerEl.scrollHeight - followerEl.clientHeight,
      );
      return Math.round(Math.min(contentPx, maxScroll));
    }

    function isBrowsingPhase(scrollProgress: number) {
      const revealShare =
        getRevealDistance() / Math.max(getTotalPinDistance(), 1);
      return scrollProgress >= revealShare - 0.0001;
    }

    function applyFollower(scrollProgress: number, sheetY: number, radius: number | string) {
      if (!followerEl) return;
      if (trigger.classList.contains("hathor-page-scroll--past-pin")) return;

      const revealP = getRevealProgress(scrollProgress);
      const browsing = isBrowsingPhase(scrollProgress);

      trigger.classList.toggle("hathor-page-scroll--content-active", browsing);

      if (browsing) {
        teardownSmoothScroll();
        const scrollTop = getBrowsingScrollTop(scrollProgress);
        if (
          lastFollowerY === 0 &&
          lastFollowerScrollTop === scrollTop &&
          lastFollowerRadius === "0"
        ) {
          return;
        }

        gsap.set(followerEl, {
          y: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        });
        followerEl.scrollTop = scrollTop;
        lastFollowerY = 0;
        lastFollowerScrollTop = scrollTop;
        lastFollowerRadius = "0";
        return;
      }

      restoreSmoothScroll();
      followerEl.scrollTop = 0;
      lastFollowerScrollTop = 0;

      const y = Math.round(sheetY);
      const radiusKey = revealP < 0.98 ? String(radius) : "0";

      if (y === lastFollowerY && radiusKey === lastFollowerRadius) return;

      lastFollowerY = y;
      lastFollowerRadius = radiusKey;

      if (revealP < 0.98) {
        gsap.set(followerEl, {
          y,
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
        });
        return;
      }

      gsap.set(followerEl, {
        y,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
      });
    }

    function applyFrame(scrollProgress: number) {
      const revealP = getRevealProgress(scrollProgress);
      const { sheetY, radius } = applyProgress(revealP);
      applyFollower(scrollProgress, sheetY, radius);
    }

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      const setup = () => {
        if (!buildMaskStrips()) return false;
        applyFrame(0);

        ScrollTrigger.create({
          id: `cruises-scroll-${instanceId}`,
          trigger,
          start: "top top",
          end: () => `+=${getTotalPinDistance()}`,
          pin: stage,
          pinSpacing: true,
          scrub: SCRUB,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            applyFrame(self.progress);
          },
          onLeave: () => {
            trigger.classList.add("hathor-page-scroll--past-pin");
            trigger.classList.add("hathor-page-scroll--media-gone");
            if (followerEl) {
              const maxScroll = Math.max(
                0,
                followerEl.scrollHeight - followerEl.clientHeight,
              );
              followerEl.scrollTop = maxScroll;
              gsap.set(followerEl, {
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                clearProps: "transform",
              });
            }
          },
          onEnterBack: () => {
            trigger.classList.remove("hathor-page-scroll--past-pin");
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
        const st = ScrollTrigger.getById(`cruises-scroll-${instanceId}`);
        const progress = st?.progress ?? 0;

        releasePinWidth();

        if (buildMaskStrips()) {
          applyFrame(progress);
        }
        ScrollTrigger.refresh();
      }, 150);
    };

    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);

    const resizeObserver = new ResizeObserver(() => onResize());
    resizeObserver.observe(stageEl);
    resizeObserver.observe(mask);
    if (followerEl) resizeObserver.observe(followerEl);

    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      resizeObserver.disconnect();
      if (resizeTimer) clearTimeout(resizeTimer);
      teardownSmoothScroll();
      ctx.revert();
      if (followerEl) {
        gsap.set(followerEl, {
          clearProps: "transform,borderTopLeftRadius,borderTopRightRadius",
        });
      }
      trigger.classList.remove(
        "hathor-page-scroll--past-pin",
        "hathor-page-scroll--media-gone",
        "hathor-page-scroll--content-active",
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
