import { prisma } from "@/lib/prisma";
import { withDb } from "@/lib/db-safe";
import { HATHOR_FONT_STACKS } from "@/lib/typography-settings-shared";
import {
  DEFAULT_AMENITIES_TYPOGRAPHY,
  amenitiesTypographySchema,
  parseAmenitiesTypography,
  type AmenitiesTextStyle,
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
  const settings = amenitiesTypographySchema.parse(
    parseAmenitiesTypography(value),
  );
  /* Guarantee dual colours are always stored (never legacy-only payloads). */
  const persisted: AmenitiesTypography = {
    ...settings,
    title: {
      ...settings.title,
      color: settings.title.colorOnBg,
      colorOnImage: settings.title.colorOnImage,
      colorOnBg: settings.title.colorOnBg,
    },
    indication: {
      ...settings.indication,
      color: settings.indication.colorOnBg,
      colorOnImage: settings.indication.colorOnImage,
      colorOnBg: settings.indication.colorOnBg,
    },
    body: {
      ...settings.body,
      color: settings.body.colorOnBg,
      colorOnImage: settings.body.colorOnImage,
      colorOnBg: settings.body.colorOnBg,
    },
  };
  const key = phone
    ? AMENITIES_TYPOGRAPHY_MOBILE_KEY
    : AMENITIES_TYPOGRAPHY_KEY;
  await withDb(() =>
    prisma.siteSetting.upsert({
      where: { key },
      create: { key, value: JSON.stringify(persisted) },
      update: { value: JSON.stringify(persisted) },
    }),
  );
  return persisted;
}

/** Shared metrics (no colour) — colour is applied per surface below. */
function roleMetricsCss(selector: string, style: AmenitiesTextStyle) {
  const fontStack = HATHOR_FONT_STACKS[style.fontFamily].replace(
    /var\([^)]*\),?\s*/g,
    "",
  );
  return `${selector}{font-family:${fontStack}!important;font-size:${style.fontSize}px!important;line-height:${style.lineHeight}!important;letter-spacing:${style.letterSpacing}px!important;${style.innerShadow ? "text-shadow:1px 1px 0 rgba(0,0,0,.35),-.5px -.5px 0 rgba(255,255,255,.25)!important;" : ""}}`;
}

