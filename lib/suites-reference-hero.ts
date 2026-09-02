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
      <p class="srh-copy__body">Quiet, crafted comfort; river light;<br>the Nile just beyond the glass.</p>
    </div>

    <svg class="srh-connectors" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <g class="srh-connectors__set srh-connectors__set--desktop">
        <path class="srh-connector srh-connector--portrait" pathLength="1" d="M 26.2 42.9 V 61.7 Q 26.2 65.7 30.2 65.7 H 35.4"></path>
        <circle class="srh-connector__dot" cx="26.2" cy="42.9" r="0.34"></circle>
        <path class="srh-connector srh-connector--copy" pathLength="1" d="M 42.4 70.55 H 63.8 Q 66.1 70.55 66.1 72.85 V 76.45 Q 66.1 78.75 68.4 78.75 H 70.1"></path>
      </g>
      <g class="srh-connectors__set srh-connectors__set--tablet">
        <path class="srh-connector srh-connector--portrait" pathLength="1" d="M 33 59.2 V 77 Q 33 80 36 80 H 39"></path>
        <circle class="srh-connector__dot" cx="33" cy="59.2" r="0.38"></circle>
        <path class="srh-connector srh-connector--copy" pathLength="1" d="M 49 69.5 H 55.5 Q 58 69.5 58 72 V 74 Q 58 76.5 60.5 76.5 H 62"></path>
      </g>
      <g class="srh-connectors__set srh-connectors__set--phone">
        <path class="srh-connector srh-connector--portrait" pathLength="1" d="M 38.2 56 V 70.5 Q 38.2 73.5 41.2 73.5 H 43"></path>
        <circle class="srh-connector__dot" cx="38.2" cy="56" r="0.5"></circle>
        <path class="srh-connector srh-connector--copy" pathLength="1" d="M 39 79.2 H 62 Q 65 79.2 65 82.2 V 83.2 Q 65 85.2 67 85.2 H 70"></path>
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
  display: none;
}

.srh-connectors__set--desktop {
  display: block;
}

.srh-connector {
  fill: none !important;
  stroke: #c3a158 !important;
  stroke-width: 1.15;
  vector-effect: non-scaling-stroke;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: srh-draw-connector 1.25s .58s cubic-bezier(.65,0,.2,1) forwards;
}

.srh-connector--copy {
  animation-delay: .78s;
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

@media (min-width: 951px) {
  main .mod-scroll__images.principal {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(2, minmax(34rem, 42vw));
    align-items: start;
    gap: clamp(1.5rem, 3vw, 3.25rem);
    width: max-content;
    padding: 0 clamp(1rem, 2vw, 2.5rem);
    overflow: clip;
  }

  main .mod-scroll__images.principal > .mod-scroll__images__image-single,
  main .mod-scroll__images.principal > .mod-scroll__images__flip {
    position: relative;
    inset: auto;
    width: 42vw;
    min-width: 34rem;
    height: var(--100vh);
    aspect-ratio: auto;
    transform: none;
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
    left: 35.5%;
  }

  .srh-copy__title {
    font-size: clamp(2.55rem, 6.2vw, 4.25rem);
  }

  .srh-copy__body {
    display: none;
  }

  .srh-frame--detail {
    top: 53.5%;
    right: 3.5%;
    width: 37%;
    height: 28%;
    border-radius: 1.7rem;
  }

  .srh-connectors__set--desktop {
    display: none;
  }

  .srh-connectors__set--tablet {
    display: block;
  }

  .srh-actions {
    gap: .5rem;
    padding: .5rem;
  }

  .srh-actions a {
    min-height: 2.85rem;
    font-size: .7rem;
    letter-spacing: .16em;
  }
}

@media (max-width: 880px) and (min-width: 481px) {
  html body main .mod-scroll__intro.suites-reference-hero {
    min-height: 45rem !important;
  }

  .srh-frame--portrait {
    bottom: 19%;
  }

  .srh-frame--detail {
    height: 25%;
  }

  .srh-actions {
    grid-template-columns: repeat(2, 12.5rem);
  }
}

@media (max-width: 480px) {
  html body main .mod-scroll__intro.suites-reference-hero {
    min-height: 44rem !important;
  }

  .srh-kicker {
    top: 5.25rem;
    left: 1rem;
    font-size: clamp(1.9rem, 9.4vw, 2.55rem);
    line-height: .86;
  }

  .srh-frame--main {
    top: 8.65rem;
    right: 1rem;
    left: 1rem;
    width: auto;
    height: 36.5%;
    border-radius: 0 0 0 1.9rem;
  }

  .srh-frame--main img {
    object-position: 55% center;
  }

  .srh-title {
    right: .75rem;
    bottom: 1rem;
    left: .9rem;
    font-size: clamp(2.8rem, 13vw, 4rem);
    line-height: .86;
  }

  .srh-frame--portrait {
    top: 48.5%;
    bottom: auto;
    left: 1rem;
    width: 34%;
    height: 25%;
    border-radius: 7rem 7rem 0 0;
  }

  .srh-frame--portrait img {
    object-position: 45% center;
  }

  .srh-frame--detail {
    top: 51.5%;
    right: 1rem;
    width: 57%;
    height: 22.5%;
    border-width: 2px;
    border-radius: 1.25rem;
  }

  .srh-copy {
    top: 75.5%;
    left: 1rem;
  }

  .srh-copy__title {
    font-size: clamp(2rem, 9.2vw, 2.75rem);
    line-height: .86;
  }

  .srh-connectors__set--tablet {
    display: none;
  }

  .srh-connectors__set--phone {
    display: block;
  }

  .srh-actions {
    right: .7rem;
    bottom: .65rem;
    left: .7rem;
    width: auto;
    translate: 0 0;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: .4rem;
    padding: .45rem;
    border-radius: 1rem;
  }

  .srh-actions a {
    width: 100%;
    min-width: 0;
    height: 2.85rem;
    min-height: 2.85rem;
    padding: .25rem .4rem;
    font-size: .58rem;
    letter-spacing: .12em;
  }
}

@media (max-height: 700px) and (min-width: 481px) {
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

export function mountSuitesReferenceHero(doc: Document) {
  const intro = doc.querySelector<HTMLElement>(".mod-scroll__intro");
  const wrapper = intro?.querySelector<HTMLElement>(":scope > .wrapper");
  if (!intro || !wrapper) return false;

  intro.classList.add("suites-reference-hero");
  if (!wrapper.querySelector(".srh-canvas")) {
    wrapper.innerHTML = HERO_MARKUP;
  }
  return true;
}
