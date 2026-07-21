/** Homepage hero HATHOR wordmark — one image per letter for per-glyph animation. */

export const HATHOR_LOGO_PARTS_VARIANTS = ["current", "regular", "white"] as const;
export type HathorLogoPartsVariant = (typeof HATHOR_LOGO_PARTS_VARIANTS)[number];

export const HATHOR_LOGO_PARTS_VARIANT_LABELS: Record<
  HathorLogoPartsVariant,
  string
> = {
  current: "Current (live gold)",
  regular: "Parts · Regular",
  white: "Parts · White",
};

type LetterMeta = {
  key: "h1" | "a" | "t" | "h2" | "o" | "r";
  alt: string;
  className: string;
  width: number;
  height: number;
  flexGrow: number;
  file: string;
};

/** Shared geometry — never change; keeps every colour set in the same seats. */
const LETTER_META: readonly LetterMeta[] = [
  {
    key: "h1",
    alt: "H",
    className: "letter-h1",
    width: 855,
    height: 2200,
    flexGrow: 855,
    file: "hathor-h1",
  },
  {
    key: "a",
    alt: "A",
    className: "letter-a",
    width: 1070,
    height: 2200,
    flexGrow: 1070,
    file: "hathor-a",
  },
  {
    key: "t",
    alt: "T",
    className: "letter-t",
    width: 758,
    height: 2200,
    flexGrow: 758,
    file: "hathor-t",
  },
  {
    key: "h2",
    alt: "H",
    className: "letter-h2",
    width: 840,
    height: 2200,
    flexGrow: 840,
    file: "hathor-h2",
  },
  {
    key: "o",
    alt: "O",
    className: "letter-o",
    width: 1019,
    height: 2200,
    flexGrow: 1019,
    file: "hathor-o",
  },
  {
    key: "r",
    alt: "R",
    className: "letter-r",
    width: 764,
    height: 2200,
    flexGrow: 764,
    file: "hathor-r",
  },
] as const;

function srcForVariant(
  variant: HathorLogoPartsVariant,
  file: string,
): string {
  if (variant === "current") {
    return `/branding/letters/${file}.webp`;
  }
  return `/branding/letters/variants/${variant}/${file}.png`;
}

function buildLetters(variant: HathorLogoPartsVariant) {
  return LETTER_META.map((meta) => ({
    key: meta.key,
    src: srcForVariant(variant, meta.file),
    alt: meta.alt,
    className: meta.className,
    width: meta.width,
    height: meta.height,
    flexGrow: meta.flexGrow,
  }));
}

/** Default / locked live set — unchanged WebP paths. */
export const HATHOR_LOGO_LETTERS = buildLetters("current");

export type HathorLogoLetter = (typeof HATHOR_LOGO_LETTERS)[number];

/** Combined HAT artboard width — used to size letter band height from side width. */
export const HATHOR_LOGO_LEFT_WIDTH = 855 + 1070 + 758; // 2683
export const HATHOR_LOGO_ARTBOARD_HEIGHT = 2200;

export function getHathorLogoLetters(
  variant: HathorLogoPartsVariant = "current",
): HathorLogoLetter[] {
  if (variant === "current") return [...HATHOR_LOGO_LETTERS];
  return buildLetters(variant) as HathorLogoLetter[];
}

export function isHathorLogoPartsVariant(
  value: unknown,
): value is HathorLogoPartsVariant {
  return (
    typeof value === "string" &&
    (HATHOR_LOGO_PARTS_VARIANTS as readonly string[]).includes(value)
  );
}
