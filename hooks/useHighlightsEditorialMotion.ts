"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import SplitType from "split-type";

const HIGHLIGHTS_EASE = "expo.out" as const;
const HIGHLIGHTS_SCRUB = 1;

const MOTION = {
  splitReveal: { duration: 1.25, stagger: 0.05, yPercent: 100 },
  lineReveal: { duration: 1.15, stagger: 0.06, yPercent: 100 },
  goldRule: { duration: 1.1, delay: 0.22 },
  maskReveal: { duration: 1.35 },
  parallax: { yPercent: 15 },
  reveal: { duration: 1.1, stagger: 0.07, y: 28 },
  ctaParallax: { yPercent: 12 },
} as const;

const SELECTORS = {
  intro: "[data-highlights-intro]",
  introLine: "[data-highlights-intro-line]",
  kineticTitle: "[data-kinetic-title]",
  kineticLineInner: "[data-kinetic-line]",
  goldRule: "[data-highlights-gold-rule]",
  parallaxWrap: "[data-parallax-wrap]",
  parallaxImg: "[data-parallax-img]",
  stickyScene: "[data-highlights-sticky-scene]",
  stickyCopy: "[data-highlights-sticky-copy]",
  landmarkCard: "[data-highlights-landmark-card]",
  landmarkCopy: "[data-highlights-landmark-copy]",
  reveal: "[data-highlights-reveal]",
  ctaWrap: "[data-highlights-cta-wrap]",
  ctaImg: "[data-highlights-cta-img]",
  ctaCopy: "[data-highlights-cta-copy]",
  magneticLink: "[data-magnetic-link]",
  magneticArrow: "[data-magnetic-arrow]",
} as const;

type SplitInstance = InstanceType<typeof SplitType>;

type UseHighlightsEditorialMotionOptions = {
  smoothScroll?: boolean;
  layoutDelayMs?: number;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function setupOptionalLenis(enabled: boolean) {
  if (!enabled || prefersReducedMotion()) return null;

  const lenis = new Lenis({
    duration: 1.55,
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

  return () => {
    gsap.ticker.remove(ticker);
    lenis.destroy();
  };
}

function splitTitle(title: HTMLElement, splits: SplitInstance[]) {
  const manualLines = title.querySelectorAll<HTMLElement>(
    SELECTORS.kineticLineInner,
  );

  if (manualLines.length) {
    manualLines.forEach((line) => {
      line.style.display = "block";
      line.parentElement?.style.setProperty("overflow", "hidden");
    });
    return Array.from(manualLines);
  }

  const split = new SplitType(title, {
    types: "lines,words",
    lineClass: "highlights-split-line",
    wordClass: "highlights-split-word",
  });
  splits.push(split);

  split.lines?.forEach((line) => {
    line.style.display = "block";
    line.style.overflow = "hidden";
  });

  split.words?.forEach((word) => {
    word.style.display = "inline-block";
    word.style.willChange = "transform";
  });

  return split.words ?? split.lines ?? [];
}

function revealMaskedElements(
  elements: Element[],
  trigger: Element,
  options: {
    yPercent?: number;
    stagger?: number;
    duration?: number;
    start?: string;
  } = {},
) {
  if (!elements.length) return;

  gsap.set(elements, {
    yPercent: options.yPercent ?? MOTION.splitReveal.yPercent,
    force3D: true,
  });

  gsap.to(elements, {
    yPercent: 0,
    duration: options.duration ?? MOTION.splitReveal.duration,
    stagger: options.stagger ?? MOTION.splitReveal.stagger,
    ease: HIGHLIGHTS_EASE,
    scrollTrigger: {
      trigger,
      start: options.start ?? "top 86%",
      once: true,
    },
  });
}

function setupKineticTypography(root: HTMLElement, splits: SplitInstance[]) {
  root.querySelectorAll<HTMLElement>(SELECTORS.kineticTitle).forEach((title) => {
    const revealTargets = splitTitle(title, splits);
    if (!revealTargets.length) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: title,
        start: "top 86%",
        once: true,
      },
    });

    gsap.set(revealTargets, {
      yPercent: MOTION.splitReveal.yPercent,
      force3D: true,
    });

    tl.to(revealTargets, {
      yPercent: 0,
      duration: MOTION.splitReveal.duration,
      stagger: MOTION.splitReveal.stagger,
      ease: HIGHLIGHTS_EASE,
    });

    const rule = title.parentElement?.querySelector<HTMLElement>(
      SELECTORS.goldRule,
    );

    if (rule) {
      gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });
      tl.to(
        rule,
        {
          scaleX: 1,
          duration: MOTION.goldRule.duration,
          ease: HIGHLIGHTS_EASE,
        },
        `>-${MOTION.goldRule.delay}`,
      );
    }
  });
}

