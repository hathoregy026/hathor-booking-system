"use client";

import { useEffect, type RefObject } from "react";
import { editorialFlipProgress } from "@/lib/editorial-flip-progress";
import { attachEditorialRemeasure } from "@/lib/editorial-remeasure";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

type PartnersEditorialScrollRefs = {
  rootRef: RefObject<HTMLDivElement | null>;
  runRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
};

/**
 * Partners horizontal story: desktop scrubs a sticky track rightward;
 * tablet and phone stack the same scenes vertically.
 */
export function usePartnersEditorialScroll({
  rootRef,
  runRef,
  trackRef,
}: PartnersEditorialScrollRefs) {
  useEffect(() => {
    const root = rootRef.current;
    const run = runRef.current;
    const track = trackRef.current;
    if (!root || !run || !track) return;

    const html = document.documentElement;
    const progressBar = root.querySelector<HTMLElement>("[data-pn-progress]");
    const scenes = [...root.querySelectorAll<HTMLElement>(".pn-scene")];
    const flips = [...root.querySelectorAll<HTMLElement>("[data-pn-flip]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let desktop = false;
    let travel = 0;
    let scrollDistance = 0;
    let frame = 0;
    let target = 0;
    let current = 0;
    html.setAttribute("data-partners-editorial", "");

    const applyFlips = (mode: "horizontal" | "vertical") => {
      flips.forEach((el) => {
        if (reduced.matches) {
          el.style.setProperty("--pn-flip", "1");
          return;
        }
        el.style.setProperty(
          "--pn-flip",
          editorialFlipProgress(el.getBoundingClientRect(), mode).toFixed(4),
        );
      });
    };

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
      applyFlips("horizontal");
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
      applyFlips("vertical");
    };

    const measure = () => {
      desktop = window.innerWidth > 950 && !reduced.matches;
      if (!desktop) {
        run.style.height = "auto";
        track.style.transform = "none";
        applyVerticalVars();
        if (progressBar) progressBar.style.transform = "scaleX(0)";
        return;
      }
      travel = Math.max(1, track.scrollWidth - window.innerWidth);
      scrollDistance = Math.max(1, travel * 0.74);
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
      current += (target - current) * 0.14;
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

    const remeasure = () => {
      measure();
      updateTarget();
    };

    window.addEventListener("scroll", updateTarget, { passive: true });
    reduced.addEventListener("change", remeasure);
    const detachRemeasure = attachEditorialRemeasure({
      observe: track,
      onRemeasure: remeasure,
    });
    measure();
    requestAnimationFrame(measure);

    return () => {
      window.removeEventListener("scroll", updateTarget);
      reduced.removeEventListener("change", remeasure);
      detachRemeasure();
      if (frame) cancelAnimationFrame(frame);
      html.removeAttribute("data-partners-editorial");
      run.style.height = "";
      track.style.transform = "";
    };
  }, [rootRef, runRef, trackRef]);
}
