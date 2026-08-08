import { prisma } from "@/lib/prisma";
import { withDb } from "@/lib/db-safe";
import {
  HATHOR_FONT_STACKS,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";
import {
  DEFAULT_AMENITIES_TYPOGRAPHY,
  amenitiesTypographySchema,
  parseAmenitiesTypography,
  type AmenitiesTypography,
} from "@/lib/amenities-typography-shared";

export const AMENITIES_TYPOGRAPHY_KEY = "amenities-typography";
export const AMENITIES_TYPOGRAPHY_MOBILE_KEY = "amenities-typography-mobile";

export {
  DEFAULT_AMENITIES_TYPOGRAPHY,
  amenitiesTypographySchema,
  parseAmenitiesTypography,
};
export type { AmenitiesTypography };

export async function getAmenitiesTypography(phone = false) {
  const key = phone
    ? AMENITIES_TYPOGRAPHY_MOBILE_KEY
    : AMENITIES_TYPOGRAPHY_KEY;
  const row = await withDb(() =>
    prisma.siteSetting.findUnique({ where: { key } }),
  );
  if (!row?.value) return DEFAULT_AMENITIES_TYPOGRAPHY;
  try {
    return parseAmenitiesTypography(JSON.parse(row.value));
  } catch {
    return DEFAULT_AMENITIES_TYPOGRAPHY;
  }
}

export async function saveAmenitiesTypography(value: unknown, phone = false) {
  const settings = amenitiesTypographySchema.parse(value);
  const key = phone
    ? AMENITIES_TYPOGRAPHY_MOBILE_KEY
    : AMENITIES_TYPOGRAPHY_KEY;
  await withDb(() =>
    prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: JSON.stringify(settings) },
      update: { value: JSON.stringify(settings) },
    }),
  );
  return settings;
}

function roleCss(selector: string, style: TypographyTextStyle) {
  const fontStack = HATHOR_FONT_STACKS[style.fontFamily].replace(
    /var\([^)]*\),?\s*/g,
    "",
  );
  return `${selector}{font-family:${fontStack}!important;font-size:${style.fontSize}px!important;color:${style.color}!important;-webkit-text-fill-color:${style.color}!important;line-height:${style.lineHeight}!important;letter-spacing:${style.letterSpacing}px!important;${style.innerShadow ? "text-shadow:1px 1px 0 rgba(0,0,0,.35),-.5px -.5px 0 rgba(255,255,255,.25)!important;" : ""}}`;
}

/**
 * Expand comma-separated roots so suffixes apply to EVERY root.
 * `${".a,.b"} .child` must NOT become `.a, .b .child` (paints all of `.a`).
 */
function scopeRoots(roots: string[], suffix: string): string {
  return roots.map((root) => `${root}${suffix}`).join(",");
}

/** Styles scoped to the homepage amenities sequence only. */
export function amenitiesTypographyToCss(settings: AmenitiesTypography) {
  const roots = [
    ".public-site .home-am-sequence",
    "html[data-ex-experience] .ex-root .home-am-sequence",
  ];
  const sel = (...suffixes: string[]) =>
    suffixes.map((suffix) => scopeRoots(roots, suffix)).join(",");

  /* Cream panel body uses site body_text; gold panels use white for contrast. */
  const creamInk = `${sel(
    " .home-am-intro__cream .typo-body-text",
    " .home-am-intro__cream .typo-body-text *",
    " .home-am-video__title-body",
    " .home-am-video__title-body *",
  )}{color:var(--typo-body-text-color,#3d3a36)!important;-webkit-text-fill-color:var(--typo-body-text-color,#3d3a36)!important;font-family:var(--typo-body-text-font)!important;font-size:var(--typo-body-text-size)!important;line-height:var(--typo-body-text-line-height)!important;letter-spacing:var(--typo-body-text-letter-spacing)!important;text-shadow:none!important;}`;
  const creamTitleGold = `${sel(
    " .home-am-on-cream-title",
    " .home-am-on-cream-title *",
  )}{color:#b69f64!important;-webkit-text-fill-color:#b69f64!important;text-shadow:none!important;filter:none!important;}`;
  const goldInk = `${sel(
    " .home-am-video__caption .typo-on-images-title",
    " .home-am-video__caption .typo-on-images-title *",
    " .home-am-video__caption .typo-on-images-body",
    " .home-am-video__caption .typo-on-images-body *",
    " .home-am-slider__caption .typo-on-images-title",
    " .home-am-slider__caption .typo-on-images-title *",
    " .home-am-slider__caption .typo-on-images-indication",
    " .home-am-slider__caption .typo-on-images-indication *",
    " .home-am-slider__caption .typo-on-images-body",
    " .home-am-slider__caption .typo-on-images-body *",
    " .home-am-opening__caption .home-am-opening__title",
    " .home-am-opening__caption .home-am-opening__title *",
    " .home-am-opening__right-inner .typo-on-images-body",
    " .home-am-opening__right-inner .typo-on-images-body *",
    " .home-am-opening__caption-text",
    " .home-am-opening__caption-text *",
  )}{color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;}`;
  return [
    roleCss(sel(" .typo-on-images-title", " .typo-on-images-title *"), settings.title),
    roleCss(
      sel(" .typo-on-images-indication", " .typo-on-images-indication *"),
      settings.indication,
    ),
    roleCss(sel(" .typo-on-images-body", " .typo-on-images-body *"), settings.body),
    creamInk,
    creamTitleGold,
    goldInk,
  ].join("");
}
