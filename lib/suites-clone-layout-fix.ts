/**
 * Suites clone layout fixes that must win over the baked clone CSS and
 * SUITES_RESPONSIVE_CHOREOGRAPHY_CSS. Loaded last in the iframe tail.
 *
 * Phone ≤480 + tablet ≤1024 unless a rule is unscoped (ref 5 mosaic,
 * Request Availability pill, circle→pill).
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
/* ------------------------------------------------------------------ */
/* Ref 1 — unstack overlapping collages (phone + tablet)               */
/* ------------------------------------------------------------------ */
@media (max-width: 1024px) {
  html body main .mod-scroll__images.principal,
  html body main .mod-scroll__images.secundario {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.85rem !important;
    min-height: 0 !important;
    height: auto !important;
    padding: 1.25rem var(--wrapper-padd) 2rem !important;
    overflow: visible !important;
  }

  html body main .mod-scroll__images.principal > .mod-scroll__images__image-single,
  html body main .mod-scroll__images.principal .flipMedia,
  html body main .mod-scroll__images.principal .flipMedia:nth-of-type(1),
  html body main .mod-scroll__images.principal .flipMedia:nth-of-type(2),
  html body main .mod-scroll__images.secundario .flipMedia,
  html body main .mod-scroll__images.secundario .flipMedia:nth-of-type(1),
  html body main .mod-scroll__images.secundario .flipMedia:nth-of-type(2) {
    position: relative !important;
    inset: auto !important;
    top: auto !important;
    right: auto !important;
    bottom: auto !important;
    left: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    aspect-ratio: 4 / 3 !important;
    margin: 0 !important;
    transform: none !important;
    border: 0 !important;
    box-shadow: none !important;
    z-index: auto !important;
  }

  html body main .mod-scroll__images.principal .flipMedia,
  html body main .mod-scroll__images.principal .flipMedia:nth-of-type(2),
  html body main .mod-scroll__images.secundario .flipMedia:nth-of-type(2) {
    width: 100% !important;
    align-self: stretch !important;
    aspect-ratio: 4 / 3 !important;
  }

  html body main .mod-scroll__images.secundario > .flipMedia:nth-of-type(1) {
    align-self: stretch !important;
    width: 100% !important;
  }

  html body main .mod-scroll__images.principal > .mod-scroll__images__image-single :is(.media, .media__wrap-source, .media__source),
  html body main .mod-scroll__images.principal > .flipMedia :is(.media, .media__wrap-source, .media__source),
  html body main .mod-scroll__images.secundario > .flipMedia :is(.media, .media__wrap-source, .media__source) {
    position: relative !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    object-fit: cover !important;
  }

  html body main .mod-scroll__text {
    position: relative !important;
    z-index: 1 !important;
    padding: 2.75rem var(--wrapper-padd) 2.5rem !important;
  }

  html body main .mod-scroll__text__title__line {
    position: relative !important;
    z-index: 1 !important;
    max-width: 100% !important;
    white-space: normal !important;
    overflow: visible !important;
  }

  html body main .mod-scroll__images-text {
    padding-block: 2.75rem 3rem !important;
  }

  html body main .mod-scroll__images-text .wrapper {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 0.85rem !important;
    padding-inline: var(--wrapper-padd) !important;
  }

  html body main .mod-scroll__images-text .flipMedia,
  html body main .mod-scroll__images-text .flipMedia:nth-of-type(1),
  html body main .mod-scroll__images-text .flipMedia:nth-of-type(2) {
    position: relative !important;
    inset: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    transform: none !important;
    z-index: auto !important;
    aspect-ratio: 4 / 3 !important;
  }

  html body main .mod-scroll__images-text .flipMedia:nth-of-type(2) {
    width: 100% !important;
    align-self: stretch !important;
    aspect-ratio: 4 / 3 !important;
    margin-top: 0 !important;
  }

  html body main .mod-scroll__images-text__text,
  html body main .mod-scroll__images-text__text p,
  html body main .mod-scroll__images-text__text .line {
    position: relative !important;
    z-index: 1 !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0.85rem 0 0 !important;
    white-space: normal !important;
    overflow: visible !important;
    font-size: clamp(1.55rem, 6.4vw, 2.35rem) !important;
    line-height: 1.05 !important;
  }
}

