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
 * Critical: scrub must start while the section is entering the viewport
 * (`start: "top bottom"`), so content is already visible by the time sticky locks.
 * Starting at `"top top"` with enter=0 left users stuck on blank cream runways.
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
            scrub: true,
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
          const maxTravel = Math.max(
            0,
            portals.scrollWidth - window.innerWidth + window.innerWidth * 0.08,
          );
          gsap.set(portals, { x: -maxTravel * smooth(progress), force3D: true });
          portalItems.forEach((item, index) => {
            // Settle quickly — avoid floating cards for a full sticky viewport.
            const local = smooth(clamp(progress * 3.2 - index * 0.22));
            gsap.set(item, {
              y: `${(1 - local) * (index % 2 ? 4 : 7)}vh`,
              rotate: (1 - local) * (index - 1) * 0.6,
            });
          });
        };

        const collectionTrigger = ScrollTrigger.create({
          trigger: collection,
          // Reveal / settle while the section approaches, not after sticky locks.
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => setCollection(self.progress),
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
          // Fast enter so sticky lock is never a blank cream screen.
          const enter = smooth(clamp(progress / 0.18));
          // Soft exit only at the very end of the runway.
          const exit = smooth(clamp((progress - 0.9) / 0.1));
          const copyVisible = Math.max(0, enter - exit);

          frames.forEach((frame, index) => {
            const delayed =
              frames.length > 1
                ? index === 0
                  ? enter
                  : smooth(clamp((progress - (0.12 + index * 0.14)) / 0.14))
                : enter;
            const hidden = (1 - delayed) * 100;
            const clipPath =
              direction === "from-left"
                ? `inset(0% ${hidden}% 0% 0%)`
                : direction === "from-bottom"
                  ? `inset(${hidden}% 0% 0% 0%)`
                  : `inset(0% 0% 0% ${hidden}%)`;
            gsap.set(frame, {
              clipPath,
              autoAlpha: delayed,
              xPercent:
                direction === "from-right"
                  ? (1 - delayed) * 10
                  : direction === "from-left"
                    ? (delayed - 1) * 10
                    : 0,
              yPercent: direction === "from-bottom" ? (1 - delayed) * 8 : 0,
            });
          });

          images.forEach((image, index) => {
            const phase = smooth(clamp(progress * 2.4 - index * 0.4));
            gsap.set(image, {
              scale: 1.1 - phase * 0.08,
              yPercent: (0.5 - progress) * (index % 2 ? -4 : 4),
            });
          });

          if (copy) {
            gsap.set(copy, {
              autoAlpha: copyVisible,
              xPercent:
                (1 - enter) * (direction === "from-left" ? 8 : -8) - exit * 6,
              yPercent: direction === "from-bottom" ? (1 - enter) * 6 : 0,
            });
          }
        };

        const chapterTrigger = ScrollTrigger.create({
          trigger: chapter,
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => setChapter(self.progress),
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
