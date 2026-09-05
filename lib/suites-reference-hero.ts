const HERO_MARKUP = `
  <div class="srh-canvas">
    <p class="srh-kicker" aria-hidden="true">Suites<br>at rest</p>

    <figure class="srh-frame srh-frame--portrait">
      <img
        src="/media/hathor/scraped/suites-hero.webp"
        data-hathor-slot="scraped-suites-hero"
        alt="Guest enjoying panoramic Nile views from a Hathor suite"
        width="1280"
        height="853"
        decoding="async"
        fetchpriority="high"
      >
    </figure>

    <figure class="srh-frame srh-frame--main">
      <img
        src="/media/hathor/scraped/luxsuite-1.webp"
        data-hathor-slot="scraped-luxsuite-1"
        alt="Hathor suite bedroom with warm timber, soft seating, and private bath"
        width="1456"
        height="1088"
        decoding="async"
        fetchpriority="high"
      >
      <span class="srh-frame__wash" aria-hidden="true"></span>
      <h1 class="srh-title">Framed<br>by the Nile</h1>
    </figure>

    <div class="srh-copy">
      <p class="srh-copy__title">Made<br>for living</p>
      <p class="srh-copy__body"><span class="srh-copy__line">Quiet, crafted comfort; river light;</span> <span class="srh-copy__line">the Nile just beyond the glass.</span></p>
    </div>

    <svg class="srh-connectors" aria-hidden="true" focusable="false">
      <g class="srh-connectors__set">
        <path class="srh-connector srh-connector--portrait"></path>
        <circle class="srh-connector__dot" r="4"></circle>
        <path class="srh-connector srh-connector--copy"></path>
      </g>
    </svg>

    <figure class="srh-frame srh-frame--detail">
      <img
        src="/media/hathor/scraped/luxsuite-5.webp"
        data-hathor-slot="scraped-luxsuite-5"
        alt="Hathor suite bed prepared for a restful night on the Nile"
        width="1456"
        height="1088"
        decoding="async"
        fetchpriority="high"
      >
    </figure>

    <nav class="srh-actions" aria-label="Suites actions">
      <a href="/luxury-cabins-Nile-Cruise" target="_top">View cabins</a>
      <a href="/rooms" target="_top">View suites</a>
      <a class="srh-actions__primary" href="/suites?book=1" target="_top">Book now</a>
      <a href="/voyages" target="_top">View voyages</a>
    </nav>
  </div>
`;

