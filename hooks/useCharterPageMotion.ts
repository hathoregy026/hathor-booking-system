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

      if (heroImg) gsap.set(heroImg, { scale: 1.04 });
      if (veil) gsap.set(veil, { scaleY: 1 });
      if (goldLine) gsap.set(goldLine, { scaleX: 0 });
      lines.forEach((line) => {
        gsap.set(line.querySelector("span") ?? line, { yPercent: 112 });
      });
      if (script) gsap.set(script, { opacity: 0, y: 12 });
      if (copy) gsap.set(copy, { opacity: 0, y: 18 });
      if (cta) gsap.set(cta, { opacity: 0, y: 16 });

      const open = gsap.timeline({ defaults: { ease } });
      if (goldLine) {
        open.to(goldLine, { scaleX: 1, duration: 0.7 }, 0.15);
      }
      if (veil) {
        open.to(
          veil,
          { scaleY: 0, duration: light ? 0.95 : 1.2, ease: "power4.inOut" },
          0.25,
        );
      }
      lines.forEach((line, i) => {
        open.to(
          line.querySelector("span") ?? line,
          { yPercent: 0, duration: light ? 0.7 : 0.9 },
          0.55 + i * 0.12,
        );
      });
      if (script) open.to(script, { opacity: 1, y: 0, duration: 0.55 }, 0.95);
      if (copy) open.to(copy, { opacity: 1, y: 0, duration: 0.6 }, 1.1);
      if (cta) open.to(cta, { opacity: 1, y: 0, duration: 0.55 }, 1.25);

      if (hero && heroImg) {
        const title = root.querySelector<HTMLElement>(".ch-hero__title");
        gsap.to(heroImg, {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        if (title) {
          gsap.to(title, {
            y: light ? -20 : -42,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
        if (shade) {
          gsap.fromTo(
            shade,
            { "--ch-shade-boost": 0.12 },
            {
              "--ch-shade-boost": 0.4,
              ease: "none",
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            },
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
        gsap.from(closeMedia, {
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: closeMedia.closest("section") ?? closeMedia,
            start: "top 80%",
            end: "top 35%",
            scrub: true,
          },
        });
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

          items[0]?.classList.add("is-active");
          if (slides.length) {
            gsap.set(slides, {
              opacity: 0,
              scale: 1.04,
              clipPath: "inset(0 0 0 0)",
            });
            gsap.set(slides[0]!, { opacity: 1, scale: 1.04 });
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
            const holdEnd = (i + 0.58) * segment;
            const nextStart = (i + 1) * segment;
            const fade = nextStart - holdEnd;
            const cur = slides[i];
            const nxt = slides[i + 1];
            if (cur) {
              chapterTl.to(
                cur,
                { scale: 1.01, yPercent: -2, duration: holdEnd - i * segment },
                i * segment,
              );
            }
            if (nxt && cur) {
              chapterTl.fromTo(
                nxt,
                { opacity: 0, clipPath: "inset(0 100% 0 0)", scale: 1.05 },
                {
                  opacity: 1,
                  clipPath: "inset(0 0% 0 0)",
                  scale: 1.02,
                  duration: fade,
                },
                holdEnd,
              );
              chapterTl.to(
                cur,
                { opacity: 0, duration: fade * 0.8 },
                holdEnd + fade * 0.15,
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
                Math.floor(self.progress * items.length + 0.0001),
              );
              items.forEach((item, i) => {
                item.classList.toggle("is-active", i === idx);
              });
            },
          });
        },
        "(max-width: 1024px)": () => {
          const items = gsap.utils.toArray<HTMLElement>("[data-ch-chapter-item]");
          const slides = gsap.utils.toArray<HTMLElement>("[data-ch-chapter-slide]");
          const list = root.querySelector<HTMLElement>(".ch-chapters__list");

          items.forEach((el) => {
            el.classList.add("is-active");
            gsap.from(el, {
              opacity: 0,
              y: 22,
              duration: 0.7,
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
              { clipPath: "inset(8% 4% 8% 4%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
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