function setupIntroMasks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(SELECTORS.intro).forEach((intro) => {
    const lines = Array.from(
      intro.querySelectorAll<HTMLElement>(SELECTORS.introLine),
    );
    lines.forEach((line) => {
      line.parentElement?.style.setProperty("overflow", "hidden");
    });
    revealMaskedElements(lines, intro, {
      yPercent: MOTION.lineReveal.yPercent,
      stagger: MOTION.lineReveal.stagger,
      duration: MOTION.lineReveal.duration,
    });
  });
}

function setupImageUnveils(root: HTMLElement, enableParallax: boolean) {
  root.querySelectorAll<HTMLElement>(SELECTORS.parallaxWrap).forEach((wrap) => {
    const img = wrap.querySelector<HTMLElement>(SELECTORS.parallaxImg);
    if (!img) return;

    const direction = wrap.dataset.parallaxDirection === "down" ? 1 : -1;
    const yStart = direction * -MOTION.parallax.yPercent;
    const yEnd = direction * MOTION.parallax.yPercent;

    gsap.set(wrap, {
      clipPath: "inset(100% 0 0 0)",
      willChange: "clip-path",
    });

    gsap.to(wrap, {
      clipPath: "inset(0% 0 0 0)",
      duration: MOTION.maskReveal.duration,
      ease: HIGHLIGHTS_EASE,
      scrollTrigger: {
        trigger: wrap,
        start: "top 88%",
        once: true,
      },
    });

    if (!enableParallax) {
      gsap.set(img, { yPercent: 0 });
      return;
    }

    gsap.fromTo(
      img,
      { yPercent: yStart, force3D: true },
      {
        yPercent: yEnd,
        ease: "none",
        scrollTrigger: {
          trigger: wrap,
          start: "top bottom",
          end: "bottom top",
          scrub: HIGHLIGHTS_SCRUB,
        },
      },
    );
  });
}

function setupReveals(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-highlights-reveal-group]").forEach((group) => {
    const items = Array.from(group.querySelectorAll<HTMLElement>(SELECTORS.reveal));
    if (!items.length) return;

    gsap.set(items, {
      opacity: 0,
      y: MOTION.reveal.y,
      force3D: true,
    });

    gsap.to(items, {
      opacity: 1,
      y: 0,
      duration: MOTION.reveal.duration,
      stagger: MOTION.reveal.stagger,
      ease: HIGHLIGHTS_EASE,
      scrollTrigger: {
        trigger: group,
        start: "top 82%",
        once: true,
      },
    });
  });
}

function setupStickyLandmarks(root: HTMLElement, enableSticky: boolean) {
  const scene = root.querySelector<HTMLElement>(SELECTORS.stickyScene);
  if (!scene) return;

  const copyItems = Array.from(
    scene.querySelectorAll<HTMLElement>(SELECTORS.landmarkCopy),
  );
  const cards = Array.from(
    scene.querySelectorAll<HTMLElement>(SELECTORS.landmarkCard),
  );

  const activate = (index: number) => {
    copyItems.forEach((item, itemIndex) => {
      item.dataset.active = itemIndex === index ? "true" : "false";
    });
    cards.forEach((card, cardIndex) => {
      card.dataset.active = cardIndex === index ? "true" : "false";
    });
  };

  activate(0);

  if (!enableSticky) return;

  cards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      start: "top center",
      end: "bottom center",
      onEnter: () => activate(index),
      onEnterBack: () => activate(index),
    });
  });
}

