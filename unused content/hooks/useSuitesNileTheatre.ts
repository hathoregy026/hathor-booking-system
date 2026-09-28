"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Options = {
  sectionRef: RefObject<HTMLElement | null>;
  cardRefs: RefObject<(HTMLElement | null)[]>;
  titleRef: RefObject<HTMLElement | null>;
};

/**
 * Nile chapter: layered cards rise through soft mask + parallax scale.
 * No pin on phone; light scrub on all breakpoints.
 */
export function useSuitesNileTheatre({
  sectionRef,
  cardRefs,
  titleRef,
}: Options) {
  useEffect(() => {
    const section = sectionRef.current;
    const cards = (cardRefs.current ?? []).filter(Boolean) as HTMLElement[];
    if (!section || cards.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      gsap.set(cards, { clearProps: "all" });
      return;
    }

    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.fromTo(
          titleRef.current,
          { autoAlpha: 0.35, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 75%",
              end: "top 35%",
              scrub: 0.5,
            },
          },
        );
      }

      cards.forEach((card, index) => {
        const media = card.querySelector("img");
        const caption = card.querySelector("p");
        gsap.set(card, {
          clipPath: "inset(18% 8% 18% 8%)",
          autoAlpha: 0.55,
          y: 48 + index * 12,
        });
        if (media) gsap.set(media, { scale: 1.12 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 88%",
            end: "top 28%",
            scrub: 0.7,
          },
        });
        tl.to(
          card,
          {
            clipPath: "inset(0% 0% 0% 0%)",
            autoAlpha: 1,
            y: 0,
            ease: "none",
            duration: 1,
          },
          0,
        );
        if (media) {
          tl.to(media, { scale: 1, ease: "none", duration: 1 }, 0);
        }
        if (caption) {
          tl.fromTo(
            caption,
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, ease: "none", duration: 0.55 },
            0.35,
          );
        }
      });
    }, section);

    return () => ctx.revert();
  }, [cardRefs, sectionRef, titleRef]);
}
