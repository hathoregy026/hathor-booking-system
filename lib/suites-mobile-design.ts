/**
 * /suites on phones and tablets (<= 1024px).
 *
 * The clone ships a pinned horizontal story for desktop. Below 1025px it falls
 * back to a vertical document whose GSAP triggers are measured before the
 * collage settles, so titles, the mosaic and the closing panels stayed parked
 * in their hidden start states. This sheet replaces every earlier phone/tablet
 * layer with one composition in the desktop DNA:
 *
 *   paper / sand / stone / gold / ink scenes · Italiana uppercase display ·
 *   Piloner Thin tracked labels · Rollgates italic support copy · pill actions ·
 *   hero keeps the arch + cream-edged detail card; every later plate is square ·
 *   desktop slide rhythm as snap rails · gold gutters between photographs.
 *
 * Scroll motion is one quiet reveal driven by layoutSuitesMobileScenes(), which
 * observes the clone's own scroller (#smooth-wrapper). Without that script, or
 * with reduced motion, everything is simply visible.
 *
 * Every rule is inside a max-width: 1024px query. Desktop is untouched.
 */

const DISPLAY = `
  font-family: "Italiana", "Gamgote", Georgia, serif !important;
  font-style: normal !important;
  font-weight: 400 !important;
  text-transform: uppercase !important;
  text-shadow: none !important;
`;

const LABEL = `
  font-family: "Piloner Thin", "Plus Jakarta Sans", sans-serif !important;
  font-style: normal !important;
  font-weight: 100 !important;
  font-size: 0.6875rem !important;
  line-height: 1.3 !important;
  letter-spacing: 0.22em !important;
  text-transform: uppercase !important;
  color: var(--sm-label) !important;
  -webkit-text-fill-color: var(--sm-label) !important;
`;

const COPY = `
  font-family: "Rollgates Luxury Italic", "Playfair Display Italic", Georgia, serif !important;
  font-style: italic !important;
  font-weight: 400 !important;
  letter-spacing: 0.015em !important;
  text-transform: none !important;
`;

const PILL = `
  box-sizing: border-box !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  height: 2.85rem !important;
  min-height: 2.75rem !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 1.25rem !important;
  border: 1px solid currentColor !important;
  border-radius: 999px !important;
  font-family: "Piloner Semibold", "Plus Jakarta Sans", sans-serif !important;
  font-size: 0.68rem !important;
  font-style: normal !important;
  font-weight: 600 !important;
  line-height: 1 !important;
  letter-spacing: 0.16em !important;
  text-transform: uppercase !important;
  text-align: center !important;
  text-decoration: none !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  aspect-ratio: auto !important;
`;

/* ------------------------------------------------------------------------ */
/* Tokens, forced end states, frames, reveal                                 */
/* ------------------------------------------------------------------------ */
const SM_BASE_CSS = `
@media (max-width: 1024px) {
  html body {
    --sm-paper: #f3ede4;
    --sm-ivory: #faf8f5;
    --sm-sand: #ded4c6;
    --sm-stone: #cfc7ba;
    --sm-gold: #b69f64;
    --sm-ink-surface: #14120e;
    --sm-text: #14120e;
    --sm-text-soft: #4a453c;
    --sm-on-ink: #f3ede4;
    --sm-on-ink-soft: rgb(243 237 228 / 0.74);
    --sm-on-gold: #14120e;
    --sm-on-gold-soft: rgb(20 18 14 / 0.8);
    --sm-label: #806b35;
    --sm-hair: rgb(20 18 14 / 0.16);
    --sm-hair-gold: rgb(182 159 100 / 0.62);
    --sm-cream-edge: #f7f1e6;
    --sm-pad: clamp(1.25rem, 5.4vw, 2.5rem);
    --sm-gap: clamp(0.5rem, 2.2vw, 1rem);
    --sm-band: clamp(3.5rem, 15vw, 6.5rem);
    --sm-head: calc(4.75rem + env(safe-area-inset-top, 0px));
    --sm-slide: min(74vw, 22rem);
    --sm-radius: 0;
    --sm-t-hero: clamp(2.85rem, 13vw, 5.6rem);
    --sm-t-xl: clamp(2.5rem, 11.2vw, 5rem);
    --sm-t-l: clamp(2.05rem, 9vw, 4rem);
    --sm-t-m: clamp(1.7rem, 7.4vw, 3rem);
    --sm-t-lede: clamp(1.3rem, 5.6vw, 2rem);
    --sm-t-copy: clamp(1rem, 4.1vw, 1.2rem);
    --sm-ease: cubic-bezier(0.22, 0.78, 0.19, 1);
    background: var(--sm-paper) !important;
  }

  html body main {
    background: var(--sm-paper) !important;
    overflow-x: clip !important;
  }

  html #smooth-wrapper,
  html.mobile #smooth-wrapper {
    scrollbar-width: none !important;
  }

  html #smooth-wrapper::-webkit-scrollbar,
  html.mobile #smooth-wrapper::-webkit-scrollbar {
    display: none !important;
  }

  /*
   * Square plates everywhere except the Suites hero collage. Clone and
   * earlier phone layers used arches / domes on galleries and the closer.
   */
  html body main :is(
    .media,
    .flipMedia__media,
    .mod-scroll__projects__item,
    .mod-scroll__projects__item__image,
    .mod-media__item,
    .last-item__carousel__item,
    .mod-scroll__cierre__content__image
  ) {
    border-radius: 0 !important;
  }

  /*
   * SplitText / GSAP start states. The clone measures its triggers before the
   * collage settles, so on narrow screens these never reach their end frame.
   */
  html body main :is(
    .char,
    .line > span,
    .line > div,
    .cont,
    .mod-scroll__projects__item__text__data span,
    .mod-scroll__projects__item__text__data a,
    .mod-scroll__projects__item__text__title > div,
    .mod-scroll__images-text__text p > div
  ) {
    transform: none !important;
    translate: none !important;
    rotate: none !important;
    scale: none !important;
    opacity: 1 !important;
  }

  html body main :is(.line, .clip-y, .mod-scroll__text__title__line, .anima__title, .last-item__content__title) {
    overflow: visible !important;
  }

  /* Word spacers from the desktop split read as holes in a narrow column. */
  html body main :is(.cont, .line) > span:empty {
    display: none !important;
  }

  html body main .suites-slide-caption,
  html body main .mod-scroll__pin,
  html body main .follow__mouse--md {
    display: none !important;
  }

  /* One frame model: the .media box owns the crop, its picture fills it. */
  html body main :is(.mod-scroll, .mod-media) .media {
    position: relative !important;
    inset: auto !important;
    display: block !important;
    overflow: hidden !important;
    margin: 0 !important;
    clip-path: none !important;
    transform: none !important;
    opacity: 1 !important;
    border-radius: 0 !important;
    aspect-ratio: 4 / 5;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    background: rgb(20 18 14 / 0.06) !important;
  }

  html body main :is(.mod-scroll, .mod-media) .media > .media__wrap-source {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    aspect-ratio: auto !important;
    max-height: none !important;
    clip-path: none !important;
    transform: none !important;
  }

  html body main :is(.mod-scroll, .mod-media) .media .media__source {
    display: block !important;
    width: 100% !important;
    height: 100% !important;
    max-width: none !important;
    max-height: none !important;
    object-fit: cover !important;
    object-position: center !important;
    transform: none !important;
    translate: none !important;
    border-radius: 0 !important;
  }

  html body main .flipMedia {
    clip-path: none !important;
    transform: none !important;
  }

  html body main .flipMedia > .flipMedia__media {
    clip-path: none !important;
  }

  /* Section label: tracked Piloner with the gold pin used on desktop. */
  html body main :is(.mod-scroll__section, .last-item__content__section) {
    ${LABEL}
    position: relative !important;
    inset: auto !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 0.65rem !important;
    width: auto !important;
    margin: 0 0 clamp(1.1rem, 4.6vw, 1.75rem) !important;
    padding: 0 !important;
    transform: none !important;
    text-align: left !important;
  }

  html body main :is(.mod-scroll__section, .last-item__content__section)::before {
    content: "" !important;
    flex: 0 0 auto !important;
    width: 0.42rem !important;
    height: 0.42rem !important;
    border-radius: 50% !important;
    background: var(--sm-gold) !important;
  }

  /*
   * Reveal. The script only adds html.smr-on when motion is allowed, so a
   * missing script or reduced motion leaves every block in place. translate
   * is used instead of transform so no end-state rule above can cancel it.
   */
  html.smr-on body main [data-smr] {
    opacity: 0;
    translate: 0 1.35rem;
    transition:
      opacity 0.9s var(--sm-ease),
      translate 1.1s var(--sm-ease);
    transition-delay: var(--smr-delay, 0s);
    will-change: opacity, translate;
  }

  html.smr-on body main [data-smr].is-in {
    opacity: 1;
    translate: 0 0;
  }

  html.smr-on body main [data-smr="frame"] {
    opacity: 1;
    translate: 0 0;
    clip-path: inset(9% 0 0 0);
    transition: clip-path 1.25s var(--sm-ease);
  }

  html.smr-on body main [data-smr="frame"].is-in {
    clip-path: inset(0 0 0 0);
  }

  /* Rail meta: count and progress hairline under each horizontal gallery. */
  html body main .smr-rail {
    display: flex !important;
    align-items: center !important;
    gap: 1rem !important;
    box-sizing: border-box !important;
    width: 100% !important;
    margin: 0 !important;
    padding: clamp(0.9rem, 3.6vw, 1.25rem) var(--sm-pad) 0 !important;
    overflow: visible !important;
  }

  html body main .smr-rail__count {
    display: inline-flex !important;
    align-items: baseline !important;
    gap: 0.45em !important;
    flex: 0 0 auto !important;
    min-width: 4.75rem !important;
    overflow: visible !important;
    white-space: nowrap !important;
    font-family: "Plus Jakarta Sans", "Piloner Thin", sans-serif !important;
    font-style: normal !important;
    font-weight: 500 !important;
    font-size: 0.6875rem !important;
    line-height: 1 !important;
    letter-spacing: 0.16em !important;
    text-transform: uppercase !important;
    font-variant-numeric: tabular-nums !important;
    color: var(--sm-label) !important;
    -webkit-text-fill-color: var(--sm-label) !important;
  }

  html body main .smr-rail__sep {
    letter-spacing: 0 !important;
    opacity: 0.5 !important;
    transform: none !important;
  }

  html body main .smr-rail__count b {
    font-weight: 100 !important;
    color: var(--sm-text) !important;
    -webkit-text-fill-color: var(--sm-text) !important;
  }

  html body main .smr-rail__track {
    position: relative !important;
    flex: 1 1 auto !important;
    height: 1px !important;
    overflow: hidden !important;
    background: var(--sm-hair) !important;
  }

  html body main .smr-rail__track > i {
    position: absolute !important;
    inset: 0 auto 0 0 !important;
    width: 100% !important;
    background: var(--sm-gold) !important;
    transform: scaleX(var(--smr-progress, 0.25)) !important;
    transform-origin: left center !important;
    transition: transform 0.35s var(--sm-ease) !important;
  }

  html body main :is(.smr-rail-scroller) {
    scrollbar-width: none !important;
    -webkit-overflow-scrolling: touch !important;
    overscroll-behavior-x: contain !important;
    scroll-snap-type: x mandatory !important;
    scroll-snap-stop: always !important;
  }

  html body main :is(.smr-rail-scroller)::-webkit-scrollbar {
    display: none !important;
  }
}

@media (min-width: 481px) and (max-width: 1024px) {
  html body {
    --sm-slide: min(46vw, 26rem);
    --sm-pad: clamp(1.6rem, 4vw, 2.5rem);
    --sm-gap: clamp(0.65rem, 1.6vw, 1rem);
  }
}

@media (min-width: 1025px) {
  html body main .smr-rail {
    display: none !important;
  }
}
`;

