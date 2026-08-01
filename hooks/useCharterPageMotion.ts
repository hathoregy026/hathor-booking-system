"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/** Charter — private ownership cinema. No second Lenis. Phone: no pin. */
export function useCharterPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.setAttribute("data-charter-motion", "on");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root.setAttribute("data-charter-reduced", "");
      root
        .querySelectorAll<HTMLElement>(
          "[data-ch-hero-veil], [data-ch-hero-line] span, [data-ch-hero-line-gold], [data-ch-hero-script], [data-ch-hero-copy], [data-ch-hero-cta], [data-ch-reveal], [data-ch-night-media], [data-ch-night-copy], [data-ch-chapter-slide], [data-ch-chapter-item]",
        )
        .forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
          el.style.clipPath = "none";
        });
      const veil = root.querySelector<HTMLElement>("[data-ch-hero-veil]");
      if (veil) veil.style.display = "none";
      root.querySelectorAll<HTMLElement>("[data-ch-chapter-item]").forEach((el) => {
        el.classList.add("is-active");
      });
      return;
    }

    const light = shouldLightenMotionForDevice();
    const ease = "power3.out";

    const ctx = gsap.context(() => {
      const hero = root.querySelector<HTMLElement>("[data-ch-hero]");
      const heroImg = root.querySelector<HTMLElement>("[data-ch-hero-img]");
      const veil = root.querySelector<HTMLElement>("[data-ch-hero-veil]");
      const goldLine = root.querySelector<HTMLElement>("[data-ch-hero-line-gold]");
      const lines = gsap.utils.toArray<HTMLElement>("[data-ch-hero-line]");
      const script = root.querySelector<HTMLElement>("[data-ch-hero-script]");
      const copy = root.querySelector<HTMLElement>("[data-ch-hero-copy]");
      const cta = root.querySelector<HTMLElement>("[data-ch-hero-cta]");
      const shade = root.querySelector<HTMLElement>("[data-ch-hero-shade]");

      if (heroImg) gsap.set(heroImg, { scale: 1.08, yPercent: 0 });
      if (veil) gsap.set(veil, { scaleY: 1 });
      if (goldLine) gsap.set(goldLine, { scaleX: 0 });
      lines.forEach((line) => {
        gsap.set(line.querySelector("span") ?? line, { yPercent: 115 });
      });
      if (script) gsap.set(script, { opacity: 0, y: 14 });
      if (copy) gsap.set(copy, { opacity: 0, y: 20 });
      if (cta) gsap.set(cta, { opacity: 0, y: 16 });

      const heroBitmap = heroImg?.querySelector("img");
      if (heroBitmap instanceof HTMLImageElement) {
        heroBitmap.decoding = "async";
        void heroBitmap.decode?.().catch(() => undefined);
      }

      const open = gsap.timeline({ defaults: { ease } });
      if (veil) {
        open.to(
          veil,
          { scaleY: 0, duration: light ? 0.75 : 0.95, ease: "power4.inOut" },
          0,
        );
      }
      if (goldLine) {
        open.to(goldLine, { scaleX: 1, duration: 0.65 }, 0.18);
      }
      lines.forEach((line, i) => {
        open.to(
          line.querySelector("span") ?? line,
          { yPercent: 0, duration: light ? 0.7 : 0.9 },
          0.35 + i * 0.12,
        );
      });
      if (script) open.to(script, { opacity: 1, y: 0, duration: 0.55 }, 0.75);
      if (copy) open.to(copy, { opacity: 1, y: 0, duration: 0.6 }, 0.9);
      if (cta) open.to(cta, { opacity: 1, y: 0, duration: 0.55 }, 1.05);

      if (hero && heroImg) {
        const title = root.querySelector<HTMLElement>(".ch-hero__title");
        const heroScrub = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        heroScrub.to(heroImg, { scale: 1, yPercent: 5 }, 0);
        if (title) heroScrub.to(title, { y: light ? -22 : -48, opacity: 0.4 }, 0);
        if (script) heroScrub.to(script, { y: light ? -10 : -20, opacity: 0 }, 0);
        if (copy) heroScrub.to(copy, { y: light ? -8 : -16, opacity: 0 }, 0);
        if (cta) heroScrub.to(cta, { opacity: 0 }, 0);
        if (shade) {
          heroScrub.fromTo(
            shade,
            { "--ch-shade-boost": 0.08 },
            { "--ch-shade-boost": 0.38 },
            0,
          );
        }
      }

      root.querySelectorAll<HTMLElement>("[data-ch-reveal]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: light ? 18 : 28,
          duration: light ? 0.65 : 0.9,
          ease,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      const night = root.querySelector<HTMLElement>("[data-ch-night]");
      const nightMedia = root.querySelector<HTMLElement>("[data-ch-night-media]");
      const nightCopy = root.querySelector<HTMLElement>("[data-ch-night-copy]");
      if (night && nightMedia) {
        gsap.fromTo(
          nightMedia,
          { clipPath: "inset(0 100% 0 0)" },
          {
            clipPath: "inset(0 0% 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: night,
              start: "top 78%",
              end: "top 32%",
              scrub: true,
            },
          },
        );
        const img = nightMedia.querySelector("img");
        if (img) {
          gsap.fromTo(
            img,
            { scale: 1.07, xPercent: -3 },
            {
              scale: 1,
              xPercent: 0,
              ease: "none",
              scrollTrigger: {
                trigger: night,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
        if (nightCopy) {
          gsap.from(nightCopy, {
            opacity: 0,
            y: 28,
            ease: "none",
            scrollTrigger: {
              trigger: night,
              start: "top 58%",
              end: "top 32%",
              scrub: true,
            },
          });
        }
      }

      const closeMedia = root.querySelector<HTMLElement>("[data-ch-close-media]");
      if (closeMedia) {
        const closeScrub = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: closeMedia.closest("section") ?? closeMedia,
            start: "top 85%",
            end: "top 32%",
            scrub: true,
          },
        });
        closeScrub.fromTo(
          closeMedia,
          { scale: 1.07, clipPath: "inset(10% 0 0 0)" },
          { scale: 1, clipPath: "inset(0% 0 0 0)" },
          0,
        );
        const closeInner = root.querySelector<HTMLElement>(".ch-close__inner");
        if (closeInner) {
          closeScrub.fromTo(
            closeInner,
            { y: 28, opacity: 0.4 },
            { y: 0, opacity: 1 },
            0.12,
          );
        }
      }

      ScrollTrigger.matchMedia({
        "(min-width: 1025px)": () => {
          const section = root.querySelector<HTMLElement>("[data-ch-chapters]");
          const stage = section?.querySelector<HTMLElement>(".ch-chapters__stage");
          const media = root.querySelector<HTMLElement>("[data-ch-chapters-media]");
          const items = gsap.utils.toArray<HTMLElement>("[data-ch-chapter-item]");
          const slides = gsap.utils.toArray<HTMLElement>("[data-ch-chapter-slide]");
          const progress = root.querySelector<HTMLElement>(
            "[data-ch-chapters-progress]",
          );
          if (!section || !stage || !media || !items.length) return;

          const n = Math.max(items.length, slides.length || 1);
          const segment = 1 / n;
          const holdRatio = 0.64;

          items[0]?.classList.add("is-active");
          if (slides.length) {
            gsap.set(slides, {
              opacity: 0,
              scale: 1.05,
              clipPath: "inset(0 0 0 0)",
            });
            gsap.set(slides[0]!, { opacity: 1, scale: 1.05, yPercent: 0 });
            const firstImg = slides[0]?.querySelector("img");
            if (firstImg instanceof HTMLImageElement) {
              void firstImg.decode?.().catch(() => undefined);
            }
          }

          const chapterTl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: stage,
              start: "top top+=96",
              end: "bottom bottom",
              scrub: true,
            },
          });

          if (progress) chapterTl.to(progress, { scaleX: 1, duration: 1 }, 0);

          for (let i = 0; i < n - 1; i++) {
            const holdEnd = (i + holdRatio) * segment;
            const nextStart = (i + 1) * segment;
            const fade = nextStart - holdEnd;
            const cur = slides[i];
            const nxt = slides[i + 1];
            const revealFrom =
              i % 2 === 0
                ? { clipPath: "inset(0 100% 0 0)" }
                : { clipPath: "inset(100% 0 0 0)" };
            const pan =
              i % 2 === 0
                ? { yPercent: -3, scale: 1.02 }
                : { yPercent: 2, scale: 1.03 };

            if (cur) {
              chapterTl.to(
                cur,
                { ...pan, duration: holdEnd - i * segment },
                i * segment,
              );
            }
            if (nxt && cur) {
              chapterTl.fromTo(
                nxt,
                {
                  opacity: 0,
                  ...revealFrom,
                  scale: 1.07,
                  yPercent: i % 2 === 0 ? 4 : -3,
                },
                {
                  opacity: 1,
                  clipPath: "inset(0 0% 0 0)",
                  ...pan,
                  scale: 1.02,
                  duration: fade,
                },
                holdEnd,
              );
              chapterTl.to(
                cur,
                { opacity: 0, duration: fade * 0.75 },
                holdEnd + fade * 0.2,
              );
            }
          }

          ScrollTrigger.create({
            trigger: stage,
            start: "top top+=96",
            end: "bottom bottom",
            pin: media,
            pinSpacing: false,
            scrub: true,
            onUpdate: (self) => {
              const idx = Math.min(
                items.length - 1,
                Math.max(
                  0,
                  Math.floor(self.progress * items.length + (1 - holdRatio)),
                ),
              );
              items.forEach((item, i) => {
                item.classList.toggle("is-active", i === idx);
              });
            },
          });
        },
        "(min-width: 481px) and (max-width: 1024px)": () => {
          const items = gsap.utils.toArray<HTMLElement>("[data-ch-chapter-item]");
          const slides = gsap.utils.toArray<HTMLElement>("[data-ch-chapter-slide]");
          const list = root.querySelector<HTMLElement>(".ch-chapters__list");

          items.forEach((el) => {
            el.classList.add("is-active");
            gsap.from(el, {
              opacity: 0,
              y: 24,
              duration: 0.75,
              ease,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            });
          });

          if (slides.length && list) {
            gsap.set(slides, { opacity: 0, scale: 1.04 });
            gsap.set(slides[0]!, { opacity: 1, scale: 1.04 });
            const n = slides.length;
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: list,
                start: "top 72%",
                end: "bottom 40%",
                scrub: true,
              },
            });
            for (let i = 0; i < n - 1; i++) {
              const at = i / (n - 1);
              const next = (i + 1) / (n - 1);
              const dur = next - at;
              tl.to(slides[i]!, { opacity: 0, scale: 1, duration: dur }, at);
              tl.fromTo(
                slides[i + 1]!,
                {
                  opacity: 0,
                  scale: 1.05,
                  clipPath: i % 2 === 0 ? "inset(0 100% 0 0)" : "inset(8% 0 8% 0)",
                },
                {
                  opacity: 1,
                  scale: 1.01,
                  clipPath: "inset(0 0% 0 0)",
                  duration: dur,
                },
                at,
              );
            }
          }
        },
        "(max-width: 480px)": () => {
          const items = gsap.utils.toArray<HTMLElement>("[data-ch-chapter-item]");
          const slides = gsap.utils.toArray<HTMLElement>("[data-ch-chapter-slide]");
          const list = root.querySelector<HTMLElement>(".ch-chapters__list");

          items.forEach((el) => {
            el.classList.add("is-active");
            gsap.from(el, {
              opacity: 0,
              y: 18,
              duration: 0.65,
              ease,
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            });
          });

          if (slides.length && list) {
            gsap.set(slides, { opacity: 0, scale: 1.03 });
            gsap.set(slides[0]!, { opacity: 1, scale: 1.03 });
            const n = slides.length;
            const tl = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: list,
                start: "top 70%",
                end: "bottom 45%",
                scrub: true,
              },
            });
            for (let i = 0; i < n - 1; i++) {
              const at = i / (n - 1);
              const next = (i + 1) / (n - 1);
              tl.to(slides[i]!, { opacity: 0, scale: 1, duration: next - at }, at);
              tl.fromTo(
                slides[i + 1]!,
                { opacity: 0, scale: 1.04 },
                { opacity: 1, scale: 1.01, duration: next - at },
                at,
              );
            }
            gsap.fromTo(
              slides[0]!,
              { clipPath: "inset(8% 0 8% 0)" },
              {
                clipPath: "inset(0% 0 0% 0)",
                ease: "none",
                scrollTrigger: {
                  trigger: slides[0]!,
                  start: "top 88%",
                  end: "top 50%",
                  scrub: true,
                },
              },
            );
          }
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
