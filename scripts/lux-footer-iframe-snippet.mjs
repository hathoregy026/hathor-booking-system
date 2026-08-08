/**
 * Shared lux-footer markup for isolated iframe pages (Suites, Gastronomy).
 * Matches PublicLayout <Footer /> / lux-footer.css.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

export function getLuxFooterCss() {
  return fs.readFileSync(path.join(root, "app", "lux-footer.css"), "utf8");
}

export function getLuxFooterHtml() {
  const year = new Date().getFullYear();
  return `
<div class="hathor-lux-footer-host public-site">
  <footer class="lux-footer is-copy-ready">
    <div class="lux-footer__noise" aria-hidden="true"></div>
    <div class="lux-footer__glow" aria-hidden="true"></div>
    <div class="lux-footer__inner">
      <div class="lux-footer__top">
        <h2 class="lux-footer__headline typo-page-title">BEGIN YOUR JOURNEY</h2>
        <p class="lux-footer__subhead typo-body-text">
          Join our exclusive circle for private itineraries and early access to rare voyages.
        </p>
        <div class="lux-footer__subscribe">
          <a class="lux-footer__meta-link" href="mailto:reservations@hathorcruise.com?subject=Voyage%20Inquiry" target="_top" data-ajax-page-ignore>
            Speak with concierge →
          </a>
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
              <li><a class="lux-footer__link" href="/Luxury-Royal-Suites-Nile-Dahabiya-Cruise" target="_top" data-ajax-page-ignore>Royal Suites</a></li>
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
              <li><a class="lux-footer__link" href="/blog" target="_top" data-ajax-page-ignore>Journal</a></li>
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
          <p class="lux-footer__legal">© ${year} Hathor Cruise. All rights reserved.</p>
          <p class="lux-footer__crafted">Crafted with precision in Egypt.</p>
        </div>
      </div>
    </div>
  </footer>
</div>
`;
}

/** Suites scroll-section wrapper — same footer chrome as PublicLayout. */
export function getLuxFooterScrollSectionHtml() {
  return `
<section class="section section--no-overflow hathor-suites-footer-scroll" data-scroll-section>
${getLuxFooterHtml().trim()}
</section>
`;
}

/** Inject lux-footer + CSS into an iframe document (idempotent). */
export function injectLuxFooterIntoHtml(html) {
  const css = getLuxFooterCss();
  const footer = getLuxFooterHtml();
  let next = html.replace(
    /<style data-hathor-lux-footer>[\s\S]*?<\/style>/gi,
    "",
  );
  next = next.replace(
    /<style data-hathor-suites-footer>[\s\S]*?<\/style>/gi,
    "",
  );
  next = next.replace(
    /<section[^>]*hathor-suites-footer-scroll[\s\S]*?<\/section>/gi,
    "",
  );
  next = next.replace(
    /<div class="hathor-lux-footer-host[\s\S]*?<\/div>\s*(?=<\/body>)/gi,
    "",
  );
  next = next.replace(
    /<div class="hathor-suites-footer-host[\s\S]*?<\/div>\s*(?=<\/body>)/gi,
    "",
  );
  const inject = `
<style data-hathor-lux-footer>
  footer.footer { display: none !important; }
  .hathor-lux-footer-host,
  .hathor-suites-footer-host {
    position: relative;
    z-index: 5;
    background: #ece8df;
  }
  .hathor-suites-footer-scroll {
    display: block !important;
    background: #ece8df !important;
  }
  .hathor-lux-footer-host .lux-footer.is-copy-ready .lux-footer__headline,
  .hathor-lux-footer-host .lux-footer.is-copy-ready .lux-footer__subhead,
  .hathor-lux-footer-host .lux-footer.is-copy-ready .lux-footer__subscribe,
  .hathor-lux-footer-host .lux-footer__col,
  .hathor-suites-footer-host .lux-footer.is-copy-ready .lux-footer__headline,
  .hathor-suites-footer-host .lux-footer.is-copy-ready .lux-footer__subhead,
  .hathor-suites-footer-host .lux-footer.is-copy-ready .lux-footer__subscribe,
  .hathor-suites-footer-host .lux-footer__col {
    opacity: 1 !important;
    transform: none !important;
  }
${css}
</style>
${footer}
`;
  if (/<\/body>/i.test(next)) {
    return next.replace(/<\/body>/i, `${inject}</body>`);
  }
  return `${next}${inject}`;
}