/* ------------------------------------------------------------------------ */
/* 01 · Hero collage                                                          */
/* ------------------------------------------------------------------------ */
const SM_HERO_CSS = `
@media (max-width: 1024px) {
  html body main .mod-scroll__intro.suites-reference-hero {
    width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    background:
      radial-gradient(circle at 16% 4%, rgb(255 255 255 / 0.72), transparent 42%),
      var(--sm-paper) !important;
  }

  html body main .mod-scroll__intro.suites-reference-hero > .wrapper {
    width: 100% !important;
    min-width: 0 !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 0 !important;
  }

  html body main .srh-canvas {
    position: relative !important;
    display: grid !important;
    grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
    column-gap: var(--sm-gap) !important;
    row-gap: 0 !important;
    align-items: start !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    padding: calc(var(--sm-head) + clamp(1rem, 4.6vw, 2rem)) var(--sm-pad) var(--sm-band) !important;
    background: none !important;
  }

  html body main .srh-connectors {
    display: none !important;
  }

  html body main :is(.srh-kicker, .srh-frame, .srh-copy, .srh-actions) {
    position: relative !important;
    inset: auto !important;
    translate: none !important;
    width: auto !important;
    height: auto !important;
    max-width: none !important;
    margin: 0 !important;
  }

  html body main .srh-kicker {
    grid-column: 1 / -1 !important;
    grid-row: 1 !important;
    z-index: 2 !important;
    margin-bottom: clamp(1rem, 4.6vw, 1.75rem) !important;
    font-size: var(--sm-t-l) !important;
    line-height: 0.86 !important;
    letter-spacing: -0.04em !important;
    color: var(--sm-text) !important;
    -webkit-text-fill-color: var(--sm-text) !important;
  }

  /* Main plate: bleeds off the right edge, soft lower-left corner, title on it. */
  html body main .srh-frame--main {
    grid-column: 1 / -1 !important;
    grid-row: 2 !important;
    z-index: 1 !important;
    display: block !important;
    margin-right: calc(var(--sm-pad) * -1) !important;
    aspect-ratio: 4 / 5 !important;
    max-height: min(58svh, 28rem) !important;
    border-radius: 0 0 0 clamp(2rem, 11vw, 3.25rem) !important;
    overflow: hidden !important;
  }

  html body main .srh-frame img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }

  html body main .srh-frame--main img {
    object-position: 58% 50% !important;
  }

  html body main .srh-frame__wash {
    display: block !important;
    background:
      linear-gradient(180deg, rgb(20 16 10 / 0.05) 30%, rgb(20 16 10 / 0.52) 100%),
      linear-gradient(90deg, rgb(20 16 10 / 0.22), transparent 70%) !important;
  }

  html body main .srh-title {
    position: absolute !important;
    inset: auto clamp(1rem, 4vw, 1.5rem) clamp(1.25rem, 5.6vw, 2.25rem) clamp(1.1rem, 5vw, 1.9rem) !important;
    z-index: 2 !important;
    display: block !important;
    width: auto !important;
    height: auto !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    font-size: var(--sm-t-hero) !important;
    line-height: 0.84 !important;
    letter-spacing: -0.045em !important;
    text-align: left !important;
    color: var(--sm-cream-edge) !important;
    -webkit-text-fill-color: var(--sm-cream-edge) !important;
    text-shadow: 0 4px 36px rgb(0 0 0 / 0.36) !important;
  }

  /* Arch portrait and the cream-edged detail card that overlaps it. */
  html body main .srh-frame--portrait {
    grid-column: 1 / 8 !important;
    grid-row: 3 !important;
    z-index: 1 !important;
    margin-top: clamp(1.25rem, 6vw, 2.5rem) !important;
    aspect-ratio: 3 / 4.2 !important;
    border-radius: 100vmax 100vmax 0 0 !important;
    overflow: hidden !important;
  }

  html body main .srh-frame--portrait img {
    object-position: 45% center !important;
  }

  html body main .srh-frame--detail {
    grid-column: 6 / -1 !important;
    grid-row: 3 !important;
    align-self: end !important;
    z-index: 3 !important;
    margin-bottom: calc(clamp(2.25rem, 12vw, 4.5rem) * -1) !important;
    aspect-ratio: 4 / 5 !important;
    border: 3px solid var(--sm-cream-edge) !important;
    border-radius: clamp(1.25rem, 5.6vw, 2.15rem) !important;
    box-shadow: 0 1.1rem 3.2rem rgb(74 56 30 / 0.2) !important;
    overflow: hidden !important;
  }

  html body main .srh-frame--detail img {
    object-position: center 58% !important;
  }

  /* Copy hangs from the arch on the same gold hairline and pin as desktop. */
  html body main .srh-copy {
    grid-column: 1 / -1 !important;
    grid-row: 4 !important;
    z-index: 2 !important;
    box-sizing: border-box !important;
    padding: clamp(3.9rem, 17.5vw, 6rem) 0 0.2rem clamp(1.1rem, 4.6vw, 1.6rem) !important;
  }

  html body main .srh-copy::before {
    content: "" !important;
    position: absolute !important;
    top: 0 !important;
    bottom: 0.35rem !important;
    left: 0 !important;
    width: 1px !important;
    background: linear-gradient(180deg, var(--sm-hair-gold), var(--sm-gold)) !important;
  }

  html body main .srh-copy::after {
    content: "" !important;
    position: absolute !important;
    bottom: 0.1rem !important;
    left: -0.2rem !important;
    width: calc(0.4rem + 1px) !important;
    height: calc(0.4rem + 1px) !important;
    border-radius: 50% !important;
    background: var(--sm-gold) !important;
  }

  html body main .srh-copy__title {
    font-size: var(--sm-t-l) !important;
    line-height: 0.86 !important;
    letter-spacing: -0.04em !important;
    color: var(--sm-text) !important;
    -webkit-text-fill-color: var(--sm-text) !important;
  }

  html body main .srh-copy__body {
    display: block !important;
    max-width: 30ch !important;
    margin: clamp(0.7rem, 3vw, 1rem) 0 0 !important;
    font-size: clamp(0.88rem, 3.6vw, 1rem) !important;
    line-height: 1.55 !important;
    color: var(--sm-text-soft) !important;
    -webkit-text-fill-color: var(--sm-text-soft) !important;
  }

  html body main .srh-copy__line {
    display: inline !important;
  }

  html body main .srh-actions {
    grid-column: 1 / -1 !important;
    grid-row: 5 !important;
    z-index: 4 !important;
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 0.45rem !important;
    margin-top: clamp(1.75rem, 8vw, 2.75rem) !important;
    padding: 0.45rem !important;
    border-radius: 1.1rem !important;
  }

  html body main .srh-actions a {
    width: 100% !important;
    min-width: 0 !important;
    height: 2.85rem !important;
    min-height: 2.75rem !important;
    padding: 0 0.5rem !important;
    font-size: clamp(0.6rem, 2.5vw, 0.7rem) !important;
    letter-spacing: 0.15em !important;
    white-space: nowrap !important;
  }

  html body main .srh-actions a.srh-actions__primary {
    order: -1 !important;
  }
}

@media (max-width: 480px) {
  html body main .mod-scroll__intro.suites-reference-hero .srh-canvas {
    padding-inline: clamp(0.65rem, 3.2vw, 1rem) !important;
    padding-bottom: calc(var(--sm-band) + var(--hathor-phone-dock-h, 5rem)) !important;
  }

  html body main .srh-kicker {
    font-size: clamp(1.85rem, 8.4vw, 2.35rem) !important;
  }

  /*
   * Main plate: equal radius on every corner, centered in the column,
   * nearly full phone width. Portrait + detail stay on the same grid
   * so they share that width without changing their overlap/arch.
   */
  html body main .srh-frame--main {
    justify-self: stretch !important;
    width: 100% !important;
    margin-right: 0 !important;
    margin-left: 0 !important;
    max-height: min(68svh, 32rem) !important;
    border-radius: clamp(1.35rem, 6.5vw, 2.15rem) !important;
  }

  html body main .srh-frame--portrait,
  html body main .srh-frame--detail {
    width: auto !important;
  }
}
`;

