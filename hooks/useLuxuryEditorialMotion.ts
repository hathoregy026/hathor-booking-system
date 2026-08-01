"use client";

import { type RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

type LuxuryPageKind = "charter" | "highlights";

/** Shared lux motion — single Lenis owner elsewhere. Page-local GSAP only. */
export function useLuxuryEditorialMotion(
  rootRef: RefObject<HTMLElement | null>,
  page: LuxuryPageKind,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add(
        {
          desktop: "(min-width: 1025px)",
          touchLayout: "(max-width: 1024px)",
          reduceMotion: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduceMotion } = context.conditions as {
            desktop: boolean;
            touchLayout: boolean;
            reduceMotion: boolean;
          };

          const revealLines = gsap.utils.toArray<HTMLElement>(
            "[data-lux-line]",
            root,
          );
          const revealMedia = gsap.utils.toArray<HTMLElement>(
            "[data-lux-media]",
            root,
          );
          const rules = gsap.utils.toArray<HTMLElement>("[data-lux-rule]", root);

          if (reduceMotion) {
            gsap.set([revealLines, revealMedia, rules], {
              clearProps: "all",
              autoAlpha: 1,
              x: 0,
              y: 0,
              xPercent: 0,
              yPercent: 0,
              scale: 1,
              clipPath: "inset(0% 0% 0% 0%)",
            });
            return;
          }

          revealLines.forEach((line) => {
            gsap.fromTo(
              line,
              { yPercent: 112, autoAlpha: 0 },
              {
                yPercent: 0,
                autoAlpha: 1,
                duration: 1.15,
                ease: "power4.out",
                scrollTrigger: {
                  trigger: line,
                  start: "top 88%",
                  once: true,
                },
              },
            );
          });

          revealMedia.forEach((media) => {
            const direction = media.dataset.luxMedia || "bottom";
            const initialClip =
              direction === "left"
                ? "inset(0% 100% 0% 0%)"
                : direction === "right"
                  ? "inset(0% 0% 0% 100%)"
                  : direction === "top"
                    ? "inset(100% 0% 0% 0%)"
                    : direction === "slit"
                      ? "inset(0% 46% 0% 46%)"
                      : "inset(0% 0% 100% 0%)";

            gsap.fromTo(
              media,
              { clipPath: initialClip },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: direction === "slit" ? 1.55 : 1.35,
                ease: "power4.inOut",
                scrollTrigger: {
                  trigger: media,
                  start: direction === "slit" ? "top 75%" : "top 86%",
                  once: true,
                },
              },
            );
          });

          rules.forEach((rule) => {
            gsap.fromTo(
              rule,
              { scaleX: 0, transformOrigin: "left center" },
              {
                scaleX: 1,
                duration: 1.1,
                ease: "power3.inOut",
                scrollTrigger: {
                  trigger: rule,
                  start: "top 92%",
                  once: true,
                },
              },
            );
          });

          /* Hero open */
          const heroImg = root.querySelector<HTMLElement>("[data-lux-hero-img]");
          if (heroImg) {
            gsap.fromTo(
              heroImg,
              { scale: 1.045 },
              { scale: 1, duration: 2, ease: "power3.out" },
            );
          }

          if (desktop) {
            if (heroImg) {
              const hero = root.querySelector<HTMLElement>("[data-lux-hero]");
              if (hero) {
                gsap.to(heroImg, {
                  yPercent: 6,
                  ease: "none",
                  scrollTrigger: {
                    trigger: hero,
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                  },
                });
              }
            }

            gsap.utils
              .toArray<HTMLElement>("[data-lux-parallax]", root)
              .forEach((item) => {
                const amount = Number(item.dataset.luxParallax || 5);
                gsap.fromTo(
                  item,
                  { yPercent: -amount },
                  {
                    yPercent: amount,
                    ease: "none",
                    scrollTrigger: {
                      trigger: item,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true,
                    },
                  },
                );
              });

            const horizontal = root.querySelector<HTMLElement>(
              "[data-lux-horizontal]",
            );
            const horizontalTrack = horizontal?.querySelector<HTMLElement>(
              "[data-lux-horizontal-track]",
            );

            if (horizontal && horizontalTrack) {
              const getDistance = () =>
                Math.max(
                  0,
                  horizontalTrack.scrollWidth - horizontal.clientWidth,
                );

              gsap.to(horizontalTrack, {
                x: () => -getDistance(),
                ease: "none",
                scrollTrigger: {
                  trigger: horizontal,
                  start: "top top",
                  end: () => `+=${Math.max(getDistance(), window.innerHeight)}`,
                  pin: true,
                  scrub: true,
                  invalidateOnRefresh: true,
                  anticipatePin: 1,
                },
              });
            }

            /* Day narrative scrub */
            const day = root.querySelector<HTMLElement>("[data-lux-day]");
            if (day) {
              const moments = gsap.utils.toArray<HTMLElement>(
                "[data-lux-day-moment]",
                day,
              );
              const slides = gsap.utils.toArray<HTMLElement>(
                "[data-lux-day-slide]",
                day,
              );
              if (moments.length && slides.length) {
                ScrollTrigger.create({
                  trigger: day,
                  start: "top top",
                  end: "bottom bottom",
                  scrub: true,
                  onUpdate: (self) => {
                    const idx = Math.min(
                      moments.length - 1,
                      Math.floor(self.progress * moments.length),
                    );
                    moments.forEach((m, i) =>
                      m.toggleAttribute("data-active", i === idx),
                    );
                    slides.forEach((s, i) =>
                      s.toggleAttribute("data-active", i === idx),
                    );
                  },
                });
              }
            }

            /* Immersive parallax columns — max 3 */
            gsap.utils
              .toArray<HTMLElement>("[data-lux-immerse]", root)
              .slice(0, 3)
              .forEach((col, i) => {
                const amount = 4 + i * 2;
                gsap.fromTo(
                  col,
                  { yPercent: -amount },
                  {
                    yPercent: amount,
                    ease: "none",
                    scrollTrigger: {
                      trigger: col.parentElement,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true,
                    },
                  },
                );
              });
          }

          root.dataset.luxMotionReady = page;
        },
      );
    }, root);

    const onLoad = () => requestScrollRefresh(`${page}-lux-load`);
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => requestScrollRefresh(`${page}-lux-mount`));

    return () => {
      window.removeEventListener("load", onLoad);
      delete root.dataset.luxMotionReady;
      mm.revert();
      ctx.revert();
    };
  }, [page, rootRef]);
}
