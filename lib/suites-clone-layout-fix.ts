/**
 * Suites clone layout fixes that must win over the baked clone CSS. Loaded in
 * the iframe tail, before SUITES_MOBILE_DESIGN_CSS.
 *
 * Desktop and shared rules only (mosaic, Request Availability pill,
 * circle→pill, footer seat). Phone and tablet art direction lives in
 * lib/suites-mobile-design.ts.
 */

const PILL = `
  box-sizing: border-box !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.5rem !important;
  width: max-content !important;
  min-width: 12.5rem !important;
  max-width: 100% !important;
  height: 2.85rem !important;
  min-height: 2.85rem !important;
  max-height: 2.85rem !important;
  padding: 3px 1.75rem 1px !important;
  border-width: 1px !important;
  border-style: solid !important;
  border-radius: 999px !important;
  font-family: "Plus Jakarta Sans", "Piloner Semibold", sans-serif !important;
  font-size: 0.72rem !important;
  font-weight: 500 !important;
  font-style: normal !important;
  line-height: 1 !important;
  letter-spacing: 0.18em !important;
  text-transform: uppercase !important;
  text-align: center !important;
  text-decoration: none !important;
  white-space: nowrap !important;
  aspect-ratio: auto !important;
  overflow: hidden !important;
`;

