"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/** Highlights cream editorial — restrained typography & image reveals. */
export function useHighlightsPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root
        .querySelectorAll<HTMLElement>("[data-ce-line], [data-ce-reveal], [data-ce-image]")
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
        });
      return;
    }

    const light = shouldLightenMotionForDevice();
    const duration = light ? 0.85 : 1.2;
    const imgDuration = light ? 1.1 : 1.8;

    const ctx = gsap.context(() => {
      const hookLines = root.querySelectorAll<HTMLElement>(".hl-hook [data-ce-line]");
      gsap.set(hookLines, { opacity: 0, y: 40 });
      gsap.to(hookLines, {
        opacity: 1,
        y: 0,
        duration,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.08,
      });

      root.querySelectorAll<HTMLElement>("[data-ce-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        });
      });

      root.querySelectorAll<HTMLElement>("[data-ce-image]").forEach((img) => {
        if (light) {
          gsap.from(img, {
            opacity: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: img,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          });
          return;
        }
        gsap.from(img, {
          scale: 1.1,
          duration: imgDuration,
          ease: "power2.out",
          scrollTrigger: {
            trigger: img,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, root);

    const onLoad = () => requestScrollRefresh("highlights-cream-load");
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => requestScrollRefresh("highlights-cream-mount"));

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [rootRef]);
}
