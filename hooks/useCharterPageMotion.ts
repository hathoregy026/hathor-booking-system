"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";

function revealAll(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>("[data-charter-reveal]").forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
  const img = root.querySelector<HTMLElement>("[data-charter-hero-img]");
  if (img) img.style.transform = "none";
  root
    .querySelectorAll<HTMLElement>(
      "[data-charter-hero-eyebrow], [data-charter-hero-line] span, [data-charter-hero-script], [data-charter-hero-copy], [data-charter-hero-actions], [data-charter-hero-marker], [data-charter-hero-scroll]",
    )
    .forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
}

/**
 * Charter page motion — hero entrance + IntersectionObserver section reveals.
 * No pins, no ScrollTrigger scrub, no second scroll controller.
 */
export function useCharterPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.removeAttribute("data-charter-motion");
      revealAll(root);
      return;
    }

    root.setAttribute("data-charter-motion", "on");
    const light = shouldLightenMotionForDevice();
    const ease = "power3.out";
    let safetyTimer: ReturnType<typeof setTimeout> | undefined;
    let observer: IntersectionObserver | undefined;

    const ctx = gsap.context(() => {
      const heroImg = root.querySelector<HTMLElement>("[data-charter-hero-img]");
      const overlay = root.querySelector<HTMLElement>("[data-charter-hero-overlay]");
      const eyebrow = root.querySelector<HTMLElement>("[data-charter-hero-eyebrow]");
      const lines = gsap.utils.toArray<HTMLElement>("[data-charter-hero-line]");
      const script = root.querySelector<HTMLElement>("[data-charter-hero-script]");
      const copy = root.querySelector<HTMLElement>("[data-charter-hero-copy]");
      const actions = root.querySelector<HTMLElement>("[data-charter-hero-actions]");
      const marker = root.querySelector<HTMLElement>("[data-charter-hero-marker]");
      const scrollCue = root.querySelector<HTMLElement>("[data-charter-hero-scroll]");

      if (heroImg) gsap.set(heroImg, { scale: 1.04 });
      if (overlay) gsap.set(overlay, { opacity: 0.85 });
      if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 16 });
      lines.forEach((line) => {
        const inner = line.querySelector("span") ?? line;
        gsap.set(inner, { yPercent: 110, opacity: 0 });
      });
      if (script) gsap.set(script, { opacity: 0, y: 14 });
      if (copy) gsap.set(copy, { opacity: 0, y: 18 });
      if (actions) gsap.set(actions, { opacity: 0, y: 16 });
      if (marker) gsap.set(marker, { opacity: 0 });
      if (scrollCue) gsap.set(scrollCue, { opacity: 0 });

      const tl = gsap.timeline({ defaults: { ease } });

      if (heroImg) {
        tl.to(heroImg, { scale: 1, duration: light ? 1.2 : 1.6 }, 0);
      }
      if (overlay) {
        tl.to(overlay, { opacity: 1, duration: 1.1 }, 0.1);
      }
      if (eyebrow) {
        tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0.25);
      }
      lines.forEach((line, i) => {
        const inner = line.querySelector("span") ?? line;
        tl.to(
          inner,
          { yPercent: 0, opacity: 1, duration: light ? 0.75 : 0.95 },
          0.4 + i * 0.12,
        );
      });
      if (script) {
        tl.to(script, { opacity: 1, y: 0, duration: 0.7 }, 0.7);
      }
      if (copy) {
        tl.to(copy, { opacity: 1, y: 0, duration: 0.75 }, 0.9);
      }
      if (actions) {
        tl.to(actions, { opacity: 1, y: 0, duration: 0.7 }, 1.05);
      }
      if (marker) {
        tl.to(marker, { opacity: 1, duration: 0.6 }, 1.15);
      }
      if (scrollCue) {
        tl.to(scrollCue, { opacity: 1, duration: 0.6 }, 1.25);
      }

      const reveals = gsap.utils.toArray<HTMLElement>("[data-charter-reveal]");
      reveals.forEach((el) => {
        gsap.set(el, { opacity: 0, y: light ? 22 : 36 });
      });

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target as HTMLElement;
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: light ? 0.7 : 0.95,
              ease,
              overwrite: true,
            });
            observer?.unobserve(el);
          });
        },
        { root: null, threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
      );

      reveals.forEach((el) => observer?.observe(el));

      safetyTimer = setTimeout(() => {
        reveals.forEach((el) => {
          const opacity = Number.parseFloat(getComputedStyle(el).opacity);
          if (opacity < 0.05) {
            gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });
          }
        });
      }, 3500);
    }, root);

    return () => {
      if (safetyTimer) clearTimeout(safetyTimer);
      observer?.disconnect();
      ctx.revert();
      root.removeAttribute("data-charter-motion");
      revealAll(root);
    };
  }, [rootRef]);
}
