"use client";

/**
 * Luxury body motion for redesigned public pages (dining / wellness / highlights / rooms / cruises sheet).
 * Ported from assets/pages redesign/venetian-scroll-clone/js/lux-body.js
 * Does NOT touch PublicSiteHero / hero-scroll-stage.
 */

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useHathorLuxBodyMotion(
  rootRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ease = "power3.out";
    const lux = "power4.out";
    const ctx = gsap.context(() => {
      root.querySelectorAll<HTMLElement>("[data-lux-title]").forEach((el) => {
        gsap.from(el, {
          y: 42,
          opacity: 0,
          duration: 1.05,
          ease: lux,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      root.querySelectorAll<HTMLElement>("[data-lux-reveal]").forEach((el, i) => {
        gsap.from(el, {
          y: 28,
          opacity: 0,
          duration: 0.85,
          delay: (i % 6) * 0.05,
          ease,
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });

      root.querySelectorAll<HTMLElement>(".lux-mask").forEach((mask) => {
        if (
          mask.closest(".spx-frame-media") ||
          mask.closest(".hlx-panel-media") ||
          mask.closest(".dnx-chapter-media") ||
          mask.closest(".acc-fs-media")
        ) {
          return;
        }
        const img = mask.querySelector("img");
        if (!img) return;
        gsap
          .timeline({
            scrollTrigger: { trigger: mask, start: "top 84%", once: true },
          })
          .fromTo(
            mask,
            { clipPath: "inset(10% 10% 10% 10% round 4px)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 4px)",
              duration: 1.1,
              ease: "power2.out",
            },
          )
          .fromTo(
            img,
            { scale: 1.24 },
            { scale: 1, duration: 1.2, ease: "power2.out" },
            0,
          );
      });

      /* Wellness / rooms pinned frames */
      root.querySelectorAll<HTMLElement>(".spx-frame, .acc-fs").forEach((frame) => {
        const img = frame.querySelector<HTMLElement>(
          ".spx-frame-media img, .acc-fs-media img",
        );
        const shade = frame.querySelector<HTMLElement>(
          ".spx-frame-shade, .acc-fs-shade",
        );
        const ui = frame.querySelector<HTMLElement>(".spx-frame-ui, .acc-fs-ui");
        const bits = ui
          ? ui.querySelectorAll<HTMLElement>(
              ".lux-kicker, .lux-gold, .lux-lead, .lux-copy, .btn, .public-fab__book, a, button",
            )
          : [];

        if (bits.length) gsap.set(bits, { y: 42, opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: frame,
            start: "top top",
            end: "+=145%",
            scrub: 0.85,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        if (img) {
          tl.fromTo(
            img,
            { scale: 1.28, yPercent: 4 },
            { scale: 1, yPercent: 0, ease: "none", duration: 1 },
            0,
          );
        }
        if (shade) {
          tl.fromTo(
            shade,
            { opacity: 0.75 },
            { opacity: 1, duration: 0.35, ease: "none" },
            0,
          );
        }
        bits.forEach((el, i) => {
          tl.to(
            el,
            { y: 0, opacity: 1, duration: 0.18, ease: "none" },
            0.1 + i * 0.07,
          );
        });
        if (img) {
          tl.to(
            img,
            { yPercent: -8, scale: 1.04, duration: 0.4, ease: "none" },
            0.62,
          );
        }
        tl.to({}, { duration: 0.12 });
      });

      /* Highlights horizontal */
      const pin = root.querySelector<HTMLElement>(".hlx-pin");
      const track = root.querySelector<HTMLElement>("#hlx-track");
      const segs = root.querySelectorAll<HTMLElement>(".hlx-progress span i");
      if (pin && track) {
        const getScroll = () => {
          const total = track.scrollWidth - window.innerWidth;
          return Math.max(window.innerWidth * 0.9, total + 100);
        };
        gsap.set(track, { x: 0 });
        gsap.to(track, {
          x: () => -getScroll(),
          ease: "none",
          scrollTrigger: {
            id: "hlx-horiz",
            trigger: pin,
            start: "top top",
            end: () => `+=${getScroll()}`,
            scrub: 0.75,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const panels = track.querySelectorAll(".hlx-panel").length || 1;
              const raw = self.progress * panels;
              const active = Math.min(panels - 1, Math.floor(raw));
              const seg = raw - active;
              segs.forEach((fill, i) => {
                let sx = 0;
                if (i < active) sx = 1;
                else if (i === active) sx = seg;
                gsap.set(fill, { scaleX: sx });
              });
            },
          },
        });

        root.querySelectorAll<HTMLElement>(".hlx-panel").forEach((panel, i) => {
          gsap.from(panel, {
            y: 50,
            opacity: 0,
            duration: 0.9,
            delay: Math.min(i, 2) * 0.08,
            ease,
            scrollTrigger: {
              trigger: pin,
              start: "top 85%",
              once: true,
            },
          });
        });
      }

      /* Dining chapters */
      root.querySelectorAll<HTMLElement>(".dnx-chapter").forEach((ch) => {
        const panel = ch.querySelector<HTMLElement>(".dnx-panel");
        const media = ch.querySelector<HTMLElement>(".dnx-chapter-media img");
        const shade = ch.querySelector<HTMLElement>(".dnx-chapter-shade");
        const bits = panel
          ? panel.querySelectorAll<HTMLElement>(
              ".lux-kicker, .lux-gold, .lux-copy, .lux-lead, .btn, a, button",
            )
          : [];

        if (bits.length) gsap.set(bits, { y: 28, opacity: 0 });

        if (media) {
          gsap.fromTo(
            media,
            { scale: 1.22 },
            {
              scale: 1.05,
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

        if (shade) {
          gsap.fromTo(
            shade,
            { opacity: 0.7 },
            {
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: ch,
                start: "top 80%",
                end: "top 20%",
                scrub: true,
              },
            },
          );
        }

        if (panel) {
          gsap.from(panel, {
            y: 60,
            opacity: 0,
            duration: 1.05,
            ease: lux,
            scrollTrigger: {
              trigger: ch,
              start: "top 72%",
              once: true,
              onEnter: () => {
                gsap.to(bits, {
                  y: 0,
                  opacity: 1,
                  duration: 0.7,
                  stagger: 0.08,
                  ease,
                  delay: 0.12,
                });
              },
            },
          });
        }
      });

      /* Cruise cards cascade */
      root.querySelectorAll<HTMLElement>(".cruise-card, .hathor-cruise-card").forEach(
        (card, i) => {
          gsap.from(card, {
            y: 40,
            opacity: 0,
            duration: 0.75,
            delay: (i % 6) * 0.06,
            ease,
            scrollTrigger: { trigger: card, start: "top 92%", once: true },
          });
        },
      );

      root.querySelectorAll<HTMLElement>(".lux-cta-band, .cta-section .cta-inner").forEach(
        (cta) => {
          gsap.from(cta.querySelectorAll("h2, p, .btn, button, a"), {
            y: 28,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease,
            scrollTrigger: { trigger: cta, start: "top 82%", once: true },
          });
        },
      );
    }, root);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    };
    window.addEventListener("resize", onResize);

    requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      window.removeEventListener("load", onLoad);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      ctx.revert();
    };
  }, [rootRef, enabled]);
}