/* ------------------------------------------------------------------------ */
/* 02–07 · Gallery, text band, ink statement, marquee, arch rail, terms      */
/* ------------------------------------------------------------------------ */
const SM_STORY_CSS = `
@media (max-width: 1024px) {
  /* 02 · Staggered trio on paper: one plate, two portraits offset. */
  html body main .mod-scroll__images.principal {
    display: grid !important;
    grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
    column-gap: var(--sm-gap) !important;
    row-gap: var(--sm-gap) !important;
    align-items: start !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    padding: clamp(0.25rem, 2vw, 1rem) var(--sm-pad) clamp(3rem, 13vw, 5rem) !important;
    overflow: visible !important;
    background: var(--sm-paper) !important;
  }

  html body main .mod-scroll__images.principal > .flipMedia {
    display: contents !important;
  }

  html body main .mod-scroll__images.principal > .mod-scroll__images__image-single {
    grid-column: 1 / -1 !important;
    aspect-ratio: 4 / 5 !important;
    max-height: min(80svh, 40rem) !important;
  }

  html body main .mod-scroll__images.principal .flipMedia__media--down {
    grid-column: 1 / 7 !important;
    aspect-ratio: 3 / 4 !important;
  }

  html body main .mod-scroll__images.principal .flipMedia__media--up {
    grid-column: 7 / -1 !important;
    aspect-ratio: 3 / 4 !important;
    margin-top: clamp(2rem, 10vw, 3.75rem) !important;
  }

  html body main .mod-scroll__images.principal .flipMedia__media--down,
  html body main .mod-scroll__images.principal .flipMedia__media--up,
  html body main .mod-scroll__images.principal > .mod-scroll__images__image-single {
    border-radius: 0 !important;
    overflow: hidden !important;
  }

  /* 03 · Text band. */
  html body main .mod-scroll__text {
    position: relative !important;
    z-index: 1 !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 0 0 var(--sm-band) !important;
    background: var(--sm-paper) !important;
  }

  html body main .mod-scroll__text > .wrapper {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    box-sizing: border-box !important;
    width: 100% !important;
    padding: 0 var(--sm-pad) !important;
  }

  html body main .mod-scroll__text__wrap-text {
    width: 100% !important;
    padding: 0 !important;
  }

  html body main .mod-scroll__text__title {
    width: 100% !important;
    margin: 0 !important;
  }

  html body main .mod-scroll__text .mod-scroll__text__title__line {
    ${DISPLAY}
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    font-size: var(--sm-t-xl) !important;
    line-height: 0.88 !important;
    letter-spacing: -0.04em !important;
    white-space: normal !important;
    text-align: left !important;
    color: var(--sm-text) !important;
    -webkit-text-fill-color: var(--sm-text) !important;
  }

  html body main .mod-scroll__text .mod-scroll__text__title__line.t-right {
    text-align: right !important;
  }

  html body main .mod-scroll__text .mod-scroll__text__title__line .cont {
    position: static !important;
    left: auto !important;
    display: inline !important;
  }

  html body main .mod-scroll__text .mod-scroll__text__text {
    box-sizing: border-box !important;
    width: min(100%, 23rem) !important;
    margin: clamp(1.75rem, 8vw, 2.75rem) 0 0 auto !important;
    padding: clamp(0.9rem, 3.6vw, 1.25rem) 0 0 !important;
    border-top: 1px solid var(--sm-hair-gold) !important;
  }

  html body main .mod-scroll__text .mod-scroll__text__text,
  html body main .mod-scroll__text .mod-scroll__text__text p {
    ${COPY}
    font-size: var(--sm-t-copy) !important;
    line-height: 1.6 !important;
    text-align: left !important;
    color: var(--sm-text-soft) !important;
    -webkit-text-fill-color: var(--sm-text-soft) !important;
  }

  /* 04 · Ink statement, then an interlocking four-frame study. */
  html body main .mod-scroll__images-text {
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 0 !important;
    background: var(--sm-ink-surface) !important;
    color: var(--sm-on-ink) !important;
  }

  html body main .mod-scroll__images-text > .wrapper {
    display: grid !important;
    grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
    column-gap: var(--sm-gap) !important;
    row-gap: var(--sm-gap) !important;
    align-items: start !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    padding: var(--sm-band) var(--sm-pad) !important;
    overflow: visible !important;
  }

  html body main .mod-scroll__images-text .flipMedia {
    display: contents !important;
  }

  html body main .mod-scroll__images-text .mod-scroll__images-text__text {
    grid-column: 1 / -1 !important;
    grid-row: 1 !important;
    position: relative !important;
    box-sizing: border-box !important;
    width: auto !important;
    max-width: none !important;
    min-height: 0 !important;
    aspect-ratio: auto !important;
    margin: 0 0 clamp(2rem, 9vw, 3.25rem) !important;
    padding: clamp(1.4rem, 6vw, 2rem) 0 0 !important;
    border-top: 1px solid rgb(182 159 100 / 0.45) !important;
    background: none !important;
    overflow: visible !important;
  }

  html body main .mod-scroll__images-text .mod-scroll__images-text__text::before {
    content: "" !important;
    position: absolute !important;
    top: -0.23rem !important;
    left: 0 !important;
    width: 0.45rem !important;
    height: 0.45rem !important;
    border-radius: 50% !important;
    background: var(--sm-gold) !important;
  }

  html body main .mod-scroll__images-text .mod-scroll__images-text__text p,
  html body main .mod-scroll__images-text .mod-scroll__images-text__text p > div {
    ${COPY}
    display: inline !important;
    font-size: clamp(1.5rem, 6.8vw, 2.6rem) !important;
    line-height: 1.24 !important;
    color: var(--sm-on-ink) !important;
    -webkit-text-fill-color: var(--sm-on-ink) !important;
  }

  html body main .mod-scroll__images-text .flipMedia--rightLeft > .flipMedia__media--down {
    grid-column: 1 / 8 !important;
    grid-row: 2 !important;
    aspect-ratio: 4 / 5 !important;
  }

  html body main .mod-scroll__images-text .flipMedia--rightLeft > .flipMedia__media--up {
    grid-column: 8 / -1 !important;
    grid-row: 2 !important;
    align-self: end !important;
    aspect-ratio: 3 / 4 !important;
  }

  html body main .mod-scroll__images-text .flipMedia--leftRight > .flipMedia__media--down {
    grid-column: 1 / 6 !important;
    grid-row: 3 !important;
    aspect-ratio: 3 / 4 !important;
  }

  html body main .mod-scroll__images-text .flipMedia--leftRight > .flipMedia__media--up {
    grid-column: 6 / -1 !important;
    grid-row: 3 !important;
    aspect-ratio: 4 / 5 !important;
  }

  html body main .mod-scroll__images-text .flipMedia__media,
  html body main .mod-scroll__images-text .media {
    border-radius: 0 !important;
    overflow: hidden !important;
  }

  /* 05 · Marquee band on sand. */
  html body main .mod-scroll__carousel {
    position: relative !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: var(--sm-sand) !important;
    border-top: 1px solid var(--sm-hair-gold) !important;
    border-bottom: 1px solid var(--sm-hair-gold) !important;
  }

  html body main .mod-scroll__carousel .mod-scroll__carousel__content {
    position: relative !important;
    inset: auto !important;
    display: flex !important;
    align-items: center !important;
    height: auto !important;
    gap: clamp(1rem, 4vw, 2rem) !important;
    padding: clamp(0.95rem, 4.2vw, 1.6rem) 0 !important;
    font-size: clamp(3rem, 14.5vw, 6rem) !important;
    transform: none !important;
    background: transparent !important;
  }

  html body main .mod-scroll__carousel .mod-scroll__carousel__content > span {
    align-items: center !important;
    gap: clamp(1rem, 4vw, 2rem) !important;
    padding: 0 !important;
  }

  html body main .mod-scroll__carousel .mod-scroll__carousel__text {
    ${DISPLAY}
    margin: 0 !important;
    font-size: 1em !important;
    line-height: 0.9 !important;
    letter-spacing: -0.02em !important;
    color: var(--sm-text) !important;
    -webkit-text-fill-color: var(--sm-text) !important;
  }

  html body main .mod-scroll__carousel .mod-scroll__carousel__image {
    width: 0.6em !important;
    height: auto !important;
  }

  /* 06 · Desktop image slide, adapted: square plates on a snap rail. */
  html body main .mod-scroll__images.secundario {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: stretch !important;
    gap: var(--sm-gap) !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    padding: calc(var(--sm-band) * 0.8) 0 0 var(--sm-pad) !important;
    scroll-padding-inline: var(--sm-pad) !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x mandatory !important;
    scroll-snap-stop: always !important;
    background: var(--sm-sand) !important;
  }

  html body main .mod-scroll__images.secundario::after {
    content: "" !important;
    flex: 0 0 calc(var(--sm-pad) - var(--sm-gap)) !important;
    align-self: stretch !important;
  }

  html body main .mod-scroll__images.secundario > .flipMedia {
    display: contents !important;
  }

  html body main .mod-scroll__images.secundario .flipMedia__media {
    flex: 0 0 var(--sm-slide) !important;
    width: var(--sm-slide) !important;
    aspect-ratio: 4 / 5 !important;
    border-radius: 0 !important;
    overflow: hidden !important;
    scroll-snap-align: start !important;
    scroll-snap-stop: always !important;
    background: rgb(20 18 14 / 0.06) !important;
  }

  html body main .mod-scroll__images.secundario .flipMedia__media--down,
  html body main .mod-scroll__images.secundario .flipMedia__media--up {
    aspect-ratio: 4 / 5 !important;
    border-radius: 0 !important;
  }

  html body main .mod-scroll__images.secundario + .smr-rail {
    padding-bottom: calc(var(--sm-band) * 0.8) !important;
    background: var(--sm-sand) !important;
  }

  /* 07 · Terms on gold. */
  html body main .mod-scroll__terms {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0 !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    padding: var(--sm-band) var(--sm-pad) !important;
    overflow: visible !important;
    background: var(--sm-gold) !important;
  }

  html body main .mod-scroll__terms.before-bg-blue::before {
    display: none !important;
  }

  html body main .mod-scroll__terms .mod-scroll__terms__term {
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    flex: none !important;
    width: 100% !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: clamp(1.25rem, 5.4vw, 2rem) 0 !important;
    border-top: 1px solid rgb(20 18 14 / 0.22) !important;
  }

  html body main .mod-scroll__terms .mod-scroll__terms__term:last-of-type {
    border-bottom: 1px solid rgb(20 18 14 / 0.22) !important;
  }

  html body main .mod-scroll__terms .mod-scroll__terms__term__wrap-title {
    order: 0 !important;
    display: grid !important;
    grid-template-columns: 2.4rem minmax(0, 1fr) !important;
    align-items: baseline !important;
    gap: 0 !important;
    width: 100% !important;
  }

  html body main .mod-scroll__terms .mod-scroll__terms__term__num {
    ${LABEL}
    font-size: 0.72rem !important;
    letter-spacing: 0.12em !important;
    color: var(--sm-on-gold-soft) !important;
    -webkit-text-fill-color: var(--sm-on-gold-soft) !important;
  }

  html body main .mod-scroll__terms .mod-scroll__terms__term__title,
  html body main .mod-scroll__terms .mod-scroll__terms__term__title * {
    ${DISPLAY}
    width: auto !important;
    margin: 0 !important;
    font-size: clamp(1.95rem, 8.8vw, 4rem) !important;
    line-height: 0.9 !important;
    letter-spacing: -0.035em !important;
    overflow-wrap: normal !important;
    hyphens: none !important;
    color: var(--sm-on-gold) !important;
    -webkit-text-fill-color: var(--sm-on-gold) !important;
    mix-blend-mode: normal !important;
    filter: none !important;
  }

  html body main .mod-scroll__terms .mod-scroll__terms__term__text-group {
    display: none !important;
  }

  html body main .mod-scroll__terms .mod-scroll__terms__term__text.d-none.d-md-block {
    order: 1 !important;
    position: relative !important;
    display: block !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: 34rem !important;
    margin: clamp(0.7rem, 3vw, 1rem) 0 0 2.4rem !important;
  }

  html body main .mod-scroll__terms .mod-scroll__terms__term__text__single {
    ${COPY}
    position: relative !important;
    top: auto !important;
    transform: none !important;
    opacity: 1 !important;
    font-size: clamp(0.98rem, 4vw, 1.15rem) !important;
    line-height: 1.55 !important;
    color: var(--sm-on-gold-soft) !important;
    -webkit-text-fill-color: var(--sm-on-gold-soft) !important;
  }

  html body main .mod-scroll__terms .follow__mouse {
    position: relative !important;
    inset: auto !important;
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    grid-auto-rows: auto !important;
    gap: var(--sm-gap) !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    margin: clamp(2rem, 9vw, 3rem) 0 0 !important;
    padding: 0 !important;
    aspect-ratio: auto !important;
    opacity: 1 !important;
    transform: none !important;
    clip-path: none !important;
    background: none !important;
    overflow: visible !important;
    pointer-events: none !important;
  }

  html body main .mod-scroll__terms .follow__mouse > img {
    position: relative !important;
    inset: auto !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    aspect-ratio: 4 / 5 !important;
    object-fit: cover !important;
    opacity: 1 !important;
    transform: none !important;
    clip-path: none !important;
    border-radius: 0 !important;
  }

  html body main .mod-scroll__terms .follow__mouse > img:first-of-type {
    grid-row: span 2 !important;
    height: 100% !important;
    aspect-ratio: auto !important;
  }
}
`;

