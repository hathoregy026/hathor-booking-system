"use client";

/**
 * Faithful port of assets/pages redesign/.../js/accommodation.js
 * Pin each room → scrub through 4 full-bleed images → next room.
 */

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitType from "split-type";

gsap.registerPlugin(ScrollTrigger);

const SLIDE_COUNT = 4;

export function useAccommodationMotion(
  rootRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      /* Intro */
      if (!prefersReduced) {
        const runIntroSplit = () => {
          root
            .querySelectorAll<HTMLElement>(".acc-intro-title .acc-intro-line")
            .forEach((line) => {
              const split = new SplitType(line, { types: "chars" });
              gsap.from(split.chars, {
                y: 40,
                opacity: 0,
                duration: 0.45,
                stagger: 0.02,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: line.parentElement,
                  start: "top 82%",
                  once: true,
                },
              });
            });
        };
        if (document.fonts?.ready) {
          void document.fonts.ready.then(runIntroSplit);
        } else {
          runIntroSplit();
        }

        gsap.utils.toArray<HTMLElement>(root.querySelectorAll(".acc-reveal")).forEach(
          (el, i) => {
            gsap.from(el, {
              y: 24,
              opacity: 0,
              duration: 0.7,
              delay: i * 0.05,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 90%", once: true },
            });
          },
        );
      }

      /* Room fullscreen stack */
      const rooms = gsap.utils.toArray<HTMLElement>(
        root.querySelectorAll(".room-fs"),
      );
      if (!rooms.length) return;

      let rail: HTMLDivElement | null = null;
      const railDots: HTMLSpanElement[] = [];
      if (!prefersReduced && window.innerWidth > 767) {
        rail = document.createElement("div");
        rail.className = "rooms-rail";
        rail.setAttribute("aria-hidden", "true");
        rooms.forEach((_, i) => {
          const d = document.createElement("span");
          if (i === 0) d.classList.add("is-active");
          rail!.appendChild(d);
          railDots.push(d);
        });
        document.body.appendChild(rail);
      }

      const setRail = (i: number) => {
        railDots.forEach((d, di) => d.classList.toggle("is-active", di === i));
      };

      rooms.forEach((room, roomIndex) => {
        const slides = gsap.utils.toArray<HTMLElement>(
          room.querySelectorAll(".room-fs-slide"),
        );
        const imgs = slides
          .map((s) => s.querySelector("img"))
          .filter((img): img is HTMLImageElement => Boolean(img));
        const currentEl = room.querySelector<HTMLElement>(".room-fs-current");
        const title = room.querySelector<HTMLElement>(".room-fs-title");
        const meta = room.querySelector<HTMLElement>(".room-fs-meta");
        const desc = room.querySelector<HTMLElement>(".room-fs-desc");
        const label = room.querySelector<HTMLElement>(".room-fs-label");
        const cta = room.querySelector<HTMLElement>(".room-fs-cta");
        const topBar = room.querySelector<HTMLElement>(".room-fs-top");
        const progressRoot = room.querySelector<HTMLElement>(".room-fs-progress");

        if (progressRoot) {
          progressRoot.querySelectorAll("span").forEach((seg) => {
            let fill = seg.querySelector("i");
            if (!fill) {
              fill = document.createElement("i");
              fill.style.cssText =
                "position:absolute;inset:0;background:var(--gold-soft,#d4c28a);transform:scaleX(0);transform-origin:left center;display:block;";
              (seg as HTMLElement).style.position = "relative";
              (seg as HTMLElement).style.overflow = "hidden";
              seg.appendChild(fill);
            }
            gsap.set(fill, { scaleX: 0 });
          });
        }

        slides.forEach((slide, i) => {
          gsap.set(slide, {
            opacity: i === 0 ? 1 : 0,
            visibility: i === 0 ? "visible" : "hidden",
            zIndex: i + 1,
          });
        });
        imgs.forEach((img, i) => {
          gsap.set(img, { scale: i === 0 ? 1.06 : 1.14 });
        });

        let textPlayed = false;
        const playText = () => {
          if (textPlayed || prefersReduced) return;
          textPlayed = true;

          const run = () => {
            const targets = [label, title, meta, desc, cta, topBar].filter(
              Boolean,
            ) as HTMLElement[];

            if (title) {
              const s = new SplitType(title, { types: "chars" });
              gsap.from(s.chars, {
                y: 50,
                opacity: 0,
                duration: 0.45,
                stagger: 0.02,
                ease: "power3.out",
              });
            }
            if (meta) {
              const s = new SplitType(meta, { types: "words" });
              gsap.from(s.words, {
                y: 16,
                opacity: 0,
                duration: 0.35,
                stagger: 0.04,
                ease: "power3.out",
                delay: 0.15,
              });
            }
            if (desc) {
              const s = new SplitType(desc, { types: "lines" });
              gsap.from(s.lines, {
                y: 22,
                opacity: 0,
                duration: 0.4,
                stagger: 0.07,
                ease: "power3.out",
                delay: 0.22,
              });
            }
            gsap.from([label, cta, topBar].filter(Boolean), {
              y: 16,
              opacity: 0,
              duration: 0.45,
              stagger: 0.08,
              ease: "power3.out",
              delay: 0.1,
            });

            if (!title && !meta && !desc) {
              gsap.from(targets, {
                y: 24,
                opacity: 0,
                duration: 0.55,
                stagger: 0.08,
                ease: "power3.out",
              });
            }
          };

          if (document.fonts?.ready) void document.fonts.ready.then(run);
          else run();
        };

        if (prefersReduced) {
          playText();
          return;
        }

        const pinEnd = `+=${SLIDE_COUNT * 75}%`;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: room,
            start: "top top",
            end: pinEnd,
            scrub: 0.55,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onEnter: () => {
              setRail(roomIndex);
              playText();
            },
            onEnterBack: () => setRail(roomIndex),
            onUpdate: (self) => {
              const p = self.progress;
              const raw = Math.min(SLIDE_COUNT - 0.001, p * SLIDE_COUNT);
              const active = Math.floor(raw);
              const segProgress = raw - active;

              if (currentEl) {
                currentEl.textContent = String(active + 1).padStart(2, "0");
              }

              room.querySelectorAll(".room-fs-progress span i").forEach((fill, i) => {
                let sx = 0;
                if (i < active) sx = 1;
                else if (i === active) sx = segProgress;
                gsap.set(fill, { scaleX: sx });
              });
            },
          },
        });

        if (imgs[0]) {
          tl.fromTo(
            imgs[0],
            { scale: 1.12 },
            { scale: 1.0, duration: 1, ease: "none" },
            0,
          );
        }

        for (let i = 1; i < slides.length; i++) {
          const slide = slides[i]!;
          const img = imgs[i];
          const t0 = i;

          tl.set(slide, { visibility: "visible" }, t0);
          tl.fromTo(
            slide,
            { opacity: 0 },
            { opacity: 1, duration: 0.9, ease: "none" },
            t0,
          );
          if (img) {
            tl.fromTo(
              img,
              { scale: 1.14 },
              { scale: 1.0, duration: 1, ease: "none" },
              t0,
            );
          }
        }

        tl.to({}, { duration: 0.05 });
      });

      /* CTA */
      if (!prefersReduced) {
        const cta = root.querySelector(
          "#reserve .cta-inner, .cta-section .cta-inner",
        );
        if (cta) {
          gsap.from(cta.querySelectorAll("h2, p, .btn"), {
            y: 24,
            opacity: 0,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: cta,
              start: "top 82%",
              once: true,
            },
          });
        }
      }
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
      document.querySelectorAll(".rooms-rail").forEach((el) => el.remove());
      ctx.revert();
    };
  }, [rootRef, enabled]);
}
