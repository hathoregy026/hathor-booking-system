"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ROOMS_EASE,
  ROOMS_MOTION,
  ROOMS_SCRUB,
  ROOMS_SELECTORS,
} from "@/lib/rooms-motion";

type UseRoomsEditorialMotionOptions = {
  /** Wait for hero sheet layout before first refresh (page scroll transition). */
  layoutDelayMs?: number;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function revealLines(
  elements: Element[],
  {
    yPercent = ROOMS_MOTION.lineReveal.yPercent,
    stagger = ROOMS_MOTION.lineReveal.stagger,
    duration = ROOMS_MOTION.lineReveal.duration,
    trigger,
  }: {
    yPercent?: number;
    stagger?: number;
    duration?: number;
    trigger: Element;
  },
) {
  if (!elements.length) return;

  gsap.set(elements, { yPercent });

  gsap.to(elements, {
    yPercent: 0,
    duration,
    stagger,
    ease: ROOMS_EASE,
    scrollTrigger: {
      trigger,
      start: "top 85%",
      once: true,
    },
  });
}

function setupKineticTitles(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.kineticTitle).forEach((title) => {
    const lines = title.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.kineticLineInner);
    if (!lines.length) return;

    gsap.set(lines, { yPercent: ROOMS_MOTION.kineticTitle.yPercent });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: title,
        start: "top 85%",
        once: true,
      },
    });

    tl.to(lines, {
      yPercent: 0,
      duration: ROOMS_MOTION.kineticTitle.duration,
      stagger: ROOMS_MOTION.kineticTitle.stagger,
      ease: ROOMS_EASE,
    });

    const rule = title.parentElement?.querySelector<HTMLElement>(ROOMS_SELECTORS.goldRule);
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

function setupIntroReveals(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-rooms-intro]").forEach((intro) => {
    const lines = intro.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.introLine);
    revealLines(Array.from(lines), { trigger: intro });
  });
}

function setupStatsFilmstrip(root: HTMLElement) {
  const rows = root.querySelectorAll<HTMLElement>("[data-rooms-stats]");
  rows.forEach((row) => {
    const stats = row.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.stat);
    if (!stats.length) return;

    gsap.set(stats, { opacity: 0, x: ROOMS_MOTION.statsFilmstrip.x });

    gsap.to(stats, {
      opacity: 1,
      x: 0,
      duration: ROOMS_MOTION.statsFilmstrip.duration,
      stagger: ROOMS_MOTION.statsFilmstrip.stagger,
      ease: ROOMS_EASE,
      scrollTrigger: {
        trigger: row,
        start: "top 82%",
        once: true,
      },
    });
  });
}

function setupParallaxChapters(root: HTMLElement, enableParallax: boolean) {
  const wraps = root.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.parallaxWrap);

  wraps.forEach((wrap, index) => {
    const img = wrap.querySelector<HTMLElement>(ROOMS_SELECTORS.parallaxImg);
    if (!img) return;

    const direction = wrap.dataset.parallaxDirection === "down" ? 1 : -1;
    const yStart = direction * -ROOMS_MOTION.parallax.yPercent;
    const yEnd = direction * ROOMS_MOTION.parallax.yPercent;

    gsap.set(wrap, { clipPath: "inset(100% 0 0 0)" });
    gsap.set(img, { yPercent: enableParallax ? yStart : 0 });

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

    if (enableParallax) {
      gsap.fromTo(
        img,
        { yPercent: yStart },
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
    }

    const textCol = wrap
      .closest<HTMLElement>("[data-rooms-chapter]")
      ?.querySelector<HTMLElement>(ROOMS_SELECTORS.chapterText);

    if (textCol) {
      const reveals = textCol.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.chapterReveal);
      if (reveals.length) {
        gsap.set(reveals, { opacity: 0, x: ROOMS_MOTION.textColumn.x });
        gsap.to(reveals, {
          opacity: 1,
          x: 0,
          duration: ROOMS_MOTION.textColumn.duration,
          stagger: ROOMS_MOTION.textColumn.stagger,
          ease: ROOMS_EASE,
          scrollTrigger: {
            trigger: wrap,
            start: "top 80%",
            once: true,
          },
        });
      }
    }

    void index;
  });
}

function setupBentoGrid(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-rooms-bento]").forEach((bento) => {
    const cells = bento.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.bentoCell);
    if (!cells.length) return;

    gsap.set(cells, { opacity: 0, y: ROOMS_MOTION.bentoCell.y });

    gsap.to(cells, {
      opacity: 1,
      y: 0,
      duration: ROOMS_MOTION.bentoCell.duration,
      stagger: ROOMS_MOTION.bentoCell.stagger,
      ease: ROOMS_EASE,
      scrollTrigger: {
        trigger: bento,
        start: "top 85%",
        once: true,
      },
    });
  });
}