/* ------------------------------------------------------------------------ */
/* 08–10 · Suite collection, rail cards, finale                              */
/* ------------------------------------------------------------------------ */
const SM_COLLECTION_CSS = `
@media (max-width: 1024px) {
  html body main .mod-scroll__projects {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0 !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    background: var(--sm-paper) !important;
  }

  /* 08 · Collection intro. The clone gives this block a full viewport height. */
  html body main .mod-scroll__projects > .mod-scroll__projects__wrap-text {
    position: relative !important;
    display: block !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: var(--sm-band) var(--sm-pad) clamp(1.75rem, 8vw, 2.75rem) !important;
    opacity: 1 !important;
    visibility: visible !important;
    transform: none !important;
  }

  html body main .mod-scroll__projects .mod-scroll__projects__text {
    position: relative !important;
    display: block !important;
    width: 100% !important;
    max-width: 36rem !important;
    margin: 0 !important;
  }

  html body main .mod-scroll__projects .mod-scroll__projects__text,
  html body main .mod-scroll__projects .mod-scroll__projects__text :is(.line, span) {
    ${COPY}
    font-size: var(--sm-t-lede) !important;
    line-height: 1.32 !important;
    color: var(--sm-text) !important;
    -webkit-text-fill-color: var(--sm-text) !important;
  }

  html body main .mod-scroll__projects .mod-scroll__projects__text :is(.line, span) {
    display: inline !important;
  }

  /* 09 · Rail of residence cards in the four page tones. */
  html body main .mod-scroll__projects .suites-collection-rail {
    display: flex !important;
    flex-direction: row !important;
    flex-wrap: nowrap !important;
    align-items: stretch !important;
    gap: var(--sm-gap) !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    margin: 0 !important;
    padding: 0 0 0 var(--sm-pad) !important;
    scroll-padding-inline: var(--sm-pad) !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    scroll-snap-type: x mandatory !important;
    scroll-snap-stop: always !important;
  }

  html body main .mod-scroll__projects .suites-collection-rail::after {
    content: "" !important;
    flex: 0 0 calc(var(--sm-pad) - var(--sm-gap)) !important;
  }

  html body main .suites-collection-rail > .mod-scroll__projects__item {
    position: relative !important;
    flex: 0 0 var(--sm-slide) !important;
    width: var(--sm-slide) !important;
    max-width: none !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    scroll-snap-align: start !important;
    scroll-snap-stop: always !important;
    overflow: hidden !important;
    border-radius: 0 !important;
  }

  html body main .suites-collection-rail .mod-scroll__projects__item__content {
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    transform: none !important;
  }

  html body main .suites-collection-rail .mod-scroll__projects__item .mod-scroll__projects__item__image {
    flex: 0 0 auto !important;
    width: 100% !important;
    aspect-ratio: 4 / 5 !important;
  }

  html body main .suites-collection-rail .mod-scroll__projects__item .mod-scroll__projects__item__text {
    position: relative !important;
    inset: auto !important;
    flex: 1 1 auto !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    grid-template-rows: auto auto 1fr !important;
    align-items: start !important;
    column-gap: 1rem !important;
    row-gap: 0 !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: clamp(1rem, 4.4vw, 1.35rem) clamp(1rem, 4.4vw, 1.35rem) clamp(1.1rem, 4.8vw, 1.5rem) !important;
  }

  html body main .mod-scroll__projects .mod-scroll__projects__item .mod-scroll__projects__item__text__data {
    display: contents !important;
  }

  html body main .mod-scroll__projects .mod-scroll__projects__item .mod-scroll__projects__item__text__data > div {
    ${LABEL}
    position: relative !important;
    inset: auto !important;
    width: auto !important;
    margin: 0 !important;
    color: color-mix(in srgb, var(--suite-panel-fg, var(--sm-text)) 74%, transparent) !important;
    -webkit-text-fill-color: color-mix(in srgb, var(--suite-panel-fg, var(--sm-text)) 74%, transparent) !important;
  }

  html body main .mod-scroll__projects .mod-scroll__projects__item .mod-scroll__projects__item__text__data > div:nth-child(1) {
    grid-column: 1 !important;
    grid-row: 1 !important;
  }

  html body main .mod-scroll__projects .mod-scroll__projects__item .mod-scroll__projects__item__text__data > div:nth-child(2) {
    grid-column: 2 !important;
    grid-row: 1 !important;
    text-align: right !important;
  }

  html body main .mod-scroll__projects .mod-scroll__projects__item .mod-scroll__projects__item__text__data > .data-number {
    display: none !important;
  }

  html body main .mod-scroll__projects .mod-scroll__projects__item .mod-scroll__projects__item__text__data > span {
    grid-column: 1 / -1 !important;
    grid-row: 3 !important;
    align-self: end !important;
    position: relative !important;
    inset: auto !important;
    display: block !important;
    width: 100% !important;
    margin: clamp(1.1rem, 4.6vw, 1.5rem) 0 0 !important;
  }

  html body main .mod-scroll__projects .mod-scroll__projects__item .mod-scroll__projects__item__text__title {
    ${DISPLAY}
    grid-column: 1 / -1 !important;
    grid-row: 2 !important;
    position: relative !important;
    inset: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: clamp(0.8rem, 3.4vw, 1.1rem) 0 0 !important;
    font-size: clamp(1.95rem, 8.6vw, 2.75rem) !important;
    line-height: 0.9 !important;
    letter-spacing: -0.035em !important;
    text-align: left !important;
    color: var(--suite-panel-fg, var(--sm-text)) !important;
    -webkit-text-fill-color: var(--suite-panel-fg, var(--sm-text)) !important;
  }

  html body main .mod-scroll__projects .mod-scroll__projects__item .mod-scroll__projects__item__text a.btn {
    ${PILL}
    width: 100% !important;
    min-width: 0 !important;
    max-width: 100% !important;
    background: transparent !important;
    border-color: color-mix(in srgb, var(--suite-panel-fg, var(--sm-text)) 60%, transparent) !important;
    color: var(--suite-panel-fg, var(--sm-text)) !important;
    -webkit-text-fill-color: var(--suite-panel-fg, var(--sm-text)) !important;
    opacity: 1 !important;
    transform: none !important;
  }

  html body main .mod-scroll__projects .mod-scroll__projects__item .mod-scroll__projects__item__text a.btn::before,
  html body main .mod-scroll__projects .mod-scroll__projects__item .mod-scroll__projects__item__text a.btn::after {
    display: none !important;
  }

  html body main .mod-scroll__projects .mod-scroll__projects__item .mod-scroll__projects__item__text a.btn.disabled {
    display: none !important;
  }

  html body main .mod-scroll__projects .suites-collection-rail + .smr-rail {
    padding-bottom: var(--sm-band) !important;
  }

  /* 10 · Finale: Nile at Night on ink, a paired study, the gold invitation. */
  html body main .mod-scroll__projects > .mod-scroll__projects__item.last-item {
    position: relative !important;
    display: block !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    background: var(--sm-ink-surface) !important;
    box-shadow: none !important;
  }

  html body main .mod-scroll__projects > .mod-scroll__projects__item.last-item > .mod-scroll__projects__item__content {
    position: relative !important;
    display: block !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: var(--sm-band) var(--sm-pad) clamp(1.75rem, 7vw, 2.5rem) !important;
    transform: none !important;
  }

  html body main .mod-scroll__projects > .mod-scroll__projects__item.last-item .mod-scroll__projects__item__image {
    width: auto !important;
    margin-right: calc(var(--sm-pad) * -1) !important;
    aspect-ratio: 4 / 5 !important;
    max-height: min(80svh, 40rem) !important;
    border-radius: 0 !important;
  }

  html body main .mod-scroll__projects > .mod-scroll__projects__item.last-item .mod-scroll__projects__item__text {
    position: relative !important;
    inset: auto !important;
    display: grid !important;
    grid-template-columns: minmax(0, 1fr) auto !important;
    align-items: start !important;
    column-gap: 1rem !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: clamp(1.25rem, 5.4vw, 1.9rem) 0 0 !important;
    background: transparent !important;
  }

  html body main .mod-scroll__projects > .mod-scroll__projects__item.last-item .mod-scroll__projects__item__text__data > div {
    color: var(--sm-on-ink-soft) !important;
    -webkit-text-fill-color: var(--sm-on-ink-soft) !important;
  }

  html body main .mod-scroll__projects > .mod-scroll__projects__item.last-item .mod-scroll__projects__item__text__title {
    font-size: clamp(2.4rem, 11vw, 4.6rem) !important;
    line-height: 0.88 !important;
    color: var(--sm-on-ink) !important;
    -webkit-text-fill-color: var(--sm-on-ink) !important;
  }

  html body main .mod-scroll__projects > .mod-scroll__projects__item.last-item .mod-scroll__projects__item__text__title * {
    color: inherit !important;
    -webkit-text-fill-color: inherit !important;
  }

  html body main .mod-scroll__projects > .last-item .last-item__carousel {
    position: relative !important;
    inset: auto !important;
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    align-items: start !important;
    gap: var(--sm-gap) !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 var(--sm-pad) 0 !important;
    transform: none !important;
    overflow: visible !important;
    background: transparent !important;
  }

  html body main .mod-scroll__projects > .last-item .last-item__carousel__item:not(.last-item__carousel__item--link) {
    position: relative !important;
    display: block !important;
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 3 / 4 !important;
    overflow: hidden !important;
  }

  html body main .mod-scroll__projects > .last-item .last-item__carousel__item:not(.last-item__carousel__item--link):nth-child(2) {
    margin-top: clamp(1.75rem, 8vw, 3rem) !important;
  }

  html body main .mod-scroll__projects > .last-item .last-item__carousel__item .last-item__carousel__item__image {
    position: absolute !important;
    inset: 0 !important;
    top: 0 !important;
    width: 100% !important;
    height: 100% !important;
    aspect-ratio: auto !important;
    transform: none !important;
  }

  html body main .mod-scroll__projects > .last-item a.last-item__carousel__item--link,
  html body main .mod-scroll__projects > .last-item a.hathor-horizon-cta {
    grid-column: 1 / -1 !important;
    position: relative !important;
    box-sizing: border-box !important;
    ${PILL}
    width: auto !important;
    min-width: 12.5rem !important;
    max-width: 100% !important;
    justify-self: start !important;
    margin: clamp(1.5rem, 6vw, 2.25rem) 0 var(--sm-band) !important;
    background: var(--sm-ink-surface) !important;
    border-color: var(--sm-ink-surface) !important;
    color: #cdb684 !important;
    -webkit-text-fill-color: #cdb684 !important;
  }

  html body main .mod-scroll__projects > .last-item a.last-item__carousel__item--link::before,
  html body main .mod-scroll__projects > .last-item a.last-item__carousel__item--link::after,
  html body main .mod-scroll__projects > .last-item a.last-item__carousel__item--link svg,
  html body main .mod-scroll__projects > .last-item a.hathor-horizon-cta::before,
  html body main .mod-scroll__projects > .last-item a.hathor-horizon-cta::after,
  html body main .mod-scroll__projects > .last-item a.hathor-horizon-cta svg {
    display: none !important;
  }

  html body main .mod-scroll__projects > .last-item a.last-item__carousel__item--link .last-item__carousel__item__text,
  html body main .mod-scroll__projects > .last-item a.hathor-horizon-cta .last-item__carousel__item__text {
    display: inline !important;
    font-family: inherit !important;
    font-size: inherit !important;
    font-style: normal !important;
    font-weight: inherit !important;
    letter-spacing: inherit !important;
    text-transform: inherit !important;
    color: inherit !important;
    -webkit-text-fill-color: inherit !important;
  }

  html body main .mod-scroll__projects .last-item__content {
    position: relative !important;
    inset: auto !important;
    top: auto !important;
    z-index: 1 !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    background: var(--sm-paper) !important;
  }

  html body main .mod-scroll__projects .last-item__content .last-item__content__wrap {
    position: relative !important;
    inset: auto !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0 !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: var(--sm-band) var(--sm-pad) !important;
    text-align: left !important;
  }

  html body main .mod-scroll__projects .last-item__content .last-item__content__title {
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
  }

  html body main .mod-scroll__projects .last-item__content .last-item__content__title .line {
    ${DISPLAY}
    display: block !important;
    width: 100% !important;
    max-width: none !important;
    margin: 0 !important;
    font-size: var(--sm-t-xl) !important;
    line-height: 0.9 !important;
    letter-spacing: -0.04em !important;
    text-align: left !important;
    color: var(--sm-text) !important;
    -webkit-text-fill-color: var(--sm-text) !important;
  }

  html body main .mod-scroll__projects .last-item__content .last-item__content__title .line * {
    color: inherit !important;
    -webkit-text-fill-color: inherit !important;
  }

  html body main .mod-scroll__projects .last-item__content .last-item__content__title .line.t-right {
    text-align: left !important;
  }

  html body main .mod-scroll__projects .last-item__content .last-item__content__text {
    box-sizing: border-box !important;
    width: min(100%, 28rem) !important;
    max-width: none !important;
    margin: clamp(1.5rem, 6vw, 2.25rem) 0 0 !important;
    padding: clamp(0.9rem, 3.6vw, 1.25rem) 0 0 !important;
    border-top: 1px solid var(--sm-hair-gold) !important;
    opacity: 1 !important;
  }

  html body main .mod-scroll__projects .last-item__content .last-item__content__text,
  html body main .mod-scroll__projects .last-item__content .last-item__content__text :is(p, .line, span) {
    ${COPY}
    font-size: var(--sm-t-copy) !important;
    line-height: 1.6 !important;
    text-align: left !important;
    color: var(--sm-text-soft) !important;
    -webkit-text-fill-color: var(--sm-text-soft) !important;
  }

  html body main .mod-scroll__projects .last-item__content .last-item__content__text :is(.line, span) {
    display: inline !important;
  }
}
`;

