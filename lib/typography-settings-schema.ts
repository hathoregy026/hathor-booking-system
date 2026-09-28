import { z } from "zod";
import {
  DEFAULT_HERO_COPY,
  DEFAULT_HERO_LAYOUT,
  DEFAULT_HERO_PAGES,
  DEFAULT_HERO_SECOND_SHIMMER,
  DEFAULT_MARQUEE_COPY,
  DEFAULT_ON_IMAGES_COPY,
  DEFAULT_OUR_VOYAGES_COPY,
  DEFAULT_PAGE_STYLES,
  DEFAULT_TYPOGRAPHY_SETTINGS,
  HATHOR_LUXURY_FONTS,
  HERO_ALIGNS,
  HERO_PAGE_KEYS,
  PAGE_STYLE_ROLES,
  type HathorLuxuryFont,
  type HeroAlign,
} from "@/lib/typography-settings-shared";

/* Server and dashboard only: public pages receive settings the server has
   already parsed, and never need zod in their bundle. */

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

/** Free placement for the two hero title lines (may overlap). */
export const heroLayoutSchema = z.object({
  align: z.enum(HERO_ALIGNS),
  mainX: z.number().min(-240).max(240),
  mainY: z.number().min(-240).max(240),
  secondX: z.number().min(-240).max(240),
  secondY: z.number().min(-240).max(240),
});

export type HeroLayout = z.infer<typeof heroLayoutSchema>;

const copyLine = z.string().max(160);
const copyBody = z.string().max(1200);

/** Animated metallic shimmer for the hero second title (script line) */
export const heroSecondShimmerSchema = z.object({
  enabled: z.boolean(),
  /** Loop duration in seconds (higher = slower) */
  speed: z.number().min(2).max(40),
  /** Highlight strength 0–100 */
  shine: z.number().min(0).max(100),
  /** Drop-shadow / glow strength 0–100 */
  shadow: z.number().min(0).max(100),
});

export type HeroSecondShimmer = z.infer<typeof heroSecondShimmerSchema>;

/** Editable homepage hero title lines */
export const heroCopySchema = z.object({
  main: copyLine,
  second: copyLine,
});

export type HeroCopy = z.infer<typeof heroCopySchema>;

/** Editable homepage on-image title / indication / body */
export const onImagesCopySchema = z.object({
  title: copyLine,
  indication: copyLine,
  body: copyBody,
});

export type OnImagesCopy = z.infer<typeof onImagesCopySchema>;

/** Editable homepage Our Voyages accordion title + indication */
export const ourVoyagesCopySchema = z.object({
  title: copyLine,
  indication: copyLine,
});

export type OurVoyagesCopy = z.infer<typeof ourVoyagesCopySchema>;

/** Homepage luxury marquee — one phrase per line (✦ dividers added on site) */
export const marqueeCopySchema = z.object({
  text: z.string().max(1200),
});

export type MarqueeCopy = z.infer<typeof marqueeCopySchema>;

export const heroPagesSchema = z.object({
  home: heroCopySchema,
  cruises: heroCopySchema,
  voyages: heroCopySchema,
  highlights: heroCopySchema,
  about: heroCopySchema,
  gastronomy: heroCopySchema,
  wellness: heroCopySchema,
  charter: heroCopySchema,
  contact: heroCopySchema,
  blog: heroCopySchema,
  partners: heroCopySchema,
  suites: heroCopySchema,
  luxury_cabins: heroCopySchema,
  royal_suites: heroCopySchema,
});

export type HeroPages = z.infer<typeof heroPagesSchema>;

export const pageStyleOverridesSchema = z.object({
  hero_title: typographyTextStyleSchema.optional(),
  hero_subtitle: typographyTextStyleSchema.optional(),
  page_title: typographyTextStyleSchema.optional(),
  page_subtitle: typographyTextStyleSchema.optional(),
  body_text: typographyTextStyleSchema.optional(),
});

export type PageStyleOverrides = z.infer<typeof pageStyleOverridesSchema>;

export const pageStylesSchema = z.object({
  home: pageStyleOverridesSchema,
  cruises: pageStyleOverridesSchema,
  voyages: pageStyleOverridesSchema,
  highlights: pageStyleOverridesSchema,
  about: pageStyleOverridesSchema,
  gastronomy: pageStyleOverridesSchema,
  wellness: pageStyleOverridesSchema,
  charter: pageStyleOverridesSchema,
  contact: pageStyleOverridesSchema,
  blog: pageStyleOverridesSchema,
  partners: pageStyleOverridesSchema,
  suites: pageStyleOverridesSchema,
  luxury_cabins: pageStyleOverridesSchema,
  royal_suites: pageStyleOverridesSchema,
});

export type PageStyles = z.infer<typeof pageStylesSchema>;

