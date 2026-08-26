/**
 * Springs infrastructure parallax patterns (from clone shared.js).
 * Keys use Springs naming: parallax--100-0 ≈ +100svh after sticky top.
 */

import type { SpringsParallaxProps } from "@/lib/springs-parallax-engine";

export type PatternFn = (
  el?: HTMLElement,
) => Record<string, SpringsParallaxProps>;

export type PatternMap = Record<string, PatternFn>;

/* The responsive sequence deliberately keeps the desktop choreography. */
const isLgUp = () => true;

function pattern(
  entries: Record<string, SpringsParallaxProps>,
): Record<string, SpringsParallaxProps> {
  return entries;
}

export const SPRINGS_AMENITIES_PATTERNS: PatternMap = {
  introImage: () =>
    isLgUp()
      ? pattern({
          "parallax--0-0": {
            "clip-path": "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
          },
          "parallax--100-0": {
            "clip-path": "polygon(0 0, 50% 0, 50% 100%, 0% 100%)",
          },
        })
      : pattern({
          "parallax--0-0": {
            width: "250%",
            transform: "translateX(9%)",
          },
          "parallax--100-0": {
            width: "125%",
            transform: "translateX(0%)",
          },
        }),

  infrastructureIntroCaptionDesktop: () =>
    isLgUp()
      ? pattern({
          "parallax--0-0": {
            opacity: "1",
            "clip-path": "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          },
          "parallax--50-0": {
            opacity: "0",
            "clip-path": "polygon(0 0, 75% 0, 75% 100%, 0% 100%)",
          },
        })
      : pattern({}),

  infrastructureIntroCaptionMobile: () =>
    isLgUp()
      ? pattern({})
      : pattern({
          "parallax--0-0": { opacity: "1" },
          "parallax--50-0": { opacity: "0" },
        }),

  videoZoom: () =>
    isLgUp()
      ? pattern({
          "parallax--100-0": {
            transform: "scale(0.29) translate(-206px, -206px)",
          },
          "parallax--110-0": {
            transform: "scale(0.5) translate(0px, 0px)",
          },
          "parallax--150-0": {
            transform: "scale(1) translate(0px, 0px)",
          },
        })
      : pattern({
          "parallax--0-0": { height: "38%" },
          "parallax--50-0": { height: "100%" },
        }),

  videoTranslate: () =>
    pattern({
      "parallax--0-0": { transform: "translate(9%, 16%) scale(0.66)" },
      "parallax--50-0": { transform: "translate(0%, 0%) scale(1)" },
    }),

  /**
   * Springs videoTitle — opacity only on the cream title container.
   * Stays visible on cream, then hides as videoImage rises over it
   * (same runway as inset). Do not add clip-path here — cover is z-index.
   */
  videoTitle: () =>
    isLgUp()
      ? pattern({
          "parallax--100-0": { opacity: "1" },
          "parallax--130-0": { opacity: "0" },
        })
      : pattern({
          "parallax-0-0": { opacity: "1" },
          "parallax--30-0": { opacity: "0" },
        }),

  videoImage: () =>
    isLgUp()
      ? pattern({
          "parallax--300-0": {
            "clip-path":
              "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          },
          "parallax--350-0": {
            "clip-path": "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          },
        })
      : pattern({
          "parallax--100-0": {
            "clip-path":
              "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
          },
          "parallax--150-0": {
            "clip-path": "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          },
        }),

  /**
   * Legacy: Bar reel on-image overlay copy. Kept as no-op so old markup
   * attributes do not throw; live copy now lives only in the gold caption.
   */
  videoOverlayCopy: () =>
    pattern({
      "parallax-0-0": { opacity: "0", visibility: "hidden" },
    }),

  /*
   * Springs shared.js videoCaptionMoveUp — reveal then ride the caption up
   * off-screen. Distance is measured from the body text (data-distance=1).
   */
  /*
   * Springs infrastructureSliderScroll — progress 0→1 across the slider runway.
   * Caption switching is handled in useHomeAmenitiesSequence (contentAnimation
   * stand-in). Pattern keeps the attribute/engine parity with /test-slide.
   */
  infrastructureSliderScroll: () =>
    pattern({
      "parallax-0-0": { opacity: "1" },
      "parallax-200-100": { opacity: "1" },
    }),

  videoCaptionMoveUp: (el) => {
    const captionH = el?.offsetHeight || window.innerHeight * 0.55;
    const text =
      el?.querySelector<HTMLElement>("[data-am-video-caption-text]") ||
      el?.querySelector<HTMLElement>(".i-video__caption__text");
    let distance = captionH;
    if (el?.dataset.distance === "1" && text) {
      const top = text.getBoundingClientRect().top + window.scrollY;
      distance = top - window.innerHeight - 70 - 50;
      el.dataset.distance = String(distance);
    } else if (el?.dataset.distance && el.dataset.distance !== "1") {
      distance = parseFloat(el.dataset.distance) || distance;
    }
    return pattern({
      "parallax--160-0": {
        "clip-path":
          "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
        transform: `translateY(${captionH / 3}px)`,
      },
      "parallax--300-0": {
        "clip-path": "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        transform: `translateY(${captionH / 3}px)`,
      },
      "parallax--400-0": {
        "clip-path": "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        transform: `translateY(${-distance}px)`,
      },
      "parallax--430-0": {
        "clip-path": "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        transform: `translateY(${-2 * distance}px)`,
      },
    });
  },
};
