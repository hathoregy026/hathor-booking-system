"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/**
 * Highlights page motion — rising ivory panel, landmark cinema, depth.
 * No second Lenis. Phone: no pin.
 */
export function useHighlightsPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.setAttribute("data-highlights-motion", "on");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root
        .querySelectorAll<HTMLElement>(
          "[data-hl-hero-line] span, [data-hl-hero-label], [data-hl-hero-script], [data-hl-hero-copy], [data-hl-hero-actions], [data-hl-hero-rise], [data-hl-reveal], [data-hl-intro-curtain], [data-hl-stack-title] span",
        )
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
          el.style.clipPath = "none";
        });
      return;
    }

    const light = shouldLightenMotionForDevice();
    const ease = "power3.out";

    const ctx = gsap.context(() => {
      /* Hero entrance */
      const heroImg = root.querySelector<HTMLElement>("[data-hl-hero-img]");
      const label = root.querySelector<HTMLElement>("[data-hl-hero-label]");
      const lines = gsap.utils.toArray<HTMLElement>("[data-hl-hero-line]");
      const script = root.querySelector<HTMLElement>("[data-hl-hero-script]");
      const copy = root.querySelector<HTMLElement>("[data-hl-hero-copy]");
      const actions = root.querySelector<HTMLElement>("[data-hl-hero-actions]");
      const rise = root.querySelector<HTMLElement>("[data-hl-hero-rise]");
      const hero = root.querySelector<HTMLElement>("[data-hl-hero]");

      if (heroImg) gsap.set(heroImg, { scale: 1.03 });
      if (label) gsap.set(label, { opacity: 0, y: 14 });
      lines.forEach((line) => {
        const inner = line.querySelector("span") ?? line;
        gsap.set(inner, { yPercent: 110 });
      });
      if (script) gsap.set(script, { opacity: 0, y: 12 });
      if (copy) gsap.set(copy, { opacity: 0, y: 16 });
      if (actions) gsap.set(actions, { opacity: 0, y: 14 });

      const enter = gsap.timeline({ defaults: { ease } });
      if (label) enter.to(label, { opacity: 1, y: 0, duration: 0.55 }, 0.2);
      lines.forEach((line, i) => {
        const inner = line.querySelector("span") ?? line;
        enter.to(
          inner,
          { yPercent: 0, duration: light ? 0.65 : 0.85 },
          0.35 + i * 0.12,
        );
      });
      if (script) enter.to(script, { opacity: 1, y: 0, duration: 0.55 }, 0.75);
      if (copy) enter.to(copy, { opacity: 1, y: 0, duration: 0.55 }, 0.9);
      if (actions) enter.to(actions, { opacity: 1, y: 0, duration: 0.5 }, 1.05);

      /* Hero scroll → rising ivory + title lift */
      if (hero && heroImg) {
        const title = root.querySelector<HTMLElement>(".hl-hero__title");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        tl.to(heroImg, { scale: 1, ease: "none" }, 0);
        if (title) tl.to(title, { y: light ? -20 : -40, ease: "none" }, 0);
        if (rise) {
          tl.to(rise, { y: 0, ease: "none" }, 0.35);
        }
      }

      /* Generic reveals */
      root.querySelectorAll<HTMLElement>("[data-hl-reveal]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: light ? 16 : 26,
          duration: light ? 0.65 : 0.85,
          ease,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      });

      /* Intro masks + curtain */
      root.querySelectorAll<HTMLElement>("[data-hl-intro-line]").forEach((line) => {
        const inner = line.querySelector("span") ?? line;
        gsap.from(inner, {
          yPercent: 108,
          duration: light ? 0.7 : 0.95,
          ease,
          scrollTrigger: {
            trigger: line,
            start: "top 88%",
            once: true,
          },
        });
      });

      const introCurtain = root.querySelector<HTMLElement>("[data-hl-intro-curtain]");
      if (introCurtain) {
        gsap.fromTo(
          introCurtain,
          { clipPath: "inset(0 0 100% 0)" },
          {
            clipPath: "inset(0 0 0% 0)",
            duration: light ? 0.9 : 1.15,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: introCurtain,
              start: "top 82%",
              once: true,
            },
          },
        );
      }

      /* Interlude depth */
      const interlude = root.querySelector<HTMLElement>("[data-hl-interlude]");
      const interludeMedia = root.querySelector<HTMLElement>("[data-hl-interlude-media]");
      if (interlude && interludeMedia) {
        const img = interludeMedia.querySelector("img") ?? interludeMedia;
        gsap.fromTo(
          img,
          { scale: 1.05, yPercent: 2 },
          {
            scale: 1,
            yPercent: -2,
            ease: "none",
            scrollTrigger: {
              trigger: interlude,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      }

      /* Closing reveal */
      const closeMedia = root.querySelector<HTMLElement>("[data-hl-close-media]");
      if (closeMedia) {
        gsap.from(closeMedia, {
          scale: 1.04,
          ease: "none",
          scrollTrigger: {
            trigger: closeMedia.closest("section") ?? closeMedia,
            start: "top 80%",
            end: "top 35%",
            scrub: true,
          },
        });
      }

      /* Journey hover is CSS; focus-safe motion for touch: none */

      ScrollTrigger.matchMedia({
        /* Desktop — master landmark timeline */
        "(min-width: 1025px)": () => {
          const runway = root.querySelector<HTMLElement>(".hl-stories__runway");
          const sticky = root.querySelector<HTMLElement>("[data-hl-stories-sticky]");
          const slides = gsap.utils.toArray<HTMLElement>("[data-hl-slide]");
          const chapters = gsap.utils.toArray<HTMLElement>("[data-hl-chapter]");
          const progress = root.querySelector<HTMLElement>("[data-hl-progress]");
          const counter = root.querySelector<HTMLElement>("[data-hl-counter]");
          if (!runway || !sticky || slides.length < 2) return;

          const n = slides.length;
          const segment = 1 / n;

          gsap.set(slides, { opacity: 0, xPercent: 0, scale: 1.02 });
          gsap.set(slides[0]!, { opacity: 1, xPercent: -2, scale: 1.02 });
          gsap.set(chapters, { autoAlpha: 0, y: 0, pointerEvents: "none" });
          gsap.set(chapters[0]!, {
            autoAlpha: 1,
            pointerEvents: "auto",
          });

          /* Pin inside the runway — CSS sticky fails under Lenis html overflow */
          ScrollTrigger.create({
            trigger: runway,
            start: "top top",
            end: "bottom bottom",
            pin: sticky,
            pinSpacing: false,
            scrub: true,
              onUpdate: (self) => {
                const idx = Math.min(
                  n - 1,
                  Math.floor((self.progress * n) + 0.0001),
                );
                if (counter) {
                  counter.textContent = String(idx + 1).padStart(2, "0");
                }
              },
          });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: runway,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          });

          if (progress) {
            tl.to(progress, { scaleX: 1, duration: 1 }, 0);
          }

          for (let i = 0; i < n - 1; i++) {
            const holdEnd = (i + 0.68) * segment;
            const nextStart = (i + 1) * segment;
            const fadeDur = nextStart - holdEnd;
            const cur = slides[i]!;
            const nxt = slides[i + 1]!;
            const curCh = chapters[i];
            const nxtCh = chapters[i + 1];

            const pan =
              i === 0
                ? { xPercent: -5, scale: 1.01 }
                : i === 1
                  ? { xPercent: 3, scale: 1.015 }
                  : { xPercent: 0, scale: 1.01 };

            tl.to(cur, { ...pan, duration: holdEnd - i * segment }, i * segment);
            tl.to(nxt, { opacity: 1, ...pan, duration: fadeDur }, holdEnd);
            tl.to(cur, { opacity: 0, duration: fadeDur }, holdEnd);

            if (curCh && nxtCh) {
              /* Hard text swap — avoid overlapping titles during image crossfade */
              tl.set(curCh, { autoAlpha: 0, pointerEvents: "none" }, holdEnd);
              tl.set(
                nxtCh,
                { autoAlpha: 1, y: 0, pointerEvents: "auto" },
                holdEnd,
              );
            }
          }
        },

        /* Tablet — bounded sticky per chapter */
        "(min-width: 481px) and (max-width: 1024px)": () => {
          root.querySelectorAll<HTMLElement>("[data-hl-stack-chapter]").forEach((chapter) => {
            const media = chapter.querySelector<HTMLElement>("[data-hl-stack-media]");
            const titleInner =
              chapter.querySelector<HTMLElement>("[data-hl-stack-title] span") ??
              chapter.querySelector<HTMLElement>(".hl-chapter__title");

            if (titleInner) {
              gsap.from(titleInner, {
                yPercent: 100,
                duration: 0.8,
                ease,
                scrollTrigger: {
                  trigger: chapter,
                  start: "top 85%",
                  once: true,
                },
              });
            }

            if (media) {
              gsap.fromTo(
                media,
                { clipPath: "inset(8% 4% 8% 4%)" },
                {
                  clipPath: "inset(0% 0% 0% 0%)",
                  ease: "none",
                  scrollTrigger: {
                    trigger: chapter,
                    start: "top 80%",
                    end: "top 35%",
                    scrub: true,
                  },
                },
              );
            }
          });
        },

        /* Phone — light parallax + mask title */
        "(max-width: 480px)": () => {
          root.querySelectorAll<HTMLElement>("[data-hl-stack-chapter]").forEach((chapter) => {
            const media = chapter.querySelector<HTMLElement>("[data-hl-stack-media]");
            const titleInner = chapter.querySelector<HTMLElement>(
              "[data-hl-stack-title] span",
            );

            if (titleInner) {
              gsap.from(titleInner, {
                yPercent: 100,
                duration: 0.7,
                ease,
                scrollTrigger: {
                  trigger: chapter,
                  start: "top 88%",
                  once: true,
                },
              });
            }

            if (media) {
              gsap.fromTo(
                media,
                { y: 18 },
                {
                  y: -18,
                  ease: "none",
                  scrollTrigger: {
                    trigger: chapter,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                  },
                },
              );
              gsap.fromTo(
                media,
                { clipPath: "inset(6% 0% 6% 0%)" },
                {
                  clipPath: "inset(0% 0% 0% 0%)",
                  ease: "none",
                  scrollTrigger: {
                    trigger: chapter,
                    start: "top 90%",
                    end: "top 50%",
                    scrub: true,
                  },
                },
              );
            }
          });
        },
      });
    }, root);

    const onLoad = () => requestScrollRefresh("highlights-load");
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => requestScrollRefresh("highlights-mount"));

    return () => {
      window.removeEventListener("load", onLoad);
      ctx.revert();
    };
  }, [rootRef]);
}
