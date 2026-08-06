"use client";

import { RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  amenitiesWipeAngleForIndex,
  amenitiesWipeClip,
  amenitiesWipeClosed,
  amenitiesWipeOpen,
  amenitiesWipeOrigin,
  luxWipe,
  type AmenitiesWipeAngle,
} from "@/lib/fixed-mask-reveal";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function segmentProgress(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0;
  return luxWipe(clamp((progress - start) / (end - start)));
}

function readAngle(panel: HTMLElement, index: number): AmenitiesWipeAngle {
  const raw = panel.dataset.amenitiesWipe;
  if (raw === "up" || raw === "right" || raw === "down" || raw === "left") {
    return raw;
  }
  return amenitiesWipeAngleForIndex(index);
}

/**
 * Amenities-page `#i-slider` Fixed-Background Mask Reveal.
 * Consecutive slides use different amenities wipe angles
 * (up / from-right / down / from-left).
 */
export function useAmenitiesFixedMaskReveal(
  sectionRef: RefObject<HTMLElement | null>,
  slideCount: number,
) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || slideCount === 0) return;

    const captionCol = section.querySelector<HTMLElement>(
      "[data-amenities-caption-col]",
    );
    const imagesCol = section.querySelector<HTMLElement>(
      "[data-amenities-images-col]",
    );
    const panels = Array.from(
      section.querySelectorAll<HTMLElement>("[data-amenities-panel]"),
    );
    const captions = Array.from(
      section.querySelectorAll<HTMLElement>("[data-amenities-caption]"),
    );
    const progressLine = section.querySelector<HTMLElement>(
      "[data-amenities-progress]",
    );
    const triggerId = section.dataset.amenitiesMaskId ?? "amenities-mask";

    if (!captionCol || !imagesCol || panels.length === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isCompact = window.matchMedia("(max-width: 1024px)").matches;
    const isPhone = window.matchMedia("(max-width: 480px)").matches;
    const angles = panels.map((panel, index) => readAngle(panel, index));

    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set([captionCol, imagesCol, ...panels], {
          clearProps: "clipPath,transform",
        });
        captions.forEach((caption) =>
          caption.setAttribute("aria-hidden", "false"),
        );
        return;
      }

      gsap.set(captionCol, {
        clipPath: amenitiesWipeClosed("up"),
      });
      gsap.set(imagesCol, {
        clipPath: amenitiesWipeClosed("down"),
      });
      panels.forEach((panel, index) => {
        const angle = angles[index]!;
        gsap.set(panel, {
          clipPath:
            index === 0 ? amenitiesWipeOpen() : amenitiesWipeClosed(angle),
          scale: 1.2,
          xPercent: 0,
          yPercent: 0,
          zIndex: index + 1,
          transformOrigin: amenitiesWipeOrigin(angle),
        });
      });
      captions.forEach((caption, index) => {
        gsap.set(caption, {
          autoAlpha: index === 0 ? 1 : 0,
          y: index === 0 ? 0 : isPhone ? 18 : 28,
        });
      });
      if (progressLine) gsap.set(progressLine, { scaleY: 0 });

      // Amenities runway: ~ (N + 2) * 100svh section → ~ (N + 1) * 100vh scrub range.
      const keyUnits = Math.max(2, panels.length + 1);
      const key = (vh: number) => clamp(vh / (keyUnits * 100));

      const setProgress = (progress: number) => {
        const entrance = segmentProgress(progress, 0, key(100));
        gsap.set(captionCol, {
          clipPath: amenitiesWipeClip("up", entrance),
        });
        gsap.set(imagesCol, {
          clipPath: amenitiesWipeClip("down", entrance),
        });

        let activeIndex = 0;
        panels.forEach((panel, index) => {
          const angle = angles[index]!;
          if (index === 0) {
            const a = segmentProgress(progress, 0, key(100));
            const b = segmentProgress(progress, key(100), key(200));
            const scale = 1.2 - a * 0.1 - b * 0.1;
            gsap.set(panel, {
              scale,
              xPercent: 0,
              yPercent: 0,
              transformOrigin: amenitiesWipeOrigin(angle),
            });
            return;
          }

          const wipeStart = key(index * 100);
          const wipeMid = key((index + 1) * 100);
          const wipeEnd = key((index + 2) * 100);
          const wipe = segmentProgress(progress, wipeStart, wipeMid);
          const settle = segmentProgress(progress, wipeMid, wipeEnd);
          const scale = 1.2 - wipe * 0.1 - settle * 0.1;

          // Amenities intro also drifts slightly while the side wipe opens.
          let xPercent = 0;
          let yPercent = 0;
          if (angle === "right") xPercent = (1 - wipe) * 8;
          if (angle === "left") xPercent = (1 - wipe) * -8;
          if (angle === "up") yPercent = (1 - wipe) * 6;
          if (angle === "down") yPercent = (1 - wipe) * -6;

          gsap.set(panel, {
            clipPath: amenitiesWipeClip(angle, wipe),
            scale,
            xPercent,
            yPercent,
            transformOrigin: amenitiesWipeOrigin(angle),
          });
          if (wipe >= 0.5) activeIndex = index;
        });

        captions.forEach((caption, index) => {
          let visibility = 0;
          if (panels.length === 1) {
            visibility = entrance;
          } else if (index === 0) {
            const out = segmentProgress(progress, key(85), key(140));
            visibility = (1 - out) * Math.max(entrance, 0.001);
          } else {
            const wipeStart = key(index * 100);
            const inLocal = segmentProgress(
              progress,
              wipeStart + (key(100) - key(0)) * 0.08,
              wipeStart + (key(100) - key(0)) * 0.72,
            );
            const outStart = key((index + 1) * 100 + 20);
            const outLocal =
              index === panels.length - 1
                ? 0
                : segmentProgress(
                    progress,
                    outStart,
                    outStart + (key(100) - key(0)) * 0.55,
                  );
            visibility =
              Math.max(0, inLocal - outLocal) * Math.max(entrance, 0.001);
          }

          // Caption drift matches the incoming slide angle slightly.
          const angle = angles[index] ?? "up";
          let x = 0;
          let y = (1 - visibility) * (isPhone ? 16 : 26);
          if (angle === "right") x = (1 - visibility) * (isPhone ? 14 : 22);
          if (angle === "left") x = (1 - visibility) * (isPhone ? -14 : -22);
          if (angle === "down") y = (1 - visibility) * (isPhone ? -14 : -22);

          gsap.set(caption, {
            autoAlpha: visibility,
            x,
            y,
          });
          caption.setAttribute(
            "aria-hidden",
            visibility < 0.45 ? "true" : "false",
          );
        });

        panels.forEach((panel, index) => {
          panel.setAttribute(
            "aria-hidden",
            index === activeIndex ? "false" : "true",
          );
        });
        if (progressLine) gsap.set(progressLine, { scaleY: progress });
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
        refreshPriority: -90,
        invalidateOnRefresh: !isCompact,
        onUpdate: (self) => setProgress(self.progress),
      });

      return () => trigger.kill();
    }, section);

    let active = true;
    const refreshFrame = window.requestAnimationFrame(() => {
      if (active) requestScrollRefresh(`${triggerId}-layout`);
    });
    void document.fonts.ready.then(() => {
      if (active) requestScrollRefresh(`${triggerId}-fonts`);
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
