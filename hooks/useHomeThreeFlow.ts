"use client";

import { useEffect, type RefObject } from "react";
import { editorialFlipProgress } from "@/lib/editorial-flip-progress";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/*
 * Desktop proper: above the 950 switch, a pointer that can hover, motion
 * allowed. `home-three.css` gates the split choreography on this exact string,
 * so the layout and the scroll mapping can never disagree about which story is
 * running. Touch tablets above 950px keep the single act.
 */
const SPLIT_QUERY =
  "(min-width: 951px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

type HomeThreeFlowRefs = {
  rootRef: RefObject<HTMLDivElement | null>;
  runRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
};

/** One scroll-to-x mapping: a runway, and the plateau inside it. */
type Passage = {
  travel: number;
  scrollDistance: number;
  /*
   * The hold. Reaching the chart stops the story: the track freezes at the
   * point where that panel is centred, `hold` pixels of scroll go into
   * sailing the channel instead, and only when Hathor ties up at Aswan does
   * the track move again. `holdAt` is where in the travel the plateau sits.
   */
  hold: number;
  holdAt: number;
  total: number;
  target: number;
  current: number;
};

/** A pinned horizontal passage of the desktop split choreography. */
type Act = Passage & {
  run: HTMLElement;
  stage: HTMLElement;
  track: HTMLElement;
  /* acts after the first keep travelling while their stage rises into view */
  approach: boolean;
  x: number;
  held: number;
  /* vertical scroll carried onto the travel axis while the stage is unpinned */
  carry: number;
};

