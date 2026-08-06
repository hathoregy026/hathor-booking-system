"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  applyPolygonBottomReveal,
  applyVerticalWipe,
} from "@/lib/fixed-mask-reveal";

gsap.registerPlugin(ScrollTrigger);

type MaskStageConfig = {
  trigger: HTMLElement;
  pin?: HTMLElement | null;
  panelRoot: HTMLElement;
  panelSelector: string;
  wipes?: number;
  onActive?: (index: number) => void;
  progressBar?: HTMLElement | null;
  progressAxis?: "x" | "y";
};

function bindMaskStage({
  trigger,
  pin,
  panelRoot,
  panelSelector,
  wipes = 1,
  onActive,
  progressBar,
  progressAxis = "y",
}: MaskStageConfig) {
  const panels = gsap.utils.toArray<HTMLElement>(
    panelRoot.querySelectorAll(panelSelector),
  );
  if (panels.length < 2) return () => {};

  panels.forEach((panel, i) => {
    gsap.set(panel, {
      clipPath: i === 0 ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)",
      zIndex: i + 1,
    });
  });

  const st = ScrollTrigger.create({
    trigger,
    start: "top top",
    end: () => `+=${window.innerHeight * wipes * 1.85}`,
    pin: pin ?? trigger,
    pinSpacing: true,
    pinType: "fixed",
    scrub: 1.35,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const idx = applyVerticalWipe(panels, self.progress);
      onActive?.(idx);
      if (progressBar) {
        if (progressAxis === "y") {
          gsap.set(progressBar, { scaleY: self.progress, transformOrigin: "top center" });
        } else {
          gsap.set(progressBar, { scaleX: self.progress, transformOrigin: "left center" });
        }
      }
    },
  });

  return () => st.kill();
}

export function useGastronomySpringsScroll(
  pageRef: RefObject<HTMLElement | null>,
  onCaptionsActive: (index: number) => void,
  onSliderActive: (index: number) => void,
) {
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      if (reduced) return;

      const intro = page.querySelector<HTMLElement>("#de-intro");
      const introBg = page.querySelector<HTMLElement>("[data-gs-intro-bg]");
      const introText = page.querySelector<HTMLElement>("[data-gs-intro-text-inner]");

      if (intro && introBg) {
        const introSt = ScrollTrigger.create({
          trigger: intro,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress;
            gsap.set(introBg, {
              scale: 1 + p * 0.5,
              yPercent: -64 * Math.min(1, p * 1.2),
              transformOrigin: "100% 0",
            });
            if (introText) {
              gsap.set(introText, {
                marginTop: `${35 * Math.min(1, Math.max(0, (p - 0.45) * 2))}px`,
                marginBottom: `${-60 * Math.min(1, Math.max(0, (p - 0.45) * 2))}px`,
              });
            }
          },
        });
        cleanups.push(() => introSt.kill());
      }

      const captions = page.querySelector<HTMLElement>("#de-captions");
      const captionsLayer = captions?.querySelector<HTMLElement>(".sticky__layer");
      const captionsCanvas = captions?.querySelector<HTMLElement>("[data-gs-mask-stage]");
      if (captions && captionsLayer && captionsCanvas) {
        const panelCount = captionsCanvas.querySelectorAll("[data-gs-mask-panel]").length;
        cleanups.push(
          bindMaskStage({
            trigger: captions,
            pin: captionsLayer,
            panelRoot: captionsCanvas,
            panelSelector: "[data-gs-mask-panel]",
            wipes: Math.max(1, panelCount - 1),
            onActive: onCaptionsActive,
          }),
        );
      }

      const slider = page.querySelector<HTMLElement>("#de-slider");
      const sliderLayer = slider?.querySelector<HTMLElement>(".sticky__layer");
      const sliderImages = slider?.querySelector<HTMLElement>(".de-slider__images");
      const sliderProgress = slider?.querySelector<HTMLElement>("[data-gs-scroll-progress]");
      if (slider && sliderLayer && sliderImages) {
        const panelCount = sliderImages.querySelectorAll("[data-gs-slider-image]").length;
        cleanups.push(
          bindMaskStage({
            trigger: slider,
            pin: sliderLayer,
            panelRoot: sliderImages,
            panelSelector: "[data-gs-slider-image]",
            wipes: Math.max(1, panelCount - 1),
            onActive: onSliderActive,
            progressBar: sliderProgress,
            progressAxis: "y",
          }),
        );
      }

      page.querySelectorAll<HTMLElement>("[data-gs-flat-reveal]").forEach((flat) => {
        const imageWrap = flat.querySelector<HTMLElement>(".background");
        if (!imageWrap) return;

        const st = ScrollTrigger.create({
          trigger: flat,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            applyPolygonBottomReveal(imageWrap, self.progress);
            const img = imageWrap.querySelector("img");
            if (img) {
              gsap.set(img, {
                scale: 1.2 - self.progress * 0.2,
                xPercent: -21 * Math.min(1, self.progress * 1.4),
                transformOrigin: "center center",
              });
            }
          },
        });
        cleanups.push(() => st.kill());
      });

      const spiralBg = page.querySelector<HTMLElement>("[data-gs-spiral-bg]");
      const spiral = page.querySelector<HTMLElement>("#de-spiral");
      if (spiral && spiralBg) {
        const st = ScrollTrigger.create({
          trigger: spiral,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            gsap.set(spiralBg, { yPercent: 10 - self.progress * 20 });
          },
        });
        cleanups.push(() => st.kill());
      }
    }, page);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 150);

    return () => {
      window.clearTimeout(refresh);
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [pageRef, onCaptionsActive, onSliderActive]);
}
