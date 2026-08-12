"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Springs-style continuity for Suites: chapters lift through a soft mask while
 * their media keeps drifting underneath. Motion is scroll-linked, not a set of
 * one-shot reveal blocks.
 */
export function useSuitesSpringsFlow(
  rootRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const chapters = Array.from(
      root.querySelectorAll<HTMLElement>(".sn-section, .sn-cta"),
    );

    const ctx = gsap.context(() => {
      chapters.forEach((chapter, index) => {
        chapter.style.zIndex = String(index + 2);

        gsap.fromTo(
          chapter,
          {
            clipPath: "inset(10% 0% 0% 0% round 48% 48% 0 0)",
            y: "7svh",
          },
          {
            clipPath: "inset(0% 0% 0% 0% round 0% 0% 0 0)",
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: chapter,
              start: "top 96%",
              end: "top 52%",
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          },
        );

        const media = Array.from(
          chapter.querySelectorAll<HTMLElement>(
            ".sn-editorial__media img, .sn-editorial__stack-item img, .sn-panels__item img, .sn-map__media img, .sn-craft__media-row img, .sn-interiors__gallery img, .sn-suite-portal__media img",
          ),
        );
        media.forEach((image, imageIndex) => {
          gsap.fromTo(
            image,
            { yPercent: imageIndex % 2 ? -7 : 7, scale: 1.1 },
            {
              yPercent: imageIndex % 2 ? 7 : -7,
              scale: 1.02,
              ease: "none",
              scrollTrigger: {
                trigger: image.closest("figure, a, div") ?? image,
                start: "top bottom",
                end: "bottom top",
                scrub: 1,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        const copy = chapter.querySelector<HTMLElement>(
          ".sn-editorial__copy, .sn-statement, .sn-map > div:last-child, .sn-interiors > div:last-child, .sn-collection__header",
        );
        if (copy) {
          gsap.fromTo(
            copy,
            { y: 56, autoAlpha: 0.35 },
            {
              y: 0,
              autoAlpha: 1,
              ease: "none",
              scrollTrigger: {
                trigger: chapter,
                start: "top 82%",
                end: "top 38%",
                scrub: 0.7,
              },
            },
          );
        }
      });
    }, root);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, [rootRef]);
}