export const SUITES_CLONE_LAYOUT_FIX_CSS = `
/* DNA pills that also apply when circle→pill neutralization runs. */
html body main .mod-content__btn,
html body main .btn--circle {
  ${PILL}
}

html body main .mod-content--center {
  overflow: visible !important;
  padding: 2.25rem var(--wrapper-padd) 2.75rem !important;
}

html body main .mod-content--center .mod-content__col {
  display: flex !important;
  justify-content: center !important;
  width: 100% !important;
  max-width: 100% !important;
  padding-inline: var(--wrapper-padd, 1rem) !important;
}

html body main .mod-content--cols {
  padding: 2rem var(--wrapper-padd) 1.25rem !important;
}

html body main .mod-content--cols .mod-content__text,
html body main .mod-content--cols .mod-content__text p,
html body main .mod-content--cols .mod-content__text a {
  color: #4a453c !important;
  -webkit-text-fill-color: #4a453c !important;
  font-size: clamp(0.98rem, 2.8vw, 1.12rem) !important;
  line-height: 1.55 !important;
}

html body main .mod-content__btn.btn--bg-xl,
html body main .mod-content__btn.t-titulo {
  font-size: 0.72rem !important;
  font-style: normal !important;
  background: #12100c !important;
  border-color: #12100c !important;
  color: #cdb684 !important;
  -webkit-text-fill-color: #cdb684 !important;
}

html body main .mod-footer__content__project__wrap-image {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  position: relative !important;
  gap: 0.85rem !important;
  padding: 1.25rem var(--wrapper-padd) 1.75rem !important;
}

html body main .mod-footer__content__project__wrap-image .btn--circle,
html body main .mod-footer__content__project__wrap-image a.btn {
  position: relative !important;
  inset: auto !important;
  top: auto !important;
  left: auto !important;
  right: auto !important;
  order: 2 !important;
  margin: 0 auto !important;
  transform: none !important;
  z-index: 2 !important;
  ${PILL}
  background: #12100c !important;
  border-color: #12100c !important;
  color: #cdb684 !important;
  -webkit-text-fill-color: #cdb684 !important;
}

html body main .mod-footer__content__project__image {
  order: 1 !important;
  width: 100% !important;
  border-radius: 0 !important;
  overflow: hidden !important;
}

html body main .mod-footer__content__project__year,
html body main .mod-footer__content__project__name,
html body main .mod-footer__content__project__text,
html body main .mod-footer__content__project__text * {
  color: #241d14 !important;
  -webkit-text-fill-color: #241d14 !important;
}

html body main .mod-footer__content__project__wrap-image .follow__mouse,
html body header .header__menu__media .follow__mouse {
  display: none !important;
  pointer-events: none !important;
}

html body main .d-none.d-md-flex.btn--circle {
  display: inline-flex !important;
}

@media (pointer: coarse) {
  html body .follow__mouse {
    display: none !important;
    pointer-events: none !important;
  }
  html body .mod-scroll__terms .follow__mouse {
    display: grid !important;
    pointer-events: auto !important;
  }
}

/* Mosaic gutters — keep desktop gold mosaic; square only ≤1024. */
html body main .mod-media--double,
html body main .mod-media--mosaic {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 0.55rem !important;
  align-items: stretch !important;
  justify-content: stretch !important;
  width: 100% !important;
  max-width: 100% !important;
  padding: 0.55rem !important;
  background: #a3945e !important;
  box-sizing: border-box !important;
}

html body main .mod-media--double .mod-media__item,
html body main .mod-media--mosaic .mod-media__item,
html body main .mod-media--double .col-6,
html body main .mod-media--double .col-4 {
  width: 100% !important;
  max-width: 100% !important;
  flex: none !important;
  aspect-ratio: 4 / 5 !important;
  overflow: hidden !important;
  border-radius: 0 !important;
}

html body main .mod-media--double .mod-media__item :is(.media__wrap-source, .media__source),
html body main .mod-media--mosaic .mod-media__item :is(.media__wrap-source, .media__source) {
  width: 100% !important;
  height: 100% !important;
  max-height: none !important;
  object-fit: cover !important;
}

@media (min-width: 1025px) {
  html body main .mod-media--double .mod-media__item,
  html body main .mod-media--mosaic .mod-media__item,
  html body main .mod-media--double .col-6,
  html body main .mod-media--double .col-4 {
    aspect-ratio: 4 / 3 !important;
  }

  /*
   * Horizon close: one 100vw split (image | statement), then one full plate.
   * The clone's last-item carousel was stacking the same rooms and squeezing
   * the headline into a sliver before the cierre sand field.
   */
  html body main .mod-scroll__projects .last-item {
    position: relative !important;
    min-width: 100vw !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100svh !important;
    overflow: hidden !important;
    transform: none !important;
    translate: none !important;
  }

  html body main .mod-scroll__projects .last-item > .mod-scroll__projects__item__content {
    width: 42vw !important;
    height: 100% !important;
    transform: none !important;
  }

  html body main .mod-scroll__projects .last-item__content {
    position: absolute !important;
    left: 42vw !important;
    top: 0 !important;
    width: 58vw !important;
    max-width: 58vw !important;
    height: 100% !important;
    transform: none !important;
    translate: none !important;
    overflow: visible !important;
    background: #fff !important;
  }

  html body main .mod-scroll__projects .last-item__content__wrap {
    position: relative !important;
    inset: auto !important;
    width: 100% !important;
    max-width: none !important;
    height: 100% !important;
    overflow: visible !important;
    padding-right: clamp(2rem, 4vw, 4.5rem) !important;
  }

  html body main .mod-scroll__projects .last-item__content__title,
  html body main .mod-scroll__projects .last-item__content__title .line,
  html body main .mod-scroll__projects .last-item__content__text p .line {
    overflow: visible !important;
    max-width: none !important;
  }

  html body main .mod-scroll__projects .last-item__content .char,
  html body main .mod-scroll__projects .last-item__content__text span,
  html body main .mod-scroll__projects .last-item__content__section {
    transform: none !important;
    translate: none !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  html body main .mod-scroll__projects .last-item__carousel {
    display: none !important;
  }

  html body main .mod-scroll__projects .last-item a.last-item__carousel__item--link,
  html body main .mod-scroll__projects .last-item a.hathor-horizon-cta {
    ${PILL}
    margin-top: 1.75rem !important;
    background: #14120e !important;
    border-color: #14120e !important;
    color: #cdb684 !important;
    -webkit-text-fill-color: #cdb684 !important;
  }

  html body main .mod-scroll__projects .last-item a.last-item__carousel__item--link svg,
  html body main .mod-scroll__projects .last-item a.hathor-horizon-cta svg {
    display: none !important;
  }

  html body main .mod-scroll__projects .last-item a.last-item__carousel__item--link .last-item__carousel__item__text,
  html body main .mod-scroll__projects .last-item a.hathor-horizon-cta .last-item__carousel__item__text {
    font-family: inherit !important;
    font-size: inherit !important;
    font-style: normal !important;
    letter-spacing: inherit !important;
    color: inherit !important;
    -webkit-text-fill-color: inherit !important;
  }

  html body main .mod-scroll__pin {
    display: none !important;
    width: 0 !important;
    min-width: 0 !important;
  }

  html body main .mod-scroll__cierre {
    width: 100vw !important;
    min-width: 100vw !important;
    overflow: hidden !important;
  }

  html body main .mod-scroll__cierre__content {
    position: relative !important;
    display: block !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100svh !important;
    padding: 0 !important;
    overflow: hidden !important;
    transform: none !important;
    translate: none !important;
  }

  html body main .mod-scroll__cierre__content::after,
  html body main .mod-scroll__cierre__content .mod-scroll__logo,
  html body main .mod-scroll__cierre__content .mod-scroll__footer-logo {
    display: none !important;
  }

  html body main .mod-scroll__cierre__content__image {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    max-width: none !important;
    height: 100% !important;
    aspect-ratio: auto !important;
    border-radius: 0 !important;
    transform: none !important;
    translate: none !important;
  }

  html body main .mod-scroll__cierre__content__image > .flipMedia__media {
    position: absolute !important;
    inset: 0 !important;
    width: 100% !important;
    height: 100% !important;
    transform: none !important;
    translate: none !important;
  }

  html body main .mod-scroll__cierre__content__image > .flipMedia__media--down {
    opacity: 0 !important;
  }

  html body main .mod-scroll__cierre__content__image > .flipMedia__media--up {
    opacity: 1 !important;
  }

  html body main .mod-scroll__cierre__content__image :is(.media__wrap-source, .media__source, img) {
    width: 100% !important;
    height: 100% !important;
    max-width: none !important;
    object-fit: cover !important;
    object-position: center !important;
  }

  html body main .mod-title--lines {
    display: grid !important;
    grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
    column-gap: var(--grid-gap, 1rem) !important;
    row-gap: 0 !important;
    align-items: end !important;
    padding: clamp(5.5rem, 8vw, 8rem) var(--wrapper-padd, 2.5rem) 0 !important;
  }

  html body main .mod-title--lines .line {
    overflow: visible !important;
    width: auto !important;
    max-width: none !important;
  }

  html body main .mod-title--lines .line:nth-child(1),
  html body main .mod-title--lines .line:nth-child(2) {
    grid-column: 1 / 9 !important;
    text-align: left !important;
  }

  html body main .mod-title--lines .line:nth-child(3) {
    grid-column: 9 / -1 !important;
    text-align: left !important;
    padding-bottom: 0.15em !important;
  }

  html body main .mod-content--cols {
    padding: 1.5rem var(--wrapper-padd, 2.5rem) 0 !important;
  }

  html body main .mod-content--cols .mod-content__col:not(.big_text) {
    display: none !important;
  }

  html body main .mod-content--cols .mod-content__col.big_text {
    width: calc((100% - var(--grid-gap, 1rem) * 11) / 12 * 4 + var(--grid-gap, 1rem) * 3) !important;
    margin-left: auto !important;
    padding-top: 1.15rem !important;
    border-top: 1px solid rgb(182 159 100 / 0.45) !important;
  }

  html body main .mod-content--center {
    justify-content: flex-end !important;
    padding: 1.35rem var(--wrapper-padd, 2.5rem) clamp(4rem, 7vw, 6.5rem) !important;
  }

  html body main .mod-content--center .mod-content__col {
    width: calc((100% - var(--grid-gap, 1rem) * 11) / 12 * 4 + var(--grid-gap, 1rem) * 3) !important;
    justify-content: flex-start !important;
    padding-inline: 0 !important;
  }

  html body .hathor-lux-footer-host {
    display: block !important;
    padding-bottom: 0 !important;
  }
}

html body .hathor-lux-footer-host {
  position: relative !important;
  z-index: 5 !important;
  background: transparent !important;
}

@media (max-width: 1024px) {
  html body .hathor-lux-footer-host {
    padding-bottom: calc(5.5rem + env(safe-area-inset-bottom, 0px)) !important;
  }
}
`;