function roleColorCss(selector: string, color: string) {
  return `${selector}{color:${color}!important;-webkit-text-fill-color:${color}!important;}`;
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

  const gapTitleSub = settings.spacing.titleToIndication;
  const gapSubBody = settings.spacing.indicationToBody;
  const gapBodyCta = settings.spacing.bodyToCta;
  const L = settings.layout;
  const { title, indication, body } = settings;

  const spacingVars = `${sel("")}{--am-typo-gap-title-sub:${gapTitleSub}px;--am-typo-gap-sub-body:${gapSubBody}px;--am-typo-gap-body-cta:${gapBodyCta}px;--am-typo-align:${L.align};--am-typo-title-x:${L.titleX}px;--am-typo-title-y:${L.titleY}px;--am-typo-indication-x:${L.indicationX}px;--am-typo-indication-y:${L.indicationY}px;--am-typo-body-x:${L.bodyX}px;--am-typo-body-y:${L.bodyY}px;--am-typo-title-on-image:${title.colorOnImage};--am-typo-title-on-bg:${title.colorOnBg};--am-typo-indication-on-image:${indication.colorOnImage};--am-typo-indication-on-bg:${indication.colorOnBg};--am-typo-body-on-image:${body.colorOnImage};--am-typo-body-on-bg:${body.colorOnBg};}`;

  const spacingRules = [
    `${sel(" .home-am-slider__caption")}{gap:0!important;text-align:var(--am-typo-align,left)!important;}`,
    `${sel(
      " .home-am-nature__caption",
      " .home-am-opening__caption",
    )}{text-align:var(--am-typo-align,left)!important;}`,
    `${sel(
      " .typo-on-images-title",
      " .home-am-nature__title",
      " .home-am-opening__title",
    )}{position:relative!important;left:var(--am-typo-title-x,0px)!important;top:var(--am-typo-title-y,0px)!important;z-index:1!important;margin-top:0!important;margin-bottom:var(--am-typo-gap-title-sub)!important;}`,
    `${sel(
      " .typo-on-images-indication",
      " .home-am-nature__indication",
    )}{position:relative!important;left:var(--am-typo-indication-x,0px)!important;top:var(--am-typo-indication-y,0px)!important;z-index:3!important;margin-top:0!important;margin-bottom:var(--am-typo-gap-sub-body)!important;}`,
    `${sel(
      " .typo-on-images-body",
      " .home-am-nature__body",
    )}{position:relative!important;left:var(--am-typo-body-x,0px)!important;top:var(--am-typo-body-y,0px)!important;z-index:2!important;margin-top:0!important;margin-bottom:var(--am-typo-gap-body-cta)!important;}`,
    `${sel(
      " .home-am-opening__cta",
      " .home-am-nature__cta",
    )}{margin-top:0!important;}`,
  ].join("");

  /* ——— Metrics for every amenities text role ——— */
  const titleMetrics = roleMetricsCss(
    sel(
      " .typo-on-images-title",
      " .typo-on-images-title *",
      " .home-am-nature__title",
      " .home-am-nature__title *",
      " .home-am-opening__title",
      " .home-am-opening__title *",
      " .home-am-on-cream-title",
      " .home-am-on-cream-title *",
      " .home-am-intro__title",
      " .home-am-intro__title *",
    ),
    title,
  );
  const indicationMetrics = roleMetricsCss(
    sel(
      " .typo-on-images-indication",
      " .typo-on-images-indication *",
      " .home-am-nature__indication",
      " .home-am-nature__indication *",
      " .home-am-intro__indication",
      " .home-am-intro__indication *",
      " .home-am-opening__list-item-text",
      " .home-am-opening__list-item-text *",
    ),
    indication,
  );
  const bodyMetrics = roleMetricsCss(
    sel(
      " .typo-on-images-body",
      " .typo-on-images-body *",
      " .home-am-nature__body",
      " .home-am-nature__body *",
      " .home-am-opening__caption-text",
      " .home-am-opening__caption-text *",
      " .home-am-intro__cream-text",
      " .home-am-intro__cream-text *",
      " .home-am-video__title-body",
      " .home-am-video__title-body *",
      " .home-am-intro__cream .typo-body-text",
      " .home-am-intro__cream .typo-body-text *",
    ),
    body,
  );

  /*
   * Base colour = on-background for ALL role text (nothing left unstyled).
   * On-image overrides follow with higher-specificity / later rules.
   */
  const baseColors = [
    roleColorCss(
      sel(
        " .typo-on-images-title",
        " .typo-on-images-title *",
        " .home-am-nature__title",
        " .home-am-nature__title *",
        " .home-am-opening__title",
        " .home-am-opening__title *",
        " .home-am-on-cream-title",
        " .home-am-on-cream-title *",
        " .home-am-intro__title",
        " .home-am-intro__title *",
      ),
      title.colorOnBg,
    ),
    roleColorCss(
      sel(
        " .typo-on-images-indication",
        " .typo-on-images-indication *",
        " .home-am-nature__indication",
        " .home-am-nature__indication *",
        " .home-am-intro__indication",
        " .home-am-intro__indication *",
        " .home-am-opening__list-item-text",
        " .home-am-opening__list-item-text *",
      ),
      indication.colorOnBg,
    ),
    roleColorCss(
      sel(
        " .typo-on-images-body",
        " .typo-on-images-body *",
        " .home-am-nature__body",
        " .home-am-nature__body *",
        " .home-am-opening__caption-text",
        " .home-am-opening__caption-text *",
        " .home-am-intro__cream-text",
        " .home-am-intro__cream-text *",
        " .home-am-video__title-body",
        " .home-am-video__title-body *",
        " .home-am-intro__cream .typo-body-text",
        " .home-am-intro__cream .typo-body-text *",
        " .home-am-video__caption-text",
        " .home-am-video__caption-text *",
      ),
      body.colorOnBg,
    ),
  ].join("");

  /* Photo overlays — win over base (on-bg) colour */
  const onImageColors = [
    roleColorCss(
      sel(
        " .home-am-on-image-text.typo-on-images-title",
        " .home-am-on-image-text.typo-on-images-title *",
        " .home-am-on-image-text.home-am-intro__title",
        " .home-am-on-image-text.home-am-intro__title *",
        " .home-am-intro__caption .home-am-intro__title",
        " .home-am-intro__caption .home-am-intro__title *",
        " .home-am-opening__caption .home-am-opening__title",
        " .home-am-opening__caption .home-am-opening__title *",
        " .home-am-opening__title.home-am-on-image-text",
        " .home-am-opening__title.home-am-on-image-text *",
      ),
      title.colorOnImage,
    ),
    roleColorCss(
      sel(
        " .home-am-on-image-text.typo-on-images-indication",
        " .home-am-on-image-text.typo-on-images-indication *",
        " .home-am-intro__caption .home-am-intro__indication",
        " .home-am-intro__caption .home-am-intro__indication *",
        " .home-am-opening__list-item-text",
        " .home-am-opening__list-item-text *",
      ),
      indication.colorOnImage,
    ),
    roleColorCss(
      sel(
        " .home-am-on-image-text.typo-on-images-body",
        " .home-am-on-image-text.typo-on-images-body *",
      ),
      body.colorOnImage,
    ),
  ].join("");

  /* Explicit on-bg reinforcement (gold / cream panels) — after base, before image */
  const onBgColors = [
    roleColorCss(
      sel(
        " .home-am-slider__caption .typo-on-images-title",
        " .home-am-slider__caption .typo-on-images-title *",
        " .home-am-video__caption .typo-on-images-title",
        " .home-am-video__caption .typo-on-images-title *",
        " .home-am-opening__rail-copy .typo-on-images-title",
        " .home-am-opening__rail-copy .typo-on-images-title *",
        " .home-am-nature__gold-band .home-am-nature__title",
        " .home-am-nature__gold-band .home-am-nature__title *",
        " .home-am-nature__title",
        " .home-am-nature__title *",
        " .home-am-on-cream-title",
        " .home-am-on-cream-title *",
        " .home-am-video__title .home-am-on-cream-title",
        " .home-am-video__title .home-am-on-cream-title *",
      ),
      title.colorOnBg,
    ),
    roleColorCss(
      sel(
        " .home-am-slider__caption .typo-on-images-indication",
        " .home-am-slider__caption .typo-on-images-indication *",
        " .home-am-nature__gold-band .home-am-nature__indication",
        " .home-am-nature__gold-band .home-am-nature__indication *",
        " .home-am-nature__indication",
        " .home-am-nature__indication *",
      ),
      indication.colorOnBg,
    ),
    roleColorCss(
      sel(
        " .home-am-slider__caption .typo-on-images-body",
        " .home-am-slider__caption .typo-on-images-body *",
        " .home-am-video__caption .typo-on-images-body",
        " .home-am-video__caption .typo-on-images-body *",
        " .home-am-opening__rail-copy .typo-on-images-body",
        " .home-am-opening__rail-copy .typo-on-images-body *",
        " .home-am-opening__right-inner .typo-on-images-body",
        " .home-am-opening__right-inner .typo-on-images-body *",
        " .home-am-opening__caption-text",
        " .home-am-opening__caption-text *",
        " .home-am-nature__gold-band .home-am-nature__body",
        " .home-am-nature__gold-band .home-am-nature__body *",
        " .home-am-nature__body",
        " .home-am-nature__body *",
        " .home-am-intro__cream .typo-body-text",
        " .home-am-intro__cream .typo-body-text *",
        " .home-am-intro__cream-text",
        " .home-am-intro__cream-text *",
        " .home-am-video__title-body",
        " .home-am-video__title-body *",
        " .home-am-video__caption-text",
        " .home-am-video__caption-text *",
      ),
      body.colorOnBg,
    ),
  ].join("");

  return [
    spacingVars,
    titleMetrics,
    indicationMetrics,
    bodyMetrics,
    baseColors,
    onBgColors,
    onImageColors,
    spacingRules,
  ].join("");
}
