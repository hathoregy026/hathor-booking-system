"use client";

import { RefObject, useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

const clamp = (v: number) => Math.max(0, Math.min(1, v));

/** Progress between two vh offsets measured from sticky pin start (Springs parallax keys). */
const segVh = (vh: number, from: number, to: number) => {
  if (to <= from) return vh >= to ? 1 : 0;
  return clamp((vh - from) / (to - from));
};

const bottomClosed = "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
const topClosed = "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";
const fullOpen = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
const rightClosed = "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";

/**
 * Port of Springs infrastructure parallax:
 * - Cover is CSS sticky under-next / under-previous (not a stage wipe)
 * - Motion is vh-keyed from sticky pin start (parallax--100-0 ≈ +100svh)
 * - Opening cards scroll in document flow inside expanding right column
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

      const svh = () => window.innerHeight;

      /** Scrub a sticky chapter; callback gets scrolled distance in vh from pin start. */
      const scrubSticky = (
        sticky: HTMLElement,
        id: string,
        onVh: (scrolledVh: number, self: ScrollTrigger) => void,
        priority: number,
      ) => {
        ScrollTrigger.create({
          id,
          trigger: sticky,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          refreshPriority: priority,
          onUpdate: (self) => {
            const scrolledVh = (self.scroll() - self.start) / svh();
            onVh(scrolledVh, self);
          },
        });
      };

      /* ---------- i-intro (introImage + cream right wipe) ---------- */
      const intro = root.querySelector<HTMLElement>("[data-am-intro]");
      if (intro) {
        const media = intro.querySelector<HTMLElement>("[data-am-intro-media]");
        const dim = intro.querySelector<HTMLElement>("[data-am-intro-dim]");
        const title = intro.querySelector<HTMLElement>("[data-am-intro-title]");
        const cream = intro.querySelector<HTMLElement>("[data-am-intro-cream]");

        gsap.set(media, {
          xPercent: 0,
          scale: 1.2,
          clipPath: fullOpen,
        });
        gsap.set(dim, { autoAlpha: 1 });
        gsap.set(title, { autoAlpha: 1 });
        gsap.set(cream, {
          clipPath: isPhone
            ? bottomClosed
            : rightClosed,
        });

        scrubSticky(
          intro,
          "home-am-intro",
          (vh) => {
            if (isDesktop) {
              /* introImage: 0→100 clip to 50%; picture: 0→200 translateX/scale */
              const clipT = segVh(vh, 0, 1);
              const right = 100 - clipT * 50;
              const moveT = segVh(vh, 0, 2);
              gsap.set(media, {
                clipPath: `polygon(0 0, ${right}% 0, ${right}% 100%, 0% 100%)`,
                xPercent: moveT * -36,
                scale: 1.2 - moveT * 0.2,
              });
              gsap.set(cream, {
                clipPath:
                  clipT <= 0
                    ? rightClosed
                    : `polygon(${100 - clipT * 100}% 0%, 100% 0%, 100% 100%, ${100 - clipT * 100}% 100%)`,
              });
            } else {
              const t = segVh(vh, 0, 0.5);
              gsap.set(media, {
                xPercent: isPhone ? t * -8 : t * -14,
                scale: 1.2 - t * 0.12,
                clipPath: fullOpen,
              });
              const creamT = segVh(vh, 0, 1);
              gsap.set(cream, {
                clipPath: isPhone
                  ? `polygon(0% ${100 - creamT * 100}%, 100% ${100 - creamT * 100}%, 100% 100%, 0% 100%)`
                  : `polygon(${100 - creamT * 100}% 0%, 100% 0%, 100% 100%, ${100 - creamT * 100}% 100%)`,
              });
            }

            const dimT = segVh(vh, 0, 0.5);
            gsap.set(dim, { autoAlpha: 1 - dimT });
            const capT = segVh(vh, 0, 0.5);
            gsap.set(title, { autoAlpha: 1 - capT });
          },
          -88,
        );
      }

      /* ---------- i-video (videoZoom / videoImage / caption) ---------- */
      const video = root.querySelector<HTMLElement>("[data-am-video]");
      if (video) {
        const hero = video.querySelector<HTMLElement>("[data-am-video-hero]");
        const inset = video.querySelector<HTMLElement>("[data-am-video-inset]");
        const copy = video.querySelector<HTMLElement>("[data-am-video-copy]");
        const title = video.querySelector<HTMLElement>("[data-am-video-title]");
        const caption = video.querySelector<HTMLElement>(
          "[data-am-video-caption]",
        );

        if (isDesktop) {
          gsap.set(hero, {
            scale: 0.29,
            x: -206,
            y: -206,
            transformOrigin: "bottom right",
          });
        } else {
          gsap.set(hero, {
            scaleY: 0.38,
            transformOrigin: "bottom center",
          });
        }
        gsap.set(inset, { clipPath: bottomClosed, scale: 1.2 });
        gsap.set([copy, title], { autoAlpha: 1 });
        gsap.set(caption, { clipPath: bottomClosed, y: 0 });

        scrubSticky(
          video,
          "home-am-video",
          (vh) => {
            if (isDesktop) {
              /* videoZoom: --100 → --110 → --150 */
              if (vh < 1) {
                gsap.set(hero, { scale: 0.29, x: -206, y: -206 });
              } else if (vh < 1.1) {
                const t = segVh(vh, 1, 1.1);
                gsap.set(hero, {
                  scale: 0.29 + t * (0.5 - 0.29),
                  x: -206 * (1 - t),
                  y: -206 * (1 - t),
                });
              } else {
                const t = segVh(vh, 1.1, 1.5);
                gsap.set(hero, {
                  scale: 0.5 + t * 0.5,
                  x: 0,
                  y: 0,
                });
              }

              /* videoTitle fades --100 → --130 */
              const titleOut = segVh(vh, 1, 1.3);
              gsap.set([copy, title], { autoAlpha: 1 - titleOut });

              /* videoImage wipe --300 → --350 */
              const imgT = segVh(vh, 3, 3.5);
              gsap.set(inset, {
                clipPath:
                  imgT <= 0
                    ? bottomClosed
                    : `polygon(0% ${100 - imgT * 100}%, 100% ${100 - imgT * 100}%, 100% 100%, 0% 100%)`,
                scale: 1.2 - imgT * 0.2,
              });

              /* videoCaptionMoveUp: wipe --160→--300, then rise */
              const capWipe = segVh(vh, 1.6, 3);
              const capH = caption?.offsetHeight || 200;
              gsap.set(caption, {
                clipPath:
                  capWipe <= 0
                    ? bottomClosed
                    : `polygon(0% ${100 - capWipe * 100}%, 100% ${100 - capWipe * 100}%, 100% 100%, 0% 100%)`,
                y: capWipe < 1 ? capH / 3 : -(vh - 3) * svh() * 0.35,
              });
            } else {
              const grow = segVh(vh, 0, 0.5);
              gsap.set(hero, { scaleY: 0.38 + grow * 0.62 });
              const imgT = segVh(vh, 1, 1.5);
              gsap.set(inset, {
                clipPath:
                  imgT <= 0
                    ? bottomClosed
                    : `polygon(0% ${100 - imgT * 100}%, 100% ${100 - imgT * 100}%, 100% 100%, 0% 100%)`,
                scale: 1.2 - imgT * 0.2,
              });
              const capWipe = segVh(vh, 0.6, 1);
              gsap.set(caption, {
                clipPath:
                  capWipe <= 0
                    ? bottomClosed
                    : `polygon(0% ${100 - capWipe * 100}%, 100% ${100 - capWipe * 100}%, 100% 100%, 0% 100%)`,
              });
            }
          },
          -87,
        );
      }

      /* ---------- i-slider (stacked clips + discrete caption open) ---------- */
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
          gsap.set(captionCol, { clipPath: bottomClosed });
          gsap.set(imagesCol, { clipPath: topClosed });
          panels.forEach((panel, index) => {
            gsap.set(panel, {
              clipPath: index === 0 ? fullOpen : bottomClosed,
              scale: 1.2,
              zIndex: index + 1,
              transformOrigin: "50% 100%",
            });
          });
          captions.forEach((c, i) => {
            gsap.set(c, { autoAlpha: i === 0 ? 1 : 0 });
            c.setAttribute("aria-hidden", i === 0 ? "false" : "true");
          });
          if (progressLine) gsap.set(progressLine, { scaleY: 0 });

          let activeCaption = 0;

          scrubSticky(
            slider,
            "home-am-slider",
            (vh, self) => {
              /* Column entrance 0 → 100vh */
              const enter = segVh(vh, 0, 1);
              gsap.set(captionCol, {
                clipPath:
                  enter <= 0
                    ? bottomClosed
                    : `polygon(0% ${100 - enter * 100}%, 100% ${100 - enter * 100}%, 100% 100%, 0% 100%)`,
              });
              gsap.set(imagesCol, {
                clipPath:
                  enter <= 0
                    ? topClosed
                    : `polygon(0% 0%, 100% 0%, 100% ${enter * 100}%, 0% ${enter * 100}%)`,
              });

              /* Panel i: wipe at i*100 → (i+1)*100, settle to (i+2)*100 */
              panels.forEach((panel, index) => {
                if (index === 0) {
                  const a = segVh(vh, 0, 1);
                  const b = segVh(vh, 1, 2);
                  gsap.set(panel, { scale: 1.2 - a * 0.1 - b * 0.1 });
                  return;
                }
                const wipe = segVh(vh, index, index + 1);
                const settle = segVh(vh, index + 1, index + 2);
                gsap.set(panel, {
                  clipPath:
                    wipe <= 0
                      ? bottomClosed
                      : `polygon(0% ${100 - wipe * 100}%, 100% ${100 - wipe * 100}%, 100% 100%, 0% 100%)`,
                  scale: 1.2 - wipe * 0.1 - settle * 0.1,
                });
              });

              /* infrastructureSliderScroll: discrete open by progress */
              const t = self.progress;
              const n = captions.length;
              const next =
                t < 0.05 ? 0 : Math.min(n - 1, Math.ceil((t - 0.1) * n));
              if (next !== activeCaption) {
                activeCaption = next;
                captions.forEach((caption, index) => {
                  const on = index === activeCaption;
                  gsap.to(caption, {
                    autoAlpha: on ? 1 : 0,
                    duration: 0.35,
                    overwrite: true,
                  });
                  caption.setAttribute("aria-hidden", on ? "false" : "true");
                });
              }

              let topmost = 0;
              panels.forEach((_, index) => {
                if (index === 0 || segVh(vh, index, index + 1) > 0.45) {
                  topmost = index;
                }
              });
              panels.forEach((panel, index) => {
                panel.setAttribute(
                  "aria-hidden",
                  topmost === index ? "false" : "true",
                );
              });

              if (progressLine) gsap.set(progressLine, { scaleY: t });
            },
            -86,
          );
        }
      }

      /* ---------- i-opening (dual layer; right expands; cards = document flow) ---------- */
      const opening = root.querySelector<HTMLElement>("[data-am-opening]");
      if (opening) {
        const left = opening.querySelector<HTMLElement>(
          "[data-am-opening-left]",
        );
        const titlePanel = opening.querySelector<HTMLElement>(
          "[data-am-opening-title-panel]",
        );
        const title = opening.querySelector<HTMLElement>(
          "[data-am-opening-title]",
        );
        const right = opening.querySelector<HTMLElement>(
          "[data-am-opening-right]",
        );

        gsap.set(left, { clipPath: bottomClosed });
        gsap.set(titlePanel, { clipPath: topClosed });
        gsap.set(title, { autoAlpha: 1 });
        /* Springs right column starts as zero-height right-half clip */
        gsap.set(right, {
          clipPath: isPhone
            ? bottomClosed
            : "polygon(50vw 0vh, 100% 0vh, 100% 0vh, 50vw 0vh)",
        });

        scrubSticky(
          opening,
          "home-am-opening",
          (vh) => {
            const wipe = segVh(vh, 0, 1);
            gsap.set(left, {
              clipPath:
                wipe <= 0
                  ? bottomClosed
                  : `polygon(0% ${100 - wipe * 100}%, 100% ${100 - wipe * 100}%, 100% 100%, 0% 100%)`,
            });
            gsap.set(titlePanel, {
              clipPath:
                wipe <= 0
                  ? topClosed
                  : `polygon(0% 0%, 100% 0%, 100% ${wipe * 100}%, 0% ${wipe * 100}%)`,
            });

            /* img scale 0 → 300vh */
            const scaleT = segVh(vh, 0, 3);
            const leftImg = left?.querySelector("img");
            if (leftImg) {
              gsap.set(leftImg, { scale: 1.2 - scaleT * 0.2 });
            }

            if (isPhone) {
              const rightWipe = segVh(vh, 0.2, 1.2);
              gsap.set(right, {
                clipPath:
                  rightWipe <= 0
                    ? bottomClosed
                    : `polygon(0% ${100 - rightWipe * 100}%, 100% ${100 - rightWipe * 100}%, 100% 100%, 0% 100%)`,
              });
            } else {
              /*
               * Springs right-column expand:
               * 0: zero height at top of right half
               * 100: tall 200vh clip
               * 101: tall 350vh clip
               */
              if (vh < 1) {
                const t = segVh(vh, 0, 1);
                const top = t * 100;
                const bottom = t * 200;
                gsap.set(right, {
                  clipPath: `polygon(50vw ${top}vh, 100% ${top}vh, 100% ${bottom}vh, 50vw ${bottom}vh)`,
                });
              } else {
                const t = segVh(vh, 1, 1.01);
                const bottom = 200 + t * 150;
                gsap.set(right, {
                  clipPath: `polygon(50vw 100vh, 100% 100vh, 100% ${bottom}vh, 50vw ${bottom}vh)`,
                });
              }
            }
            /* Cards: NO y-translate — they scroll in document flow. */
          },
          -85,
        );
      }

      /* Helm cover after opening under-next */
      const helm = document.querySelector<HTMLElement>(
        "[data-home-helm-portal]",
      );
      if (helm && opening) {
        gsap.set(helm, { clipPath: bottomClosed });
        ScrollTrigger.create({
          id: "home-am-to-helm",
          trigger: opening,
          start: "bottom-=100% bottom",
          end: "bottom top",
          scrub: true,
          refreshPriority: -84,
          onUpdate: (self) => {
            const t = self.progress;
            gsap.set(helm, {
              clipPath:
                t <= 0
                  ? bottomClosed
                  : `polygon(0% ${100 - t * 100}%, 100% ${100 - t * 100}%, 100% 100%, 0% 100%)`,
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
