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
 * Amenities role style: shared type metrics + three surface colours
 * (photo / gold panel / cream panel).
 */
export const amenitiesTextStyleSchema = typographyTextStyleSchema.extend({
  /** Colour when text sits on a photo / media. */
  colorOnImage: hexColor,
  /** Colour when text sits on a gold / mustard panel. */
  colorOnGold: hexColor,
  /** Colour when text sits on a cream panel. */
  colorOnCream: hexColor,
  /**
   * Legacy alias — kept in sync with colorOnGold so older readers still work.
   * Prefer colorOnGold / colorOnCream in new code.
   */
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
  colorOnGold: string,
  colorOnCream: string,
): AmenitiesTextStyle {
  return {
    ...base,
    color: colorOnGold,
    colorOnImage,
    colorOnGold,
    colorOnCream,
    colorOnBg: colorOnGold,
  };
}

/** Defaults: white on photos + gold panels, gold ink on cream. */
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
    "#FFFFFF",
    "#4E3232",
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

/** Accept `#RGB`, `#RRGGBB`, `#RRGGBBAA`, or the same without `#`; store `#RRGGBB`. */
function asHex(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  const short = /^#([0-9A-Fa-f]{3})$/.exec(withHash);
  if (short) {
    const [r, g, b] = short[1]!;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  const longAlpha = /^#([0-9A-Fa-f]{8})$/.exec(withHash);
  if (longAlpha) return `#${longAlpha[1]!.slice(0, 6)}`.toUpperCase();
  if (/^#[0-9A-Fa-f]{6}$/.test(withHash)) return withHash.toUpperCase();
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

function parseAmenitiesSpacing(raw: unknown): AmenitiesSpacing {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_AMENITIES_SPACING };
  const src = raw as Record<string, unknown>;
  return {
    titleToIndication: clampNum(
      asFiniteNumber(src.titleToIndication) ??
        DEFAULT_AMENITIES_SPACING.titleToIndication,
      0,
      120,
      DEFAULT_AMENITIES_SPACING.titleToIndication,
    ),
    indicationToBody: clampNum(
      asFiniteNumber(src.indicationToBody) ??
        DEFAULT_AMENITIES_SPACING.indicationToBody,
      0,
      120,
      DEFAULT_AMENITIES_SPACING.indicationToBody,
    ),
    bodyToCta: clampNum(
      asFiniteNumber(src.bodyToCta) ?? DEFAULT_AMENITIES_SPACING.bodyToCta,
      0,
      160,
      DEFAULT_AMENITIES_SPACING.bodyToCta,
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
  const legacyOnBg = asHex(src.colorOnBg, legacyColor || fallback.colorOnBg);
  /* On-image defaults to white when missing — do not copy panel colour onto photos. */
  const colorOnImage = asHex(src.colorOnImage, fallback.colorOnImage);
  /*
   * Gold + cream: prefer new fields; if missing, inherit former colorOnBg so
   * existing dashboards keep the colour they already set.
   */
  const colorOnGold = asHex(src.colorOnGold, legacyOnBg || fallback.colorOnGold);
  const colorOnCream = asHex(
    src.colorOnCream,
    legacyOnBg || fallback.colorOnCream,
  );
  const merged = {
    ...fallback,
    ...src,
    color: colorOnGold,
    colorOnImage,
    colorOnGold,
    colorOnCream,
    colorOnBg: colorOnGold,
  };
  try {
    return amenitiesTextStyleSchema.parse(merged);
  } catch {
    return {
      ...fallback,
      color: colorOnGold,
      colorOnImage,
      colorOnGold,
      colorOnCream,
      colorOnBg: colorOnGold,
    };
  }
}

/** Soft-merge so older saved JSON without spacing / layout / dual colours still loads. */
export function parseAmenitiesTypography(raw: unknown): AmenitiesTypography {
  if (!raw || typeof raw !== "object") return DEFAULT_AMENITIES_TYPOGRAPHY;
  const o = raw as Record<string, unknown>;
  const soft: AmenitiesTypography = {
    title: parseAmenitiesTextStyle(o.title, DEFAULT_AMENITIES_TYPOGRAPHY.title),
    indication: parseAmenitiesTextStyle(
      o.indication,
      DEFAULT_AMENITIES_TYPOGRAPHY.indication,
    ),
    body: parseAmenitiesTextStyle(o.body, DEFAULT_AMENITIES_TYPOGRAPHY.body),
    spacing: parseAmenitiesSpacing(o.spacing),
    layout: parseAmenitiesLayout(o.layout),
  };
  const parsed = amenitiesTypographySchema.safeParse(soft);
  /* Prefer soft merge over full defaults — never wipe a valid hex on schema noise. */
  return parsed.success ? parsed.data : soft;
}
