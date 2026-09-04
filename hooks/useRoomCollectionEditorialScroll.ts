"use client";

import { useEffect, type RefObject } from "react";
import { editorialFlipProgress } from "@/lib/editorial-flip-progress";
import { attachEditorialRemeasure } from "@/lib/editorial-remeasure";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

type RoomCollectionEditorialScrollRefs = {
  rootRef: RefObject<HTMLDivElement | null>;
  runRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
};

export function useRoomCollectionEditorialScroll({
  rootRef,
  runRef,
  trackRef,
}: RoomCollectionEditorialScrollRefs) {
  useEffect(() => {
    const root = rootRef.current;
    const run = runRef.current;
    const track = trackRef.current;
    if (!root || !run || !track) return;

    const html = document.documentElement;
    const progressBar = root.querySelector<HTMLElement>("[data-ac-progress]");
    const stage = track.parentElement;
    const scenes = [...root.querySelectorAll<HTMLElement>(".ac-scene")];
    const fullBleedScenes = [
      ...root.querySelectorAll<HTMLElement>(".ac-bento-scene, .ac-wipe-scene"),
    ];
    const wipes = [...root.querySelectorAll<HTMLElement>("[data-ac-wipe]")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let desktop = false;
    let stageWidth = window.innerWidth;
    let travel = 0;
    let scrollDistance = 0;
    let frame = 0;
    let target = 0;
    let current = 0;
    let lastWidth = window.innerWidth;

    html.setAttribute("data-accom-catalog", "");

    const clearFullBleedSizes = () => {
      fullBleedScenes.forEach((el) => {
        el.style.width = "";
        el.style.flex = "";
        el.style.maxWidth = "";
      });
    };

    /** Pin mosaic + wipe to the sticky stage width so neighbors never peek. */
    const pinFullBleedSizes = (width: number) => {
      const px = `${Math.max(1, Math.round(width))}px`;
      const flex = `0 0 ${px}`;
      fullBleedScenes.forEach((el) => {
        if (el.style.width !== px) el.style.width = px;
        if (el.style.flex !== flex) el.style.flex = flex;
        if (el.style.maxWidth !== "none") el.style.maxWidth = "none";
      });
    };

    const applyWipes = (mode: "horizontal" | "vertical") => {
      wipes.forEach((el) => {
        if (reduced.matches) {
          el.style.setProperty("--ac-wipe", "1");
          return;
        }
        el.style.setProperty(
          "--ac-wipe",
          editorialFlipProgress(el.getBoundingClientRect(), mode).toFixed(4),
        );
      });
    };

    const applySceneVars = (x: number) => {
      const viewport = stageWidth;
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
      applyWipes("horizontal");
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
      applyWipes("vertical");
    };

    const measure = () => {
      desktop = window.innerWidth > 950 && !reduced.matches;
      if (!desktop) {
        clearFullBleedSizes();
        run.style.height = "auto";
        track.style.transform = "none";
        applyVerticalVars();
        if (progressBar) progressBar.style.transform = "scaleX(0)";
        return;
      }
      stageWidth = Math.max(
        1,
        stage?.clientWidth || track.clientWidth || window.innerWidth,
      );
      pinFullBleedSizes(stageWidth);
      travel = Math.max(1, track.scrollWidth - stageWidth);
      scrollDistance = Math.max(1, travel * 0.74);
      run.style.height = `${scrollDistance + window.innerHeight}px`;
      const rect = run.getBoundingClientRect();
      target = clamp(-rect.top / scrollDistance);
      current = target;
      const x = current * travel;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      applySceneVars(x);
      if (scenes[0] && x <= 1) {
        scenes[0].style.setProperty("--reveal", "1");
      }
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

    const onResize = () => {
      const width = window.innerWidth;
      const widthChanged = Math.abs(width - lastWidth) > 24;
      lastWidth = width;
      if (!widthChanged && window.innerWidth <= 950) {
        applyVerticalVars();
        return;
      }
      remeasure();
    };

    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    reduced.addEventListener("change", onResize);
    const detachRemeasure = attachEditorialRemeasure({
      observe: track,
      onRemeasure: remeasure,
    });
    measure();
    requestAnimationFrame(measure);

    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", onResize);
      reduced.removeEventListener("change", onResize);
      detachRemeasure();
      if (frame) cancelAnimationFrame(frame);
      clearFullBleedSizes();
      html.removeAttribute("data-accom-catalog");
      run.style.height = "";
      track.style.transform = "";
    };
  }, [rootRef, runRef, trackRef]);
}
