/** Homepage hero HATHOR wordmark — one WebP per letter for per-glyph animation. */
export const HATHOR_LOGO_LETTERS = [
  {
    key: "h1",
    src: "/branding/letters/hathor-h1.webp",
    alt: "H",
    className: "letter-h1",
    width: 853,
    height: 1804,
    flexGrow: 853,
  },
  {
    key: "a",
    src: "/branding/letters/hathor-a.webp",
    alt: "A",
    className: "letter-a",
    width: 1065,
    height: 1804,
    flexGrow: 1065,
  },
  {
    key: "t",
    src: "/branding/letters/hathor-t.webp",
    alt: "T",
    className: "letter-t",
    width: 758,
    height: 1804,
    flexGrow: 758,
  },
  {
    key: "h2",
    src: "/branding/letters/hathor-h2.webp",
    alt: "H",
    className: "letter-h2",
    width: 840,
    height: 1804,
    flexGrow: 840,
  },
  {
    key: "o",
    src: "/branding/letters/hathor-o.webp",
    alt: "O",
    className: "letter-o",
    width: 1019,
    height: 1804,
    flexGrow: 1019,
  },
  {
    key: "r",
    src: "/branding/letters/hathor-r.webp",
    alt: "R",
    className: "letter-r",
    width: 764,
    height: 1804,
    flexGrow: 764,
  },
] as const;

export type HathorLogoLetter = (typeof HATHOR_LOGO_LETTERS)[number];
