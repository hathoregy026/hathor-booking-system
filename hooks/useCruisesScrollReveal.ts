"use client";

import { useLayoutEffect, useId, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const SCROLL_VH = 2;

type CruisesScrollRevealRefs = {
  trigger: RefObject<HTMLElement | null>;
  wrapper: RefObject<HTMLElement | null>;
  hero: RefObject<HTMLElement | null>;
  content: RefObject<HTMLElement | null>;
};

export function useCruisesScrollReveal(refs: CruisesScrollRevealRefs) {
  const instanceId = useId().replace(/:/g, "");

  useLayoutEffect(() => {
    const trigger = refs.trigger.current;
    const wrapper = refs.wrapper.current;
    const hero = refs.hero.current;
    const content = refs.content.current;

    if (!trigger || !wrapper || !hero || !content) return;

    document.body.classList.add("has-cruises-scroll-reveal");
    document.documentElement.classList.add("has-cruises-scroll-reveal");

    const applyProgress = (p: number) => {
      gsap.set(hero, {
        opacity: 1 - p,
        scale: 1 - p * 0.06,
        pointerEvents: p > 0.85 ? "none" : "auto",
      });
      gsap.set(content, {
        opacity: p,
        y: (1 - p) * 56,
        pointerEvents: p > 0.15 ? "auto" : "none",
      });
    };

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      applyProgress(0);

      ScrollTrigger.create({
        id: `cruises-scroll-reveal-${instanceId}`,
        trigger,
        start: "top top",
        end: () => `+=${window.innerHeight * SCROLL_VH}`,
        pin: wrapper,
        pinSpacing: true,
        scrub: 1,
        invalidateOnRefresh: true,
        anticipatePin: 1,
        onUpdate: (self) => applyProgress(self.progress),
      });
    }, trigger);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("resize", onResize);
      ctx.revert();
      document.body.classList.remove("has-cruises-scroll-reveal");
      document.documentElement.classList.remove("has-cruises-scroll-reveal");
    };
  }, [instanceId, refs.trigger, refs.wrapper, refs.hero, refs.content]);
}

export function refreshCruisesScrollReveal() {
  if (typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.refresh();
}
