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
 * each next sticky chapter slides/covers the previous (under-next),
 * never as a solid gold block with a gap.
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

    const context = gsap.context(() => {
      if (reduced) return;

      const chapters = Array.from(
        root.querySelectorAll<HTMLElement>("[data-am-chapter]"),
      );

      // Cover-reveal: each chapter after the first rises over the previous sticky stage.
      chapters.forEach((chapter, index) => {
        if (index === 0) return;
        const stage =
          chapter.querySelector<HTMLElement>("[data-am-stage]") ?? chapter;
        gsap.set(stage, {
          clipPath: amenitiesWipeClosed("up"),
        });

        ScrollTrigger.create({
          id: `home-am-cover-${index}`,
          trigger: chapter,
          start: "top bottom",
          end: "top top",
          scrub: true,
          refreshPriority: -89,
          onUpdate: (self) => {
            gsap.set(stage, {
              clipPath: amenitiesWipeClip("up", seg(self.progress, 0, 1)),
            });
          },
        });
      });

      /* ---------- i-intro ---------- */
      const intro = root.querySelector<HTMLElement>("[data-am-intro]");
      if (intro) {
        const media = intro.querySelector<HTMLElement>("[data-am-intro-media]");
        const dim = intro.querySelector<HTMLElement>("[data-am-intro-dim]");
        const title = intro.querySelector<HTMLElement>("[data-am-intro-title]");
        const cream = intro.querySelector<HTMLElement>("[data-am-intro-cream]");
        const creamAngle = isPhone ? "up" : "right";

        gsap.set(media, { xPercent: 0, scale: 1.18 });
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
            const slide = seg(p, 0.08, 0.72);
            gsap.set(media, {
              xPercent: isPhone ? slide * -12 : slide * -36,
              scale: 1.18 - slide * 0.18,
            });
            gsap.set(dim, { autoAlpha: 0.55 * (1 - seg(p, 0.05, 0.35)) });
            gsap.set(title, {
              autoAlpha: 1 - seg(p, 0.2, 0.45),
              y: seg(p, 0.2, 0.45) * (isPhone ? -24 : -40),
            });
            gsap.set(cream, {
              clipPath: amenitiesWipeClip(creamAngle, seg(p, 0.28, 0.78)),
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

        // Amenities i-video: full-bleed media is already in place under the cover wipe;
        // only scale settles — never a gold empty stage.
        gsap.set(hero, { scale: 1.12 });
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
            const settle = seg(p, 0, 0.35);
            gsap.set(hero, { scale: 1.12 - settle * 0.12 });

            const textIn = seg(p, 0.08, 0.32);
            gsap.set(copy, { autoAlpha: textIn, y: (1 - textIn) * 24 });
            gsap.set(title, {
              autoAlpha: textIn,
              y: (1 - textIn) * 32,
              x: (1 - textIn) * (isPhone ? 0 : 20),
            });

            const insetIn = seg(p, 0.26, 0.5);
            gsap.set(inset, {
              autoAlpha: insetIn,
              scale: 1.15 - insetIn * 0.15,
              yPercent: 40 - insetIn * 40,
              clipPath: amenitiesWipeClip("up", insetIn),
            });

            const cap = seg(p, 0.48, 0.76);
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
        /* Right column starts as a thin top band on the right half, then grows down. */
        gsap.set(right, {
          clipPath: isPhone
            ? amenitiesWipeClosed("up")
            : "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        });
        const railStartY = isPhone ? 28 : isCompact ? 36 : 48;
        const railTravel = isPhone ? 18 : isCompact ? 55 : 72;
        gsap.set(rail, { y: `${railStartY}vh` });
        cards.forEach((card) => gsap.set(card, { autoAlpha: 1, y: 0 }));

        ScrollTrigger.create({
          id: "home-am-opening",
          trigger: opening,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          refreshPriority: -85,
          onUpdate: (self) => {
            const p = self.progress;
            // 0.00–0.30: left image + title panel wipe in (Springs opening split)
            const split = seg(p, 0, 0.3);
            gsap.set(left, {
              clipPath: amenitiesWipeClip("up", split),
              scale: 1.18 - split * 0.18,
            });
            gsap.set(titlePanel, {
              clipPath: amenitiesWipeClip("down", split),
            });
            const titleIn = seg(p, 0.12, 0.36);
            gsap.set(title, {
              autoAlpha: titleIn,
              y: (1 - titleIn) * (isPhone ? 24 : 40),
            });

            // 0.18–0.48: right scroll column expands downward over the title panel
            const rightOpen = seg(p, 0.18, 0.48);
            if (isPhone) {
              gsap.set(right, {
                clipPath: amenitiesWipeClip("up", rightOpen),
              });
            } else {
              gsap.set(right, {
                clipPath: `polygon(0% 0%, 100% 0%, 100% ${rightOpen * 100}%, 0% ${rightOpen * 100}%)`,
              });
            }

            // 0.32–1.00: vertical stack scrolls upward through the gold column
            const cardScroll = seg(p, 0.32, 0.98);
            gsap.set(rail, {
              y: `${railStartY - cardScroll * railTravel}vh`,
            });
          },
        });
      }

      // Hand off into helm portal with the same under-next cover (no gold bar).
      const helm = document.querySelector<HTMLElement>(
        "[data-home-helm-portal]",
      );
      const lastChapter = chapters[chapters.length - 1];
      if (helm && lastChapter) {
        gsap.set(helm, { clipPath: amenitiesWipeClosed("up") });
        ScrollTrigger.create({
          id: "home-am-to-helm",
          trigger: helm,
          start: "top bottom",
          end: "top top",
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
