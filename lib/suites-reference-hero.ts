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

@media (max-width: 1024px) {
  html body main .mod-scroll__intro.suites-reference-hero {
    min-height: 40rem !important;
  }

  .srh-kicker {
    top: 8.6%;
    left: 5%;
    font-size: clamp(2.65rem, 6.4vw, 4rem);
  }

  .srh-frame--main {
    top: 14.5%;
    right: 4%;
    width: 82%;
    height: 45%;
    border-radius: 0 0 0 2.5rem;
  }

  .srh-title {
    top: auto;
    bottom: 7%;
    left: 5%;
    font-size: clamp(4rem, 9.6vw, 6.4rem);
  }

  .srh-frame--portrait {
    top: 51.5%;
    bottom: 10.5%;
    left: 4%;
    width: 29%;
  }

  .srh-copy {
    top: 62.5%;
    left: 38.5%;
    max-width: 21.5%;
  }

  .srh-copy__title {
    font-size: clamp(1.95rem, 4.7vw, 3.1rem);
  }

  .srh-copy__body {
    display: block;
    max-width: 100%;
  }

  /*
   * The copy column is bounded to the channel between the portrait and detail
   * frames (detail's left edge sits at 62%), so the title and body can no
   * longer run underneath the detail image as they did at 768-1024.
   */
  .srh-frame--detail {
    top: 53.5%;
    right: 2.5%;
    width: 33%;
    height: 28%;
    border-radius: 1.7rem;
  }

  .srh-actions {
    right: auto;
    bottom: 1.4%;
    left: 50%;
    width: auto;
    translate: -50% 0;
    grid-template-columns: repeat(2, minmax(11.5rem, 13.5rem));
    gap: .5rem;
    padding: .5rem;
  }

  .srh-actions a {
    width: 100%;
    min-width: 0;
    min-height: 2.85rem;
    font-size: .7rem;
    letter-spacing: .16em;
  }
}

/*
 * Phones and tablets share one stacked composition. At and below 1024px
 * the three-column editorial layout cannot hold the portrait frame, the copy
 * column and the detail frame plus two connector channels without either
 * colliding or shrinking the display type past the point where it still reads
 * as Hathor, so the hero recomposes rather than compresses.
 */
/*
 * Portrait phones and tablets keep the desktop composition rather than stacking
 * it: the same overlapping collage - kicker in the cream, the main plate held to
 * the right edge with the title set over it, the arch portrait running down the
 * left and crossing the plate's lower corner, the bordered detail card riding
 * the opposite corner, and a connector channel held open between the two lower
 * frames. Only the proportions are transposed for a tall canvas; every element
 * keeps its role, its z-order and its geometry language.
 */
@media (max-width: 1024px) and (orientation: portrait) {
  html body main .mod-scroll__intro.suites-reference-hero {
    height: 100svh !important;
    min-height: 100svh !important;
    overflow: hidden !important;
  }

  html body main .mod-scroll__intro.suites-reference-hero > .wrapper {
    height: 100% !important;
    min-height: 100% !important;
  }

  .srh-canvas {
    height: 100%;
    overflow: hidden;
  }

  .srh-kicker {
    /* rem floor clears the overlaid public navbar on short canvases. */
    top: max(9%, 5.2rem);
    left: 6%;
    font-size: clamp(1.85rem, 8vw, 3.4rem);
    line-height: .86;
  }

  /* Plate holds the right edge exactly as on desktop; title sits over it. */
  .srh-frame--main {
    top: 19%;
    right: 0;
    left: auto;
    width: 92%;
    height: 30%;
    border-radius: 0 0 0 2rem;
  }

  .srh-frame--main img {
    object-position: 55% center;
  }

  .srh-title {
    top: auto;
    right: 5%;
    bottom: 5%;
    left: 5%;
    font-size: clamp(2.2rem, 10.4vw, 4.6rem);
    line-height: .86;
  }

  /* Arch crosses the plate's lower-left corner, as the desktop portrait does. */
  .srh-frame--portrait {
    top: 42%;
    right: auto;
    bottom: auto;
    left: 5%;
    width: 40%;
    height: 27%;
    border-radius: 5rem 5rem 0 0;
  }

  .srh-frame--portrait img {
    object-position: 45% center;
  }

  .srh-frame--detail {
    top: 48%;
    right: 4%;
    left: auto;
    width: 44%;
    height: 19%;
    border-width: 2px;
    border-radius: 1.35rem;
  }

  .srh-copy {
    top: 73%;
    left: 6%;
    max-width: 88%;
  }

  .srh-copy__title {
    font-size: clamp(1.8rem, 7.6vw, 3.2rem);
    line-height: .88;
  }

  .srh-copy__body {
    display: block;
    max-width: 100%;
    margin: .5rem 0 0;
    font-size: clamp(.72rem, 2.9vw, .92rem);
  }

  .srh-copy__line {
    display: inline;
  }

  .srh-actions {
    right: auto;
    bottom: 1.8%;
    left: 50%;
    width: 88%;
    translate: -50% 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: .4rem;
    padding: .45rem;
    border-radius: 1rem;
  }

  /*
   * nowrap keeps every action one line tall. Two-line labels pushed the bar to
   * 142px and, on short phones, past the bottom of the clipped stage.
   */
  .srh-actions a {
    width: 100%;
    min-width: 0;
    height: 2.85rem;
    min-height: 44px;
    padding: .25rem .4rem;
    font-size: clamp(.54rem, 2.2vw, .72rem);
    letter-spacing: .12em;
    white-space: nowrap;
  }
}

/*
 * Short portrait phones: tighten the vertical rhythm and trade the body line for
 * a reachable actions bar. The collage itself is unchanged.
 */
@media (max-width: 1024px) and (orientation: portrait) and (max-height: 720px) {
  .srh-kicker {
    top: max(6.5%, 4.6rem);
  }

  .srh-frame--main {
    top: 19%;
    height: 27%;
  }

  .srh-frame--portrait {
    top: 39%;
    height: 27%;
  }

  .srh-frame--detail {
    top: 45%;
    height: 19%;
  }

  .srh-copy {
    top: 70%;
  }

  .srh-copy__body {
    display: none;
  }

  .srh-actions a {
    height: 44px;
    min-height: 44px;
    letter-spacing: .08em;
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
  const r = Math.min(
    radius,
    Math.abs(legIn) / 2 || radius,
    Math.abs(legOut) / 2 || radius,
    Math.abs(dy) / 2,
  );
  const sx = Math.sign(legIn) || Math.sign(dx);
  const sxOut = Math.sign(legOut) || sx;
  const sy = Math.sign(dy);
  // Horizontal run, rounded turn, vertical run, rounded turn, short horizontal tail.
  return [
    `M ${x1} ${y1}`,
    `H ${midX - r * sx}`,
    `Q ${midX} ${y1} ${midX} ${y1 + r * sy}`,
    `V ${y2 - r * sy}`,
    `Q ${midX} ${y2} ${midX + r * sxOut} ${y2}`,
    `H ${x2}`,
  ].join(" ");
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