/* ------------------------------------------------------------------------ */
/* 11–16 · Closing arch, reservations, mosaic, lines, contact, footer seat   */
/* ------------------------------------------------------------------------ */
const SM_CLOSING_CSS = `
@media (max-width: 1024px) {
  /* 11 · Closing plate on stone; the second frame wipes up over the first. */
  html body main .mod-scroll__cierre {
    position: relative !important;
    width: 100% !important;
    max-width: none !important;
    height: auto !important;
    min-height: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: var(--sm-stone) !important;
  }

  html body main .mod-scroll__cierre .mod-scroll__cierre__content {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    padding: var(--sm-band) var(--sm-pad) 0 !important;
    transform: none !important;
  }

  html body main .mod-scroll__cierre .mod-scroll__cierre__content::after {
    content: "" !important;
    display: block !important;
    width: 1px !important;
    height: clamp(2.75rem, 13vw, 4.5rem) !important;
    margin-top: clamp(1.25rem, 5.4vw, 2rem) !important;
    background: linear-gradient(180deg, var(--sm-gold), transparent) !important;
  }

  html body main .mod-scroll__cierre .mod-scroll__cierre__content__image {
    position: relative !important;
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    aspect-ratio: 4 / 5 !important;
    margin: 0 auto !important;
    border-radius: 0 !important;
    overflow: hidden !important;
    clip-path: none !important;
    transform: none !important;
  }

  html body main .mod-scroll__cierre .mod-scroll__cierre__content__image > .flipMedia__media {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    aspect-ratio: auto !important;
  }

  html.smr-on body main .mod-scroll__cierre .mod-scroll__cierre__content__image > .flipMedia__media--up {
    clip-path: inset(100% 0 0 0) !important;
    transition: clip-path 1.5s var(--sm-ease) 0.2s !important;
  }

  html.smr-on body main .mod-scroll__cierre .mod-scroll__cierre__content__image.is-in > .flipMedia__media--up {
    clip-path: inset(0 0 0 0) !important;
  }

  /* 12 · Reservations chapter. */
  html body main .mod-title--chapter {
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: var(--sm-band) var(--sm-pad) calc(var(--sm-band) * 0.7) !important;
    text-align: center !important;
    background: var(--sm-sand) !important;
  }

  html body main .mod-title--chapter .mod-title__intro {
    position: relative !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    margin: 0 0 clamp(1rem, 4.4vw, 1.5rem) !important;
  }

  html body main .mod-title--chapter .mod-title__intro > div {
    ${COPY}
    font-size: clamp(1.55rem, 7vw, 2.4rem) !important;
    line-height: 1.05 !important;
    letter-spacing: 0 !important;
    color: var(--sm-label) !important;
    -webkit-text-fill-color: var(--sm-label) !important;
  }

  html body main .mod-title--chapter .anima__title {
    width: 100% !important;
    max-width: 14ch !important;
    margin: 0 auto !important;
  }

  html body main .mod-title--chapter .anima__title .line {
    ${DISPLAY}
    display: block !important;
    width: 100% !important;
    margin: 0 !important;
    overflow: visible !important;
    font-size: var(--sm-t-xl) !important;
    line-height: 0.9 !important;
    letter-spacing: -0.04em !important;
    text-align: center !important;
    color: var(--sm-text) !important;
    -webkit-text-fill-color: var(--sm-text) !important;
  }

  html body main .mod-title--chapter .anima__title .line * {
    color: inherit !important;
    -webkit-text-fill-color: inherit !important;
  }

  /* 13 · Mosaic in gold gutters. */
  html body main .mod-media--mosaic {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: var(--sm-gap) !important;
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: var(--sm-gap) !important;
    background: var(--sm-gold) !important;
  }

  html body main .mod-media--mosaic .mod-media__item {
    width: 100% !important;
    max-width: 100% !important;
    flex: none !important;
    aspect-ratio: 4 / 5 !important;
  }

  /* 14–16 · Life Upon / Nile / copy / availability on one shared stack. */
  html body main .hathor-suites-epilogue {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    box-sizing: border-box !important;
    width: 100% !important;
    margin: 0 !important;
    padding: var(--sm-band) var(--sm-pad) var(--sm-band) !important;
    background: var(--sm-sand) !important;
  }

  html body main .mod-title--lines {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 0 clamp(1.25rem, 5vw, 1.75rem) !important;
    background: transparent !important;
  }

  html body main .mod-title--lines .line {
    ${DISPLAY}
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    overflow: visible !important;
    font-size: var(--sm-t-xl) !important;
    line-height: 0.9 !important;
    letter-spacing: -0.04em !important;
    text-align: left !important;
    color: var(--sm-text) !important;
    -webkit-text-fill-color: var(--sm-text) !important;
  }

  html body main .mod-title--lines .line.align-right,
  html body main .mod-title--lines .line.t-left,
  html body main .mod-title--lines .line.t-right {
    text-align: left !important;
  }

  html body main .mod-title--lines .line * {
    color: inherit !important;
    -webkit-text-fill-color: inherit !important;
  }

  /* 15 · Contact note under the title, then the availability pill. */
  html body main .mod-content--cols {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 0 !important;
    box-sizing: border-box !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background: transparent !important;
  }

  html body main .mod-content--cols .mod-content__col:not(.big_text) {
    display: none !important;
  }

  html body main .mod-content--cols .mod-content__col.big_text {
    box-sizing: border-box !important;
    width: min(100%, 28rem) !important;
    max-width: none !important;
    margin: 0 !important;
    padding: clamp(1rem, 4vw, 1.35rem) 0 0 !important;
    border-top: 1px solid var(--sm-hair-gold) !important;
  }

  html body main .mod-content--cols .mod-content__text,
  html body main .mod-content--cols .mod-content__text p {
    ${COPY}
    margin: 0 !important;
    font-size: var(--sm-t-copy) !important;
    line-height: 1.6 !important;
    color: var(--sm-text-soft) !important;
    -webkit-text-fill-color: var(--sm-text-soft) !important;
  }

  html body main .mod-content--cols .mod-content__text p + p {
    margin-top: clamp(0.9rem, 3.8vw, 1.25rem) !important;
  }

  html body main .mod-content--cols .mod-content__text strong {
    display: inline-block !important;
    padding-bottom: 0.2rem !important;
    border-bottom: 1px solid var(--sm-hair-gold) !important;
    font-family: "Piloner Semibold", "Plus Jakarta Sans", sans-serif !important;
    font-style: normal !important;
    font-weight: 600 !important;
    font-size: clamp(0.78rem, 3.2vw, 0.92rem) !important;
    letter-spacing: 0.06em !important;
    overflow-wrap: anywhere !important;
    color: var(--sm-text) !important;
    -webkit-text-fill-color: var(--sm-text) !important;
  }

  /* 16 · Request availability. */
  html body main .mod-content--center {
    display: flex !important;
    justify-content: flex-start !important;
    box-sizing: border-box !important;
    width: 100% !important;
    margin: 0 !important;
    padding: clamp(1.25rem, 5vw, 1.75rem) 0 0 !important;
    overflow: visible !important;
    background: transparent !important;
  }

  html body main .mod-content--center .mod-content__col {
    display: flex !important;
    justify-content: flex-start !important;
    width: auto !important;
    max-width: 100% !important;
    padding: 0 !important;
  }

  html body main .mod-content--center a.mod-content__btn {
    ${PILL}
    width: auto !important;
    min-width: 12.5rem !important;
    max-width: 100% !important;
    height: 2.85rem !important;
    font-size: 0.68rem !important;
    letter-spacing: 0.16em !important;
    background: var(--sm-ink-surface) !important;
    border-color: var(--sm-ink-surface) !important;
    color: #cdb684 !important;
    -webkit-text-fill-color: #cdb684 !important;
  }

  html body main .mod-content--center a.mod-content__btn :is(span, div) {
    font-size: inherit !important;
    letter-spacing: inherit !important;
    color: inherit !important;
    -webkit-text-fill-color: inherit !important;
  }

  /* Site footer seat: the footer paints no ground, so it stands on sand. */
  html body .hathor-lux-footer-host {
    display: block !important;
    background: var(--sm-sand) !important;
  }
}

@media (min-width: 481px) and (max-width: 1024px) {
  html body .hathor-lux-footer-host {
    padding-bottom: 0 !important;
  }

  html body main .hathor-suites-epilogue {
    display: grid !important;
    grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr) !important;
    column-gap: var(--sm-gap) !important;
    align-items: end !important;
  }

  html body main .hathor-suites-epilogue .mod-title--lines {
    display: contents !important;
  }

  html body main .hathor-suites-epilogue .mod-title--lines .line:nth-child(1),
  html body main .hathor-suites-epilogue .mod-title--lines .line:nth-child(2) {
    grid-column: 1 !important;
    text-align: left !important;
  }

  html body main .hathor-suites-epilogue .mod-title--lines .line:nth-child(3) {
    grid-column: 2 !important;
    grid-row: 1 / span 2 !important;
    align-self: end !important;
    text-align: left !important;
  }

  html body main .hathor-suites-epilogue .mod-content--cols,
  html body main .hathor-suites-epilogue .mod-content--center {
    display: contents !important;
  }

  html body main .hathor-suites-epilogue .mod-content--cols .mod-content__col.big_text,
  html body main .hathor-suites-epilogue .mod-content--center .mod-content__col {
    grid-column: 2 !important;
    width: 100% !important;
    margin: 0 !important;
    justify-content: flex-start !important;
  }
}

@media (max-width: 480px) {
  html body .hathor-lux-footer-host {
    padding-bottom: calc(clamp(4.25rem, 18.4vw, 5rem) + 0.75rem + env(safe-area-inset-bottom, 0px)) !important;
  }
}
`;

