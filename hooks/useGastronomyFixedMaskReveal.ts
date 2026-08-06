"use client";

import { useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Hold at edges, ease the middle — same grammar as curtain-reveal */
function luxWipe(t: number) {
  const hold = 0.14;
  if (t <= hold) return 0;
  if (t >= 1 - hold) return 1;
  const u = (t - hold) / (1 - hold * 2);
  return gsap.parseEase("power3.inOut")(u);
}

function applyVerticalWipe(
  panels: HTMLElement[],
  progress: number,
  onActive: (index: number) => void,
) {
  const n = panels.length;
  const wipes = Math.max(1, n - 1);

  panels.forEach((panel, i) => {
    if (i === 0) {
      gsap.set(panel, { clipPath: "inset(0% 0 0 0)", zIndex: 1 });
      return;
    }

    const start = (i - 1) / wipes;
    const end = i / wipes;
    const raw = Math.max(0, Math.min(1, (progress - start) / (end - start)));
    const t = luxWipe(raw);
    const inset = (1 - t) * 100;

    gsap.set(panel, {
      clipPath: `inset(${inset}% 0 0 0)`,
      zIndex: 1 + i,
    });
  });

  const idx = Math.min(n - 1, Math.max(0, Math.floor(progress * wipes + 0.55)));
  onActive(idx);
}

function applyHorizontalWipe(
  panels: HTMLElement[],
  progress: number,
  onActive: (index: number) => void,
) {
  const n = panels.length;
  const transitions = Math.max(1, n - 1);
  const t = Math.max(0, Math.min(1, progress)) * transitions;
  const from = Math.min(transitions, Math.floor(t));
  const local = t - from;
  const to = Math.min(n - 1, from + (from < transitions ? 1 : 0));

  const nextActive = Math.min(n - 1, Math.round(t));
  onActive(nextActive);

  panels.forEach((panel, i) => {
    if (i < to) {
      gsap.set(panel, { clipPath: "inset(0% 0 0 0)", zIndex: 2 });
    } else if (i === to) {
      const eased = from === to ? 1 : luxWipe(local);
      const inset = Math.max(0, Math.min(100, (1 - eased) * 100));
      gsap.set(panel, {
        clipPath: `inset(0 0 0 ${inset}%)`,
        zIndex: 4,
      });
    } else {
      gsap.set(panel, { clipPath: "inset(0 0 0 100%)", zIndex: 1 });
    }
  });
}

export function useGastronomyFixedMaskReveal(
  stageRef: RefObject<HTMLElement | null>,
  progressRef: RefObject<HTMLElement | null>,
  onActiveChange: (index: number) => void,
) {
  const activeRef = useRef(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const panels = gsap.utils.toArray<HTMLElement>(
      stage.querySelectorAll("[data-gastronomy-panel]"),
    );
    const n = panels.length;
    if (n < 2) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bar = progressRef.current;

    const setActive = (index: number) => {
      if (index === activeRef.current) return;
      activeRef.current = index;
      onActiveChange(index);
    };

    const ctx = gsap.context(() => {
      panels.forEach((panel, i) => {
        gsap.set(panel, {
          clipPath: i === 0 ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)",
          zIndex: i + 1,
        });
      });

      if (reduced) {
        setActive(0);
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1025px)", () => {
        const wipes = n - 1;

        const st = ScrollTrigger.create({
          trigger: stage,
          start: "top top",
          end: () => `+=${window.innerHeight * wipes * 1.85}`,
          pin: true,
          pinSpacing: true,
          pinType: "fixed",
          scrub: 1.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            applyVerticalWipe(panels, p, setActive);
            if (bar) gsap.set(bar, { scaleX: p });
          },
        });

        applyVerticalWipe(panels, 0, setActive);
        if (bar) gsap.set(bar, { scaleX: 0 });

        return () => st.kill();
      });

      mm.add("(max-width: 1024px)", () => {
        const track = stage.parentElement;
        if (!track) return;

        const progress = { value: 0 };
        const tween = gsap.to(progress, {
          value: 1,
          ease: "none",
          onUpdate: () => {
            applyHorizontalWipe(panels, progress.value, setActive);
            if (bar) gsap.set(bar, { scaleX: progress.value });
          },
          scrollTrigger: {
            trigger: track,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.1,
            invalidateOnRefresh: true,
          },
        });

        applyHorizontalWipe(panels, 0, setActive);
        if (bar) gsap.set(bar, { scaleX: 0 });

        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
    }, stage);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 120);

    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, [stageRef, progressRef, onActiveChange]);
}
