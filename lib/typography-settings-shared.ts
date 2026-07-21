import { z } from "zod";
import type { CSSProperties } from "react";

export const TYPOGRAPHY_SETTINGS_KEY = "typography-styles";

/**
 * Exact CSS font-family names (one per face).
 * Families with multiple styles appear once in the UI with a style dropdown.
 */
export const HATHOR_LUXURY_FONTS = [
  "Agraham",
  "Baginda",
  "Bastliga One",
  "Bastliga Two",
  "Bastliga Three",
  "Bastliga Four",
  "Bastliga Five",
  "Bastliga Tail",
  "Bitho Luxury",
  "Cylburn",
  "Dynalight",
  "Gabigaile",
  "Gamgote",
  "Lavenir",
  "Michiko",
  "Quiet Luxury",
  "Quiet Luxury Serif",
  "Rollgates Luxury",
  "Rollgates Luxury Italic",
  "Rolling Fonte",
  "Playfair Display",
  "Playfair Display Italic",
] as const;

export type HathorLuxuryFont = (typeof HATHOR_LUXURY_FONTS)[number];

export type HathorFontVariant = {
  id: HathorLuxuryFont;
  label: string;
};

export type HathorFontFamilyGroup = {
  family: string;
  variants: readonly HathorFontVariant[];
};

/** Dashboard font picker: one card per family; dropdown when variants.length > 1. */
export const HATHOR_FONT_GROUPS: readonly HathorFontFamilyGroup[] = [
  { family: "Agraham", variants: [{ id: "Agraham", label: "Regular" }] },
  { family: "Baginda", variants: [{ id: "Baginda", label: "Regular" }] },
  {
    family: "Bastliga",
    variants: [
      { id: "Bastliga One", label: "One" },
      { id: "Bastliga Two", label: "Two" },
      { id: "Bastliga Three", label: "Three" },
      { id: "Bastliga Four", label: "Four" },
      { id: "Bastliga Five", label: "Five" },
      { id: "Bastliga Tail", label: "Tail" },
    ],
  },
  {
    family: "Bitho Luxury",
    variants: [{ id: "Bitho Luxury", label: "Italic" }],
  },
  { family: "Cylburn", variants: [{ id: "Cylburn", label: "Regular" }] },
  { family: "Dynalight", variants: [{ id: "Dynalight", label: "Regular" }] },
  { family: "Gabigaile", variants: [{ id: "Gabigaile", label: "Regular" }] },
  { family: "Gamgote", variants: [{ id: "Gamgote", label: "Regular" }] },
  { family: "Lavenir", variants: [{ id: "Lavenir", label: "Regular" }] },
  { family: "Michiko", variants: [{ id: "Michiko", label: "Italic" }] },
  {
    family: "Quiet Luxury",
    variants: [{ id: "Quiet Luxury", label: "Script" }],
  },
  {
    family: "Quiet Luxury Serif",
    variants: [{ id: "Quiet Luxury Serif", label: "Serif" }],
  },
  {
    family: "Rollgates Luxury",
    variants: [
      { id: "Rollgates Luxury", label: "Regular" },
      { id: "Rollgates Luxury Italic", label: "Italic" },
    ],
  },
  {
    family: "Rolling Fonte",
    variants: [{ id: "Rolling Fonte", label: "Regular" }],
  },
  {
    family: "Playfair Display",
    variants: [{ id: "Playfair Display", label: "Regular" }],
  },
  {
    family: "Playfair Display Italic",
    variants: [{ id: "Playfair Display Italic", label: "Italic" }],
  },
] as const;

/** All faces are installed under /public/fonts/. */
export const HATHOR_FONT_INSTALLED: Record<HathorLuxuryFont, boolean> =
  Object.fromEntries(HATHOR_LUXURY_FONTS.map((f) => [f, true])) as Record<
    HathorLuxuryFont,
    boolean
  >;

/** Dropdown options — installed fonts only. */
export const HATHOR_AVAILABLE_LUXURY_FONTS = HATHOR_LUXURY_FONTS.filter(
  (font) => HATHOR_FONT_INSTALLED[font],
);