export const SUITES_MOBILE_DESIGN_CSS = [
  SM_BASE_CSS,
  SM_HERO_CSS,
  SM_STORY_CSS,
  SM_COLLECTION_CSS,
  SM_CLOSING_CSS,
].join("\n");

const NARROW_MAX = 1024;

const COPY_REVEALS = [
  ".srh-copy",
  ".srh-actions",
  ".mod-scroll__text__title",
  ".mod-scroll__text .mod-scroll__text__text",
  ".mod-scroll__images-text__text",
  ".mod-scroll__carousel",
  ".mod-scroll__terms",
  ".mod-scroll__projects__wrap-text",
  ".mod-scroll__projects > .mod-scroll__projects__item.last-item .mod-scroll__projects__item__text",
  ".mod-scroll__cierre__content",
  ".mod-title--chapter",
  ".mod-title--lines",
  ".mod-content--cols .mod-content__col.big_text",
  ".mod-content--center",
] as const;

const FRAME_REVEALS = [
  ".srh-frame",
  ".mod-scroll__images.principal .media",
  ".mod-scroll__images.principal .flipMedia__media",
  ".mod-scroll__images-text .flipMedia__media",
  ".mod-scroll__images.secundario .flipMedia__media",
  ".suites-collection-rail .mod-scroll__projects__item__image",
  ".mod-scroll__projects > .mod-scroll__projects__item.last-item .mod-scroll__projects__item__image",
  ".mod-scroll__cierre__content__image",
  ".mod-media--mosaic .mod-media__item",
] as const;

