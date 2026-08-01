"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_MQ = "(min-width: 1025px)";
const TABLET_MQ = "(min-width: 481px) and (max-width: 1024px)";
const PHONE_MQ = "(max-width: 480px)";

/**
 * Highlights page motion — hero entrance + scroll-linked story chapters.
 * Desktop may pin the stories stage; tablet/phone use natural flow only.
 */
export function useHighlightsPageMotion(
  rootRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      root
        .querySelectorAll<HTMLElement>(
          "[data-hl-reveal], [data-hl-hero-line] span, [data-hl-hero-eyebrow], [data-hl-hero-chapter], [data-hl-hero-copy], [data-hl-hero-actions], [data-hl-hero-marker], [data-hl-hero-scroll], [data-hl-hero-script]",
        )
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      const img = root.querySelector<HTMLElement>("[data-hl-hero-img]");
      if (img) img.style.transform = "none";
      return;
    }

    const light = shouldLightenMotionForDevice();
    const ease = "power3.out";

    const ctx = gsap.context(() => {
      /* ── Hero entrance ── */
      const heroImg = root.querySelector<HTMLElement>("[data-hl-hero-img]");
      const overlay = root.querySelector<HTMLElement>("[data-hl-hero-overlay]");
      const eyebrow = root.querySelector<HTMLElement>("[data-hl-hero-eyebrow]");
      const chapter = root.querySelector<HTMLElement>("[data-hl-hero-chapter]");
      const lines = gsap.utils.toArray<HTMLElement>("[data-hl-hero-line]");
      const script = root.querySelector<HTMLElement>("[data-hl-hero-script]");
      const copy = root.querySelector<HTMLElement>("[data-hl-hero-copy]");
      const actions = root.querySelector<HTMLElement>("[data-hl-hero-actions]");
      const marker = root.querySelector<HTMLElement>("[data-hl-hero-marker]");
      const scrollCue = root.querySelector<HTMLElement>("[data-hl-hero-scroll]");

      if (heroImg) gsap.set(heroImg, { scale: 1.035 });
      if (overlay) gsap.set(overlay, { opacity: 0.88 });
      if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 14 });
      if (chapter) gsap.set(chapter, { opacity: 0, y: 10 });
      lines.forEach((line) => {
        const inner = line.querySelector("span") ?? line;
        gsap.set(inner, { yPercent: 108, opacity: 0 });
      });
      if (script) gsap.set(script, { opacity: 0, y: 12 });
      if (copy) gsap.set(copy, { opacity: 0, y: 16 });
      if (actions) gsap.set(actions, { opacity: 0, y: 14 });
      if (marker) gsap.set(marker, { opacity: 0 });
      if (scrollCue) gsap.set(scrollCue, { opacity: 0 });

      const heroTl = gsap.timeline({ defaults: { ease } });
      if (heroImg) {
        heroTl.to(heroImg, { scale: 1, duration: light ? 1.15 : 1.55 }, 0);
      }
      if (overlay) {
        heroTl.to(overlay, { opacity: 1, duration: 1 }, 0.08);
      }
      if (eyebrow) {
        heroTl.to(eyebrow, { opacity: 1, y: 0, duration: 0.65 }, 0.22);
      }
      if (chapter) {
        heroTl.to(chapter, { opacity: 1, y: 0, duration: 0.55 }, 0.3);
      }
      lines.forEach((line, i) => {
        const inner = line.querySelector("span") ?? line;
        heroTl.to(
          inner,
          { yPercent: 0, opacity: 1, duration: light ? 0.7 : 0.9 },
          0.35 + i * 0.11,
        );
      });
      if (script) {
        heroTl.to(script, { opacity: 1, y: 0, duration: 0.65 }, 0.65);
      }
      if (copy) {
        heroTl.to(copy, { opacity: 1, y: 0, duration: 0.7 }, 0.85);
      }
      if (actions) {
        heroTl.to(actions, { opacity: 1, y: 0, duration: 0.65 }, 1);
      }
      if (marker) {
        heroTl.to(marker, { opacity: 1, duration: 0.55 }, 1.1);
      }
      if (scrollCue) {
        heroTl.to(scrollCue, { opacity: 1, duration: 0.55 }, 1.2);
      }

      /* ── Section reveals ── */
      root.querySelectorAll<HTMLElement>("[data-hl-reveal]").forEach((el) => {
        gsap.set(el, { opacity: 0, y: light ? 20 : 34 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: light ? 0.65 : 0.9,
          ease,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      });

      /* ── Nile line stroke ── */
      const nilePath = root.querySelector<SVGPathElement>("[data-hl-nile-path]");
      if (nilePath) {
        const length = nilePath.getTotalLength();
        gsap.set(nilePath, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(nilePath, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: nilePath.closest("section") ?? nilePath,
            start: "top 80%",
            end: "top 35%",
            scrub: true,
          },
        });
      }

      ScrollTrigger.matchMedia({
        [DESKTOP_MQ]: () => setupDesktopStories(root, light),
        [TABLET_MQ]: () => setupTabletStories(root),
        [PHONE_MQ]: () => setupPhoneStories(root),
      });

      /* Interlude + CTA parallax (desktop/tablet) */
      ScrollTrigger.matchMedia({
        "(min-width: 481px)": () => {
          root
            .querySelectorAll<HTMLElement>("[data-hl-parallax-img]")
            .forEach((img) => {
              gsap.fromTo(
                img,
                { scale: 1.04, yPercent: -2 },
                {
                  scale: 1,
                  yPercent: 3,
                  ease: "none",
                  scrollTrigger: {
                    trigger: img.closest("section") ?? img,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                  },
                },
              );
            });
        },
      });
    }, root);

    const onLoad = () => requestScrollRefresh("highlights-load");
    window.addEventListener("load", onLoad);
    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(
        () => requestScrollRefresh("highlights-resize"),
        200,
      );
    };
    window.addEventListener("resize", onResize);
    requestAnimationFrame(() => requestScrollRefresh("highlights-mount"));

    return () => {
      window.removeEventListener("load", onLoad);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      ctx.revert();
    };
  }, [rootRef]);
}