/* ------------------------------------------------------------------ */
/* Ref 2 — compact gold trio, ink on gold (phone + milder tablet)      */
/* ------------------------------------------------------------------ */
@media (max-width: 1024px) {
  html body main .mod-scroll__terms,
  html body main .mod-scroll__terms :is(
    .mod-scroll__terms__term__title,
    .mod-scroll__terms__term__title *,
    .mod-scroll__terms__term__num,
    .mod-scroll__terms__term__text,
    .mod-scroll__terms__term__text *,
    .t-supertitulo-l,
    .t-supertitulo-l *,
    div, span, p, a, strong, em
  ) {
    color: #1c1917 !important;
    -webkit-text-fill-color: #1c1917 !important;
    mix-blend-mode: normal !important;
    filter: none !important;
  }

  html body main .mod-scroll__terms {
    min-height: 0 !important;
    padding: 0 !important;
    gap: 0 !important;
  }

  html body main .mod-scroll__terms__term {
    flex: none !important;
    min-height: 0 !important;
    justify-content: flex-start !important;
    padding: 1.35rem var(--wrapper-padd) 1.2rem !important;
    border-top: 1px solid rgba(28, 25, 23, 0.28) !important;
  }

  html body main .mod-scroll__terms__term:last-of-type {
    border-bottom: 1px solid rgba(28, 25, 23, 0.28) !important;
  }

  html body main .mod-scroll__terms__term__wrap-title {
    display: flex !important;
    flex-direction: row !important;
    align-items: baseline !important;
    gap: 0.7rem !important;
  }

  html body main .mod-scroll__terms__term__num {
    font-size: 0.72rem !important;
    letter-spacing: 0.14em !important;
    opacity: 0.72 !important;
  }

  html body main .mod-scroll__terms__term__title,
  html body main .mod-scroll__terms .t-supertitulo-l {
    width: auto !important;
    font-size: clamp(1.55rem, 4.6vw, 2.15rem) !important;
    line-height: 0.95 !important;
  }

  html body main .mod-scroll__terms__term__text.d-none.d-md-block {
    display: block !important;
  }

  html body main .mod-scroll__terms__term__text-group {
    display: none !important;
  }

  html body main .mod-scroll__terms__term__text {
    width: 100% !important;
    max-width: 36rem !important;
    margin: 0.45rem 0 0 !important;
    font-size: 0.88rem !important;
    line-height: 1.45 !important;
  }
}

@media (max-width: 480px) {
  html body main .mod-scroll__terms__term {
    padding: 1.05rem var(--wrapper-padd) 0.95rem !important;
  }

  html body main .mod-scroll__terms__term__title,
  html body main .mod-scroll__terms .t-supertitulo-l {
    font-size: clamp(1.28rem, 6.6vw, 1.7rem) !important;
  }

  html body main .mod-scroll__terms__term__text {
    font-size: 0.8rem !important;
    line-height: 1.4 !important;
  }
}

/* ------------------------------------------------------------------ */
/* Refs 3 + 6 + 8 — home-pill geometry, no colour restyle              */
/* ------------------------------------------------------------------ */
@media (max-width: 1024px) {
  html body main :is(.btn, .btn--bg, .btn--circle, .mod-content__btn, .last-item__carousel__item--link) {
    ${PILL}
  }

  html body main :is(.btn, .btn--bg, .btn--circle, .mod-content__btn) :is(span, div) {
    font-size: inherit !important;
    font-style: normal !important;
    letter-spacing: inherit !important;
    text-transform: inherit !important;
    line-height: 1 !important;
  }
}

html body main .mod-content__btn,
html body main .btn--circle {
  ${PILL}
}

html body main .mod-content--center {
  overflow: visible !important;
}

html body main .mod-content--center .mod-content__col {
  display: flex !important;
  justify-content: center !important;
  width: 100% !important;
  max-width: 100% !important;
  padding-inline: var(--wrapper-padd, 1rem) !important;
}

html body main .mod-content__btn.btn--bg-xl,
html body main .mod-content__btn.t-titulo {
  font-size: 0.72rem !important;
  font-style: normal !important;
}

@media (max-width: 480px) {
  html body main .mod-content__btn {
    white-space: normal !important;
    height: auto !important;
    min-height: 2.85rem !important;
    max-height: none !important;
    padding: 0.7rem 1.2rem !important;
    max-width: calc(100vw - 2.5rem) !important;
    letter-spacing: 0.12em !important;
    font-size: 0.64rem !important;
  }
}

html body main .mod-footer__content__project__wrap-image {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  position: relative !important;
}

