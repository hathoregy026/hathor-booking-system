"use client";

import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

/**
 * Charter page motion — restrained cinematic sequence.
 * No second Lenis. Phone: no pin / no sticky runway.
 */
export function useCharterPageMotion(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    root.setAttribute("data-charter-motion", "on");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      root
        .querySelectorAll<HTMLElement>(
          "[data-ch-hero-curtain], [data-ch-hero-line] span, [data-ch-hero-label], [data-ch-hero-script], [data-ch-hero-copy], [data-ch-hero-actions], [data-ch-hero-scroll], [data-ch-open-line] span, [data-ch-curtain], [data-ch-reveal], [data-ch-night-media], [data-ch-night-copy], [data-ch-close-media]",
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
      /* ── Hero entrance (~1.4–1.8s) ── */
      const heroImg = root.querySelector<HTMLElement>("[data-ch-hero-img]");
      const curtain = root.querySelector<HTMLElement>("[data-ch-hero-curtain]");
      const shade = root.querySelector<HTMLElement>("[data-ch-hero-shade]");
      const label = root.querySelector<HTMLElement>("[data-ch-hero-label]");
      const lines = gsap.utils.toArray<HTMLElement>("[data-ch-hero-line]");
      const script = root.querySelector<HTMLElement>("[data-ch-hero-script]");
      const copy = root.querySelector<HTMLElement>("[data-ch-hero-copy]");
      const actions = root.querySelector<HTMLElement>("[data-ch-hero-actions]");
      const scrollCue = root.querySelector<HTMLElement>("[data-ch-hero-scroll]");
      const heroSection = root.querySelector<HTMLElement>(".ch-hero");

      if (heroImg) gsap.set(heroImg, { scale: 1.025 });
      if (curtain) gsap.set(curtain, { scaleY: 1 });
      if (label) gsap.set(label, { opacity: 0, y: 14 });
      lines.forEach((line) => {
        const inner = line.querySelector("span") ?? line;
        gsap.set(inner, { yPercent: 110 });
      });
      if (script) gsap.set(script, { opacity: 0, y: 12 });
      if (copy) gsap.set(copy, { opacity: 0, y: 18 });
      if (actions) gsap.set(actions, { opacity: 0, y: 16 });
      if (scrollCue) gsap.set(scrollCue, { opacity: 0 });

      const heroTl = gsap.timeline({ defaults: { ease } });
      if (curtain) {
        heroTl.to(
          curtain,
          { scaleY: 0, duration: light ? 0.85 : 1.05, ease: "power4.inOut" },
          0,
        );
      }
      if (label) {
        heroTl.to(label, { opacity: 1, y: 0, duration: 0.55 }, 0.35);
      }
      lines.forEach((line, i) => {
        const inner = line.querySelector("span") ?? line;
        heroTl.to(
          inner,
          { yPercent: 0, duration: light ? 0.65 : 0.8 },
          0.45 + i * 0.12,
        );
      });
      if (script) {
        heroTl.to(script, { opacity: 1, y: 0, duration: 0.55 }, 0.85);
      }
      if (copy) {
        heroTl.to(copy, { opacity: 1, y: 0, duration: 0.6 }, 1.0);
      }
      if (actions) {
        heroTl.to(actions, { opacity: 1, y: 0, duration: 0.55 }, 1.15);
      }
      if (scrollCue) {
        heroTl.to(scrollCue, { opacity: 1, duration: 0.45 }, 1.35);
      }

      /* Hero scroll depth */
      if (heroSection && heroImg) {
        const title = root.querySelector<HTMLElement>(".ch-hero__title");
        gsap
          .timeline({
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          })
          .to(heroImg, { scale: 1, ease: "none" }, 0);
        if (shade) {
          ScrollTrigger.create({
            trigger: heroSection,
            start: "top top",
            end: "bottom top",
            scrub: true,
            onUpdate: (self) => {
              shade.style.setProperty(
                "--ch-shade-boost",
                String(0.15 + self.progress * 0.25),
              );
            },
          });
        }
        if (title) {
          gsap.to(title, {
            y: light ? -18 : -36,
            ease: "none",
            scrollTrigger: {
              trigger: heroSection,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      }

      /* Generic reveals */
      root.querySelectorAll<HTMLElement>("[data-ch-reveal]").forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: light ? 18 : 28,
          duration: light ? 0.65 : 0.85,
          ease,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      });

      /* Intro open lines + curtain */
      const openLines = gsap.utils.toArray<HTMLElement>("[data-ch-open-line]");
      openLines.forEach((line) => {
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

      const openMedia = root.querySelector<HTMLElement>("[data-ch-curtain]");
      if (openMedia) {
        gsap.fromTo(
          openMedia,
          { clipPath: "inset(0 0 100% 0)" },
          {
            clipPath: "inset(0 0 0% 0)",
            duration: light ? 0.9 : 1.15,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: openMedia,
              start: "top 82%",
              once: true,
            },
          },
        );
      }

      /* Night curtain L→R + crop */
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
              end: "top 35%",
              scrub: true,
            },
          },
        );
        const nightImg = nightMedia.querySelector("img");
        if (nightImg) {
          gsap.fromTo(
            nightImg,
            { scale: 1.06, xPercent: -2 },
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
            y: 24,
            ease: "none",
            scrollTrigger: {
              trigger: night,
              start: "top 60%",
              end: "top 35%",
              scrub: true,
            },
          });
        }
      }

      /* Closing reveal */
      const closeMedia = root.querySelector<HTMLElement>("[data-ch-close-media]");
      if (closeMedia) {
        gsap.from(closeMedia, {
          scale: 1.04,
          opacity: 0.85,
          ease: "none",
          scrollTrigger: {
            trigger: closeMedia.closest("section") ?? closeMedia,
            start: "top 80%",
            end: "top 35%",
            scrub: true,
          },
        });
      }

      /* Privileges — desktop sticky chapter progress */
      ScrollTrigger.matchMedia({
        "(min-width: 1025px)": () => {
          const section = root.querySelector<HTMLElement>("[data-ch-priv]");
          const stage = section?.querySelector<HTMLElement>(".ch-priv__stage");
          const media = root.querySelector<HTMLElement>("[data-ch-priv-media]");
          const items = gsap.utils.toArray<HTMLElement>("[data-ch-priv-item]");
          const progress = root.querySelector<HTMLElement>("[data-ch-priv-progress]");
          const mediaImg = root.querySelector<HTMLElement>(".ch-priv__img");
          if (!section || !stage || !media || !items.length) return;

          items[0]?.classList.add("is-active");

          /* Pin media while privilege chapters scroll beside it */
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
                Math.floor(self.progress * items.length),
              );
              items.forEach((item, i) => {
                item.classList.toggle("is-active", i === idx);
              });
              if (progress) gsap.set(progress, { scaleX: self.progress });
              if (mediaImg) {
                gsap.set(mediaImg, {
                  yPercent: -1.5 + idx * 1.8,
                  scale: 1.025 - idx * 0.006,
                });
              }
            },
          });
        },
        "(max-width: 1024px)": () => {
          root.querySelectorAll<HTMLElement>("[data-ch-priv-item]").forEach((el) => {
            el.classList.add("is-active");
            gsap.from(el, {
              opacity: 0,
              y: 22,
              duration: 0.7,
              ease,
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            });
          });

          const media = root.querySelector<HTMLElement>("[data-ch-priv-media]");
          if (media && light) {
            gsap.fromTo(
              media,
              { y: 16 },
              {
                y: -16,
                ease: "none",
                scrollTrigger: {
                  trigger: media,
                  start: "top bottom",
                  end: "bottom top",
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
