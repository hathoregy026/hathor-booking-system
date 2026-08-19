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

/** PANORAMIC / PRIVATE / TIMELESS slide.
 *  Source clone uses black + invert + mix-blend difference, which turns
 *  any light type navy on the gold panel. Kill both, paint white, fit 100vh. */
export const SUITES_TERMS_STAGE_CSS = `
html body main .mod-scroll__terms {
  isolation: isolate !important;
  mix-blend-mode: normal !important;
  filter: none !important;
}
html body main .mod-scroll__terms,
html body main .mod-scroll__terms :is(
  .mod-scroll__terms__term__title,
  .mod-scroll__terms__term__title *,
  .mod-scroll__terms__term__num,
  .mod-scroll__terms__term__text,
  .mod-scroll__terms__term__text *,
  .t-supertitulo-l,
  .t-supertitulo-l *
) {
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
  mix-blend-mode: normal !important;
  filter: none !important;
}
html body main .mod-scroll__terms :is(
  .mod-scroll__terms__term__title,
  .mod-scroll__terms__term__title *,
  .t-supertitulo-l,
  .t-supertitulo-l *
) {
  transform: none !important;
}
@media (min-width: 951px) {
  html body main .mod-scroll > .mod-scroll__terms,
  html body main .mod-scroll__terms {
    height: 100svh !important;
    max-height: 100svh !important;
    box-sizing: border-box !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    padding-top: 9svh !important;
    padding-bottom: 3.5svh !important;
    overflow: hidden !important;
  }
  html body main .mod-scroll__terms .mod-scroll__terms__term__title,
  html body main .mod-scroll__terms .mod-scroll__terms__term__title.t-supertitulo-l,
  html body main .mod-scroll__terms .t-supertitulo-l,
  html body main .mod-scroll__terms .mod-scroll__terms__term:last-of-type .lh-less2 {
    font-size: min(8.6svh, 6.4vw) !important;
    line-height: 0.8 !important;
  }
}
@media (min-width: 481px) and (max-width: 950px) {
  html body main .mod-scroll__terms .mod-scroll__terms__term__title,
  html body main .mod-scroll__terms .t-supertitulo-l {
    font-size: min(7.2svh, 8vw) !important;
    line-height: 0.84 !important;
  }
}
@media (max-width: 480px) {
  html body main .mod-scroll__terms .mod-scroll__terms__term__title,
  html body main .mod-scroll__terms .t-supertitulo-l {
    font-size: min(9.4vw, 2.8rem) !important;
    line-height: 0.9 !important;
    transform: none !important;
  }
}
`;

/**
 * Moving suite-collection panels: cycle the 4 Suites page colours so two
 * adjacent cards never share a fill. Ink/ivory type for WCAG-clear contrast.
 * Cream #ece8df · Ink #1c1917 · Gold #b69f64 · Ivory #faf8f5
 */
export const SUITES_COLLECTION_PANEL_TONES = [
  "cream",
  "ink",
  "gold",
  "ivory",
  "ink",
] as const;

export const SUITES_COLLECTION_PANEL_CSS = `
.mod-scroll__projects__item[data-suite-panel="cream"] {
  --suite-panel: #ece8df;
  --suite-panel-fg: #1c1917;
}
.mod-scroll__projects__item[data-suite-panel="ivory"] {
  --suite-panel: #faf8f5;
  --suite-panel-fg: #1c1917;
}
.mod-scroll__projects__item[data-suite-panel="gold"] {
  --suite-panel: #b69f64;
  --suite-panel-fg: #1c1917;
}
.mod-scroll__projects__item[data-suite-panel="ink"] {
  --suite-panel: #1c1917;
  --suite-panel-fg: #faf8f5;
}
.mod-scroll__projects__item[data-suite-panel]:not(.last-item) {
  background: var(--suite-panel) !important;
  box-shadow: 0 -1px 0 var(--suite-panel) !important;
}
.mod-scroll__projects__item[data-suite-panel]:not(.last-item) .mod-scroll__projects__item__text,
.mod-scroll__projects__item.last-item[data-suite-panel] .mod-scroll__projects__item__text {
  background: var(--suite-panel) !important;
}
.mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text,
.mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text :is(div, span, a, p, h3, strong, em) {
  color: var(--suite-panel-fg) !important;
  -webkit-text-fill-color: var(--suite-panel-fg) !important;
}
.mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text :is(.btn--bg, .btn--circle) {
  border-color: var(--suite-panel-fg) !important;
  color: var(--suite-panel-fg) !important;
  -webkit-text-fill-color: var(--suite-panel-fg) !important;
  background: transparent !important;
}
.mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text .btn--bg::before {
  background: var(--suite-panel-fg) !important;
}
.mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text :is(.btn--bg, .btn--circle):hover,
.mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text :is(.btn--bg, .btn--circle):focus-visible {
  background: var(--suite-panel-fg) !important;
  color: var(--suite-panel) !important;
  -webkit-text-fill-color: var(--suite-panel) !important;
  border-color: var(--suite-panel-fg) !important;
}
.mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text :is(.btn--bg, .btn--circle):hover :where(span, div),
.mod-scroll__projects__item[data-suite-panel] .mod-scroll__projects__item__text :is(.btn--bg, .btn--circle):focus-visible :where(span, div) {
  color: var(--suite-panel) !important;
  -webkit-text-fill-color: var(--suite-panel) !important;
}
`;

/** Preserve the reference site's text boxes so SplitText measures and clips
 * against the same geometry as the original scroll choreography. */
export const SUITES_CLIP_FIX_CSS = `
.mod-scroll__intro__title,
.mod-scroll__text__title,
.mod-scroll__text__title__line,
.mod-scroll__terms__term__title,
.mod-scroll__projects__item__text__title,
.last-item__content__title,
.anima__title,
.t-titulo-xxl,
.t-supertitulo,
.t-supertitulo-l,
.t-supertitulo-xl,
.logo__normal,
.logo__boring {
  overflow: visible !important;
  padding: 0 !important;
}
.last-item__content__title .line,
.anima__title .line {
  overflow: clip !important;
  padding: 0 !important;
}
.mod-title--lines .line {
  overflow: hidden !important;
  padding: 0 !important;
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
