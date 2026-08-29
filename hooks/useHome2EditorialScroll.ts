"use client";

import { useEffect, type RefObject } from "react";
import { editorialFlipProgress } from "@/lib/editorial-flip-progress";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/** Ease matching main-home helm GSAP `sine.inOut` / `power2` feel. */
const sineInOut = (t: number) => 0.5 - 0.5 * Math.cos(clamp(t) * Math.PI);
const power2In = (t: number) => {
  const x = clamp(t);
  return x * x;
};

/**
 * Map 0→1 helm scroll to the same choreography as `initHomeHelmPortal`:
 * rotate + grow, circle reveal, then scale-out + fade.
 */
function applyHome2WheelVars(
  scene: HTMLElement,
  wheelProgress: number,
  holdXPx: number,
  touch: boolean,
) {
  const t = clamp(wheelProgress);
  const openScale = touch ? 2.55 : 3.15;
  const exitScale = touch ? 4.1 : 5.4;

  let rotate = 0;
  let scale = 1;
  let opacity = 1;
  let clipVmax = 0;
  let mediaScale = 1.34;

  if (t <= 0.11) {
    rotate = 0;
    scale = 1;
    opacity = 1;
    clipVmax = 0;
    mediaScale = 1.34;
  } else if (t < 0.66) {
    const open = sineInOut((t - 0.11) / 0.55);
    rotate = 640 * open;
    scale = 1 + (openScale - 1) * open;
    opacity = 1;
    const clipT = t <= 0.24 ? 0 : sineInOut((t - 0.24) / 0.42);
    clipVmax = 13 * clipT;
    mediaScale = 1.34 + (1.08 - 1.34) * sineInOut((t - 0.11) / 0.55);
  } else {
    const exit = power2In((t - 0.66) / 0.2);
    rotate = 640 + (850 - 640) * exit;
    scale = openScale + (exitScale - openScale) * exit;
    opacity = 1 - exit;
    clipVmax = 13 + (75 - 13) * Math.min(1, (t - 0.66) / 0.22);
    mediaScale = 1.08 + (1 - 1.08) * Math.min(1, (t - 0.66) / 0.3);
  }

  scene.style.setProperty("--wheel-open", t.toFixed(4));
  scene.style.setProperty("--wheel-rotate", `${rotate.toFixed(2)}deg`);
  scene.style.setProperty("--wheel-scale", scale.toFixed(4));
  scene.style.setProperty("--wheel-opacity", opacity.toFixed(4));
  scene.style.setProperty("--wheel-clip", `${clipVmax.toFixed(3)}vmax`);
  scene.style.setProperty("--wheel-media-scale", mediaScale.toFixed(4));
  scene.style.setProperty("--h2-hold-x", `${holdXPx.toFixed(2)}px`);
}

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
    const helm = root.querySelector<HTMLElement>(".h2-helm");
    const flips = [...root.querySelectorAll<HTMLElement>("[data-h2-flip]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
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
      const touch = coarse.matches || viewport <= 950;
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

        if (scene === helm) {
          /*
           * Extra scene width is the hold runway. Map full hold so wheel
           * finishes open+fade before the next scene (same idea as home 480vh).
           */
          const holdDistance = Math.max(0, width - viewport);
          const holdX = Math.max(0, Math.min(holdDistance, -left));
          const wheelProgress =
            holdDistance > 1
              ? clamp(holdX / holdDistance)
              : clamp((viewport - left) / viewport);
          applyHome2WheelVars(scene, wheelProgress, holdX, touch);
        }
      });

      flips.forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty(
          "--h2-flip",
          editorialFlipProgress(rect, "horizontal").toFixed(4),
        );
      });
    };

    const applyVerticalVars = () => {
      const viewport = window.innerHeight;
      const touch = true;
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

        if (scene === helm) {
          /* Sticky stage + tall runway — progress across the sticky pin scroll. */
          const scrollable = Math.max(1, scene.offsetHeight - viewport);
          const wheelProgress = clamp(-rect.top / scrollable);
          applyHome2WheelVars(scene, wheelProgress, 0, touch);
        }
      });

      flips.forEach((el) => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty(
          "--h2-flip",
          editorialFlipProgress(rect, "vertical").toFixed(4),
        );
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
