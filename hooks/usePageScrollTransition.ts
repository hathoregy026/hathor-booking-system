/**
 * Production page scroll reveal.
 *
 * This intentionally mirrors the frozen /test-scroll-reveal engine's DOM contract,
 * but uses a slower Venetian-style mask cadence for public pages. Do not import
 * this from /test-scroll-reveal.
 */
"use client";

import { useLayoutEffect, useId, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { lenisMobileSafeOptions, isTouchDevice, isPhoneViewport, logPhonePerfDev } from "@/lib/touch-device";

const PT_CREAM_DEFAULT = "#ECE8DF";
const PT_CREAM_HOMEPAGE_2 = "#f4f1ea";
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
const PHONE_STRIP_COUNT = 8;

type Strip = { el: HTMLDivElement; colW: number; slatW: number };

type PageScrollTransitionRefs = {
  root: RefObject<HTMLElement | null>;
  stage: RefObject<HTMLElement | null>;
  mask: RefObject<HTMLElement | null>;
  sheet: RefObject<HTMLElement | null>;
  heroCopy: RefObject<HTMLElement | null>;
};

export type PageScrollTransitionConfig = PageScrollTransitionRefs & {
  layout?: "default" | "homepage-2";
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
  /* Phones + touch / narrow: never Lenis */
  if (isPhoneViewport() || isTouchDevice()) return null;

  const lenis = new Lenis(lenisMobileSafeOptions(2.1));

  lenis.on("scroll", ScrollTrigger.update);

  const ticker = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);

  logPhonePerfDev({ lenis: true, surface: "page-scroll-transition" });
  return { lenis, ticker };
}

/**
 * Phone ≤480: gold curtain opens once (IO + timeline). No pin, no scrub, no width thrash.
 */
function setupPhoneOneShotCurtain(opts: {
  trigger: HTMLElement;
  stageEl: HTMLElement;
  mask: HTMLElement;
  sheetEl: HTMLElement;
  heroCopy: HTMLElement | null;
  layout: "default" | "homepage-2";
  instanceId: string;
}): () => void {
  const { trigger, stageEl, mask, sheetEl, heroCopy, layout, instanceId } = opts;
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let strips: HTMLDivElement[] = [];
  let played = false;
  let rebuilds = 0;
  let lastWidth = window.innerWidth;
  let orientTimer: ReturnType<typeof setTimeout> | null = null;
  let openTl: gsap.core.Timeline | null = null;

  function buildStrips() {
    const n = PHONE_STRIP_COUNT;
    const w = Math.max(mask.clientWidth, stageEl.clientWidth, 1);
    if (!w) return false;
    const colW = w / n;
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
      strip.style.width = "100%";
      strip.style.transformOrigin = "left center";
      col.appendChild(strip);
      mask.appendChild(col);
      strips.push(strip);
    }
    return true;
  }

  function setClosed() {
    mask.classList.add("is-active");
    gsap.set(mask, { opacity: 1 });
    gsap.set(strips, {
      scaleX: 1,
      opacity: 1,
      x: 0,
      clearProps: "rotationY,width",
    });
    const vh = window.innerHeight;
    const sheetH = sheetEl.offsetHeight;
    const peek = vh * PEEK_VH;
    const startY = Math.max(0, sheetH - peek);
    gsap.set(sheetEl, { y: startY, borderTopLeftRadius: 48, borderTopRightRadius: 48 });
    if (heroCopy) gsap.set(heroCopy, { opacity: 1 });
  }

  function playOpen() {
    if (played || prefersReduced) {
      if (prefersReduced) {
        gsap.set(mask, { opacity: 0 });
        gsap.set(sheetEl, { y: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0 });
        if (heroCopy) gsap.set(heroCopy, { opacity: 0 });
      }
      return;
    }
    played = true;
    strips.forEach((el) => {
      el.style.willChange = "transform, opacity";
    });
    openTl?.kill();
    openTl = gsap.timeline({
      defaults: { ease: "power2.out" },
      onComplete: () => {
        strips.forEach((el) => {
          el.style.willChange = "auto";
        });
        gsap.set(mask, { opacity: 0 });
        mask.classList.remove("is-active");
      },
    });
    openTl.to(
      strips,
      {
        scaleX: 0,
        opacity: 0,
        duration: 0.7,
        stagger: { each: 0.045, from: "start" },
      },
      0,
    );
    openTl.to(
      sheetEl,
      {
        y: 0,
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        duration: 0.85,
        ease: "power2.inOut",
      },
      0.12,
    );
    if (heroCopy) {
      openTl.to(heroCopy, { opacity: 0, duration: 0.45 }, 0.2);
    }
  }

  function boot() {
    if (!buildStrips()) return false;
    setClosed();
    return true;
  }

  boot();
  logPhonePerfDev({
    surface: "page-scroll-transition",
    phoneLightweight: true,
    strips: strips.length,
    lenis: false,
    pin: false,
    instanceId,
  });

  const io = new IntersectionObserver(
    (entries) => {
      const hit = entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.2);
      if (hit) {
        playOpen();
        io.disconnect();
      }
    },
    { threshold: [0.2, 0.35] },
  );
  io.observe(stageEl);

  const onOrient = () => {
    if (orientTimer) clearTimeout(orientTimer);
    orientTimer = setTimeout(() => {
      const w = window.innerWidth;
      if (Math.abs(w - lastWidth) < 20) return;
      lastWidth = w;
      if (!isPhoneViewport()) return;
      rebuilds += 1;
      played = false;
      openTl?.kill();
      boot();
      logPhonePerfDev({
        surface: "page-scroll-transition",
        rebuild: rebuilds,
        reason: "orientation-width",
      });
    }, 250);
  };
  window.addEventListener("orientationchange", onOrient, { passive: true });

  /* Sheet sits in normal flow on phone — no pin spacer */
  void layout;

  return () => {
    io.disconnect();
    window.removeEventListener("orientationchange", onOrient);
    if (orientTimer) clearTimeout(orientTimer);
    openTl?.kill();
  };
}

