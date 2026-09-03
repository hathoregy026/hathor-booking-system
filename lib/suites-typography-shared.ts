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

/** Suites follows the About / Contact editorial hierarchy: Italiana display and Rollgates support copy. */
export const DEFAULT_SUITES_TYPOGRAPHY: SuitesTypography = {
  display: {
    fontFamily: "Italiana",
    fontSize: 74,
    color: "#14120E",
    lineHeight: 0.88,
    letterSpacing: -0.25,
    innerShadow: false,
  },
  secondary: {
    fontFamily: "Italiana",
    fontSize: 48,
    color: "#14120E",
    lineHeight: 0.9,
    letterSpacing: -0.15,
    innerShadow: false,
  },
  body: {
    fontFamily: "Rollgates Luxury Italic",
    fontSize: 18,
    color: "#4A453C",
    lineHeight: 1.55,
    letterSpacing: 0,
    innerShadow: false,
  },
};

export const DEFAULT_SUITES_TYPOGRAPHY_PHONE: SuitesTypography = {
  display: { ...DEFAULT_SUITES_TYPOGRAPHY.display, fontSize: 50 },
  secondary: { ...DEFAULT_SUITES_TYPOGRAPHY.secondary, fontSize: 34 },
  body: { ...DEFAULT_SUITES_TYPOGRAPHY.body, fontSize: 15 },
};

const DISPLAY_SELECTORS = [
  ".t-titulo-xxl",
  ".t-supertitulo",
  ".t-supertitulo-l",
  ".t-supertitulo-xl",
].join(",");

