"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/**
 * Charter campaign motion — hero curtains, privilege progress, dining overlap.
 * No second Lenis. Phone: no pin.
 */
export function useCharterPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.setAttribute("data-charter-motion", "on");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.querySelectorAll<HTMLElement>("[data-charter-reveal], [data-charter-hero-line] span, [data-charter-hero-eyebrow], [data-charter-hero-script], [data-charter-hero-copy], [data-charter-hero-actions], [data-charter-hero-marker], [data-charter-hero-scroll], [data-charter-hero-curtain]").forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
      return;
    }

    const light = shouldLightenMotionForDevice();
    const ease = "power3.out";

    const ctx = gsap.context(() => {
      const heroImg = root.querySelector<HTMLElement>("[data-charter-hero-img]");
      const curtain = root.querySelector<HTMLElement>("[data-charter-hero-curtain]");
      const overlay = root.querySelector<HTMLElement>("[data-charter-hero-overlay]");
      const eyebrow = root.querySelector<HTMLElement>("[data-charter-hero-eyebrow]");
      const lines = gsap.utils.toArray<HTMLElement>("[data-charter-hero-line]");
      const script = root.querySelector<HTMLElement>("[data-charter-hero-script]");
      const copy = root.querySelector<HTMLElement>("[data-charter-hero-copy]");
      const actions = root.querySelector<HTMLElement>("[data-charter-hero-actions]");
      const marker = root.querySelector<HTMLElement>("[data-charter-hero-marker]");
      const scrollCue = root.querySelector<HTMLElement>("[data-charter-hero-scroll]");
      const rule = root.querySelector<HTMLElement>("[data-charter-hero-rule]");

      if (heroImg) gsap.set(heroImg, { scale: 1.045 });
      if (curtain) gsap.set(curtain, { scaleY: 1 });
      if (overlay) gsap.set(overlay, { opacity: 0.7 });
      if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 16 });
      lines.forEach((line) => {
        const inner = line.querySelector("span") ?? line;
        gsap.set(inner, { yPercent: 108, opacity: 0 });
      });
      if (script) gsap.set(script, { opacity: 0, y: 14, clipPath: "inset(0 100% 0 0)" });
      if (copy) gsap.set(copy, { opacity: 0, y: 20 });
      if (actions) gsap.set(actions, { opacity: 0, y: 16 });
      if (marker) gsap.set(marker, { opacity: 0 });
      if (scrollCue) gsap.set(scrollCue, { opacity: 0 });
      if (rule) gsap.set(rule, { scaleX: 0 });

      const tl = gsap.timeline({ defaults: { ease } });
      if (curtain) {
        tl.to(curtain, { scaleY: 0, duration: light ? 0.9 : 1.2, ease: "power4.inOut" }, 0);
      }
      if (heroImg) {
        tl.to(heroImg, { scale: 1, duration: light ? 1.2 : 1.7 }, 0.15);
      }
      if (overlay) {
        tl.to(overlay, { opacity: 1, duration: 1 }, 0.2);
      }
      if (eyebrow) {
        tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.65 }, 0.45);
      }
      lines.forEach((line, i) => {
        const inner = line.querySelector("span") ?? line;
        tl.to(
          inner,
          { yPercent: 0, opacity: 1, duration: light ? 0.7 : 0.95 },
          0.55 + i * 0.14,
        );
      });
      if (script) {
        tl.to(
          script,
          { opacity: 1, y: 0, clipPath: "inset(0 0% 0 0)", duration: 0.85 },
          0.85,
        );
      }
      if (rule) {
        tl.to(rule, { scaleX: 1, duration: 0.7 }, 1.05);
      }
      if (copy) {
        tl.to(copy, { opacity: 1, y: 0, duration: 0.75 }, 1.1);
      }
      if (actions) {
        tl.to(actions, { opacity: 1, y: 0, duration: 0.65 }, 1.25);
      }
      if (marker) {
        tl.to(marker, { opacity: 1, duration: 0.55 }, 1.3);
      }
      if (scrollCue) {
        tl.to(scrollCue, { opacity: 1, duration: 0.55 }, 1.4);
      }

      root.querySelectorAll<HTMLElement>("[data-charter-reveal]").forEach((el, i) => {
        gsap.set(el, { opacity: 0, y: light ? 22 : 40 });
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: light ? 0.7 : 0.95,
          delay: (i % 3) * 0.04,
          ease,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      });

      /* Dining curtain */
      const diningMedia = root.querySelector<HTMLElement>("[data-charter-dining-media]");
      if (diningMedia) {
        gsap.fromTo(
          diningMedia,
          { clipPath: "inset(12% 8% 12% 8%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: diningMedia.closest("section") ?? diningMedia,
              start: "top 80%",
              end: "top 35%",
              scrub: true,
            },
          },
        );
      }

      const diningType = root.querySelector<HTMLElement>("[data-charter-dining-type]");
      if (diningType) {
        gsap.fromTo(
          diningType,
          { y: 48, opacity: 0.4 },
          {
            y: 0,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: diningType.closest("section") ?? diningType,
              start: "top 75%",
              end: "top 40%",
              scrub: true,
            },
          },
        );
      }

      /* Nile path */
      const nile = root.querySelector<SVGPathElement>("[data-charter-nile-path]");
      if (nile) {
        const len = nile.getTotalLength();
        gsap.set(nile, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(nile, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.querySelector("[data-charter-routes]") ?? nile,
            start: "top 75%",
            end: "top 30%",
            scrub: true,
          },
        });
      }

      ScrollTrigger.matchMedia({
        "(min-width: 1025px)": () => {
          const section = root.querySelector<HTMLElement>("[data-charter-privileges]");
          const items = gsap.utils.toArray<HTMLElement>("[data-charter-privilege]");
          const progress = root.querySelector<HTMLElement>("[data-charter-privilege-progress]");
          const mediaImg = root.querySelector<HTMLElement>(".ch-privileges__img");
          if (!section || !items.length) return;

          items[0]?.classList.add("is-active");

          ScrollTrigger.create({
            trigger: section.querySelector(".ch-privileges__stage") ?? section,
            start: "top 55%",
            end: "bottom 45%",
            onUpdate: (self) => {
              const idx = Math.min(
                items.length - 1,
                Math.floor(self.progress * items.length),
              );
              items.forEach((item, i) => {
                item.classList.toggle("is-active", i === idx);
              });
              if (progress) {
                gsap.set(progress, { scaleX: self.progress });
              }
              if (mediaImg) {
                gsap.set(mediaImg, {
                  yPercent: -2 + idx * 2.2,
                  scale: 1.03 - idx * 0.008,
                });
              }
            },
          });
        },
        "(max-width: 1024px)": () => {
          root.querySelectorAll<HTMLElement>("[data-charter-privilege]").forEach((el) => {
            el.classList.add("is-active");
            gsap.from(el, {
              opacity: 0,
              y: 28,
              duration: 0.75,
              ease,
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            });
          });
        },
      });
    }, root);

    const onLoad = () => requestScrollRefresh("charter-load");
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => requestScrollRefresh("charter-mount"));

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [rootRef]);
}
