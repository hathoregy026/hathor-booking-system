"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";

gsap.registerPlugin(ScrollTrigger);

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => {
  const x = clamp(value);
  return x * x * (3 - 2 * x);
};

/**
 * About vessel flow — Suites-language sticky stories, unique selectors.
 *
 * 0.00–0.58 hero: still scales, caption holds
 * 0.56–1.00 hero: caption drifts, cream arrival rises
 * Collection: horizontal accommodation doors
 * Chapters: clip-path image stack, first frame visible at progress 0
 */
export function useAboutEditorialFlow(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const html = document.documentElement;
    html.setAttribute("data-about-editorial", "");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.dataset.abMotion = "reduced";
      return () => {
        html.removeAttribute("data-about-editorial");
        delete root.dataset.abMotion;
      };
    }

    root.dataset.abMotion = "ready";
    const light = shouldLightenMotionForDevice();
    const scrub = light ? 0.85 : 1.15;

    const ctx = gsap.context(() => {
      const hero = root.querySelector<HTMLElement>(".ab-hero");
      const heroMedia = hero?.querySelector<HTMLElement>(".ab-hero__media");
      const heroCaption = hero?.querySelector<HTMLElement>(".ab-hero__caption");
      const heroArrive = hero?.querySelector<HTMLElement>(".ab-hero__arrive");
      if (hero && heroMedia && heroCaption) {
        gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom bottom",
            scrub,
          },
        })
          .fromTo(
            heroMedia,
            { scale: 1.1 },
            { scale: 1, ease: "none" },
            0,
          )
          .fromTo(
            heroCaption,
            { xPercent: 0, autoAlpha: 1 },
            { xPercent: light ? 8 : 13, autoAlpha: 0, ease: "none" },
            0.56,
          );

        if (heroArrive) {
          gsap.fromTo(
            heroArrive,
            { yPercent: 108 },
            {
              yPercent: 0,
              ease: "none",
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom bottom",
                scrub,
              },
            },
          );
        }
      }

      const collection = root.querySelector<HTMLElement>("[data-ab-collection]");
      const portals = collection?.querySelector<HTMLElement>(".ab-vessel__portals");
      const portalItems = portals
        ? (Array.from(portals.children) as HTMLElement[])
        : [];
      if (collection && portals && portalItems.length) {
        const setCollection = (progress: number) => {
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
              rotate: (1 - local) * (index - 1) * 0.55,
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

      root.querySelectorAll<HTMLElement>("[data-ab-slide]").forEach((chapter) => {
        const scene = chapter.firstElementChild as HTMLElement | null;
        if (!scene) return;
        const copy = chapter.querySelector<HTMLElement>(".ab-chapter__copy");
        const frames = Array.from(
          scene.querySelectorAll<HTMLElement>(
            ".ab-chapter__media:not(.ab-chapter__stack), .ab-chapter__stack-item",
          ),
        );
        const images = Array.from(scene.querySelectorAll<HTMLElement>("img"));
        const direction = chapter.dataset.abSlide;

        const setChapter = (progress: number) => {
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
            gsap.set(copy, { autoAlpha: 1, xPercent: 0, yPercent: 0 });
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
      html.removeAttribute("data-about-editorial");
      delete root.dataset.abMotion;
    };
  }, [rootRef]);
}
