import { z } from "zod";
import {
  hathorFontStackForAdmin,
  typographyTextStyleSchema,
  type TypographyTextStyle,
} from "@/lib/typography-settings-shared";

export const suitesTypographySchema = z.object({
  display: typographyTextStyleSchema,
  secondary: typographyTextStyleSchema,
  body: typographyTextStyleSchema,
});

export type SuitesTypography = z.infer<typeof suitesTypographySchema>;

/** Defaults match the live Suites clone: Bitho display, Rollgates body, Hathor gold. */
export const DEFAULT_SUITES_TYPOGRAPHY: SuitesTypography = {
  display: {
    fontFamily: "Bitho Luxury",
    fontSize: 88,
    color: "#B69F64",
    lineHeight: 0.95,
    letterSpacing: -0.4,
    innerShadow: false,
  },
  secondary: {
    fontFamily: "Bitho Luxury",
    fontSize: 42,
    color: "#B69F64",
    lineHeight: 1,
    letterSpacing: -0.2,
    innerShadow: false,
  },
  body: {
    fontFamily: "Rollgates Luxury Italic",
    fontSize: 18,
    color: "#B69F64",
    lineHeight: 1.45,
    letterSpacing: 0,
    innerShadow: false,
  },
};

export const DEFAULT_SUITES_TYPOGRAPHY_PHONE: SuitesTypography = {
  display: { ...DEFAULT_SUITES_TYPOGRAPHY.display, fontSize: 52 },
  secondary: { ...DEFAULT_SUITES_TYPOGRAPHY.secondary, fontSize: 28 },
  body: { ...DEFAULT_SUITES_TYPOGRAPHY.body, fontSize: 16 },
};

const DISPLAY_SELECTORS = [
  ".t-titulo-xxl",
  ".t-supertitulo",
  ".t-supertitulo-l",
  ".t-supertitulo-xl",
  ".mod-scroll__intro__title",
  ".mod-scroll__text__title__line",
  ".last-item__content__title .line",
  ".anima__title",
  ".mod-title--lines .line",
].join(",");

const DISPLAY_COLOR_SELECTORS = [
  DISPLAY_SELECTORS,
  ".logo__normal",
  ".logo__boring",
].join(",");

const SECONDARY_SELECTORS = [
  ".mod-scroll__terms__term__title",
  ".mod-scroll__terms__term__title__color",
  ".mod-scroll__projects__item__text__title",
  ".header__menu__media__title",
  ".mod-footer__content__project__name",
  ".t-titulo",
  ".t-titulo-l",
  ".mod-scroll__projects__section",
  ".header__menu__nav-single__proyectos__item .title",
].join(",");

const BODY_SELECTORS = [
  "p",
  ".mod-scroll__intro__text p",
  ".mod-scroll__text__text p",
  ".mod-scroll__images-text__text p",
  ".mod-scroll__terms__term__text__single",
  ".mod-scroll__projects__text",
  ".mod-scroll__projects__item__text__data",
  ".place",
  ".btn__text",
].join(",");

function roleCss(
  selector: string,
  style: TypographyTextStyle,
  defaults: TypographyTextStyle,
  withSize: boolean,
) {
  const fontStack = hathorFontStackForAdmin(style.fontFamily);
  const shadow = style.innerShadow
    ? "1px 1px 0 rgba(0,0,0,.35), -0.5px -0.5px 0 rgba(255,255,255,.25)"
    : "none";
  const extras: string[] = [];
  if (withSize && style.fontSize !== defaults.fontSize) {
    extras.push(`font-size:${style.fontSize}px!important`);
  }
  if (style.lineHeight !== defaults.lineHeight) {
    extras.push(`line-height:${style.lineHeight}!important`);
  }
  if (style.letterSpacing !== defaults.letterSpacing) {
    extras.push(`letter-spacing:${style.letterSpacing}px!important`);
  }
  return `${selector}{font-family:${fontStack}!important;${extras.length ? `${extras.join(";")};` : ""}color:${style.color}!important;-webkit-text-fill-color:${style.color}!important;text-shadow:${shadow}!important;}`;
}

/**
 * Keep italic display faces fully visible. SplitText / overflow:clip was
 * shaving letter corners without changing layout or scroll choreography.
 */
export const SUITES_CLIP_FIX_CSS = `
.mod-scroll__intro__title,
.mod-scroll__text__title,
.mod-scroll__text__title__line,
.mod-scroll__terms__term__title,
.mod-scroll__projects__item__text__title,
.last-item__content__title,
.last-item__content__title .line,
.anima__title,
.anima__title .line,
.mod-title--lines .line,
.t-titulo-xxl,
.t-supertitulo,
.t-supertitulo-l,
.t-supertitulo-xl,
.logo__normal,
.logo__boring {
  overflow: visible !important;
  padding-inline: 0.08em 0.28em;
  padding-block: 0.06em 0.16em;
}
`;

export function suitesTypographyToCss(
  settings: SuitesTypography,
  defaults: SuitesTypography = DEFAULT_SUITES_TYPOGRAPHY,
) {
  return [
    roleCss(DISPLAY_SELECTORS, settings.display, defaults.display, true),
    roleCss(DISPLAY_COLOR_SELECTORS, settings.display, defaults.display, false),
    roleCss(SECONDARY_SELECTORS, settings.secondary, defaults.secondary, true),
    roleCss(BODY_SELECTORS, settings.body, defaults.body, true),
  ].join("");
}
