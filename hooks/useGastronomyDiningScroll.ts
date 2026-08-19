"use client";

import { useLayoutEffect, type RefObject } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
};

const smootherstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

const tidy = (value: number) => Math.round(value * 10000) / 10000;

const resolveRoot = (rootRef?: RefObject<HTMLDivElement | null>) =>
  rootRef?.current ??
  document.querySelector<HTMLDivElement>(".gastronomy-dining-shell");

export function useGastronomyDiningScroll(
  rootRef?: RefObject<HTMLDivElement | null>,
) {
  useLayoutEffect(() => {
    let cancelled = false;
    let frame = 0;
    let lastTime = performance.now();
    let current = 0;
    let target = 0;
    let travel = 1;
    let active = true;
    let retryCount = 0;
    let retryTimer = 0;

    const desktopQuery = window.matchMedia("(min-width: 951px)");
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const applyPlateLand = (host: HTMLElement, local: number) => {
      host.querySelectorAll<HTMLElement>("[data-nib-plate]").forEach((plate) => {
        const delay = Number.parseFloat(plate.style.getPropertyValue("--plate-delay")) || 0;
        const start = 0.1 + delay * 0.42;
        const end = 0.58 + delay * 0.34;
        plate.style.setProperty(
          "--plate-land",
          String(tidy(smootherstep(start, Math.min(0.96, end), local))),
        );
      });
    };

    const bind = (root: HTMLDivElement) => {
      const horizontal = root.querySelector<HTMLElement>("[data-nib-horizontal]");
      const track = root.querySelector<HTMLElement>("[data-nib-track]");
      const progress = root.querySelector<HTMLElement>("[data-nib-progress]");
      if (!horizontal || !track) return () => undefined;

      const panels = [...track.querySelectorAll<HTMLElement>("[data-nib-panel]")];
      const revealItems = [...root.querySelectorAll<HTMLElement>("[data-nib-reveal]")];

      const setPanelVariables = (mode: "horizontal" | "vertical", x = 0) => {
        const viewportX = window.innerWidth;
        const viewportY = window.innerHeight;

        panels.forEach((panel) => {
          let local = 0.5;
          if (mode === "horizontal") {
            const left = panel.offsetLeft + x;
            local = clamp((viewportX - left) / Math.max(1, viewportX + panel.offsetWidth));
          } else {
            const rect = panel.getBoundingClientRect();
            local = clamp(
              (viewportY - rect.top) / Math.max(1, viewportY + rect.height),
            );
          }

          const enter = smoothstep(0.04, 0.36, local);
          const late = smoothstep(0.14, 0.52, local);
          const flip = smootherstep(0.18, 0.72, local);
          const exit = 1 - smoothstep(0.74, 0.98, local);
          const activeAmount = clamp(Math.min(enter, exit) * 1.25);

          panel.style.setProperty("--nib-local", String(tidy(local)));
          panel.style.setProperty("--nib-enter", String(tidy(enter)));
          panel.style.setProperty("--nib-enter-late", String(tidy(late)));
          panel.style.setProperty("--nib-flip", String(tidy(flip)));
          panel.style.setProperty("--nib-exit", String(tidy(exit)));
          panel.style.setProperty("--nib-active", String(tidy(activeAmount)));
          panel.style.setProperty("--nib-parallax", String(tidy((0.5 - local) * 2)));
          applyPlateLand(panel, local);
        });
      };

      const measure = () => {
        const desktop = desktopQuery.matches;
        root.classList.toggle("is-horizontal", desktop);
        root.classList.toggle("is-reduced-motion", reducedQuery.matches);

        if (!desktop) {
          horizontal.style.removeProperty("height");
          track.style.removeProperty("transform");
          setPanelVariables("vertical");
          if (progress) progress.style.transform = "scaleX(0)";
          return;
        }

        travel = Math.max(1, track.scrollWidth - window.innerWidth);
        horizontal.style.height = `${Math.ceil(travel + window.innerHeight)}px`;
        const top = horizontal.getBoundingClientRect().top + window.scrollY;
        target = clamp((window.scrollY - top) / travel);
        if (!frame) {
          current = target;
          const x = -current * travel;
          track.style.transform = `translate3d(${x}px, 0, 0)`;
          setPanelVariables("horizontal", x);
        }
      };

      const readScroll = () => {
        if (!desktopQuery.matches) {
          setPanelVariables("vertical");
          return;
        }
        const top = horizontal.getBoundingClientRect().top + window.scrollY;
        target = clamp((window.scrollY - top) / Math.max(1, travel));
        if (!frame) {
          lastTime = performance.now();
          frame = requestAnimationFrame(tick);
        }
      };

      const tick = (now: number) => {
        const elapsed = Math.min(34, Math.max(8, now - lastTime));
        lastTime = now;
        const timeConstant = reducedQuery.matches ? 18 : 168;
        const ease = 1 - Math.exp(-elapsed / timeConstant);
        current += (target - current) * ease;

        if (Math.abs(target - current) < 0.00005) current = target;
        const x = -current * travel;
        track.style.transform = `translate3d(${x}px, 0, 0)`;
        track.style.setProperty("--nib-progress", String(tidy(current)));
        setPanelVariables("horizontal", x);
        if (progress) progress.style.transform = `scaleX(${tidy(current)})`;

        if (active && Math.abs(target - current) >= 0.00005) {
          frame = requestAnimationFrame(tick);
        } else {
          frame = 0;
        }
      };

      const revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) entry.target.classList.add("is-visible");
          });
        },
        { rootMargin: "0px 0px -12%", threshold: 0.08 },
      );
      revealItems.forEach((item) => revealObserver.observe(item));

      const onResize = () => {
        measure();
        readScroll();
      };

      window.addEventListener("scroll", readScroll, { passive: true });
      window.addEventListener("resize", onResize, { passive: true });
      desktopQuery.addEventListener("change", onResize);
      reducedQuery.addEventListener("change", onResize);

      measure();
      readScroll();
      const resizeFrame = requestAnimationFrame(() => {
        measure();
        readScroll();
      });

      return () => {
        window.removeEventListener("scroll", readScroll);
        window.removeEventListener("resize", onResize);
        desktopQuery.removeEventListener("change", onResize);
        reducedQuery.removeEventListener("change", onResize);
        revealObserver.disconnect();
        cancelAnimationFrame(resizeFrame);
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        horizontal.style.removeProperty("height");
        track.style.removeProperty("transform");
      };
    };

    let dispose = () => undefined;

    const start = () => {
      if (cancelled) return;
      const root = resolveRoot(rootRef);
      if (!root) {
        retryCount += 1;
        if (retryCount < 12) retryTimer = window.setTimeout(start, 32);
        return;
      }
      dispose = bind(root);
    };

    start();

    return () => {
      cancelled = true;
      active = false;
      window.clearTimeout(retryTimer);
      dispose();
    };
  }, [rootRef]);
}
