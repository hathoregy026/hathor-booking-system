import { prisma } from "@/lib/prisma";
import { withDb } from "@/lib/db-safe";
import { hathorFontStackForAdmin } from "@/lib/typography-settings-shared";
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

function persistRole(style: AmenitiesTextStyle): AmenitiesTextStyle {
  return {
    ...style,
    color: style.colorOnGold,
    colorOnImage: style.colorOnImage,
    colorOnGold: style.colorOnGold,
    colorOnCream: style.colorOnCream,
    colorOnBg: style.colorOnGold,
  };
}

export async function getAmenitiesTypography(phone = false) {
  const key = phone
    ? AMENITIES_TYPOGRAPHY_MOBILE_KEY
    : AMENITIES_TYPOGRAPHY_KEY;
  const row = await withDb(() =>
    prisma.siteSetting.findUnique({ where: { key } }),
  );
  if (!row?.value) {
    /*
     * Missing phone row must NOT fall back to package defaults — that media
     * query would wipe desktop hex colours below 767px.
     */
    if (phone) return getAmenitiesTypography(false);
    return DEFAULT_AMENITIES_TYPOGRAPHY;
  }
  try {
    return parseAmenitiesTypography(JSON.parse(row.value));
  } catch {
    if (phone) return getAmenitiesTypography(false);
    return DEFAULT_AMENITIES_TYPOGRAPHY;
  }
}

