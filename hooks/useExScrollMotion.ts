/**
 * EX page — homepage Venetian scroll-reveal motion (GSAP, Lenis).
 * Stack-slide letter timing stays here; site-wide copy uses LuxuryTextAnimations.
 */
// @ts-nocheck
"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { mountHeroScrollStage } from "@/lib/hero-scroll-stage";
import { splitAtelierText, splitAtelierWords } from "@/lib/atelier-text-split";
import {
  applyScrollY,
  claimScrollRestore,
  readSavedScrollY,
  shouldRestoreScrollOnMount,
} from "@/lib/scroll-position-restore";
import {
  shouldLightenMotionForDevice,
  shouldUseNativeScroll,
  isPhoneViewport,
  logPhonePerfDev,
} from "@/lib/touch-device";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

function resetWindowScrollTop(
  scrollController: ReturnType<typeof ensurePublicScrollController>,
) {
  try {
    scrollController.scrollTo(0, { immediate: true, force: true });
  } catch {
    /* ignore */
  }
  try {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  } catch {
    /* ignore */
  }
}

export function useExScrollMotion() {
  useLayoutEffect(() => {

  /* -------------------------------------------------------
   * 0. Reduced motion — skip heavy motion, still show content
   * ----------------------------------------------------- */
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isNarrowViewport = window.matchMedia("(max-width: 1024px)").matches;
  const lightenDevice = shouldLightenMotionForDevice();
  const isPhone = isPhoneViewport();
  const ownedTriggerIds: string[] = [];

  const trackTrigger = (st: ScrollTrigger) => {
    const id = st.vars?.id;
    if (id) ownedTriggerIds.push(String(id));
    return st;
  };

  const scrollController = ensurePublicScrollController();
  const lenis = scrollController.lenis;
  let heroCleanup: (() => void) | null = null;
  let helmCleanup: (() => void) | null = null;
  const motionCleanups: Array<() => void> = [];

  if (process.env.NODE_ENV !== "production") {
    (window as Window & { ScrollTrigger?: typeof ScrollTrigger }).ScrollTrigger =
      ScrollTrigger;
  }

  if (!prefersReduced) {
    // Native finger scroll on phones/tablets — Lenis + scrubbed pins = jumpy lag.
    // Phones ≤480 never get Lenis (even if DevTools reports fine pointer).
    if (!shouldUseNativeScroll() && !isPhone && scrollController.mode === "lenis") {
      logPhonePerfDev({ surface: "ex-scroll", lenis: true, phone: false });
    } else {
      // Unlock logo immediately on real phones (critical CSS skips hide for is-touch-device)
      document.documentElement.classList.add("ex-scroll-ready");
      document.documentElement.classList.remove("ex-pending", "ex-pending-deep");
      logPhonePerfDev({
        surface: "ex-scroll",
        lenis: false,
        phone: isPhone,
        nativeScroll: true,
      });
    }

    try {
      ScrollTrigger.config({ ignoreMobileResize: true });
    } catch {
      /* older GSAP */
    }
  }

  /*
   * Always boot ScrollTrigger from Y=0 so the hero never mounts mid-scrub
   * (giant letters / open blinds). Restore saved Y only AFTER boot, while
   * logo/blinds stay CSS-hidden (and deep-veil if mid-page).
   */
  const path = window.location.pathname || "/";
  const willRestore = shouldRestoreScrollOnMount(path);
  const savedY = willRestore ? readSavedScrollY(path) : 0;
  if (willRestore) claimScrollRestore(path);
  resetWindowScrollTop(scrollController);

  /* -------------------------------------------------------
   * 3. Nav entrance + solid state on scroll
   * ----------------------------------------------------- */
  function initNav() {
    const nav = document.querySelector(".nav-bar");
    const toggle = document.querySelector(".nav-toggle");
    if (!nav) return;

    // Entrance (mirrors Elementor slideInDown feel)
    requestAnimationFrame(() => nav.classList.add("is-visible"));

    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      nav.classList.toggle("is-solid", y > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    motionCleanups.push(() => window.removeEventListener("scroll", onScroll));

    if (toggle) {
      const onToggle = () => {
        nav.classList.toggle("is-open");
        const open = nav.classList.contains("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      };
      toggle.addEventListener("click", onToggle);
      motionCleanups.push(() => toggle.removeEventListener("click", onToggle));
    }

    // Smooth anchor links via Lenis when available
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const onAnchorClick = (e: Event) => {
        const id = a.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target || !(target instanceof HTMLElement)) return;
        e.preventDefault();
        nav.classList.remove("is-open");
        if (lenis) {
          lenis.scrollTo(target, { offset: -20 });
        } else {
          target.scrollIntoView({ behavior: "smooth" });
        }
      };
      a.addEventListener("click", onAnchorClick);
      motionCleanups.push(() =>
        a.removeEventListener("click", onAnchorClick),
      );
    });
  }

  /* -------------------------------------------------------
   * PATTERN A — Character / word / line text reveals
   *   start: "top 80%"
   *   chars: y:30 opacity:0 duration:0.3 stagger:0.05 power2.out
   *   lines: y:20 opacity:0 duration:0.35 stagger:0.1
   *   button: y:20 opacity:0 duration:0.4
   * ----------------------------------------------------- */

  // Legacy stub — hero text is driven by initHeroScrollStage
  function initHeroText() {
    /* handled by initHeroScrollStage */
  }


  function initRadiusSubHeading() {
    /* Text: initHomepageAtelierSplit */
  }

  // .radius-heading (chars) + .radius-p (whole) + .radius-button
  // Do NOT SplitType body lines — italic descenders ghost/clip inside overflow:hidden lines.
  function initRadiusHeadingPara() {
    if (prefersReduced) return;
    document.querySelectorAll(".radius-heading").forEach((headingElement) => {
      const button = headingElement.parentElement?.querySelector(".radius-button");
      if (!button) return;
      gsap.from(button, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: headingElement,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }

  // .home-carousel-h2 (chars) + .home-carousel-h3 (words)
  function initCarouselHeadings() {
    /* Text: initHomepageAtelierSplit */
  }

  // .home-scroll-h2 (chars) + .home-scroll-p (whole)
  function initHomeScrollText() {
    /* Text: initHomepageAtelierSplit */
  }

  // .home-text-h2 (chars) + .home-text-p (whole) + .home-text-button
  function initHomeTextBlocks() {
    if (prefersReduced) return;
    document.querySelectorAll(".home-text-h2").forEach((headingElement) => {
      const button = headingElement.parentElement?.querySelector(".home-text-button");
      if (!button) return;
      gsap.from(button, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: headingElement,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    });
  }

  // .gallery-h2 — chars
  function initGalleryH2() {
    /* Text: initHomepageAtelierSplit */
  }

  // .gallery-container — Book Now is static (scroll fade caused a Lenis hitch)
  function initGalleryContainers() {
    /* intentionally empty */
  }

  // .testimonial-h2 — chars
  function initTestimonialH2() {
    /* Text: initHomepageAtelierSplit */
  }

  // .general-button — simple fade up, start top 98%
  function initGeneralButtons() {
    document.querySelectorAll(".general-button").forEach((button) => {
      if (prefersReduced) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: button,
          scroller: "body",
          start: "top 98%",
        },
      });

      tl.from(button, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
      });
    });
  }

  /* -------------------------------------------------------
   * PATTERN B — Image wipe + zoom (clip-path)
   *   start: "top 65%", once: true
   *   clip: point → full rect, duration 1, power1.out
   *   img scale 1.5 → 1, duration 1, power2.out (parallel)
   * ----------------------------------------------------- */
  function initGeneralRevealImages() {
    if (prefersReduced) return;

    gsap.utils.toArray(".general-reveal-img").forEach((wrapper) => {
      const img = wrapper.querySelector("img");
      if (!img) return;

      const container = wrapper.closest(".radius-img-container");
      if (!container) return;

      gsap
        .timeline({
          scrollTrigger: {
            trigger: container,
            start: "top 65%",
            toggleActions: "play none none none",
            once: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          wrapper,
          { clipPath: "polygon(0 0, 0 0, 0 0, 0 0)" },
          {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: 1,
            ease: "power1.out",
          }
        )
        .fromTo(
          img,
          { scale: 1.5 },
          { scale: 1, duration: 1, ease: "power2.out" },
          0
        );
    });
  }

  // .home-text-img-parent wipe (scale on container)
  function initHomeTextImgReveal() {
    if (prefersReduced) return;

    const OPEN_CLIP = "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
    const CLOSED_CLIP = "polygon(0 0, 0 0, 0 0, 0 0)";

    gsap.utils.toArray<HTMLElement>(".home-text-img-parent").forEach((parent, index) => {
      /* Stacked home-story owns its own scrubbed reveals */
      if (parent.closest(".home-story")) return;
      const container = parent.querySelector<HTMLElement>(".home-text-img-container");
      if (!container) return;
      if (parent.dataset.revealInitialized) return;
      parent.dataset.revealInitialized = "true";

      const triggerId = `ex-text-img-${index}`;
      const tl = gsap.timeline({
        scrollTrigger: {
          id: triggerId,
          trigger: parent,
          start: "top 75%",
          toggleActions: "play none none none",
          once: true,
          invalidateOnRefresh: true,
          // If mid-page restore / refresh leaves the row in view, finish open
          // so the dining/lifestyle photos never stay fully clipped.
          onRefresh: (self) => {
            if (self.progress === 1 || self.isActive) return;
            const rect = parent.getBoundingClientRect();
            const vh = window.innerHeight || 1;
            if (rect.top < vh * 0.9 && rect.bottom > vh * 0.1) {
              self.animation?.progress(1);
            }
          },
        },
      });

      tl.fromTo(
        container,
        { clipPath: CLOSED_CLIP, WebkitClipPath: CLOSED_CLIP, scale: 1.5 },
        {
          clipPath: OPEN_CLIP,
          WebkitClipPath: OPEN_CLIP,
          scale: 1,
          duration: 1,
          ease: "power1.out",
        },
      );

      if (tl.scrollTrigger) trackTrigger(tl.scrollTrigger);

      motionCleanups.push(() => {
        tl.scrollTrigger?.kill();
        tl.kill();
        gsap.set(container, {
          clearProps: "clipPath,WebkitClipPath,transform",
        });
        delete parent.dataset.revealInitialized;
      });
    });
  }

  function initHomeHelmPortal() {
    if (prefersReduced) return;

    const section = document.querySelector<HTMLElement>("[data-home-helm-portal]");
    const media = section?.querySelector<HTMLElement>("[data-home-helm-media]");
    const mediaImage = media?.querySelector<HTMLElement>("img");
    const shade = media?.querySelector<HTMLElement>(".home-helm-portal__shade");
    const wheel = section?.querySelector<HTMLElement>("[data-home-helm-wheel]");
    if (!section || !media || !mediaImage || !wheel) {
      return;
    }

    const isTouchPortal = isNarrowViewport;
    const wheelOpenScale = isTouchPortal ? 2.55 : 3.15;
    const wheelExitScale = isTouchPortal ? 4.1 : 5.4;
    /* Same circle reveal on phones — stepped progress cuts GPU mask paints. */
    const stepPortal = lightenDevice;

    gsap.set(wheel, {
      xPercent: 0,
      yPercent: 0,
      x: 0,
      y: 0,
      scale: 1,
      rotation: 0,
      autoAlpha: 1,
      force3D: true,
    });
    gsap.set(media, {
      clipPath: "circle(0vmax at 50% 50%)",
      WebkitClipPath: "circle(0vmax at 50% 50%)",
    });
    /* No x/y shift — image sun center must stay under the wheel hub (50% 50%). */
    gsap.set(mediaImage, { scale: 1.34, xPercent: 0, yPercent: 0, x: 0, y: 0, force3D: true });
    if (shade) gsap.set(shade, { opacity: 1 });

    const portalTimeline = gsap.timeline({ paused: true });
    portalTimeline
      .to(
        wheel,
        {
          rotation: 640,
          scale: wheelOpenScale,
          duration: 0.55,
          ease: "sine.inOut",
        },
        0.11,
      )
      .to(
        media,
        {
          clipPath: "circle(13vmax at 50% 50%)",
          WebkitClipPath: "circle(13vmax at 50% 50%)",
          duration: 0.42,
          ease: "sine.inOut",
        },
        0.24,
      )
      .to(
        mediaImage,
        {
          scale: 1.08,
          xPercent: 0,
          yPercent: 0,
          duration: 0.62,
          ease: "sine.inOut",
        },
        0.14,
      )
      .to(
        wheel,
        {
          rotation: 850,
          scale: wheelExitScale,
          autoAlpha: 0,
          duration: 0.2,
          ease: "power2.in",
        },
        0.66,
      )
      .to(
        media,
        {
          clipPath: "circle(75vmax at 50% 50%)",
          WebkitClipPath: "circle(75vmax at 50% 50%)",
          duration: 0.22,
          ease: "power2.inOut",
        },
        0.66,
      )
      .to(
        mediaImage,
        {
          scale: 1,
          xPercent: 0,
          yPercent: 0,
          duration: 0.3,
          ease: "power2.out",
        },
        0.66,
      )
      .to({}, { duration: 0.04 }, 0.96);

    if (shade) {
      portalTimeline.to(
        shade,
        {
          opacity: 0.78,
          duration: 0.3,
          ease: "power1.out",
        },
        0.66,
      );
    }

    /*
     * Progress must be derived live from getBoundingClientRect().
     * Caching sectionTop + scrollY (a3d3b73) went stale after fog/stack pin
     * spacers shifted layout, so the wheel finished before entering the
     * sticky viewport. Restore 63b084c live -rect.top / scrollable mapping.
     */
    let animationFrame = 0;
    let lastStepped = -1;
    const render = () => {
      animationFrame = 0;
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = gsap.utils.clamp(0, 1, -rect.top / scrollable);
      if (isTouchPortal) {
        /*
         * Native touch scroll must track the finger directly. A catch-up tween
         * here makes the wheel appear to drift and the page feel laggy.
         * On real phones, quantize progress so clip-path isn't repainted every px.
         */
        const stepped = stepPortal
          ? Math.round(progress * 32) / 32
          : progress;
        if (stepPortal && stepped === lastStepped) return;
        lastStepped = stepped;
        portalTimeline.progress(stepped);
      } else {
        gsap.to(portalTimeline, {
          progress,
          duration: 0.85,
          ease: "power3.out",
          overwrite: true,
        });
      }
    };

    const requestRender = () => {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(render);
    };
    const viewportEvent = isNarrowViewport ? "orientationchange" : "resize";

    window.addEventListener("scroll", requestRender, { passive: true });
    window.addEventListener(viewportEvent, requestRender);
    render();

    helmCleanup = () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestRender);
      window.removeEventListener(viewportEvent, requestRender);
      gsap.killTweensOf(portalTimeline);
      portalTimeline.kill();
    };
  }

  /* -------------------------------------------------------
   * HERO SCROLL STAGE (pinned 100vh, SHORT scroll)
   *  - Stripes FULLY hidden on land (opacity 0 + edge-on)
   *  - On scroll: reveal one-by-one L→R over a photo hero
   *  - Title IN FRONT of stripes
   *  - "A refined glow" → right + fade
   *  - "the Venetian way" → left + fade
   *  - Book Now: HORIZONTAL stretch ×4 (left+right), letter-spacing expands
   * ----------------------------------------------------- */
  function initHeroScrollStage() {
    heroCleanup = mountHeroScrollStage({
      prefersReduced,
      lenis,
      /* Mid-page refresh: snap logo — never play the rise tween under the veil. */
      skipLanding: savedY > 80,
    });
  }

  function initHeroBlinds() {
    /* merged into initHeroScrollStage */
  }

  function initRadiusMorph() {
    /* removed — no dome */
  }

  function initHeroLuxuryChrome() {
    /* merged into initHeroScrollStage */
  }

  /* -------------------------------------------------------
   * EX stack scroll — fullscreen luxury card stack + text
   * Masked letter rise/fall (atelier split) per slide
   * ----------------------------------------------------- */
  function splitStackText(el: HTMLElement) {
    /* Same rise language on phones — words instead of every glyph. */
    return lightenDevice ? splitAtelierWords(el) : splitAtelierText(el);
  }

  function prepareStackPanelSplits(panels: HTMLElement[]) {
    panels.forEach((panel) => {
      const targets = panel.querySelectorAll<HTMLElement>(
        lightenDevice
          ? ".ex-stack-scroll__title-line, .ex-stack-scroll__eyebrow"
          : ".ex-stack-scroll__title-line, .ex-stack-scroll__eyebrow, .ex-stack-scroll__body",
      );
      const chars: HTMLElement[] = [];
      targets.forEach((el) => {
        chars.push(...splitStackText(el));
      });
      (panel as HTMLElement & { __stackChars?: HTMLElement[] }).__stackChars =
        chars;
      if (chars.length) {
        gsap.set(chars, { yPercent: 100, opacity: 0 });
      }
    });
  }

  function playStackSplit(panel: HTMLElement | undefined) {
    if (!panel || prefersReduced) return;
    const chars =
      (panel as HTMLElement & { __stackChars?: HTMLElement[] }).__stackChars;
    if (!chars?.length) return;
    /* Soft letter rise — no hard snap when a frame sits */
    const stagger =
      chars.length > 60 ? Math.min(0.022, 0.9 / chars.length) : 0.022;
    gsap.killTweensOf(chars);
    gsap.fromTo(
      chars,
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 0.85,
        stagger,
        ease: "power2.out",
        overwrite: true,
        onComplete: () => {
          chars.forEach((c) => c.style.removeProperty("will-change"));
        },
      },
    );
  }

  function reverseStackSplit(panel: HTMLElement | undefined) {
    if (!panel || prefersReduced) return;
    const chars =
      (panel as HTMLElement & { __stackChars?: HTMLElement[] }).__stackChars;
    if (!chars?.length) return;
    gsap.killTweensOf(chars);
    gsap.to(chars, {
      yPercent: 100,
      opacity: 0,
      duration: 0.55,
      stagger: 0.01,
      ease: "power2.in",
      overwrite: true,
    });
  }

  /** Soft panel fade only — per-glyph scrub caused scroll flicker on reverse/forward */
  function scrubStackChars(
    tl: gsap.core.Timeline,
    panel: HTMLElement | undefined,
    at: number,
    duration: number,
    direction: "in" | "out",
  ) {
    if (!panel || prefersReduced) return;
    const chars =
      (panel as HTMLElement & { __stackChars?: HTMLElement[] }).__stackChars;
    if (!chars?.length) return;

    /*
     * Scrub the whole glyph set as one unit (not hundreds of staggered
     * per-letter tweens). Preserves the rise/fall language without
     * barcode flicker when the wheel reverses mid-wipe.
     */
    if (direction === "in") {
      tl.fromTo(
        chars,
        { yPercent: 28, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          ease: "none",
          duration,
          immediateRender: false,
          stagger: 0,
        },
        at,
      );
    } else {
      tl.to(
        chars,
        {
          yPercent: 18,
          opacity: 0,
          ease: "none",
          duration,
          stagger: 0,
        },
        at,
      );
    }
  }

  function initExStackScroll() {
    const section = document.querySelector(".ex-stack-scroll");
    const viewport = section?.querySelector(".ex-stack-scroll__viewport");
    const silkChars = gsap.utils.toArray<HTMLElement>(
      ".ex-stack-scroll__silk-char",
    );
    const copyPanels = gsap.utils.toArray<HTMLElement>(
      ".ex-stack-scroll__copy-panel",
    );
    const cards = gsap.utils.toArray<HTMLElement>(".ex-stack-scroll__card");
    const pager = section?.querySelector<HTMLElement>("[data-stack-pager]");
    const pagerNum = section?.querySelector<HTMLElement>("[data-stack-pager-num]");
    const pagerLine = section?.querySelector<HTMLElement>("[data-stack-pager-line]");
    if (!section || !viewport || cards.length < 2) return;

    section.setAttribute("data-mobile-fog-rise", "");
    section.classList.add("signature-fog-rise");

    /** Finer fog steps on phone — 24 was visibly stepped during slow finger drag. */
    const FOG_STEPS = 56;
    const FOG_RANGE = 140;
    const quantiseFogEdge = (edge: number, stepped: boolean) => {
      if (!stepped) return edge;
      const step = FOG_RANGE / FOG_STEPS;
      return Math.round(edge / step) * step;
    };

    const clearFogWillChange = (
      card: HTMLElement,
      media: HTMLElement | null,
    ) => {
      card.style.willChange = "auto";
      if (media) media.style.willChange = "auto";
    };

    const setStackPager = (index: number) => {
      const safe = Math.max(0, Math.min(index, cards.length - 1));
      if (pagerNum) {
        pagerNum.textContent = String(safe + 1).padStart(2, "0");
      }
      if (pagerLine) {
        const progress = (safe + 1) / cards.length;
        pagerLine.style.transform = `scaleY(${progress})`;
      }
    };

    prepareStackPanelSplits(copyPanels);

    if (prefersReduced) {
      if (silkChars.length) gsap.set(silkChars, { yPercent: 0, opacity: 0 });
      copyPanels.forEach((panel) => {
        const chars =
          (panel as HTMLElement & { __stackChars?: HTMLElement[] })
            .__stackChars;
        if (chars?.length) gsap.set(chars, { yPercent: 0, opacity: 1 });
      });
      gsap.set(cards, {
        yPercent: 0,
        scale: 1,
        filter: "brightness(1)",
        autoAlpha: 1,
        "--stack-fog-edge": "140%",
      });
      cards.slice(1).forEach((card) => {
        gsap.set(card, { autoAlpha: 0, "--stack-fog-edge": "0%" });
      });
      copyPanels.forEach((panel, index) => {
        gsap.set(panel, {
          autoAlpha: index === 0 ? 1 : 0,
          y: 0,
        });
        panel.setAttribute("aria-hidden", index === 0 ? "false" : "true");
      });
      if (pager) gsap.set(pager, { autoAlpha: 1 });
      setStackPager(0);
      return;
    }

    const killExisting = () => {
      ScrollTrigger.getAll().forEach((st) => {
        const id = st.vars && String(st.vars.id || "");
        if (
          id.startsWith("ex-stack-scroll") ||
          id === "ex-stack-copy" ||
          id === "ex-stack-text"
        ) {
          st.kill();
        }
      });
    };

    const getCardMedia = (card: HTMLElement) =>
      card.querySelector<HTMLElement>(".ex-stack-scroll__card-media img");

    const build = () => {
      killExisting();

      const total = cards.length;
      /* Slightly longer wipe + calmer dwell — less rubber-band settle */
      const dwell = 0.52;
      const move = 0.82;
      const release = 0.7;
      const step = dwell + move;
      /*
       * Cream invitation intro (same fog language as Take Your Voyage Today).
       * Text still rises ahead of fog; overall scroll is paced slower to read.
       */
      const introText = 0.22;
      const introHold = 0.22;
      const introFog = 0.52;
      const introSettle = 0.14;
      const introSpan = introText + introHold + introFog + introSettle;
      const scrollSpan = introSpan + total * (move + dwell) + release;

      if (silkChars.length) {
        /* Clear any prior transform so yPercent alone drives the rise mask */
        gsap.set(silkChars, {
          x: 0,
          y: 0,
          xPercent: 0,
          yPercent: 100,
          opacity: 0,
          force3D: true,
        });
      }

      cards.forEach((card, index) => {
        const media = getCardMedia(card);
        gsap.set(card, {
          zIndex: index + 1,
          /* Stay full-frame — next image dissolves up through soft fog */
          yPercent: 0,
          x: 0,
          xPercent: 0,
          scale: 1,
          filter: "brightness(1)",
          /* First card starts hidden under silk, then fog-rises over it */
          "--stack-fog-edge": "0%",
          autoAlpha: 0,
          force3D: true,
          clearProps: "",
        });
        if (media) {
          /* Soft ken burn — gentle settle, same wipe timing */
          gsap.set(media, {
            x: 0,
            xPercent: 0,
            scale: index === 0 ? 1.06 : 1.08,
            yPercent: index === 0 ? 3 : 4,
            force3D: true,
          });
        }
      });

      copyPanels.forEach((panel, index) => {
        const chars =
          (panel as HTMLElement & { __stackChars?: HTMLElement[] })
            .__stackChars;
        gsap.set(panel, {
          autoAlpha: 0,
          y: 0,
          visibility: "hidden",
        });
        if (chars?.length) {
          gsap.killTweensOf(chars);
          gsap.set(chars, { yPercent: 100, opacity: 0 });
        }
        panel.setAttribute("aria-hidden", "true");
      });

      if (pager) gsap.set(pager, { autoAlpha: 0, visibility: "hidden" });
      setStackPager(0);

      const isPhoneStack = isNarrowViewport;
      const fogStepped = isPhone || lightenDevice;

      logPhonePerfDev({
        surface: "ex-stack-fog-rise",
        cards: total,
        phoneLightweight: isPhone,
        pin: !(isPhone || isPhoneStack),
        stickyRunway: isPhone || isPhoneStack,
        fogSteps: fogStepped ? FOG_STEPS : "continuous",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "ex-stack-scroll",
          trigger: section,
          start: "top top",
          end: isPhoneStack ? "bottom bottom" : `+=${scrollSpan * 100}%`,
          /*
           * Narrow/phone: CSS sticky section height is the runway.
           * Desktop: short scrub lag — long lag felt rubbery/glitchy on settle.
           */
          scrub: isPhoneStack ? true : 0.25,
          /*
           * Narrow screens use a CSS-sticky viewport inside a tall section.
           * Preserves landmark storytelling without a GSAP pin spacer
           * (unstable during mobile browser toolbar resizing).
           */
          pin: isPhone || isPhoneStack ? false : viewport,
          pinSpacing: !(isPhone || isPhoneStack),
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: !isPhone,
          onToggle: (self) => {
            section.classList.toggle("is-fog-active", self.isActive);
            if (!self.isActive) {
              cards.forEach((card) =>
                clearFogWillChange(card, getCardMedia(card)),
              );
            }
          },
          /* Keep pinned width stable — no 100vw recalculation on pin */
          onRefresh: (self) => {
            const pin = self.pin as HTMLElement | null;
            if (!pin) return;
            gsap.set(pin, {
              x: 0,
              left: 0,
              marginLeft: 0,
              clearProps: "marginRight",
            });
          },
        },
      });
      if (tl.scrollTrigger) trackTrigger(tl.scrollTrigger);

      /* Gold invitation rises quickly, then first landmark fog-covers it */
      if (silkChars.length) {
        const silkDuration = introText * 0.55;
        if (isPhone) {
          /* Word-level rise — same motion, far fewer staggered nodes */
          const words: HTMLElement[][] = [];
          let bucket: HTMLElement[] = [];
          silkChars.forEach((el) => {
            const text = el.textContent ?? "";
            if (text === "\u00A0" || text === " " || text.trim() === "") {
              if (bucket.length) {
                words.push(bucket);
                bucket = [];
              }
              return;
            }
            bucket.push(el);
          });
          if (bucket.length) words.push(bucket);
          const wordCount = Math.max(1, words.length);
          const silkStagger =
            wordCount > 1 ? (introText * 0.45) / (wordCount - 1) : 0;
          words.forEach((wordChars, wi) => {
            tl.fromTo(
              wordChars,
              { x: 0, y: 0, xPercent: 0, yPercent: 100, opacity: 0 },
              {
                x: 0,
                y: 0,
                xPercent: 0,
                yPercent: 0,
                opacity: 1,
                ease: "none",
                duration: silkDuration,
                force3D: true,
              },
              wi * silkStagger,
            );
          });
        } else {
          const silkStagger =
            silkChars.length > 1
              ? (introText * 0.45) / (silkChars.length - 1)
              : 0;
          tl.fromTo(
            silkChars,
            { x: 0, y: 0, xPercent: 0, yPercent: 100, opacity: 0 },
            {
              x: 0,
              y: 0,
              xPercent: 0,
              yPercent: 0,
              opacity: 1,
              ease: "none",
              duration: silkDuration,
              stagger: silkStagger,
              force3D: true,
            },
            0,
          );
        }
      }

      const firstCard = cards[0];
      const firstMedia = getCardMedia(firstCard);
      const firstFog = { edge: 0, reveal: 0 };
      const introFogAt = introText + introHold;
      tl.fromTo(
        firstFog,
        { edge: 0, reveal: 0 },
        {
          edge: FOG_RANGE,
          reveal: 1,
          ease: "none",
          duration: introFog,
          onStart: () => {
            firstCard.style.willChange = "opacity";
            if (firstMedia) firstMedia.style.willChange = "transform";
          },
          onUpdate: () => {
            const edge = quantiseFogEdge(firstFog.edge, fogStepped);
            firstCard.style.setProperty("--stack-fog-edge", `${edge}%`);
            /* Linear reveal — *1.8 saturated early and flickered at the lip */
            const op = Math.min(1, Math.max(0, firstFog.reveal));
            firstCard.style.opacity = String(op);
            if (op > 0.02) firstCard.style.visibility = "visible";
          },
          onComplete: () => clearFogWillChange(firstCard, firstMedia),
        },
        introFogAt,
      );

      if (firstMedia) {
        tl.fromTo(
          firstMedia,
          { scale: 1.06, yPercent: 3.5, x: 0 },
          {
            scale: 1.04,
            yPercent: 0,
            x: 0,
            ease: "none",
            duration: introFog,
          },
          introFogAt,
        );
      }

      const firstPanel = copyPanels[0];
      if (firstPanel) {
        tl.fromTo(
          firstPanel,
          { autoAlpha: 0, y: 0, visibility: "visible" },
          {
            autoAlpha: 1,
            y: 0,
            ease: "none",
            duration: introFog * 0.55,
            onStart: () => {
              firstPanel.setAttribute("aria-hidden", "false");
              setStackPager(0);
            },
          },
          introFogAt + introFog * 0.4,
        );
        scrubStackChars(
          tl,
          firstPanel,
          introFogAt + introFog * 0.4,
          introFog * 0.55,
          "in",
        );
      }

      if (pager) {
        tl.fromTo(
          pager,
          { autoAlpha: 0, visibility: "visible" },
          {
            autoAlpha: 1,
            ease: "none",
            duration: introFog * 0.45,
          },
          introFogAt + introFog * 0.4,
        );
      }

      for (let i = 1; i < total; i++) {
        const moveAt = introSpan + (i - 1) * (move + dwell) + dwell;
        const card = cards[i];
        const media = getCardMedia(card);
        const prevPanel = copyPanels[i - 1];
        const nextPanel = copyPanels[i];

        /* Fog dissolve: next image rises through soft edge — same as campaign CTA */
        const fog = { edge: 0, reveal: 0 };
        tl.fromTo(
          fog,
          { edge: 0, reveal: 0 },
          {
            edge: FOG_RANGE,
            reveal: 1,
            ease: "none",
            duration: move,
            onStart: () => {
              card.style.willChange = "opacity";
              if (media) media.style.willChange = "transform";
            },
            onUpdate: () => {
              const edge = quantiseFogEdge(fog.edge, fogStepped);
              card.style.setProperty("--stack-fog-edge", `${edge}%`);
              /* Opacity only — linear reveal avoids lip flicker */
              const op = Math.min(1, Math.max(0, fog.reveal));
              card.style.opacity = String(op);
              if (op > 0.02) card.style.visibility = "visible";
            },
            onComplete: () => clearFogWillChange(card, media),
          },
          moveAt,
        );

        if (media) {
          tl.fromTo(
            media,
            { scale: 1.08, yPercent: 4.5, x: 0 },
            {
              scale: 1.035,
              yPercent: 0,
              x: 0,
              ease: "none",
              duration: move,
            },
            moveAt,
          );
        }

        /* Copy stays readable through dwell, then crossfades mid-wipe */
        if (prevPanel && nextPanel) {
          tl.to(
            prevPanel,
            {
              autoAlpha: 0,
              y: 0,
              ease: "none",
              duration: move * 0.48,
              onStart: () => prevPanel.setAttribute("aria-hidden", "true"),
              onReverseComplete: () => {
                prevPanel.setAttribute("aria-hidden", "false");
                setStackPager(i - 1);
              },
            },
            moveAt + move * 0.12,
          );
          scrubStackChars(
            tl,
            prevPanel,
            moveAt + move * 0.12,
            move * 0.48,
            "out",
          );

          tl.fromTo(
            nextPanel,
            { autoAlpha: 0, y: 0, visibility: "visible" },
            {
              autoAlpha: 1,
              y: 0,
              ease: "none",
              duration: move * 0.58,
              onStart: () => {
                nextPanel.setAttribute("aria-hidden", "false");
                setStackPager(i);
              },
              onReverseComplete: () =>
                nextPanel.setAttribute("aria-hidden", "true"),
            },
            moveAt + move * 0.38,
          );
          scrubStackChars(
            tl,
            nextPanel,
            moveAt + move * 0.38,
            move * 0.58,
            "in",
          );
        }

        /*
         * Phone: only dim the immediately previous scene (active + previous).
         * Desktop/tablet: keep full depth stack for luxury layering.
         */
        const underStart = isPhone ? i - 1 : 0;
        for (let j = Math.max(0, underStart); j < i; j++) {
          const depth = i - j;
          const underCard = cards[j];
          const underMedia = getCardMedia(underCard);

          /* Keep full-bleed coverage — dim via opacity (filter:brightness thrashed GPU) */
          tl.to(
            underCard,
            {
              yPercent: 0,
              x: 0,
              xPercent: 0,
              scale: 1,
              opacity: Math.max(0.72, 1 - depth * 0.08),
              filter: "brightness(1)",
              ease: "none",
              duration: move,
            },
            moveAt,
          );

          if (underMedia) {
            tl.to(
              underMedia,
              {
                scale: 1.035 + depth * 0.01,
                yPercent: 0,
                x: 0,
                ease: "none",
                duration: move,
              },
              moveAt,
            );
          }
        }
      }

      tl.to({}, { duration: release });

      if (process.env.NODE_ENV !== "production") {
        const stageRanges = Array.from({ length: total }, (_, index) => {
          if (index === 0) {
            return {
              card: 1,
              rise: [introFogAt, introFogAt + introFog],
              dwell: [introFogAt + introFog, introSpan + dwell],
            };
          }
          const riseStart = introSpan + (index - 1) * (move + dwell) + dwell;
          return {
            card: index + 1,
            rise: [riseStart, riseStart + move],
            dwell: [riseStart + move, riseStart + move + dwell],
          };
        });
        console.info("[fog-stage-ranges]", {
          cards: cards.length,
          copyPanels: copyPanels.length,
          timelineStages: stageRanges.length,
          introRange: [0, introSpan],
          stages: stageRanges,
          finalDwellRange: [introSpan + (total - 1) * (move + dwell) + move, introSpan + total * (move + dwell)],
          releaseRange: [introSpan + total * (move + dwell), scrollSpan],
        });
      }
    };

    let active = true;
    let lastStackWidth = window.innerWidth;
    let fogRebuildCount = 0;
    let fogRebuildDuringActiveScroll = 0;
    document.fonts.ready.then(() => {
      if (!active) return;
      build();
      requestScrollRefresh("ex-stack-font-ready");
    });

    let resizeTimer: ReturnType<typeof setTimeout>;
    const viewportEvent = isNarrowViewport ? "orientationchange" : "resize";
    const onViewportChange = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!active) return;
        if (isPhone) {
          const w = window.innerWidth;
          if (Math.abs(w - lastStackWidth) < 20) return;
          lastStackWidth = w;
        }
        fogRebuildCount += 1;
        if (process.env.NODE_ENV !== "production") {
          const debug = (
            window as Window & {
              __hathorRefreshDebug?: { lastActiveAt?: number };
              __hathorFogDebug?: {
                rebuilds: number;
                rebuildsDuringActiveScroll: number;
              };
            }
          ).__hathorRefreshDebug;
          if (Date.now() - Number(debug?.lastActiveAt || 0) < 180) {
            fogRebuildDuringActiveScroll += 1;
          }
          (
            window as Window & {
              __hathorFogDebug?: {
                rebuilds: number;
                rebuildsDuringActiveScroll: number;
              };
            }
          ).__hathorFogDebug = {
            rebuilds: fogRebuildCount,
            rebuildsDuringActiveScroll: fogRebuildDuringActiveScroll,
          };
        }
        build();
        requestScrollRefresh("ex-stack-viewport-change");
      }, isPhone ? 250 : 200);
    };
    window.addEventListener(viewportEvent, onViewportChange);
    motionCleanups.push(() => {
      active = false;
      clearTimeout(resizeTimer);
      window.removeEventListener(viewportEvent, onViewportChange);
      killExisting();
    });
  }

  /* -------------------------------------------------------
   * Home text story — Way of Life → Dining stacked scrub
   * Media above, copy below; fog image swap + rising text
   * ----------------------------------------------------- */
  function initHomeTextStory() {
    const section = document.querySelector<HTMLElement>(".home-story");
    const viewport = section?.querySelector<HTMLElement>(".home-story__viewport");
    const cards = gsap.utils.toArray<HTMLElement>(".home-story__card");
    const panels = gsap.utils.toArray<HTMLElement>(".home-story__panel");
    const pager = section?.querySelector<HTMLElement>("[data-home-story-pager]");
    const pagerNum = section?.querySelector<HTMLElement>(
      "[data-home-story-pager-num]",
    );
    const pagerLine = section?.querySelector<HTMLElement>(
      "[data-home-story-pager-line]",
    );
    if (!section || !viewport || cards.length < 1) return;

    section.setAttribute("data-mobile-fog-rise", "");
    section.classList.add("signature-fog-rise");

    const FOG_STEPS = 56;
    const FOG_RANGE = 140;
    const quantiseFogEdge = (edge: number, stepped: boolean) => {
      if (!stepped) return edge;
      const step = FOG_RANGE / FOG_STEPS;
      return Math.round(edge / step) * step;
    };

    const clearFogWillChange = (
      card: HTMLElement,
      media: HTMLElement | null,
    ) => {
      card.style.willChange = "auto";
      if (media) media.style.willChange = "auto";
    };

    const setPager = (index: number) => {
      const safe = Math.max(0, Math.min(index, cards.length - 1));
      if (pagerNum) {
        pagerNum.textContent = String(safe + 1).padStart(2, "0");
      }
      if (pagerLine) {
        const progress = (safe + 1) / cards.length;
        pagerLine.style.transform = `scaleY(${progress})`;
      }
    };

    const getCardMedia = (card: HTMLElement) =>
      card.querySelector<HTMLElement>(".home-story__card-media img");

    panels.forEach((panel) => {
      const targets = panel.querySelectorAll<HTMLElement>(
        lightenDevice
          ? ".home-story__title-line"
          : ".home-story__title-line, .home-story__body",
      );
      const chars: HTMLElement[] = [];
      targets.forEach((el) => {
        chars.push(
          ...(lightenDevice ? splitAtelierWords(el) : splitAtelierText(el)),
        );
      });
      (panel as HTMLElement & { __stackChars?: HTMLElement[] }).__stackChars =
        chars;
    });

    if (prefersReduced) {
      cards.forEach((card, index) => {
        gsap.set(card, {
          autoAlpha: index === 0 ? 1 : 0,
          "--stack-fog-edge": index === 0 ? "140%" : "0%",
        });
      });
      panels.forEach((panel) => {
        const chars =
          (panel as HTMLElement & { __stackChars?: HTMLElement[] })
            .__stackChars;
        gsap.set(panel, { autoAlpha: 1, visibility: "visible" });
        if (chars?.length) gsap.set(chars, { yPercent: 0, opacity: 1 });
        panel.setAttribute("aria-hidden", "false");
      });
      if (pager) gsap.set(pager, { autoAlpha: 0 });
      setPager(0);
      return;
    }

    const killExisting = () => {
      ScrollTrigger.getAll().forEach((st) => {
        const id = st.vars && String(st.vars.id || "");
        if (id.startsWith("home-story")) st.kill();
      });
    };

    const build = () => {
      killExisting();

      const total = cards.length;
      const dwell = 0.55;
      const move = 0.85;
      const release = 0.55;
      const introHold = 0.12;
      const introFog = 0.55;
      const introSpan = introHold + introFog;
      const scrollSpan =
        total <= 1
          ? introSpan + dwell + release
          : introSpan + total * (move + dwell) + release;
      const fogStepped = isPhone || lightenDevice;
      const stickyRunway = isPhone || isNarrowViewport;

      cards.forEach((card, index) => {
        const media = getCardMedia(card);
        gsap.set(card, {
          zIndex: index + 1,
          yPercent: 0,
          scale: 1,
          filter: "brightness(1)",
          "--stack-fog-edge": "0%",
          autoAlpha: 0,
          force3D: true,
        });
        if (media) {
          gsap.set(media, {
            scale: index === 0 ? 1.08 : 1.1,
            yPercent: index === 0 ? 3 : 4,
            force3D: true,
          });
        }
      });

      panels.forEach((panel) => {
        const chars =
          (panel as HTMLElement & { __stackChars?: HTMLElement[] })
            .__stackChars;
        gsap.set(panel, { autoAlpha: 0, visibility: "hidden" });
        if (chars?.length) {
          gsap.killTweensOf(chars);
          gsap.set(chars, { yPercent: 100, opacity: 0 });
        }
        panel.setAttribute("aria-hidden", "true");
      });

      if (pager) gsap.set(pager, { autoAlpha: 0, visibility: "hidden" });
      setPager(0);

      logPhonePerfDev({
        surface: "home-story-fog-rise",
        cards: total,
        phoneLightweight: isPhone,
        pin: !stickyRunway,
        stickyRunway,
        fogSteps: fogStepped ? FOG_STEPS : "continuous",
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "home-story-scroll",
          trigger: section,
          start: "top top",
          end: stickyRunway ? "bottom bottom" : `+=${scrollSpan * 90}%`,
          scrub: stickyRunway ? true : 0.25,
          pin: stickyRunway ? false : viewport,
          pinSpacing: !stickyRunway,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: !isPhone,
          onToggle: (self) => {
            section.classList.toggle("is-fog-active", self.isActive);
            if (!self.isActive) {
              cards.forEach((card) =>
                clearFogWillChange(card, getCardMedia(card)),
              );
            }
          },
          onRefresh: (self) => {
            const pin = self.pin as HTMLElement | null;
            if (!pin) return;
            gsap.set(pin, {
              x: 0,
              left: 0,
              marginLeft: 0,
              clearProps: "marginRight",
            });
          },
        },
      });
      if (tl.scrollTrigger) trackTrigger(tl.scrollTrigger);

      // 0.00–introHold: brief dwell before first reveal
      // introHold–introSpan: first image fog-rises + first copy rises
      const firstCard = cards[0];
      const firstMedia = getCardMedia(firstCard);
      const firstFog = { edge: 0, reveal: 0 };
      tl.fromTo(
        firstFog,
        { edge: 0, reveal: 0 },
        {
          edge: FOG_RANGE,
          reveal: 1,
          ease: "none",
          duration: introFog,
          onStart: () => {
            firstCard.style.willChange = "opacity";
            if (firstMedia) firstMedia.style.willChange = "transform";
          },
          onUpdate: () => {
            const edge = quantiseFogEdge(firstFog.edge, fogStepped);
            firstCard.style.setProperty("--stack-fog-edge", `${edge}%`);
            const op = Math.min(1, Math.max(0, firstFog.reveal));
            firstCard.style.opacity = String(op);
            if (op > 0.02) firstCard.style.visibility = "visible";
          },
          onComplete: () => clearFogWillChange(firstCard, firstMedia),
        },
        introHold,
      );

      if (firstMedia) {
        tl.fromTo(
          firstMedia,
          { scale: 1.1, yPercent: 4, x: 0 },
          {
            scale: 1.03,
            yPercent: 0,
            x: 0,
            ease: "none",
            duration: introFog,
          },
          introHold,
        );
      }

      const firstPanel = panels[0];
      if (firstPanel) {
        tl.fromTo(
          firstPanel,
          { autoAlpha: 0, visibility: "visible" },
          {
            autoAlpha: 1,
            ease: "none",
            duration: introFog * 0.55,
            onStart: () => {
              firstPanel.setAttribute("aria-hidden", "false");
              setPager(0);
            },
          },
          introHold + introFog * 0.35,
        );
        scrubStackChars(
          tl,
          firstPanel,
          introHold + introFog * 0.35,
          introFog * 0.55,
          "in",
        );
      }

      if (pager) {
        tl.fromTo(
          pager,
          { autoAlpha: 0, visibility: "visible" },
          { autoAlpha: 1, ease: "none", duration: introFog * 0.4 },
          introHold + introFog * 0.35,
        );
      }

      // Subsequent slides: image covers previous + copy rises
      for (let i = 1; i < total; i++) {
        const moveAt = introSpan + (i - 1) * (move + dwell) + dwell;
        const card = cards[i];
        const media = getCardMedia(card);
        const prevPanel = panels[i - 1];
        const nextPanel = panels[i];
        const fog = { edge: 0, reveal: 0 };

        tl.fromTo(
          fog,
          { edge: 0, reveal: 0 },
          {
            edge: FOG_RANGE,
            reveal: 1,
            ease: "none",
            duration: move,
            onStart: () => {
              card.style.willChange = "opacity";
              if (media) media.style.willChange = "transform";
            },
            onUpdate: () => {
              const edge = quantiseFogEdge(fog.edge, fogStepped);
              card.style.setProperty("--stack-fog-edge", `${edge}%`);
              const op = Math.min(1, Math.max(0, fog.reveal));
              card.style.opacity = String(op);
              if (op > 0.02) card.style.visibility = "visible";
            },
            onComplete: () => clearFogWillChange(card, media),
          },
          moveAt,
        );

        if (media) {
          tl.fromTo(
            media,
            { scale: 1.1, yPercent: 4.5, x: 0 },
            {
              scale: 1.03,
              yPercent: 0,
              x: 0,
              ease: "none",
              duration: move,
            },
            moveAt,
          );
        }

        if (prevPanel && nextPanel) {
          tl.to(
            prevPanel,
            {
              autoAlpha: 0,
              ease: "none",
              duration: move * 0.45,
              onStart: () => prevPanel.setAttribute("aria-hidden", "true"),
              onReverseComplete: () => {
                prevPanel.setAttribute("aria-hidden", "false");
                setPager(i - 1);
              },
            },
            moveAt + move * 0.12,
          );
          scrubStackChars(
            tl,
            prevPanel,
            moveAt + move * 0.12,
            move * 0.45,
            "out",
          );

          tl.fromTo(
            nextPanel,
            { autoAlpha: 0, visibility: "visible" },
            {
              autoAlpha: 1,
              ease: "none",
              duration: move * 0.55,
              onStart: () => {
                nextPanel.setAttribute("aria-hidden", "false");
                setPager(i);
              },
              onReverseComplete: () =>
                nextPanel.setAttribute("aria-hidden", "true"),
            },
            moveAt + move * 0.38,
          );
          scrubStackChars(
            tl,
            nextPanel,
            moveAt + move * 0.38,
            move * 0.55,
            "in",
          );
        }

        const underStart = isPhone ? i - 1 : 0;
        for (let j = Math.max(0, underStart); j < i; j++) {
          const depth = i - j;
          tl.to(
            cards[j],
            {
              opacity: Math.max(0.72, 1 - depth * 0.08),
              ease: "none",
              duration: move,
            },
            moveAt,
          );
        }
      }

      tl.to({}, { duration: release });
    };

    let active = true;
    let lastWidth = window.innerWidth;
    document.fonts.ready.then(() => {
      if (!active) return;
      build();
      requestScrollRefresh("home-story-font-ready");
    });

    let resizeTimer: ReturnType<typeof setTimeout>;
    const viewportEvent = isNarrowViewport ? "orientationchange" : "resize";
    const onViewportChange = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!active) return;
        if (isPhone) {
          const w = window.innerWidth;
          if (Math.abs(w - lastWidth) < 20) return;
          lastWidth = w;
        }
        build();
        requestScrollRefresh("home-story-viewport-change");
      }, isPhone ? 250 : 200);
    };
    window.addEventListener(viewportEvent, onViewportChange);
    motionCleanups.push(() => {
      active = false;
      clearTimeout(resizeTimer);
      window.removeEventListener(viewportEvent, onViewportChange);
      killExisting();
    });
  }

  /* -------------------------------------------------------
   * PATTERN B variant — Carousel sequential wipe reveal
   *   start top 50%, once, delay i*0.25
   *   clip + scale 1.5→1 duration 0.8, then chars
   *   custom lightweight carousel (no Elementor Swiper)
   * ----------------------------------------------------- */
  function initCarousel() {
    const root = document.querySelector(".home-carousel");
    if (!root) return;

    const track = root.querySelector(".carousel-track");
    const slides = Array.from(root.querySelectorAll(".carousel-slide"));
    const prevBtn = root.querySelector("[data-carousel-prev]");
    const nextBtn = root.querySelector("[data-carousel-next]");
    if (!track || !slides.length) return;

    let index = 0;
    let autoplayTimer = null;
    let revealed = false;

    if (isNarrowViewport) {
      /*
       * Native horizontal momentum is substantially smoother than translating
       * the track with GSAP on a finger drag. Arrow controls remain available,
       * while users can swipe and snap directly between cards.
       */
      gsap.set(track, { clearProps: "transform" });
      slides.forEach((slide) => {
        const container = slide.querySelector(".carousel-container");
        if (container) {
          gsap.set(container, {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            scale: 1,
          });
        }
      });
      if (nextBtn) nextBtn.style.pointerEvents = "auto";
      if (prevBtn) prevBtn.style.pointerEvents = "auto";

      let scrollFrame = 0;
      const scrollToIndex = (nextIndex) => {
        index = Math.max(0, Math.min(nextIndex, slides.length - 1));
        const target = slides[index];
        track.scrollTo({
          left: target.offsetLeft,
          behavior: prefersReduced ? "auto" : "smooth",
        });
      };
      const onNext = () => scrollToIndex(index + 1);
      const onPrev = () => scrollToIndex(index - 1);
      const onTrackScroll = () => {
        if (scrollFrame) return;
        scrollFrame = window.requestAnimationFrame(() => {
          scrollFrame = 0;
          let closest = 0;
          let closestDistance = Number.POSITIVE_INFINITY;
          slides.forEach((slide, slideIndex) => {
            const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
            if (distance < closestDistance) {
              closest = slideIndex;
              closestDistance = distance;
            }
          });
          index = closest;
        });
      };

      nextBtn?.addEventListener("click", onNext);
      prevBtn?.addEventListener("click", onPrev);
      track.addEventListener("scroll", onTrackScroll, { passive: true });
      motionCleanups.push(() => {
        window.cancelAnimationFrame(scrollFrame);
        nextBtn?.removeEventListener("click", onNext);
        prevBtn?.removeEventListener("click", onPrev);
        track.removeEventListener("scroll", onTrackScroll);
      });
      return;
    }

    function slidesPerView() {
      if (window.innerWidth >= 1025) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function maxIndex() {
      return Math.max(0, slides.length - slidesPerView());
    }

    function goTo(i, animate = true) {
      index = Math.max(0, Math.min(i, maxIndex()));
      const gap = 22;
      const slideW = slides[0].getBoundingClientRect().width;
      const x = -(index * (slideW + gap));
      if (animate) {
        gsap.to(track, { x, duration: 1.15, ease: "power3.out" });
      } else {
        gsap.set(track, { x });
      }
    }

    function startAutoplay() {
      stopAutoplay();
      if (prefersReduced) return;
      autoplayTimer = window.setInterval(() => {
        const next = index >= maxIndex() ? 0 : index + 1;
        goTo(next);
      }, 4000);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    // Sequential reveal of each card
    function initCarouselSequentialReveal() {
      if (prefersReduced) {
        revealed = true;
        if (nextBtn) nextBtn.style.pointerEvents = "auto";
        if (prevBtn) prevBtn.style.pointerEvents = "auto";
        startAutoplay();
        return;
      }

      // Disable nav until reveal finishes (matches original)
      if (nextBtn) nextBtn.style.pointerEvents = "none";
      if (prevBtn) prevBtn.style.pointerEvents = "none";

      /*
       * Only wipe the cards currently in view (3 desktop / 2 tablet / 1 phone).
       * Off-screen slides stay fully revealed so arrow/autoplay never flash
       * clipped cards — same effect, same scroll trigger, smaller scope.
       */
      const visibleCount = Math.min(slidesPerView(), slides.length);

      slides.forEach((slide, i) => {
        const container = slide.querySelector(".carousel-container");
        if (!container) return;

        if (i >= visibleCount) {
          gsap.set(container, {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            scale: 1,
          });
          return;
        }

        const delayPerSlide = 0.42;
        const startDelay = i * delayPerSlide;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 55%",
            toggleActions: "play none none none",
            once: true,
          },
          delay: startDelay,
        });

        tl.fromTo(
          container,
          { clipPath: "polygon(0 0, 0 0, 0 0, 0 0)", scale: 1.28 },
          {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            scale: 1,
            duration: 1.75,
            ease: "power3.out",
          }
        );

        /* Heading letters: initHomepageAtelierSplit */

        if (i === visibleCount - 1) {
          tl.add(() => {
            revealed = true;
            startAutoplay();
            if (root.matches(":hover")) stopAutoplay();
            if (nextBtn) nextBtn.style.pointerEvents = "auto";
            if (prevBtn) prevBtn.style.pointerEvents = "auto";
          });
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        goTo(index + 1);
        if (revealed) startAutoplay();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        goTo(index - 1);
        if (revealed) startAutoplay();
      });
    }

    root.addEventListener("mouseenter", stopAutoplay);
    root.addEventListener("mouseleave", () => {
      if (revealed) startAutoplay();
    });

    window.addEventListener("resize", () => {
      goTo(Math.min(index, maxIndex()), false);
    });

    goTo(0, false);
    initCarouselSequentialReveal();
  }

  /* -------------------------------------------------------
   * Gallery marquee — no scroll-triggered tween.
   * A fade here stacked with IG bubble pop and caused a Lenis hitch.
   * ----------------------------------------------------- */
  function initGalleryItems() {
    /* intentionally empty — marquee is CSS-visible */
  }

  /* -------------------------------------------------------
   * Testimonial cards stagger in
   * ----------------------------------------------------- */
  function initTestimonialCards() {
    if (prefersReduced) return;
    gsap.utils.toArray(".testimonial-card").forEach((card, i) => {
      gsap.from(card, {
        y: 30,
        opacity: 0,
        duration: 0.55,
        ease: "power2.out",
        delay: i * 0.08,
        scrollTrigger: {
          trigger: card,
          start: "top 92%",
          once: true,
        },
      });
    });
  }

  /* -------------------------------------------------------
   * CTA section text
   * ----------------------------------------------------- */
  function initCta() {
    if (prefersReduced) return;
    const cta = document.querySelector(".cta-inner");
    if (!cta) return;
    const btn = cta.querySelector(".btn");
    if (!btn) return;
    gsap.from(btn, {
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: "power2.out",
      scrollTrigger: {
        trigger: cta,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });
  }

  /* -------------------------------------------------------
   * Boot
   * ----------------------------------------------------- */
  function boot() {
    document.body.classList.add("has-ex-scroll-motion");
    document.documentElement.classList.add("has-ex-scroll-motion");
    // Isolate steps so one GSAP failure cannot white-screen the homepage
    // (e.g. when admin preview scroll races ScrollTrigger boot).
    const steps = [
      initNav,
      initHeroScrollStage,
      initHeroText,
      initHeroBlinds,
      initRadiusMorph,
      initRadiusSubHeading,
      initGeneralRevealImages,
      initRadiusHeadingPara,
      initCarouselHeadings,
      initCarousel,
      initGeneralButtons,
      initHomeScrollText,
      initExStackScroll,
      initHomeHelmPortal,
      initHomeTextStory,
      initHomeTextImgReveal,
      initHomeTextBlocks,
      initGalleryH2,
      initGalleryContainers,
      initGalleryItems,
      initTestimonialH2,
      initTestimonialCards,
      initCta,
    ];
    for (const step of steps) {
      try {
        step();
      } catch (error) {
        console.error(`[useExScrollMotion] ${step.name || "step"} failed`, error);
      }
    }
  }

    try {
      boot();
    } catch (error) {
      console.error("[useExScrollMotion] boot failed", error);
      document.body.classList.add("has-ex-scroll-motion");
      document.documentElement.classList.add("has-ex-scroll-motion");
    }

    const markScrollReady = () => {
      const root = document.documentElement;
      root.classList.add("ex-scroll-ready");
      root.classList.remove("ex-pending");
      root.classList.remove("ex-pending-deep");
    };

    const restoreNow = () => {
      if (savedY > 0) {
        applyScrollY(savedY);
      }
      try {
        requestScrollRefresh("ex-restore-now");
        ScrollTrigger.update();
      } catch {
        /* ignore */
      }
    };

    /* Boot finished at Y=0 — restore while logo still CSS-hidden, then reveal logo. */
    restoreNow();
    requestAnimationFrame(() => {
      restoreNow();
      requestAnimationFrame(markScrollReady);
    });

    const onLoad = () => {
      try {
        requestScrollRefresh("ex-load");
        ScrollTrigger.update();
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("load", onLoad);

    const readyFallback = window.setTimeout(markScrollReady, 600);

    return () => {
      window.clearTimeout(readyFallback);
      window.removeEventListener("load", onLoad);
      heroCleanup?.();
      helmCleanup?.();
      motionCleanups.forEach((cleanup) => cleanup());
      try {
        /* Kill only triggers owned by this homepage hook — never global getAll().kill() */
        const owned = new Set(ownedTriggerIds);
        ScrollTrigger.getAll().forEach((st) => {
          const id = String(st.vars?.id || "");
          if (owned.has(id) || id.startsWith("ex-")) {
            st.kill();
            return;
          }
          const el = st.trigger as Element | undefined;
          if (el?.closest?.(".ex-root")) {
            st.kill();
          }
        });
        logPhonePerfDev({
          surface: "ex-scroll",
          cleanupOwned: ownedTriggerIds.length,
          remaining: ScrollTrigger.getAll().length,
        });
      } catch {
        /* ignore */
      }
      document.body.classList.remove("has-ex-scroll-motion");
      document.documentElement.classList.remove("has-ex-scroll-motion");
      document.documentElement.classList.remove("ex-scroll-ready");
      document.documentElement.classList.remove("ex-pending");
      document.documentElement.classList.remove("ex-pending-deep");
      document.documentElement.classList.remove("ex-home");
    };
  }, []);
}
