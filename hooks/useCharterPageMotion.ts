"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/** Charter — masked reveal, count-up specs, sticky suite sections. */
export function useCharterPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root
        .querySelectorAll<HTMLElement>(
          ".reveal-text, .reveal-label, .reveal-image, [data-ch-count]",
        )
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
          const target = el.getAttribute("data-target");
          if (target) el.textContent = target;
        });
      return;
    }

    const light = shouldLightenMotionForDevice();

    const ctx = gsap.context(() => {
      gsap.to(root.querySelectorAll(".reveal-label"), {
        opacity: 1,
        duration: light ? 0.8 : 1.2,
        ease: "power3.out",
      });

      const revealTexts = root.querySelectorAll<HTMLElement>(".ch-reveal .reveal-text");
      gsap.from(revealTexts, {
        y: "100%",
        duration: light ? 0.9 : 1.4,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.12,
      });

      const revealImage = root.querySelector<HTMLElement>(".reveal-image");
      if (revealImage) {
        gsap.from(revealImage, {
          y: light ? 24 : 40,
          opacity: 0,
          duration: light ? 1 : 1.5,
          ease: "power3.out",
          delay: 0.35,
        });
      }

      const specs = root.querySelector<HTMLElement>("[data-ch-specs]");
      root.querySelectorAll<HTMLElement>("[data-ch-count]").forEach((el) => {
        const target = Number(el.getAttribute("data-target") || "0");
        const obj = { val: 0 };
        ScrollTrigger.create({
          trigger: specs ?? el,
          start: "top 75%",
          once: true,
          onEnter: () => {
            gsap.to(obj, {
              val: target,
              duration: light ? 1.2 : 1.8,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = String(Math.round(obj.val));
              },
            });
          },
        });
      });

      root.querySelectorAll<HTMLElement>(".ch-suite__copy").forEach((copy) => {
        gsap.from(copy.children, {
          y: 28,
          opacity: 0,
          duration: light ? 0.75 : 1.1,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: copy,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });
    }, root);

    const onLoad = () => requestScrollRefresh("ch-cream-v2-load");
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => requestScrollRefresh("ch-cream-v2-mount"));

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [rootRef]);
}
