"use client";

import { RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { luxWipe } from "@/lib/fixed-mask-reveal";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

const clamp = (value: number) => Math.max(0, Math.min(1, value));

/**
 * Dining-page sticky--under-next choreography for homepage chapters.
 * Each chapter owns its own runway; the next chapter covers it.
 * Intra-chapter motion: image scale/shift + caption rise — no shared wipe.
 */
export function useHomeChapterStack(
  rootRef: RefObject<HTMLElement | null>,
  chapterCount: number,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || chapterCount === 0) return;

    const chapters = Array.from(
      root.querySelectorAll<HTMLElement>("[data-home-chapter]"),
    );
    if (chapters.length === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isPhone = window.matchMedia("(max-width: 480px)").matches;
    const isCompact = window.matchMedia("(max-width: 1024px)").matches;
    const triggerPrefix =
      root.dataset.homeChapterId ?? "home-chapter-stack";

    const context = gsap.context(() => {
      if (reducedMotion) {
        chapters.forEach((chapter) => {
          chapter.setAttribute("aria-hidden", "false");
          gsap.set(chapter.querySelectorAll("[data-home-chapter-rise]"), {
            clearProps: "all",
          });
          gsap.set(chapter.querySelectorAll("[data-home-chapter-media]"), {
            clearProps: "all",
          });
        });
        return;
      }

      const triggers: ScrollTrigger[] = [];

      chapters.forEach((chapter, index) => {
        const stage = chapter.querySelector<HTMLElement>(
          "[data-home-chapter-stage]",
        );
        const media = chapter.querySelector<HTMLElement>(
          "[data-home-chapter-media]",
        );
        const rises = Array.from(
          chapter.querySelectorAll<HTMLElement>("[data-home-chapter-rise]"),
        );
        const layout = chapter.dataset.homeLayout ?? "cinematic";

        if (!stage) return;

        gsap.set(media, {
          scale: layout === "editorial-card" ? 1.04 : 1.18,
          xPercent: layout === "split-right" || layout === "sunset-rail" ? 8 : 0,
          force3D: true,
        });
        gsap.set(rises, {
          autoAlpha: 0,
          y: isPhone ? 28 : 42,
        });

        const setProgress = (progress: number) => {
          // 0.00–0.28: caption/media settle into the chapter
          // 0.28–0.72: hold for reading
          // 0.72–1.00: gentle settle while the next chapter covers
          const enter = luxWipe(clamp(progress / 0.28));
          const settle = luxWipe(clamp((progress - 0.72) / 0.28));

          if (media) {
            if (layout === "split-right" || layout === "sunset-rail") {
              gsap.set(media, {
                scale: 1.16 - enter * 0.12 - settle * 0.04,
                xPercent: 10 - enter * 10,
              });
            } else if (layout === "dining-card" || layout === "materials") {
              gsap.set(media, {
                scale: 1.2 - enter * 0.14 - settle * 0.04,
                yPercent: (1 - enter) * 4,
              });
            } else if (layout === "editorial-card") {
              gsap.set(media, {
                scale: 1.08 - enter * 0.06,
                yPercent: (1 - enter) * 3,
              });
            } else {
              // cinematic / closing-frame
              gsap.set(media, {
                scale: 1.18 - enter * 0.14 - settle * 0.04,
                yPercent: layout === "closing-frame" ? (1 - enter) * -3 : 0,
              });
            }
          }

          rises.forEach((el, riseIndex) => {
            const delay = riseIndex * 0.05;
            const local = luxWipe(clamp((enter - delay) / (1 - delay)));
            gsap.set(el, {
              autoAlpha: local,
              y: (1 - local) * (isPhone ? 22 : 36),
            });
          });

          chapter.setAttribute(
            "aria-hidden",
            progress > 0.02 && progress < 0.98 ? "false" : index === 0 ? "false" : "true",
          );
        };

        setProgress(0);
        const trigger = ScrollTrigger.create({
          id: `${triggerPrefix}-${index}`,
          trigger: chapter,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: !isCompact,
          refreshPriority: -80 - index,
          onUpdate: (self) => setProgress(self.progress),
        });
        triggers.push(trigger);
      });

      return () => {
        triggers.forEach((trigger) => trigger.kill());
      };
    }, root);

    let active = true;
    const refreshFrame = window.requestAnimationFrame(() => {
      if (active) requestScrollRefresh(`${triggerPrefix}-layout`);
    });
    void document.fonts.ready.then(() => {
      if (active) requestScrollRefresh(`${triggerPrefix}-fonts`);
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
  }, [rootRef, chapterCount]);
}