html body main .mod-footer__content__project__wrap-image .btn--circle,
html body main .mod-footer__content__project__wrap-image a.btn {
  position: relative !important;
  inset: auto !important;
  top: auto !important;
  left: auto !important;
  right: auto !important;
  order: 2 !important;
  margin: 0.9rem auto 0 !important;
  transform: none !important;
  z-index: 2 !important;
}

html body main .mod-footer__content__project__image {
  order: 1 !important;
  width: 100% !important;
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

/* ------------------------------------------------------------------ */
/* Ref 5 — 2×2 residence mosaic (all viewports)                        */
/* ------------------------------------------------------------------ */
html body main .mod-media--double,
html body main .mod-media--mosaic {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: clamp(0.65rem, 1.6vw, 1.15rem) !important;
  align-items: stretch !important;
  justify-content: stretch !important;
  width: 100% !important;
  max-width: 100% !important;
  padding-inline: var(--wrapper-padd, 1.25rem) !important;
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
}

/* ------------------------------------------------------------------ */
/* Ref 7 — clone footer type, left stack above HATHOR                  */
/* ------------------------------------------------------------------ */
@media (max-width: 1024px) {
  html body main .mod-footer__buttons-header {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-start !important;
    justify-content: flex-start !important;
    text-align: left !important;
    gap: 0.2rem !important;
    margin: 0 0 1.1rem !important;
    width: 100% !important;
  }

  html body main .mod-footer__buttons-header span {
    display: none !important;
  }

  html body main .mod-footer__buttons-header__btn,
  html body main .mod-footer__buttons-header__btn .line,
  html body main .mod-footer__buttons-header__btn span,
  html body main .mod-footer__buttons-header__btn .char {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    display: inline !important;
    font-size: clamp(1.05rem, 4.6vw, 1.45rem) !important;
    line-height: 1.25 !important;
    letter-spacing: 0.02em !important;
    text-align: left !important;
    white-space: normal !important;
    overflow: visible !important;
    word-break: break-word !important;
    overflow-wrap: anywhere !important;
  }

  html body main .mod-footer__buttons-header__btn .line:nth-of-type(2),
  html body main .mod-footer__buttons-header__btn.link .line:nth-of-type(2) {
    display: none !important;
  }

  html body main .mod-footer__bg {
    margin-top: 0.35rem !important;
  }
}

@media (max-width: 480px) {
  html body main .mod-footer__buttons-header__btn,
  html body main .mod-footer__buttons-header__btn .line,
  html body main .mod-footer__buttons-header__btn span {
    font-size: clamp(0.95rem, 5.2vw, 1.2rem) !important;
  }
}

/* ------------------------------------------------------------------ */
/* Ref 8 — real site footer under the clone wordmark, phone only       */
/* ------------------------------------------------------------------ */
@media (min-width: 481px) {
  html body .hathor-lux-footer-host {
    display: none !important;
  }
}

html body .hathor-lux-footer-host {
  position: relative !important;
  z-index: 5 !important;
  background: #ece8df !important;
}

html body .hathor-lux-footer-host .suites-cta-primary,
html body .hathor-lux-footer-host .suites-cta-secondary {
  ${PILL}
  border-color: #241d14 !important;
  color: #241d14 !important;
  background: transparent !important;
}

html body .hathor-lux-footer-host .suites-cta-primary {
  background: #12100c !important;
  border-color: #12100c !important;
  color: #cdb684 !important;
}

html body .hathor-lux-footer-host .lux-footer__subscribe {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 0.65rem !important;
  justify-content: flex-start !important;
}
`;

export const SUITES_LUX_FOOTER_HOST_HTML = `
<div class="hathor-lux-footer-host public-site" data-hathor-suites-lux-footer="1">
  <footer class="lux-footer is-copy-ready">
    <div class="lux-footer__noise" aria-hidden="true"></div>
    <div class="lux-footer__glow" aria-hidden="true"></div>
    <div class="lux-footer__inner">
      <div class="lux-footer__top">
        <p class="suites-eyebrow">Your Nile Awaits</p>
        <h2 class="lux-footer__headline typo-page-title">Begin Your Journey</h2>
        <p class="lux-footer__script">A voyage shaped around you</p>
        <p class="lux-footer__subhead typo-body-text">
          Join our exclusive circle for private itineraries and early access to rare voyages.
        </p>
        <div class="lux-footer__subscribe suites-cta-row">
          <a class="suites-cta-primary" href="/suites?book=1" target="_top" data-ajax-page-ignore>Request Availability</a>
          <a class="suites-cta-secondary suites-cta-secondary--ink" href="/contact" target="_top" data-ajax-page-ignore>Speak With Concierge</a>
        </div>
      </div>
      <div class="lux-footer__main">
        <div class="lux-footer__grid">
          <div class="lux-footer__col lux-footer__col--brand">
            <p class="lux-footer__col-title">The Vessel</p>
            <p class="lux-footer__tagline">
              Navigating the eternal Nile with unparalleled elegance since 2024.
              A private dahabiya for travellers who prefer stillness, craft, and rare itineraries.
            </p>
            <p class="lux-footer__brand-meta">
              <a href="mailto:reservations@hathorcruise.com" class="lux-footer__meta-link" target="_top" data-ajax-page-ignore>reservations@hathorcruise.com</a>
            </p>
            <p class="lux-footer__brand-meta">
              <a href="tel:+201270496896" class="lux-footer__meta-link" target="_top" data-ajax-page-ignore>+20 127 049 6896</a>
            </p>
          </div>
          <div class="lux-footer__col">
            <p class="lux-footer__col-title">Suites</p>
            <ul class="lux-footer__links">
              <li><a class="lux-footer__link" href="/suites" target="_top" data-ajax-page-ignore>Suites Overview</a></li>
              <li><a class="lux-footer__link" href="/luxury-cabins-Nile-Cruise" target="_top" data-ajax-page-ignore>Luxury Rooms</a></li>
              <li><a class="lux-footer__link" href="/rooms" target="_top" data-ajax-page-ignore>Luxury Suites</a></li>
              <li><a class="lux-footer__link" href="/royal-suites" target="_top" data-ajax-page-ignore>Royal Suites</a></li>
            </ul>
          </div>
          <div class="lux-footer__col">
            <p class="lux-footer__col-title">Voyages</p>
            <ul class="lux-footer__links">
              <li><a class="lux-footer__link" href="/cruises" target="_top" data-ajax-page-ignore>Scheduled Voyages</a></li>
              <li><a class="lux-footer__link" href="/charter" target="_top" data-ajax-page-ignore>Private Charter</a></li>
              <li><a class="lux-footer__link" href="/highlights" target="_top" data-ajax-page-ignore>Highlights</a></li>
              <li><a class="lux-footer__link" href="/about" target="_top" data-ajax-page-ignore>Our Story</a></li>
            </ul>
          </div>
          <div class="lux-footer__col">
            <p class="lux-footer__col-title">Experiences</p>
            <ul class="lux-footer__links">
              <li><a class="lux-footer__link" href="/wellness" target="_top" data-ajax-page-ignore>Wellness &amp; Spa</a></li>
              <li><a class="lux-footer__link" href="/gastronomy" target="_top" data-ajax-page-ignore>Dining</a></li>
              <li><a class="lux-footer__link" href="/blogs" target="_top" data-ajax-page-ignore>Journal</a></li>
              <li><a class="lux-footer__link" href="/partners" target="_top" data-ajax-page-ignore>Partners</a></li>
            </ul>
          </div>
          <div class="lux-footer__col">
            <p class="lux-footer__col-title">Concierge</p>
            <ul class="lux-footer__links">
              <li><a class="lux-footer__link" href="/contact" target="_top" data-ajax-page-ignore>Contact Concierge</a></li>
              <li><a class="lux-footer__link" href="/contact" target="_top" data-ajax-page-ignore>FAQ</a></li>
            </ul>
          </div>
          <div class="lux-footer__col">
            <p class="lux-footer__col-title">Follow the Voyage</p>
            <ul class="lux-footer__social">
              <li><a class="lux-footer__social-link" href="https://www.instagram.com/hathorcruise/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">IG</a></li>
              <li><a class="lux-footer__social-link" href="https://www.linkedin.com/company/hathor-dahabiya-cruise" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">IN</a></li>
              <li><a class="lux-footer__social-link" href="https://www.facebook.com/Hathorcruise" target="_blank" rel="noopener noreferrer" aria-label="Facebook">FB</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="lux-footer__bottom">
        <div class="lux-footer__bottom-row">
          <p class="lux-footer__legal">© 2026 Hathor Cruise. All rights reserved.</p>
          <p class="lux-footer__crafted">Crafted with precision in Egypt.</p>
        </div>
      </div>
    </div>
  </footer>
</div>
`;

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

  const cloneFooter = doc.querySelector(".mod-footer");
  if (cloneFooter?.parentElement) {
    cloneFooter.parentElement.insertBefore(host, cloneFooter.nextSibling);
    return;
  }
  doc.body?.appendChild(host);
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
