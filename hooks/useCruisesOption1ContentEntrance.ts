"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Spa-style entrance — fade/slide up when content enters viewport (no dome ride). */
export function useCruisesOption1ContentEntrance(
  root: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);

      const blocks = el.querySelectorAll("[data-option-1-reveal]");
      blocks.forEach((block) => {
        gsap.fromTo(
          block,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.45,
            ease: "power2.out",
            scrollTrigger: {
              trigger: block,
              start: "top 82%",
              toggleActions: "play none none none",
            },
          },
        );
      });
    }, el);

    return () => ctx.revert();
  }, [root]);
}
