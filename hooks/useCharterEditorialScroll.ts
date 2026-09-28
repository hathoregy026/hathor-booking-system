"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { editorialFlipProgress } from "@/lib/editorial-flip-progress";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

type CharterEditorialScrollRefs = {
  rootRef: RefObject<HTMLDivElement | null>;
  runRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
};

type Geometry = { desktop: boolean; travel: number; scrollDistance: number };

/*
 * DNA constants (travel × 0.74 runway, 0.14 easing) plus one documented
 * change: the runway ends with a hold of half a screen, so the last scene
 * arrives whole and rests pinned before the page turns to the epilogue —
 * without it the stage unpinned while the eased track was still arriving and
 * the final frame was only ever seen half-way.
 */
const RUNWAY = 0.74;
const EASE = 0.14;
const END_HOLD = 0.5;

/* Slide-in: an element starts opening as it crosses 97% of the stage and is
   settled by the time it has travelled another 30% — and anything already
   wholly on screen is always settled, wherever it rests. Stacked: the same
   from its top edge. */
const slideIn = (left: number, size: number, stage: number) =>
  Math.max(clamp((stage * 0.97 - left) / (stage * 0.3)), clamp((stage - (left + size)) / (stage * 0.03)));
const riseIn = (top: number, size: number, viewport: number) =>
  Math.max(clamp((viewport * 0.95 - top) / (viewport * 0.28)), clamp((viewport - (top + size)) / (viewport * 0.03)));
/* the stacked slide lifts an element 2rem while it arrives; measure without it */
const RISE_PX = 32;

/** The stage's visible width — the viewport without the page scrollbar. */
const stageWidth = (track: HTMLElement) => track.parentElement?.clientWidth || document.documentElement.clientWidth;

/** Page scroll position that brings `target` into view: inside the sideways track, its scene's slot on the run. */
function scrollYFor(target: HTMLElement, run: HTMLElement, track: HTMLElement, geometry: Geometry): number {
  if (geometry.desktop && track.contains(target)) {
    const scene = target.closest<HTMLElement>(".chr-scene") ?? target;
    const runTop = run.getBoundingClientRect().top + window.scrollY;
    return runTop + clamp(scene.offsetLeft / geometry.travel) * geometry.scrollDistance;
  }
  const header = document.querySelector(".hathor-header")?.getBoundingClientRect().height ?? 0;
  return Math.max(0, target.getBoundingClientRect().top + window.scrollY - header - 16);
}

function scrollPageTo(y: number, immediate: boolean) {
  const controller = ensurePublicScrollController();
  if (controller.lenis) {
    controller.lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.2, force: true });
    return;
  }
  window.scrollTo({ top: y, behavior: immediate ? "auto" : "smooth" });
}

/**
 * LuxuryHathor horizontal story for /charter.
 * Desktop: vertical progress drives a sticky rightward track (DNA constants).
 * ≤950px / reduced-motion: same scenes as a vertical editorial document.
 *
 * Returns `scrollToTarget`: in-page links cannot reach a scene inside the
 * translated track (the browser would scroll the clipped stage sideways and
 * desync the story), so chapter links, route cards and keyboard focus go
 * through the same page-scroll mapping the story itself uses.
 */
