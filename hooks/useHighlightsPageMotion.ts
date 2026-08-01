"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/** Highlights — masked text + parallax images (site Lenis only). */
export function useHighlightsPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root
        .querySelectorAll<HTMLElement>(
          ".reveal-text, .reveal-label, .reveal-subtext, .parallax-img, .parallax-bg",
        )
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      return;
    }

    const light = shouldLightenMotionForDevice();

    const ctx = gsap.context(() => {
      const labels = root.querySelectorAll<HTMLElement>(".reveal-label");
      gsap.to(labels, {
        opacity: 1,
        duration: light ? 0.8 : 1.2,
        ease: "power3.out",
        delay: 0.05,
      });

      root.querySelectorAll<HTMLElement>(".reveal-text").forEach((text) => {
        if (text.closest(".hl-hook")) return;
        gsap.from(text, {
          y: "100%",
          duration: light ? 0.9 : 1.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: text,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        });
      });

      const hookTexts = root.querySelectorAll<HTMLElement>(".hl-hook .reveal-text");
      gsap.from(hookTexts, {
        y: "100%",
        duration: light ? 0.9 : 1.4,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.15,
      });

      root.querySelectorAll<HTMLElement>(".reveal-subtext").forEach((el) => {
        if (el.closest(".hl-hook")) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: light ? 0.8 : 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      const hookSub = root.querySelector<HTMLElement>(".hl-hook .reveal-subtext");
      if (hookSub) {
        gsap.fromTo(
          hookSub,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: light ? 0.8 : 1.2,
            ease: "power3.out",
            delay: 0.55,
          },
        );
      }

      if (!light) {
        root.querySelectorAll<HTMLElement>(".parallax-img").forEach((img) => {
          gsap.fromTo(
            img,
            { yPercent: 0, scale: 1.1 },
            {
              yPercent: 15,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });

        root.querySelectorAll<HTMLElement>(".parallax-bg").forEach((img) => {
          gsap.fromTo(
            img,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: img.parentElement,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });
      } else {
        root.querySelectorAll<HTMLElement>(".parallax-img, .parallax-bg").forEach((img) => {
          gsap.from(img, {
            opacity: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: img,
              start: "top 88%",
              toggleActions: "play none none reverse",
            },
          });
        });
      }
    }, root);

    const onLoad = () => requestScrollRefresh("hl-cream-v2-load");
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => requestScrollRefresh("hl-cream-v2-mount"));

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [rootRef]);
}
