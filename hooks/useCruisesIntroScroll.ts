"use client";

import { useEffect, type RefObject } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

type CruisesIntroScrollRefs = {
  runRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
};

/**
 * Short Suites-style horizontal intro: desktop scrubs a sticky track to the
 * right for about one extra viewport, then releases into the listing.
 * Tablet and phone stack the same scenes vertically.
 */
export function useCruisesIntroScroll({
  runRef,
  trackRef,
}: CruisesIntroScrollRefs) {
  useEffect(() => {
    const run = runRef.current;
    const track = trackRef.current;
    if (!run || !track) return;

    const html = document.documentElement;
    const progressBar = run.querySelector<HTMLElement>("[data-cr-intro-progress]");
    const scenes = [...track.querySelectorAll<HTMLElement>("[data-cr-intro-scene]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let desktop = false;
    let travel = 0;
    let scrollDistance = 0;
    let frame = 0;
    let target = 0;
    let current = 0;
    let lastWidth = window.innerWidth;

    html.setAttribute("data-cruises-intro", "");

    const applySceneVars = (x: number) => {
      const viewport = window.innerWidth;
      scenes.forEach((scene) => {
        const left = scene.offsetLeft - x;
        const width = scene.offsetWidth;
        const enter = clamp(
          (viewport * 0.96 - left) / Math.max(viewport * 0.5, width * 0.35),
        );
        const parallax = clamp((viewport - left) / Math.max(1, viewport + width));
        const focus = Math.sin(parallax * Math.PI);
        scene.style.setProperty("--reveal", enter.toFixed(4));
        scene.style.setProperty("--parallax", parallax.toFixed(4));
        scene.style.setProperty("--scene-progress", parallax.toFixed(4));
        scene.style.setProperty("--focus", Math.max(0, focus).toFixed(4));
      });
    };

    const applyVerticalVars = () => {
      const viewport = window.innerHeight;
      scenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect();
        const progress = clamp(
          (viewport - rect.top) / Math.max(1, viewport + rect.height),
        );
        const focus = Math.sin(progress * Math.PI);
        scene.style.setProperty("--reveal", clamp(progress * 1.8).toFixed(4));
        scene.style.setProperty("--parallax", progress.toFixed(4));
        scene.style.setProperty("--scene-progress", progress.toFixed(4));
        scene.style.setProperty("--focus", Math.max(0, focus).toFixed(4));
      });
    };

    const measure = () => {
      desktop = window.innerWidth > 1024 && !reduced.matches;
      if (!desktop) {
        run.style.height = "auto";
        track.style.transform = "none";
        applyVerticalVars();
        if (progressBar) progressBar.style.transform = "scaleX(0)";
        return;
      }
      travel = Math.max(1, track.scrollWidth - window.innerWidth);
      /* Few scrolls: about one extra viewport, not a long Suites story. */
      scrollDistance = Math.max(window.innerHeight * 1.15, travel * 0.72);
      run.style.height = `${scrollDistance + window.innerHeight}px`;
      const rect = run.getBoundingClientRect();
      target = clamp(-rect.top / scrollDistance);
      current = target;
      const x = current * travel;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      applySceneVars(x);
    };

    const tick = () => {
      frame = 0;
      if (!desktop) return;
      current += (target - current) * 0.16;
      if (Math.abs(target - current) < 0.0001) current = target;
      const x = current * travel;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      applySceneVars(x);
      if (progressBar) progressBar.style.transform = `scaleX(${current})`;
      if (current !== target) frame = requestAnimationFrame(tick);
    };

    const updateTarget = () => {
      if (!desktop) {
        applyVerticalVars();
        return;
      }
      const rect = run.getBoundingClientRect();
      target = clamp(-rect.top / scrollDistance);
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onResize = () => {
      const width = window.innerWidth;
      if (!desktop && Math.abs(width - lastWidth) < 12) return;
      lastWidth = width;
      measure();
      updateTarget();
    };

    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    reduced.addEventListener("change", onResize);
    document.fonts?.ready.then(onResize).catch(() => undefined);
    measure();
    requestAnimationFrame(measure);

    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", onResize);
      reduced.removeEventListener("change", onResize);
      if (frame) cancelAnimationFrame(frame);
      html.removeAttribute("data-cruises-intro");
      run.style.height = "";
      track.style.transform = "";
    };
  }, [runRef, trackRef]);
}
