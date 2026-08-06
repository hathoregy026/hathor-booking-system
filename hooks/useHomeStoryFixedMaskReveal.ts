"use client";

import { RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { luxWipe } from "@/lib/fixed-mask-reveal";

gsap.registerPlugin(ScrollTrigger);

const clamp = (value: number) => Math.max(0, Math.min(1, value));

export function useHomeStoryFixedMaskReveal(
  sectionRef: RefObject<HTMLElement | null>,
  slideCount: number,
) {
  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section || slideCount === 0) return;

    const panels = Array.from(
      section.querySelectorAll<HTMLElement>("[data-home-story-panel]"),
    );
    if (panels.length === 0) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const isCompact = window.matchMedia("(max-width: 1024px)").matches;
    const textTargets = panels.map((panel) =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          ".home-story__title-line, .home-story__body, .home-story__cta",
        ),
      ),
    );

    const context = gsap.context(() => {
      if (reducedMotion) {
        panels.forEach((panel) => {
          panel.style.clipPath = "";
          panel.style.zIndex = "";
          panel.setAttribute("aria-hidden", "false");
        });
        gsap.set(textTargets.flat(), { clearProps: "all" });
        return;
      }

      const setProgress = (progress: number) => {
        const transitions = Math.max(1, panels.length - 1);

        panels.forEach((panel, index) => {
          if (index === 0) {
            panel.style.clipPath = "inset(0 0 0 0)";
            panel.style.zIndex = "1";
          } else {
            const start = (index - 1) / transitions;
            const end = index / transitions;
            const localProgress = clamp((progress - start) / (end - start));
            const inset = (1 - luxWipe(localProgress)) * 100;
            panel.style.clipPath = isCompact
              ? `inset(0 0 0 ${inset}%)`
              : `inset(${inset}% 0 0 0)`;
            panel.style.zIndex = String(index + 1);
          }

          const panelProgress =
            index === 0 ? 1 - luxWipe(progress) : luxWipe(progress);
          const active = panelProgress >= 0.5;
          panel.setAttribute("aria-hidden", active ? "false" : "true");
          gsap.set(textTargets[index], {
            autoAlpha: clamp(panelProgress * 1.5),
            yPercent: (1 - panelProgress) * (isCompact ? 15 : 24),
          });
        });
      };

      setProgress(0);
      const trigger = ScrollTrigger.create({
        id: "home-story-fixed-mask",
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: !isCompact,
        onUpdate: (self) => setProgress(self.progress),
      });

      return () => trigger.kill();
    }, section);

    let lastWidth = window.innerWidth;
    const onViewportChange = () => {
      if (window.matchMedia("(max-width: 480px)").matches) {
        if (Math.abs(window.innerWidth - lastWidth) < 20) return;
      }
      lastWidth = window.innerWidth;
      ScrollTrigger.refresh();
    };

    window.addEventListener(
      isCompact ? "orientationchange" : "resize",
      onViewportChange,
    );
    return () => {
      window.removeEventListener(
        isCompact ? "orientationchange" : "resize",
        onViewportChange,
      );
      context.revert();
    };
  }, [sectionRef, slideCount]);
}
