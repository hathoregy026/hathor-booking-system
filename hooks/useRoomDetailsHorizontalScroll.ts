"use client";

import { useEffect, type RefObject } from "react";

const clamp = (value: number) => Math.max(0, Math.min(1, value));

type RoomScrollRefs = {
  rootRef: RefObject<HTMLElement | null>;
  runRef: RefObject<HTMLElement | null>;
  trackRef: RefObject<HTMLDivElement | null>;
};

export function useRoomDetailsHorizontalScroll({ rootRef, runRef, trackRef }: RoomScrollRefs) {
  useEffect(() => {
    const root = rootRef.current;
    const run = runRef.current;
    const track = trackRef.current;
    if (!root || !run || !track) return;

    const progress = root.querySelector<HTMLElement>("[data-room-progress]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const html = document.documentElement;
    let desktop = false;
    let travel = 0;
    let scrollDistance = 1;
    let target = 0;
    let current = 0;
    let frame = 0;

    const render = () => {
      frame = 0;
      current += (target - current) * 0.14;
      if (Math.abs(target - current) < 0.0001) current = target;
      track.style.transform = `translate3d(${-current * travel}px, 0, 0)`;
      if (progress) progress.style.transform = `scaleX(${current})`;
      if (current !== target) frame = requestAnimationFrame(render);
    };

    const update = () => {
      if (!desktop) return;
      target = clamp(-run.getBoundingClientRect().top / scrollDistance);
      if (!frame) frame = requestAnimationFrame(render);
    };

    const measure = () => {
      desktop = window.innerWidth > 950 && !reducedMotion.matches;
      if (!desktop) {
        run.style.height = "auto";
        track.style.transform = "none";
        if (progress) progress.style.transform = "scaleX(0)";
        return;
      }
      travel = Math.max(1, track.scrollWidth - window.innerWidth);
      scrollDistance = Math.max(1, travel * 0.74);
      run.style.height = `${scrollDistance + window.innerHeight}px`;
      target = clamp(-run.getBoundingClientRect().top / scrollDistance);
      current = target;
      track.style.transform = `translate3d(${-current * travel}px, 0, 0)`;
      if (progress) progress.style.transform = `scaleX(${current})`;
    };

    html.setAttribute("data-room-editorial", "");
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    reducedMotion.addEventListener("change", measure);
    document.fonts?.ready.then(measure).catch(() => undefined);
    measure();
    requestAnimationFrame(measure);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
      reducedMotion.removeEventListener("change", measure);
      if (frame) cancelAnimationFrame(frame);
      html.removeAttribute("data-room-editorial");
      run.style.height = "";
      track.style.transform = "";
    };
  }, [rootRef, runRef, trackRef]);
}
