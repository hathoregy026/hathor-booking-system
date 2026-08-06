"use client";

import { RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { luxWipe } from "@/lib/fixed-mask-reveal";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

const clamp = (value: number) => Math.max(0, Math.min(1, value));

function segmentProgress(progress: number, start: number, end: number) {
  if (end <= start) return progress >= end ? 1 : 0;
  return luxWipe(clamp((progress - start) / (end - start)));
}

/**
 * Amenities-page `#i-slider` Fixed-Background Mask Reveal.
 * Timing mirrors Springs parallax keys:
 * - 0→100vh: caption rises / images fall
 * - then each next image wipes bottom→top over 100vh with scale 1.2→1.0
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
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      });
      gsap.set(imagesCol, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
      });
      panels.forEach((panel, index) => {
        gsap.set(panel, {
          clipPath:
            index === 0
              ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
              : "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          scale: index === 0 ? 1.2 : 1.2,
          zIndex: index + 1,
          transformOrigin: "50% 100%",
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
      // Map Springs "-Kvh" keys onto ScrollTrigger progress 0..1.
      const keyUnits = Math.max(2, panels.length + 1);
      const key = (vh: number) => clamp(vh / (keyUnits * 100));

      const setProgress = (progress: number) => {
        // 0.00–key(100): dual-column entrance
        const entrance = segmentProgress(progress, 0, key(100));
        const captionTop = 100 - entrance * 100;
        gsap.set(captionCol, {
          clipPath: `polygon(0% ${captionTop}%, 100% ${captionTop}%, 100% 100%, 0% 100%)`,
        });
        const imageBottom = entrance * 100;
        gsap.set(imagesCol, {
          clipPath: `polygon(0% 0%, 100% 0%, 100% ${imageBottom}%, 0% ${imageBottom}%)`,
        });

        let activeIndex = 0;
        panels.forEach((panel, index) => {
          if (index === 0) {
            // scale 1.2 @0 → 1.1 @100 → 1.0 @200
            const a = segmentProgress(progress, 0, key(100));
            const b = segmentProgress(progress, key(100), key(200));
            const scale = 1.2 - a * 0.1 - b * 0.1;
            gsap.set(panel, { scale });
            return;
          }

          const wipeStart = key(index * 100);
          const wipeMid = key((index + 1) * 100);
          const wipeEnd = key((index + 2) * 100);
          const wipe = segmentProgress(progress, wipeStart, wipeMid);
          const settle = segmentProgress(progress, wipeMid, wipeEnd);
          const top = (1 - wipe) * 100;
          gsap.set(panel, {
            clipPath: `polygon(0% ${top}%, 100% ${top}%, 100% 100%, 0% 100%)`,
            scale: 1.2 - wipe * 0.1 - settle * 0.1,
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
            visibility = Math.max(0, inLocal - outLocal) * Math.max(entrance, 0.001);
          }
          gsap.set(caption, {
            autoAlpha: visibility,
            y: (1 - visibility) * (isPhone ? 16 : 26),
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
