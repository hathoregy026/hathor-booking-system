"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import SplitType from "split-type";
import {
  ROOMS_EASE,
  ROOMS_MOTION,
  ROOMS_SCRUB,
  ROOMS_SELECTORS,
} from "@/lib/rooms-motion";
import { deferEditorialMotionInit } from "@/lib/defer-editorial-motion";
import { refreshPageScrollTransition } from "@/components/pages/pageScrollTransitionEngine";

type UseRoomsEditorialMotionOptions = {
  /**
   * The public PageScrollTransition already owns Lenis on /rooms.
   * Keep this off there; enable only if the rooms editorial is rendered standalone.
   */
  smoothScroll?: boolean;
  /** Wait for the page-transition sheet to settle before refreshing triggers. */
  layoutDelayMs?: number;
};

type SplitInstance = InstanceType<typeof SplitType>;

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
    ROOMS_SELECTORS.kineticLineInner,
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
    lineClass: "rooms-split-line",
    wordClass: "rooms-split-word",
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
    yPercent: options.yPercent ?? ROOMS_MOTION.splitReveal.yPercent,
    force3D: true,
  });

  gsap.to(elements, {
    yPercent: 0,
    duration: options.duration ?? ROOMS_MOTION.splitReveal.duration,
    stagger: options.stagger ?? ROOMS_MOTION.splitReveal.stagger,
    ease: ROOMS_EASE,
    scrollTrigger: {
      trigger,
      start: options.start ?? "top 86%",
      once: true,
    },
  });
}

function setupKineticTypography(root: HTMLElement, splits: SplitInstance[]) {
  root.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.kineticTitle).forEach((title) => {
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
      yPercent: ROOMS_MOTION.splitReveal.yPercent,
      force3D: true,
    });

    tl.to(revealTargets, {
      yPercent: 0,
      duration: ROOMS_MOTION.splitReveal.duration,
      stagger: ROOMS_MOTION.splitReveal.stagger,
      ease: ROOMS_EASE,
    });

    const rule = title.parentElement?.querySelector<HTMLElement>(
      ROOMS_SELECTORS.goldRule,
    );

    if (rule) {
      gsap.set(rule, { scaleX: 0, transformOrigin: "left center" });
      tl.to(
        rule,
        {
          scaleX: 1,
          duration: ROOMS_MOTION.goldRule.duration,
          ease: ROOMS_EASE,
        },
        `>-${ROOMS_MOTION.goldRule.delay}`,
      );
    }
  });
}

function setupIntroMasks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.intro).forEach((intro) => {
    const lines = Array.from(
      intro.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.introLine),
    );
    lines.forEach((line) => {
      line.parentElement?.style.setProperty("overflow", "hidden");
    });
    revealMaskedElements(lines, intro, {
      yPercent: ROOMS_MOTION.lineReveal.yPercent,
      stagger: ROOMS_MOTION.lineReveal.stagger,
      duration: ROOMS_MOTION.lineReveal.duration,
    });
  });
}

function setupImageUnveils(root: HTMLElement, enableParallax: boolean) {
  root.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.parallaxWrap).forEach((wrap) => {
    const img = wrap.querySelector<HTMLElement>(ROOMS_SELECTORS.parallaxImg);
    if (!img) return;

    const direction = wrap.dataset.parallaxDirection === "down" ? 1 : -1;
    const yStart = direction * -ROOMS_MOTION.parallax.yPercent;
    const yEnd = direction * ROOMS_MOTION.parallax.yPercent;

    gsap.set(wrap, {
      clipPath: "inset(100% 0 0 0)",
      willChange: "clip-path",
    });

    gsap.to(wrap, {
      clipPath: "inset(0% 0 0 0)",
      duration: ROOMS_MOTION.maskReveal.duration,
      ease: ROOMS_EASE,
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
          scrub: ROOMS_SCRUB,
        },
      },
    );
  });
}

function setupChapterCopy(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.chapter).forEach((chapter) => {
    const revealItems = Array.from(
      chapter.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.chapterReveal),
    );
    if (!revealItems.length) return;

    gsap.set(revealItems, {
      opacity: 0,
      y: ROOMS_MOTION.textColumn.y,
      force3D: true,
    });

    gsap.to(revealItems, {
      opacity: 1,
      y: 0,
      duration: ROOMS_MOTION.textColumn.duration,
      stagger: ROOMS_MOTION.textColumn.stagger,
      ease: ROOMS_EASE,
      scrollTrigger: {
        trigger: chapter,
        start: "top 78%",
        once: true,
      },
    });
  });
}

function setupStatsAndBento(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-rooms-stats]").forEach((row) => {
    const stats = Array.from(row.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.stat));
    if (!stats.length) return;

    gsap.set(stats, {
      opacity: 0,
      y: ROOMS_MOTION.statsFilmstrip.y,
      force3D: true,
    });

    gsap.to(stats, {
      opacity: 1,
      y: 0,
      duration: ROOMS_MOTION.statsFilmstrip.duration,
      stagger: ROOMS_MOTION.statsFilmstrip.stagger,
      ease: ROOMS_EASE,
      scrollTrigger: {
        trigger: row,
        start: "top 84%",
        once: true,
      },
    });
  });

  root.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.bento).forEach((bento) => {
    const cells = Array.from(
      bento.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.bentoCell),
    );
    if (!cells.length) return;

    gsap.set(cells, {
      opacity: 0,
      y: ROOMS_MOTION.bentoCell.y,
      force3D: true,
    });

    gsap.to(cells, {
      opacity: 1,
      y: 0,
      duration: ROOMS_MOTION.bentoCell.duration,
      stagger: ROOMS_MOTION.bentoCell.stagger,
      ease: ROOMS_EASE,
      scrollTrigger: {
        trigger: bento,
        start: "top 84%",
        once: true,
      },
    });
  });
}

