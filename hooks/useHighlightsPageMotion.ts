"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/** Highlights — cinematic Nile journey. No second Lenis. Phone: no pin. */
export function useHighlightsPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.setAttribute("data-highlights-motion", "on");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.setAttribute("data-highlights-reduced", "");
      root
        .querySelectorAll<HTMLElement>(
          "[data-hl-hero-veil], [data-hl-hero-line] span, [data-hl-hero-label], [data-hl-hero-horizon], [data-hl-hero-copy], [data-hl-hero-cta], [data-hl-intro-line] span, [data-hl-intro-curtain], [data-hl-reveal], [data-hl-slide], [data-hl-chapter]",
        )
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
          el.style.clipPath = "none";
          el.style.visibility = "visible";
          el.style.pointerEvents = "auto";
        });
      const veil = root.querySelector<HTMLElement>("[data-hl-hero-veil]");
      if (veil) {
        veil.style.display = "none";
      }
      return;
    }

    const light = shouldLightenMotionForDevice();
    const ease = "power3.out";

    const ctx = gsap.context(() => {
      /* Hero open */
      const hero = root.querySelector<HTMLElement>("[data-hl-hero]");
      const heroImg = root.querySelector<HTMLElement>("[data-hl-hero-img]");
      const veil = root.querySelector<HTMLElement>("[data-hl-hero-veil]");
      const label = root.querySelector<HTMLElement>("[data-hl-hero-label]");
      const lines = gsap.utils.toArray<HTMLElement>("[data-hl-hero-line]");
      const horizon = root.querySelector<HTMLElement>("[data-hl-hero-horizon]");
      const copy = root.querySelector<HTMLElement>("[data-hl-hero-copy]");
      const cta = root.querySelector<HTMLElement>("[data-hl-hero-cta]");

      if (heroImg) gsap.set(heroImg, { scale: 1.08, yPercent: 0 });
      if (veil) gsap.set(veil, { scaleY: 1 });
      if (label) gsap.set(label, { opacity: 0, y: 18 });
      lines.forEach((line) => {
        gsap.set(line.querySelector("span") ?? line, { yPercent: 115 });
      });
      if (horizon) gsap.set(horizon, { scaleX: 0 });
      if (copy) gsap.set(copy, { opacity: 0, y: 22 });
      if (cta) gsap.set(cta, { opacity: 0, y: 18 });

      /* Decode hero early to avoid scrub flash */
      const heroBitmap = heroImg?.querySelector("img");
      if (heroBitmap instanceof HTMLImageElement) {
        heroBitmap.decoding = "async";
        void heroBitmap.decode?.().catch(() => undefined);
      }

      const open = gsap.timeline({ defaults: { ease } });
      if (veil) {
        open.to(
          veil,
          { scaleY: 0, duration: light ? 0.85 : 1.2, ease: "power4.inOut" },
          0,
        );
      }
      if (label) open.to(label, { opacity: 1, y: 0, duration: 0.6 }, 0.32);
      lines.forEach((line, i) => {
        open.to(
          line.querySelector("span") ?? line,
          { yPercent: 0, duration: light ? 0.75 : 0.95 },
          0.42 + i * 0.14,
        );
      });
      if (horizon) open.to(horizon, { scaleX: 1, duration: 0.85 }, 0.9);
      if (copy) open.to(copy, { opacity: 1, y: 0, duration: 0.65 }, 1.05);
      if (cta) open.to(cta, { opacity: 1, y: 0, duration: 0.6 }, 1.2);

      if (hero && heroImg) {
        const title = root.querySelector<HTMLElement>(".hl-hero__title");
        const heroScrub = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        heroScrub.to(heroImg, { scale: 1, yPercent: 6 }, 0);
        if (title) heroScrub.to(title, { y: light ? -28 : -56, opacity: 0.35 }, 0);
        if (copy) heroScrub.to(copy, { y: light ? -12 : -24, opacity: 0 }, 0);
        if (cta) heroScrub.to(cta, { y: light ? -8 : -16, opacity: 0 }, 0);
        if (horizon) heroScrub.to(horizon, { opacity: 0.2 }, 0);
      }

      root.querySelectorAll<HTMLElement>("[data-hl-reveal]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: light ? 18 : 28,
          duration: light ? 0.65 : 0.9,
          ease,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      const introCurtain = root.querySelector<HTMLElement>("[data-hl-intro-curtain]");
      if (introCurtain) {
        gsap.fromTo(
          introCurtain,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: introCurtain,
              start: "top 90%",
              end: "top 38%",
              scrub: true,
            },
          },
        );
        const introImg = introCurtain.querySelector("img");
        if (introImg) {
          gsap.fromTo(
            introImg,
            { scale: 1.08, yPercent: 4 },
            {
              scale: 1,
              yPercent: 0,
              ease: "none",
              scrollTrigger: {
                trigger: introCurtain,
                start: "top 92%",
                end: "top 30%",
                scrub: true,
              },
            },
          );
        }
      }

      root.querySelectorAll<HTMLElement>("[data-hl-intro-line]").forEach((line) => {
        gsap.from(line.querySelector("span") ?? line, {
          yPercent: 110,
          ease: "none",
          scrollTrigger: {
            trigger: line,
            start: "top 92%",
            end: "top 68%",
            scrub: true,
          },
        });
      });

      const closeMedia = root.querySelector<HTMLElement>("[data-hl-close-media]");
      if (closeMedia) {
        const closeScrub = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: closeMedia.closest("section") ?? closeMedia,
            start: "top 88%",
            end: "top 28%",
            scrub: true,
          },
        });
        closeScrub.fromTo(
          closeMedia,
          { scale: 1.08, clipPath: "inset(12% 0 0 0)" },
          { scale: 1, clipPath: "inset(0% 0 0 0)" },
          0,
        );
        const closeCopy = root.querySelector<HTMLElement>(".hl-close__inner");
        if (closeCopy) {
          closeScrub.fromTo(
            closeCopy,
            { y: 36, opacity: 0.35 },
            { y: 0, opacity: 1 },
            0.15,
          );
        }
      }

      ScrollTrigger.matchMedia({
        "(min-width: 1025px)": () => {
          const runway = root.querySelector<HTMLElement>(".hl-timeline__runway");
          const pin = root.querySelector<HTMLElement>("[data-hl-timeline-pin]");
          const slides = gsap.utils.toArray<HTMLElement>("[data-hl-slide]");
          const chapters = gsap.utils.toArray<HTMLElement>("[data-hl-chapter]");
          const progress = root.querySelector<HTMLElement>("[data-hl-progress]");
          const counter = root.querySelector<HTMLElement>("[data-hl-counter]");
          if (!runway || !pin || slides.length < 2) return;

          const n = slides.length;
          const segment = 1 / n;
          const holdRatio = 0.68;

          gsap.set(slides, {
            opacity: 0,
            scale: 1.06,
            clipPath: "inset(0 0 0 0)",
          });
          gsap.set(slides[0]!, { opacity: 1, scale: 1.06, xPercent: -3 });
          gsap.set(chapters, { autoAlpha: 0, y: 28, pointerEvents: "none" });
          gsap.set(chapters[0]!, { autoAlpha: 1, y: 0, pointerEvents: "auto" });

          const firstSlideImg = slides[0]?.querySelector("img");
          if (firstSlideImg instanceof HTMLImageElement) {
            void firstSlideImg.decode?.().catch(() => undefined);
          }

          ScrollTrigger.create({
            trigger: runway,
            start: "top top",
            end: "bottom bottom",
            pin,
            pinSpacing: false,
            scrub: true,
            onUpdate: (self) => {
              const idx = Math.min(
                n - 1,
                Math.max(0, Math.floor(self.progress * n + (1 - holdRatio))),
              );
              if (counter) counter.textContent = String(idx + 1).padStart(2, "0");
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

          if (progress) tl.to(progress, { scaleX: 1, duration: 1 }, 0);

          for (let i = 0; i < n - 1; i++) {
            const holdEnd = (i + holdRatio) * segment;
            const nextStart = (i + 1) * segment;
            const fade = nextStart - holdEnd;
            const cur = slides[i]!;
            const nxt = slides[i + 1]!;
            const curCh = chapters[i];
            const nxtCh = chapters[i + 1];

            const pan =
              i === 0
                ? { xPercent: -7, scale: 1.02 }
                : i === 1
                  ? { xPercent: 5, scale: 1.03 }
                  : { xPercent: 0, scale: 1.015 };

            const revealFrom =
              i % 2 === 0
                ? { clipPath: "inset(0 100% 0 0)" }
                : { clipPath: "inset(100% 0 0 0)" };

            tl.to(cur, { ...pan, duration: holdEnd - i * segment }, i * segment);

            tl.fromTo(
              nxt,
              {
                opacity: 0,
                ...revealFrom,
                scale: 1.08,
                xPercent: i === 0 ? 4 : i === 1 ? -6 : 2,
              },
              {
                opacity: 1,
                clipPath: "inset(0 0% 0 0)",
                ...pan,
                scale: 1.03,
                duration: fade,
              },
              holdEnd,
            );
            tl.to(cur, { opacity: 0, duration: fade * 0.8 }, holdEnd + fade * 0.18);

            if (curCh && nxtCh) {
              tl.to(
                curCh,
                { autoAlpha: 0, y: -16, pointerEvents: "none", duration: fade * 0.35 },
                holdEnd,
              );
              tl.fromTo(
                nxtCh,
                { autoAlpha: 0, y: 28 },
                {
                  autoAlpha: 1,
                  y: 0,
                  pointerEvents: "auto",
                  duration: fade * 0.55,
                },
                holdEnd + fade * 0.22,
              );
            }
          }
        },

        "(min-width: 481px) and (max-width: 1024px)": () => {
          root.querySelectorAll<HTMLElement>("[data-hl-stack-chapter]").forEach((ch) => {
            const media = ch.querySelector<HTMLElement>("[data-hl-stack-media]");
            const title = ch.querySelector<HTMLElement>("[data-hl-stack-title] span");
            if (title) {
              gsap.from(title, {
                yPercent: 105,
                duration: 0.85,
                ease,
                scrollTrigger: { trigger: ch, start: "top 85%", once: true },
              });
            }
            if (media) {
              gsap.fromTo(
                media,
                { clipPath: "inset(10% 5% 10% 5%)", scale: 1.04 },
                {
                  clipPath: "inset(0% 0% 0% 0%)",
                  scale: 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: ch,
                    start: "top 80%",
                    end: "top 35%",
                    scrub: true,
                  },
                },
              );
            }
          });
        },

        "(max-width: 480px)": () => {
          root.querySelectorAll<HTMLElement>("[data-hl-stack-chapter]").forEach((ch) => {
            const media = ch.querySelector<HTMLElement>("[data-hl-stack-media]");
            const title = ch.querySelector<HTMLElement>("[data-hl-stack-title] span");
            if (title) {
              gsap.from(title, {
                yPercent: 100,
                duration: 0.7,
                ease,
                scrollTrigger: { trigger: ch, start: "top 88%", once: true },
              });
            }
            if (media) {
              gsap.fromTo(
                media,
                { y: 22, clipPath: "inset(8% 0 8% 0)" },
                {
                  y: -22,
                  clipPath: "inset(0% 0 0% 0)",
                  ease: "none",
                  scrollTrigger: {
                    trigger: ch,
                    start: "top bottom",
                    end: "bottom top",
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