export const SUITES_LUX_FOOTER_HOST_HTML = `
<div class="hathor-lux-footer-host" data-hathor-suites-lux-footer="1">
  <footer class="hf is-revealed" role="contentinfo">
    <div class="hf__ghost" aria-hidden="true">
      <svg viewBox="0 4 250 56" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <path fill="currentColor" d="M158.42,56.79l-6.04-.02c-.27-.49-.23-1.06-.12-1.62.38-.06.66-.07.99-.28v-17.75s-21.23.02-21.23.02l-.08,16.68,1.47,3.05-7.45-.08,1.74-2.99V21.52s4.29,1.19,4.29,1.19l.02,12.99,21.21.04.05-10.26c0-1.19,1.68-.19,4.05-1.15l.05,30.62,1.17.18c.1.53.13.99-.11,1.65Z"/>
        <path fill="currentColor" d="M105.6,56.84l-7.74.03,1.9-2.89v-31.12s-10.56-.01-10.56-.01c-.49.62-.74,1.18-1.5,1.69v-4.56s29.47-.01,29.47-.01v4.68s-1.62-1.81-1.62-1.81l-11.45.03-.02,31.14,1.51,2.83Z"/>
        <path fill="currentColor" d="M201.86,28.83c-2.42-4.17-6.25-6.86-10.69-8.08-.11-.46.32-.76.76-.73,3.33.2,6.35,1.48,8.99,3.44,5.45,4.03,8.22,10.38,7.57,17.12-.7,7.32-5.44,13.35-12.42,15.82-7.75,2.74-16.61.64-22.25-5.39-2.43-2.6-3.81-5.7-4.44-9.13-1.84-10.03,4.23-19.57,14.13-22.04.35-.09.62.12.64.37.02.18-.03.59-.32.71-5.63,2.27-9.72,7.08-10.91,13.12-1.12,5.72.39,11.67,4.25,16.04,2.82,3.19,6.65,4.78,10.84,4.97,5.6.26,10.67-2.36,13.63-7.14,3.58-5.77,3.69-13.11.22-19.08Z"/>
        <path fill="currentColor" d="M193.87,14.12c-1.91.92-3.82.77-5.49-.32l-2.51-1.63-2.25-.38c-.17-.03-.37-.17-.44-.29-.3-.5,1.86-1.82,3.92-.34,2.64,1.89,5.87,1.82,8.36-.28.3-.25.87-.25,1.19-.15.3.09.78.58.47,1.04-.72,1.11-2.02,1.75-3.26,2.35Z"/>
        <circle fill="currentColor" cx="190.3" cy="8.8" r="1.92"/>
        <path fill="currentColor" d="M228.68,40.59c4.67.07,8.49-3.01,9.48-7.58.83-3.82-.57-7.44-3.87-9.62-2.64-1.74-5.89-2.2-8.97-1.45v31.84s1.58,3.07,1.58,3.07h-7.73s2.03-3.01,2.03-3.01v-31.22s-1.8-2.37-1.8-2.37l7.09-.11c6.6-.1,13.44,1.03,15.58,7.88,1.8,5.74-1.52,11.75-7.27,13.59.76,1.53,1.74,2.52,2.67,3.74,3.35,4.37,7.2,7.97,11.85,11.46-2.9.72-5.71-.41-8-2.2-3.82-2.97-6.94-6.58-9.94-10.37l-2.7-3.67Z"/>
        <path fill="currentColor" d="M34.02,56.81l-7.53.1,1.91-2.88.02-16.9H6.81s-.06,5.44-.06,5.44c-.04,3.85-.2,7.62.09,11.44l1.4,2.85-7.57.03,1.82-2.88.03-31.55-1.71-2.24h6.91c.18-.01.22.68.08.8-.17.14-.55.2-1,.27-.26,4.8-.06,9.59-.01,14.44h21.62s-.05-13.14-.05-13.14c0-.92-1.24-1.36-1.61-2.36l6.69-.02c.27,0,.34.46.27.64-.19.49-1.14.27-1.14,1.14v31.94s1.44,2.88,1.44,2.88Z"/>
        <path fill="currentColor" d="M60.48,42.7c-1.66,1.17-3.14,2.4-4.45,3.86-2.22,2.49-4.31,4.96-5.83,7.97-.25.49.25,1.46-.39,1.95l-7.33.03c4.46-5.23,9.12-9.95,14.17-14.45,3.13-2.85,6.59-5.08,10.69-6.25l-4.81-11.14-7.62,16.23c-.48,1.12-1.34,1.91-2.54,2.29l11.78-27.51,12.11,26.46,4.05,8.94c.95,2.1,1.98,4,3.5,5.83-1.4.5-2.6.04-3.77-.63-4.1-2.36-6.15-8-7.93-12.44l3.54-.14c.63-.8-.24-2.15-1.26-2.32-4.69-.78-9.96-1.45-13.91,1.33Z"/>
      </svg>
    </div>

    <div class="hf__media" aria-hidden="true">
      <video class="hf__video" muted loop playsinline preload="none" tabindex="-1" aria-hidden="true" data-hathor-footer-reel="/media/hathor/videos/footer-dahabiya-cruise-nile-egypt-tours.mp4"></video>
    </div>

    <div class="hf__inner">
      <div class="hf__lede">
        <div>
          <h2 class="hf__title">Your Nile Story<br />Begins Here</h2>
          <p class="hf__script">Adventures the Nile</p>
        </div>
        <div class="hf__desk">
          <p class="hf__eyebrow">Private Reservations</p>
          <div class="hf__actions">
            <a class="hf__cta hf__cta--fill" href="/suites?book=1" target="_top" data-ajax-page-ignore>Book Now</a>
            <a class="hf__cta hf__cta--line" href="/charter" target="_top" data-ajax-page-ignore>Charter the Boat</a>
          </div>
        </div>
      </div>

      <div class="hf__nav">
        <nav class="hf__col" aria-labelledby="hf-col-explore">
          <h3 class="hf__col-title" id="hf-col-explore">Explore</h3>
          <ul class="hf__links">
            <li><a class="hf__link" href="/cruises-list" target="_top" data-ajax-page-ignore>Cruises</a></li>
            <li><a class="hf__link" href="/suites" target="_top" data-ajax-page-ignore>Suites</a></li>
            <li><a class="hf__link" href="/luxury-cabins-Nile-Cruise" target="_top" data-ajax-page-ignore>Cabins</a></li>
            <li><a class="hf__link" href="/charter" target="_top" data-ajax-page-ignore>Private Charter</a></li>
          </ul>
        </nav>
        <nav class="hf__col" aria-labelledby="hf-col-aboard">
          <h3 class="hf__col-title" id="hf-col-aboard">Aboard</h3>
          <ul class="hf__links">
            <li><a class="hf__link" href="/gastronomy" target="_top" data-ajax-page-ignore>Gastronomy</a></li>
            <li><a class="hf__link" href="/wellness" target="_top" data-ajax-page-ignore>Seneb Spa</a></li>
            <li><a class="hf__link" href="/royal-suites" target="_top" data-ajax-page-ignore>Royal Suites</a></li>
            <li><a class="hf__link" href="/about" target="_top" data-ajax-page-ignore>About</a></li>
          </ul>
        </nav>
        <nav class="hf__col" aria-labelledby="hf-col-route">
          <h3 class="hf__col-title" id="hf-col-route">Route</h3>
          <ul class="hf__links">
            <li><a class="hf__link" href="/voyages" target="_top" data-ajax-page-ignore>All Voyages</a></li>
            <li><a class="hf__link" href="/voyages/luxor-to-aswan" target="_top" data-ajax-page-ignore>Luxor to Aswan</a></li>
            <li><a class="hf__link" href="/voyages/aswan-to-luxor" target="_top" data-ajax-page-ignore>Aswan to Luxor</a></li>
            <li><a class="hf__link" href="/highlights" target="_top" data-ajax-page-ignore>Highlights</a></li>
          </ul>
        </nav>
      </div>

      <div class="hf__base">
        <p class="hf__legal">© 2019–2026 Hathor Dahabiya · Egypt</p>
        <nav class="hf__utility" aria-label="Legal and contact">
          <a class="hf__base-link" href="/contact" target="_top" data-ajax-page-ignore>Contact</a>
          <a class="hf__base-link" href="/blogs" target="_top" data-ajax-page-ignore>Journal</a>
          <a class="hf__base-link" href="/partners" target="_top" data-ajax-page-ignore>Partners</a>
          <a class="hf__base-link" href="/terms-and-conditions" target="_top" data-ajax-page-ignore>Terms</a>
        </nav>
        <button type="button" class="hf__top" data-hathor-footer-top aria-label="Back to top of page">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </div>
  </footer>
</div>
`;
/**
 * Wrap suite collection cards (excluding the closing last-item) in a
 * home-3-style horizontal snap rail for phone/tablet.
 */