export function useCharterEditorialScroll({
  rootRef,
  runRef,
  trackRef,
}: CharterEditorialScrollRefs) {
  const geometry = useRef<Geometry>({ desktop: false, travel: 1, scrollDistance: 1 });

  const scrollToTarget = useCallback((target: HTMLElement | null, options: { immediate?: boolean } = {}) => {
    const run = runRef.current;
    const track = trackRef.current;
    if (!target || !run || !track) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scrollPageTo(scrollYFor(target, run, track, geometry.current), Boolean(options.immediate) || still);
  }, [runRef, trackRef]);

  useEffect(() => {
    const root = rootRef.current;
    const run = runRef.current;
    const track = trackRef.current;
    const stage = track?.parentElement;
    if (!root || !run || !track || !stage) return;

    const html = document.documentElement;
    const progressBar = root.querySelector<HTMLElement>("[data-chr-progress]");
    const scenes = [...root.querySelectorAll<HTMLElement>(".chr-scene")];
    const flips = [...root.querySelectorAll<HTMLElement>("[data-chr-flip]")];
    /* Frames and text blocks that slide in. The opening scene is already on screen. */
    const slides = [...root.querySelectorAll<HTMLElement>(".chr-photo, [data-chr-reveal]")].filter(
      (el) => !el.closest(".chr-deed"),
    );
    const inTrack = slides.filter((el) => track.contains(el));
    const outside = slides.filter((el) => !track.contains(el));
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let desktop = false;
    let travel = 0;
    let scrollDistance = 0;
    let frame = 0;
    let target = 0;
    let current = 0;
    let lastWidth = window.innerWidth;
    let trackOffsets: number[] = [];
    let trackWidths: number[] = [];
    const risen = new Map<HTMLElement, number>();
    /*
     * Lazy images never start inside the clipped stage (the browser sees them
     * as hidden until they are on screen, so they would arrive blank). Each
     * frame's pictures are asked for about two screens before it slides in.
     */
    const primed = new Set<HTMLElement>();
    const prime = (el: HTMLElement) => {
      if (primed.has(el)) return;
      primed.add(el);
      el.querySelectorAll("img").forEach((img) => {
        if (img.loading === "lazy") img.loading = "eager";
      });
    };
    html.setAttribute("data-charter-editorial", "");

    /* Left edge of an element inside the track, ignoring every transform. */
    const offsetInTrack = (el: HTMLElement) => {
      let x = 0;
      let node: HTMLElement | null = el;
      while (node && node !== stage) {
        x += node.offsetLeft;
        node = node.offsetParent as HTMLElement | null;
      }
      return x;
    };

    const setIn = (el: HTMLElement, value: number) => el.style.setProperty("--chr-in", value.toFixed(4));

    const applyFlips = (mode: "horizontal" | "vertical") => {
      flips.forEach((el) => {
        if (reduced.matches) {
          el.style.setProperty("--chr-flip", "1");
          return;
        }
        el.style.setProperty(
          "--chr-flip",
          editorialFlipProgress(el.getBoundingClientRect(), mode).toFixed(4),
        );
      });
    };

    /* Anything outside the sideways track (the epilogue) rises in from below. */
    const applyRise = (elements: HTMLElement[]) => {
      const viewport = window.innerHeight;
      elements.forEach((el) => {
        if (reduced.matches) {
          setIn(el, 1);
          return;
        }
        const previous = risen.get(el) ?? 1;
        const rect = el.getBoundingClientRect();
        const value = riseIn(rect.top - (1 - previous) * RISE_PX, rect.height, viewport);
        risen.set(el, value);
        setIn(el, value);
      });
    };

    const applySceneVars = (x: number) => {
      const viewport = stageWidth(track);
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
      inTrack.forEach((el, index) => {
        const left = (trackOffsets[index] ?? 0) - x;
        if (left < viewport * 2) prime(el);
        setIn(el, slideIn(left, trackWidths[index] ?? 0, viewport));
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
        /* Stacked scenes are often taller than the screen: reveal from the
           scene's top edge, so a heading is complete while it is being read. */
        const reveal = clamp((viewport * 0.94 - rect.top) / (viewport * 0.3));
        scene.style.setProperty("--reveal", reveal.toFixed(4));
        scene.style.setProperty("--parallax", progress.toFixed(4));
        scene.style.setProperty("--scene-progress", progress.toFixed(4));
        scene.style.setProperty("--focus", Math.max(0, focus).toFixed(4));
      });
      applyRise(inTrack);
      applyFlips("vertical");
    };

    const measure = (snap = true) => {
      desktop = window.innerWidth > 950 && !reduced.matches;
      geometry.current = { desktop, travel, scrollDistance };
      if (!desktop) {
        run.style.height = "auto";
        track.style.transform = "none";
        applyVerticalVars();
        applyRise(outside);
        if (progressBar) progressBar.style.transform = "scaleX(0)";
        return;
      }
      /* the visible stage excludes the scrollbar, or the story stops short of its end */
      travel = Math.max(1, track.scrollWidth - stageWidth(track));
      scrollDistance = Math.max(1, travel * RUNWAY);
      geometry.current = { desktop, travel, scrollDistance };
      run.style.height = `${scrollDistance + window.innerHeight * (1 + END_HOLD)}px`;
      trackOffsets = inTrack.map(offsetInTrack);
      trackWidths = inTrack.map((el) => el.offsetWidth);
      const rect = run.getBoundingClientRect();
      target = clamp(-rect.top / scrollDistance);
      if (snap) current = target;
      const x = current * travel;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      applySceneVars(x);
      applyRise(outside);
    };

    const tick = () => {
      frame = 0;
      if (!desktop) return;
      current += (target - current) * EASE;
      if (Math.abs(target - current) < 0.0001) current = target;
      const x = current * travel;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      applySceneVars(x);
      if (progressBar) progressBar.style.transform = `scaleX(${current})`;
      if (current !== target) frame = requestAnimationFrame(tick);
    };

    const updateTarget = () => {
      applyRise(outside);
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
      const widthChanged = Math.abs(width - lastWidth) > 24;
      lastWidth = width;
      if (!widthChanged && width <= 950) {
        applyVerticalVars();
        applyRise(outside);
        return;
      }
      measure(widthChanged);
      updateTarget();
    };

    /* Content can change size after the first measure (fonts, form messages):
       re-measure so the story always travels to its true end. */
    let resizeFrame = 0;
    const observer = new ResizeObserver(() => {
      if (resizeFrame) return;
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        measure(false);
        updateTarget();
      });
    });
    observer.observe(track);

    /* Keyboard focus moving into a scene that is off to the side brings that scene into view. */
    const onFocusIn = (event: FocusEvent) => {
      const focused = event.target as HTMLElement | null;
      if (!desktop || !focused || !track.contains(focused)) return;
      const rect = focused.getBoundingClientRect();
      if (rect.left >= 0 && rect.right <= stageWidth(track)) return;
      scrollPageTo(scrollYFor(focused, run, track, geometry.current), true);
    };

    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    reduced.addEventListener("change", onResize);
    root.addEventListener("focusin", onFocusIn);
    document.fonts?.ready.then(() => {
      measure(false);
      updateTarget();
    }).catch(() => undefined);
    measure(true);
    requestAnimationFrame(() => {
      measure(true);
      /* Arriving on /charter#passages (or any chapter) lands on that scene. */
      const hashTarget = window.location.hash.length > 1 ? document.getElementById(decodeURIComponent(window.location.hash.slice(1))) : null;
      if (hashTarget && root.contains(hashTarget)) scrollPageTo(scrollYFor(hashTarget, run, track, geometry.current), true);
    });

    return () => {
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", onResize);
      reduced.removeEventListener("change", onResize);
      root.removeEventListener("focusin", onFocusIn);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      if (resizeFrame) cancelAnimationFrame(resizeFrame);
      html.removeAttribute("data-charter-editorial");
      run.style.height = "";
      track.style.transform = "";
      slides.forEach((el) => el.style.removeProperty("--chr-in"));
    };
  }, [rootRef, runRef, trackRef]);

  return scrollToTarget;
}
