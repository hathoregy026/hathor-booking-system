"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};

/**
 * Springs-style Suites flow: horizontal accommodation rail + sticky editorial chapters.
 *
 * Each sticky story starts at `top top` and finishes at `bottom bottom`.
 * Its first frame is already visible at progress 0, so no scene advances before
 * it owns the viewport and no copy disappears before the sticky lock releases.
 */
export function useSuitesSpringsFlow(
  rootRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    root.dataset.snMotion = "ready";

    const ctx = gsap.context(() => {
      const hero = root.querySelector<HTMLElement>(".sn-mosaic-hero");
      const heroPlane = hero?.querySelector<HTMLElement>(".sn-mosaic-hero__plane");
      const heroCaption = hero?.querySelector<HTMLElement>(".sn-mosaic-hero__caption");
      if (hero && heroPlane && heroCaption) {
        gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.15,
          },
        })
          .fromTo(
            heroPlane,
            { scale: 1.08, xPercent: -50, yPercent: -48 },
            { scale: 0.91, xPercent: -50, yPercent: -55, ease: "none" },
            0,
          )
          .fromTo(
            heroCaption,
            { xPercent: 0, autoAlpha: 1 },
            { xPercent: 13, autoAlpha: 0, ease: "none" },
            0.56,
          );
      }

      const collection = root.querySelector<HTMLElement>("[data-sn-collection-slider]");
      const portals = collection?.querySelector<HTMLElement>(".sn-collection__portals");
      const portalItems = portals
        ? (Array.from(portals.children) as HTMLElement[])
        : [];
      if (collection && portals && portalItems.length) {
        const setCollection = (progress: number) => {
          // Hold the first and final accommodation briefly at each end.
          const travelProgress = smooth(clamp((progress - 0.07) / 0.86));
          const maxTravel = Math.max(
            0,
            portals.scrollWidth - window.innerWidth + window.innerWidth * 0.08,
          );
          gsap.set(portals, { x: -maxTravel * travelProgress, force3D: true });
          portalItems.forEach((item, index) => {
            const local = smooth(
              clamp((progress - (0.02 + index * 0.1)) / 0.22),
            );
            gsap.set(item, {
              y: `${(1 - local) * (index % 2 ? 4 : 7)}vh`,
              rotate: (1 - local) * (index - 1) * 0.6,
            });
          });
        };

        const collectionTrigger = ScrollTrigger.create({
          trigger: collection,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onUpdate: (self) => setCollection(self.progress),
          onRefresh: (self) => setCollection(self.progress),
        });
        setCollection(collectionTrigger.progress);
      }

      root.querySelectorAll<HTMLElement>("[data-sn-slide]").forEach((chapter) => {
        const scene = chapter.firstElementChild as HTMLElement | null;
        if (!scene) return;
        const copy = chapter.querySelector<HTMLElement>(
          ".sn-editorial__copy, .sn-map > div:last-child, .sn-interiors > div:last-child",
        );
        const frames = Array.from(
          scene.querySelectorAll<HTMLElement>(
            ".sn-editorial__media-col:not(.sn-editorial__stack), .sn-editorial__stack-item, .sn-map__media, .sn-interiors__gallery figure",
          ),
        );
        const images = Array.from(scene.querySelectorAll<HTMLElement>("img"));
        const direction = chapter.dataset.snSlide;

        const setChapter = (progress: number) => {
          // Three-image chapters: first holds to 26%, second reveals 26–38%
          // and holds to 62%, third reveals 62–74% and remains through release.
          // Single-image chapters remain fully composed for their whole runway.
          const revealWindows = [
            [0, 0],
            [0.26, 0.38],
            [0.62, 0.74],
          ] as const;

          frames.forEach((frame, index) => {
            const revealWindow = revealWindows[index] ?? [0.72, 0.84];
            const reveal =
              index === 0 || frames.length === 1
                ? 1
                : smooth(
                    clamp(
                      (progress - revealWindow[0]) /
                        (revealWindow[1] - revealWindow[0]),
                    ),
                  );
            const hidden = (1 - reveal) * 100;
            const clipPath =
              direction === "from-left"
                ? `inset(0% ${hidden}% 0% 0%)`
                : direction === "from-bottom"
                  ? `inset(${hidden}% 0% 0% 0%)`
                  : `inset(0% 0% 0% ${hidden}%)`;
            gsap.set(frame, {
              clipPath,
              autoAlpha: reveal,
              xPercent:
                direction === "from-right"
                  ? (1 - reveal) * 6
                  : direction === "from-left"
                    ? (reveal - 1) * 6
                    : 0,
              yPercent: direction === "from-bottom" ? (1 - reveal) * 5 : 0,
            });
          });

          images.forEach((image, index) => {
            const imageStart = index === 0 ? 0 : (revealWindows[index]?.[0] ?? 0.7);
            const phase = smooth(clamp((progress - imageStart) / (1 - imageStart)));
            gsap.set(image, {
              scale: 1.045 - phase * 0.035,
              yPercent: (0.5 - phase) * (index % 2 ? -1.5 : 1.5),
            });
          });

          if (copy) {
            gsap.set(copy, {
              autoAlpha: 1,
              xPercent: 0,
              yPercent: 0,
            });
          }
        };

        const chapterTrigger = ScrollTrigger.create({
          trigger: chapter,
          start: "top top",
          end: "bottom bottom",
          invalidateOnRefresh: true,
          onUpdate: (self) => setChapter(self.progress),
          onRefresh: (self) => setChapter(self.progress),
        });
        setChapter(chapterTrigger.progress);
      });
    }, root);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
      delete root.dataset.snMotion;
    };
  }, [rootRef]);
}
