"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/** Exact brief animations — site Lenis already owns smooth scroll. */
export function useHighlightsPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root
        .querySelectorAll<HTMLElement>(".reveal-text, .reveal-label, .reveal-subtext")
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".reveal-text", root).forEach((text) => {
        if (text.closest(".min-h-screen")) return;
        gsap.from(text, {
          y: "100%",
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: text,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      const heroTexts = root.querySelectorAll<HTMLElement>(
        ".min-h-screen .reveal-text",
      );
      if (heroTexts.length) {
        gsap.from(heroTexts, {
          y: "100%",
          duration: 1.4,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.1,
        });
      }

      const label = root.querySelector<HTMLElement>(".reveal-label");
      if (label) {
        gsap.from(label, {
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
        });
      }

      const sub = root.querySelector<HTMLElement>(".reveal-subtext");
      if (sub) {
        gsap.from(sub, {
          opacity: 0,
          y: 20,
          duration: 1.2,
          ease: "power3.out",
          delay: 0.4,
        });
      }

      gsap.utils.toArray<HTMLElement>(".parallax-img", root).forEach((img) => {
        gsap.to(img, {
          yPercent: 15,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".parallax-bg", root).forEach((img) => {
        gsap.to(img, {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, root);

    requestAnimationFrame(() => requestScrollRefresh("hl-exact-mount"));
    return () => ctx.revert();
  }, [rootRef]);
}