export function layoutSuitesCollectionRail(doc: Document) {
  const projects = doc.querySelector(".mod-scroll__projects");
  if (!projects) return;

  if (projects.querySelector(":scope > .suites-collection-rail")) return;

  const items = Array.from(
    projects.querySelectorAll<HTMLElement>(
      ":scope > .mod-scroll__projects__item:not(.last-item)",
    ),
  );
  if (items.length < 2) return;

  const rail = doc.createElement("div");
  rail.className = "suites-collection-rail";
  rail.setAttribute("data-hathor-suites-rail", "1");
  items[0].before(rail);
  items.forEach((item) => rail.appendChild(item));
}

type SuitesCaptionTone = "gold" | "ink" | "sand";

function makeSuitesCaption(
  doc: Document,
  id: string,
  kicker: string,
  title: string,
  tone: SuitesCaptionTone = "gold",
) {
  const el = doc.createElement("div");
  el.className =
    tone === "ink"
      ? "suites-slide-caption suites-slide-caption--ink"
      : tone === "sand"
        ? "suites-slide-caption suites-slide-caption--sand"
        : "suites-slide-caption";
  el.setAttribute("data-hathor-suites-caption", id);
  el.innerHTML = `<span class="suites-slide-caption__kicker"></span><span class="suites-slide-caption__title"></span>`;
  const kickerEl = el.querySelector(".suites-slide-caption__kicker");
  const titleEl = el.querySelector(".suites-slide-caption__title");
  if (kickerEl) kickerEl.textContent = kicker;
  if (titleEl) titleEl.textContent = title;
  return el;
}

