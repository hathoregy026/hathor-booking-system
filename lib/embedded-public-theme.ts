export const EMBEDDED_PUBLIC_THEME_CSS = `
html[data-public-theme="night"] {
  color-scheme: dark;
  --c-beige-background: #0f0d0a !important;
  --c-beige-background-rgb: 15, 13, 10 !important;
  --c-beige: #17130f !important;
  --c-beige-rgb: 23, 19, 15 !important;
  --c-dark-green: #f4eddf !important;
  --c-dark-green-rgb: 244, 237, 223 !important;
  --c-green: #c9ad72 !important;
  --c-green-rgb: 201, 173, 114 !important;
  --c-light-green: #ddc78f !important;
  --c-light-green-rgb: 221, 199, 143 !important;
  --c-dark-blue: #d2c7b5 !important;
  --c-dark-blue-rgb: 210, 199, 181 !important;
  --c-blue: #c9ad72 !important;
  --c-blue-rgb: 201, 173, 114 !important;
  --c-light-blue: #211b14 !important;
  --c-light-blue-rgb: 33, 27, 20 !important;
}

/*
 * Phone/tablet Suites CSS (suites-mobile-design) paints with --sm-* tokens on
 * html body. Those stay day-ink (#14120e) unless remapped here at a higher
 * specificity, which is what left "WHERE EVERY NILE HORIZON" and
 * "YOUR NILE RESIDENCE AWAITS" as black type on the night canvas.
 */
html[data-public-theme="night"] body {
  --sm-paper: #0f0d0a !important;
  --sm-ivory: #17130f !important;
  --sm-sand: #1c1712 !important;
  --sm-stone: #241d15 !important;
  --sm-gold: #c9ad72 !important;
  --sm-ink-surface: #0b0907 !important;
  --sm-text: #f4eddf !important;
  --sm-text-soft: #d2c7b5 !important;
  --sm-on-ink: #f4eddf !important;
  --sm-on-ink-soft: rgb(244 237 223 / 0.74) !important;
  --sm-on-gold: #f4eddf !important;
  --sm-on-gold-soft: #d2c7b5 !important;
  --sm-label: #c9ad72 !important;
  --sm-hair: rgb(244 237 223 / 0.16) !important;
  --sm-cream-edge: #f4eddf !important;
}

html[data-public-theme="night"],
html[data-public-theme="night"] body,
html[data-public-theme="night"] main,
html[data-public-theme="night"] .page-content-wrapper,
html[data-public-theme="night"] .mod-scroll,
html[data-public-theme="night"] .mod-scroll__content {
  background-color: #0f0d0a !important;
  color: #d2c7b5 !important;
}

html[data-public-theme="night"] :is(
    .ui-light,
    .ui-light-background,
    .ui-light.ui-background,
    .mod-scroll__section,
    .mod-scroll__intro,
    .mod-scroll__text
  ) {
  background-color: #17130f !important;
  color: #d2c7b5 !important;
}

html[data-public-theme="night"] :is(
    .ui-dark,
    .ui-dark-background,
    .ui-dark.ui-background
  ) {
  background-color: #0b0907 !important;
  color: #f4eddf !important;
}

html[data-public-theme="night"] :is(h1, h2, h3, h4, .logo__boring) {
  color: #f4eddf !important;
  -webkit-text-fill-color: #f4eddf !important;
}

html[data-public-theme="night"] :is(
    p,
    li,
    .mod-scroll__intro__text,
    .mod-scroll__text__text,
    .mod-scroll__intro__copyright,
    .mod-footer__footer__copyright
  ) {
  color: #d2c7b5 !important;
  -webkit-text-fill-color: #d2c7b5 !important;
}

html[data-public-theme="night"] :is(a, button) {
  border-color: rgb(201 173 114 / 38%) !important;
}

html[data-public-theme="night"] :is(a, button):focus-visible {
  outline-color: #c9ad72 !important;
}

/*
 * The /suites clone paints its scene rhythm with .bg-white / .bg-beige /
 * .bg-red / .bg-blue, and SUITES_DNA_COLOR_CSS pins each one to a day literal
 * at "html body main .bg-x" — specificity (0,1,3). Only .bg-white was ever
 * re-grounded, so eleven cream panels and three gold ones stayed lit while the
 * rest of the route went dark. The attribute selector lifts these to (0,2,3) /
 * (0,3,3) so they settle above the DNA sheet without it being rewritten.
 *
 * The ladder mirrors the site elevation ladder: beige is the second surface,
 * red the third, and the gold scene becomes the same deep bronze the
 * gastronomy gold scenes use, so the two routes read as one system.
 */
html[data-public-theme="night"] body main .bg-beige {
  background-color: #1c1712 !important;
  color: #d2c7b5 !important;
}

html[data-public-theme="night"] body main .bg-red {
  background-color: #241d15 !important;
  color: #d2c7b5 !important;
}

html[data-public-theme="night"] body main .bg-blue,
html[data-public-theme="night"] body main .before-bg-blue::before {
  background-color: #2a2116 !important;
}

/*
 * Text on the re-grounded scenes.
 *
 * SUITES_DNA_COLOR_CSS pins ink per wall at "html body main :is(.bg-white,
 * .bg-beige, .bg-red) :is(...)" — (0,2,3) with !important. Re-grounding those
 * walls without re-pointing their ink leaves #14120e headings on a #17130f
 * panel at 1.01:1, which is what a scroll-through of the clone turned up after
 * the backgrounds alone were fixed. .bg-white is included here for that exact
 * reason; .bg-blue needs its own colour too, because the DNA sheet sets ink on
 * the wall element itself and not only on its children.
 */
html[data-public-theme="night"] body main :is(.bg-white, .bg-beige, .bg-red, .bg-blue),
html[data-public-theme="night"] body main :is(.bg-white, .bg-beige, .bg-red, .bg-blue) :is(
    .mod-scroll__intro__title,
    .mod-scroll__text__title__line,
    .mod-scroll__projects__item__text__title,
    .last-item__content__title .line,
    .anima__title,
    .mod-title--lines .line,
    h1,
    h2,
    h3,
    .logo__normal,
    .logo__boring,
    .reg
  ) {
  color: #f4eddf !important;
  -webkit-text-fill-color: #f4eddf !important;
}

html[data-public-theme="night"] body main :is(.bg-white, .bg-beige, .bg-red, .bg-blue) :is(
    div,
    span,
    p,
    a,
    strong,
    em,
    li,
    .mod-scroll__intro__text,
    .mod-scroll__text__text,
    .mod-scroll__projects__text,
    .last-item__content__text,
    .mod-content__text
  ),
html[data-public-theme="night"] body main .mod-scroll__terms,
html[data-public-theme="night"] body main .mod-scroll__terms :is(div, span, p, a, strong, em) {
  color: #d2c7b5 !important;
  -webkit-text-fill-color: #d2c7b5 !important;
}

html[data-public-theme="night"] body main :is(.bg-white, .bg-beige, .bg-red, .bg-blue) :is(
    .mod-scroll__section,
    .mod-scroll__intro__copyright,
    .mod-footer__footer__copyright
  ) {
  color: #c9ad72 !important;
  -webkit-text-fill-color: #c9ad72 !important;
}

/* Two panels the DNA sheet grounds outside the .bg-* roster. */
html[data-public-theme="night"] body main .mod-scroll__images.principal,
html[data-public-theme="night"] body main .mod-scroll__images.bg-white {
  background-color: #17130f !important;
}

/* The hero action bar is a translucent paper sheet over the collage. */
html[data-public-theme="night"] .srh-actions {
  background-color: rgb(25 21 16 / 0.86) !important;
}

html[data-public-theme="night"] .mod-scroll__projects__item[data-suite-panel="cream"] {
  --suite-panel: #191510;
  --suite-panel-fg: #e9e1d3;
}
html[data-public-theme="night"] .mod-scroll__projects__item[data-suite-panel="ivory"] {
  --suite-panel: #1c1712;
  --suite-panel-fg: #e9e1d3;
}
html[data-public-theme="night"] .mod-scroll__projects__item[data-suite-panel="gold"] {
  --suite-panel: #2a2116;
  --suite-panel-fg: #e9e1d3;
}
html[data-public-theme="night"] .mod-scroll__projects__item[data-suite-panel="ink"] {
  --suite-panel: #241d15;
  --suite-panel-fg: #e9e1d3;
}

/* Hero art frames carry a sand placeholder that shows through while the
   collage decodes, and behind any image with transparency. */
html[data-public-theme="night"] .srh-frame {
  background: #1c1712 !important;
}

/* The phone-only footer injected into the clone paints its own cream ground
   at "html body .hathor-lux-footer-host", so night needs the attribute to
   out-specify it. */
html[data-public-theme="night"] body .hathor-lux-footer-host {
  background: #0f0d0a !important;
}

/* The marquee rail's inner strip keeps a beige fill that no stylesheet
   selector names (it is written at runtime), so it survived the .bg-beige
   remap above and sat as a light band with light type on it, at 1.14:1.
   Matched to the rail it runs inside. */
html[data-public-theme="night"] .mod-scroll__carousel__content {
  background-color: #1c1712 !important;
}

/* The closing panel of the cabin strip is excluded from the [data-suite-panel]
   background rule (it is .last-item), and the clone paints its inner sheet
   "background: white" at main .mod-scroll__projects .last-item__content. It sits
   inside an ink panel, so in night it read as a full white card mid-strip. */
html[data-public-theme="night"] main .mod-scroll__projects .last-item__content {
  background: #191510 !important;
}

html[data-public-theme="night"] main .mod-scroll__projects .last-item__content,
html[data-public-theme="night"] main .mod-scroll__projects .last-item__content :is(
    div,
    span,
    p,
    a,
    strong,
    em,
    .line,
    .char
  ) {
  color: #e9e1d3 !important;
  -webkit-text-fill-color: #e9e1d3 !important;
}

/*
 * Display titles, SplitText lines, and the hardcoded #hathor-suites-typography
 * sheet all pin #14120E (often via -webkit-text-fill-color) without a .bg-*
 * ancestor. Night must beat those descendants or the glyph stays ink on the
 * remapped dark wall.
 */
html[data-public-theme="night"] body,
html[data-public-theme="night"] body :where(p, li, strong, em) {
  color: #d2c7b5 !important;
  -webkit-text-fill-color: #d2c7b5 !important;
}

html[data-public-theme="night"] body :is(
    .t-supertitulo,
    .t-supertitulo-l,
    .t-supertitulo-xl,
    .t-titulo-xxl,
    .mod-scroll__intro__title,
    .mod-scroll__carousel__text,
    .mod-scroll__text__title,
    .mod-scroll__text__title__line,
    .mod-scroll__terms__term__title,
    .mod-scroll__projects__item__text__title,
    .last-item__content__title,
    .last-item__content__title .line,
    .anima__title,
    .mod-title--lines .line,
    .mod-scroll__projects__text,
    .logo__normal,
    .logo__boring
  ),
html[data-public-theme="night"] body :is(
    .t-supertitulo,
    .t-supertitulo-l,
    .t-supertitulo-xl,
    .t-titulo-xxl,
    .mod-scroll__intro__title,
    .mod-scroll__text__title__line,
    .mod-scroll__terms__term__title,
    .mod-scroll__projects__item__text__title,
    .last-item__content__title,
    .anima__title,
    .mod-title--lines .line,
    .mod-scroll__projects__text
  ) :is(.line, .char, span, div) {
  color: #f4eddf !important;
  -webkit-text-fill-color: #f4eddf !important;
}

html[data-public-theme="night"] body :is(
    .mod-scroll__section,
    .last-item__content__section,
    .mod-scroll__intro__copyright,
    .mod-footer__footer__copyright,
    .mod-title--chapter .mod-title__intro > div
  ) {
  color: #c9ad72 !important;
  -webkit-text-fill-color: #c9ad72 !important;
}

html[data-public-theme="night"] body main .mod-content--cols .mod-content__text,
html[data-public-theme="night"] body main .mod-content--cols .mod-content__text p,
html[data-public-theme="night"] body main .mod-content--cols .mod-content__text a {
  color: #d2c7b5 !important;
  -webkit-text-fill-color: #d2c7b5 !important;
}

html[data-public-theme="night"] body main .mod-footer__content__project__year,
html[data-public-theme="night"] body main .mod-footer__content__project__name,
html[data-public-theme="night"] body main .mod-footer__content__project__text,
html[data-public-theme="night"] body main .mod-footer__content__project__text * {
  color: #e9e1d3 !important;
  -webkit-text-fill-color: #e9e1d3 !important;
}

html[data-public-theme="night"] body main .suites-collection-rail
  .mod-scroll__projects__item[data-suite-panel="ivory"]
  .mod-scroll__projects__item__text,
html[data-public-theme="night"] body main .suites-collection-rail
  .mod-scroll__projects__item[data-suite-panel="ivory"]
  .mod-scroll__projects__item__text :is(div, span, a, p, h3, strong, em, .line, .char) {
  color: #e9e1d3 !important;
  -webkit-text-fill-color: #e9e1d3 !important;
}

/* Cream glass pills over the hero collage keep dark type — light on light. */
html[data-public-theme="night"] .srh-actions a:not(.srh-actions__primary) {
  color: #17140f !important;
  -webkit-text-fill-color: #17140f !important;
}
`;
