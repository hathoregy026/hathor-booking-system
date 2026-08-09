import { z } from "zod";
import {
  typographyTextStyleSchema,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex color (#RRGGBB)");

export const amenitiesSpacingSchema = z.object({
  /** Space under the big title (to sub, or to body when no sub). */
  titleToIndication: z.number().min(0).max(120),
  /** Space under the small label / sub, before body. */
  indicationToBody: z.number().min(0).max(120),
  /** Space under body, before CTA (opening + nature). */
  bodyToCta: z.number().min(0).max(160),
});

export type AmenitiesSpacing = z.infer<typeof amenitiesSpacingSchema>;

export const DEFAULT_AMENITIES_SPACING: AmenitiesSpacing = {
  titleToIndication: 14,
  indicationToBody: 14,
  bodyToCta: 22,
};

export const AMENITIES_ALIGNS = ["left", "center", "right"] as const;
export type AmenitiesAlign = (typeof AMENITIES_ALIGNS)[number];

/** Free placement for title / sub / body (may overlap — same concept as hero pair). */
export const amenitiesLayoutSchema = z.object({
  align: z.enum(AMENITIES_ALIGNS),
  titleX: z.number().min(-240).max(240),
  titleY: z.number().min(-240).max(240),
  indicationX: z.number().min(-240).max(240),
  indicationY: z.number().min(-240).max(240),
  bodyX: z.number().min(-240).max(240),
  bodyY: z.number().min(-240).max(240),
});

export type AmenitiesLayout = z.infer<typeof amenitiesLayoutSchema>;

export const DEFAULT_AMENITIES_LAYOUT: AmenitiesLayout = {
  align: "left",
  titleX: 0,
  titleY: 0,
  indicationX: 0,
  indicationY: 0,
  bodyX: 0,
  bodyY: 0,
};

/**
 * Amenities role style: shared type metrics + separate colours for
 * photo overlays vs solid backgrounds (gold / cream panels).
 */
export const amenitiesTextStyleSchema = typographyTextStyleSchema.extend({
  /** Colour when text sits on a photo / media. */
  colorOnImage: hexColor,
  /** Colour when text sits on a solid panel background. */
  colorOnBg: hexColor,
});

export type AmenitiesTextStyle = z.infer<typeof amenitiesTextStyleSchema>;

export const amenitiesTypographySchema = z.object({
  title: amenitiesTextStyleSchema,
  indication: amenitiesTextStyleSchema,
  body: amenitiesTextStyleSchema,
  spacing: amenitiesSpacingSchema,
  layout: amenitiesLayoutSchema,
});

export type AmenitiesTypography = z.infer<typeof amenitiesTypographySchema>;

function roleDefaults(
  base: TypographyTextStyle,
  colorOnImage: string,
  colorOnBg: string,
): AmenitiesTextStyle {
  return {
    ...base,
    color: colorOnBg,
    colorOnImage,
    colorOnBg,
  };
}

/** Defaults: white on photos, gold on solid panels. */
export const DEFAULT_AMENITIES_TYPOGRAPHY: AmenitiesTypography = {
  title: roleDefaults(
    {
      fontFamily: "Gamgote",
      fontSize: 56,
      color: "#B69F64",
      lineHeight: 1.05,
      letterSpacing: 0,
      innerShadow: false,
    },
    "#FFFFFF",
    "#B69F64",
  ),
  indication: roleDefaults(
    {
      fontFamily: "Agraham",
      fontSize: 14,
      color: "#B69F64",
      lineHeight: 1.3,
      letterSpacing: 1.2,
      innerShadow: false,
    },
    "#FFFFFF",
    "#B69F64",
  ),
  body: roleDefaults(
    {
      fontFamily: "Agraham",
      fontSize: 18,
      color: "#B69F64",
      lineHeight: 1.5,
      letterSpacing: 0,
      innerShadow: false,
    },
    "#FFFFFF",
    "#B69F64",
  ),
  spacing: { ...DEFAULT_AMENITIES_SPACING },
  layout: { ...DEFAULT_AMENITIES_LAYOUT },
};

export type AmenitiesStyleRole = "title" | "indication" | "body";

export const AMENITIES_STYLE_ROLES: AmenitiesStyleRole[] = [
  "title",
  "indication",
  "body",
];

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function clampNum(n: number, min: number, max: number, fallback: number) {
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function asHex(value: unknown, fallback: string): string {
  if (typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value)) {
    return value;
  }
  return fallback;
}

function parseAmenitiesLayout(raw: unknown): AmenitiesLayout {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_AMENITIES_LAYOUT };
  const src = raw as Record<string, unknown>;
  const align =
    src.align === "left" || src.align === "center" || src.align === "right"
      ? src.align
      : DEFAULT_AMENITIES_LAYOUT.align;
  return {
    align,
    titleX: clampNum(
      asFiniteNumber(src.titleX) ?? DEFAULT_AMENITIES_LAYOUT.titleX,
      -240,
      240,
      DEFAULT_AMENITIES_LAYOUT.titleX,
    ),
    titleY: clampNum(
      asFiniteNumber(src.titleY) ?? DEFAULT_AMENITIES_LAYOUT.titleY,
      -240,
      240,
      DEFAULT_AMENITIES_LAYOUT.titleY,
    ),
    indicationX: clampNum(
      asFiniteNumber(src.indicationX) ?? DEFAULT_AMENITIES_LAYOUT.indicationX,
      -240,
      240,
      DEFAULT_AMENITIES_LAYOUT.indicationX,
    ),
    indicationY: clampNum(
      asFiniteNumber(src.indicationY) ?? DEFAULT_AMENITIES_LAYOUT.indicationY,
      -240,
      240,
      DEFAULT_AMENITIES_LAYOUT.indicationY,
    ),
    bodyX: clampNum(
      asFiniteNumber(src.bodyX) ?? DEFAULT_AMENITIES_LAYOUT.bodyX,
      -240,
      240,
      DEFAULT_AMENITIES_LAYOUT.bodyX,
    ),
    bodyY: clampNum(
      asFiniteNumber(src.bodyY) ?? DEFAULT_AMENITIES_LAYOUT.bodyY,
      -240,
      240,
      DEFAULT_AMENITIES_LAYOUT.bodyY,
    ),
  };
}

function parseAmenitiesTextStyle(
  raw: unknown,
  fallback: AmenitiesTextStyle,
): AmenitiesTextStyle {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const legacyColor = asHex(src.color, fallback.color);
  /* On-image defaults to white when missing — do not copy legacy panel colour onto photos. */
  const colorOnImage = asHex(src.colorOnImage, fallback.colorOnImage);
  const colorOnBg = asHex(src.colorOnBg, legacyColor || fallback.colorOnBg);
  const merged = {
    ...fallback,
    ...src,
    color: colorOnBg,
    colorOnImage,
    colorOnBg,
  };
  try {
    return amenitiesTextStyleSchema.parse(merged);
  } catch {
    return {
      ...fallback,
      color: colorOnBg,
      colorOnImage,
      colorOnBg,
    };
  }
}

/** Soft-merge so older saved JSON without spacing / layout / dual colours still loads. */
export function parseAmenitiesTypography(raw: unknown): AmenitiesTypography {
  if (!raw || typeof raw !== "object") return DEFAULT_AMENITIES_TYPOGRAPHY;
  const o = raw as Record<string, unknown>;
  try {
    return amenitiesTypographySchema.parse({
      title: parseAmenitiesTextStyle(o.title, DEFAULT_AMENITIES_TYPOGRAPHY.title),
      indication: parseAmenitiesTextStyle(
        o.indication,
        DEFAULT_AMENITIES_TYPOGRAPHY.indication,
      ),
      body: parseAmenitiesTextStyle(o.body, DEFAULT_AMENITIES_TYPOGRAPHY.body),
      spacing: {
        ...DEFAULT_AMENITIES_TYPOGRAPHY.spacing,
        ...(typeof o.spacing === "object" && o.spacing ? o.spacing : {}),
      },
      layout: parseAmenitiesLayout(o.layout),
    });
  } catch {
    return DEFAULT_AMENITIES_TYPOGRAPHY;
  }
}