export const SUITES_REFERENCE_HERO_CSS = `
html body main .mod-scroll__intro.suites-reference-hero {
  width: 100vw !important;
  min-width: 100vw !important;
  height: 100svh !important;
  min-height: 42rem !important;
  overflow: hidden !important;
  background:
    radial-gradient(circle at 46% 10%, rgba(255,255,255,.72), transparent 30%),
    #f3ede4 !important;
  color: #17140f !important;
}

html body main .mod-scroll__intro.suites-reference-hero > .wrapper {
  display: block !important;
  width: 100% !important;
  max-width: none !important;
  height: 100% !important;
  min-height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}

.srh-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  isolation: isolate;
  background: linear-gradient(108deg, rgba(255,255,255,.22), transparent 46%);
}

.srh-frame {
  position: absolute;
  z-index: 1;
  display: block;
  margin: 0;
  overflow: hidden;
  background: #d9c8ae;
}

.srh-frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.035);
  animation: srh-image-arrive 1.35s cubic-bezier(.22,.78,.19,1) both;
}

.srh-kicker,
.srh-title,
.srh-copy__title {
  margin: 0;
  font-family: "Italiana", "Gamgote", Georgia, serif !important;
  font-style: normal !important;
  font-weight: 400 !important;
  letter-spacing: -.045em !important;
  text-transform: uppercase;
}

.srh-kicker {
  position: absolute;
  z-index: 4;
  top: 11.1%;
  left: 5.25%;
  font-size: clamp(3rem, 4.2vw, 4.65rem);
  line-height: .88;
  animation: srh-copy-arrive .9s .08s cubic-bezier(.22,.78,.19,1) both;
}

.srh-frame--portrait {
  top: 27.4%;
  bottom: 11.8%;
  left: 4.85%;
  width: 21.35%;
  border-radius: 10.75rem 10.75rem 0 0;
}

.srh-frame--portrait img {
  object-position: 45% center;
  animation-delay: .12s;
}

.srh-frame--main {
  top: 10.55%;
  right: 0;
  width: 72.4%;
  height: 55.25%;
  border-radius: 0 0 0 3.25rem;
}

.srh-frame--main img {
  object-position: center 54%;
}

.srh-frame__wash {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(20,16,10,.36), rgba(20,16,10,.05) 62%),
    linear-gradient(180deg, rgba(20,16,10,.08), transparent 42%, rgba(20,16,10,.08));
}

.srh-title {
  position: absolute;
  z-index: 2;
  top: 28.5%;
  left: 4.25%;
  color: #f7f1e6 !important;
  -webkit-text-fill-color: #f7f1e6 !important;
  font-size: clamp(4.8rem, 7.1vw, 7.45rem);
  line-height: .84;
  text-shadow: 0 4px 40px rgba(0,0,0,.4) !important;
  animation: srh-copy-arrive 1s .2s cubic-bezier(.22,.78,.19,1) both;
}

.srh-copy {
  position: absolute;
  z-index: 4;
  top: 67.3%;
  left: 30.15%;
}

.srh-copy__title {
  font-size: clamp(3.1rem, 4.4vw, 4.85rem);
  line-height: .88;
  animation: srh-copy-arrive .9s .38s cubic-bezier(.22,.78,.19,1) both;
}

.srh-copy__body {
  margin: .7rem 0 0 .15rem;
  font-family: "Piloner Thin", "Plus Jakarta Sans", sans-serif !important;
  font-size: clamp(.78rem, .88vw, .95rem);
  font-weight: 100;
  line-height: 1.55;
  letter-spacing: .01em;
  color: rgba(31,27,21,.75) !important;
  -webkit-text-fill-color: rgba(31,27,21,.75) !important;
  animation: srh-copy-arrive .8s .5s cubic-bezier(.22,.78,.19,1) both;
}

.srh-copy__line {
  display: block;
}

.srh-frame--detail {
  z-index: 3;
  top: 55.7%;
  right: 2.45%;
  width: 30.15%;
  height: 32.3%;
  border: 3px solid #f7f1e6;
  border-radius: 2.15rem;
  box-shadow: 0 18px 54px rgba(74,56,30,.14);
}

.srh-frame--detail img {
  object-position: center 58%;
  animation-delay: .28s;
}

.srh-connectors {
  position: absolute;
  z-index: 2;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
}

.srh-connectors__set {
  display: block;
}

/*
 * The SVG viewBox is written by layoutSuitesConnectors() as a 1:1 pixel space,
 * so strokes, corner radii and the pin stay circular at every viewport. Each
 * path also carries its own measured length in --srh-len, which is what makes
 * the draw animation cover exactly the path instead of overshooting it.
 */
.srh-connector {
  fill: none !important;
  stroke: #c3a158 !important;
  stroke-width: 1.15;
  vector-effect: non-scaling-stroke;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: var(--srh-len, 0);
  stroke-dashoffset: var(--srh-len, 0);
  animation: srh-draw-connector 1.25s .58s cubic-bezier(.65,0,.2,1) forwards;
}

.srh-connector--copy {
  animation-delay: .78s;
}

.srh-connectors:not([data-srh-measured]) .srh-connector,
.srh-connectors:not([data-srh-measured]) .srh-connector__dot {
  visibility: hidden;
}

.srh-connector__dot {
  fill: #c3a158 !important;
  opacity: 0;
  transform: scale(0);
  transform-box: fill-box;
  transform-origin: center;
  animation: srh-pin-arrive .42s .5s cubic-bezier(.22,.78,.19,1) forwards;
}

.srh-actions {
  position: absolute;
  z-index: 8;
  right: auto;
  bottom: 2.05%;
  left: 50%;
  width: max-content;
  translate: -50% 0;
  display: grid;
  grid-template-columns: repeat(4, 12.5rem);
  gap: .5rem;
  padding: .5rem;
  border: 1px solid rgba(255,255,255,.48);
  border-radius: 1rem;
  background: rgba(239,234,225,.82);
  box-shadow: 0 16px 46px rgba(76,57,27,.08), inset 0 1px 0 rgba(255,255,255,.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  animation: srh-actions-arrive .85s .58s cubic-bezier(.22,.78,.19,1) both;
}

.srh-actions a {
  box-sizing: border-box;
  display: flex;
  width: 12.5rem;
  min-width: 12.5rem;
  height: 2.85rem;
  min-height: 2.85rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(25,22,17,.48);
  border-radius: 999px;
  color: #17140f !important;
  -webkit-text-fill-color: #17140f !important;
  font-family: "Piloner Semibold", "Plus Jakarta Sans", sans-serif !important;
  font-size: .72rem;
  font-style: normal !important;
  font-weight: 600;
  letter-spacing: .18em;
  text-decoration: none;
  text-transform: uppercase;
  transition: color .3s ease, background .3s ease, border-color .3s ease, transform .3s ease;
}

.srh-actions a:hover,
.srh-actions a:focus-visible {
  border-color: #b69f64;
  background: #b69f64;
  transform: translateY(-2px);
}

.srh-actions a.srh-actions__primary {
  border-color: #17140f;
  background: #17140f;
  color: #f7f1e6 !important;
  -webkit-text-fill-color: #f7f1e6 !important;
}

.srh-actions a.srh-actions__primary:hover,
.srh-actions a.srh-actions__primary:focus-visible {
  border-color: #b69f64;
  background: #b69f64;
  color: #17140f !important;
  -webkit-text-fill-color: #17140f !important;
}

@keyframes srh-image-arrive {
  from { opacity: 0; transform: scale(1.1); filter: saturate(.7) sepia(.15); }
  to { opacity: 1; transform: scale(1.035); filter: none; }
}

@keyframes srh-copy-arrive {
  from { opacity: 0; transform: translateY(1.25rem); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes srh-actions-arrive {
  from { opacity: 0; transform: translateY(1.5rem); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes srh-draw-connector {
  to { stroke-dashoffset: 0; }
}

@keyframes srh-pin-arrive {
  to { opacity: 1; transform: scale(1); }
}

@media (min-width: 1025px) {
  main .mod-scroll__images.principal {
    box-sizing: border-box;
    display: flex !important;
    align-items: stretch !important;
    gap: clamp(1.5rem, 3vw, 3.25rem) !important;
    width: max-content !important;
    height: var(--100vh) !important;
    padding: 0 clamp(1rem, 2vw, 2.5rem) !important;
    overflow: clip !important;
  }

  main .mod-scroll__images.principal > .mod-scroll__images__image-single,
  main .mod-scroll__images.principal > .mod-scroll__images__flip {
    position: relative !important;
    inset: auto !important;
    flex: 0 0 42vw !important;
    width: 42vw !important;
    min-width: 34rem !important;
    height: var(--100vh) !important;
    aspect-ratio: auto !important;
    transform: none !important;
  }

  main .mod-scroll__images.principal > .mod-scroll__images__image-single :is(.media__wrap-source, .media__source),
  main .mod-scroll__images.principal > .mod-scroll__images__flip :is(.media__wrap-source, .media__source) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
}

/*
 * Phone + tablet (<=1024): keep a compact collage like desktop, but with no
 * overlaps. Main plate on top, title in the clear band under it, then the two
 * lower frames side-by-side with a shared gap. Copy and actions stay below.
 *
 *   SUITES AT REST
 *   [======== main ========]
 *   FRAMED BY THE NILE
 *   [portrait] [detail]
 *   MADE FOR LIVING + body
 *   actions
 */
@media (max-width: 1024px) {
  html body main .mod-scroll__intro.suites-reference-hero {
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
  }

  html body main .mod-scroll__intro.suites-reference-hero > .wrapper {
    height: auto !important;
    min-height: 0 !important;
  }

  .srh-canvas {
    display: grid !important;
    grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr) !important;
    grid-template-areas:
      "kicker kicker"
      "main main"
      "portrait detail"
      "copy copy"
      "actions actions" !important;
    align-items: start !important;
    column-gap: 0.7rem !important;
    row-gap: 0.7rem !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    padding:
      max(5.5rem, calc(env(safe-area-inset-top, 0px) + 4.5rem))
      clamp(0.95rem, 4vw, 1.5rem)
      max(1.15rem, env(safe-area-inset-bottom, 0px)) !important;
    box-sizing: border-box !important;
  }

  .srh-connectors {
    display: none !important;
  }

  .srh-kicker,
  .srh-title,
  .srh-copy,
  .srh-frame,
  .srh-actions {
    position: relative !important;
    inset: auto !important;
    top: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    width: auto !important;
    max-width: none !important;
    height: auto !important;
    translate: none !important;
    transform: none !important;
  }

  .srh-kicker {
    grid-area: kicker;
    z-index: 2;
    margin: 0 !important;
    font-size: clamp(1.85rem, 8.4vw, 2.75rem) !important;
    line-height: 0.88 !important;
    letter-spacing: -0.04em !important;
    color: #17140f !important;
    -webkit-text-fill-color: #17140f !important;
    text-shadow: none !important;
  }

  .srh-frame--main {
    grid-area: main;
    z-index: 1;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.65rem !important;
    width: 100% !important;
    height: auto !important;
    aspect-ratio: auto !important;
    background: transparent !important;
    border-radius: 0 !important;
    overflow: visible !important;
  }

  .srh-frame--main > img {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 16 / 11 !important;
    object-fit: cover !important;
    object-position: center 48% !important;
    border-radius: 0 0 1.25rem 1.25rem !important;
    transform: none !important;
    animation: none !important;
  }

  .srh-frame__wash {
    display: none !important;
  }

  /* Title sits in the clear band under the main plate — not on the photo. */
  .srh-title {
    position: relative !important;
    inset: auto !important;
    z-index: 2;
    width: 100% !important;
    margin: 0 !important;
    padding: 0.1rem 0 0 !important;
    font-size: clamp(1.95rem, 9.2vw, 2.85rem) !important;
    line-height: 0.86 !important;
    letter-spacing: -0.045em !important;
    color: #17140f !important;
    -webkit-text-fill-color: #17140f !important;
    text-shadow: none !important;
  }

  .srh-frame--portrait {
    grid-area: portrait;
    z-index: 1;
    width: 100% !important;
    aspect-ratio: 3 / 4 !important;
    margin: 0 !important;
    border-radius: 5.5rem 5.5rem 0.25rem 0.25rem !important;
    overflow: hidden !important;
  }

  .srh-frame--portrait img {
    object-position: 45% center !important;
    transform: none !important;
    animation: none !important;
  }

  .srh-frame--detail {
    grid-area: detail;
    z-index: 1;
    width: 100% !important;
    aspect-ratio: 5 / 4 !important;
    margin: 0.85rem 0 0 !important;
    border: 2px solid #f3ede4 !important;
    border-radius: 1.15rem !important;
    overflow: hidden !important;
    box-shadow: 0 0.75rem 1.75rem rgba(20, 18, 14, 0.12) !important;
    align-self: end !important;
  }

  .srh-frame--detail img {
    transform: none !important;
    animation: none !important;
  }

  .srh-copy {
    grid-area: copy;
    z-index: 2;
    margin: 0.15rem 0 0 !important;
    max-width: 100% !important;
  }

  .srh-copy__title {
    font-size: clamp(1.7rem, 8vw, 2.45rem) !important;
    line-height: 0.88 !important;
    letter-spacing: -0.04em !important;
    color: #17140f !important;
    -webkit-text-fill-color: #17140f !important;
  }

  .srh-copy__body {
    display: block !important;
    max-width: 28rem !important;
    margin: 0.4rem 0 0 !important;
    font-size: clamp(0.78rem, 3.2vw, 0.92rem) !important;
    line-height: 1.45 !important;
    color: rgb(64 55 37 / 0.82) !important;
    -webkit-text-fill-color: rgb(64 55 37 / 0.82) !important;
  }

  .srh-copy__line {
    display: inline !important;
  }

  .srh-actions {
    grid-area: actions;
    z-index: 2;
    position: relative !important;
    display: grid !important;
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 0.45rem !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0.45rem !important;
    border-radius: 1rem !important;
    translate: none !important;
  }

  .srh-actions a {
    width: 100% !important;
    min-width: 0 !important;
    height: 2.65rem !important;
    min-height: 44px !important;
    padding: 0.2rem 0.45rem !important;
    font-size: clamp(0.54rem, 2.2vw, 0.68rem) !important;
    letter-spacing: 0.12em !important;
    white-space: nowrap !important;
  }
}

@media (min-width: 481px) and (max-width: 1024px) {
  .srh-canvas {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr) !important;
    column-gap: 1rem !important;
    row-gap: 0.85rem !important;
    padding-inline: clamp(1.5rem, 4vw, 2.5rem) !important;
    padding-bottom: 1.5rem !important;
  }

  .srh-kicker {
    font-size: clamp(2.35rem, 5.4vw, 3.25rem) !important;
  }

  .srh-frame--main {
    gap: 0.8rem !important;
  }

  .srh-frame--main > img {
    aspect-ratio: 16 / 9 !important;
    border-radius: 0 0 1.65rem 1.65rem !important;
  }

  .srh-title {
    font-size: clamp(2.55rem, 5.8vw, 3.6rem) !important;
  }

  .srh-frame--portrait {
    border-radius: 7rem 7rem 0.35rem 0.35rem !important;
  }

  .srh-frame--detail {
    margin-top: 1.15rem !important;
    border-radius: 1.35rem !important;
  }

  .srh-copy__title {
    font-size: clamp(2.15rem, 4.6vw, 3rem) !important;
  }

  .srh-copy__body {
    max-width: 32rem !important;
    font-size: clamp(0.88rem, 1.7vw, 1.02rem) !important;
  }

  .srh-actions {
    max-width: 34rem !important;
    gap: 0.55rem !important;
  }
}

@media (max-width: 480px) {
  .srh-frame--main > img {
    aspect-ratio: 5 / 4 !important;
  }

  .srh-title {
    max-width: 13ch;
  }

  .srh-copy__title {
    max-width: 11ch;
  }

  .srh-frame--detail {
    margin-top: 0.55rem !important;
  }
}

@media (min-width: 1025px) and (max-height: 820px) {
  html body main .mod-scroll__intro.suites-reference-hero {
    min-height: 100svh !important;
  }

  .srh-kicker {
    top: 6.5%;
    font-size: clamp(1.9rem, 4vw, 2.75rem);
  }

  .srh-frame--main {
    top: 11%;
    height: 38%;
  }

  .srh-title {
    font-size: clamp(2.8rem, 6.2vw, 4.3rem);
  }

  .srh-copy {
    top: 54%;
  }

  .srh-copy__title {
    font-size: clamp(2.1rem, 4.8vw, 3.2rem);
  }

  .srh-copy__body {
    display: none;
  }

  .srh-frame--portrait {
    top: 48%;
    bottom: 14%;
    width: 26%;
  }

  .srh-frame--detail {
    top: 50%;
    height: 22%;
    width: 34%;
  }

  .srh-actions {
    bottom: 0.7%;
    gap: 0.4rem;
    padding: 0.4rem;
  }

  .srh-actions a {
    min-height: 2.55rem;
    height: 2.55rem;
    font-size: 0.62rem;
    letter-spacing: 0.12em;
  }
}

@media (max-height: 700px) and (min-width: 1025px) {
  .srh-kicker { top: 9%; }
  .srh-actions { bottom: 1%; }
  .srh-actions a { min-height: 2.8rem; }
}

@media (prefers-reduced-motion: reduce) {
  .srh-frame img,
  .srh-kicker,
  .srh-title,
  .srh-copy__title,
  .srh-copy__body,
  .srh-actions,
  .srh-connector,
  .srh-connector__dot {
    animation: none !important;
    opacity: 1 !important;
    stroke-dashoffset: 0 !important;
    transform: none !important;
  }
}
`;

