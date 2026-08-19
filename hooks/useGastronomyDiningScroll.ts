"use client";

import { useLayoutEffect, type RefObject } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/* Fifth-order easing gives the plate cut-outs a softer lift-off and a calm,
   zero-velocity landing without changing their final positions. */
const smootherstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / (edge1 - edge0));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

const snapProgress = (value: number) => Math.round(value * 1000) / 1000;

function applyScrollVars(stage: HTMLElement, progress: number) {
  const p = snapProgress(progress);
  stage.style.setProperty("--p", String(p));
  stage.style.setProperty("--a", String(snapProgress(smoothstep(0.01, 0.32, p))));
  stage.style.setProperty("--ao", String(snapProgress(1 - smoothstep(0.24, 0.42, p))));
  stage.style.setProperty("--b", String(snapProgress(smoothstep(0.28, 0.58, p))));
  stage.style.setProperty("--bo", String(snapProgress(1 - smoothstep(0.52, 0.7, p))));
  stage.style.setProperty("--c", String(snapProgress(smoothstep(0.56, 0.84, p))));
  stage.style.setProperty("--d", String(snapProgress(smoothstep(0.76, 0.96, p))));
  stage.style.setProperty("--e", String(snapProgress(smoothstep(0.88, 1, p))));
  stage.style.setProperty("--pa", String(snapProgress(smootherstep(0.02, 0.4, p))));
  stage.style.setProperty("--pb", String(snapProgress(smootherstep(0.24, 0.64, p))));
  stage.style.setProperty("--pc", String(snapProgress(smootherstep(0.5, 0.86, p))));
  stage.style.setProperty("--pd", String(snapProgress(smootherstep(0.7, 0.98, p))));
  updateDiningPile(stage, p);
}

function updateDiningPile(stage: HTMLElement, progress: number) {
  if (!stage.classList.contains("dining-cascade")) return;
  const cards = [...stage.querySelectorAll<HTMLElement>(".dining-cascade__stack figure")];
  if (!cards.length) return;

  const active = progress * Math.max(1, cards.length - 1);

  cards.forEach((card, index) => {
    const delta = active - index;
    const abs = Math.abs(delta);
    const ahead = Math.max(0, delta);
    const passed = Math.max(0, -delta);
    const opacity = delta < -0.08 ? 0 : clamp(1 - abs * 0.55);
    const scale = 1 - Math.min(Math.max(abs, 0), 1.2) * 0.06;
    const x = delta * -28 + passed * -12;
    const y = (delta < 0 ? delta * 70 : delta * 18) + ahead * 36;
    const rot = delta * -3.5;
    const brightness = 1 - Math.min(Math.max(passed, 0), 1) * 0.22;

    card.style.opacity = String(opacity);
    card.style.zIndex = String(Math.round(200 - abs * 20));
    card.style.filter = `brightness(${brightness})`;
    card.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${rot}deg) scale(${scale})`;
    card.classList.toggle("is-front", abs < 0.45);
  });
}

function motionDisabled() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  return window.matchMedia("(pointer: coarse)").matches && window.innerWidth <= 1024;
}

export function useGastronomyDiningScroll(rootRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const stages = [...root.querySelectorAll<HTMLElement>("[data-v6-scroll]")].map((stage) => ({
      stage,
      current: 0,
      target: 0,
    }));
    const progressBar = root.querySelector<HTMLElement>(
      ".gastronomy-dining-progress [data-v6-progress]",
    );
    let smoothedDocProgress = 0;
    let targetDocProgress = 0;
    let frame = 0;
    let lastTime = performance.now();
    let scrolling = false;
    let scrollIdleTimer = 0;

    const measure = () => {
      const viewport = window.innerHeight;
      const range = Math.max(1, document.documentElement.scrollHeight - viewport);
      targetDocProgress = window.scrollY / range;

      if (!motionDisabled()) {
        stages.forEach((item) => {
          const rect = item.stage.getBoundingClientRect();
          const travel = Math.max(1, item.stage.offsetHeight - viewport);
          item.target = clamp(-rect.top / travel);
        });
      }
    };

    const tick = (now: number) => {
      const delta = Math.min(32, Math.max(8, now - lastTime));
      lastTime = now;
      /* Close tracking prevents a stage from visually lagging into the next one. */
      const ease = 1 - Math.exp(-delta / 140);
      let animating = false;

      smoothedDocProgress += (targetDocProgress - smoothedDocProgress) * ease;
      if (Math.abs(targetDocProgress - smoothedDocProgress) > 0.00008) {
        animating = true;
      } else {
        smoothedDocProgress = targetDocProgress;
      }

      if (progressBar) {
        progressBar.style.transform = `scaleX(${smoothedDocProgress})`;
      }

      if (!motionDisabled()) {
        stages.forEach((item) => {
          item.current += (item.target - item.current) * ease;
          if (Math.abs(item.target - item.current) > 0.00008) {
            animating = true;
          } else {
            item.current = item.target;
          }
          applyScrollVars(item.stage, item.current);
        });
      }

      if (animating || scrolling) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    const onScroll = () => {
      scrolling = true;
      measure();
      window.clearTimeout(scrollIdleTimer);
      scrollIdleTimer = window.setTimeout(() => {
        scrolling = false;
      }, 120);
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      onScroll();
    };

    const boot = () => {
      measure();
      smoothedDocProgress = targetDocProgress;
      stages.forEach((item) => {
        item.current = item.target;
        applyScrollVars(item.stage, item.current);
      });
      if (progressBar) {
        progressBar.style.transform = `scaleX(${smoothedDocProgress})`;
      }
    };

    document.documentElement.style.scrollBehavior = "auto";
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    boot();
    requestAnimationFrame(boot);
    if (!frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(scrollIdleTimer);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [rootRef]);
}
