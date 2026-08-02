"use client";

import { type RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/** Quiet-opulence motion — page-local only; single Lenis owner elsewhere. */
export function useLuxuryEditorialMotion(
  rootRef: RefObject<HTMLElement | null>,
) {
  useLayoutEffect(() => {
    const element = rootRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(
          element.querySelectorAll(
            "[data-lux-reveal], [data-lux-rule], [data-lux-media] img, [data-lux-media] video, [data-lux-line]",
          ),
          { clearProps: "all", autoAlpha: 1, y: 0, scale: 1, scaleX: 1 },
        );
        return;
      }

      gsap.utils
        .toArray<HTMLElement>("[data-lux-reveal]", element)
        .forEach((item) => {
          gsap.fromTo(
            item,
            { y: 28, autoAlpha: 0 },
            {
              y: 0,
              autoAlpha: 1,
              duration: 1.05,
              ease: "power3.out",
              scrollTrigger: {
                trigger: item,
                start: "top 86%",
                once: true,
              },
            },
          );
        });

      gsap.utils
        .toArray<HTMLElement>("[data-lux-line]", element)
        .forEach((line) => {
          gsap.fromTo(
            line,
            { yPercent: 110, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 1.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: line,
                start: "top 88%",
                once: true,
              },
            },
          );
        });

      gsap.utils
        .toArray<HTMLElement>("[data-lux-rule]", element)
        .forEach((rule) => {
          gsap.fromTo(
            rule,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 1.15,
              ease: "power3.inOut",
              scrollTrigger: {
                trigger: rule,
                start: "top 90%",
                once: true,
              },
            },
          );
        });

      gsap.utils
        .toArray<HTMLElement>("[data-lux-media]", element)
        .forEach((media) => {
          const image = media.querySelector("img, video");
          if (!image) return;
          const clip = media.dataset.luxClip === "up";

          if (clip) {
            gsap.fromTo(
              media,
              { clipPath: "inset(100% 0 0 0)" },
              {
                clipPath: "inset(0% 0 0 0)",
                duration: 1.25,
                ease: "power3.inOut",
                scrollTrigger: {
                  trigger: media,
                  start: "top 88%",
                  once: true,
                },
              },
            );
          }

          gsap.fromTo(
            image,
            { scale: 1.025 },
            {
              scale: 1,
              duration: 1.4,
              ease: "power3.out",
              scrollTrigger: {
                trigger: media,
                start: "top 88%",
                once: true,
              },
            },
          );
        });

      const heroImg = element.querySelector<HTMLElement>("[data-lux-hero-img]");
      if (heroImg) {
        gsap.fromTo(
          heroImg,
          { scale: 1.035 },
          { scale: 1, duration: 1.9, ease: "power3.out" },
        );
      }

      mm.add("(min-width: 1025px) and (hover: hover)", () => {
        if (heroImg) {
          const hero = element.querySelector<HTMLElement>("[data-lux-hero]");
          if (hero) {
            gsap.to(heroImg, {
              yPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: hero,
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            });
          }
        }

        gsap.utils
          .toArray<HTMLElement>("[data-lux-parallax]", element)
          .forEach((media) => {
            const image = media.querySelector("img, video");
            if (!image) return;
            gsap.fromTo(
              image,
              { yPercent: -2.5 },
              {
                yPercent: 2.5,
                ease: "none",
                scrollTrigger: {
                  trigger: media,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          });

        /* Day narrative scrub */
        const day = element.querySelector<HTMLElement>("[data-lux-day]");
        if (day) {
          const moments = gsap.utils.toArray<HTMLElement>(
            "[data-lux-day-moment]",
            day,
          );
          const slides = gsap.utils.toArray<HTMLElement>(
            "[data-lux-day-slide]",
            day,
          );
          if (moments.length && slides.length) {
            ScrollTrigger.create({
              trigger: day,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
              onUpdate: (self) => {
                const idx = Math.min(
                  moments.length - 1,
                  Math.floor(self.progress * moments.length),
                );
                moments.forEach((m, i) => {
                  const on = i === idx;
                  m.toggleAttribute("data-active", on);
                });
                slides.forEach((s, i) => {
                  s.toggleAttribute("data-active", i === idx);
                });
              },
            });
          }
        }

        /* Rhythm scrub */
        const rhythm = element.querySelector<HTMLElement>("[data-lux-rhythm]");
        if (rhythm) {
          const slides = gsap.utils.toArray<HTMLElement>(
            "[data-lux-rhythm-slide]",
            rhythm,
          );
          const phrase = rhythm.querySelector<HTMLElement>(
            "[data-lux-rhythm-phrase]",
          );
          const bar = rhythm.querySelector<HTMLElement>(
            "[data-lux-rhythm-bar]",
          );
          const phrases = (rhythm.dataset.luxPhrases || "")
            .split("|")
            .filter(Boolean);

          if (slides.length) {
            ScrollTrigger.create({
              trigger: rhythm,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
              onUpdate: (self) => {
                const idx = Math.min(
                  slides.length - 1,
                  Math.floor(self.progress * slides.length),
                );
                slides.forEach((s, i) =>
                  s.toggleAttribute("data-active", i === idx),
                );
                if (phrase && phrases[idx]) phrase.textContent = phrases[idx];
                if (bar) {
                  bar.style.transform = `scaleX(${Math.max(0.08, self.progress)})`;
                }
              },
            });
          }
        }
      });
    }, element);

    const onLoad = () => requestScrollRefresh("lux-editorial-load");
    window.addEventListener("load", onLoad);
    requestAnimationFrame(() => requestScrollRefresh("lux-editorial-mount"));

    return () => {
      window.removeEventListener("load", onLoad);
      mm.revert();
      ctx.revert();
    };
  }, [rootRef]);
}
