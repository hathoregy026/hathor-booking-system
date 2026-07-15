"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const HIGHLIGHTS_EASE = "expo.out" as const;
const HIGHLIGHTS_SCRUB = 1;

const MOTION = {
  introFade: { duration: 1.1, y: 30 },
  splitReveal: { duration: 1.2, stagger: 0.08, yPercent: 100 },
  parallax: { yPercent: 10 },
  chapterReveal: { duration: 1, stagger: 0.07, y: 24 },
  goldRule: { duration: 1, delay: 0.2 },
} as const;

const SELECTORS = {
  introReveal: "[data-highlights-intro-reveal]",
  kineticTitle: "[data-kinetic-title]",
  kineticLineInner: "[data-kinetic-line]",
  goldRule: "[data-highlights-gold-rule]",
  parallaxWrap: "[data-parallax-wrap]",
  parallaxImg: "[data-parallax-img]",
  chapter: "[data-highlights-chapter]",
  chapterReveal: "[data-highlights-chapter-reveal]",
  magneticLink: "[data-magnetic-link]",
  magneticArrow: "[data-magnetic-arrow]",
} as const;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function setupIntroFade(root: HTMLElement) {
  const items = Array.from(
    root.querySelectorAll<HTMLElement>(SELECTORS.introReveal),
  );
  if (!items.length) return;

  gsap.set(items, { opacity: 0, y: MOTION.introFade.y, force3D: true });
  gsap.to(items, {
    opacity: 1,
    y: 0,
    duration: MOTION.introFade.duration,
    stagger: 0.12,
    ease: HIGHLIGHTS_EASE,
    scrollTrigger: {
      trigger: root.querySelector("[data-highlights-intro]") ?? items[0],
      start: "top 82%",
      once: true,
    },
  });
}

function setupKineticTitles(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(SELECTORS.kineticTitle).forEach((title) => {
    const lines = Array.from(
      title.querySelectorAll<HTMLElement>(SELECTORS.kineticLineInner),
    );
    if (!lines.length) return;

    lines.forEach((line) => {
      line.style.display = "block";
      line.parentElement?.style.setProperty("overflow", "hidden");
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: title.closest("[data-highlights-chapter]") ?? title,
        start: "top 84%",
        once: true,
      },
    });

    gsap.set(lines, { yPercent: MOTION.splitReveal.yPercent, force3D: true });
    tl.to(lines, {
      yPercent: 0,
      duration: MOTION.splitReveal.duration,
      stagger: MOTION.splitReveal.stagger,
      ease: HIGHLIGHTS_EASE,
    });

    const rule = title
      .closest("[data-highlights-chapter]")
      ?.querySelector<HTMLElement>(SELECTORS.goldRule);

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

function setupParallax(root: HTMLElement, enableParallax: boolean) {
  root.querySelectorAll<HTMLElement>(SELECTORS.parallaxWrap).forEach((wrap) => {
    const img = wrap.querySelector<HTMLElement>(SELECTORS.parallaxImg);
    if (!img) return;

    if (!enableParallax) {
      gsap.set(img, { yPercent: 0 });
      return;
    }

    gsap.fromTo(
      img,
      { yPercent: -MOTION.parallax.yPercent, force3D: true },
      {
        yPercent: MOTION.parallax.yPercent,
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

function setupChapterCopy(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(SELECTORS.chapter).forEach((chapter) => {
    const revealItems = Array.from(
      chapter.querySelectorAll<HTMLElement>(SELECTORS.chapterReveal),
    );
    if (!revealItems.length) return;

    gsap.set(revealItems, {
      opacity: 0,
      y: MOTION.chapterReveal.y,
      force3D: true,
    });

    gsap.to(revealItems, {
      opacity: 1,
      y: 0,
      duration: MOTION.chapterReveal.duration,
      stagger: MOTION.chapterReveal.stagger,
      ease: HIGHLIGHTS_EASE,
      scrollTrigger: {
        trigger: chapter,
        start: "top 80%",
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

function setupEditorial(root: HTMLElement, enableParallax: boolean) {
  setupIntroFade(root);
  setupKineticTitles(root);
  setupParallax(root, enableParallax);
  setupChapterCopy(root);
  setupMagneticLinks(root);
}

export function useHighlightsEditorialMotion(
  rootRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(
          [
            ...root.querySelectorAll(SELECTORS.introReveal),
            ...root.querySelectorAll(SELECTORS.chapterReveal),
            ...root.querySelectorAll(SELECTORS.kineticLineInner),
          ],
          { clearProps: "all", opacity: 1 },
        );
        return;
      }

      ScrollTrigger.matchMedia({
        "(min-width: 768px)": () => setupEditorial(root, true),
        "(max-width: 767px)": () => setupEditorial(root, false),
      });
    }, root);

    const refresh = () => {
      try {
        ScrollTrigger.refresh();
      } catch (error) {
        console.warn("[useHighlightsEditorialMotion] refresh failed", error);
      }
    };
    refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      cleanupMagneticLinks(root);
      try {
        ctx.revert();
      } catch {
        /* ignore */
      }
    };
  }, [rootRef]);
}
