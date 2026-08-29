"use client";

import { useEffect, type RefObject } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

type Home2EditorialScrollRefs = {
  rootRef: RefObject<HTMLDivElement | null>;
  runRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
};

/** LuxuryHathor desktop horizontal travel; tablet/phone become natural flow. */
export function useHome2EditorialScroll({
  rootRef,
  runRef,
  trackRef,
}: Home2EditorialScrollRefs) {
  useEffect(() => {
    const root = rootRef.current;
    const run = runRef.current;
    const track = trackRef.current;
    if (!root || !run || !track) return;

    const html = document.documentElement;
    const progressBar = root.querySelector<HTMLElement>("[data-h2-progress]");
    const scenes = [...root.querySelectorAll<HTMLElement>(".h2-scene")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let desktop = false;
    let travel = 0;
    let scrollDistance = 0;
    let target = 0;
    let current = 0;
    let frame = 0;
    let lastWidth = window.innerWidth;

    html.setAttribute("data-home2-editorial", "");

    const applySceneVars = (x: number) => {
      const viewport = window.innerWidth;
      scenes.forEach((scene) => {
        const left = scene.offsetLeft - x;
        const width = scene.offsetWidth;
        const reveal = clamp(
          (viewport * 0.96 - left) / Math.max(viewport * 0.5, width * 0.35),
        );
        const progress = clamp((viewport - left) / Math.max(1, viewport + width));
        const focus = Math.max(0, Math.sin(progress * Math.PI));
        scene.style.setProperty("--reveal", reveal.toFixed(4));
        scene.style.setProperty("--parallax", progress.toFixed(4));
        scene.style.setProperty("--scene-progress", progress.toFixed(4));
        scene.style.setProperty("--focus", focus.toFixed(4));
      });
    };

    const applyVerticalVars = () => {
      const viewport = window.innerHeight;
      scenes.forEach((scene) => {
        const rect = scene.getBoundingClientRect();
        const progress = clamp(
          (viewport - rect.top) / Math.max(1, viewport + rect.height),
        );
        const focus = Math.max(0, Math.sin(progress * Math.PI));
        scene.style.setProperty("--reveal", clamp(progress * 1.8).toFixed(4));
        scene.style.setProperty("--parallax", progress.toFixed(4));
        scene.style.setProperty("--scene-progress", progress.toFixed(4));
        scene.style.setProperty("--focus", focus.toFixed(4));
      });
    };

    const measure = () => {
      desktop = window.innerWidth > 950 && !reduced.matches;
      if (!desktop) {
        run.style.height = "auto";
        track.style.transform = "none";
        progressBar?.style.setProperty("transform", "scaleX(0)");
        applyVerticalVars();
        return;
      }

      travel = Math.max(1, track.scrollWidth - window.innerWidth);
      scrollDistance = Math.max(1, travel * 0.74);
      run.style.height = `${scrollDistance + window.innerHeight}px`;
      target = clamp(-run.getBoundingClientRect().top / scrollDistance);
      current = target;
      const x = current * travel;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      applySceneVars(x);
    };

    const tick = () => {
      frame = 0;
      if (!desktop) return;
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.0001) current = target;
      const x = current * travel;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      applySceneVars(x);
      progressBar?.style.setProperty("transform", `scaleX(${current})`);
      if (current !== target) frame = requestAnimationFrame(tick);
    };

    const update = () => {
      if (!desktop) {
        applyVerticalVars();
        return;
      }
      target = clamp(-run.getBoundingClientRect().top / scrollDistance);
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onResize = () => {
      const width = window.innerWidth;
      const meaningfulWidthChange = Math.abs(width - lastWidth) > 24;
      lastWidth = width;
      if (!meaningfulWidthChange && width <= 950) {
        applyVerticalVars();
        return;
      }
      measure();
      update();
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(track);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    reduced.addEventListener("change", onResize);
    document.fonts?.ready.then(onResize).catch(() => undefined);
    measure();
    requestAnimationFrame(measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      reduced.removeEventListener("change", onResize);
      if (frame) cancelAnimationFrame(frame);
      html.removeAttribute("data-home2-editorial");
      run.style.height = "";
      track.style.transform = "";
    };
  }, [rootRef, runRef, trackRef]);
}