function setupWelcome(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.welcome).forEach((section) => {
    const reveals = Array.from(
      section.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.welcomeReveal),
    );
    reveals.forEach((item) => item.parentElement?.style.setProperty("overflow", "hidden"));
    revealMaskedElements(reveals, section, {
      stagger: 0.08,
      duration: 1.25,
      start: "top 82%",
    });
  });
}

function setupCta(root: HTMLElement, enableParallax: boolean) {
  root.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.ctaWrap).forEach((frame) => {
    const img = frame.querySelector<HTMLElement>(ROOMS_SELECTORS.ctaImg);
    const copy = frame.querySelector<HTMLElement>(ROOMS_SELECTORS.ctaCopy);

    if (img && enableParallax) {
      gsap.fromTo(
        img,
        { yPercent: -ROOMS_MOTION.ctaParallax.yPercent, force3D: true },
        {
          yPercent: ROOMS_MOTION.ctaParallax.yPercent,
          ease: "none",
          scrollTrigger: {
            trigger: frame,
            start: "top bottom",
            end: "bottom top",
            scrub: ROOMS_SCRUB,
          },
        },
      );
    }

    if (!copy) return;

    const revealItems = Array.from(
      copy.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.chapterReveal),
    );

    gsap.set(revealItems, { opacity: 0, y: 28, force3D: true });
    gsap.to(revealItems, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.08,
      ease: ROOMS_EASE,
      scrollTrigger: {
        trigger: frame,
        start: "top 72%",
        once: true,
      },
    });
  });
}

function setupMagneticLinks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.magneticLink).forEach((link) => {
    const arrow = link.querySelector<HTMLElement>(ROOMS_SELECTORS.magneticArrow);
    const linkX = gsap.quickTo(link, "x", { duration: 0.65, ease: ROOMS_EASE });
    const linkY = gsap.quickTo(link, "y", { duration: 0.65, ease: ROOMS_EASE });
    const arrowX = arrow
      ? gsap.quickTo(arrow, "x", { duration: 0.8, ease: ROOMS_EASE })
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

    (link as HTMLElement & { __roomsMagneticCleanup?: () => void })
      .__roomsMagneticCleanup = () => {
      link.removeEventListener("mousemove", onMove);
      link.removeEventListener("mouseleave", onLeave);
      gsap.set(link, { x: 0, y: 0 });
      if (arrow) gsap.set(arrow, { x: 0 });
    };
  });
}

function cleanupMagneticLinks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.magneticLink).forEach((link) => {
    const el = link as HTMLElement & { __roomsMagneticCleanup?: () => void };
    el.__roomsMagneticCleanup?.();
    delete el.__roomsMagneticCleanup;
  });
}

function setupEditorial(root: HTMLElement, enableParallax: boolean, splits: SplitInstance[]) {
  setupIntroMasks(root);
  setupKineticTypography(root, splits);
  setupImageUnveils(root, enableParallax);
  setupChapterCopy(root);
  setupStatsAndBento(root);
  setupWelcome(root);
  setupCta(root, enableParallax);
  setupMagneticLinks(root);
}

/**
 * Site-of-the-Year style GSAP choreography for /rooms.
 * Everything is scoped to `[data-rooms-editorial]`; no homepage, cruises,
 * nav, booking, hero-video, or public.css behavior is touched.
 */
export function useRoomsEditorialMotion(
  rootRef: RefObject<HTMLElement | null>,
  options: UseRoomsEditorialMotionOptions = {},
) {
  const { smoothScroll = false, layoutDelayMs = 120 } = options;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const splits: SplitInstance[] = [];
    const cleanupLenis = setupOptionalLenis(smoothScroll);
    let cancelDeferred: (() => void) | null = null;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(root.querySelectorAll(ROOMS_SELECTORS.parallaxWrap), {
          clipPath: "inset(0% 0 0 0)",
        });
        gsap.set(
          [
            ...root.querySelectorAll(ROOMS_SELECTORS.kineticLineInner),
            ...root.querySelectorAll(ROOMS_SELECTORS.introLine),
            ...root.querySelectorAll(ROOMS_SELECTORS.chapterReveal),
            ...root.querySelectorAll(ROOMS_SELECTORS.welcomeReveal),
          ],
          { clearProps: "all" },
        );
        return;
      }

      cancelDeferred = deferEditorialMotionInit(() => {
        ScrollTrigger.matchMedia({
          "(min-width: 768px)": () => setupEditorial(root, true, splits),
          "(max-width: 767px)": () => setupEditorial(root, false, splits),
        });
      }, layoutDelayMs);
    }, root);

    const onLoad = () => {
      refreshPageScrollTransition();
      ScrollTrigger.refresh();
    };

    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      cancelDeferred?.();
      cleanupMagneticLinks(root);
      ctx.revert();
      splits.forEach((split) => split.revert());
      cleanupLenis?.();
    };
  }, [rootRef, smoothScroll, layoutDelayMs]);
}
