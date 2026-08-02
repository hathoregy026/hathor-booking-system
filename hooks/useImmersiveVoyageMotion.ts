"use client";

/**
 * Page-local sticky scrub for /charter + /highlights immersive stages.
 * Uses native scroll listeners (no ScrollTrigger.create) to avoid GSAP
 * refresh recursion crashes with CSS-sticky runways.
 * Does NOT create Lenis — reuses the public scroll owner only.
 * Desktop ≥1025 only; narrow viewports use stacked editorial markup.
 */

import { useLayoutEffect, type RefObject } from "react";

const DESKTOP_MQ = "(min-width: 1025px)";

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function progressThroughPin(pin: HTMLElement): number {
  const total = pin.offsetHeight - window.innerHeight;
  if (total <= 1) return 0;
  const scrolled = -pin.getBoundingClientRect().top;
  return clamp01(scrolled / total);
}

function setupScrub(scrubEl: HTMLElement, cleanups: Array<() => void>) {
  const pin = scrubEl.querySelector<HTMLElement>(".iv-scrub__pin");
  const stage = scrubEl.querySelector<HTMLElement>(".iv-scrub__stage");
  const progressFill = scrubEl.querySelector<HTMLElement>(
    ".iv-scrub__progress > i",
  );
  const slides = Array.from(
    scrubEl.querySelectorAll<HTMLElement>(".iv-scrub__slide"),
  );
  const chapters = Array.from(
    scrubEl.querySelectorAll<HTMLElement>(".iv-scrub__chapter"),
  );
  const rail = Array.from(
    scrubEl.querySelectorAll<HTMLElement>(".iv-scrub__rail span"),
  );

  const count = Math.max(slides.length, chapters.length, 1);
  if (!pin || !stage || count < 2) return;

  pin.style.setProperty("--iv-scrub-runway", `${Math.round(count * 100)}svh`);

  slides.forEach((el, i) => el.classList.toggle("is-active", i === 0));
  chapters.forEach((el, i) => el.classList.toggle("is-active", i === 0));
  rail.forEach((el, i) => el.classList.toggle("is-active", i === 0));
  if (progressFill) progressFill.style.transform = "scaleX(0)";

  let lastIndex = 0;
  let raf = 0;

  const apply = () => {
    raf = 0;
    const p = progressThroughPin(pin);
    if (progressFill) progressFill.style.transform = `scaleX(${p})`;

    const raw = p * count;
    const index = Math.min(
      count - 1,
      Math.floor(raw + (p >= 0.999 ? 0 : 0.001)),
    );
    const local = clamp01(raw - index);

    slides.forEach((slide, i) => {
      if (i === index) {
        slide.style.opacity = "1";
        slide.style.zIndex = "2";
        slide.classList.add("is-active");
      } else if (i === index + 1 && local > 0.15) {
        const fade = Math.min(1, (local - 0.15) / 0.7);
        slide.style.opacity = String(fade);
        slide.style.zIndex = "1";
        slide.classList.toggle("is-active", fade > 0.5);
        const current = slides[index];
        if (current) current.style.opacity = String(1 - fade * 0.85);
      } else {
        slide.style.opacity = "0";
        slide.style.zIndex = "0";
        slide.classList.remove("is-active");
      }
    });

    if (index !== lastIndex) {
      lastIndex = index;
      chapters.forEach((el, i) => {
        const on = i === index;
        el.classList.toggle("is-active", on);
        el.style.opacity = on ? "1" : "0";
        el.style.transform = on ? "none" : "translateY(14px)";
      });
      rail.forEach((el, i) => el.classList.toggle("is-active", i === index));
    }
  };

  const onScroll = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(apply);
  };

  apply();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  cleanups.push(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (raf) window.cancelAnimationFrame(raf);
  });
}

function setupLifeAboard(root: HTMLElement, cleanups: Array<() => void>) {
  const pin = root.querySelector<HTMLElement>(".iv-life__pin");
  const cards = Array.from(
    root.querySelectorAll<HTMLElement>(".iv-life__stage .iv-life__card"),
  );
  if (!pin || cards.length < 2) return;

  pin.style.setProperty("--iv-life-runway", `${cards.length * 95}svh`);
  cards.forEach((c, i) => c.classList.toggle("is-active", i === 0));

  let last = 0;
  let raf = 0;

  const apply = () => {
    raf = 0;
    const p = progressThroughPin(pin);
    const index = Math.min(cards.length - 1, Math.floor(p * cards.length));
    if (index === last) return;
    last = index;
    cards.forEach((c, i) => c.classList.toggle("is-active", i === index));
  };

  const onScroll = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(apply);
  };

  apply();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  cleanups.push(() => {
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", onScroll);
    if (raf) window.cancelAnimationFrame(raf);
  });
}

export function useImmersiveVoyageMotion(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root
        .querySelectorAll<HTMLElement>(
          ".iv-scrub__slide, .iv-scrub__chapter, .iv-life__card",
        )
        .forEach((el) => {
          el.classList.add("is-active");
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      return;
    }

    const desktop = window.matchMedia(DESKTOP_MQ);
    const cleanups: Array<() => void> = [];

    const mount = () => {
      while (cleanups.length) cleanups.pop()?.();
      if (!desktop.matches) return;
      root.querySelectorAll<HTMLElement>("[data-iv-scrub]").forEach((el) => {
        setupScrub(el, cleanups);
      });
      setupLifeAboard(root, cleanups);
    };

    mount();
    desktop.addEventListener("change", mount);

    return () => {
      desktop.removeEventListener("change", mount);
      while (cleanups.length) cleanups.pop()?.();
    };
  }, [rootRef]);
}
