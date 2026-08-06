"use client";

import { RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { luxWipe } from "@/lib/fixed-mask-reveal";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function useHomeStoryFixedMaskReveal(
  sectionRef: RefObject<HTMLElement | null>,
  slideCount: number,
) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || slideCount === 0) return;

    const panels = Array.from(
      section.querySelectorAll<HTMLElement>("[data-home-story-panel]"),
    );
    if (panels.length === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isCompact = window.matchMedia("(max-width: 1024px)").matches;
    const captions = Array.from(
      section.querySelectorAll<HTMLElement>("[data-home-story-caption]"),
    );
    const progressLine = section.querySelector<HTMLElement>(
      "[data-home-story-progress]",
    );

    const context = gsap.context(() => {
      if (reducedMotion) {
        panels.forEach((panel) => {
          panel.style.clipPath = "";
          panel.style.zIndex = "";
          panel.setAttribute("aria-hidden", "false");
        });
        captions.forEach((caption) => {
          caption.setAttribute("aria-hidden", "false");
        });
        return;
      }

      panels.forEach((panel, index) => {
        gsap.set(panel, {
          clipPath: index === 0 ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)",
          zIndex: index + 1,
        });
        const image = panel.querySelector<HTMLElement>(
          ".home-dining-slider__image-link",
        );
        if (image) gsap.set(image, { scale: index === 0 ? 1.12 : 1.2 });
      });
      captions.forEach((caption, index) => {
        gsap.set(caption, {
          autoAlpha: index === 0 ? 1 : 0,
          y: index === 0 ? 0 : 24,
        });
      });
      if (progressLine) gsap.set(progressLine, { scaleY: 0 });

      const setProgress = (progress: number) => {
        // 0.00–0.30: first story holds for reading.
        // 0.30–0.68: second image wipes upward and its caption crosses in.
        // 0.68–1.00: second story settles and holds before release.
        const revealStart = isCompact ? 0.26 : 0.3;
        const revealEnd = isCompact ? 0.7 : 0.68;
        const wipeProgress = luxWipe(
          clamp((progress - revealStart) / (revealEnd - revealStart)),
        );
        const captionOut = luxWipe(
          clamp((progress - revealStart) / 0.1),
        );
        const captionIn = luxWipe(
          clamp((progress - (revealStart + 0.1)) / 0.1),
        );

        panels.forEach((panel, index) => {
          if (index === 0) {
            const image = panel.querySelector<HTMLElement>(
              ".home-dining-slider__image-link",
            );
            if (image) gsap.set(image, { scale: 1.12 - progress * 0.12 });
          } else {
            const inset = (1 - wipeProgress) * 100;
            gsap.set(panel, { clipPath: `inset(${inset}% 0 0 0)` });
            const image = panel.querySelector<HTMLElement>(
              ".home-dining-slider__image-link",
            );
            if (image) gsap.set(image, { scale: 1.2 - wipeProgress * 0.2 });
          }
        });

        captions.forEach((caption, index) => {
          const visibility = index === 0 ? 1 - captionOut : captionIn;
          gsap.set(caption, {
            autoAlpha: visibility,
            y: index === 0 ? -12 * captionOut : 18 * (1 - captionIn),
          });
          caption.setAttribute(
            "aria-hidden",
            visibility < 0.5 ? "true" : "false",
          );
        });
        panels.forEach((panel, index) => {
          panel.setAttribute(
            "aria-hidden",
            index === (wipeProgress >= 0.5 ? 1 : 0) ? "false" : "true",
          );
        });
        if (progressLine) gsap.set(progressLine, { scaleY: progress });
      };

      setProgress(0);
      const trigger = ScrollTrigger.create({
        id: "home-story-fixed-mask",
        trigger: section,
        start: () => section.getBoundingClientRect().top + window.scrollY,
        end: () =>
          section.getBoundingClientRect().top +
          window.scrollY +
          Math.max(1, section.offsetHeight - window.innerHeight),
        scrub: true,
        refreshPriority: -100,
        invalidateOnRefresh: !isCompact,
        onUpdate: (self) => setProgress(self.progress),
      });

      return () => trigger.kill();
    }, section);

    let active = true;
    const refreshFrame = window.requestAnimationFrame(() => {
      if (active) requestScrollRefresh("home-dining-slider-layout");
    });
    void document.fonts.ready.then(() => {
      if (active) requestScrollRefresh("home-dining-slider-fonts");
    });
    const settledRefresh = window.setTimeout(() => {
      if (active) ScrollTrigger.refresh();
    }, 1200);

    let lastWidth = window.innerWidth;
    const onViewportChange = () => {
      if (window.matchMedia("(max-width: 480px)").matches) {
        if (Math.abs(window.innerWidth - lastWidth) < 20) return;
      }
      lastWidth = window.innerWidth;
      ScrollTrigger.refresh();
    };

    window.addEventListener(
      isCompact ? "orientationchange" : "resize",
      onViewportChange,
    );
    return () => {
      active = false;
      window.cancelAnimationFrame(refreshFrame);
      window.clearTimeout(settledRefresh);
      window.removeEventListener(
        isCompact ? "orientationchange" : "resize",
        onViewportChange,
      );
      context.revert();
    };
  }, [sectionRef, slideCount]);
}
