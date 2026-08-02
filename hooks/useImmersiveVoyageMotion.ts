"use client";

/**
 * Page-local sticky scrub for /charter + /highlights immersive stages.
 * Does NOT create Lenis — reuses the public scroll owner only.
 * Desktop ≥1025 only; narrow viewports use stacked editorial markup.
 */

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_MQ = "(min-width: 1025px)";

function setActive(
  slides: HTMLElement[],
  chapters: HTMLElement[],
  rail: HTMLElement[],
  index: number,
) {
  slides.forEach((el, i) => {
    el.classList.toggle("is-active", i === index);
  });
  chapters.forEach((el, i) => {
    el.classList.toggle("is-active", i === index);
  });
  rail.forEach((el, i) => {
    el.classList.toggle("is-active", i === index);
  });
}

function setupScrub(root: HTMLElement, scrubEl: HTMLElement) {
  const pin = scrubEl.querySelector<HTMLElement>(".iv-scrub__pin");
  const stage = scrubEl.querySelector<HTMLElement>(".iv-scrub__stage");
  const progressFill = scrubEl.querySelector<HTMLElement>(".iv-scrub__progress > i");
  const slides = gsap.utils.toArray<HTMLElement>(
    scrubEl.querySelectorAll(".iv-scrub__slide"),
  );
  const chapters = gsap.utils.toArray<HTMLElement>(
    scrubEl.querySelectorAll(".iv-scrub__chapter"),
  );
  const rail = gsap.utils.toArray<HTMLElement>(
    scrubEl.querySelectorAll(".iv-scrub__rail span"),
  );

  const count = Math.max(slides.length, chapters.length, 1);
  if (!pin || !stage || count < 2) return;

  const runwayVh = Math.round(count * 100);
  pin.style.setProperty("--iv-scrub-runway", `${runwayVh}svh`);

  setActive(slides, chapters, rail, 0);
  if (progressFill) gsap.set(progressFill, { scaleX: 0 });

  let lastIndex = 0;

  /* Callback-only ST — never set scrub without an animation (GSAP reads animation.end). */
  ScrollTrigger.create({
    trigger: pin,
    start: "top top",
    end: "bottom bottom",
    invalidateOnRefresh: true,
    onUpdate(self) {
      const p = self.progress;
      if (progressFill) gsap.set(progressFill, { scaleX: p });

      const raw = p * count;
      const index = Math.min(count - 1, Math.floor(raw + (p >= 0.999 ? 0 : 0.001)));
      /* Continuous crossfade within segment */
      const local = Math.min(1, Math.max(0, raw - index));
      slides.forEach((slide, i) => {
        if (i === index) {
          gsap.set(slide, { opacity: 1, zIndex: 2 });
        } else if (i === index + 1 && local > 0.15) {
          const fade = Math.min(1, (local - 0.15) / 0.7);
          gsap.set(slide, { opacity: fade, zIndex: 1 });
          gsap.set(slides[index], { opacity: 1 - fade * 0.85 });
        } else if (i < index) {
          gsap.set(slide, { opacity: 0, zIndex: 0 });
        } else {
          gsap.set(slide, { opacity: 0, zIndex: 0 });
        }
      });

      if (index !== lastIndex) {
        lastIndex = index;
        chapters.forEach((el, i) => {
          const on = i === index;
          el.classList.toggle("is-active", on);
          gsap.to(el, {
            opacity: on ? 1 : 0,
            y: on ? 0 : 14,
            duration: 0.35,
            ease: "power2.out",
            overwrite: "auto",
          });
        });
        rail.forEach((el, i) => el.classList.toggle("is-active", i === index));
      }
    },
  });

  /* Mild parallax on active media — continuous while pinned */
  slides.forEach((slide) => {
    const img = slide.querySelector("img");
    if (!img) return;
    gsap.fromTo(
      img,
      { scale: 1.06, yPercent: 2 },
      {
        scale: 1,
        yPercent: -2,
        ease: "none",
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.5,
        },
      },
    );
  });
}

function setupLifeAboard(root: HTMLElement) {
  const pin = root.querySelector<HTMLElement>(".iv-life__pin");
  const cards = gsap.utils.toArray<HTMLElement>(
    root.querySelectorAll(".iv-life__stage .iv-life__card"),
  );
  if (!pin || cards.length < 2) return;

  pin.style.setProperty("--iv-life-runway", `${cards.length * 95}svh`);
  cards.forEach((c, i) => c.classList.toggle("is-active", i === 0));

  let last = 0;
  ScrollTrigger.create({
    trigger: pin,
    start: "top top",
    end: "bottom bottom",
    invalidateOnRefresh: true,
    onUpdate(self) {
      const index = Math.min(
        cards.length - 1,
        Math.floor(self.progress * cards.length),
      );
      if (index === last) return;
      last = index;
      cards.forEach((c, i) => c.classList.toggle("is-active", i === index));
    },
  });
}

function setupMildParallax(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-iv-parallax]").forEach((el) => {
    const img = el.querySelector("img") ?? el;
    gsap.fromTo(
      img,
      { yPercent: -3 },
      {
        yPercent: 3,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      },
    );
  });
}

export function useImmersiveVoyageMotion(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      root
        .querySelectorAll<HTMLElement>(
          ".iv-scrub__slide, .iv-scrub__chapter, .iv-life__card",
        )
        .forEach((el, i) => {
          el.classList.add("is-active");
          gsap.set(el, { opacity: 1, clearProps: "transform" });
          if (i > 0 && el.classList.contains("iv-scrub__slide")) {
            /* keep first slide primary for reduced motion stacked view */
          }
        });
      return;
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        [DESKTOP_MQ]: () => {
          root.querySelectorAll<HTMLElement>("[data-iv-scrub]").forEach((el) => {
            setupScrub(root, el);
          });
          setupLifeAboard(root);
          setupMildParallax(root);
        },
      });
    }, root);

    requestScrollRefresh("immersive-voyage-motion");

    return () => {
      ctx.revert();
    };
  }, [rootRef]);
}