function setupWelcomeSection(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-rooms-welcome]").forEach((section) => {
    const reveals = section.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.welcomeReveal);
    revealLines(Array.from(reveals), {
      trigger: section,
      stagger: 0.12,
    });

    const kinetic = section.querySelector<HTMLElement>(ROOMS_SELECTORS.kineticTitle);
    if (kinetic) {
      const lines = kinetic.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.kineticLineInner);
      if (lines.length) {
        gsap.set(lines, { yPercent: ROOMS_MOTION.kineticTitle.yPercent });
        gsap.to(lines, {
          yPercent: 0,
          duration: ROOMS_MOTION.kineticTitle.duration,
          stagger: ROOMS_MOTION.kineticTitle.stagger,
          ease: ROOMS_EASE,
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            once: true,
          },
        });
      }
    }
  });
}

function setupCtaFrame(root: HTMLElement, enableParallax: boolean) {
  root.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.ctaWrap).forEach((frame) => {
    const img = frame.querySelector<HTMLElement>(ROOMS_SELECTORS.ctaImg);
    const copy = frame.querySelector<HTMLElement>("[data-rooms-cta-copy]");

    if (img && enableParallax) {
      gsap.fromTo(
        img,
        { yPercent: -10 },
        {
          yPercent: 10,
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

    if (copy) {
      const reveals = copy.querySelectorAll<HTMLElement>(ROOMS_SELECTORS.chapterReveal);
      gsap.set(reveals, { opacity: 0, y: 20 });
      gsap.to(reveals, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.1,
        ease: ROOMS_EASE,
        scrollTrigger: {
          trigger: frame,
          start: "top 75%",
          once: true,
        },
      });
    }
  });
}

function setupMagneticLinks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-magnetic-link]").forEach((link) => {
    const arrow = link.querySelector<HTMLElement>("[data-magnetic-arrow]");
    const quickX = gsap.quickTo(link, "x", { duration: 0.4, ease: "power3.out" });
    const quickY = gsap.quickTo(link, "y", { duration: 0.4, ease: "power3.out" });
    const quickArrowX = arrow
      ? gsap.quickTo(arrow, "x", { duration: 0.6, ease: "power3.out" })
      : null;

    const onMove = (event: MouseEvent) => {
      const rect = link.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = event.clientX - cx;
      const dy = event.clientY - cy;
      const dist = Math.hypot(dx, dy);
      const radius = 80;

      if (dist > radius) return;

      const pull = 0.35;
      quickX(dx * pull);
      quickY(dy * pull);
      quickArrowX?.(dx * 0.15);
    };

    const onLeave = () => {
      quickX(0);
      quickY(0);
      quickArrowX?.(0);
    };

    link.addEventListener("mousemove", onMove);
    link.addEventListener("mouseleave", onLeave);

    (link as HTMLElement & { _roomsMagneticCleanup?: () => void })._roomsMagneticCleanup = () => {
      link.removeEventListener("mousemove", onMove);
      link.removeEventListener("mouseleave", onLeave);
      gsap.set(link, { x: 0, y: 0 });
      if (arrow) gsap.set(arrow, { x: 0 });
    };
  });
}

function cleanupMagneticLinks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-magnetic-link]").forEach((link) => {
    const el = link as HTMLElement & { _roomsMagneticCleanup?: () => void };
    el._roomsMagneticCleanup?.();
    delete el._roomsMagneticCleanup;
  });
}

function runChoreography(root: HTMLElement, enableParallax: boolean) {
  setupIntroReveals(root);
  setupKineticTitles(root);
  setupStatsFilmstrip(root);
  setupParallaxChapters(root, enableParallax);
  setupBentoGrid(root);
  setupWelcomeSection(root);
  setupCtaFrame(root, enableParallax);
  setupMagneticLinks(root);
}

/**
 * GSAP ScrollTrigger choreography for /rooms editorial content.
 * Scoped to `[data-rooms-editorial]` — does not touch hero / cruises engine.
 */
export function useRoomsEditorialMotion(
  rootRef: RefObject<HTMLElement | null>,
  options: UseRoomsEditorialMotionOptions = {},
) {
  const { layoutDelayMs = 120 } = options;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

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
          ],
          { yPercent: 0, opacity: 1, x: 0 },
        );
        return;
      }

      ScrollTrigger.matchMedia({
        "(min-width: 768px)": () => {
          runChoreography(root, true);
        },
        "(max-width: 767px)": () => {
          runChoreography(root, false);
        },
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
    };
  }, [rootRef, layoutDelayMs]);
}