/**
 * Inject caption panels as same-size flex-rail slides (.suites-slide-caption,
 * aspect-ratio 3/4 via SUITES_CLONE_LAYOUT_FIX_CSS) for principal / secundario /
 * images-text horizontal snap carousels.
 */
export function layoutSuitesSlideCaptionPanels(doc: Document) {
  const principal = doc.querySelector<HTMLElement>(
    ".mod-scroll__images.principal",
  );
  if (principal && !principal.querySelector("[data-hathor-suites-caption]")) {
    const caption = makeSuitesCaption(
      doc,
      "principal-aboard",
      "Aboard Hathor",
      "Rooms composed",
      "ink",
    );
    principal.appendChild(caption);
  }

  const secundario = doc.querySelector<HTMLElement>(
    ".mod-scroll__images.secundario",
  );
  if (secundario && !secundario.querySelector("[data-hathor-suites-caption]")) {
    const firstFlip = secundario.querySelector(".flipMedia");
    const river = makeSuitesCaption(
      doc,
      "secundario-river",
      "01",
      "River Light",
      "gold",
    );
    const calm = makeSuitesCaption(
      doc,
      "secundario-calm",
      "02",
      "Private Calm",
      "sand",
    );
    if (firstFlip?.nextSibling) {
      firstFlip.after(river);
    } else {
      secundario.appendChild(river);
    }
    secundario.appendChild(calm);
  }

  const imagesText = doc.querySelector<HTMLElement>(
    ".mod-scroll__images-text .wrapper",
  );
  if (
    imagesText &&
    !imagesText.querySelector("[data-hathor-suites-caption]")
  ) {
    const craft = makeSuitesCaption(
      doc,
      "images-text-craft",
      "Craft",
      "Nile living",
      "ink",
    );
    const firstFlip = imagesText.querySelector(".flipMedia");
    if (firstFlip?.nextSibling) {
      firstFlip.after(craft);
    } else {
      imagesText.appendChild(craft);
    }
  }

  const link = doc.querySelector<HTMLElement>(
    "a.last-item__carousel__item--link, a.hathor-horizon-cta",
  );
  if (link) {
    link.querySelectorAll("svg, .last-item__carousel__item__arrow").forEach((n) => {
      n.remove();
    });
    const label = link.querySelector(".last-item__carousel__item__text");
    if (label && !label.textContent?.trim()) {
      label.textContent = "View All Suites";
    }
  }
}

