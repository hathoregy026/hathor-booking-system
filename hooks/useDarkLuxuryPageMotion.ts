"use client";

import { type RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/**
 * Dark-luxury page motion for /highlights + /charter.
 * Uses the site’s existing Lenis owner — never creates a second instance.
 */
export function useDarkLuxuryPageMotion(
  rootRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    const ctx = gsap.context(() => {
      if (reduce) {
        gsap.set(
          root.querySelectorAll(".reveal-text, .reveal-label, .reveal-subtext"),
          { clearProps: "all", opacity: 1, y: 0 },
        );
        return;
      }

      gsap.utils.toArray<HTMLElement>(".reveal-text", root).forEach((text) => {
        gsap.to(text, {
          y: 0,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: text,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".reveal-label", root).forEach((label) => {
        gsap.to(label, {
          opacity: 1,
          y: 0,
          duration: 1,
          delay: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: label,
            start: "top 85%",
          },
        });
      });

      gsap.utils.toArray<HTMLElement>(".reveal-subtext", root).forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: 0.35,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        });
      });

      if (!isMobile) {
        gsap.utils.toArray<HTMLElement>(".parallax-hero", root).forEach((img) => {
          const parent = img.parentElement;
          if (!parent) return;
          gsap.to(img, {
            yPercent: 20,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: parent,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        });

        gsap.utils.toArray<HTMLElement>(".parallax-img", root).forEach((img) => {
          const parent = img.parentElement;
          if (!parent) return;
          gsap.to(img, {
            yPercent: 15,
            ease: "none",
            scrollTrigger: {
              trigger: parent,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });

        gsap.utils.toArray<HTMLElement>(".parallax-bg", root).forEach((img) => {
          const parent = img.parentElement;
          if (!parent) return;
          gsap.to(img, {
            yPercent: 18,
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: parent,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });
      }
    }, root);

    const onLoad = () => requestScrollRefresh("dark-luxury-load");
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => requestScrollRefresh("dark-luxury-mount"));

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [rootRef]);
}
