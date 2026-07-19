import { z } from "zod";
import type { CSSProperties } from "react";

export const TYPOGRAPHY_SETTINGS_KEY = "typography-styles";

/** Exact allow-list — Zod accepts all 9. Dropdown only shows installed files. */
export const HATHOR_LUXURY_FONTS = [
  "Agraham",
  "Baginda",
  "Bastliga One",
  "Cylburn",
  "Gabigaile",
  "Gamgote",
  "Quiet Luxury",
  "Rollgates Luxury",
  "Playfair Display",
] as const;

export type HathorLuxuryFont = (typeof HATHOR_LUXURY_FONTS)[number];

/**
 * Fonts with files present in /public/fonts/.
 * Flip to true when you add the matching file (see app/hathor-fonts.css).
 */
export const HATHOR_FONT_INSTALLED: Record<HathorLuxuryFont, boolean> = {
  Agraham: true,
  Baginda: false,
  "Bastliga One": false,
  Cylburn: false,
  Gabigaile: true,
  Gamgote: true,
  "Quiet Luxury": true,
  "Rollgates Luxury": false,
  "Playfair Display": false,
};

/** Dropdown options — installed fonts only. */
export const HATHOR_AVAILABLE_LUXURY_FONTS = HATHOR_LUXURY_FONTS.filter(
  (font) => HATHOR_FONT_INSTALLED[font],
);

export const TYPOGRAPHY_ROLES = [
  "hero_title",
  "hero_subtitle",
  "page_title",
  "page_subtitle",
] as const;

export type TypographyRole = (typeof TYPOGRAPHY_ROLES)[number];

export const TYPOGRAPHY_ROLE_LABELS: Record<TypographyRole, string> = {
  hero_title: "Hero title",
  hero_subtitle: "Hero subtitle",
  page_title: "Page title",
  page_subtitle: "Page subtitle",
};

const hexColor = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use a 6-digit hex color (#RRGGBB)");

const luxuryFontSchema = z.enum(HATHOR_LUXURY_FONTS);

export const typographyTextStyleSchema = z.object({
  fontFamily: luxuryFontSchema,
  fontSize: z.number().min(8).max(200),
  color: hexColor,
  lineHeight: z.number().min(0.8).max(3),
  letterSpacing: z.number().min(-10).max(40),
  innerShadow: z.boolean(),
});

export type TypographyTextStyle = z.infer<typeof typographyTextStyleSchema>;

export const typographySettingsSchema = z.object({
  hero_title: typographyTextStyleSchema,
  hero_subtitle: typographyTextStyleSchema,
  page_title: typographyTextStyleSchema,
  page_subtitle: typographyTextStyleSchema,
});

export type TypographySettings = z.infer<typeof typographySettingsSchema>;

export const DEFAULT_TYPOGRAPHY_SETTINGS: TypographySettings = {
  hero_title: {
    fontFamily: "Gabigaile",
    fontSize: 56,
    color: "#F5F0E8",
    lineHeight: 1.15,
    letterSpacing: 0,
    innerShadow: false,
  },
  hero_subtitle: {
    fontFamily: "Quiet Luxury",
    fontSize: 22,
    color: "#B69F64",
    lineHeight: 1.4,
    letterSpacing: 1,
    innerShadow: false,
  },
  page_title: {
    fontFamily: "Gamgote",
    fontSize: 44,
    color: "#1A1A1A",
    lineHeight: 1.22,
    letterSpacing: -0.5,
    innerShadow: false,
  },
  page_subtitle: {
    fontFamily: "Gamgote",
    fontSize: 16,
    color: "#6B6B6B",
    lineHeight: 1.5,
    letterSpacing: 2,
    innerShadow: false,
  },
};

const INNER_SHADOW = "inset 0 1px 2px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.2)";

function asFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value.replace(/px|em|%/g, "").trim());
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function asFont(value: unknown, fallback: HathorLuxuryFont): HathorLuxuryFont {
  if (typeof value === "string" && (HATHOR_LUXURY_FONTS as readonly string[]).includes(value)) {
    return value as HathorLuxuryFont;
  }
  return fallback;
}

function asHex(value: unknown, fallback: string): string {
  if (typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value)) return value;
  if (typeof value === "string" && /^#[0-9A-Fa-f]{3}$/.test(value)) {
    const [r, g, b] = value.slice(1);
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return fallback;
}

