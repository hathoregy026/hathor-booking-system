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
`;
