/**
 * Springs infrastructure parallax patterns (from clone shared.js).
 * Keys use Springs naming: parallax--100-0 ≈ +100svh after sticky top.
 */

import type { SpringsParallaxProps } from "@/lib/springs-parallax-engine";

export type PatternMap = Record<
  string,
  () => Record<string, SpringsParallaxProps>
>;

const isLgUp = () =>
  window.matchMedia(
    "(min-width: 1025px), (min-width: 980px) and (min-aspect-ratio: 10/11)",
  ).matches;

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
          "parallax--50-0": {
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

  videoTitle: () =>
    isLgUp()
      ? pattern({
          "parallax--100-0": { opacity: "1" },
          "parallax--130-0": { opacity: "0" },
        })
      : pattern({
          "parallax--0-0": { opacity: "1" },
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
};
