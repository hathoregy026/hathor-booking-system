/**
 * EX page — homepage Venetian scroll-reveal motion (GSAP, Lenis).
 * Stack-slide letter timing stays here; site-wide copy uses LuxuryTextAnimations.
 */
// @ts-nocheck
"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { mountHeroScrollStage } from "@/lib/hero-scroll-stage";
import { splitAtelierText } from "@/lib/atelier-text-split";
import {
  applyScrollY,
  claimScrollRestore,
  registerHathorLenis,
  readSavedScrollY,
  shouldRestoreScrollOnMount,
} from "@/lib/scroll-position-restore";
import { lenisMobileSafeOptions, isTouchDevice } from "@/lib/touch-device";

gsap.registerPlugin(ScrollTrigger);

function resetWindowScrollTop(lenis: Lenis | null) {
  try {
    if (lenis?.scrollTo) {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
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

  /* -------------------------------------------------------
   * 1. GSAP plugin
   * ----------------------------------------------------- */

  /* -------------------------------------------------------
   * 2. Lenis smooth scroll (site foundation)
   *    duration 1.4, expo-ish easing, no smoothTouch
   * ----------------------------------------------------- */
  let lenis: Lenis | null = null;
  let tickerFn: ((time: number) => void) | null = null;
  let heroCleanup: (() => void) | null = null;
  let helmCleanup: (() => void) | null = null;

  if (!prefersReduced) {
    // Native finger scroll on phones/tablets — Lenis + scrubbed pins = jumpy lag.
    if (!isTouchDevice()) {
      lenis = new Lenis(lenisMobileSafeOptions(1.4));

      // Keep ScrollTrigger in sync with Lenis
      lenis.on("scroll", ScrollTrigger.update);
      registerHathorLenis(lenis);

      tickerFn = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);
    } else {
      // Unlock logo immediately on real phones (critical CSS skips hide for is-touch-device)
      document.documentElement.classList.add("ex-scroll-ready");
      document.documentElement.classList.remove("ex-pending", "ex-pending-deep");
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
  resetWindowScrollTop(lenis);

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

    if (toggle) {
      toggle.addEventListener("click", () => {
        nav.classList.toggle("is-open");
        const open = nav.classList.contains("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    // Smooth anchor links via Lenis when available
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
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
      });
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

    gsap.utils.toArray(".home-text-img-parent").forEach((parent) => {
      const container = parent.querySelector(".home-text-img-container");
      if (!container) return;
      if (parent.dataset.revealInitialized) return;
      parent.dataset.revealInitialized = "true";

      gsap
        .timeline({
          scrollTrigger: {
            trigger: parent,
            start: "top 65%",
            toggleActions: "play none none none",
            once: true,
            invalidateOnRefresh: true,
          },
        })
        .fromTo(
          container,
          { clipPath: "polygon(0 0, 0 0, 0 0, 0 0)", scale: 1.5 },
          {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            scale: 1,
            duration: 1,
            ease: "power1.out",
          }
        );
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

    const isPhone = window.matchMedia("(max-width: 767px)").matches;
    const wheelOpenScale = isPhone ? 2.7 : 3.15;
    const wheelExitScale = isPhone ? 4.35 : 5.4;

    gsap.set(wheel, {
      xPercent: -50,
      yPercent: -50,
      scale: 1,
      rotation: 0,
      autoAlpha: 1,
      force3D: true,
    });
    gsap.set(media, {
      clipPath: "circle(0vmax at 50% 50%)",
      WebkitClipPath: "circle(0vmax at 50% 50%)",
    });
    gsap.set(mediaImage, { scale: 1.34, xPercent: -2.5, force3D: true });
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
          xPercent: -0.35,
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

    const update = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = gsap.utils.clamp(
        0,
        1,
        -rect.top / scrollable,
      );
      gsap.to(portalTimeline, {
        progress,
        duration: 0.85,
        ease: "power3.out",
        overwrite: true,
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    helmCleanup = () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
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
    return splitAtelierText(el);
  }

  function prepareStackPanelSplits(panels: HTMLElement[]) {
    panels.forEach((panel) => {
      const targets = panel.querySelectorAll<HTMLElement>(
        ".ex-stack-scroll__title-line, .ex-stack-scroll__eyebrow, .ex-stack-scroll__body",
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

  /** Scrub-linked letter motion — no sudden play() when a wipe settles */
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

    const staggerSpan = Math.min(duration * 0.35, 0.22);
    const each = Math.max(0.001, staggerSpan / Math.max(1, chars.length - 1));

    chars.forEach((ch, idx) => {
      if (direction === "in") {
        tl.fromTo(
          ch,
          { yPercent: 100, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            ease: "none",
            duration: duration * 0.62,
            immediateRender: false,
          },
          at + idx * each,
        );
      } else {
        tl.to(
          ch,
          {
            yPercent: 100,
            opacity: 0,
            ease: "none",
            duration: duration * 0.5,
          },
          at + idx * each,
        );
      }
    });
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
    if (!section || !viewport || cards.length < 2) return;

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
      /* Slightly tighter pacing — still elegant, less “end of page” drag */
      const dwell = 0.48;
      const move = 0.68;
      const step = dwell + move;
      /*
       * Cream invitation intro (same fog language as Take Your Voyage Today).
       * Text still rises ahead of fog; overall scroll is paced slower to read.
       */
      const introText = 0.22;
      const introHold = 0.22;
      const introFog = 0.48;
      const introSettle = 0.12;
      const introSpan = introText + introHold + introFog + introSettle;
      const scrollSpan = introSpan + (total - 1) * step + dwell;

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

      const isPhoneStack =
        window.matchMedia("(pointer: coarse)").matches ||
        window.matchMedia("(max-width: 1023px)").matches;

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "ex-stack-scroll",
          trigger: section,
          start: "top top",
          end: `+=${scrollSpan * 100}%`,
          /*
           * Lower scrub lag = less rubber-band catch-up when the wheel
           * stops, so frames sit smoothly instead of jumping into place.
           * Touch: direct scrub (no lag) — laggy scrub feels like scroll jumping.
           */
          scrub: isPhoneStack ? true : 1.15,
          pin: viewport,
          pinSpacing: true,
          anticipatePin: 1,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
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

      /* Gold invitation rises quickly, then first landmark fog-covers it */
      if (silkChars.length) {
        const silkDuration = introText * 0.55;
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

      const firstCard = cards[0];
      const firstMedia = getCardMedia(firstCard);
      const firstFog = { edge: 0, reveal: 0 };
      const introFogAt = introText + introHold;
      tl.fromTo(
        firstFog,
        { edge: 0, reveal: 0 },
        {
          edge: 140,
          reveal: 1,
          ease: "none",
          duration: introFog,
          onUpdate: () => {
            firstCard.style.setProperty(
              "--stack-fog-edge",
              `${firstFog.edge}%`,
            );
            const op = Math.min(1, Math.max(0, firstFog.reveal * 1.8));
            firstCard.style.opacity = String(op);
            if (op > 0.001) firstCard.style.visibility = "visible";
          },
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
            onStart: () => firstPanel.setAttribute("aria-hidden", "false"),
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

      for (let i = 1; i < total; i++) {
        const at = introSpan + (i - 1) * step;
        const moveAt = at + dwell;
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
            edge: 140,
            reveal: 1,
            ease: "none",
            duration: move,
            onUpdate: () => {
              card.style.setProperty("--stack-fog-edge", `${fog.edge}%`);
              /* Opacity only — visibility toggles caused settle flicker */
              const op = Math.min(1, Math.max(0, fog.reveal * 1.8));
              card.style.opacity = String(op);
              if (op > 0.001) card.style.visibility = "visible";
            },
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
              onStart: () => nextPanel.setAttribute("aria-hidden", "false"),
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

        for (let j = 0; j < i; j++) {
          const depth = i - j;
          const underCard = cards[j];
          const underMedia = getCardMedia(underCard);

          /* Keep full-bleed coverage — dim only, never shrink (scale < 1 = dark gaps) */
          tl.to(
            underCard,
            {
              yPercent: 0,
              x: 0,
              xPercent: 0,
              scale: 1,
              filter: `brightness(${Math.max(0.58, 1 - depth * 0.08)})`,
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
    };

    document.fonts.ready.then(() => {
      build();
      ScrollTrigger.refresh();
    });

    let resizeTimer: ReturnType<typeof setTimeout>;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        ScrollTrigger.refresh();
      }, 200);
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
        ScrollTrigger.refresh();
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
        ScrollTrigger.refresh();
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
      if (tickerFn) gsap.ticker.remove(tickerFn);
      registerHathorLenis(null);
      lenis?.destroy();
      try {
        ScrollTrigger.getAll().forEach((st) => st.kill());
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
