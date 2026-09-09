"use client";

import { useEffect, type RefObject } from "react";
import { editorialFlipProgress } from "@/lib/editorial-flip-progress";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

type HomeThreeFlowRefs = {
  rootRef: RefObject<HTMLDivElement | null>;
  runRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
};

/**
 * Home 3 — the same editorial engine About, Contact, Suites and Royal Suites
 * already run: a sticky 100svh stage whose horizontal track is scrubbed by
 * vertical input above 950px, and natural vertical flow below it. The constants
 * (0.74 runway, 0.14 lerp, the reveal/parallax/focus formulas) are the site's,
 * not new ones — this page reads as family because it moves as family.
 *
 * One addition belongs to this page: the chart scene reports its own progress
 * so Hathor can sail the real channel while the scene crosses the stage. It is
 * driven from the same loop — no second engine, no second ticker.
 */
export function useHomeThreeFlow({
  rootRef,
  runRef,
  trackRef,
}: HomeThreeFlowRefs) {
  useEffect(() => {
    const root = rootRef.current;
    const run = runRef.current;
    const track = trackRef.current;
    if (!root || !run || !track) return;

    const html = document.documentElement;
    const progressBar = root.querySelector<HTMLElement>("[data-h3-progress]");
    const scenes = [...root.querySelectorAll<HTMLElement>(".h3-scene")];
    const flips = [...root.querySelectorAll<HTMLElement>("[data-h3-flip]")];
    /* Suites `.media` parallax and the projects strip's opening card. */
    const medias = [...root.querySelectorAll<HTMLElement>("[data-h3-media]")];
    /* the projects strip, grouped by the panel that owns it */
    const itemGroups = new Map<HTMLElement, HTMLElement[]>();
    root.querySelectorAll<HTMLElement>("[data-h3-item]").forEach((el) => {
      const panel = el.closest<HTMLElement>(".h3-scene");
      if (!panel) return;
      const group = itemGroups.get(panel);
      if (group) group.push(el);
      else itemGroups.set(panel, [el]);
    });

    /*
     * Native lazy-loading never fires inside this act. The track is one long
     * strip translated on X, so every scene past the first sits outside the
     * viewport at a position the lazy loader treats as permanently off-screen
     * — the images stay `complete: false` forever and the scenes render as
     * empty plates, whatever the user scrolls.
     *
     * So the act primes its own photography. The opener's two frames carry
     * `priority` and win the critical path; everything else is promoted once
     * the browser is idle, which is well before the horizontal travel can
     * bring any of it into view. Scene-level priming stays as a backstop for
     * anything added later.
     */
    const primed = new WeakSet<HTMLElement>();
    const primeImages = (host: ParentNode) => {
      host
        .querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
        .forEach((img) => {
          img.loading = "eager";
          /* keep them behind the LCP frame rather than racing it */
          img.fetchPriority = "low";
        });
    };
    const primeScene = (scene: HTMLElement) => {
      if (primed.has(scene)) return;
      primed.add(scene);
      primeImages(scene);
    };

    const idle =
      window.requestIdleCallback ??
      ((cb: () => void) => window.setTimeout(cb, 400));
    const primeHandle = idle(() => {
      scenes.forEach(primeScene);
      primeImages(root);
    });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* ---- the About wall's cursor frame -------------------------------
       Suites' `follow__mouse`, on this page's own listeners: one frame rides
       the pointer across the wall and cross-fades to the plate belonging to
       whichever principle it is over. Bound here so the page keeps a single
       set of handlers rather than a component growing its own. */
    const followHost = root.querySelector<HTMLElement>("[data-h3-follow-host]");
    const follow = root.querySelector<HTMLElement>("[data-h3-follow]");
    const followPlates = [
      ...root.querySelectorAll<HTMLElement>("[data-h3-term-plate]"),
    ];
    const followTerms = [...root.querySelectorAll<HTMLElement>("[data-h3-term]")];
    let followShown = -1;

    const showPlate = (index: number) => {
      if (index === followShown) return;
      followShown = index;
      followPlates.forEach((plate, i) =>
        plate.classList.toggle("is-on", i === index),
      );
    };

    const onFollowMove = (event: PointerEvent) => {
      if (!followHost || !follow || reduced.matches) return;
      const rect = followHost.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      follow.classList.add("is-live");
      follow.style.setProperty(
        "--fx",
        `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(2)}%`,
      );
      follow.style.setProperty(
        "--fy",
        `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(2)}%`,
      );
      /* whichever principle the pointer is level with owns the frame */
      let active = 0;
      followTerms.forEach((term, i) => {
        const box = term.getBoundingClientRect();
        if (event.clientY >= box.top && event.clientY <= box.bottom) active = i;
      });
      showPlate(active);
    };

    const onFollowLeave = () => {
      follow?.classList.remove("is-live");
      showPlate(-1);
    };

    if (followHost && follow) {
      showPlate(0);
      followHost.addEventListener("pointermove", onFollowMove, {
        passive: true,
      });
      followHost.addEventListener("pointerleave", onFollowLeave, {
        passive: true,
      });
    }

    /* ---- the chart -------------------------------------------------- */
    const chart = root.querySelector<HTMLElement>("[data-h3-chart]");
    const course = root.querySelector<SVGPathElement>("[data-h3-course]");
    const ship = root.querySelector<SVGGElement>("[data-h3-ship]");
    const helm = root.querySelector<HTMLElement>("[data-h3-helm]");
    const headingEl = root.querySelector<HTMLElement>("[data-h3-heading]");
    const kmEl = root.querySelector<HTMLElement>("[data-h3-km]");
    const stops = [...root.querySelectorAll<HTMLElement>("[data-h3-stop]")];
    const marks = [...root.querySelectorAll<HTMLElement>("[data-h3-mark]")];
    const tags = [...root.querySelectorAll<HTMLElement>("[data-h3-tag]")];
    const berths = [...root.querySelectorAll<HTMLElement>("[data-h3-berth]")];
    const chartPanel = chart?.closest<HTMLElement>(".h3-scene") ?? null;
    const chartHold = root.querySelector<HTMLElement>("[data-h3-chart-hold]");
    const totalKm = Number(chart?.dataset.h3TotalKm || "0");
    const courseLen = course ? course.getTotalLength() : 0;
    let shownBerth = -1;
    let manual: number | null = null;
    let previousScroll = window.scrollY;

    const paintChart = (p: number) => {
      if (!course || !courseLen) return;
      const progress = manual ?? p;
      course.style.strokeDasharray = String(courseLen);
      course.style.strokeDashoffset = String(courseLen * (1 - progress));

      const at = courseLen * progress;
      const here = course.getPointAtLength(at);
      const ahead = course.getPointAtLength(Math.min(courseLen, at + 0.7));
      const behind = course.getPointAtLength(Math.max(0, at - 0.7));
      /* Home 4's vessel: bow is drawn up (-Y), so path tangent + 90° aims it. */
      const angle =
        (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI +
        90;
      /* North is up in this projection and SVG y grows downward, so due
         south — the way Hathor sails — reads as 180. */
      const bearing =
        (((Math.atan2(ahead.x - here.x, -(ahead.y - here.y)) * 180) / Math.PI) +
          360) %
        360;

      if (ship) {
        ship.setAttribute(
          "transform",
          `translate(${here.x.toFixed(2)} ${here.y.toFixed(2)}) rotate(${angle.toFixed(1)})`,
        );
        ship.style.opacity = progress > 0.004 ? "1" : "0";
      }
      if (headingEl) {
        headingEl.textContent = String(Math.round(bearing)).padStart(3, "0");
      }
      /* the wheel answers the rudder: a few degrees of course is many of wheel */
      if (helm) {
        helm.style.setProperty(
          "--h3-wheel",
          `${((bearing - 180) * 7).toFixed(1)}deg`,
        );
      }
      if (kmEl && totalKm) kmEl.textContent = String(Math.round(totalKm * progress));

      let active = -1;
      stops.forEach((stop, i) => {
        const reached = progress >= Number(stop.dataset.h3Stop || "0") - 0.004;
        stop.classList.toggle("is-on", reached);
        marks[i]?.classList.toggle("is-on", reached);
        if (reached) active = i;
      });
      tags.forEach((tag, i) => {
        tag.setAttribute("aria-pressed", String(i === Math.max(0, active)));
      });
      if (active !== shownBerth) {
        shownBerth = active;
        berths.forEach((b, i) => b.classList.toggle("is-on", i === active));
      }
    };

    let desktop = false;
    let travel = 0;
    let scrollDistance = 0;
    /*
     * The hold. Reaching the chart stops the story: the track freezes at the
     * point where that panel is centred, `hold` pixels of scroll go into
     * sailing the channel instead, and only when Hathor ties up at Aswan does
     * the track move again. `holdAt` is where in the travel the plateau sits.
     */
    let hold = 0;
    let holdAt = 0;
    let total = 0;
    let frame = 0;
    let target = 0;
    let current = 0;
    let lastWidth = window.innerWidth;

    html.setAttribute("data-home-three", "");

    /*
     * Finish each pair while the frame is still on screen — but not before it
     * has finished arriving. With no hold the wipe is already over by the time
     * the plate reaches the middle of the stage, so the cover image is never
     * actually seen: you scroll to a frame that has always been the plate
     * underneath. The hold is a fraction of the frame's own width, so a wide
     * plate waits longer than a narrow one and both read the same way.
     */
    /* Anchored on the frame's centre, not its leading edge: measured off the
       edge, every pair here was 90% wiped by the time it reached the middle
       of the stage, so only the plate underneath was ever actually seen. On
       the centre anchor each pair is exactly half over when its frame is
       centred — both photographs on screen at once, whatever the frame's
       width, which is the whole point of a flip. */
    const FLIP_ANCHOR = "centre" as const;
    const applyFlips = (mode: "horizontal" | "vertical") => {
      flips.forEach((el) => {
        if (reduced.matches) {
          el.style.setProperty("--h3-flip", "1");
          return;
        }
        el.style.setProperty(
          "--h3-flip",
          editorialFlipProgress(
            el.getBoundingClientRect(),
            mode,
            /* the closing wall is the last thing on the track and never
               travels off it, so a centre-anchored pair would freeze half
               wiped; it arrives on the edge anchor instead */
            el.dataset.h3FlipAnchor === "edge" ? "edge" : FLIP_ANCHOR,
          ).toFixed(4),
        );
      });
    };

    /*
     * `animations.js` gives every Suites plate the same parallax: `--transY`
     * runs 100% to 0% between "top 95%" and "bottom 10%", which slides the
     * oversized source inside its own frame. Same span, same property.
     */
    const applyMedia = (mode: "horizontal" | "vertical") => {
      const viewport =
        mode === "horizontal" ? window.innerWidth : window.innerHeight;
      medias.forEach((el) => {
        if (reduced.matches) {
          el.style.setProperty("--transY", "50%");
          return;
        }
        const rect = el.getBoundingClientRect();
        const start = mode === "horizontal" ? rect.left : rect.top;
        const size = mode === "horizontal" ? rect.width : rect.height;
        const p = clamp(
          (viewport * 0.95 - start) / Math.max(1, viewport * 0.85 + size),
        );
        el.style.setProperty("--transY", `${(100 - p * 100).toFixed(2)}%`);
      });
    };

    /*
     * The projects strip. Suites opens each card 15vw to 60vw in turn on one
     * timeline, and the strip's own width is pinned so the page length never
     * moves while the cards breathe. The same shape here: the panel reports
     * one progress, each card takes its turn out of it, and the flex ratios
     * always sum to the panel — so the runway cannot jitter.
     *
     * Deliberately measured off the PANEL, never off the cards: a card's own
     * rect is mid-transition while its flex-grow animates, and feeding that
     * back into its own target is how a strip like this starts to oscillate.
     */
    const applyItems = (mode: "horizontal" | "vertical") => {
      const viewport =
        mode === "horizontal" ? window.innerWidth : window.innerHeight;
      itemGroups.forEach((group, panel) => {
        const rect = panel.getBoundingClientRect();
        const start = mode === "horizontal" ? rect.left : rect.top;
        const size = mode === "horizontal" ? rect.width : rect.height;
        const q = clamp((viewport - start) / Math.max(1, viewport + size));
        /* the reading column takes the head of the panel, so the first card
           peaks a little after the panel's own start */
        const span = 1 / (group.length + 0.6);
        group.forEach((el, i) => {
          if (reduced.matches) {
            el.style.setProperty("--item", "1");
            return;
          }
          const peak = (i + 0.9) * span;
          el.style.setProperty(
            "--item",
            (1 - clamp(Math.abs(q - peak) / (span * 1.15))).toFixed(4),
          );
        });
      });
    };

    /*
     * Hathor's passage is never taken from where the plate happens to sit on
     * screen — it is the hold's own progress, so the vessel casts off the
     * moment the page pins and Aswan is reached exactly as it releases.
     *
     *   horizontal · the caller passes the plateau progress it resolved
     *   vertical   · the sticky sub-stage inside the panel reports its own
     *
     * `held` of -1 means no plateau was measured (a viewport too short to
     * carry one, say); the passage then falls back to the plate's crossing.
     */
    const applyChart = (mode: "horizontal" | "vertical", held = -1) => {
      if (!chart) return;
      if (reduced.matches) {
        paintChart(1);
        return;
      }
      if (held >= 0) {
        paintChart(held);
        return;
      }
      if (mode === "vertical" && chartHold) {
        const rect = chartHold.getBoundingClientRect();
        const span = Math.max(1, chartHold.offsetHeight - window.innerHeight);
        paintChart(clamp(-rect.top / span));
        return;
      }
      const rect = chart.getBoundingClientRect();
      paintChart(
        mode === "horizontal"
          ? clamp(
              (window.innerWidth - rect.left) /
                Math.max(1, (window.innerWidth + rect.width) * 0.5),
            )
          : clamp(
              (window.innerHeight - rect.top) /
                Math.max(1, (window.innerHeight + rect.height) * 0.5),
            ),
      );
    };

    /*
     * One scroll value in, the track position and the passage out. Everything
     * before the plateau travels normally, the plateau itself spends its scroll
     * on the river, and everything after resumes where the track left off.
     */
    const resolve = (raw: number) => {
      if (hold <= 0) return { p: clamp(raw), held: -1 };
      const s = raw * total;
      const sHold = holdAt * scrollDistance;
      if (s <= sHold) return { p: clamp(s / scrollDistance), held: 0 };
      if (s <= sHold + hold) {
        return { p: holdAt, held: clamp((s - sHold) / hold) };
      }
      return { p: clamp((s - hold) / scrollDistance), held: 1 };
    };

    const applySceneVars = (x: number, held = -1) => {
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
        if (enter > 0.02) primeScene(scene);
      });
      applyFlips("horizontal");
      applyMedia("horizontal");
      applyItems("horizontal");
      applyChart("horizontal", held);
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
        if (progress > 0.02) primeScene(scene);
      });
      applyFlips("vertical");
      applyMedia("vertical");
      applyItems("vertical");
      applyChart("vertical");
    };

    const paint = () => {
      const { p, held } = resolve(current);
      const x = p * travel;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      applySceneVars(x, held);
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

      /* the plateau sits where the chart panel is centred on the stage */
      hold = 0;
      holdAt = 0;
      if (chartPanel) {
        holdAt = clamp(
          (chartPanel.offsetLeft +
            chartPanel.offsetWidth / 2 -
            window.innerWidth / 2) /
            travel,
        );
        hold = Math.round(window.innerHeight * 1.6);
      }
      total = scrollDistance + hold;

      run.style.height = `${total + window.innerHeight}px`;
      const rect = run.getBoundingClientRect();
      target = clamp(-rect.top / total);
      current = target;
      paint();
    };

    const tick = () => {
      frame = 0;
      if (!desktop) return;
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.0001) current = target;
      paint();
      if (progressBar) progressBar.style.transform = `scaleX(${current})`;
      if (current !== target) frame = requestAnimationFrame(tick);
    };

    const updateTarget = () => {
      if (Math.abs(window.scrollY - previousScroll) > 1) manual = null;
      previousScroll = window.scrollY;
      if (!desktop) {
        applyVerticalVars();
        return;
      }
      const rect = run.getBoundingClientRect();
      target = clamp(-rect.top / total);
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onTagClick = (event: MouseEvent) => {
      const tag =
        event.target instanceof Element
          ? event.target.closest<HTMLElement>("[data-h3-tag]")
          : null;
      if (!tag) return;
      event.preventDefault();
      manual = Number(tag.dataset.h3Tag);
      if (!desktop) {
        applyVerticalVars();
        return;
      }
      paint();
    };

    const onResize = () => {
      const width = window.innerWidth;
      const widthChanged = Math.abs(width - lastWidth) > 24;
      lastWidth = width;
      /* phone URL-bar height changes must not re-run the whole measurement */
      if (!widthChanged && window.innerWidth <= 950) {
        applyVerticalVars();
        return;
      }
      measure();
      updateTarget();
    };

    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    reduced.addEventListener("change", onResize);
    root.addEventListener("click", onTagClick);
    document.fonts?.ready.then(onResize).catch(() => undefined);
    measure();
    requestAnimationFrame(measure);

    return () => {
      followHost?.removeEventListener("pointermove", onFollowMove);
      followHost?.removeEventListener("pointerleave", onFollowLeave);
      if (window.cancelIdleCallback) window.cancelIdleCallback(primeHandle);
      else window.clearTimeout(primeHandle);
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", onResize);
      reduced.removeEventListener("change", onResize);
      root.removeEventListener("click", onTagClick);
      if (frame) cancelAnimationFrame(frame);
      html.removeAttribute("data-home-three");
      run.style.height = "";
      track.style.transform = "";
    };
  }, [rootRef, runRef, trackRef]);
}