function setupDesktopStories(root: HTMLElement, light: boolean) {
  const stories = root.querySelectorAll<HTMLElement>("[data-hl-story]");
  const fills = root.querySelectorAll<HTMLElement>("[data-hl-progress-fill]");
  if (!stories.length) return;

  stories.forEach((story, index) => {
    const media = story.querySelector<HTMLElement>("[data-hl-story-media]");
    const img = story.querySelector<HTMLElement>("[data-hl-story-img]");
    const copy = story.querySelector<HTMLElement>("[data-hl-story-copy]");
    const rule = story.querySelector<HTMLElement>("[data-hl-story-rule]");

    if (img) {
      gsap.fromTo(
        img,
        { scale: 1.06, yPercent: light ? 4 : 8 },
        {
          scale: 1,
          yPercent: light ? -2 : -5,
          ease: "none",
          scrollTrigger: {
            trigger: story,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }

    if (media && copy) {
      gsap.fromTo(
        media,
        { y: light ? 24 : 48 },
        {
          y: light ? -12 : -28,
          ease: "none",
          scrollTrigger: {
            trigger: story,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
      gsap.fromTo(
        copy,
        { y: light ? 16 : 32 },
        {
          y: light ? -8 : -18,
          ease: "none",
          scrollTrigger: {
            trigger: story,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }

    if (rule) {
      gsap.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: story,
            start: "top 75%",
            end: "top 45%",
            scrub: true,
          },
        },
      );
    }

    ScrollTrigger.create({
      trigger: story,
      start: "top 55%",
      end: "bottom 45%",
      onUpdate: (self) => {
        const fill = fills[index];
        if (fill) gsap.set(fill, { scaleX: self.progress });
        fills.forEach((f, i) => {
          if (i < index) gsap.set(f, { scaleX: 1 });
          if (i > index) gsap.set(f, { scaleX: 0 });
        });
      },
    });
  });
}

function setupTabletStories(root: HTMLElement) {
  const stories = root.querySelectorAll<HTMLElement>("[data-hl-story]");
  const fills = root.querySelectorAll<HTMLElement>("[data-hl-progress-fill]");

  stories.forEach((story, index) => {
    const img = story.querySelector<HTMLElement>("[data-hl-story-img]");
    const rule = story.querySelector<HTMLElement>("[data-hl-story-rule]");

    if (img) {
      gsap.fromTo(
        img,
        { scale: 1.04, yPercent: 3 },
        {
          scale: 1,
          yPercent: -2,
          ease: "none",
          scrollTrigger: {
            trigger: story,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }

    if (rule) {
      gsap.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: story,
            start: "top 80%",
            end: "top 50%",
            scrub: true,
          },
        },
      );
    }

    ScrollTrigger.create({
      trigger: story,
      start: "top 60%",
      end: "bottom 40%",
      onUpdate: (self) => {
        const fill = fills[index];
        if (fill) gsap.set(fill, { scaleX: self.progress });
        fills.forEach((f, i) => {
          if (i < index) gsap.set(f, { scaleX: 1 });
          if (i > index) gsap.set(f, { scaleX: 0 });
        });
      },
    });
  });
}

function setupPhoneStories(root: HTMLElement) {
  const stories = root.querySelectorAll<HTMLElement>("[data-hl-story]");
  const fills = root.querySelectorAll<HTMLElement>("[data-hl-progress-fill]");

  stories.forEach((story, index) => {
    const img = story.querySelector<HTMLElement>("[data-hl-story-img]");
    const title = story.querySelector<HTMLElement>("[data-hl-story-title]");
    const rule = story.querySelector<HTMLElement>("[data-hl-story-rule]");
    const body = story.querySelector<HTMLElement>("[data-hl-story-body]");

    if (img) {
      gsap.fromTo(
        img,
        { scale: 1.025, y: 28 },
        {
          scale: 1,
          y: -22,
          ease: "none",
          scrollTrigger: {
            trigger: story,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }

    if (title) {
      const inner = title.querySelector("span") ?? title;
      gsap.fromTo(
        inner,
        { yPercent: 40, opacity: 0.35 },
        {
          yPercent: 0,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: story,
            start: "top 85%",
            end: "top 55%",
            scrub: true,
          },
        },
      );
    }

    if (rule) {
      gsap.fromTo(
        rule,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: story,
            start: "top 78%",
            end: "top 55%",
            scrub: true,
          },
        },
      );
    }

    if (body) {
      gsap.fromTo(
        body,
        { opacity: 0.4, y: 12 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: story,
            start: "top 75%",
            end: "top 45%",
            scrub: true,
          },
        },
      );
    }

    ScrollTrigger.create({
      trigger: story,
      start: "top 70%",
      end: "bottom 30%",
      onUpdate: (self) => {
        const fill = fills[index];
        if (fill) gsap.set(fill, { scaleX: self.progress });
        fills.forEach((f, i) => {
          if (i < index) gsap.set(f, { scaleX: 1 });
          if (i > index) gsap.set(f, { scaleX: 0 });
        });
      },
    });
  });
}