export const typographySettingsSchema = z.object({
  hero_title: typographyTextStyleSchema,
  hero_subtitle: typographyTextStyleSchema,
  page_title: typographyTextStyleSchema,
  page_subtitle: typographyTextStyleSchema,
  sub_subtitle: typographyTextStyleSchema,
  body_text: typographyTextStyleSchema,
  on_images_title: typographyTextStyleSchema,
  on_images_indication: typographyTextStyleSchema,
  on_images_body: typographyTextStyleSchema,
  luxury_marquee: typographyTextStyleSchema,
  our_voyages_title: typographyTextStyleSchema,
  our_voyages_indication: typographyTextStyleSchema,
  our_voyages_main: typographyTextStyleSchema,
  our_voyages_main_hover: typographyTextStyleSchema,
  our_voyages_indication_hover: typographyTextStyleSchema,
  our_voyages_body_hover: typographyTextStyleSchema,
  hero_layout: heroLayoutSchema,
  hero_second_shimmer: heroSecondShimmerSchema,
  /** @deprecated Prefer hero_pages.home — kept for older saved payloads */
  hero_copy: heroCopySchema,
  hero_pages: heroPagesSchema,
  /** Optional per-page font/size overrides. Empty = inherit site typography. */
  page_styles: pageStylesSchema.optional().default(DEFAULT_PAGE_STYLES),
  on_images_copy: onImagesCopySchema,
  marquee_copy: marqueeCopySchema,
  our_voyages_copy: ourVoyagesCopySchema,
});

export type TypographySettings = z.infer<typeof typographySettingsSchema>;

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

function parseHeroSecondShimmer(raw: unknown): HeroSecondShimmer {
  const fb = DEFAULT_HERO_SECOND_SHIMMER;
  if (raw == null || typeof raw !== "object") return { ...fb };
  const src = raw as Record<string, unknown>;

  /* Legacy metallic gradient payloads (highlight/mid/bronze) → fresh shimmer defaults */
  const isLegacyGradient =
    typeof src.highlight === "string" ||
    typeof src.mid === "string" ||
    typeof src.bronze === "string" ||
    typeof src.angle === "number";
  if (isLegacyGradient && typeof src.shine !== "number") {
    return { ...fb };
  }

  const candidate: HeroSecondShimmer = {
    enabled: typeof src.enabled === "boolean" ? src.enabled : fb.enabled,
    speed: clampNum(asFiniteNumber(src.speed) ?? fb.speed, 2, 40, fb.speed),
    shine: clampNum(asFiniteNumber(src.shine) ?? fb.shine, 0, 100, fb.shine),
    shadow: clampNum(
      asFiniteNumber(src.shadow) ?? fb.shadow,
      0,
      100,
      fb.shadow,
    ),
  };
  const parsed = heroSecondShimmerSchema.safeParse(candidate);
  return parsed.success ? parsed.data : { ...fb };
}

function parseHeroCopy(raw: unknown): HeroCopy {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const main =
    typeof src.main === "string" ? src.main.slice(0, 160) : DEFAULT_HERO_COPY.main;
  const second =
    typeof src.second === "string"
      ? src.second.slice(0, 160)
      : DEFAULT_HERO_COPY.second;
  const candidate = { main, second };
  const parsed = heroCopySchema.safeParse(candidate);
  return parsed.success ? parsed.data : { ...DEFAULT_HERO_COPY };
}

function parseHeroPages(raw: unknown, legacyHome?: HeroCopy): HeroPages {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const pages = {} as HeroPages;
  for (const key of HERO_PAGE_KEYS) {
    if (src[key] !== undefined) {
      pages[key] = parseHeroCopy(src[key]);
      continue;
    }
    pages[key] = {
      ...(key === "home" && legacyHome
        ? legacyHome
        : DEFAULT_HERO_PAGES[key]),
    };
  }
  return pages;
}

function parsePageStyles(raw: unknown): PageStyles {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const pages = {} as PageStyles;
  for (const key of HERO_PAGE_KEYS) {
    const entry =
      src[key] && typeof src[key] === "object"
        ? (src[key] as Record<string, unknown>)
        : {};
    const overrides: PageStyleOverrides = {};
    for (const role of PAGE_STYLE_ROLES) {
      if (entry[role] && typeof entry[role] === "object") {
        overrides[role] = parseTextStyle(
          entry[role],
          DEFAULT_TYPOGRAPHY_SETTINGS[role],
        );
      }
    }
    pages[key] = overrides;
  }
  return pages;
}

function parseOnImagesCopy(raw: unknown): OnImagesCopy {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const title =
    typeof src.title === "string"
      ? src.title.slice(0, 160)
      : DEFAULT_ON_IMAGES_COPY.title;
  const indication =
    typeof src.indication === "string"
      ? src.indication.slice(0, 160)
      : DEFAULT_ON_IMAGES_COPY.indication;
  let body =
    typeof src.body === "string"
      ? src.body.slice(0, 1200)
      : DEFAULT_ON_IMAGES_COPY.body;
  const legacyFiveStar =
    "A five-star dahabiya on the ancient Nile: history, comfort, and style in one intimate voyage.";
  if (body.trim() === legacyFiveStar) {
    body = DEFAULT_ON_IMAGES_COPY.body;
  }
  const candidate = { title, indication, body };
  const parsed = onImagesCopySchema.safeParse(candidate);
  return parsed.success ? parsed.data : { ...DEFAULT_ON_IMAGES_COPY };
}

