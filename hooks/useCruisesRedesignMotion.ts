"use client";

/**
 * Faithful port of assets/pages redesign/.../js/cruises.js
 */

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

export function useCruisesRedesignMotion(
  rootRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (!prefersReduced) {
        const runSplits = () => {
          root.querySelectorAll<HTMLElement>(".cruise-intro-title").forEach((title) => {
            title.querySelectorAll<HTMLElement>(".cruise-intro-line").forEach((line) => {
              const split = new SplitType(line, { types: "chars" });
              gsap.from(split.chars, {
                y: 40,
                opacity: 0,
                duration: 0.45,
                stagger: 0.02,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: title,
                  start: "top 80%",
                  once: true,
                },
              });
            });
          });

          root.querySelectorAll<HTMLElement>(".cruise-exp-title").forEach((title) => {
            title.querySelectorAll<HTMLElement>(".cruise-intro-line").forEach((line) => {
              const split = new SplitType(line, { types: "chars" });
              gsap.from(split.chars, {
                y: 36,
                opacity: 0,
                duration: 0.4,
                stagger: 0.02,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: title,
                  start: "top 82%",
                  once: true,
                },
              });
            });
          });
        };
        if (document.fonts?.ready) void document.fonts.ready.then(runSplits);
        else runSplits();

        gsap.utils
          .toArray<HTMLElement>(root.querySelectorAll(".cruise-reveal"))
          .forEach((el, i) => {
            gsap.from(el, {
              y: 28,
              opacity: 0,
              duration: 0.7,
              ease: "power2.out",
              delay: (i % 4) * 0.06,
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                once: true,
              },
            });
          });
      }

      /* Card cascade */
      const cards = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".cruise-card"),
      );
      if (cards.length && !prefersReduced) {
        cards.forEach((card) => {
          const media = card.querySelector<HTMLElement>(".cruise-card-media");
          const body = card.querySelector<HTMLElement>(".cruise-card-body");
          gsap.set(card, { opacity: 0, y: 60 });
          if (media) {
            gsap.set(media, {
              clipPath: "polygon(0 0, 0 0, 0 0, 0 0)",
            });
          }
          if (body) gsap.set(body, { opacity: 0, y: 24 });
        });

        ScrollTrigger.batch(cards, {
          start: "top 88%",
          once: true,
          onEnter: (batch) => {
            batch.forEach((card, i) => {
              const media = card.querySelector<HTMLElement>(".cruise-card-media");
              const img = card.querySelector<HTMLElement>(".cruise-card-media img");
              const body = card.querySelector<HTMLElement>(".cruise-card-body");
              const delay = i * 0.12;
              const tl = gsap.timeline({ delay });

              tl.to(card, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power2.out",
              });

              if (media) {
                tl.to(
                  media,
                  {
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                    duration: 0.95,
                    ease: "power2.out",
                  },
                  0,
                );
              }

              if (img) {
                tl.fromTo(
                  img,
                  { scale: 1.25 },
                  { scale: 1.06, duration: 1.1, ease: "power2.out" },
                  0,
                );
              }

              if (body) {
                tl.to(
                  body,
                  { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" },
                  0.25,
                );
              }
            });
          },
        });
      }

      /* Experience wipe */
      if (!prefersReduced) {
        const visual = root.querySelector<HTMLElement>(".cruise-exp-visual");
        if (visual) {
          const img = visual.querySelector("img");
          gsap
            .timeline({
              scrollTrigger: {
                trigger: visual,
                start: "top 75%",
                once: true,
              },
            })
            .fromTo(
              visual,
              { clipPath: "polygon(0 0, 0 0, 0 0, 0 0)" },
              {
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                duration: 1,
                ease: "power2.out",
              },
            )
            .fromTo(
              img,
              { scale: 1.35 },
              { scale: 1, duration: 1.1, ease: "power2.out" },
              0,
            );
        }
      }

      /* Filter sticky */
      if (!prefersReduced) {
        const bar = root.querySelector<HTMLElement>(".cruise-filter-bar");
        if (bar) {
          ScrollTrigger.create({
            trigger: bar,
            start: "top top+=90",
            endTrigger: "#voyage-grid",
            end: "bottom top",
            onEnter: () => bar.classList.add("is-stuck"),
            onLeaveBack: () => bar.classList.remove("is-stuck"),
          });
        }
      }
    }, root);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [rootRef, enabled]);
}