function pad2(n: number) {
  const value = Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
  return String(value).padStart(2, "0");
}

function isNarrow(doc: Document) {
  const width = doc.defaultView?.innerWidth ?? 0;
  return width > 0 && width <= NARROW_MAX;
}

function prefersReducedMotion(doc: Document) {
  return Boolean(
    doc.defaultView?.matchMedia("(prefers-reduced-motion: reduce)")?.matches,
  );
}

function mark(el: Element, kind: "copy" | "frame", delay = 0) {
  if (el.hasAttribute("data-smr")) return;
  el.setAttribute("data-smr", kind === "frame" ? "frame" : "");
  if (delay > 0) {
    (el as HTMLElement).style.setProperty("--smr-delay", `${delay}s`);
  }
}

function tagReveals(doc: Document) {
  COPY_REVEALS.forEach((selector) => {
    doc.querySelectorAll(selector).forEach((el) => mark(el, "copy"));
  });

  FRAME_REVEALS.forEach((selector) => {
    const nodes = Array.from(doc.querySelectorAll(selector));
    const byParent = new Map<Element | null, Element[]>();
    nodes.forEach((el) => {
      const parent = el.parentElement;
      const group = byParent.get(parent) ?? [];
      group.push(el);
      byParent.set(parent, group);
    });
    byParent.forEach((group) => {
      group.forEach((el, index) => mark(el, "frame", index * 0.08));
    });
  });
}