function parseOurVoyagesCopy(raw: unknown): OurVoyagesCopy {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const title =
    typeof src.title === "string"
      ? src.title.slice(0, 160)
      : DEFAULT_OUR_VOYAGES_COPY.title;
  const indication =
    typeof src.indication === "string"
      ? src.indication.slice(0, 160)
      : DEFAULT_OUR_VOYAGES_COPY.indication;
  const candidate = { title, indication };
  const parsed = ourVoyagesCopySchema.safeParse(candidate);
  return parsed.success ? parsed.data : { ...DEFAULT_OUR_VOYAGES_COPY };
}

function parseMarqueeCopy(raw: unknown): MarqueeCopy {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const text =
    typeof src.text === "string"
      ? src.text.slice(0, 1200)
      : DEFAULT_MARQUEE_COPY.text;
  const parsed = marqueeCopySchema.safeParse({ text });
  return parsed.success ? parsed.data : { ...DEFAULT_MARQUEE_COPY };
}

function withOnImageColor(
  base: TypographyTextStyle,
  color: string,
): TypographyTextStyle {
  return { ...base, color: asHex(color, base.color) };
}

export function parseTypographySettings(raw: unknown): TypographySettings {
  const src =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  /* Legacy single on_images color → seed the three on-image roles */
  const legacyOnImages =
    src.on_images && typeof src.on_images === "object"
      ? parseTextStyle(src.on_images, {
          ...DEFAULT_TYPOGRAPHY_SETTINGS.on_images_body,
        })
      : null;
  const legacyColor = legacyOnImages?.color ?? "#B69F64";

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
    on_images_title: parseTextStyle(
      src.on_images_title,
      legacyOnImages
        ? withOnImageColor(DEFAULT_TYPOGRAPHY_SETTINGS.on_images_title, legacyColor)
        : DEFAULT_TYPOGRAPHY_SETTINGS.on_images_title,
    ),
    on_images_indication: parseTextStyle(
      src.on_images_indication,
      legacyOnImages
        ? withOnImageColor(
            DEFAULT_TYPOGRAPHY_SETTINGS.on_images_indication,
            legacyColor,
          )
        : DEFAULT_TYPOGRAPHY_SETTINGS.on_images_indication,
    ),
    on_images_body: parseTextStyle(
      src.on_images_body,
      legacyOnImages
        ? withOnImageColor(DEFAULT_TYPOGRAPHY_SETTINGS.on_images_body, legacyColor)
        : DEFAULT_TYPOGRAPHY_SETTINGS.on_images_body,
    ),
    luxury_marquee: parseTextStyle(
      src.luxury_marquee,
      DEFAULT_TYPOGRAPHY_SETTINGS.luxury_marquee,
    ),
    our_voyages_title: parseTextStyle(
      src.our_voyages_title,
      DEFAULT_TYPOGRAPHY_SETTINGS.our_voyages_title,
    ),
    our_voyages_indication: parseTextStyle(
      src.our_voyages_indication,
      DEFAULT_TYPOGRAPHY_SETTINGS.our_voyages_indication,
    ),
    our_voyages_main: parseTextStyle(
      src.our_voyages_main,
      DEFAULT_TYPOGRAPHY_SETTINGS.our_voyages_main,
    ),
    our_voyages_main_hover: parseTextStyle(
      src.our_voyages_main_hover,
      DEFAULT_TYPOGRAPHY_SETTINGS.our_voyages_main_hover,
    ),
    our_voyages_indication_hover: parseTextStyle(
      src.our_voyages_indication_hover,
      DEFAULT_TYPOGRAPHY_SETTINGS.our_voyages_indication_hover,
    ),
    our_voyages_body_hover: parseTextStyle(
      src.our_voyages_body_hover,
      DEFAULT_TYPOGRAPHY_SETTINGS.our_voyages_body_hover,
    ),
    hero_layout: parseHeroLayout(src.hero_layout),
    hero_second_shimmer: parseHeroSecondShimmer(
      src.hero_second_shimmer ?? src.hero_second_gradient,
    ),
    hero_copy: (() => {
      const pages = parseHeroPages(src.hero_pages, parseHeroCopy(src.hero_copy));
      return { ...pages.home };
    })(),
    hero_pages: parseHeroPages(src.hero_pages, parseHeroCopy(src.hero_copy)),
    page_styles: parsePageStyles(src.page_styles),
    on_images_copy: parseOnImagesCopy(src.on_images_copy),
    marquee_copy: parseMarqueeCopy(src.marquee_copy),
    our_voyages_copy: parseOurVoyagesCopy(src.our_voyages_copy),
  };
}