type SuitesGsapWin = Window & {
  gsap?: {
    killTweensOf?: (target: unknown) => void;
    set?: (target: unknown, vars: Record<string, unknown>) => void;
  };
  ScrollTrigger?: {
    getAll?: () => Array<{ trigger?: Element | string | null; kill: () => void }>;
  };
};

/**
 * Freeze the clone's last-item carousel (stacked duplicate rooms + squeezed
 * headline) into a readable split, then one full-bleed plate. Moves View All
 * Suites onto the statement as a site pill.
 */
export function layoutSuitesHorizonClose(doc: Document) {
  const last = doc.querySelector<HTMLElement>(
    ".mod-scroll__projects__item.last-item",
  );
  if (!last) return;

  const wrap = last.querySelector<HTMLElement>(".last-item__content__wrap");
  const link = last.querySelector<HTMLAnchorElement>(
    "a.last-item__carousel__item--link",
  );
  if (wrap && link && !wrap.contains(link)) {
    link.classList.add("hathor-horizon-cta");
    link.setAttribute("href", "/rooms");
    link.setAttribute("target", "_top");
    link.querySelectorAll("svg, .last-item__carousel__item__arrow").forEach((n) => {
      n.remove();
    });
    const label = link.querySelector(".last-item__carousel__item__text");
    if (label) label.textContent = "View All Suites";
    wrap.appendChild(link);
  }

  last
    .querySelectorAll(".last-item__carousel__item:not(.last-item__carousel__item--link)")
    .forEach((el) => {
      el.setAttribute("hidden", "");
    });
  const carousel = last.querySelector<HTMLElement>(".last-item__carousel");
  if (carousel && !carousel.querySelector("a.last-item__carousel__item--link")) {
    carousel.setAttribute("hidden", "");
  }

  const win = doc.defaultView as SuitesGsapWin | null;
  if (!win) return;

  if (last.dataset.hathorHorizonBound !== "1") {
    last.dataset.hathorHorizonBound = "1";
    win.setTimeout(() => layoutSuitesHorizonClose(doc), 400);
    win.setTimeout(() => layoutSuitesHorizonClose(doc), 1600);
  }

  if (win.innerWidth <= 1024) return;

  const motion = [
    last,
    last.querySelector(":scope > .mod-scroll__projects__item__content"),
    last.querySelector(".last-item__content"),
    last.querySelector(".last-item__carousel"),
    doc.querySelector(".mod-scroll__pin"),
    doc.querySelector(".mod-scroll__cierre"),
    doc.querySelector(".mod-scroll__cierre__content"),
    doc.querySelector(".mod-scroll__cierre__content__image"),
    ...Array.from(doc.querySelectorAll(".mod-scroll__cierre__content__image > *")),
  ].filter(Boolean);

  try {
    win.gsap?.set?.(motion, {
      clearProps: "transform,translate,x,y,width,height,top,left",
    });
  } catch {
    /* Clone GSAP is optional during early iframe mount. */
  }
}