type Box = { left: number; top: number; right: number; bottom: number; cx: number; cy: number };

function boxOf(canvas: DOMRect, el: Element | null): Box | null {
  if (!el) return null;
  const b = el.getBoundingClientRect();
  if (b.width <= 0 || b.height <= 0) return null;
  const left = b.left - canvas.left;
  const top = b.top - canvas.top;
  return {
    left,
    top,
    right: left + b.width,
    bottom: top + b.height,
    cx: left + b.width / 2,
    cy: top + b.height / 2,
  };
}

/**
 * Picks the x for a connector's vertical run so the stroke travels down an empty
 * channel. Starts from the midpoint and, for any frame the run would cross over
 * its y-span, slides to the nearer side of that frame plus a clearance gap. This
 * is what keeps the hairline off the photography instead of drawing across it.
 */
function channelX(
  preferred: number,
  y1: number,
  y2: number,
  obstacles: Box[],
  clearance = 7,
) {
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  let x = preferred;

  for (const o of obstacles) {
    if (o.bottom <= top || o.top >= bottom) continue; // no shared y-span
    if (x <= o.left - clearance || x >= o.right + clearance) continue;
    const toLeft = o.left - clearance;
    const toRight = o.right + clearance;
    x = Math.abs(x - toLeft) <= Math.abs(x - toRight) ? toLeft : toRight;
  }
  return x;
}

