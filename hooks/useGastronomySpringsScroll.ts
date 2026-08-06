"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { applyVerticalWipe } from "@/lib/fixed-mask-reveal";

gsap.registerPlugin(ScrollTrigger);

export function useGastronomySpringsScroll(
  pageRef: RefObject<HTMLElement | null>,
  onMaskActive: (index: number) => void,
) {
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      if (reduced) return;

      /* ── Intro: Fixed-Background Mask Reveal (Springs de-intro) ──
         Background stays pinned, zooms; caption fades; cream/gold panel rises. */
      const intro = page.querySelector<HTMLElement>("#gs-intro");
      const introStage = intro?.querySelector<HTMLElement>(".gs-intro__stage");
      const introBg = intro?.querySelector<HTMLElement>(".gs-intro__bg");
      const introCaption = intro?.querySelector<HTMLElement>(".gs-intro__caption");
      const introPanel = intro?.querySelector<HTMLElement>(".gs-intro__panel");

      if (intro && introStage && introBg && introCaption && introPanel) {
        gsap.set(introPanel, { yPercent: 105 });
        gsap.set(introBg, { scale: 1, yPercent: 0, transformOrigin: "100% 0%" });

        const st = ScrollTrigger.create({
          trigger: intro,
          start: "top top",
          end: "bottom bottom",
          pin: introStage,
          pinSpacing: true,
          pinType: "fixed",
          scrub: 1.2,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            // 0–0.45: zoom + caption fade (like Springs)
            const zoom = Math.min(1, p / 0.45);
            gsap.set(introBg, {
              scale: 1 + zoom * 0.5,
              yPercent: -p * 48,
            });
            gsap.set(introCaption, {
              opacity: 1 - Math.min(1, p / 0.22),
              yPercent: -p * 12,
            });
            // 0.28–0.85: panel rises from bottom (mask over fixed bg)
            const rise = Math.max(0, Math.min(1, (p - 0.28) / 0.5));
            const eased = 1 - Math.pow(1 - rise, 2.6);
            gsap.set(introPanel, { yPercent: (1 - eased) * 105 });
          },
        });
        cleanups.push(() => st.kill());
      }

      /* ── Spiral parallax ── */
      const spiral = page.querySelector<HTMLElement>("#gs-spiral");
      const spiralStage = spiral?.querySelector<HTMLElement>(".gs-spiral__stage");
      const spiralBg = spiral?.querySelector<HTMLElement>(".gs-spiral__bg");
      if (spiral && spiralStage && spiralBg) {
        const st = ScrollTrigger.create({
          trigger: spiral,
          start: "top top",
          end: "bottom bottom",
          pin: spiralStage,
          pinSpacing: true,
          pinType: "fixed",
          scrub: true,
          onUpdate: (self) => {
            gsap.set(spiralBg, { yPercent: 8 - self.progress * 18 });
          },
        });
        cleanups.push(() => st.kill());
      }

      /* ── Captions mask reveal (multi image clip-path wipe) ── */
      const mask = page.querySelector<HTMLElement>("#gs-mask");
      const maskStage = mask?.querySelector<HTMLElement>(".gs-mask__stage");
      const maskBar = mask?.querySelector<HTMLElement>("[data-gs-progress]");
      if (mask && maskStage) {
        const panels = gsap.utils.toArray<HTMLElement>(
          maskStage.querySelectorAll("[data-gs-mask-panel]"),
        );
        if (panels.length >= 2) {
          panels.forEach((panel, i) => {
            gsap.set(panel, {
              clipPath: i === 0 ? "inset(0% 0 0 0)" : "inset(100% 0 0 0)",
              zIndex: i + 1,
            });
          });
          const wipes = panels.length - 1;
          const st = ScrollTrigger.create({
            trigger: mask,
            start: "top top",
            end: () => `+=${window.innerHeight * wipes * 1.75}`,
            pin: maskStage,
            pinSpacing: true,
            pinType: "fixed",
            scrub: 1.4,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const idx = applyVerticalWipe(panels, self.progress);
              onMaskActive(idx);
              if (maskBar) {
                gsap.set(maskBar, {
                  scaleX: self.progress,
                  transformOrigin: "left center",
                });
              }
            },
          });
          cleanups.push(() => st.kill());
        }
      }

      /* ── Floating PNG plates rise freely ── */
      const plates = page.querySelector<HTMLElement>("#gs-plates");
      const platesStage = plates?.querySelector<HTMLElement>(".gs-plates__stage");
      const plateEls = gsap.utils.toArray<HTMLElement>(
        page.querySelectorAll("[data-gs-floating-plate]"),
      );
      if (plates && platesStage && plateEls.length) {
        plateEls.forEach((el, i) => {
          gsap.set(el, {
            yPercent: 130 + i * 10,
            opacity: 0,
            rotation: -8 + i * 2,
          });
        });
        const st = ScrollTrigger.create({
          trigger: plates,
          start: "top top",
          end: () => `+=${window.innerHeight * 2.35}`,
          pin: platesStage,
          pinSpacing: true,
          pinType: "fixed",
          scrub: 1.15,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const p = self.progress;
            plateEls.forEach((el, i) => {
              const start = i * 0.08;
              const local = Math.max(0, Math.min(1, (p - start) / (0.9 - start)));
              const eased = 1 - Math.pow(1 - local, 2.5);
              gsap.set(el, {
                yPercent: (1 - eased) * (120 + i * 8),
                opacity: eased,
                rotation: (1 - eased) * (-8 + i * 2),
              });
            });
          },
        });
        cleanups.push(() => st.kill());
      }
    }, page);

    const t = window.setTimeout(() => ScrollTrigger.refresh(), 180);
    return () => {
      window.clearTimeout(t);
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [pageRef, onMaskActive]);
}