export function neutralizeSuitesCircleButtons(doc: Document) {
  doc.querySelectorAll(".btn--circle").forEach((node) => {
    const el = node as HTMLElement;
    el.classList.remove("btn--circle", "follow__mouse--md", "d-none", "d-md-flex");
    el.classList.add("btn--bg");
    if (!el.textContent?.trim()) el.textContent = "Explore";
  });
  doc.querySelectorAll(".expand_mouse").forEach((node) => {
    const el = node as HTMLElement;
    el.classList.remove("expand_mouse", "follow__wrap");
    el.removeAttribute("data-text");
  });
}

export function injectSuitesLuxFooter(doc: Document) {
  if (doc.querySelector("[data-hathor-suites-lux-footer]")) return;

  if (!doc.getElementById("hathor-lux-footer-link")) {
    const link = doc.createElement("link");
    link.id = "hathor-lux-footer-link";
    link.rel = "stylesheet";
    link.href = "/suites-normal/styles/hathor-lux-footer.css";
    doc.head.appendChild(link);
  }

  const wrap = doc.createElement("div");
  wrap.innerHTML = SUITES_LUX_FOOTER_HOST_HTML.trim();
  const host = wrap.firstElementChild;
  if (!host) return;

  /* The clone ships its own footer band; the site footer replaces it. */
  const cloneFooter = doc.querySelector(".mod-footer");
  if (cloneFooter?.parentElement) {
    cloneFooter.parentElement.insertBefore(host, cloneFooter.nextSibling);
    cloneFooter.remove();
  } else {
    doc.body?.appendChild(host);
  }

  bindSuitesFooterBehaviour(doc, host);
}