export function usePageScrollTransition(config: PageScrollTransitionConfig) {
  const layout = config.layout ?? "default";
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
    const ptCream =
      layout === "homepage-2" ? PT_CREAM_HOMEPAGE_2 : PT_CREAM_DEFAULT;

    document.body.classList.add("has-page-scroll-transition");
    document.documentElement.classList.add("has-page-scroll-transition");
    document.body.style.backgroundColor = ptCream;

    trigger.style.setProperty("--pt-gold", PT_GOLD);
    trigger.style.setProperty("--pt-cream", ptCream);

    /* -------- Phone ≤480: one-shot curtain (no pin / scrub / Lenis) -------- */
    if (isPhoneViewport()) {
      const phoneCleanup = setupPhoneOneShotCurtain({
        trigger,
        stageEl,
        mask,
        sheetEl,
        heroCopy,
        layout,
        instanceId,
      });
      return () => {
        phoneCleanup();
        document.body.classList.remove("has-page-scroll-transition");
        document.documentElement.classList.remove("has-page-scroll-transition");
        document.body.style.backgroundColor = "";
      };
    }

    let strips: Strip[] = [];
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const smoothScroll = setupSmoothScroll();
    let lastWidth = window.innerWidth;

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

    function releaseHomepage2PinWidth() {
      if (layout !== "homepage-2") return;

      gsap.set(stageEl, { clearProps: "width,maxWidth,minWidth" });
      stageEl.style.width = "100%";

      const pinSpacer = stageEl.parentElement;
      if (pinSpacer?.classList.contains("pin-spacer")) {
        pinSpacer.style.removeProperty("width");
        pinSpacer.style.removeProperty("max-width");
      }
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
      const sheetH = sheetEl.offsetHeight;
      const peek = vh * PEEK_VH;
      const startY = sheetH - peek;
      const { start: rStart, end: rEnd } = getDomeRadii();

      const riseT = mapRange(p, 0, 0.7, 0, 1);
      let y = startY * (1 - riseT);

      const driftT = mapRange(p, 0.7, 1, 0, 1);
      const extra = Math.max(0, sheetH - vh * 0.92);
      if (layout !== "homepage-2") {
        y -= driftT * extra;
      }

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
          id: `page-scroll-transition-${instanceId}`,
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
        const w = window.innerWidth;
        /* Ignore height-only chrome changes (tablet/desktop still get normal resize) */
        if (Math.abs(w - lastWidth) < 20 && isTouchDevice()) return;
        lastWidth = w;
        const st = ScrollTrigger.getById(`page-scroll-transition-${instanceId}`);
        const progress = st?.progress ?? 0;

        releaseHomepage2PinWidth();

        if (buildMaskStrips()) {
          applyProgress(progress);
        }
        ScrollTrigger.refresh();
      }, 150);
    };

    window.addEventListener("resize", onResize);
    /* No visualViewport.resize — chrome collapse while scrolling rebuilds masks */
    window.addEventListener("orientationchange", onResize, { passive: true });

    const resizeObserver =
      layout === "homepage-2"
        ? new ResizeObserver(() => {
            /* Width-only meaningful changes; ignore animation-driven height noise */
            const w = stageEl.clientWidth;
            if (Math.abs(w - lastWidth) < 20) return;
            onResize();
          })
        : null;
    if (resizeObserver) {
      resizeObserver.observe(stageEl);
      /* Do not observe mask — GSAP mutates strip geometry */
    }

    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      resizeObserver?.disconnect();
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
    layout,
    config.root,
    config.stage,
    config.mask,
    config.sheet,
    config.heroCopy,
  ]);
}

export function refreshPageScrollTransition() {
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.refresh();
}
