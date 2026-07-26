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
  registerHathorLenis,
  restoreScrollPositionIfReload,
  shouldRestoreScrollOnMount,
} from "@/lib/scroll-position-restore";

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

  if (!prefersReduced) {
    lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false,
    });

    // Keep ScrollTrigger in sync with Lenis
    lenis.on("scroll", ScrollTrigger.update);
    registerHathorLenis(lenis);

    tickerFn = (time: number) => {
      lenis?.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);
  }

  /*
   * Soft nav (Suites → Home) often keeps the previous page's scrollY for a frame.
   * Mounting the hero scrub ScrollTrigger at that Y opens gold blinds + huge logo.
   * Hard reload of Home may restore a saved Y — only once, before ST mounts.
   */
  const path = window.location.pathname || "/";
  if (shouldRestoreScrollOnMount(path)) {
    restoreScrollPositionIfReload(path);
  } else {
    resetWindowScrollTop(lenis);
  }

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

  // .gallery-container — small heading chars + button
  function initGalleryContainers() {
    if (prefersReduced) return;
    document.querySelectorAll(".gallery-container").forEach((container) => {
      const btn = container.querySelector(".btn, .gallery-button");
      if (!btn) return;
      gsap.from(btn, {
        y: 20,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
          trigger: container,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    });
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
    heroCleanup = mountHeroScrollStage({ prefersReduced, lenis });
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
    /* Slow letter rise — matches the lazy stack wipe */
    const stagger =
      chars.length > 60 ? Math.min(0.028, 1.15 / chars.length) : 0.028;
    gsap.killTweensOf(chars);
    gsap.fromTo(
      chars,
      { yPercent: 100, opacity: 0 },
      {
        yPercent: 0,
        opacity: 1,
        duration: 1.05,
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
      duration: 0.7,
      stagger: 0.012,
      ease: "power2.in",
      overwrite: true,
    });
  }

  function initExStackScroll() {
    const section = document.querySelector(".ex-stack-scroll");
    const viewport = section?.querySelector(".ex-stack-scroll__viewport");
    const copyPanels = gsap.utils.toArray<HTMLElement>(
      ".ex-stack-scroll__copy-panel",
    );
    const cards = gsap.utils.toArray<HTMLElement>(".ex-stack-scroll__card");
    if (!section || !viewport || cards.length < 2) return;

    prepareStackPanelSplits(copyPanels);

    if (prefersReduced) {
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
        clipPath: "inset(0% 0% 0% 0%)",
      });
      cards.slice(1).forEach((card) => {
        gsap.set(card, { autoAlpha: 0 });
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
      /* Lazier luxury pacing — longer hold, slower eat wipe */
      const dwell = 0.72;
      const move = 0.95;
      const step = dwell + move;
      const scrollSpan = (total - 1) * step + dwell;

      cards.forEach((card, index) => {
        const media = getCardMedia(card);
        gsap.set(card, {
          zIndex: index + 1,
          /* Stay full-frame — reveal via clip so the next image eats the previous */
          yPercent: 0,
          x: 0,
          xPercent: 0,
          scale: 1,
          filter: "brightness(1)",
          clipPath:
            index === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
          WebkitClipPath:
            index === 0 ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
          autoAlpha: 1,
          force3D: true,
          clearProps: "",
        });
        if (media) {
          /* Soft ken burn — barely drifts while the wipe settles */
          gsap.set(media, {
            x: 0,
            xPercent: 0,
            scale: index === 0 ? 1.035 : 1.07,
            yPercent: index === 0 ? 0 : 4,
            force3D: true,
          });
        }
      });

      copyPanels.forEach((panel, index) => {
        const chars =
          (panel as HTMLElement & { __stackChars?: HTMLElement[] })
            .__stackChars;
        gsap.set(panel, {
          autoAlpha: index === 0 ? 1 : 0,
          y: 0,
          visibility: index === 0 ? "visible" : "hidden",
        });
        if (chars?.length) {
          gsap.killTweensOf(chars);
          gsap.set(chars, { yPercent: 100, opacity: 0 });
        }
        panel.setAttribute("aria-hidden", index === 0 ? "false" : "true");
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "ex-stack-scroll",
          trigger: section,
          start: "top top",
          end: `+=${scrollSpan * 100}%`,
          /* High scrub lag = lazy, luxurious catch-up after the wheel */
          scrub: 2.85,
          pin: viewport,
          pinSpacing: true,
          anticipatePin: 0,
          fastScrollEnd: false,
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

      /* First slide letters — play on enter, reverse on leave-back */
      ScrollTrigger.create({
        id: "ex-stack-text",
        trigger: section,
        start: "top top",
        onEnter: () => playStackSplit(copyPanels[0]),
        onEnterBack: () => playStackSplit(copyPanels[0]),
        onLeaveBack: () => reverseStackSplit(copyPanels[0]),
      });

      for (let i = 1; i < total; i++) {
        const at = (i - 1) * step;
        const moveAt = at + dwell;
        const card = cards[i];
        const media = getCardMedia(card);
        const prevPanel = copyPanels[i - 1];
        const nextPanel = copyPanels[i];

        /* Cover wipe: next image stays full-bleed and reveals upward over the last */
        tl.fromTo(
          card,
          {
            clipPath: "inset(100% 0% 0% 0%)",
            WebkitClipPath: "inset(100% 0% 0% 0%)",
            scale: 1,
            yPercent: 0,
            x: 0,
            xPercent: 0,
          },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            WebkitClipPath: "inset(0% 0% 0% 0%)",
            scale: 1,
            yPercent: 0,
            x: 0,
            xPercent: 0,
            ease: "sine.inOut",
            duration: move,
          },
          moveAt,
        );

        if (media) {
          tl.fromTo(
            media,
            { scale: 1.07, yPercent: 5, x: 0 },
            {
              scale: 1.035,
              yPercent: 0,
              x: 0,
              ease: "sine.out",
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
              ease: "sine.in",
              duration: move * 0.48,
              onStart: () => prevPanel.setAttribute("aria-hidden", "true"),
            },
            moveAt + move * 0.12,
          );
          /* Letters fall out / rise in — direction-aware for scrub reverse */
          tl.add(() => {
            const dir = tl.scrollTrigger?.direction ?? 1;
            if (dir === 1) reverseStackSplit(prevPanel);
            else playStackSplit(prevPanel);
          }, moveAt + move * 0.12);

          tl.fromTo(
            nextPanel,
            { autoAlpha: 0, y: 0, visibility: "visible" },
            {
              autoAlpha: 1,
              y: 0,
              ease: "sine.out",
              duration: move * 0.58,
              onStart: () => nextPanel.setAttribute("aria-hidden", "false"),
            },
            moveAt + move * 0.38,
          );
          tl.add(() => {
            const dir = tl.scrollTrigger?.direction ?? 1;
            if (dir === 1) playStackSplit(nextPanel);
            else reverseStackSplit(nextPanel);
          }, moveAt + move * 0.38);
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
              ease: "sine.inOut",
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
                ease: "sine.out",
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
        gsap.to(track, { x, duration: 0.7, ease: "power2.out" });
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

      slides.forEach((slide, i) => {
        const container = slide.querySelector(".carousel-container");
        if (!container) return;

        const delayPerSlide = 0.25;
        const startDelay = i * delayPerSlide;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 50%",
            toggleActions: "play none none none",
            once: true,
          },
          delay: startDelay,
        });

        tl.fromTo(
          container,
          { clipPath: "polygon(0 0, 0 0, 0 0, 0 0)", scale: 1.5 },
          {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
          }
        );

        /* Heading letters: initHomepageAtelierSplit */

        if (i === slides.length - 1) {
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
   * Gallery image soft rise (extra polish, still scroll-reveal)
   * ----------------------------------------------------- */
  function initGalleryItems() {
    if (prefersReduced) return;
    const marquee = document.querySelector(".gallery-marquee");
    if (!marquee) return;
    /* Opacity only — a transform here flattens the 3D tilted band */
    gsap.from(marquee, {
      opacity: 0,
      duration: 0.75,
      ease: "power2.out",
      scrollTrigger: {
        trigger: marquee,
        start: "top 90%",
        once: true,
      },
    });
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

    const restoreNow = () => {
      // No-op after first restore / on soft nav (gated inside helper)
      restoreScrollPositionIfReload(path);
      try {
        ScrollTrigger.refresh();
      } catch {
        /* ignore */
      }
    };
    restoreNow();
    requestAnimationFrame(restoreNow);

    const onLoad = () => {
      try {
        ScrollTrigger.refresh();
        restoreNow();
      } catch (error) {
        console.warn("[useExScrollMotion] refresh failed", error);
      }
    };
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      heroCleanup?.();
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
    };
  }, []);
}
