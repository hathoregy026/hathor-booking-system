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

/** Styles scoped to the homepage amenities sequence only. */
export function amenitiesTypographyToCss(settings: AmenitiesTypography) {
  const root =
    ".public-site .home-am-sequence,html[data-ex-experience] .ex-root .home-am-sequence";
  /* Cream panel body uses site body_text; gold panels use white for contrast. */
  const creamInk = `${root} .home-am-intro__cream .typo-body-text,${root} .home-am-intro__cream .typo-body-text *,${root} .home-am-video__title-body,${root} .home-am-video__title-body *{color:var(--typo-body-text-color,#3d3a36)!important;-webkit-text-fill-color:var(--typo-body-text-color,#3d3a36)!important;font-family:var(--typo-body-text-font)!important;font-size:var(--typo-body-text-size)!important;line-height:var(--typo-body-text-line-height)!important;letter-spacing:var(--typo-body-text-letter-spacing)!important;text-shadow:none!important;}`;
  const creamTitleGold = `${root} .home-am-on-cream-title,${root} .home-am-on-cream-title *{color:#b69f64!important;-webkit-text-fill-color:#b69f64!important;text-shadow:none!important;filter:none!important;}`;
  const goldInk = `${root} .home-am-video__caption .typo-on-images-title,${root} .home-am-video__caption .typo-on-images-title *,${root} .home-am-video__caption .typo-on-images-body,${root} .home-am-video__caption .typo-on-images-body *,${root} .home-am-slider__caption .typo-on-images-title,${root} .home-am-slider__caption .typo-on-images-title *,${root} .home-am-slider__caption .typo-on-images-indication,${root} .home-am-slider__caption .typo-on-images-indication *,${root} .home-am-slider__caption .typo-on-images-body,${root} .home-am-slider__caption .typo-on-images-body *,${root} .home-am-opening__caption .home-am-opening__title,${root} .home-am-opening__caption .home-am-opening__title *,${root} .home-am-opening__right-inner .typo-on-images-body,${root} .home-am-opening__right-inner .typo-on-images-body *,${root} .home-am-opening__caption-text,${root} .home-am-opening__caption-text *{color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;}`;
  return [
    roleCss(
      `${root} .typo-on-images-title,${root} .typo-on-images-title *`,
      settings.title,
    ),
    roleCss(
      `${root} .typo-on-images-indication,${root} .typo-on-images-indication *`,
      settings.indication,
    ),
    roleCss(
      `${root} .typo-on-images-body,${root} .typo-on-images-body *`,
      settings.body,
    ),
    creamInk,
    creamTitleGold,
    goldInk,
  ].join("");
}
