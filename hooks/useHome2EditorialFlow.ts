"use client";

import { useEffect, type RefObject } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const easeInOut = (value: number) =>
  value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

type Home2EditorialRefs = {
  rootRef: RefObject<HTMLDivElement | null>;
  runRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
};

export function useHome2EditorialFlow({
  rootRef,
  runRef,
  trackRef,
}: Home2EditorialRefs) {
  useEffect(() => {
    const root = rootRef.current;
    const run = runRef.current;
    const track = trackRef.current;
    if (!root || !run || !track) return;

    const html = document.documentElement;
    const hero = root.querySelector<HTMLElement>(".home-hero-container");
    const heroRunway = root.querySelector<HTMLElement>(".home-hero-runway");
    const cover = hero?.querySelector<HTMLElement>(".home-hero-cover") ?? null;
    const logoMark = hero?.querySelector<HTMLElement>(".hero-logo-mark") ?? null;
    const logoLetters = logoMark
      ? [...logoMark.querySelectorAll<HTMLElement>(".logo-letter-wrap")]
      : [];
    const lineRight = hero?.querySelector<HTMLElement>(".hero-line--right") ?? null;
    const lineLeft = hero?.querySelector<HTMLElement>(".hero-line--left") ?? null;
    const cta = hero?.querySelector<HTMLElement>(".hero-cta") ?? null;
    const ctaText = hero?.querySelector<HTMLElement>(".hero-cta-text") ?? null;
    const scrollHint = hero?.querySelector<HTMLElement>(".hero-scroll-hint") ?? null;
    const progressBar = root.querySelector<HTMLElement>("[data-h2-progress]");
    const scenes = [...root.querySelectorAll<HTMLElement>(".h2-scene")];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let desktop = false;
    let travel = 0;
    let scrollDistance = 0;
    let frame = 0;
    let target = 0;
    let current = 0;
    let lastWidth = window.innerWidth;
    let baseCtaWidth = 0;
    let strips: HTMLElement[] = [];

    html.setAttribute("data-home2-editorial", "");
    html.classList.add("ex-scroll-ready", "hero-motion-ready");

    const buildHeroBlinds = () => {
      if (!cover || !hero) return;
      const width = hero.clientWidth || window.innerWidth;
      const count = window.innerWidth <= 480 ? 14 : window.innerWidth <= 1024 ? 36 : 48;
      const stripWidth = width / count;
      cover.replaceChildren();
      strips = Array.from({ length: count }, (_, index) => {
        const strip = document.createElement("div");
        strip.className = "blind-strip-v";
        strip.style.left = `${index * stripWidth - 0.5}px`;
        strip.style.width = `${stripWidth + 1}px`;
        cover.appendChild(strip);
        return strip;
      });
    };

    const applyHeroProgress = (rawProgress: number) => {
      if (!hero || reducedMotion.matches) return;
      const progress = clamp(rawProgress);
      const titleTravel = Math.min(window.innerWidth * 0.38, 420);
      const hiddenY =
        (logoMark?.offsetHeight || window.innerHeight * 0.42) * 0.78 +
        window.innerHeight * 0.12;

      strips.forEach((strip, index) => {
        const delay = (index / Math.max(1, strips.length - 1)) * 0.38;
        const reveal = clamp((progress - delay) / 0.62);
        strip.style.transform = `rotateY(${-90 + reveal * 90}deg)`;
        strip.style.opacity = reveal.toFixed(4);
        strip.style.visibility = reveal > 0.001 ? "visible" : "hidden";
      });

      if (lineRight) {
        lineRight.style.transform = `translate3d(${titleTravel * progress}px,0,0)`;
        lineRight.style.opacity = String(1 - progress);
      }
      if (lineLeft) {
        lineLeft.style.transform = `translate3d(${-titleTravel * progress}px,0,0)`;
        lineLeft.style.opacity = String(1 - progress);
      }
      if (scrollHint) scrollHint.style.opacity = String(1 - clamp(progress * 2.8));

      if (logoMark) {
        logoMark.style.opacity = "1";
        logoMark.style.visibility = "visible";
      }
      logoLetters.forEach((letter, index) => {
        const letterProgress = easeInOut(
          clamp((progress - 0.06 - index * 0.055) / 0.62),
        );
        letter.style.transform = `translate3d(0,${hiddenY * letterProgress}px,0)`;
        letter.style.opacity = String(1 - letterProgress);
      });

      if (cta) {
        const targetWidth = Math.min(baseCtaWidth * 4, window.innerWidth - 64);
        cta.style.setProperty(
          "--h2-hero-cta-width",
          `${baseCtaWidth + (targetWidth - baseCtaWidth) * progress}px`,
        );
      }
      if (ctaText) {
        ctaText.style.letterSpacing = `${0.22 + 0.93 * progress}em`;
      }
    };

    const applySceneVars = (x: number, mode: "horizontal" | "vertical") => {
      const viewport = mode === "horizontal" ? window.innerWidth : window.innerHeight;
      scenes.forEach((scene) => {
        const start =
          mode === "horizontal"
            ? scene.offsetLeft - x
            : scene.getBoundingClientRect().top;
        const size = mode === "horizontal" ? scene.offsetWidth : scene.offsetHeight;
        const progress = clamp((viewport - start) / Math.max(1, viewport + size));
        const reveal = clamp(progress * 1.85);
        const focus = Math.max(0, Math.sin(progress * Math.PI));
        scene.style.setProperty("--reveal", reveal.toFixed(4));
        scene.style.setProperty("--parallax", progress.toFixed(4));
        scene.style.setProperty("--focus", focus.toFixed(4));
      });
    };

    const applyMobileHero = () => {
      if (!heroRunway || reducedMotion.matches) {
        applyHeroProgress(0);
        return;
      }
      const rect = heroRunway.getBoundingClientRect();
      const distance = Math.max(1, heroRunway.offsetHeight - window.innerHeight);
      applyHeroProgress(clamp(-rect.top / distance));
    };

    const measure = () => {
      desktop = window.innerWidth > 950 && !reducedMotion.matches;
      buildHeroBlinds();
      if (baseCtaWidth <= 0) baseCtaWidth = cta?.offsetWidth || 200;

      if (!desktop) {
        run.style.height = "auto";
        track.style.transform = "none";
        progressBar?.style.setProperty("transform", "scaleX(0)");
        applySceneVars(0, "vertical");
        applyMobileHero();
        return;
      }

      travel = Math.max(1, track.scrollWidth - window.innerWidth);
      scrollDistance = Math.max(1, travel * 0.74);
      run.style.height = `${scrollDistance + window.innerHeight}px`;
      target = clamp(-run.getBoundingClientRect().top / scrollDistance);
      current = target;
      const x = current * travel;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      applySceneVars(x, "horizontal");
      applyHeroProgress(x / Math.max(1, window.innerWidth * 0.92));
    };

    const tick = () => {
      frame = 0;
      if (!desktop) return;
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.0001) current = target;
      const x = current * travel;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      applySceneVars(x, "horizontal");
      applyHeroProgress(x / Math.max(1, window.innerWidth * 0.92));
      progressBar?.style.setProperty("transform", `scaleX(${current})`);
      if (current !== target) frame = requestAnimationFrame(tick);
    };

    const update = () => {
      if (!desktop) {
        applySceneVars(0, "vertical");
        applyMobileHero();
        return;
      }
      target = clamp(-run.getBoundingClientRect().top / scrollDistance);
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onResize = () => {
      const width = window.innerWidth;
      if (Math.abs(width - lastWidth) <= 24 && width <= 950) {
        update();
        return;
      }
      lastWidth = width;
      measure();
      update();
    };

    const ready = () => {
      html.classList.add("hathor-hero-type-ready");
      measure();
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    reducedMotion.addEventListener("change", onResize);
    void document.fonts?.ready.then(ready).catch(() => undefined);
    measure();
    requestAnimationFrame(measure);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      reducedMotion.removeEventListener("change", onResize);
      if (frame) cancelAnimationFrame(frame);
      html.removeAttribute("data-home2-editorial");
      html.classList.remove("hero-motion-ready");
      run.style.height = "";
      track.style.transform = "";
      cover?.replaceChildren();
    };
  }, [rootRef, runRef, trackRef]);
}
