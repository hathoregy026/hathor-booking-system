"use client";

import { useEffect, type RefObject } from "react";
import { editorialFlipProgress } from "@/lib/editorial-flip-progress";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/**
 * Structural switch between the pinned horizontal desktop story and natural
 * vertical flow. Matches `isPhoneOrTabletViewport()` in lib/touch-device.ts:
 * desktop begins strictly above 1024px.
 */
const DESKTOP_MIN_WIDTH = 1024;

/**
 * A coarse pointer up to this width is a tablet in landscape (iPad Pro 12.9"
 * reports 1366), never a desktop — a mouse-driven machine reports
 * `pointer: fine`. Keeps the sticky stage off every iPad, where iOS toolbar
 * collapse and touch scrolling make a pinned scrub unstable.
 */
const COARSE_POINTER_MAX_WIDTH = 1366;

/** Must stay in lockstep with the media conditions in home-editorial.css. */
function isDesktopStage(coarse: MediaQueryList): boolean {
  const width = window.innerWidth;
  if (width <= DESKTOP_MIN_WIDTH) return false;
  if (coarse.matches && width <= COARSE_POINTER_MAX_WIDTH) return false;
  return true;
}

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
function applyHomeWheelVars(
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

type HomeEditorialScrollRefs = {
  rootRef: RefObject<HTMLDivElement | null>;
  runRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
};

/** LuxuryHathor desktop horizontal travel; tablet/phone become natural flow. */
export function useHomeEditorialScroll({
  rootRef,
  runRef,
  trackRef,
}: HomeEditorialScrollRefs) {
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
    /*
     * The transparent phone header reads white over the hero reel and ink over
     * the cream editorial body. `hathor-header--nav-compact` cannot drive that:
     * it flips at 40px of scroll, long before the hero is behind you.
     *
     * The measurement has to be the hero *runway*, not the hero itself. The
     * hero is `position: sticky` inside a ~3 300px runway, so its own bottom
     * edge sits at the viewport foot for the whole of that scroll and never
     * crosses anything. The runway's bottom edge is where the reel actually
     * ends and the cream body reaches the bar. Both live outside `root` — they
     * are sibling sections — so they come from the document.
     */
    const heroEl =
      document.querySelector<HTMLElement>(".home-hero-runway") ??
      document.querySelector<HTMLElement>(".home-hero-container");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    let desktop = false;
    let travel = 0;
    let scrollDistance = 0;
    let target = 0;
    let current = 0;
    let frame = 0;
    /* Separate rAF handle for the vertical (touch) path — never share with `tick`. */
    let verticalFrame = 0;
    let lastWidth = window.innerWidth;

    html.setAttribute("data-home-editorial", "");

    const applySceneVars = (x: number) => {
      const viewport = window.innerWidth;
      const touch = coarse.matches || viewport <= DESKTOP_MIN_WIDTH;
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
          applyHomeWheelVars(scene, wheelProgress, holdX, touch);
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

    /*
     * Touch path. Same maths as before, but every layout read happens first and
     * every style write second, so a finger scroll costs one layout pass rather
     * than one per scene. Scenes far outside the viewport are skipped — their
     * vars are already at their settled value.
     */
    const applyVerticalVars = () => {
      const viewport = window.innerHeight;
      const margin = viewport;

      /* --- read phase (no writes, so no forced reflow between rects) --- */
      const sceneRects = scenes.map((scene) => scene.getBoundingClientRect());
      const flipRects = flips.map((el) => el.getBoundingClientRect());
      const helmHeight = helm ? helm.offsetHeight : 0;
      const runRect = run.getBoundingClientRect();
      const runScrollable = Math.max(1, run.offsetHeight - viewport);

      /* --- write phase --- */
      scenes.forEach((scene, index) => {
        const rect = sceneRects[index];
        if (rect.bottom < -margin || rect.top > viewport + margin) return;
        const progress = clamp(
          (viewport - rect.top) / Math.max(1, viewport + rect.height),
        );
        const focus = Math.max(0, Math.sin(progress * Math.PI));
        scene.style.setProperty("--reveal", clamp(progress * 2.65).toFixed(4));
        scene.style.setProperty("--parallax", progress.toFixed(4));
        scene.style.setProperty("--scene-progress", progress.toFixed(4));
        scene.style.setProperty("--focus", focus.toFixed(4));
        /*
         * Signed drift for the touch parallax: -1 as the scene enters from the
         * bottom, 0 at centre, +1 as it leaves. Scene progress alone is not
         * usable for this because it never centres on a scene taller or
         * shorter than the viewport.
         */
        const centre =
          (viewport / 2 - (rect.top + rect.height / 2)) /
          Math.max(1, (viewport + rect.height) / 2);
        scene.style.setProperty(
          "--drift",
          Math.max(-1, Math.min(1, centre)).toFixed(4),
        );

        if (scene === helm) {
          /* Sticky stage + tall runway — progress across the sticky pin scroll. */
          const scrollable = Math.max(1, helmHeight - viewport);
          const wheelProgress = clamp(-rect.top / scrollable);
          applyHomeWheelVars(scene, wheelProgress, 0, true);
        }
      });

      flips.forEach((el, index) => {
        el.style.setProperty(
          "--h2-flip",
          editorialFlipProgress(flipRects[index], "vertical").toFixed(4),
        );
      });

      /*
       * Header tone. `--h2-nav-band` is the height of the bar plus a little,
       * so the switch lands as the last of the hero clears the icons rather
       * than when its bottom edge crosses y=0.
       */
      if (heroEl) {
        html.setAttribute(
          "data-h2-nav",
          heroEl.getBoundingClientRect().bottom > 88 ? "over-hero" : "over-paper",
        );
      }

      /*
       * The gold top rule is part of the design, so it survives on touch — it
       * simply reads vertical progress through the story instead of horizontal
       * travel.
       */
      progressBar?.style.setProperty(
        "transform",
        `scaleX(${clamp(-runRect.top / runScrollable).toFixed(4)})`,
      );
    };

    /*
     * Per-element entrance for the stacked scenes.
     *
     * Scene-level `--reveal` works while a scene is about one screen tall, as
     * it is on desktop and for most scenes on a phone. It breaks down on the
     * tall stacks — gallery, voyages, reviews, amenities run 1 400–3 000px on
     * a handset — where the whole scene reads as "revealed" long before the
     * items at its bottom are anywhere near the viewport. Observing the items
     * themselves gives each one its own entrance, and costs nothing during
     * scroll because the browser does the intersection work off the main
     * thread. Desktop never builds this: there, scenes are exactly one
     * viewport wide and scene-level reveal is correct.
     */
    let itemObserver: IntersectionObserver | null = null;
    let itemObserverFired = false;
    let itemFallback = 0;
    const observedItems = [...root.querySelectorAll<HTMLElement>("[data-h2-item]")];

    const buildItemObserver = () => {
      if (itemObserver || !observedItems.length) return;
      /* No observer, no hidden start state — content must never be stranded. */
      if (typeof IntersectionObserver === "undefined") return;
      /*
       * Gate the hidden start state on an attribute this hook sets, so the
       * items render visible when JS never runs and nothing can strand content
       * off-screen if the observer fails to construct.
       */
      html.setAttribute("data-h2-touch-motion", "");
      itemObserver = new IntersectionObserver(
        (entries) => {
          /*
           * Any delivery at all — including the initial "not intersecting"
           * report every observer makes — proves the observer is live.
           */
          itemObserverFired = true;
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-h2-in");
            /* Entrances play once — re-firing on every pass reads as flicker. */
            itemObserver?.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
      );
      observedItems.forEach((el) => itemObserver?.observe(el));

      /*
       * Safety net. The entrance is cosmetic; the hidden start state it needs
       * is not — if callbacks never arrive, every tagged item would sit at
       * opacity 0 and the gallery, voyages and reviews would read as empty.
       * A healthy observer reports within a frame, so silence here means it is
       * not running (throttled renderer, exotic engine) and the closed state
       * has to go.
       */
      itemFallback = window.setTimeout(() => {
        if (itemObserverFired) return;
        teardownItemObserver();
      html.removeAttribute("data-h2-nav");
      }, 2500);
    };

    const teardownItemObserver = () => {
      window.clearTimeout(itemFallback);
      html.removeAttribute("data-h2-touch-motion");
      itemObserver?.disconnect();
      itemObserver = null;
      /* Leaving the class on keeps content visible if we flip to desktop. */
      observedItems.forEach((el) => el.classList.add("is-h2-in"));
    };

    const scheduleVertical = () => {
      if (verticalFrame) return;
      verticalFrame = requestAnimationFrame(() => {
        verticalFrame = 0;
        applyVerticalVars();
      });
    };

    const measure = () => {
      desktop = isDesktopStage(coarse) && !reduced.matches;
      if (!desktop) {
        run.style.height = "auto";
        track.style.transform = "none";
        buildItemObserver();
        applyVerticalVars();
        return;
      }

      teardownItemObserver();

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
        scheduleVertical();
        return;
      }
      target = clamp(-run.getBoundingClientRect().top / scrollDistance);
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onResize = () => {
      const width = window.innerWidth;
      const meaningfulWidthChange = Math.abs(width - lastWidth) > 24;
      lastWidth = width;
      /*
       * Mobile browser chrome collapsing fires resize with an unchanged width.
       * Re-measuring there would relayout mid-scroll, so only refresh the vars.
       */
      if (!meaningfulWidthChange && !isDesktopStage(coarse)) {
        scheduleVertical();
        return;
      }
      measure();
      update();
    };

    /*
     * Rotation reports its new size a frame or two after the event on iOS and
     * Android, so re-measure on the next frame as well — this is what keeps
     * portrait → landscape → portrait from leaving stale scene geometry.
     */
    const onOrientationChange = () => {
      lastWidth = -1;
      onResize();
      requestAnimationFrame(onResize);
      window.setTimeout(onResize, 350);
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(track);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onOrientationChange, {
      passive: true,
    });
    reduced.addEventListener("change", onResize);
    coarse.addEventListener("change", onResize);
    document.fonts?.ready.then(onResize).catch(() => undefined);
    measure();
    requestAnimationFrame(measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onOrientationChange);
      reduced.removeEventListener("change", onResize);
      coarse.removeEventListener("change", onResize);
      if (frame) cancelAnimationFrame(frame);
      if (verticalFrame) cancelAnimationFrame(verticalFrame);
      window.clearTimeout(itemFallback);
      itemObserver?.disconnect();
      itemObserver = null;
      html.removeAttribute("data-h2-touch-motion");
      html.removeAttribute("data-h2-nav");
      html.removeAttribute("data-home-editorial");
      run.style.height = "";
      track.style.transform = "";
    };
  }, [rootRef, runRef, trackRef]);
}
