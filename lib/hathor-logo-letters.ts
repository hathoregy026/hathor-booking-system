/** Homepage hero HATHOR wordmark — one WebP per letter for per-glyph animation. */
export const HATHOR_LOGO_LETTERS = [
  {
    key: "h1",
    src: "/branding/letters/hathor-h1.webp",
    alt: "H",
    className: "letter-h1",
    width: 855,
    height: 2200,
    flexGrow: 855,
  },
  {
    key: "a",
    src: "/branding/letters/hathor-a.webp",
    alt: "A",
    className: "letter-a",
    width: 1070,
    height: 2200,
    flexGrow: 1070,
  },
  {
    key: "t",
    src: "/branding/letters/hathor-t.webp",
    alt: "T",
    className: "letter-t",
    width: 758,
    height: 2200,
    flexGrow: 758,
  },
  {
    key: "h2",
    src: "/branding/letters/hathor-h2.webp",
    alt: "H",
    className: "letter-h2",
    width: 840,
    height: 2200,
    flexGrow: 840,
  },
  {
    key: "o",
    src: "/branding/letters/hathor-o.webp",
    alt: "O",
    className: "letter-o",
    width: 1019,
    height: 2200,
    flexGrow: 1019,
  },
  {
    key: "r",
    src: "/branding/letters/hathor-r.webp",
    alt: "R",
    className: "letter-r",
    width: 764,
    height: 2200,
    flexGrow: 764,
  },
] as const;

/** Combined HAT artboard width — used to size letter band height from side width. */
export const HATHOR_LOGO_LEFT_WIDTH = 855 + 1070 + 758; // 2683
export const HATHOR_LOGO_ARTBOARD_HEIGHT = 2200;

export type HathorLogoLetter = (typeof HATHOR_LOGO_LETTERS)[number];