export function fontGroupForFace(face: HathorLuxuryFont): HathorFontFamilyGroup {
  const found = HATHOR_FONT_GROUPS.find((g) =>
    g.variants.some((v) => v.id === face),
  );
  return found ?? HATHOR_FONT_GROUPS[0]!;
}

export function isFaceInGroup(
  face: HathorLuxuryFont,
  group: HathorFontFamilyGroup,
): boolean {
  return group.variants.some((v) => v.id === face);
}

export const TYPOGRAPHY_ROLES = [
  "hero_title",
  "hero_subtitle",
  "page_title",
  "page_subtitle",
  "sub_subtitle",
  "body_text",
  "on_images",
] as const;

export type TypographyRole = (typeof TYPOGRAPHY_ROLES)[number];

export const TYPOGRAPHY_ROLE_LABELS: Record<TypographyRole, string> = {
  hero_title: "Hero title",
  hero_subtitle: "Hero subtitle",
  page_title: "Page title",
  /** Small indication under section titles — case/font match dashboard exactly */
  page_subtitle: "Small indication",
  /** Script line under a title / between blocks */
  sub_subtitle: "Sub-sub title",
  body_text: "Body text",
  /** Color for any copy sitting on photos / video stills */
  on_images: "On images",
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

export const HERO_ALIGNS = ["left", "center", "right"] as const;
export type HeroAlign = (typeof HERO_ALIGNS)[number];

/** Free placement for the two hero title lines (may overlap). */
export const heroLayoutSchema = z.object({
  align: z.enum(HERO_ALIGNS),
  mainX: z.number().min(-240).max(240),
  mainY: z.number().min(-240).max(240),
  secondX: z.number().min(-240).max(240),
  secondY: z.number().min(-240).max(240),
});

export type HeroLayout = z.infer<typeof heroLayoutSchema>;

export const DEFAULT_HERO_LAYOUT: HeroLayout = {
  align: "center",
  mainX: 0,
  mainY: 0,
  secondX: 0,
  secondY: -28,
};

export const typographySettingsSchema = z.object({
  hero_title: typographyTextStyleSchema,
  hero_subtitle: typographyTextStyleSchema,
  page_title: typographyTextStyleSchema,
  page_subtitle: typographyTextStyleSchema,
  sub_subtitle: typographyTextStyleSchema,
  body_text: typographyTextStyleSchema,
  on_images: typographyTextStyleSchema,
  hero_layout: heroLayoutSchema,
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
    fontSize: 64,
    color: "#B69F64",
    lineHeight: 1.1,
    letterSpacing: 0.5,
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
    fontFamily: "Lavenir",
    fontSize: 13,
    color: "#7A6A58",
    lineHeight: 1.35,
    letterSpacing: 4,
    innerShadow: false,
  },
  sub_subtitle: {
    fontFamily: "Bitho Luxury",
    fontSize: 30,
    color: "#B69F64",
    lineHeight: 1.25,
    letterSpacing: 0.5,
    innerShadow: false,
  },
  body_text: {
    fontFamily: "Gamgote",
    fontSize: 17,
    color: "#3D3A36",
    lineHeight: 1.7,
    letterSpacing: 0,
    innerShadow: false,
  },
  on_images: {
    fontFamily: "Gamgote",
    fontSize: 17,
    color: "#FFFFFF",
    lineHeight: 1.5,
    letterSpacing: 0,
    innerShadow: false,
  },
  hero_layout: { ...DEFAULT_HERO_LAYOUT },
};

const INNER_SHADOW = "inset 0 1px 2px rgba(0, 0, 0, 0.35), 0 1px 2px rgba(0, 0, 0, 0.2)";

/** Prefer next/font CSS variables when present; else quoted family name. */
export const HATHOR_FONT_STACKS: Record<HathorLuxuryFont, string> = {
  Agraham: 'var(--font-hathor-agraham), "Agraham", cursive',
  Baginda: '"Baginda", serif',
  "Bastliga One": '"Bastliga One", cursive',
  "Bastliga Two": '"Bastliga Two", cursive',
  "Bastliga Three": '"Bastliga Three", cursive',
  "Bastliga Four": '"Bastliga Four", cursive',
  "Bastliga Five": '"Bastliga Five", cursive',
  "Bastliga Tail": '"Bastliga Tail", cursive',
  "Bitho Luxury": '"Bitho Luxury", cursive',
  Cylburn: '"Cylburn", serif',
  Dynalight: '"Dynalight", cursive',
  Gabigaile: 'var(--font-hathor-gabigaile), "Gabigaile", serif',
  Gamgote: 'var(--font-hathor-gamgote), "Gamgote", serif',
  Lavenir: '"Lavenir", serif',
  Michiko: '"Michiko", cursive',
  "Quiet Luxury": 'var(--font-hathor-quiet-luxury), "Quiet Luxury", cursive',
  "Quiet Luxury Serif": '"Quiet Luxury Serif", serif',
  "Rollgates Luxury": '"Rollgates Luxury", serif',
  "Rollgates Luxury Italic": '"Rollgates Luxury Italic", serif',
  "Rolling Fonte": '"Rolling Fonte", serif',
  "Playfair Display": '"Playfair Display", Georgia, serif',
  "Playfair Display Italic": '"Playfair Display Italic", Georgia, serif',
};

function fontStack(font: HathorLuxuryFont): string {
  return HATHOR_FONT_STACKS[font] ?? `"${font}", serif`;
}

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

function clampNum(n: number, min: number, max: number, fb: number): number {
  if (!Number.isFinite(n)) return fb;
  return Math.min(max, Math.max(min, n));
}

function parseHeroLayout(raw: unknown): HeroLayout {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const alignRaw = typeof src.align === "string" ? src.align : DEFAULT_HERO_LAYOUT.align;
  const align = (HERO_ALIGNS as readonly string[]).includes(alignRaw)
    ? (alignRaw as HeroAlign)
    : DEFAULT_HERO_LAYOUT.align;
  const candidate: HeroLayout = {
    align,
    mainX: asFiniteNumber(src.mainX) ?? DEFAULT_HERO_LAYOUT.mainX,
    mainY: asFiniteNumber(src.mainY) ?? DEFAULT_HERO_LAYOUT.mainY,
    secondX: asFiniteNumber(src.secondX) ?? DEFAULT_HERO_LAYOUT.secondX,
    secondY: asFiniteNumber(src.secondY) ?? DEFAULT_HERO_LAYOUT.secondY,
  };
  const parsed = heroLayoutSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;
  return {
    align,
    mainX: clampNum(candidate.mainX, -240, 240, DEFAULT_HERO_LAYOUT.mainX),
    mainY: clampNum(candidate.mainY, -240, 240, DEFAULT_HERO_LAYOUT.mainY),
    secondX: clampNum(candidate.secondX, -240, 240, DEFAULT_HERO_LAYOUT.secondX),
    secondY: clampNum(candidate.secondY, -240, 240, DEFAULT_HERO_LAYOUT.secondY),
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
    sub_subtitle: parseTextStyle(
      src.sub_subtitle,
      DEFAULT_TYPOGRAPHY_SETTINGS.sub_subtitle,
    ),
    body_text: parseTextStyle(src.body_text, DEFAULT_TYPOGRAPHY_SETTINGS.body_text),
    on_images: parseTextStyle(src.on_images, DEFAULT_TYPOGRAPHY_SETTINGS.on_images),
    hero_layout: parseHeroLayout(src.hero_layout),
  };
}

export function isTypographySettingsEqual(
  a: TypographySettings,
  b: TypographySettings,
): boolean {
  const rolesEqual = TYPOGRAPHY_ROLES.every((role) =>
    (Object.keys(a[role]) as (keyof TypographyTextStyle)[]).every(
      (key) => a[role][key] === b[role][key],
    ),
  );
  if (!rolesEqual) return false;
  return (Object.keys(a.hero_layout) as (keyof HeroLayout)[]).every(
    (key) => a.hero_layout[key] === b.hero_layout[key],
  );
}

/** Inline styles for React components (user-requested shape). */
export function typographyToInlineStyle(style: TypographyTextStyle): CSSProperties {
  return {
    fontFamily: fontStack(style.fontFamily),
    fontSize: `${style.fontSize}px`,
    color: style.color,
    lineHeight: style.lineHeight,
    letterSpacing: `${style.letterSpacing}px`,
    textShadow: style.innerShadow ? INNER_SHADOW : "none",
    WebkitTextFillColor: style.color,
    textTransform: "none",
    fontWeight: 400,
  };
}

function roleCssVars(role: TypographyRole, style: TypographyTextStyle): Record<string, string> {
  const prefix = `--typo-${role.replace(/_/g, "-")}`;
  return {
    [`${prefix}-font`]: fontStack(style.fontFamily),
    [`${prefix}-size`]: `${style.fontSize}px`,
    [`${prefix}-color`]: style.color,
    [`${prefix}-line-height`]: String(style.lineHeight),
    [`${prefix}-letter-spacing`]: `${style.letterSpacing}px`,
    [`${prefix}-shadow`]: style.innerShadow ? INNER_SHADOW : "none",
  };
}

function heroLayoutCssVars(layout: HeroLayout): Record<string, string> {
  const alignItems =
    layout.align === "left"
      ? "flex-start"
      : layout.align === "right"
        ? "flex-end"
        : "center";
  return {
    "--typo-hero-align": layout.align,
    "--typo-hero-align-items": alignItems,
    "--typo-hero-main-x": `${layout.mainX}px`,
    "--typo-hero-main-y": `${layout.mainY}px`,
    "--typo-hero-second-x": `${layout.secondX}px`,
    "--typo-hero-second-y": `${layout.secondY}px`,
  };
}

export function typographyToCssVars(
  settings: TypographySettings,
): Record<string, string> {
  const roleVars = TYPOGRAPHY_ROLES.reduce(
    (acc, role) => ({ ...acc, ...roleCssVars(role, settings[role]) }),
    {} as Record<string, string>,
  );
  return { ...roleVars, ...heroLayoutCssVars(settings.hero_layout) };
}

/** Beats stylesheet cascade for hero + page titles/subtitles. */
export function typographyToImportantCss(settings: TypographySettings): string {
  const vars = typographyToCssVars(settings);
  const rootBody = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value} !important;`)
    .join("\n");

  const block = (selector: string, role: TypographyRole) => {
    const p = `--typo-${role.replace(/_/g, "-")}`;
    /* Small indication + script + body: never invent case/weight — match dashboard input */
    const authoredCase =
      role === "page_title" ||
      role === "page_subtitle" ||
      role === "sub_subtitle" ||
      role === "body_text"
        ? `\n  text-transform: none !important;\n  font-weight: 400 !important;`
        : "";
    return `${selector} {
  font-family: var(${p}-font) !important;
  font-size: var(${p}-size) !important;
  color: var(${p}-color) !important;
  -webkit-text-fill-color: var(${p}-color) !important;
  line-height: var(${p}-line-height) !important;
  letter-spacing: var(${p}-letter-spacing) !important;
  text-shadow: var(${p}-shadow) !important;${authoredCase}
}`;
  };

  return `
.public-site,
.public-site .home-hero-container,
.public-site .hathor-page-hero,
.public-site .lux-page-hero,
.public-site .owo-hero,
html[data-ex-experience] .public-site,
html[data-ex-experience] .ex-root {
${rootBody}
}
.public-site .hero-heading,
html[data-ex-experience] .public-site .ex-root .hero-heading,
html[data-ex-experience] .ex-root .hero-heading {
  align-items: var(--typo-hero-align-items, center) !important;
  text-align: var(--typo-hero-align, center) !important;
}
${block(
  `.public-site .hero-line--right,
.public-site .home-hero-container .hero-heading .hero-line--right,
html[data-ex-experience] .public-site .ex-root .hero-heading .hero-line--right,
html[data-ex-experience] .ex-root .hero-heading .hero-line--right,
.public-site .owo-hero__title`,
  "hero_title",
)}
.public-site .hero-line--right,
.public-site .home-hero-container .hero-heading .hero-line--right,
html[data-ex-experience] .public-site .ex-root .hero-heading .hero-line--right,
html[data-ex-experience] .ex-root .hero-heading .hero-line--right {
  position: relative !important;
  left: var(--typo-hero-main-x, 0px) !important;
  top: var(--typo-hero-main-y, 0px) !important;
  margin-top: 0 !important;
}
${block(
  `.public-site .hero-line--left:not(.hero-line--wordmark),
.public-site .home-hero-container .hero-heading .hero-line--left:not(.hero-line--wordmark),
html[data-ex-experience] .public-site .ex-root .hero-heading .hero-line--left:not(.hero-line--wordmark),
html[data-ex-experience] .ex-root .hero-heading .hero-line--left:not(.hero-line--wordmark)`,
  "hero_subtitle",
)}
.public-site .hero-line--left:not(.hero-line--wordmark),
.public-site .home-hero-container .hero-heading .hero-line--left:not(.hero-line--wordmark),
html[data-ex-experience] .public-site .ex-root .hero-heading .hero-line--left:not(.hero-line--wordmark),
html[data-ex-experience] .ex-root .hero-heading .hero-line--left:not(.hero-line--wordmark) {
  position: relative !important;
  left: var(--typo-hero-second-x, 0px) !important;
  top: var(--typo-hero-second-y, 0px) !important;
  margin-top: 0 !important;
  padding-top: 0 !important;
}
.public-site .hero-sub,
html[data-ex-experience] .ex-root .hero-sub,
.public-site .owo-hero__subtitle {
  font-family: var(--typo-hero-subtitle-font) !important;
  color: var(--typo-hero-subtitle-color) !important;
  -webkit-text-fill-color: var(--typo-hero-subtitle-color) !important;
  letter-spacing: var(--typo-hero-subtitle-letter-spacing) !important;
  text-shadow: var(--typo-hero-subtitle-shadow) !important;
  font-size: clamp(0.92rem, 1.2vw, 1.1rem) !important;
  line-height: 1.55 !important;
}
${block(
  `.public-site .hathor-page-hero__title,
.public-site .lux-page-hero__title,
.public-site .hathor-section-title,
.public-site .hathor-chapter-title,
.public-site .lux-cta-band__title,
.public-site .owo-chapter__title,
.public-site .lux-section-title,
.public-site [data-page-transition] .pt-sheet__landing-title,
.public-site [data-page-transition] .pt-hero__copy .hathor-page-hero__title,
.public-site .cruises-sheet__title,
.public-site .cruises-scroll-route .cruises-hero__title,
.public-site .venetian-page .acc-intro-title,
.public-site .venetian-page .room-fs-title,
.public-site .venetian-page .lux-gold.lux-gold-lg,
.public-site .venetian-page .cta-inner h2,
html[data-ex-experience] .ex-root .radius-heading h2,
html[data-ex-experience] .ex-root .home-carousel-h2 h2,
html[data-ex-experience] .ex-root .ex-stack-scroll__title,
html[data-ex-experience] .ex-root .home-text-h2 h2,
html[data-ex-experience] .ex-root .gallery-h2 h2,
html[data-ex-experience] .ex-root .gallery-sm h2,
html[data-ex-experience] .ex-root .testimonial-h2 h2,
html[data-ex-experience] .ex-root .cta-inner h2,
.public-site .typo-page-title`,
  "page_title",
)}
${block(
  `/* Small indication — exact dashboard values (no forced caps / page fonts) */
.public-site .typo-page-subtitle,
.public-site .hathor-section-eyebrow,
.public-site .hathor-chapter-eyebrow,
.public-site .lux-section-eyebrow,
.public-site .lux-kicker,
.public-site .hathor-lux .lux-kicker,
.public-site .acc-eyebrow,
.public-site .room-interstitial__eyebrow,
.public-site .venetian-page .room-fs-label,
.public-site .venetian-page .room-fs-route,
.public-site .venetian-page .room-fs-count,
.public-site .venetian-page .room-fs-ui .room-fs-label,
.public-site .venetian-page .room-fs-ui .room-fs-route,
.public-site .venetian-page .room-fs-ui .room-fs-count,
.public-site .venetian-page .room-fs-ui .room-fs-count i,
html[data-ex-experience] .ex-root .ex-stack-scroll__eyebrow,
html[data-ex-experience] .ex-root .home-carousel-h3 h3,
html[data-ex-experience] .ex-root .home-carousel-h3 .typo-page-subtitle`,
  "page_subtitle",
)}
${block(
  `/* Script sub-sub titles — never force caps; show authored case */
.public-site .typo-sub-subtitle,
.public-site .room-interstitial__script,
.public-site .hathor-section-subtitle,
.public-site .hathor-chapter-subtitle,
.public-site .venetian-page .room-fs-meta`,
  "sub_subtitle",
)}
${block(
  `.public-site .hathor-body-text,
.public-site .lux-section--beige .lux-container > p,
.public-site .lux-prose p,
.public-site article.lux-section p,
.public-site .public-page-body p,
.public-site .cruises-sheet p,
.public-site .venetian-page .acc-intro-copy,
.public-site .venetian-page .lux-lead,
.public-site .venetian-page .room-fs-desc,
.public-site .room-interstitial__body,
html[data-ex-experience] .ex-root .radius-p p,
html[data-ex-experience] .ex-root .home-text-p p,
html[data-ex-experience] .ex-root .home-scroll-p p,
html[data-ex-experience] .ex-root .cta-inner p,
html[data-ex-experience] .ex-root .testimonial-card p,
html[data-ex-experience] .ex-root .ex-stack-scroll__body,
.public-site .typo-body-text`,
  "body_text",
)}
${(() => {
  const p = "--typo-on-images";
  return `/* On images — color only for copy sitting on photos */
.public-site .typo-on-images,
.public-site .typo-on-images *,
html[data-ex-experience] .ex-root .ex-stack-scroll__eyebrow,
html[data-ex-experience] .ex-root .ex-stack-scroll__title,
html[data-ex-experience] .ex-root .ex-stack-scroll__title-line,
html[data-ex-experience] .ex-root .ex-stack-scroll__body,
html[data-ex-experience] .ex-root .ex-stack-scroll__copy,
.public-site .venetian-page .room-fs-ui,
.public-site .venetian-page .room-fs-ui .room-fs-title,
.public-site .venetian-page .room-fs-ui .room-fs-route,
.public-site .venetian-page .room-fs-ui .room-fs-label,
.public-site .venetian-page .room-fs-ui .room-fs-count,
.public-site .venetian-page .room-fs-ui .room-fs-count i,
.public-site .venetian-page .room-fs-ui .room-fs-meta,
.public-site .venetian-page .room-fs-ui .room-fs-desc,
.public-site .venetian-page .room-fs-ui .char,
.public-site .venetian-page .room-fs-ui .word,
.public-site .venetian-page .room-fs-ui .line,
.public-site .venetian-page .spx-frame-ui,
.public-site .venetian-page .spx-frame-ui .lux-kicker,
.public-site .venetian-page .spx-frame-ui .lux-gold,
.public-site .venetian-page .spx-frame-ui .lux-lead,
.public-site .venetian-page .spx-frame-ui .lux-copy,
.public-site .venetian-page .spx-frame-ui .lux-copy p,
.public-site .venetian-page .hlx-panel-copy,
.public-site .venetian-page .hlx-panel-copy .lux-kicker,
.public-site .venetian-page .hlx-panel-copy h3,
.public-site .venetian-page .hlx-panel-copy p,
.public-site .venetian-page .dnx-panel,
.public-site .venetian-page .dnx-panel .lux-kicker,
.public-site .venetian-page .dnx-panel .lux-gold,
.public-site .venetian-page .dnx-panel .lux-copy,
.public-site .venetian-page .dnx-panel .lux-copy p,
.public-site .hathor-page-hero__title,
.public-site .hathor-page-hero__subtitle,
.public-site [data-page-transition] .pt-hero__copy .hathor-page-hero__title,
.public-site [data-page-transition] .pt-hero__copy .hathor-page-hero__subtitle,
.public-site .cruises-scroll-route .cruises-hero__title,
.public-site .cruises-scroll-route .cruises-hero__subtitle,
.public-site .owo-bento__title,
.public-site .owo-bento__text,
.public-site .hathor-full-media__title,
.public-site .hathor-full-media__text,
.public-site .lux-testimonials__quote,
.public-site .lux-testimonials__name {
  color: var(${p}-color) !important;
  -webkit-text-fill-color: var(${p}-color) !important;
  text-shadow: var(${p}-shadow) !important;
}`;
})()}
`.trim();
}