export async function saveAmenitiesTypography(value: unknown, phone = false) {
  const settings = amenitiesTypographySchema.parse(
    parseAmenitiesTypography(value),
  );
  /* Guarantee three surface colours are always stored. */
  const persisted: AmenitiesTypography = {
    ...settings,
    title: persistRole(settings.title),
    indication: persistRole(settings.indication),
    body: persistRole(settings.body),
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
  const fontStack = hathorFontStackForAdmin(style.fontFamily);
  return `${selector}{font-family:${fontStack}!important;font-size:${style.fontSize}px!important;line-height:${style.lineHeight}!important;letter-spacing:${style.letterSpacing}px!important;${style.innerShadow ? "text-shadow:1px 1px 0 rgba(0,0,0,.35),-.5px -.5px 0 rgba(255,255,255,.25)!important;" : ""}}`;
}

function roleColorCss(selector: string, color: string) {
  /* Kill metallic/clip fills from Site Typography so the hex always shows. */
  return `${selector}{color:${color}!important;-webkit-text-fill-color:${color}!important;background:none!important;background-image:none!important;-webkit-background-clip:border-box!important;background-clip:border-box!important;}`;
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

  const spacingVars = `${sel("")}{--am-typo-gap-title-sub:${gapTitleSub}px;--am-typo-gap-sub-body:${gapSubBody}px;--am-typo-gap-body-cta:${gapBodyCta}px;--am-typo-align:${L.align};--am-typo-title-x:${L.titleX}px;--am-typo-title-y:${L.titleY}px;--am-typo-indication-x:${L.indicationX}px;--am-typo-indication-y:${L.indicationY}px;--am-typo-body-x:${L.bodyX}px;--am-typo-body-y:${L.bodyY}px;--am-typo-title-on-image:${title.colorOnImage};--am-typo-title-on-gold:${title.colorOnGold};--am-typo-title-on-cream:${title.colorOnCream};--am-typo-title-on-bg:${title.colorOnGold};--am-typo-indication-on-image:${indication.colorOnImage};--am-typo-indication-on-gold:${indication.colorOnGold};--am-typo-indication-on-cream:${indication.colorOnCream};--am-typo-indication-on-bg:${indication.colorOnGold};--am-typo-body-on-image:${body.colorOnImage};--am-typo-body-on-gold:${body.colorOnGold};--am-typo-body-on-cream:${body.colorOnCream};--am-typo-body-on-bg:${body.colorOnGold};}`;

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
      " .typo-on-images-body:not(.home-am-opening__list-item-text)",
      " .home-am-nature__body",
    )}{position:relative!important;left:var(--am-typo-body-x,0px)!important;top:var(--am-typo-body-y,0px)!important;z-index:2!important;margin-top:0!important;margin-bottom:var(--am-typo-gap-body-cta)!important;}`,
    /* Opening card labels stay absolute overlays — never inherit body layout offsets. */
    `${sel(
      " .home-am-opening__list-item-text",
      " .home-am-opening__list-item-text.typo-on-images-body",
    )}{position:absolute!important;left:20px!important;right:auto!important;top:auto!important;bottom:20px!important;z-index:1!important;margin:0!important;transform:none!important;}`,
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
      " .home-am-intro__cream-title",
      " .home-am-intro__cream-title *",
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
      " .home-am-intro__cream-indication",
      " .home-am-intro__cream-indication *",
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

  /* Base = gold-panel colour (most gold captions use typo-on-images-* bare). */
  const baseColors = [
    roleColorCss(
      sel(
        " .typo-on-images-title",
        " .typo-on-images-title *",
        " .home-am-nature__title",
        " .home-am-nature__title *",
        " .home-am-opening__title",
        " .home-am-opening__title *",
        " .home-am-intro__title",
        " .home-am-intro__title *",
      ),
      title.colorOnGold,
    ),
    roleColorCss(
      sel(
        " .typo-on-images-indication",
        " .typo-on-images-indication *",
        " .home-am-nature__indication",
        " .home-am-nature__indication *",
        " .home-am-intro__indication",
        " .home-am-intro__indication *",
      ),
      indication.colorOnGold,
    ),
    roleColorCss(
      sel(
        " .typo-on-images-body",
        " .typo-on-images-body *",
        " .home-am-nature__body",
        " .home-am-nature__body *",
        " .home-am-video__caption-text",
        " .home-am-video__caption-text *",
      ),
      body.colorOnGold,
    ),
  ].join("");

  /* Gold panels — slider / video caption / opening rail / nature band */
  const onGoldColors = [
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
      ),
      title.colorOnGold,
    ),
    roleColorCss(
      sel(
        " .home-am-slider__caption .typo-on-images-indication",
        " .home-am-slider__caption .typo-on-images-indication *",
        " .home-am-video__caption .typo-on-images-indication",
        " .home-am-video__caption .typo-on-images-indication *",
        " .home-am-opening__rail-copy .typo-on-images-indication",
        " .home-am-opening__rail-copy .typo-on-images-indication *",
        " .home-am-nature__gold-band .home-am-nature__indication",
        " .home-am-nature__gold-band .home-am-nature__indication *",
        " .home-am-nature__indication",
        " .home-am-nature__indication *",
      ),
      indication.colorOnGold,
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
        " .home-am-nature__gold-band .home-am-nature__body",
        " .home-am-nature__gold-band .home-am-nature__body *",
        " .home-am-nature__body",
        " .home-am-nature__body *",
        " .home-am-video__caption-text",
        " .home-am-video__caption-text *",
      ),
      body.colorOnGold,
    ),
  ].join("");

  /* Cream panels — intro cream wipe, video cream title stack */
  const onCreamColors = [
    roleColorCss(
      sel(
        " .home-am-on-cream-title",
        " .home-am-on-cream-title *",
        " .home-am-video__title .home-am-on-cream-title",
        " .home-am-video__title .home-am-on-cream-title *",
        " .home-am-intro__cream .typo-on-images-title",
        " .home-am-intro__cream .typo-on-images-title *",
      ),
      title.colorOnCream,
    ),
    roleColorCss(
      sel(
        " .home-am-intro__cream .typo-on-images-indication",
        " .home-am-intro__cream .typo-on-images-indication *",
        " .home-am-video__title .typo-on-images-indication",
        " .home-am-video__title .typo-on-images-indication *",
      ),
      indication.colorOnCream,
    ),
    roleColorCss(
      sel(
        " .home-am-intro__cream .typo-body-text",
        " .home-am-intro__cream .typo-body-text *",
        " .home-am-intro__cream-text",
        " .home-am-intro__cream-text *",
        " .home-am-video__title-body",
        " .home-am-video__title-body *",
        " .home-am-opening__caption-text",
        " .home-am-opening__caption-text *",
      ),
      body.colorOnCream,
    ),
  ].join("");

  /* Photo overlays — win last */
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
        " .home-am-video__overlay-title",
        " .home-am-video__overlay-title *",
      ),
      title.colorOnImage,
    ),
    roleColorCss(
      sel(
        " .home-am-on-image-text.typo-on-images-indication",
        " .home-am-on-image-text.typo-on-images-indication *",
        " .home-am-intro__caption .home-am-intro__indication",
        " .home-am-intro__caption .home-am-intro__indication *",
        " .home-am-video__overlay-sub",
        " .home-am-video__overlay-sub *",
      ),
      indication.colorOnImage,
    ),
    roleColorCss(
      sel(
        " .home-am-on-image-text.typo-on-images-body",
        " .home-am-on-image-text.typo-on-images-body *",
        " .home-am-intro__body",
        " .home-am-intro__body *",
        " .home-am-opening__list-item-text",
        " .home-am-opening__list-item-text *",
      ),
      body.colorOnImage,
    ),
  ].join("");

  return [
    spacingVars,
    titleMetrics,
    indicationMetrics,
    bodyMetrics,
    baseColors,
    onGoldColors,
    onCreamColors,
    onImageColors,
    spacingRules,
  ].join("");
}