function setupCta(root: HTMLElement, enableParallax: boolean) {
  root.querySelectorAll<HTMLElement>(SELECTORS.ctaWrap).forEach((frame) => {
    const img = frame.querySelector<HTMLElement>(SELECTORS.ctaImg);
    const copy = frame.querySelector<HTMLElement>(SELECTORS.ctaCopy);

    if (img && enableParallax) {
      gsap.fromTo(
        img,
        { yPercent: -MOTION.ctaParallax.yPercent, force3D: true },
        {
          yPercent: MOTION.ctaParallax.yPercent,
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "top bottom",
            end: "bottom top",
            scrub: HIGHLIGHTS_SCRUB,
          },
        },
      );
    }

    if (!copy) return;

    const revealItems = Array.from(
      copy.querySelectorAll<HTMLElement>(SELECTORS.reveal),
    );
    gsap.set(revealItems, { opacity: 0, y: 28, force3D: true });
    gsap.to(revealItems, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.08,
      ease: HIGHLIGHTS_EASE,
      scrollTrigger: {
        trigger: frame,
        start: "top 72%",
        once: true,
      },
    });
  });
}

function setupMagneticLinks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(SELECTORS.magneticLink).forEach((link) => {
    const arrow = link.querySelector<HTMLElement>(SELECTORS.magneticArrow);
    const linkX = gsap.quickTo(link, "x", { duration: 0.65, ease: HIGHLIGHTS_EASE });
    const linkY = gsap.quickTo(link, "y", { duration: 0.65, ease: HIGHLIGHTS_EASE });
    const arrowX = arrow
      ? gsap.quickTo(arrow, "x", { duration: 0.8, ease: HIGHLIGHTS_EASE })
      : null;

    const onMove = (event: MouseEvent) => {
      const rect = link.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;

      if (Math.hypot(dx, dy) > 96) return;

      linkX(dx * 0.32);
      linkY(dy * 0.32);
      arrowX?.(dx * 0.18);
    };

    const onLeave = () => {
      linkX(0);
      linkY(0);
      arrowX?.(0);
    };

    link.addEventListener("mousemove", onMove);
    link.addEventListener("mouseleave", onLeave);

    (link as HTMLElement & { __highlightsMagneticCleanup?: () => void })
      .__highlightsMagneticCleanup = () => {
      link.removeEventListener("mousemove", onMove);
      link.removeEventListener("mouseleave", onLeave);
      gsap.set(link, { x: 0, y: 0 });
      if (arrow) gsap.set(arrow, { x: 0 });
    };
  });
}

function cleanupMagneticLinks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(SELECTORS.magneticLink).forEach((link) => {
    const el = link as HTMLElement & { __highlightsMagneticCleanup?: () => void };
    el.__highlightsMagneticCleanup?.();
    delete el.__highlightsMagneticCleanup;
  });
}

function setupEditorial(root: HTMLElement, enableDesktopMotion: boolean, splits: SplitInstance[]) {
  setupIntroMasks(root);
  setupKineticTypography(root, splits);
  setupImageUnveils(root, enableDesktopMotion);
  setupReveals(root);
  setupStickyLandmarks(root, enableDesktopMotion);
  setupCta(root, enableDesktopMotion);
  setupMagneticLinks(root);
}

export function useHighlightsEditorialMotion(
  rootRef: RefObject<HTMLElement | null>,
  options: UseHighlightsEditorialMotionOptions = {},
) {
  const { smoothScroll = false, layoutDelayMs = 120 } = options;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const splits: SplitInstance[] = [];
    const cleanupLenis = setupOptionalLenis(smoothScroll);
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(root.querySelectorAll(SELECTORS.parallaxWrap), {
          clipPath: "inset(0% 0 0 0)",
        });
        return;
      }

      ScrollTrigger.matchMedia({
        "(min-width: 768px)": () => setupEditorial(root, true, splits),
        "(max-width: 767px)": () => setupEditorial(root, false, splits),
      });
    }, root);

    const scheduleRefresh = () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, layoutDelayMs);
    };

    scheduleRefresh();
    window.addEventListener("load", scheduleRefresh);

    return () => {
      window.removeEventListener("load", scheduleRefresh);
      if (refreshTimer) clearTimeout(refreshTimer);
      cleanupMagneticLinks(root);
      ctx.revert();
      splits.forEach((split) => split.revert());
      cleanupLenis?.();
    };
  }, [rootRef, smoothScroll, layoutDelayMs]);
}