/**
 * Orthogonal elbow from (x1,y1) to (x2,y2): run horizontally, turn once, then
 * run vertically into the target. Corners are quadratic so they read as the
 * same drawn hairline the rest of the hero uses. `runX` overrides where the
 * vertical leg sits, so it can be routed down a known-empty channel.
 */
function elbow(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number,
  runX?: number,
) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (Math.abs(dy) < 1) return `M ${x1} ${y1} H ${x2}`;
  if (Math.abs(dx) < 1) return `M ${x1} ${y1} V ${y2}`;

  const midX = runX ?? x1 + dx / 2;
  const legIn = midX - x1;
  const legOut = x2 - midX;
  const sy = Math.sign(dy);
  const parts: string[] = [];

  // Each leg is emitted only when it has real length. Rounding a zero-length
  // leg used to back the stroke up by the corner radius, which is how the
  // desktop leader ended up nicking the portrait frame it starts beside.
  if (Math.abs(legIn) >= 1) {
    const rIn = Math.min(radius, Math.abs(legIn) / 2, Math.abs(dy) / 2);
    parts.push(`M ${x1} ${y1}`);
    parts.push(`H ${midX - rIn * Math.sign(legIn)}`);
    parts.push(`Q ${midX} ${y1} ${midX} ${y1 + rIn * sy}`);
  } else {
    parts.push(`M ${midX} ${y1}`);
  }

  if (Math.abs(legOut) >= 1) {
    const rOut = Math.min(radius, Math.abs(legOut) / 2, Math.abs(dy) / 2);
    parts.push(`V ${y2 - rOut * sy}`);
    parts.push(`Q ${midX} ${y2} ${midX + rOut * Math.sign(legOut)} ${y2}`);
    parts.push(`H ${x2}`);
  } else {
    parts.push(`V ${y2}`);
  }

  return parts.join(" ");
}

