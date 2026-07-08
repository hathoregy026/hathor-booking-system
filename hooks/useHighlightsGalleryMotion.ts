"use client";

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type Options = {
  enableCursor?: boolean;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function useHighlightsGalleryMotion(
  rootRef: RefObject<HTMLElement | null>,
  options: Options = {},
) {
  const { enableCursor = true } = options;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.setAttribute("data-highlights-gallery", "");

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const reduced = prefersReducedMotion();

      root.querySelectorAll<HTMLElement>("[data-hg-reveal]").forEach((el) => {
        if (reduced) {
          gsap.set(el, { opacity: 1, scale: 1 });
          return;
        }

        gsap.set(el, { opacity: 0, scale: 0.98, force3D: true });
        gsap.to(el, {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      });

      root.querySelectorAll<HTMLElement>("[data-hg-parallax]").forEach((wrap) => {
        const img = wrap.querySelector<HTMLElement>("[data-hg-parallax-img]");
        if (!img || reduced) return;

        gsap.fromTo(
          img,
          { yPercent: 8, force3D: true },
          {
            yPercent: -8,
            ease: "none",
            scrollTrigger: {
              trigger: wrap,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          },
        );
      });

      if (enableCursor && !reduced && window.matchMedia("(pointer: fine)").matches) {
        const orb = root.querySelector<HTMLElement>("[data-hg-cursor]");
        if (orb) {
          const xTo = gsap.quickTo(orb, "x", { duration: 0.15, ease: "power3.out" });
          const yTo = gsap.quickTo(orb, "y", { duration: 0.15, ease: "power3.out" });

          const onMove = (event: PointerEvent) => {
            xTo(event.clientX);
            yTo(event.clientY);
          };

          window.addEventListener("pointermove", onMove);
          (orb as HTMLElement & { __hgCleanup?: () => void }).__hgCleanup = () => {
            window.removeEventListener("pointermove", onMove);
          };

          root.querySelectorAll<HTMLElement>("[data-hg-plinth]").forEach((plinth) => {
            const onEnter = () => orb.classList.add("is-active");
            const onLeave = () => orb.classList.remove("is-active");
            plinth.addEventListener("pointerenter", onEnter);
            plinth.addEventListener("pointerleave", onLeave);
            (plinth as HTMLElement & { __hgCleanup?: () => void }).__hgCleanup = () => {
              plinth.removeEventListener("pointerenter", onEnter);
              plinth.removeEventListener("pointerleave", onLeave);
            };
          });
        }
      }
    }, root);

    const refresh = () => ScrollTrigger.refresh();
    refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      root.querySelectorAll<HTMLElement>("[data-hg-cursor], [data-hg-plinth]").forEach((el) => {
        const node = el as HTMLElement & { __hgCleanup?: () => void };
        node.__hgCleanup?.();
        delete node.__hgCleanup;
      });
      ctx.revert();
      document.documentElement.removeAttribute("data-highlights-gallery");
    };
  }, [rootRef, enableCursor]);
}