function parseTextStyle(
  raw: unknown,
  fallback: TypographyTextStyle,
): TypographyTextStyle {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const candidate: TypographyTextStyle = {
    fontFamily: asFont(src.fontFamily, fallback.fontFamily),
    fontSize: asFiniteNumber(src.fontSize) ?? fallback.fontSize,
    color: asHex(src.color, fallback.color),
    lineHeight: asFiniteNumber(src.lineHeight) ?? fallback.lineHeight,
    letterSpacing: asFiniteNumber(src.letterSpacing) ?? fallback.letterSpacing,
    innerShadow: typeof src.innerShadow === "boolean" ? src.innerShadow : fallback.innerShadow,
  };
  const parsed = typographyTextStyleSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;

  const clamp = (n: number, min: number, max: number, fb: number) => {
    if (!Number.isFinite(n)) return fb;
    return Math.min(max, Math.max(min, n));
  };

  return {
    fontFamily: asFont(candidate.fontFamily, fallback.fontFamily),
    fontSize: clamp(candidate.fontSize, 8, 200, fallback.fontSize),
    color: asHex(candidate.color, fallback.color),
    lineHeight: clamp(candidate.lineHeight, 0.8, 3, fallback.lineHeight),
    letterSpacing: clamp(candidate.letterSpacing, -10, 40, fallback.letterSpacing),
    innerShadow: Boolean(candidate.innerShadow),
  };
}

export function parseTypographySettings(raw: unknown): TypographySettings {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    hero_title: parseTextStyle(src.hero_title, DEFAULT_TYPOGRAPHY_SETTINGS.hero_title),
    hero_subtitle: parseTextStyle(
      src.hero_subtitle,
      DEFAULT_TYPOGRAPHY_SETTINGS.hero_subtitle,
    ),
    page_title: parseTextStyle(src.page_title, DEFAULT_TYPOGRAPHY_SETTINGS.page_title),
    page_subtitle: parseTextStyle(
      src.page_subtitle,
      DEFAULT_TYPOGRAPHY_SETTINGS.page_subtitle,
    ),
  };
}

export function isTypographySettingsEqual(
  a: TypographySettings,
  b: TypographySettings,
): boolean {
  return TYPOGRAPHY_ROLES.every((role) =>
    (Object.keys(a[role]) as (keyof TypographyTextStyle)[]).every(
      (key) => a[role][key] === b[role][key],
    ),
  );
}

/** Inline styles for React components (user-requested shape). */
export function typographyToInlineStyle(style: TypographyTextStyle): CSSProperties {
  return {
    fontFamily: `'${style.fontFamily}', serif`,
    fontSize: `${style.fontSize}px`,
    color: style.color,
    lineHeight: style.lineHeight,
    letterSpacing: `${style.letterSpacing}px`,
    textShadow: style.innerShadow ? INNER_SHADOW : "none",
  };
}

function roleCssVars(role: TypographyRole, style: TypographyTextStyle): Record<string, string> {
  const prefix = `--typo-${role.replace(/_/g, "-")}`;
  return {
    [`${prefix}-font`]: `'${style.fontFamily}', serif`,
    [`${prefix}-size`]: `${style.fontSize}px`,
    [`${prefix}-color`]: style.color,
    [`${prefix}-line-height`]: String(style.lineHeight),
    [`${prefix}-letter-spacing`]: `${style.letterSpacing}px`,
    [`${prefix}-shadow`]: style.innerShadow ? INNER_SHADOW : "none",
  };
}

export function typographyToCssVars(
  settings: TypographySettings,
): Record<string, string> {
  return TYPOGRAPHY_ROLES.reduce(
    (acc, role) => ({ ...acc, ...roleCssVars(role, settings[role]) }),
    {} as Record<string, string>,
  );
}

/** Beats stylesheet cascade for hero + page titles/subtitles. */
export function typographyToImportantCss(settings: TypographySettings): string {
  const vars = typographyToCssVars(settings);
  const rootBody = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value} !important;`)
    .join("\n");

  const block = (selector: string, role: TypographyRole) => {
    const p = `--typo-${role.replace(/_/g, "-")}`;
    return `${selector} {
  font-family: var(${p}-font) !important;
  font-size: var(${p}-size) !important;
  color: var(${p}-color) !important;
  line-height: var(${p}-line-height) !important;
  letter-spacing: var(${p}-letter-spacing) !important;
  text-shadow: var(${p}-shadow) !important;
}`;
  };

  return `
.public-site,
.public-site .home-hero-container,
.public-site .hathor-page-hero,
.public-site .lux-page-hero,
.public-site .owo-hero {
${rootBody}
}
${block(
  `.public-site .hero-heading,
.public-site .hero-line,
.public-site .owo-hero__title`,
  "hero_title",
)}
${block(
  `.public-site .hero-sub,
.public-site .owo-hero__subtitle`,
  "hero_subtitle",
)}
${block(
  `.public-site .hathor-page-hero__title,
.public-site .lux-page-hero__title`,
  "page_title",
)}
${block(
  `.public-site .hathor-page-hero__subtitle,
.public-site .lux-page-hero .lux-section-eyebrow`,
  "page_subtitle",
)}
`.trim();
}
