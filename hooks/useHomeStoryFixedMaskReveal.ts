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
    const pagerNumber = section.querySelector<HTMLElement>(
      "[data-home-story-pager-num]",
    );
    const progressAxis =
      progressLine?.dataset.homeStoryProgressAxis === "x" ? "x" : "y";
    const triggerId =
      section.dataset.homeMaskId ?? "home-story-fixed-mask";

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
          "[data-home-mask-image]",
        );
        if (image) gsap.set(image, { scale: index === 0 ? 1.1 : 1.16 });
      });
      captions.forEach((caption, index) => {
        gsap.set(caption, {
          autoAlpha: index === 0 ? 1 : 0,
          y: index === 0 ? 0 : 24,
        });
      });
      if (progressLine) {
        gsap.set(progressLine, progressAxis === "x" ? { scaleX: 0 } : { scaleY: 0 });
      }

      const setProgress = (progress: number) => {
        const isTwoSlideStory = panels.length === 2;
        const twoSlideStart = isCompact ? 0.26 : 0.3;
        const twoSlideEnd = isCompact ? 0.7 : 0.68;
        const transitionProgress = panels.map((_, index) => {
          if (index === 0) return 1;
          if (isTwoSlideStory) {
            return luxWipe(
              clamp(
                (progress - twoSlideStart) /
                  (twoSlideEnd - twoSlideStart),
              ),
            );
          }
          const center = index / panels.length;
          const halfWidth = isCompact ? 0.075 : 0.065;
          return luxWipe(
            clamp(
              (progress - (center - halfWidth)) /
                (halfWidth * 2),
            ),
          );
        });

        panels.forEach((panel, index) => {
          if (index === 0) {
            const image = panel.querySelector<HTMLElement>(
              "[data-home-mask-image]",
            );
            if (image) gsap.set(image, { scale: 1.1 - progress * 0.1 });
          } else {
            const wipeProgress = transitionProgress[index];
            const inset = (1 - wipeProgress) * 100;
            gsap.set(panel, { clipPath: `inset(${inset}% 0 0 0)` });
            const image = panel.querySelector<HTMLElement>(
              "[data-home-mask-image]",
            );
            if (image) gsap.set(image, { scale: 1.16 - wipeProgress * 0.16 });
          }
        });

        captions.forEach((caption, index) => {
          let visibility: number;
          if (isTwoSlideStory) {
            const captionOut = luxWipe(
              clamp((progress - twoSlideStart) / 0.1),
            );
            const captionIn = luxWipe(
              clamp((progress - (twoSlideStart + 0.1)) / 0.1),
            );
            visibility = index === 0 ? 1 - captionOut : captionIn;
          } else {
            const previousCenter = index / panels.length;
            const nextCenter = (index + 1) / panels.length;
            const visibilityIn =
              index === 0
                ? 1
                : luxWipe(
                    clamp((progress - (previousCenter - 0.01)) / 0.07),
                  );
            const visibilityOut =
              index === panels.length - 1
                ? 1
                : 1 -
                  luxWipe(
                    clamp((progress - (nextCenter - 0.08)) / 0.07),
                  );
            visibility = Math.min(visibilityIn, visibilityOut);
          }
          gsap.set(caption, {
            autoAlpha: visibility,
            y: 18 * (1 - visibility),
          });
          caption.setAttribute(
            "aria-hidden",
            visibility < 0.5 ? "true" : "false",
          );
        });
        const activeIndex = isTwoSlideStory
          ? transitionProgress[1] >= 0.5
            ? 1
            : 0
          : Math.min(
              panels.length - 1,
              Math.floor(progress * panels.length),
            );
        panels.forEach((panel, index) => {
          panel.setAttribute(
            "aria-hidden",
            index === activeIndex ? "false" : "true",
          );
        });
        if (pagerNumber) {
          pagerNumber.textContent = String(activeIndex + 1).padStart(2, "0");
        }
        if (progressLine) {
          gsap.set(
            progressLine,
            progressAxis === "x" ? { scaleX: progress } : { scaleY: progress },
          );
        }
      };

      setProgress(0);
      const trigger = ScrollTrigger.create({
        id: triggerId,
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