function makeRail(doc: Document, total: number) {
  const rail = doc.createElement("div");
  rail.className = "smr-rail";
  rail.setAttribute("data-smr-rail", "1");

  const count = doc.createElement("span");
  count.className = "smr-rail__count";
  count.setAttribute("data-smr-count", "1");

  const current = doc.createElement("span");
  current.setAttribute("data-smr-current", "1");
  current.textContent = pad2(1);

  const sep = doc.createElement("span");
  sep.className = "smr-rail__sep";
  sep.setAttribute("aria-hidden", "true");
  sep.textContent = "·";

  const totalEl = doc.createElement("b");
  totalEl.setAttribute("data-smr-total", "1");
  totalEl.textContent = pad2(total);

  count.append(current, sep, totalEl);

  const track = doc.createElement("span");
  track.className = "smr-rail__track";
  track.setAttribute("aria-hidden", "true");
  const fill = doc.createElement("i");
  track.append(fill);

  rail.append(count, track);
  rail.style.setProperty("--smr-progress", "0.25");
  return rail;
}

function setRailProgress(
  rail: HTMLElement,
  index: number,
  total: number,
  progress: number,
) {
  const current = rail.querySelector("[data-smr-current]");
  const totalEl = rail.querySelector("[data-smr-total]");
  if (current) current.textContent = pad2(index);
  if (totalEl) totalEl.textContent = pad2(total);
  rail.style.setProperty(
    "--smr-progress",
    String(Math.min(1, Math.max(0.12, progress))),
  );
}

function bindRail(scroller: HTMLElement, itemSelector: string) {
  const doc = scroller.ownerDocument;
  if (scroller.nextElementSibling?.hasAttribute("data-smr-rail")) {
    return scroller.nextElementSibling as HTMLElement;
  }

  scroller.classList.add("smr-rail-scroller");
  const items = Array.from(
    scroller.querySelectorAll<HTMLElement>(itemSelector),
  );
  const total = Math.max(items.length, 1);
  const rail = makeRail(doc, total);
  scroller.after(rail);

  const update = () => {
    const max = scroller.scrollWidth - scroller.clientWidth;
    const progress = max <= 1 ? 1 : scroller.scrollLeft / max;
    let index = 1;
    if (items.length > 0) {
      const left = scroller.getBoundingClientRect().left;
      let best = 0;
      let bestDist = Number.POSITIVE_INFINITY;
      items.forEach((item, i) => {
        const dist = Math.abs(item.getBoundingClientRect().left - left);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      index = best + 1;
    }
    setRailProgress(rail, index, total, progress);
  };

  scroller.addEventListener("scroll", update, { passive: true });
  doc.defaultView?.addEventListener("resize", update);
  update();
  return rail;
}

function mountRails(doc: Document) {
  const arch = doc.querySelector<HTMLElement>(
    "main .mod-scroll__images.secundario",
  );
  if (arch) bindRail(arch, ".flipMedia__media");

  const collection = doc.querySelector<HTMLElement>(
    "main .suites-collection-rail",
  );
  if (collection) {
    bindRail(collection, ":scope > .mod-scroll__projects__item");
  }
}

function scrollerRoot(doc: Document): Element | null {
  const wrap = doc.querySelector<HTMLElement>("#smooth-wrapper");
  if (!wrap) return null;
  if (wrap.scrollHeight > wrap.clientHeight + 8) return wrap;
  return null;
}

function revealNow(el: Element) {
  el.classList.add("is-in");
}

function observeReveals(doc: Document) {
  const html = doc.documentElement;
  if (html.dataset.smrObserved === "1") return;

  const nodes = Array.from(doc.querySelectorAll("[data-smr]"));
  if (nodes.length === 0) return;

  const root = scrollerRoot(doc);
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        revealNow(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      root,
      threshold: 0.16,
      rootMargin: "0px 0px -6% 0px",
    },
  );

  nodes.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const viewH = doc.defaultView?.innerHeight ?? 0;
    if (rect.top < viewH * 0.92 && rect.bottom > 0) {
      revealNow(el);
      return;
    }
    observer.observe(el);
  });

  html.dataset.smrObserved = "1";
}

function syncMotionClass(doc: Document) {
  const html = doc.documentElement;
  const on = isNarrow(doc) && !prefersReducedMotion(doc);
  html.classList.toggle("smr-on", on);
  return on;
}

/**
 * Phone/tablet only. Tags scenes, mounts gallery rails, and (when motion is
 * allowed) turns on html.smr-on so the CSS reveal can run against the clone
 * scroller. Missing this function, or reduced motion, leaves every block
 * visible — that is why the CSS reveal is gated on html.smr-on.
 */
export function layoutSuitesMobileScenes(doc: Document) {
  const html = doc.documentElement;
  if (html.dataset.smrBound !== "1") {
    html.dataset.smrBound = "1";
    doc.defaultView?.addEventListener("resize", () => {
      applyMobileScenes(doc);
    });
  }
  applyMobileScenes(doc);
}

function applyMobileScenes(doc: Document) {
  const html = doc.documentElement;
  if (!isNarrow(doc)) {
    html.classList.remove("smr-on");
    return;
  }

  if (html.dataset.smrTagged !== "1") {
    tagReveals(doc);
    mountRails(doc);
    html.dataset.smrTagged = "1";
  }

  if (syncMotionClass(doc)) observeReveals(doc);
}
