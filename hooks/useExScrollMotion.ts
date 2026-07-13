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
    const hero = document.querySelector(".home-hero-container");
    const cover = document.querySelector(".home-hero-cover");
    if (!hero || !cover) return;

    const logoMark = hero.querySelector(".hero-logo-mark");
    const lineRight = hero.querySelector(".hero-line--right");
    const lineLeft = hero.querySelector(".hero-line--left");
    const cta = hero.querySelector(".hero-cta");
    const ctaText = hero.querySelector(".hero-cta-text");
    const kicker = hero.querySelector(".hero-kicker");
    const sub = hero.querySelector(".hero-sub");
    const scrollHint = hero.querySelector(".hero-scroll-hint");
    const chrome = hero.querySelectorAll(
      ".hero-side, .hero-heading, .hero-button"
    );

    document.querySelectorAll(".hero-logo-bridge").forEach((el) => el.remove());

    if (!prefersReduced && chrome.length) {
      gsap.from(chrome, {
        opacity: 0,
        y: 16,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.15,
        stagger: 0.05,
      });
    }

    /*
     * LOGO (exact):
     * - FULL-SCREEN size (CSS width ~96vw, scale 1 only)
     * - LAND: starts fully hidden under content → smoothly slides UP → stops under title
     * - SCROLL DOWN: from rest → slides DOWN behind content
     * - SCROLL UP: reverses the down path only
     * Never appears on content pages. Never "already fixed" on land.
     */
    function getLogoHiddenY() {
      const logoHeight = logoMark?.offsetHeight || window.innerHeight * 0.42;
      return logoHeight * 0.78 + window.innerHeight * 0.12;
    }

    function getLogoLandedY() {
      const ctaEl = hero.querySelector(".hero-cta");
      if (!logoMark || !ctaEl) return 0;

      const currentY = Number(gsap.getProperty(logoMark, "y")) || 0;
      gsap.set(logoMark, { y: 0, xPercent: -50, yPercent: 0 });
      const logoRect = logoMark.getBoundingClientRect();
      const ctaRect = ctaEl.getBoundingClientRect();
      const delta =
        ctaRect.top + ctaRect.height / 2 - (logoRect.top + logoRect.height / 2);
      gsap.set(logoMark, { y: currentY });
      return delta;
    }

    let landingTween = null;
    let logoReadyForScroll = false; // scrub only after landing finishes

    if (logoMark) {
      // FORCE hidden first paint — below hero bottom
      gsap.set(logoMark, {
        xPercent: -50,
        yPercent: 0,
        x: 0,
        y: getLogoHiddenY(),
        scale: 1,
        autoAlpha: 0,
        force3D: true,
        transformOrigin: "50% 50%",
      });
    }

    if (prefersReduced) {
      cover.innerHTML = "";
      if (logoMark) {
        gsap.set(logoMark, { y: getLogoLandedY(), autoAlpha: 1 });
      }
      logoReadyForScroll = true;
      return;
    }

    const killByPrefix = (prefix) => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars && String(st.vars.id || "").startsWith(prefix)) st.kill();
      });
    };

    // ---- LANDING: only time the logo goes UP ----
    const playLanding = () => {
      if (!logoMark) return;
      // Ensure we start from hidden every time
      gsap.set(logoMark, {
        xPercent: -50,
        yPercent: 0,
        x: 0,
        y: getLogoHiddenY(),
        scale: 1,
        autoAlpha: 1, // visible as it rises from under the join
      });

      landingTween = gsap.to(logoMark, {
        y: getLogoLandedY(),
        duration: 2.6,
        ease: "power2.inOut",
        delay: 0.2,
        onComplete: () => {
          logoReadyForScroll = true;
          if (logoMark) {
            gsap.set(logoMark, { y: getLogoLandedY() });
          }
          // Snap scroll timeline to "rest" start so scrub doesn't jump
          ScrollTrigger.getAll().forEach((st) => {
            if (st.vars && st.vars.id === "hero-stage") st.refresh();
          });
        },
      });
    };

    const build = () => {
      killByPrefix("hero-stage");

      if (lineRight) gsap.set(lineRight, { x: 0, opacity: 1, clearProps: "transform" });
      if (lineLeft) gsap.set(lineLeft, { x: 0, opacity: 1, clearProps: "transform" });
      if (kicker) gsap.set(kicker, { opacity: 1, y: 0 });
      if (sub) gsap.set(sub, { opacity: 1, y: 0 });
      if (scrollHint) gsap.set(scrollHint, { opacity: 1 });

      // stripes
      const w = window.innerWidth;
      let blindsCount = 48;
      if (w <= 767) blindsCount = 26;
      else if (w <= 1024) blindsCount = 36;

      const heroWidth = hero.clientWidth || w;
      const stripWidth = heroWidth / blindsCount;
      cover.innerHTML = "";
      for (let i = 0; i < blindsCount; i++) {
        const strip = document.createElement("div");
        strip.classList.add("blind-strip-v");
        strip.style.left = i * stripWidth - 0.5 + "px";
        strip.style.width = stripWidth + 1 + "px";
        strip.style.top = "0";
        strip.style.height = "100%";
        strip.style.position = "absolute";
        strip.style.transformOrigin = "left center";
        strip.style.transformStyle = "preserve-3d";
        gsap.set(strip, {
          rotationY: -90,
          opacity: 0,
          visibility: "hidden",
          force3D: true,
        });
        cover.appendChild(strip);
      }
      const strips = gsap.utils.toArray(cover.querySelectorAll(".blind-strip-v"));

      const baseW = cta ? cta.offsetWidth || 168 : 168;
      const targetW = baseW * 4;
      if (cta) gsap.set(cta, { width: baseW, height: 52 });
      if (ctaText) gsap.set(ctaText, { letterSpacing: "0.22em" });

      const titleTravel = Math.min(w * 0.38, 420);

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "hero-stage",
          trigger: hero,
          start: "top top",
          end: "+=130%",
          scrub: 1.2,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onLeave: () => {
            if (logoMark) gsap.set(logoMark, { autoAlpha: 0, y: getLogoHiddenY() });
          },
        },
      });

      // Stripes
      tl.to(
        strips,
        {
          rotationY: 0,
          opacity: 1,
          visibility: "visible",
          ease: "none",
          stagger: { each: 0.028, from: "start" },
          duration: 1,
        },
        0
      );

      // Title
      if (lineRight) {
        tl.to(lineRight, { x: titleTravel, opacity: 0, ease: "none", duration: 1 }, 0);
      }
      if (lineLeft) {
        tl.to(lineLeft, { x: -titleTravel, opacity: 0, ease: "none", duration: 1 }, 0);
      }
      if (kicker) tl.to(kicker, { opacity: 0, y: -10, ease: "none", duration: 0.65 }, 0);
      if (sub) tl.to(sub, { opacity: 0, y: 8, ease: "none", duration: 0.65 }, 0);
      if (scrollHint) tl.to(scrollHint, { opacity: 0, ease: "none", duration: 0.35 }, 0);

      // CTA stretch
      if (cta) tl.to(cta, { width: targetW, ease: "none", duration: 1 }, 0);
      if (ctaText) tl.to(ctaText, { letterSpacing: "1.15em", ease: "none", duration: 1 }, 0);

      // LOGO ON SCROLL: ONLY rest → down (never up on scroll)
      if (logoMark) {
        // If landing still running and user hasn't scrolled, keep REST as from
        // Don't force yPercent on every rebuild mid-landing unless landing done
        if (logoReadyForScroll || !(landingTween && landingTween.isActive())) {
          const landedY = getLogoLandedY();
          gsap.set(logoMark, {
            xPercent: -50,
            yPercent: 0,
            x: 0,
            y: landedY,
            scale: 1,
            autoAlpha: 1,
          });
        }

        const landedY = getLogoLandedY();
        tl.fromTo(
          logoMark,
          {
            y: landedY,
            autoAlpha: 1,
            xPercent: -50,
            x: 0,
            yPercent: 0,
            scale: 1,
          },
          {
            y: getLogoHiddenY(),
            autoAlpha: 0,
            ease: "none",
            duration: 1,
            immediateRender: false,
          },
          0
        );
      }
    };

    build();

    // Start landing AFTER first paint so logo is never "already fixed"
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const img = logoMark && logoMark.querySelector("img");
        if (img && !img.complete) {
          img.addEventListener("load", playLanding, { once: true });
          setTimeout(playLanding, 500);
        } else {
          playLanding();
        }
      });
    });

    // If user scrolls during landing: finish to rest, then let scrub take over
    if (logoMark) {
      const onFirstScroll = () => {
        if (landingTween && landingTween.isActive()) {
          landingTween.progress(1).kill();
        }
        logoReadyForScroll = true;
        if (logoMark) {
          gsap.set(logoMark, {
            y: getLogoLandedY(),
            xPercent: -50,
            x: 0,
            yPercent: 0,
            scale: 1,
            autoAlpha: 1,
          });
        }
        window.removeEventListener("wheel", onFirstScroll);
        window.removeEventListener("touchstart", onFirstScroll);
        if (lenis) lenis.off("scroll", onFirstScroll);
      };
      window.addEventListener("wheel", onFirstScroll, { passive: true });
      window.addEventListener("touchstart", onFirstScroll, { passive: true });
      if (lenis) lenis.on("scroll", onFirstScroll);
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        ScrollTrigger.refresh();
      }, 200);
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
   * EX stack scroll — fullscreen cards pile as you scroll
   * ----------------------------------------------------- */
  function initExStackScroll() {
    const section = document.querySelector(".ex-stack-scroll");
    const viewport = section?.querySelector(".ex-stack-scroll__viewport");
    const cards = gsap.utils.toArray<HTMLElement>(".ex-stack-scroll__card");
    if (!section || !viewport || cards.length < 2) return;

    if (prefersReduced) {
      gsap.set(cards, { yPercent: 0, scale: 1, filter: "brightness(1)" });
      cards.slice(1).forEach((card) => {
        gsap.set(card, { autoAlpha: 0 });
      });
      return;
    }

    const killExisting = () => {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars && String(st.vars.id || "").startsWith("ex-stack")) st.kill();
      });
    };

    const build = () => {
      killExisting();

      const total = cards.length;
      const step = 1;

      cards.forEach((card, index) => {
        gsap.set(card, {
          zIndex: index + 1,
          yPercent: index === 0 ? 0 : 100,
          scale: 1,
          filter: "brightness(1)",
          force3D: true,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          id: "ex-stack-scroll",
          trigger: section,
          start: "top top",
          end: `+=${(total - 1) * 100}%`,
          scrub: 1,
          pin: viewport,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      for (let i = 1; i < total; i++) {
        const at = (i - 1) * step;

        tl.to(
          cards[i],
          {
            yPercent: 0,
            ease: "none",
            duration: step,
          },
          at,
        );

        for (let j = 0; j < i; j++) {
          const depth = i - j;
          tl.to(
            cards[j],
            {
              scale: Math.max(0.82, 1 - depth * 0.045),
              filter: `brightness(${Math.max(0.42, 1 - depth * 0.14)})`,
              ease: "none",
              duration: step,
            },
            at,
          );
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
      if (tickerFn) gsap.ticker.remove(tickerFn);
      lenis?.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
      document.body.classList.remove("has-ex-scroll-motion");
      document.documentElement.classList.remove("has-ex-scroll-motion");
    };
  }, []);
}