/**
 * Positions the two connectors from the elements they actually join, in a 1:1
 * pixel viewBox. Replaces the previous per-breakpoint hardcoded coordinates in
 * a `preserveAspectRatio="none"` box, which stretched the pin into an ellipse
 * and drifted off its anchors whenever the composition reflowed.
 */
export function layoutSuitesConnectors(doc: Document) {
  const canvasEl = doc.querySelector<HTMLElement>(".srh-canvas");
  const svg = doc.querySelector<SVGSVGElement>(".srh-connectors");
  if (!canvasEl || !svg) return false;

  // Phone/tablet stacked hero hides connectors; skip measuring.
  const win = doc.defaultView;
  if (win && win.innerWidth <= 1024) {
    svg.removeAttribute("data-srh-measured");
    return true;
  }

  const canvas = canvasEl.getBoundingClientRect();
  if (canvas.width <= 0 || canvas.height <= 0) return false;

  const portrait = boxOf(canvas, doc.querySelector(".srh-frame--portrait"));
  const copy = boxOf(canvas, doc.querySelector(".srh-copy"));
  const copyTitle = boxOf(canvas, doc.querySelector(".srh-copy__title"));
  const detail = boxOf(canvas, doc.querySelector(".srh-frame--detail"));
  if (!portrait || !copy || !copyTitle || !detail) return false;

  svg.setAttribute("viewBox", `0 0 ${canvas.width} ${canvas.height}`);
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

  // Matches the 1024px stacked-composition breakpoint in the stylesheet.
  const narrow = canvas.width <= 1024;
  const dotR = narrow ? 3.5 : 4;

  const apply = (selector: string, d: string | null) => {
    const path = svg.querySelector<SVGPathElement>(selector);
    if (!path) return;
    if (!d) {
      path.removeAttribute("d");
      path.style.setProperty("--srh-len", "0");
      return;
    }
    path.setAttribute("d", d);
    path.style.setProperty("--srh-len", `${path.getTotalLength()}`);
  };

  const main = boxOf(canvas, doc.querySelector(".srh-frame--main"));
  const frames = [portrait, detail, ...(main ? [main] : [])];

  const dot = svg.querySelector<SVGCircleElement>(".srh-connector__dot");
  const placePin = (x: number, y: number) => {
    if (!dot) return;
    dot.setAttribute("cx", String(x));
    dot.setAttribute("cy", String(y));
    dot.setAttribute("r", String(dotR));
  };

  // A leader is only drawn where its channel is wide enough to read as a
  // deliberate rule rather than a stub against the neighbouring element.
  const MIN_CHANNEL = 22;

  if (narrow) {
    // Portrait collage: one leader crossing the channel held open between the
    // arch and the detail card. Pin and stroke both sit inside that channel -
    // neither touches the photography.
    const gap = detail.left - portrait.right;
    if (gap < MIN_CHANNEL) {
      apply(".srh-connector--portrait", null);
      apply(".srh-connector--copy", null);
      placePin(portrait.right + gap / 2, portrait.top - 12);
      svg.setAttribute("data-srh-measured", "true");
      return true;
    }

    const runX = portrait.right + gap / 2;
    // Start below the main plate's lower edge: the collage overlaps the frames
    // there, and a leader starting higher would be drawn across the photograph.
    const pinY = Math.max(portrait.top + 14, (main ? main.bottom : 0) + 12);
    placePin(runX, pinY);
    apply(
      ".srh-connector--portrait",
      elbow(
        runX,
        pinY + dotR + 4,
        runX,
        detail.top + (detail.bottom - detail.top) * 0.62,
        6,
        runX,
      ),
    );
    apply(".srh-connector--copy", null);
    svg.setAttribute("data-srh-measured", "true");
    return true;
  }

  const titleMid = copyTitle.top + (copyTitle.bottom - copyTitle.top) * 0.5;

  // Desktop leader 1: down the channel between the arch and the main plate. The
  // run is pushed clear of both frames, and the pin rides the channel rather
  // than sitting half-on the portrait's edge.
  if (copyTitle.left - portrait.right >= MIN_CHANNEL) {
    const runX = channelX(
      portrait.right + (copyTitle.left - portrait.right) / 2,
      portrait.cy,
      titleMid,
      frames,
    );
    placePin(runX, portrait.cy);
    apply(
      ".srh-connector--portrait",
      elbow(runX, portrait.cy + dotR + 4, copyTitle.left - 10, titleMid, 16, runX),
    );
  } else {
    placePin(portrait.right + 10, portrait.cy);
    apply(".srh-connector--portrait", null);
  }

  // Desktop leader 2: out of the copy column and into the detail card's edge.
  if (detail.left - copy.right >= MIN_CHANNEL) {
    const y1 = copyTitle.top + (copyTitle.bottom - copyTitle.top) * 0.62;
    const y2 = detail.top + (detail.bottom - detail.top) * 0.55;
    const runX = channelX(copy.right + (detail.left - copy.right) / 2, y1, y2, frames);
    apply(".srh-connector--copy", elbow(copy.right + 10, y1, detail.left - 6, y2, 16, runX));
  } else {
    apply(".srh-connector--copy", null);
  }

  svg.setAttribute("data-srh-measured", "true");
  return true;
}