/**
 * Home 3 — the same editorial engine About, Contact, Suites and Royal Suites
 * already run: a sticky 100svh stage whose horizontal track is scrubbed by
 * vertical input above 950px, and natural vertical flow below it. The constants
 * (0.74 runway, 0.14 lerp, the reveal/parallax/focus formulas) are the site's,
 * not new ones — this page reads as family because it moves as family.
 *
 * On a desktop pointer the story splits: the route pins and travels to the
 * chart, holds while Hathor sails, releases into a vertical pause, pins again
 * for the voyages and the suites wall, then runs vertically to the end. Every
 * other wide screen keeps the single act. Both are painted from this one loop.
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
    const splitQuery = window.matchMedia(SPLIT_QUERY);

    /*
     * The desktop acts. Membership is fixed by the markup, so which act owns a
     * scene, a flip, a plate or a strip is resolved once here rather than on
     * every frame; anything no act owns is in a vertical passage.
     */
    const acts: Act[] = [
      ...root.querySelectorAll<HTMLElement>("[data-h3-act]"),
    ].flatMap((el, index) => {
      const stage = el.querySelector<HTMLElement>("[data-h3-act-stage]");
      const strip = el.querySelector<HTMLElement>("[data-h3-act-track]");
      if (!stage || !strip) return [];
      return [
        {
          run: el,
          stage,
          track: strip,
          approach: index > 0,
          x: 0,
          held: -1,
          carry: 0,
          travel: 0,
          scrollDistance: 0,
          hold: 0,
          holdAt: 0,
          total: 0,
          target: 0,
          current: 0,
        },
      ];
    });
    const actOf = new Map<HTMLElement, Act>();
    [...scenes, ...flips, ...medias, ...itemGroups.keys()].forEach((el) => {
      const act = acts.find((candidate) => candidate.track.contains(el));
      if (act) actOf.set(el, act);
    });
    let split = false;
    let modeKnown = false;

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
    /* the last pointer over the wall, so a scroll keeps the frame under it */
    let pointer: { x: number; y: number } | null = null;

    const showPlate = (index: number) => {
      if (index === followShown) return;
      const previous = followShown;
      followShown = index;
      if (!split) {
        followPlates.forEach((plate, i) =>
          plate.classList.toggle("is-on", i === index),
        );
        return;
      }
      /* Desktop slides instead of fading: the next photograph enters along
         the way the pointer travelled and pushes the last one out ahead of it.
         A waiting plate has no transition, so a plate is only ever seen moving
         through the frame, never crossing it on its way back to wait. */
      const from = previous < 0 || index > previous ? 101 : -101;
      followPlates.forEach((plate, i) => {
        if (i === index) {
          plate.classList.remove("is-on", "is-out");
          plate.style.setProperty("--h3-from", `${from}%`);
          /* commit the start position before the plate is told to move */
          void plate.offsetWidth;
          plate.classList.add("is-on");
        } else if (i === previous) {
          plate.style.setProperty("--h3-to", `${-from}%`);
          plate.classList.remove("is-on");
          plate.classList.add("is-out");
        } else {
          plate.classList.remove("is-on", "is-out");
        }
      });
    };

    const onFollowLeave = () => {
      pointer = null;
      follow?.classList.remove("is-live");
      showPlate(-1);
    };

    /* Desktop places the frame in px off the wall's own box. A percentage
       inside `translate` resolves against the frame, not the wall, which is
       what kept it parked in the wall's top corner over the first note. */
    const placeFollow = (x: number, y: number) => {
      if (!followHost || !follow) return;
      const rect = followHost.getBoundingClientRect();
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
        onFollowLeave();
        return;
      }
      /* arriving from off the wall, the frame lands under the pointer rather
         than flying in from wherever it last left */
      const arriving = !follow.classList.contains("is-live");
      if (arriving) follow.classList.add("is-snap");
      follow.style.setProperty("--fx", `${(x - rect.left).toFixed(1)}px`);
      follow.style.setProperty("--fy", `${(y - rect.top).toFixed(1)}px`);
      if (arriving) {
        void follow.offsetWidth;
        follow.classList.remove("is-snap");
        follow.classList.add("is-live");
      }
      /* the nearest principle owns the frame, so the gaps between them never
         fall back to the first */
      let active = 0;
      let nearest = Infinity;
      followTerms.forEach((term, i) => {
        const box = term.getBoundingClientRect();
        const distance = Math.abs(y - (box.top + box.height / 2));
        if (distance < nearest) {
          nearest = distance;
          active = i;
        }
      });
      showPlate(active);
    };

    const onFollowMove = (event: PointerEvent) => {
      if (!followHost || !follow || reduced.matches) return;
      if (split) {
        pointer = { x: event.clientX, y: event.clientY };
        placeFollow(event.clientX, event.clientY);
        return;
      }
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

    if (followHost && follow) {
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
    /* the single act every wide screen without a desktop pointer runs */
    const whole: Passage = {
      travel: 0,
      scrollDistance: 0,
      hold: 0,
      holdAt: 0,
      total: 0,
      target: 0,
      current: 0,
    };
    let frame = 0;
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
    const resolve = (passage: Passage, raw: number) => {
      const { hold, holdAt, scrollDistance, total } = passage;
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
      const { p, held } = resolve(whole, whole.current);
      const x = p * whole.travel;
      track.style.transform = `translate3d(${-x}px,0,0)`;
      applySceneVars(x, held);
    };

    /* ---- the desktop split choreography -------------------------------- */

    const measureAct = (act: Act) => {
      /* the visible stage, not innerWidth: with a classic scrollbar the act
         would otherwise stop with its last wall part-hidden beneath it */
      const stageWidth = act.stage.clientWidth;
      act.travel = Math.max(1, act.track.scrollWidth - stageWidth);
      act.scrollDistance = Math.max(1, act.travel * 0.74);
      act.hold = 0;
      act.holdAt = 0;
      if (chartPanel && act.track.contains(chartPanel)) {
        act.holdAt = clamp(
          (chartPanel.offsetLeft +
            chartPanel.offsetWidth / 2 -
            stageWidth / 2) /
            act.travel,
        );
        act.hold = Math.round(window.innerHeight * 1.6);
      }
      act.total = act.scrollDistance + act.hold;
      act.run.style.height = `${act.total + window.innerHeight}px`;
      act.target = clamp(-act.run.getBoundingClientRect().top / act.total);
      act.current = act.target;
    };

    /*
     * Where each voyage card opens along its act. Taken from the strip's fixed
     * geometry — the reading column, and the open and closed widths the flex
     * ratio resolves to — never from a card's live rect, for the reason given
     * above. The first card opens where it is first whole on the stage, so the
     * act pins with it already open beside the reading column; the rest open
     * centred.
     */
    const itemPeaks = new Map<HTMLElement, number[]>();
    const measureItems = () => {
      itemPeaks.clear();
      itemGroups.forEach((group, panel) => {
        const act = actOf.get(panel);
        if (!act) return;
        const asideWidth =
          panel.querySelector<HTMLElement>(".h3-projects__aside")?.offsetWidth ?? 0;
        const open =
          parseFloat(getComputedStyle(panel).getPropertyValue("--h3-open")) || 2.6;
        const closed = (panel.offsetWidth - asideWidth) / (group.length + open);
        const wide = closed * (1 + open);
        const stageWidth = act.stage.clientWidth;
        let floor = 0;
        itemPeaks.set(
          panel,
          group.map((_, i) => {
            const start = panel.offsetLeft + asideWidth + closed * i;
            const x =
              i === 0 ? start + wide - stageWidth : start + (wide - stageWidth) / 2;
            floor = Math.max(floor, Math.min(act.travel, x));
            return floor;
          }),
        );
      });
    };

    const applySplit = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const ratio = width / Math.max(1, height);

      acts.forEach((act) => {
        const { p, held } = resolve(act, act.current);
        act.x = p * act.travel;
        act.held = held;
        act.track.style.transform = `translate3d(${-act.x}px,0,0)`;
        /* Once a stage unpins, the scroll that moves it is carried onto the
           travel axis, so reveals, wipes and parallax inside it keep going on
           the new axis instead of freezing where the travel stopped. */
        const top = act.stage.getBoundingClientRect().top;
        act.carry = (act.approach ? -top : Math.max(0, -top)) * ratio;
      });

      scenes.forEach((scene) => {
        const act = actOf.get(scene);
        let enter: number;
        let parallax: number;
        if (act) {
          const left = scene.offsetLeft - act.x - act.carry;
          const size = scene.offsetWidth;
          enter = clamp((width * 0.96 - left) / Math.max(width * 0.5, size * 0.35));
          parallax = clamp((width - left) / Math.max(1, width + size));
        } else {
          /* the vertical passages run the act's own formulas on the other axis */
          const rect = scene.getBoundingClientRect();
          enter = clamp(
            (height * 0.96 - rect.top) / Math.max(height * 0.5, rect.height * 0.35),
          );
          parallax = clamp((height - rect.top) / Math.max(1, height + rect.height));
        }
        scene.style.setProperty("--reveal", enter.toFixed(4));
        scene.style.setProperty("--parallax", parallax.toFixed(4));
        scene.style.setProperty("--scene-progress", parallax.toFixed(4));
        scene.style.setProperty(
          "--focus",
          Math.max(0, Math.sin(parallax * Math.PI)).toFixed(4),
        );
        if (enter > 0.02) primeScene(scene);
      });

      flips.forEach((el) => {
        const act = actOf.get(el);
        const rect = el.getBoundingClientRect();
        const anchor = el.dataset.h3FlipAnchor === "edge" ? "edge" : FLIP_ANCHOR;
        const progress = act
          ? editorialFlipProgress(
              new DOMRect(rect.left - act.carry, rect.top, rect.width, rect.height),
              "horizontal",
              anchor,
            )
          : editorialFlipProgress(rect, "vertical", anchor);
        el.style.setProperty("--h3-flip", progress.toFixed(4));
      });

      medias.forEach((el) => {
        const act = actOf.get(el);
        const rect = el.getBoundingClientRect();
        const viewport = act ? width : height;
        const start = act ? rect.left - act.carry : rect.top;
        const size = act ? rect.width : rect.height;
        const p = clamp(
          (viewport * 0.95 - start) / Math.max(1, viewport * 0.85 + size),
        );
        el.style.setProperty("--transY", `${(100 - p * 100).toFixed(2)}%`);
      });

      /* each card crossfades with its neighbour between their two peaks, so
         the flex ratios still always sum to the strip */
      itemGroups.forEach((group, panel) => {
        const act = actOf.get(panel);
        const peaks = itemPeaks.get(panel);
        if (!act || !peaks) return;
        const at = act.x + act.carry;
        const last = group.length - 1;
        group.forEach((el, i) => {
          const peak = peaks[i];
          let value: number;
          if (at <= peak) {
            value = i === 0 ? 1 : 1 - (peak - at) / Math.max(1, peak - peaks[i - 1]);
          } else {
            value =
              i === last ? 1 : 1 - (at - peak) / Math.max(1, peaks[i + 1] - peak);
          }
          el.style.setProperty("--item", clamp(value).toFixed(4));
        });
      });

      const chartAct = chartPanel ? actOf.get(chartPanel) : undefined;
      applyChart(chartAct ? "horizontal" : "vertical", chartAct ? chartAct.held : -1);

      /* one line for the whole horizontal story: it fills through the route,
         waits through the pause, and finishes on the suites wall */
      if (progressBar) {
        const span = acts.reduce((sum, act) => sum + act.total, 0);
        const done = acts.reduce((sum, act) => sum + act.current * act.total, 0);
        progressBar.style.transform = `scaleX(${(done / Math.max(1, span)).toFixed(4)})`;
      }

      if (pointer) placeFollow(pointer.x, pointer.y);
    };

    const setMode = (next: boolean) => {
      if (modeKnown && next === split) return;
      modeKnown = true;
      split = next;
      root.toggleAttribute("data-h3-split", next);
      /* the two modes stage the About frame differently; start it clean */
      pointer = null;
      follow?.classList.remove("is-live", "is-snap");
      followPlates.forEach((plate) => plate.classList.remove("is-on", "is-out"));
      followShown = -1;
      if (followHost && follow) showPlate(0);
      if (next) {
        run.style.height = "";
        track.style.transform = "";
      } else {
        acts.forEach((act) => {
          act.run.style.height = "";
          act.track.style.transform = "";
        });
      }
    };

    const measure = () => {
      root.style.setProperty(
        "--h3-sbw",
        `${Math.max(0, window.innerWidth - html.clientWidth)}px`,
      );
      setMode(splitQuery.matches && acts.length > 0);
      desktop = window.innerWidth > 950 && !reduced.matches;
      if (split) {
        acts.forEach(measureAct);
        measureItems();
        applySplit();
        return;
      }
      if (!desktop) {
        run.style.height = "auto";
        track.style.transform = "none";
        applyVerticalVars();
        if (progressBar) progressBar.style.transform = "scaleX(0)";
        return;
      }
      whole.travel = Math.max(1, track.scrollWidth - window.innerWidth);
      whole.scrollDistance = Math.max(1, whole.travel * 0.74);

      /* the plateau sits where the chart panel is centred on the stage */
      whole.hold = 0;
      whole.holdAt = 0;
      if (chartPanel) {
        whole.holdAt = clamp(
          (chartPanel.offsetLeft +
            chartPanel.offsetWidth / 2 -
            window.innerWidth / 2) /
            whole.travel,
        );
        whole.hold = Math.round(window.innerHeight * 1.6);
      }
      whole.total = whole.scrollDistance + whole.hold;

      run.style.height = `${whole.total + window.innerHeight}px`;
      const rect = run.getBoundingClientRect();
      whole.target = clamp(-rect.top / whole.total);
      whole.current = whole.target;
      paint();
    };

    const tick = () => {
      frame = 0;
      if (split) {
        let moving = false;
        acts.forEach((act) => {
          act.current += (act.target - act.current) * 0.14;
          if (Math.abs(act.target - act.current) < 0.0001) act.current = act.target;
          if (act.current !== act.target) moving = true;
        });
        applySplit();
        if (moving) frame = requestAnimationFrame(tick);
        return;
      }
      if (!desktop) return;
      whole.current += (whole.target - whole.current) * 0.14;
      if (Math.abs(whole.target - whole.current) < 0.0001) {
        whole.current = whole.target;
      }
      paint();
      if (progressBar) progressBar.style.transform = `scaleX(${whole.current})`;
      if (whole.current !== whole.target) frame = requestAnimationFrame(tick);
    };

    const updateTarget = () => {
      if (Math.abs(window.scrollY - previousScroll) > 1) manual = null;
      previousScroll = window.scrollY;
      if (split) {
        acts.forEach((act) => {
          act.target = clamp(-act.run.getBoundingClientRect().top / act.total);
        });
        /* the vertical passages move with every scroll, so a frame is always
           painted even when neither act has anywhere to travel */
        if (!frame) frame = requestAnimationFrame(tick);
        return;
      }
      if (!desktop) {
        applyVerticalVars();
        return;
      }
      const rect = run.getBoundingClientRect();
      whole.target = clamp(-rect.top / whole.total);
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
      if (split) {
        applySplit();
        return;
      }
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
    splitQuery.addEventListener("change", onResize);
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
      splitQuery.removeEventListener("change", onResize);
      root.removeEventListener("click", onTagClick);
      if (frame) cancelAnimationFrame(frame);
      html.removeAttribute("data-home-three");
      root.removeAttribute("data-h3-split");
      root.style.removeProperty("--h3-sbw");
      run.style.height = "";
      track.style.transform = "";
      acts.forEach((act) => {
        act.run.style.height = "";
        act.track.style.transform = "";
      });
    };
  }, [rootRef, runRef, trackRef]);
}