/**
 * The footer inside the clone has no React around it, so the two behaviours the
 * host component gets for free are wired by hand: the reel loads on approach
 * (never on data-saver or reduced motion) and the arrow returns the clone's own
 * scroller to the top.
 */
function bindSuitesFooterBehaviour(doc: Document, host: Element) {
  const view = doc.defaultView;

  const video = host.querySelector<HTMLVideoElement>("[data-hathor-footer-reel]");
  const src = video?.dataset.hathorFooterReel ?? "";
  if (video && src && view) {
    const reduceMotion =
      view.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const connection = (
      view.navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const lightweight =
      connection?.saveData === true ||
      /2g/.test(connection?.effectiveType ?? "");

    const start = () => {
      if (lightweight || video.src) return;
      video.src = src;
      video.addEventListener(
        "loadeddata",
        () => host.querySelector(".hf")?.classList.add("is-on-water"),
        { once: true },
      );
      if (reduceMotion) video.load();
      else void video.play().catch(() => {});
    };

    if (typeof view.IntersectionObserver === "undefined") {
      start();
    } else {
      const observer = new view.IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) start();
            else if (!video.paused) video.pause();
          }
        },
        { rootMargin: "20% 0px 0px", threshold: 0 },
      );
      observer.observe(host);
    }
  }

  host
    .querySelector<HTMLButtonElement>("[data-hathor-footer-top]")
    ?.addEventListener("click", () => {
      const reduceMotion =
        view?.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      view?.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
}

export function stripParenthesesFromSuitesCopy(doc: Document) {
  const root = doc.body;
  if (!root) return;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    const parent = current.parentElement;
    if (
      parent &&
      !parent.closest("script, style, noscript, textarea") &&
      current.nodeValue &&
      /[()]/.test(current.nodeValue)
    ) {
      nodes.push(current as Text);
    }
    current = walker.nextNode();
  }
  nodes.forEach((node) => {
    node.nodeValue = (node.nodeValue ?? "").replace(/[()]/g, "");
  });
}
