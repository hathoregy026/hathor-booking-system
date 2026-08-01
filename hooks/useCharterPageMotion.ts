"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/** Exact brief animations — site Lenis already owns smooth scroll. */
export function useCharterPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root
        .querySelectorAll<HTMLElement>(".reveal-text, .reveal-label, .reveal-image")
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
        gsap.from(label, { opacity: 0, duration: 1.2, ease: "power3.out" });
      }

      const image = root.querySelector<HTMLElement>(".reveal-image");
      if (image) {
        gsap.from(image, {
          opacity: 0,
          y: 40,
          duration: 1.4,
          ease: "power3.out",
          delay: 0.35,
        });
      }

      const specs = root.querySelector<HTMLElement>("[data-ch-specs]");
      root.querySelectorAll<HTMLElement>("[data-ch-count]").forEach((el) => {
        const target = Number(el.getAttribute("data-target") || "0");
        const obj = { val: 0 };
        el.textContent = "0";
        ScrollTrigger.create({
          trigger: specs ?? el,
          start: "top 75%",
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: 1.8,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = String(Math.round(obj.val));
              },
            });
          },
        });
      });
    }, root);

    requestAnimationFrame(() => requestScrollRefresh("ch-exact-mount"));
    return () => ctx.revert();
  }, [rootRef]);
}
