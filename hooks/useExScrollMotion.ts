/**
 * EX page — homepage3 Venetian scroll-reveal motion (GSAP, SplitType, Lenis).
 * Ported from assets/homepage3/venetian-scroll-clone/js/main.js
 */
// @ts-nocheck
"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import SplitType from "split-type";
import { mountHeroScrollStage } from "@/lib/hero-scroll-stage";

gsap.registerPlugin(ScrollTrigger);

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

    tickerFn = (time: number) => {
      lenis?.raf(time * 1000);
    };
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);
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

  // .radius-sub-heading — words
  function initRadiusSubHeading() {
    document.querySelectorAll(".radius-sub-heading").forEach((headingElement) => {
      const h3 = headingElement.querySelector("h3");
      if (!h3) return;
      if (prefersReduced) return;

      const split = new SplitType(h3, { types: "words" });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: headingElement,
          start: "top 80%",
        },
      });

      tl.from(split.words, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
      });
    });
  }

  // .radius-heading (chars) + .radius-p (lines) + .radius-button
  function initRadiusHeadingPara() {
    document.fonts.ready.then(() => {
      const animHeadingPara = document.querySelectorAll(".radius-heading");

      animHeadingPara.forEach((headingElement, index) => {
        const h2 = headingElement.querySelector("h2");
        const pWrap = document.querySelectorAll(".radius-p")[index];
        const p = pWrap ? pWrap.querySelector("p") : null;
        if (!h2) return;
        if (prefersReduced) return;

        const splitHeading = new SplitType(h2, { types: "chars" });
        const splitDescription = p
          ? new SplitType(p, { types: "lines" })
          : null;
        const button = headingElement.parentElement.querySelector(".radius-button");

        const headingParaTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: headingElement,
            scroller: "body",
            start: "top 80%",
          },
        });

        headingParaTimeline.from(splitHeading.chars, {
          y: 30,
          opacity: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
        });

        if (splitDescription) {
          headingParaTimeline.from(
            splitDescription.lines,
            {
              y: 20,
              opacity: 0,
              duration: 0.35,
              stagger: 0.1,
              ease: "power2.out",
            },
            "-=0.15"
          );
        }

        if (button) {
          headingParaTimeline.from(
            button,
            {
              y: 20,
              opacity: 0,
              duration: 0.4,
              ease: "power2.out",
            },
            "+=0"
          );
        }
      });
    });
  }

  // .home-carousel-h2 (chars) + .home-carousel-h3 (words)
  function initCarouselHeadings() {
    const animElements = document.querySelectorAll(".home-carousel-h2");

    animElements.forEach((headingElement, index) => {
      const h2 = headingElement.querySelector("h2");
      const h3Wrap = document.querySelectorAll(".home-carousel-h3")[index];
      const h3 = h3Wrap ? h3Wrap.querySelector("h3") : null;
      if (!h2) return;
      if (prefersReduced) return;

      const splitH2 = new SplitType(h2, { types: "chars" });
      const splitH3 = h3 ? new SplitType(h3, { types: "words" }) : null;

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: headingElement,
          scroller: "body",
          start: "top 80%",
        },
      });

      timeline.from(splitH2.chars, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
      });

      if (splitH3) {
        timeline.from(
          splitH3.words,
          {
            y: 15,
            opacity: 0,
            duration: 0.3,
            stagger: 0.1,
            ease: "power2.out",
          },
          "-=0.2"
        );
      }
    });
  }

  // .home-scroll-h2 (chars) + .home-scroll-p (lines)
  function initHomeScrollText() {
    document.fonts.ready.then(() => {
      const animElements = document.querySelectorAll(".home-scroll-h2");

      animElements.forEach((headingElement, index) => {
        const h2 = headingElement.querySelector("h2");
        const pWrap = document.querySelectorAll(".home-scroll-p")[index];
        const p = pWrap ? pWrap.querySelector("p") : null;
        if (!h2) return;
        if (prefersReduced) return;

        const splitH2 = new SplitType(h2, { types: "chars" });
        const splitP = p ? new SplitType(p, { types: "lines" }) : null;

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: headingElement,
            scroller: "body",
            start: "top 80%",
          },
        });

        timeline.from(splitH2.chars, {
          y: 30,
          opacity: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
        });

        if (splitP) {
          timeline.from(
            splitP.lines,
            {
              y: 20,
              opacity: 0,
              duration: 0.35,
              stagger: 0.1,
              ease: "power2.out",
            },
            "-=0.15"
          );
        }
      });
    });
  }

  // .home-text-h2 (chars) + .home-text-p (lines) + .home-text-button
  function initHomeTextBlocks() {
    document.fonts.ready.then(() => {
      const animHeadingPara = document.querySelectorAll(".home-text-h2");

      animHeadingPara.forEach((headingElement, index) => {
        const h2 = headingElement.querySelector("h2");
        const pWrap = document.querySelectorAll(".home-text-p")[index];
        const p = pWrap ? pWrap.querySelector("p") : null;
        if (!h2) return;
        if (prefersReduced) return;

        const splitHeading = new SplitType(h2, { types: "chars" });
        const splitDescription = p
          ? new SplitType(p, { types: "lines" })
          : null;
        const button =
          headingElement.parentElement.querySelector(".home-text-button");

        const headingParaTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: headingElement,
            scroller: "body",
            start: "top 80%",
          },
        });

        headingParaTimeline.from(splitHeading.chars, {
          y: 30,
          opacity: 0,
          duration: 0.3,
          stagger: 0.05,
          ease: "power2.out",
        });

        if (splitDescription) {
          headingParaTimeline.from(
            splitDescription.lines,
            {
              y: 20,
              opacity: 0,
              duration: 0.35,
              stagger: 0.1,
              ease: "power2.out",
            },
            "-=0.15"
          );
        }

        if (button) {
          headingParaTimeline.from(
            button,
            {
              y: 20,
              opacity: 0,
              duration: 0.4,
              ease: "power2.out",
            },
            "+=0"
          );
        }
      });
    });
  }

  // .gallery-h2 — chars
  function initGalleryH2() {
    document.querySelectorAll(".gallery-h2").forEach((headingElement) => {
      const h2 = headingElement.querySelector("h2");
      if (!h2 || prefersReduced) return;

      const split = new SplitType(h2, { types: "chars" });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: headingElement,
          start: "top 80%",
        },
      });

      tl.from(split.chars, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
      });
    });
  }

  // .gallery-container — small heading chars + button
  function initGalleryContainers() {
    document.querySelectorAll(".gallery-container").forEach((container) => {
      const heading = container.querySelector(".gallery-sm h2");
      if (!heading || prefersReduced) return;

      const split = new SplitType(heading, { types: "chars" });
      const button = container.querySelector(".gallery-button");

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 80%",
        },
      });

      tl.from(split.chars, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
      });

      if (button) {
        tl.from(
          button,
          {
            y: 20,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out",
          },
          "+=0"
        );
      }
    });
  }

  // .testimonial-h2 — chars
  function initTestimonialH2() {
    document.querySelectorAll(".testimonial-h2").forEach((headingElement) => {
      const h2 = headingElement.querySelector("h2");
      if (!h2 || prefersReduced) return;

      const splitH2 = new SplitType(h2, { types: "chars" });
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: headingElement,
          scroller: "body",
          start: "top 80%",
        },
      });

      timeline.from(splitH2.chars, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        stagger: 0.05,
        ease: "power2.out",
      });
    });
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
   * ----------------------------------------------------- */
  function initExStackScrollText(section: Element) {
    const titleLines = section.querySelectorAll(".ex-stack-scroll__title-line");
    const body = section.querySelector(".ex-stack-scroll__body");
    const eyebrow = section.querySelector(".ex-stack-scroll__eyebrow");
    if (!titleLines.length) return;

    if (prefersReduced) return;

    ScrollTrigger.getAll().forEach((st) => {
      if (st.vars && st.vars.id === "ex-stack-text") st.kill();
    });

    const splits: Array<{ chars?: Element[]; lines?: Element[] }> = [];

    const runReveal = () => {
      gsap.killTweensOf([
        eyebrow,
        body,
        ...titleLines,
        ...splits.flatMap((s) => s.chars ?? s.lines ?? []),
      ]);

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (eyebrow) {
        gsap.set(eyebrow, { opacity: 0, y: 18 });
        tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.75 });
      }

      titleLines.forEach((line, index) => {
        const split = new SplitType(line as HTMLElement, { types: "chars" });
        splits.push(split);
        if (!split.chars?.length) return;
        gsap.set(split.chars, { opacity: 0, yPercent: 110 });
        tl.to(
          split.chars,
          {
            opacity: 1,
            yPercent: 0,
            duration: 0.7,
            stagger: 0.032,
          },
          index === 0 ? (eyebrow ? "-=0.35" : 0) : "-=0.48",
        );
      });

      if (body) {
        const splitBody = new SplitType(body as HTMLElement, { types: "lines" });
        splits.push(splitBody);
        if (splitBody.lines?.length) {
          gsap.set(splitBody.lines, { opacity: 0, y: 24 });
          tl.to(
            splitBody.lines,
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.14,
            },
            "-=0.28",
          );
        }
      }
    };

    document.fonts.ready.then(() => {
      ScrollTrigger.create({
        id: "ex-stack-text",
        trigger: section,
        start: "top top",
        onEnter: runReveal,
        onEnterBack: runReveal,
      });
    });
  }

  function initExStackScroll() {
    const section = document.querySelector(".ex-stack-scroll");
    const viewport = section?.querySelector(".ex-stack-scroll__viewport");
    const copy = section?.querySelector(".ex-stack-scroll__copy");
    const cards = gsap.utils.toArray<HTMLElement>(".ex-stack-scroll__card");
    if (!section || !viewport || cards.length < 2) return;

    initExStackScrollText(section);

    if (prefersReduced) {
      gsap.set(cards, { yPercent: 0, scale: 1, filter: "brightness(1)" });
      cards.slice(1).forEach((card) => {
        gsap.set(card, { autoAlpha: 0 });
      });
      return;
    }

    const killExisting = () => {
      ScrollTrigger.getAll().forEach((st) => {
        const id = st.vars && String(st.vars.id || "");
        if (id.startsWith("ex-stack-scroll") || id === "ex-stack-copy") st.kill();
      });
    };

    const getCardMedia = (card: HTMLElement) =>
      card.querySelector<HTMLElement>(".ex-stack-scroll__card-media img");

    const build = () => {
      killExisting();

      const total = cards.length;
      const step = 1;
      const scrollSpan = (total - 1) * step;

      cards.forEach((card, index) => {
        const media = getCardMedia(card);
        gsap.set(card, {
          zIndex: index + 1,
          yPercent: index === 0 ? 0 : 108,
          scale: 1,
          filter: "brightness(1)",
          force3D: true,
        });
        if (media) {
          gsap.set(media, { scale: index === 0 ? 1.06 : 1.14, force3D: true });
        }
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "ex-stack-scroll",
          trigger: section,
          start: "top top",
          end: `+=${scrollSpan * 100}%`,
          scrub: 1.65,
          pin: viewport,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      if (copy) {
        tl.fromTo(
          copy,
          { y: 0, opacity: 1 },
          { y: -28, opacity: 0.92, ease: "none", duration: scrollSpan },
          0,
        );
      }

      for (let i = 1; i < total; i++) {
        const at = (i - 1) * step;
        const card = cards[i];
        const media = getCardMedia(card);

        tl.fromTo(
          card,
          { yPercent: 108, scale: 1.04 },
          { yPercent: 0, scale: 1, ease: "none", duration: step },
          at,
        );

        if (media) {
          tl.fromTo(
            media,
            { scale: 1.16 },
            { scale: 1.05, ease: "none", duration: step },
            at,
          );
        }

        for (let j = 0; j < i; j++) {
          const depth = i - j;
          const underCard = cards[j];
          const underMedia = getCardMedia(underCard);

          tl.to(
            underCard,
            {
              yPercent: -4 * depth,
              scale: Math.max(0.86, 1 - depth * 0.038),
              filter: `brightness(${Math.max(0.48, 1 - depth * 0.12)})`,
              ease: "none",
              duration: step,
            },
            at,
          );

          if (underMedia) {
            tl.to(
              underMedia,
              {
                scale: 1.05 + depth * 0.02,
                ease: "none",
                duration: step,
              },
              at,
            );
          }
        }
      }
    };

    build();

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

        const headingWrapper = container.querySelector(".carousel-heading");
        if (!headingWrapper) return;

        const heading = headingWrapper.querySelector("h2");
        if (!heading) return;

        const split = new SplitType(heading, { types: "chars" });
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

        tl.from(
          split.chars,
          {
            y: 30,
            opacity: 0,
            duration: 0.3,
            stagger: 0.05,
            ease: "power2.out",
          },
          "-=0.3"
        );

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
    gsap.utils.toArray(".gallery-item").forEach((item, i) => {
      gsap.from(item, {
        y: 40,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        delay: (i % 5) * 0.08,
        scrollTrigger: {
          trigger: item,
          start: "top 90%",
          once: true,
        },
      });
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
    const cta = document.querySelector(".cta-inner");
    if (!cta || prefersReduced) return;

    const h2 = cta.querySelector("h2");
    const p = cta.querySelector("p");
    const btn = cta.querySelector(".btn");

    if (h2) {
      const split = new SplitType(h2, { types: "chars" });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cta,
          start: "top 80%",
        },
      });
      tl.from(split.chars, {
        y: 30,
        opacity: 0,
        duration: 0.3,
        stagger: 0.04,
        ease: "power2.out",
      });
      if (p) {
        tl.from(
          p,
          { y: 20, opacity: 0, duration: 0.4, ease: "power2.out" },
          "-=0.1"
        );
      }
      if (btn) {
        tl.from(
          btn,
          { y: 20, opacity: 0, duration: 0.4, ease: "power2.out" },
          "+=0"
        );
      }
    }
  }

  /* -------------------------------------------------------
   * Boot
   * ----------------------------------------------------- */
  function boot() {
    document.body.classList.add("has-ex-scroll-motion");
    document.documentElement.classList.add("has-ex-scroll-motion");
    initNav();
    initHeroScrollStage();
    initHeroText();
    initHeroBlinds();
    initRadiusMorph();
    initRadiusSubHeading();
    initGeneralRevealImages();
    initRadiusHeadingPara();
    initCarouselHeadings();
    initCarousel();
    initGeneralButtons();
    initHomeScrollText();
    initExStackScroll();
    initHomeTextImgReveal();
    initHomeTextBlocks();
    initGalleryH2();
    initGalleryContainers();
    initGalleryItems();
    initTestimonialH2();
    initTestimonialCards();
    initCta();
  }

    boot();

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      heroCleanup?.();
      if (tickerFn) gsap.ticker.remove(tickerFn);
      lenis?.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      document.body.classList.remove("has-ex-scroll-motion");
      document.documentElement.classList.remove("has-ex-scroll-motion");
    };
  }, []);
}