export function mountSuitesReferenceHero(doc: Document) {
  const intro = doc.querySelector<HTMLElement>(".mod-scroll__intro");
  const wrapper = intro?.querySelector<HTMLElement>(":scope > .wrapper");
  if (!intro || !wrapper) return false;

  intro.classList.add("suites-reference-hero");
  if (!wrapper.querySelector(".srh-canvas")) {
    wrapper.innerHTML = HERO_MARKUP;
  }
  layoutSuitesConnectors(doc);
  return true;
}

/**
 * Keeps the connectors pinned to their anchors as the hero reflows (viewport
 * resize, font swap, orientation change). Returns a disposer.
 */
export function observeSuitesConnectors(doc: Document) {
  const canvas = doc.querySelector<HTMLElement>(".srh-canvas");
  const view = doc.defaultView;
  if (!canvas || !view) return () => {};

  let frame = 0;
  const schedule = () => {
    view.cancelAnimationFrame(frame);
    frame = view.requestAnimationFrame(() => layoutSuitesConnectors(doc));
  };

  const observer = new view.ResizeObserver(schedule);
  observer.observe(canvas);
  view.addEventListener("orientationchange", schedule);
  void doc.fonts?.ready.then(schedule).catch(() => {});

  return () => {
    view.cancelAnimationFrame(frame);
    observer.disconnect();
    view.removeEventListener("orientationchange", schedule);
  };
}