const DISPLAY_COLOR_SELECTORS = [
  DISPLAY_SELECTORS,
  ".mod-scroll__intro__title",
  ".mod-scroll__text__title__line",
  ".last-item__content__title .line",
  ".anima__title",
  ".mod-title--lines .line",
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

const BODY_SIZE_SELECTORS = [
  ".mod-scroll__projects__text",
  ".mod-scroll__projects__item__text__data",
  ".mod-scroll__terms__term__text__single",
  ".place",
  ".btn__text",
].join(",");

/** Color + face on supporting copy and SplitText editorial paragraphs (not px size). */
const BODY_COLOR_SELECTORS = [
  BODY_SIZE_SELECTORS,
  ".mod-scroll__intro__text p",
  ".mod-scroll__text__text p",
  ".mod-scroll__images-text__text p",
].join(",");

/**
 * SplitText measures line breaks at load. CMS body px overrides on these blocks
 * shrink/garble the split wrappers — keep their native clone scale instead.
 */
export const SUITES_SPLITTEXT_TYPE_GUARD_CSS = `
main .mod-scroll__images-text__text,
main .mod-scroll__images-text__text > p {
  font-size: var(--titulo-xl) !important;
  line-height: var(--titulo-xl-lh) !important;
  letter-spacing: normal !important;
}
main .mod-scroll__intro__text,
main .mod-scroll__intro__text > p {
  font-size: var(--parrafo) !important;
  line-height: var(--parrafo-lh) !important;
  letter-spacing: normal !important;
}
main .mod-scroll__text__text,
main .mod-scroll__text__text > p {
  font-size: var(--parrafo) !important;
  line-height: var(--parrafo-lh) !important;
  letter-spacing: normal !important;
}
`;

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
@media (min-width: 1025px) {
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
@media (min-width: 481px) and (max-width: 1024px) {
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

/**
 * Phone and tablet art direction for the embedded Suites experience.
 * The original desktop horizontal choreography remains untouched above 1024px;
 * these rules only give its existing SplitText, flip, parallax, and marquee
 * animations a more deliberate vertical stage on touch-sized viewports.
 */
export const SUITES_RESPONSIVE_CHOREOGRAPHY_CSS = `
@media (max-width: 1024px) {
  html,
  body,
  main,
  .mod-scroll {
    max-width: 100% !important;
    overflow-x: clip !important;
  }

  main :is(.btn, .btn--bg, .btn--circle) {
    min-height: 44px !important;
  }

  html body main :is(.bg-black, .bg-grey) :is(
    .mod-scroll__images-text__text,
    .mod-scroll__images-text__text p,
    .mod-scroll__images-text__text .line,
    .mod-scroll__images-text__text span
  ) {
    color: #f3ede4 !important;
    -webkit-text-fill-color: #f3ede4 !important;
  }

  main .mod-scroll__carousel,
  main .mod-scroll__carousel__content {
    overflow: hidden !important;
  }

  main .mod-scroll__cierre {
    width: 100% !important;
    max-width: 100vw !important;
    overflow: hidden !important;
  }

  main .mod-scroll__cierre__content {
    height: auto !important;
    width: 100% !important;
    padding: clamp(3.5rem, 7svh, 5.5rem) 0 !important;
  }

  main .mod-scroll__cierre__content__image,
  main .mod-scroll__cierre__content__image :is(.media, .media__wrap-source, .media__source) {
    width: min(92vw, 46rem) !important;
    max-width: 92vw !important;
    transform: none !important;
    clip-path: none !important;
  }
}

@media (min-width: 481px) and (max-width: 1024px) {
  html {
    --wrapper-padd: clamp(1.5rem, 4vw, 2.5rem);
    --grid-gap: clamp(0.8rem, 2vw, 1.25rem);
  }

  main .mod-scroll__intro,
  main .mod-scroll__intro .wrapper {
    min-height: 100svh !important;
  }

  main .mod-scroll__intro .wrapper {
    padding: clamp(6.5rem, 12svh, 9rem) var(--wrapper-padd) 5rem !important;
  }

  main .mod-scroll__intro__content {
    width: min(100%, 48rem) !important;
    gap: clamp(1.5rem, 3vw, 2.5rem) !important;
  }

  main .mod-scroll__intro__wrap-titles {
    grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr) !important;
    column-gap: clamp(1rem, 3vw, 2.25rem) !important;
  }

  main .mod-scroll__intro__text,
  main .mod-scroll__intro__text p {
    width: min(100%, 30rem) !important;
    max-width: 30rem !important;
  }

  main .mod-scroll__images.principal {
    min-height: 78svh !important;
    padding-bottom: 5.5rem !important;
  }

  main .mod-scroll__images__image-single,
  main .mod-scroll__images.principal .flipMedia:nth-of-type(1),
  main .mod-scroll__images__image-single :is(.media__wrap-source, .media__source) {
    width: 100% !important;
    height: 72svh !important;
    min-height: 34rem !important;
    aspect-ratio: auto !important;
  }

  main .mod-scroll__images.principal .flipMedia:nth-of-type(2) {
    left: auto !important;
    right: var(--wrapper-padd) !important;
    bottom: 1.75rem !important;
    width: min(48vw, 23rem) !important;
    transform: none !important;
    border: 4px solid #f3ede4 !important;
    box-shadow: 0 1.5rem 4rem rgba(20, 18, 14, 0.22) !important;
  }

  main .mod-scroll__text {
    padding: clamp(5rem, 9svh, 7.5rem) var(--wrapper-padd) !important;
  }

  main .mod-scroll__text__title {
    margin-bottom: clamp(2.5rem, 5vw, 4rem) !important;
  }

  main .mod-scroll__images-text {
    padding-block: clamp(5rem, 9svh, 7rem) !important;
  }

  main .mod-scroll__images-text .flipMedia:nth-of-type(1) {
    width: min(78vw, 39rem) !important;
  }

  main .mod-scroll__images-text .flipMedia:nth-of-type(2) {
    width: min(48vw, 23rem) !important;
    margin: -5rem 0 0 auto !important;
  }

  main .mod-scroll__images-text__text {
    width: min(92%, 44rem) !important;
    padding: clamp(3rem, 6vw, 5rem) 0 0 !important;
  }

  main .mod-scroll__terms {
    min-height: 100svh !important;
    padding: clamp(5.5rem, 9svh, 8rem) var(--wrapper-padd) !important;
    gap: 0 !important;
  }

  main .mod-scroll__terms__term {
    flex: 1 1 0 !important;
    min-height: 12rem !important;
    padding: clamp(1.5rem, 3vw, 2.25rem) 0 !important;
    border-top: 1px solid rgba(255, 255, 255, 0.34) !important;
  }

  main .mod-scroll__terms__term:last-of-type {
    border-bottom: 1px solid rgba(255, 255, 255, 0.34) !important;
  }

  main .mod-scroll__terms__term__text {
    width: min(100%, 31rem) !important;
    margin-left: clamp(1.5rem, 6vw, 4.5rem) !important;
  }

  main .mod-scroll__projects__item__content {
    min-height: auto !important;
    height: auto !important;
  }

  main .mod-scroll__projects__item:not(.last-item) .mod-scroll__projects__item__content {
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
  }

  main .mod-scroll__projects__item__image,
  main .mod-scroll__projects__item__image .media__wrap-source,
  main .mod-scroll__projects__item__image .media__source {
    height: min(56svh, 28rem);
  }

  main .mod-scroll__projects__item__text {
    min-height: 0 !important;
    height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 1rem !important;
    padding: 1.75rem var(--wrapper-padd) 2.75rem !important;
  }

  main .mod-scroll__projects__item__text__data {
    position: relative !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
    width: 100% !important;
    height: auto !important;
    gap: 0.5rem 1rem !important;
  }

  main .mod-scroll__projects__item__text__data > * {
    position: relative !important;
    top: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
  }

  main .mod-scroll__projects__item__text__data > *:nth-child(1) {
    justify-self: start !important;
  }

  main .mod-scroll__projects__item__text__data > *:nth-child(2) {
    justify-self: end !important;
  }

  main .mod-scroll__projects__item__text__data > *:nth-child(4),
  main .mod-scroll__projects__item__text__data > span {
    grid-column: 1 / -1 !important;
    justify-self: center !important;
  }

  main .mod-scroll__projects__item__text__title {
    max-width: calc(100% - 2rem) !important;
    white-space: normal !important;
    text-align: center !important;
    font-size: clamp(2.7rem, 5.4vw, 3.8rem) !important;
    line-height: 0.9 !important;
  }

  main .mod-scroll__projects__item__text__title .line {
    white-space: normal !important;
  }

  main .mod-scroll__cierre__content__image {
    width: min(86vw, 42rem) !important;
  }

  main .anima__title,
  main .mod-scroll__projects .last-item__content__title .line {
    max-width: 100% !important;
    white-space: normal !important;
    overflow: visible !important;
    font-size: clamp(3.1rem, 6.6vw, 5rem) !important;
    line-height: 0.9 !important;
  }
}

@media (min-width: 481px) and (max-width: 1024px) and (max-height: 820px) {
  main .mod-scroll__images.principal {
    min-height: 68svh !important;
    padding-bottom: 4rem !important;
  }

  main .mod-scroll__images__image-single,
  main .mod-scroll__images.principal .flipMedia:nth-of-type(1),
  main .mod-scroll__images__image-single :is(.media__wrap-source, .media__source) {
    height: 62svh !important;
    min-height: 24rem !important;
  }

  main .mod-scroll__terms {
    min-height: auto !important;
    padding: clamp(3.5rem, 6svh, 5.5rem) var(--wrapper-padd) !important;
  }

  main .mod-scroll__terms__term {
    min-height: 0 !important;
    padding: 1.25rem 0 !important;
  }

  main .mod-scroll__text,
  main .mod-scroll__images-text {
    padding-block: clamp(3.5rem, 6svh, 5.5rem) !important;
  }
}

@media (max-width: 480px) {
  html {
    --wrapper-padd: max(1rem, env(safe-area-inset-left));
    --grid-gap: 0.75rem;
  }

  main .mod-scroll__intro:not(.suites-reference-hero) {
    isolation: isolate !important;
    min-height: max(100svh, 42rem) !important;
    background:
      radial-gradient(circle at 86% 18%, rgba(182, 159, 100, 0.16), transparent 34%),
      #f3ede4 !important;
  }

  main .mod-scroll__intro:not(.suites-reference-hero)::after {
    content: "";
    position: absolute;
    top: 6.5rem;
    right: -19vw;
    z-index: 0;
    width: 58vw;
    aspect-ratio: 1;
    border: 1px solid rgba(182, 159, 100, 0.36);
    border-radius: 50%;
    pointer-events: none;
  }

  main .mod-scroll__intro:not(.suites-reference-hero) .wrapper {
    z-index: 1 !important;
    min-height: max(100svh, 42rem) !important;
    padding: 7.75rem var(--wrapper-padd) 4.5rem !important;
  }

  main .mod-scroll__intro:not(.suites-reference-hero) .mod-scroll__intro__content {
    width: 100% !important;
    transform: translateY(-1.5svh) !important;
    gap: clamp(1.4rem, 5vw, 2rem) !important;
  }

  main .mod-scroll__intro__wrap-titles {
    grid-template-columns: minmax(0, 1.13fr) minmax(0, 0.87fr) !important;
    column-gap: 0.45rem !important;
    row-gap: 0.2rem !important;
  }

  main .mod-scroll__intro__title {
    font-size: clamp(2.65rem, 11.8vw, 3.25rem) !important;
    line-height: 0.9 !important;
  }

  main .mod-scroll__intro__title:nth-child(2) {
    text-align: right !important;
  }

  main .mod-scroll__intro__title:nth-child(3) {
    grid-column: 1 / -1 !important;
    width: 78% !important;
  }

  main .mod-scroll__intro__text,
  main .mod-scroll__intro__text p {
    width: min(78vw, 19rem) !important;
    max-width: min(78vw, 19rem) !important;
    margin-left: auto !important;
    text-align: left !important;
    font-size: 0.97rem !important;
    line-height: 1.48 !important;
  }

  main .mod-scroll__intro__copyright {
    bottom: max(1rem, env(safe-area-inset-bottom)) !important;
  }

  main .mod-scroll__images.principal {
    min-height: 86svh !important;
    padding-bottom: 6.5rem !important;
  }

  main .mod-scroll__images__image-single,
  main .mod-scroll__images.principal .flipMedia:nth-of-type(1),
  main .mod-scroll__images__image-single :is(.media__wrap-source, .media__source) {
    width: 100% !important;
    height: 76svh !important;
    min-height: 32rem !important;
    aspect-ratio: auto !important;
  }

  main .mod-scroll__images.principal .flipMedia:nth-of-type(2) {
    inset: auto var(--wrapper-padd) 1.6rem auto !important;
    width: min(68vw, 18rem) !important;
    height: 38svh !important;
    transform: none !important;
    border: 3px solid #f3ede4 !important;
    box-shadow: 0 1.25rem 3.5rem rgba(20, 18, 14, 0.28) !important;
  }

  main .mod-scroll__images.principal .flipMedia:nth-of-type(2) :is(.media, .media__wrap-source, .media__source) {
    height: 100% !important;
  }

  main .mod-scroll__text {
    padding: 6rem var(--wrapper-padd) 5.25rem !important;
  }

  main .mod-scroll__text__section {
    margin-bottom: 2rem !important;
    text-align: left !important;
  }

  main .mod-scroll__text__title {
    margin-bottom: 2.75rem !important;
  }

  main .mod-scroll__text__title__line {
    font-size: clamp(2.7rem, 13vw, 3.55rem) !important;
    line-height: 0.9 !important;
  }

  main .mod-scroll__images-text {
    padding-block: 5rem 5.5rem !important;
  }

  main .mod-scroll__images-text .wrapper {
    padding-inline: var(--wrapper-padd) !important;
  }

  main .mod-scroll__images-text .flipMedia:nth-of-type(1) {
    width: 88vw !important;
  }

  main .mod-scroll__images-text .flipMedia:nth-of-type(2) {
    width: 58vw !important;
    margin: -4.5rem 0 0 auto !important;
  }

  main .mod-scroll__images-text__text {
    width: 100% !important;
    padding: 3.75rem 0 0 !important;
  }

  main .mod-scroll__carousel,
  main .mod-scroll__carousel__content {
    height: 5.25rem !important;
  }

  main .mod-scroll__carousel__content {
    font-size: 3.15rem !important;
  }

  main .mod-scroll__images.secundario {
    min-height: 82svh !important;
    padding-bottom: 6rem !important;
  }

  main .mod-scroll__images.secundario .flipMedia:nth-of-type(1) {
    height: 70svh !important;
    aspect-ratio: auto !important;
  }

  main .mod-scroll__images.secundario .flipMedia:nth-of-type(1) :is(.media, .media__wrap-source, .media__source) {
    height: 100% !important;
  }

  main .mod-scroll__images.secundario .flipMedia:nth-of-type(2) {
    inset: auto auto 1.5rem var(--wrapper-padd) !important;
    width: 62vw !important;
    height: 34svh !important;
    transform: none !important;
    border: 3px solid #ded4c6 !important;
    box-shadow: 0 1.25rem 3.5rem rgba(20, 18, 14, 0.24) !important;
  }

  main .mod-scroll__images.secundario .flipMedia:nth-of-type(2) :is(.media, .media__wrap-source, .media__source) {
    height: 100% !important;
  }

  main .mod-scroll__terms {
    min-height: auto !important;
    padding: 0 !important;
    gap: 0 !important;
  }

  main .mod-scroll__terms__term {
    min-height: 0 !important;
    padding: 4.25rem var(--wrapper-padd) 3rem !important;
    justify-content: flex-end !important;
    border-top: 1px solid rgba(255, 255, 255, 0.34) !important;
  }

  main .mod-scroll__terms__term:last-of-type {
    border-bottom: 1px solid rgba(255, 255, 255, 0.34) !important;
  }

  main .mod-scroll__terms__term__wrap-title {
    gap: 0.65rem !important;
  }

  main .mod-scroll__terms__term__title,
  main .mod-scroll__terms .t-supertitulo-l {
    width: auto !important;
    font-size: clamp(2.55rem, 12.6vw, 3.35rem) !important;
    line-height: 0.88 !important;
  }

  main .mod-scroll__terms__term__text.d-none.d-md-block {
    display: block !important;
  }

  main .mod-scroll__terms__term__text-group {
    display: none !important;
  }

  main .mod-scroll__terms__term__text {
    width: min(100%, 19rem) !important;
    margin: 1.5rem 0 0 1.7rem !important;
    font-size: 0.95rem !important;
    line-height: 1.55 !important;
  }

  main .mod-scroll__terms .follow__mouse {
    position: relative !important;
    display: grid !important;
    grid-template-columns: 1.16fr 0.84fr !important;
    width: 100% !important;
    aspect-ratio: auto !important;
    opacity: 1 !important;
    transform: none !important;
    overflow: hidden !important;
  }

  main .mod-scroll__terms .follow__mouse > img {
    position: relative !important;
    inset: auto !important;
    display: block !important;
    width: 100% !important;
    height: 44svh !important;
    opacity: 1 !important;
    transform: none !important;
    clip-path: none !important;
    object-fit: cover !important;
  }

  main .mod-scroll__terms .follow__mouse > img:first-child {
    grid-row: span 2 !important;
    height: 88svh !important;
  }

  main .mod-scroll__projects__item__content {
    min-height: auto !important;
    height: auto !important;
  }

  main .mod-scroll__projects__item:not(.last-item) .mod-scroll__projects__item__content {
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
  }

  main .mod-scroll__projects__item__image,
  main .mod-scroll__projects__item__image .media__wrap-source,
  main .mod-scroll__projects__item__image .media__source {
    height: min(52svh, 22rem);
  }

  main .mod-scroll__projects__item__text {
    min-height: 0 !important;
    height: auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: flex-start !important;
    gap: 0.65rem !important;
    padding: 1.15rem var(--wrapper-padd) 1.85rem !important;
    --margin: 0.85rem !important;
  }

  main .mod-scroll__projects__item__text__data {
    position: relative !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) !important;
    align-items: center !important;
    width: 100% !important;
    height: auto !important;
    gap: 0.35rem 0.75rem !important;
    order: 1 !important;
  }

  main .mod-scroll__projects__item__text__data > * {
    position: relative !important;
    top: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    inset: auto !important;
  }

  main .mod-scroll__projects__item__text__data > *:nth-child(1) {
    justify-self: start !important;
    text-align: left !important;
  }

  main .mod-scroll__projects__item__text__data > *:nth-child(2) {
    justify-self: end !important;
    text-align: right !important;
  }

  main .mod-scroll__projects__item__text__data > *:nth-child(3) {
    display: none !important;
  }

  main .mod-scroll__projects__item__text__data > *:nth-child(4),
  main .mod-scroll__projects__item__text__data > span {
    grid-column: 1 / -1 !important;
    justify-self: center !important;
    order: 3 !important;
    width: auto !important;
    margin-top: 0.15rem !important;
  }

  main .mod-scroll__projects__item__text__title {
    order: 2 !important;
    position: relative !important;
    z-index: 2 !important;
    max-width: calc(100% - 1.5rem) !important;
    margin: 0.15rem 0 0.35rem !important;
    white-space: normal !important;
    text-align: center !important;
    font-size: clamp(2.2rem, 10.2vw, 2.85rem) !important;
    line-height: 0.9 !important;
    letter-spacing: -0.035em !important;
  }

  main .mod-scroll__projects__item__text__title .line {
    display: block !important;
    white-space: normal !important;
  }

  main .mod-scroll__projects .last-item__carousel__item {
    height: 44svh !important;
  }

  main .mod-scroll__projects .last-item__carousel__item__image .media__source {
    height: 44svh !important;
  }

  main .mod-scroll__projects .last-item__content {
    overflow: visible !important;
  }

  main .mod-scroll__projects .last-item__content__wrap {
    padding: 4.5rem var(--wrapper-padd) 3.25rem !important;
    overflow: visible !important;
  }

  main .mod-scroll__projects .last-item__content__title {
    margin-bottom: 1.5rem !important;
    overflow: visible !important;
  }

  main .mod-scroll__cierre {
    overflow: visible !important;
  }

  main .mod-scroll__cierre__content {
    padding: 2.75rem 0 3.25rem !important;
    overflow: visible !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 1.5rem !important;
  }

  main .mod-scroll__cierre__content__image {
    width: calc(100% - 1.2rem) !important;
    max-width: none !important;
    order: 1 !important;
  }

  main .mod-scroll__cierre .anima__title,
  main .mod-scroll__cierre .anima__title .line,
  main .mod-scroll__projects .last-item__content__title,
  main .mod-scroll__projects .last-item__content__title .line {
    max-width: 100% !important;
    overflow: visible !important;
    white-space: normal !important;
    text-align: center !important;
    font-size: clamp(1.95rem, 9vw, 2.7rem) !important;
    line-height: 0.96 !important;
    padding-block: 0.15em !important;
  }

  main .mod-scroll__cierre .anima__title {
    order: 2 !important;
    position: relative !important;
    width: min(100%, 20rem) !important;
    margin: 0 auto !important;
  }

  main .mod-title--chapter,
  main .mod-title--lines {
    padding-inline: var(--wrapper-padd) !important;
    overflow: visible !important;
  }

  main .mod-title .anima__title,
  main .mod-title .anima__title .line,
  main .mod-title--lines .line {
    max-width: 100% !important;
    overflow: visible !important;
    white-space: normal !important;
    text-align: center !important;
    font-size: clamp(1.95rem, 9vw, 2.7rem) !important;
    line-height: 0.96 !important;
    padding-block: 0.12em !important;
  }
}

@media (max-width: 1024px) and (prefers-reduced-motion: reduce) {
  main .mod-scroll__carousel__content span {
    animation-play-state: paused !important;
  }
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
    roleCss(BODY_COLOR_SELECTORS, settings.body, defaults.body, false),
    roleCss(BODY_SIZE_SELECTORS, settings.body, defaults.body, true),
  ].join("");
}
