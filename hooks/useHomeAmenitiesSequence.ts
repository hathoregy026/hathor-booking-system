"use client";

import { RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  amenitiesWipeClip,
  amenitiesWipeClosed,
  amenitiesWipeOpen,
  luxWipe,
} from "@/lib/fixed-mask-reveal";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

const clamp = (v: number) => Math.max(0, Math.min(1, v));
const seg = (p: number, a: number, b: number) => {
  if (b <= a) return p >= b ? 1 : 0;
  return luxWipe(clamp((p - a) / (b - a)));
};

/**
 * Springs amenities Fixed-Background Mask Reveal:
 * CSS under-previous/under-next clips cover chapters on the SECTION.
 * GSAP only morphs INNER panels — sticky stages stay put (no block wipes).
 */
export function useHomeAmenitiesSequence(
  rootRef: RefObject<HTMLElement | null>,
  sliderCount: number,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCompact = window.matchMedia("(max-width: 1024px)").matches;
    const isPhone = window.matchMedia("(max-width: 480px)").matches;
    const isDesktop = !isCompact;

    const context = gsap.context(() => {
      if (reduced) return;

      /* ---------- i-intro ---------- */
      const intro = root.querySelector<HTMLElement>("[data-am-intro]");
      if (intro) {
        const media = intro.querySelector<HTMLElement>("[data-am-intro-media]");
        const dim = intro.querySelector<HTMLElement>("[data-am-intro-dim]");
        const title = intro.querySelector<HTMLElement>("[data-am-intro-title]");
        const cream = intro.querySelector<HTMLElement>("[data-am-intro-cream]");
        const creamAngle = isPhone ? "up" : "right";

        gsap.set(media, {
          xPercent: 0,
          scale: 1.2,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
        });
        gsap.set(dim, { autoAlpha: 0.55 });
        gsap.set(title, { autoAlpha: 1, y: 0 });
        gsap.set(cream, { clipPath: amenitiesWipeClosed(creamAngle) });

        ScrollTrigger.create({
          id: "home-am-intro",
          trigger: intro,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          refreshPriority: -88,
          onUpdate: (self) => {
            const p = self.progress;
            /* Springs introImage: clip to left 50% while image drifts left */
            const slide = seg(p, 0, 0.55);
            if (isDesktop) {
              const right = 100 - slide * 50;
              gsap.set(media, {
                xPercent: slide * -36,
                scale: 1.2 - slide * 0.2,
                clipPath: `polygon(0 0, ${right}% 0, ${right}% 100%, 0% 100%)`,
              });
            } else {
              gsap.set(media, {
                xPercent: isPhone ? slide * -10 : slide * -18,
                scale: 1.2 - slide * 0.15,
                clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
              });
            }
            gsap.set(dim, { autoAlpha: 0.55 * (1 - seg(p, 0, 0.35)) });
            gsap.set(title, {
              autoAlpha: 1 - seg(p, 0.12, 0.4),
              y: seg(p, 0.12, 0.4) * (isPhone ? -24 : -40),
            });
            /* Cream expands from the right into the freed half */
            gsap.set(cream, {
              clipPath: amenitiesWipeClip(creamAngle, seg(p, 0.08, 0.55)),
            });
          },
        });
      }

      /* ---------- i-video ---------- */
      const video = root.querySelector<HTMLElement>("[data-am-video]");
      if (video) {
        const hero = video.querySelector<HTMLElement>("[data-am-video-hero]");
        const inset = video.querySelector<HTMLElement>("[data-am-video-inset]");
        const copy = video.querySelector<HTMLElement>("[data-am-video-copy]");
        const title = video.querySelector<HTMLElement>("[data-am-video-title]");
        const caption = video.querySelector<HTMLElement>(
          "[data-am-video-caption]",
        );

        /*
         * Springs videoZoom: tiny bottom-right frame → fullscreen grow.
         * Cover into this chapter is CSS section clip (not a stage wipe).
         */
        if (isDesktop) {
          gsap.set(hero, {
            scale: 0.29,
            x: -206,
            y: -206,
            transformOrigin: "bottom right",
          });
        } else if (isPhone) {
          /* Same grow idea, cheaper — scale from bottom (no height layout thrash) */
          gsap.set(hero, {
            scale: 0.42,
            transformOrigin: "bottom center",
          });
        } else {
          gsap.set(hero, {
            scale: 0.66,
            xPercent: 9,
            yPercent: 16,
            transformOrigin: "bottom right",
          });
        }
        gsap.set(inset, {
          autoAlpha: 0,
          scale: 1.15,
          yPercent: 40,
          clipPath: amenitiesWipeClosed("up"),
        });
        gsap.set([copy, title], { autoAlpha: 0, y: 28 });
        gsap.set(caption, {
          clipPath: amenitiesWipeClosed("up"),
          autoAlpha: 1,
        });

        ScrollTrigger.create({
          id: "home-am-video",
          trigger: video,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          refreshPriority: -87,
          onUpdate: (self) => {
            const p = self.progress;
            /* 0–~0.28: grow over the previous sticky (Springs --100 → --150) */
            const grow = seg(p, 0, 0.28);
            if (isDesktop) {
              const s =
                grow < 0.2
                  ? 0.29 + (grow / 0.2) * (0.5 - 0.29)
                  : 0.5 + ((grow - 0.2) / 0.8) * 0.5;
              const shift = grow < 0.2 ? -206 * (1 - grow / 0.2) : 0;
              gsap.set(hero, { scale: s, x: shift, y: shift });
            } else if (isPhone) {
              gsap.set(hero, { scale: 0.42 + grow * 0.58 });
            } else {
              gsap.set(hero, {
                scale: 0.66 + grow * 0.34,
                xPercent: 9 * (1 - grow),
                yPercent: 16 * (1 - grow),
              });
            }

            const textIn = seg(p, 0.18, 0.4);
            gsap.set(copy, { autoAlpha: textIn, y: (1 - textIn) * 24 });
            gsap.set(title, {
              autoAlpha: textIn,
              y: (1 - textIn) * 32,
              x: (1 - textIn) * (isPhone ? 0 : 20),
            });

            const insetIn = seg(p, 0.42, 0.58);
            gsap.set(inset, {
              autoAlpha: insetIn,
              scale: 1.15 - insetIn * 0.15,
              yPercent: 40 - insetIn * 40,
              clipPath: amenitiesWipeClip("up", insetIn),
            });

            const cap = seg(p, 0.55, 0.78);
            gsap.set(caption, {
              clipPath: amenitiesWipeClip("up", cap),
            });
          },
        });
      }

      /* ---------- i-slider ---------- */
      const slider = root.querySelector<HTMLElement>("[data-am-slider]");
      if (slider && sliderCount > 0) {
        const captionCol = slider.querySelector<HTMLElement>(
          "[data-amenities-caption-col]",
        );
        const imagesCol = slider.querySelector<HTMLElement>(
          "[data-amenities-images-col]",
        );
        const panels = Array.from(
          slider.querySelectorAll<HTMLElement>("[data-amenities-panel]"),
        );
        const captions = Array.from(
          slider.querySelectorAll<HTMLElement>("[data-amenities-caption]"),
        );
        const progressLine = slider.querySelector<HTMLElement>(
          "[data-amenities-progress]",
        );

        if (captionCol && imagesCol && panels.length) {
          gsap.set(captionCol, { clipPath: amenitiesWipeClosed("up") });
          gsap.set(imagesCol, { clipPath: amenitiesWipeClosed("down") });
          panels.forEach((panel, index) => {
            gsap.set(panel, {
              clipPath:
                index === 0
                  ? amenitiesWipeOpen()
                  : amenitiesWipeClosed("up"),
              scale: 1.2,
              zIndex: index + 1,
              transformOrigin: "50% 100%",
            });
          });
          captions.forEach((c, i) =>
            gsap.set(c, { autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 24 }),
          );
          if (progressLine) gsap.set(progressLine, { scaleY: 0 });

          const keyUnits = Math.max(2, panels.length + 1);
          const key = (vh: number) => clamp(vh / (keyUnits * 100));

          ScrollTrigger.create({
            id: "home-am-slider",
            trigger: slider,
            start: "top top",
            end: "bottom bottom",
            scrub: true,
            refreshPriority: -86,
            onUpdate: (self) => {
              const progress = self.progress;
              const entrance = seg(progress, 0, key(100));
              gsap.set(captionCol, {
                clipPath: amenitiesWipeClip("up", entrance),
              });
              gsap.set(imagesCol, {
                clipPath: amenitiesWipeClip("down", entrance),
              });

              let active = 0;
              panels.forEach((panel, index) => {
                if (index === 0) {
                  const a = seg(progress, 0, key(100));
                  const b = seg(progress, key(100), key(200));
                  gsap.set(panel, { scale: 1.2 - a * 0.1 - b * 0.1 });
                  return;
                }
                const wipeStart = key(index * 100);
                const wipeMid = key((index + 1) * 100);
                const wipeEnd = key((index + 2) * 100);
                const wipe = seg(progress, wipeStart, wipeMid);
                const settle = seg(progress, wipeMid, wipeEnd);
                gsap.set(panel, {
                  clipPath: amenitiesWipeClip("up", wipe),
                  scale: 1.2 - wipe * 0.1 - settle * 0.1,
                });
                if (wipe >= 0.5) active = index;
              });

              captions.forEach((caption, index) => {
                let visibility = 0;
                if (index === 0) {
                  visibility =
                    (1 - seg(progress, key(85), key(140))) *
                    Math.max(entrance, 0.001);
                } else {
                  const wipeStart = key(index * 100);
                  const inLocal = seg(
                    progress,
                    wipeStart + key(8),
                    wipeStart + key(72),
                  );
                  const outLocal =
                    index === panels.length - 1
                      ? 0
                      : seg(
                          progress,
                          key((index + 1) * 100 + 20),
                          key((index + 1) * 100 + 75),
                        );
                  visibility =
                    Math.max(0, inLocal - outLocal) *
                    Math.max(entrance, 0.001);
                }
                gsap.set(caption, {
                  autoAlpha: visibility,
                  y: (1 - visibility) * 22,
                });
                caption.setAttribute(
                  "aria-hidden",
                  visibility < 0.45 ? "true" : "false",
                );
              });
              panels.forEach((panel, index) =>
                panel.setAttribute(
                  "aria-hidden",
                  index === active ? "false" : "true",
                ),
              );
              if (progressLine) gsap.set(progressLine, { scaleY: progress });
            },
          });
        }
      }

      /* ---------- i-opening (Springs: fixed left + expanding right + vertical card scroll) ---------- */
      const opening = root.querySelector<HTMLElement>("[data-am-opening]");
      if (opening) {
        const left = opening.querySelector<HTMLElement>(
          "[data-am-opening-left]",
        );
        const titlePanel = opening.querySelector<HTMLElement>(
          "[data-am-opening-title-panel]",
        );
        const right = opening.querySelector<HTMLElement>(
          "[data-am-opening-right]",
        );
        const title = opening.querySelector<HTMLElement>(
          "[data-am-opening-title]",
        );
        const rail = opening.querySelector<HTMLElement>(
          "[data-am-opening-rail]",
        );
        const cards = Array.from(
          opening.querySelectorAll<HTMLElement>("[data-am-opening-card]"),
        );

        gsap.set(left, { clipPath: amenitiesWipeClosed("up"), scale: 1.18 });
        gsap.set(titlePanel, {
          clipPath: amenitiesWipeClosed("down"),
        });
        gsap.set(title, { autoAlpha: 0, y: isPhone ? 24 : 40 });
        gsap.set(right, {
          clipPath: isPhone
            ? amenitiesWipeClosed("up")
            : "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        });
        cards.forEach((card) => gsap.set(card, { autoAlpha: 1, y: 0 }));

        /*
         * Pixel travel for the rail: start with cards below the gold panel,
         * end with the last card + CTAs fully inside it. Remeasure on refresh
         * so image layout cannot collapse travel to ~0 (which looked “locked”).
         */
        const railTravel = { start: 0, end: 0 };
        const measureOpeningRail = () => {
          if (!rail || !right) return;
          const panelH = right.clientHeight || window.innerHeight;
          const contentH = rail.scrollHeight || cards.length * 300;
          if (isPhone) {
            railTravel.start = panelH * 0.18;
            railTravel.end = Math.min(0, panelH - contentH - 16);
          } else {
            /* First card enters from below the fold */
            railTravel.start = panelH * 0.55;
            /* Keep scrolling until last card clears into the panel */
            railTravel.end = Math.min(
              panelH * 0.08,
              panelH - contentH - 32,
            );
          }
          /* Guarantee meaningful motion even before images paint */
          if (railTravel.start - railTravel.end < panelH * 0.45) {
            railTravel.end = railTravel.start - panelH * 0.85;
          }
        };
        measureOpeningRail();
        gsap.set(rail, { y: railTravel.start });

        const applyOpeningRail = (progress: number) => {
          /*
           * Keep moving the whole window — no mid-hold “lock”.
           * End before under-next (phone under-next is a larger % of chapter).
           */
          const cardScroll = seg(progress, 0.2, isPhone ? 0.65 : 0.78);
          gsap.set(rail, {
            y:
              railTravel.start +
              (railTravel.end - railTravel.start) * cardScroll,
          });
        };

        const openingSt = ScrollTrigger.create({
          id: "home-am-opening",
          trigger: opening,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          refreshPriority: -85,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            measureOpeningRail();
            applyOpeningRail(self.progress);
          },
          onUpdate: (self) => {
            const p = self.progress;
            // 0.00–0.18: left image + title panel wipe in
            const split = seg(p, 0, 0.18);
            gsap.set(left, {
              clipPath: amenitiesWipeClip("up", split),
              scale: 1.18 - split * 0.18,
            });
            gsap.set(titlePanel, {
              clipPath: amenitiesWipeClip("down", split),
            });
            const titleIn = seg(p, 0.05, 0.22);
            gsap.set(title, {
              autoAlpha: titleIn,
              y: (1 - titleIn) * (isPhone ? 24 : 40),
            });

            // 0.10–0.28: right gold column expands
            const rightOpen = seg(p, 0.1, 0.28);
            if (isPhone) {
              gsap.set(right, {
                clipPath: amenitiesWipeClip("up", rightOpen),
              });
            } else {
              gsap.set(right, {
                clipPath: `polygon(0% 0%, 100% 0%, 100% ${rightOpen * 100}%, 0% ${rightOpen * 100}%)`,
              });
            }

            /* Continuous card scroll — no mid-chapter freeze. */
            applyOpeningRail(p);
          },
        });

        /* Remeasure after CMS images paint so travel is not stuck near zero. */
        const imgs = Array.from(opening.querySelectorAll("img"));
        imgs.forEach((img) => {
          if (img.complete) return;
          img.addEventListener(
            "load",
            () => {
              measureOpeningRail();
              applyOpeningRail(openingSt.progress);
              ScrollTrigger.refresh();
            },
            { once: true },
          );
        });
      }

      // Helm cover tied to opening under-next, after cards have finished.
      const helm = document.querySelector<HTMLElement>(
        "[data-home-helm-portal]",
      );
      if (helm && opening) {
        gsap.set(helm, { clipPath: amenitiesWipeClosed("up") });
        ScrollTrigger.create({
          id: "home-am-to-helm",
          trigger: opening,
          start: "bottom-=100% bottom",
          end: "bottom top",
          scrub: true,
          refreshPriority: -84,
          onUpdate: (self) => {
            gsap.set(helm, {
              clipPath: amenitiesWipeClip("up", seg(self.progress, 0, 1)),
            });
          },
        });
      }
    }, root);

    let active = true;
    const frame = requestAnimationFrame(() => {
      if (active) requestScrollRefresh("home-am-sequence-layout");
    });
    void document.fonts.ready.then(() => {
      if (active) requestScrollRefresh("home-am-sequence-fonts");
    });
    const settled = window.setTimeout(() => {
      if (active) ScrollTrigger.refresh();
    }, 1200);

    let lastW = window.innerWidth;
    const onViewport = () => {
      if (window.matchMedia("(max-width: 480px)").matches) {
        if (Math.abs(window.innerWidth - lastW) < 20) return;
      }
      lastW = window.innerWidth;
      ScrollTrigger.refresh();
    };
    window.addEventListener(
      isCompact ? "orientationchange" : "resize",
      onViewport,
    );

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      clearTimeout(settled);
      window.removeEventListener(
        isCompact ? "orientationchange" : "resize",
        onViewport,
      );
      context.revert();
    };
  }, [rootRef, sliderCount]);
}
