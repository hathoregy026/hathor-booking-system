"use client";

/**
 * Faithful port of assets/pages redesign/.../js/accommodation.js
 * Pin each room → scrub through 4 full-bleed images → next room.
 * Smooth Lenis scroll + soft pin so entering blocks never snaps.
 */

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  registerHathorLenis,
  restoreScrollPositionIfReload,
} from "@/lib/scroll-position-restore";

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

    let lenis: Lenis | null = null;
    let ticker: ((time: number) => void) | null = null;

    if (!prefersReduced) {
      lenis = new Lenis({
        duration: 1.55,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: false,
      });
      lenis.on("scroll", ScrollTrigger.update);
      registerHathorLenis(lenis);
      ticker = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(ticker);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      /* Intro — soft fades only (no hard pop-ins) */
      if (!prefersReduced) {
        gsap.utils
          .toArray<HTMLElement>(root.querySelectorAll(".acc-reveal"))
          .forEach((el) => {
            gsap.fromTo(
              el,
              { y: 12, opacity: 0.35 },
              {
                y: 0,
                opacity: 1,
                duration: 0.9,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 92%",
                  once: true,
                },
              },
            );
          });

        root
          .querySelectorAll<HTMLElement>(".acc-intro-title .acc-intro-line")
          .forEach((line) => {
            gsap.fromTo(
              line,
              { y: 16, opacity: 0.4 },
              {
                y: 0,
                opacity: 1,
                duration: 1,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: line.parentElement,
                  start: "top 88%",
                  once: true,
                },
              },
            );
          });
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

      const refreshWhenReady = () => {
        ScrollTrigger.refresh();
      };

      rooms.forEach((room, roomIndex) => {
        const slides = gsap.utils.toArray<HTMLElement>(
          room.querySelectorAll(".room-fs-slide"),
        );
        const imgs = slides
          .map((s) => s.querySelector("img"))
          .filter((img): img is HTMLImageElement => Boolean(img));
        const currentEl = room.querySelector<HTMLElement>(".room-fs-current");
        const progressRoot = room.querySelector<HTMLElement>(".room-fs-progress");

        /* Soft reveal for on-block copy — already in place, never hard-jump from offscreen */
        const uiBits = room.querySelectorAll<HTMLElement>(
          ".room-fs-label, .room-fs-title, .room-fs-meta, .room-fs-desc, .room-fs-cta, .room-fs-top",
        );
        if (!prefersReduced) {
          gsap.set(uiBits, { opacity: 0.92, y: 8 });
        }

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
          gsap.set(img, { scale: i === 0 ? 1.03 : 1.06 });
          if (!img.complete) {
            img.addEventListener("load", refreshWhenReady, { once: true });
          }
        });

        let textPlayed = false;
        const playText = () => {
          if (textPlayed || prefersReduced) return;
          textPlayed = true;
          gsap.to(uiBits, {
            opacity: 1,
            y: 0,
            duration: 0.85,
            stagger: 0.04,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        if (prefersReduced) {
          gsap.set(uiBits, { opacity: 1, y: 0 });
          return;
        }

        /* Extra settle room after last slide so unpin doesn't feel abrupt */
        const pinEnd = `+=${SLIDE_COUNT * 85}%`;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: room,
            start: "top top",
            end: pinEnd,
            /* Higher scrub = silkier catch-up; no hard snap into pin */
            scrub: 1.15,
            pin: true,
            pinSpacing: true,
            anticipatePin: 0,
            fastScrollEnd: true,
            preventOverlaps: true,
            invalidateOnRefresh: true,
            onEnter: () => {
              setRail(roomIndex);
              playText();
            },
            onEnterBack: () => {
              setRail(roomIndex);
              playText();
            },
            onUpdate: (self) => {
              const p = self.progress;
              const raw = Math.min(SLIDE_COUNT - 0.001, p * SLIDE_COUNT);
              const active = Math.floor(raw);
              const segProgress = raw - active;

              if (currentEl) {
                currentEl.textContent = String(active + 1).padStart(2, "0");
              }

              room
                .querySelectorAll(".room-fs-progress span i")
                .forEach((fill, i) => {
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
            { scale: 1.04 },
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
            { opacity: 1, duration: 1, ease: "none" },
            t0,
          );
          if (img) {
            tl.fromTo(
              img,
              { scale: 1.05 },
              { scale: 1.0, duration: 1, ease: "none" },
              t0,
            );
          }
        }

        /* Soft hold at end before unpin */
        tl.to({}, { duration: 0.35 });
      });

      /* Interstitial breaths — gentle fade, never a pop */
      if (!prefersReduced) {
        gsap.utils
          .toArray<HTMLElement>(root.querySelectorAll(".room-interstitial"))
          .forEach((el) => {
            gsap.fromTo(
              el.querySelectorAll(
                ".room-interstitial__eyebrow, .room-interstitial__script, .room-interstitial__body",
              ),
              { y: 10, opacity: 0.4 },
              {
                y: 0,
                opacity: 1,
                duration: 0.9,
                stagger: 0.08,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 85%",
                  once: true,
                },
              },
            );
          });
      }

      /* CTA */
      if (!prefersReduced) {
        const cta = root.querySelector(
          "#reserve .cta-inner, .cta-section .cta-inner",
        );
        if (cta) {
          gsap.fromTo(
            cta.querySelectorAll("h2, p, .btn"),
            { y: 12, opacity: 0.4 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              stagger: 0.08,
              ease: "power2.out",
              scrollTrigger: {
                trigger: cta,
                start: "top 85%",
                once: true,
              },
            },
          );
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
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      restoreScrollPositionIfReload(window.location.pathname || "/");
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        restoreScrollPositionIfReload(window.location.pathname || "/");
      });
    });

    return () => {
      window.removeEventListener("load", onLoad);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      document.querySelectorAll(".rooms-rail").forEach((el) => el.remove());
      if (ticker) gsap.ticker.remove(ticker);
      registerHathorLenis(null);
      lenis?.destroy();
      ctx.revert();
    };
  }, [rootRef, enabled]);
}
