"use client";

import { useCallback, useEffect, useRef } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { usePublicTheme } from "@/components/public/PublicThemeProvider";
import { EMBEDDED_PUBLIC_THEME_CSS } from "@/lib/embedded-public-theme";
import { slotNameFromSuitesImageUrl } from "@/lib/suites-normal-image-map";
import {
  mountSuitesReferenceHero,
  SUITES_REFERENCE_HERO_CSS,
} from "@/lib/suites-reference-hero";
import {
  SUITES_CLIP_FIX_CSS,
  SUITES_COLLECTION_PANEL_CSS,
  SUITES_COLLECTION_PANEL_TONES,
  SUITES_RESPONSIVE_CHOREOGRAPHY_CSS,
  SUITES_SPLITTEXT_TYPE_GUARD_CSS,
  SUITES_TERMS_STAGE_CSS,
} from "@/lib/suites-typography-shared";

const CLONE_HREF_MAP: ReadonlyArray<readonly [RegExp, string]> = [
  [/normalisboring\.es\/lasolana/i, "/luxury-cabins-Nile-Cruise"],
  [/normalisboring\.es\/plaza-espana/i, "/rooms"],
  [/normalisboring\.es\/rua-pexegueiro/i, "/royal-suites"],
  [/normalisboring\.es\/proyectos/i, "/suites"],
  [/normalisboring\.es\/conocenos/i, "/suites"],
  [/normalisboring\.es\/politica/i, "/contact"],
  [/normalisboring\.es\/aviso-legal/i, "/contact"],
  [/^https?:\/\/contacto\/?$/i, "/contact"],
  [/^https?:\/\/disponibilidad\/?$/i, "/suites?book=1"],
  [/^https?:\/\/(www\.)?normalisboring\.es\/?$/i, "/"],
  [/^https?:\/\/www\.awwwards\.com/i, "/"],
];

function buildSuitesLiveCss(cmsCss = "") {
  return [
    SUITES_CLIP_FIX_CSS,
    CLONE_MENU_HIDE_CSS,
    SUITES_LOADER_HIDE_CSS,
    SUITES_SCROLL_RESTORE_CSS,
    cmsCss,
    SUITES_SPLITTEXT_TYPE_GUARD_CSS,
    SUITES_TERMS_STAGE_CSS,
    SUITES_COLLECTION_PANEL_CSS,
    SUITES_EDITORIAL_CHROME_CSS,
    SUITES_DNA_COLOR_CSS,
    EMBEDDED_PUBLIC_THEME_CSS,
    SUITES_RESPONSIVE_CHOREOGRAPHY_CSS,
    SUITES_REFERENCE_HERO_CSS,
  ].join("\n");
}

const LOGO_BORING_WORDMARK = "HATHOR";

function patchLogoWordmark(doc: Document) {
  doc.querySelectorAll(".logo__boring").forEach((node) => {
    const el = node as HTMLElement;
    const letters = LOGO_BORING_WORDMARK.split("");
    const chars = el.querySelectorAll(":scope > .char");

    if (chars.length > 0) {
      chars.forEach((charEl, index) => {
        const target = charEl.querySelector("span") ?? charEl;
        const next = letters[index];
        if (next == null) {
          if ((charEl as HTMLElement).style.display !== "none") {
            (charEl as HTMLElement).style.display = "none";
          }
          return;
        }
        if (target.textContent !== next) target.textContent = next;
      });
      return;
    }

    const current = Array.from(el.childNodes)
      .filter((child) => child.nodeType === Node.TEXT_NODE)
      .map((child) => child.textContent ?? "")
      .join("")
      .trim();
    if (current === LOGO_BORING_WORDMARK && el.querySelector(".reg")) return;
    el.innerHTML = `${LOGO_BORING_WORDMARK}<div class="reg">®</div>`;
  });
}

const SUITES_EDITORIAL_CHROME_CSS = `
main :is(
  .mod-scroll__intro__title,
  .mod-scroll__text__title__line,
  .mod-scroll__terms__term__title,
  .mod-scroll__projects__item__text__title,
  .last-item__content__title .line,
  .anima__title,
  .mod-title--lines .line,
  .logo__normal,
  .logo__boring
) {
  font-family: "Italiana", "Gamgote", Georgia, serif !important;
  font-style: normal !important;
  font-weight: 400 !important;
  letter-spacing: -0.025em !important;
  text-shadow: none !important;
}

main .mod-scroll__intro__title {
  font-size: clamp(3.15rem, 4.5vw, 4.6rem) !important;
  line-height: 0.88 !important;
}

main .mod-scroll__text__title__line {
  font-size: clamp(3.8rem, 6.4vw, 6.8rem) !important;
  line-height: 0.88 !important;
}

main .mod-scroll__projects__item__text__title {
  font-size: clamp(3rem, 4.4vw, 4.8rem) !important;
  line-height: 0.9 !important;
}

main :is(.anima__title, .last-item__content__title .line) {
  font-size: clamp(4.3rem, 8.7vw, 8.8rem) !important;
  line-height: 0.88 !important;
}

main .mod-title--lines .line {
  font-size: clamp(3.8rem, 7vw, 7.2rem) !important;
  line-height: 0.88 !important;
}

main .mod-scroll__intro__logo .logo__boring,
main .mod-scroll__intro__logo .logo__boring .char,
main .mod-scroll__intro__logo .logo__boring .char > span {
  font-family: "Italiana", "Gamgote", Georgia, serif !important;
  font-size: clamp(1rem, 1.3vw, 1.25rem) !important;
  letter-spacing: 0.08em !important;
}

main .mod-scroll__section,
main .mod-scroll__intro__copyright,
main .mod-footer__footer__copyright {
  font-family: "Piloner Thin", "Plus Jakarta Sans", sans-serif !important;
  font-style: normal !important;
  font-weight: 100 !important;
  font-size: 0.6875rem !important;
  line-height: 1.3 !important;
  letter-spacing: 0.2em !important;
  text-transform: uppercase !important;
  color: #806b35 !important;
  -webkit-text-fill-color: #806b35 !important;
  text-shadow: none !important;
}

main .mod-scroll__intro__text,
main .mod-scroll__intro__text p,
main .mod-scroll__intro__text > p,
main .mod-scroll__text__text,
main .mod-scroll__text__text p {
  font-family: "Rollgates Luxury Italic", serif !important;
  font-style: italic !important;
  font-weight: 400 !important;
  font-size: clamp(0.95rem, 1.05vw, 1.15rem) !important;
  line-height: 1.55 !important;
  letter-spacing: 0.02em !important;
  color: rgb(64 55 37 / 0.82) !important;
  -webkit-text-fill-color: rgb(64 55 37 / 0.82) !important;
}

main .mod-scroll__intro__text,
main .mod-scroll__intro__text p,
main .mod-scroll__intro__text > p {
  text-align: right !important;
  max-width: 22rem !important;
}

@media (max-width: 950px) {
  main .mod-scroll__intro__text {
    width: min(100%, 32rem) !important;
    max-width: min(100%, 32rem) !important;
    margin-right: 0 !important;
    transform: none !important;
  }

  main .mod-scroll__intro__text p,
  main .mod-scroll__intro__text > p {
    width: 100% !important;
    max-width: 100% !important;
  }
}

@media (max-width: 480px) {
  main .mod-scroll__intro__title {
    font-size: clamp(2.4rem, 11.8vw, 3.15rem) !important;
  }

  main .mod-scroll__text__title__line,
  main .mod-scroll__projects__item__text__title {
    font-size: clamp(2.65rem, 13vw, 3.6rem) !important;
  }

  main :is(.anima__title, .last-item__content__title .line, .mod-title--lines .line) {
    max-width: 100% !important;
    font-size: clamp(2.15rem, 10.4vw, 3.05rem) !important;
    line-height: 0.92 !important;
    white-space: normal !important;
  }

  main .mod-scroll__intro__text,
  main .mod-scroll__intro__text p,
  main .mod-scroll__intro__text > p {
    text-align: left !important;
    max-width: none !important;
    font-size: 0.95rem !important;
  }
}

html:not(.hathor-bitho-ready) .mod-scroll__intro__title {
  opacity: 0 !important;
  visibility: hidden !important;
}
`;

const SUITES_DNA_COLOR_CSS = `
html body main,
html body main .bg-white {
  background-color: #f3ede4 !important;
  color: #14120e !important;
}

html body main .bg-beige {
  background-color: #ded4c6 !important;
  color: #14120e !important;
}

html body main .bg-red {
  background-color: #cfc7ba !important;
  color: #14120e !important;
}

html body main .bg-black,
html body main .bg-grey {
  background-color: #14120e !important;
  color: #f3ede4 !important;
}

html body main .bg-blue,
html body main .before-bg-blue::before {
  background-color: #b69f64 !important;
}

html body main .bg-blue,
html body main .bg-blue :is(div, span, p, a, strong, em),
html body main .mod-scroll__terms,
html body main .mod-scroll__terms :is(div, span, p, a, strong, em) {
  color: #14120e !important;
  -webkit-text-fill-color: #14120e !important;
}

html body main :is(.bg-white, .bg-beige, .bg-red) :is(
  .mod-scroll__intro__title,
  .mod-scroll__text__title__line,
  .mod-scroll__projects__item__text__title,
  .last-item__content__title .line,
  .anima__title,
  .mod-title--lines .line
) {
  color: #14120e !important;
  -webkit-text-fill-color: #14120e !important;
}

html body main :is(.bg-black, .bg-grey) :is(
  .mod-scroll__images-text__text,
  .mod-scroll__images-text__text p,
  .mod-scroll__projects__item__text__title,
  .last-item__content__title .line
) {
  color: #f3ede4 !important;
  -webkit-text-fill-color: #f3ede4 !important;
}

html body main :is(.mod-scroll__section, .mod-scroll__intro__copyright, .mod-footer__footer__copyright) {
  color: #806b35 !important;
  -webkit-text-fill-color: #806b35 !important;
}

html body main :is(.bg-black, .bg-grey) :is(.mod-scroll__section, .mod-footer__footer__copyright) {
  color: #ded4c6 !important;
  -webkit-text-fill-color: #ded4c6 !important;
}

html body main :is(.bg-white, .bg-beige, .bg-red) :is(
  .mod-scroll__intro__text,
  .mod-scroll__intro__text p,
  .mod-scroll__text__text,
  .mod-scroll__text__text p,
  .mod-scroll__projects__text,
  .last-item__content__text,
  .last-item__content__text p,
  .mod-content__text,
  .mod-content__text p
) {
  color: #4a453c !important;
  -webkit-text-fill-color: #4a453c !important;
}
`;

const SUITES_LOADER_HIDE_CSS = `
.loader__progress,
.loader__percent,
.header__progress,
.header__percent {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
`;

const SUITES_SCROLL_RESTORE_CSS = `
@media (min-width: 1025px) {
  html:not(.mobile),
  html:not(.mobile) body {
    overflow-x: clip !important;
    overflow-y: auto !important;
    width: 100% !important;
    height: auto !important;
    min-height: 100% !important;
  }

  html:not(.mobile) #smooth-wrapper,
  html:not(.mobile) #smooth-content,
  html:not(.mobile) main {
    overflow: visible !important;
    max-height: none !important;
  }
}
`;

const CLONE_MENU_HIDE_CSS = `
html body,
html body main {
  opacity: 1 !important;
}
#awwwards,
.header__menu,
.header__btn.btn--menu,
.mod-scroll__intro__menu {
  display: none !important;
}
header .header__logo {
  visibility: hidden !important;
  pointer-events: none !important;
}
.logo__boring,
.logo__boring .reg {
  transform: none !important;
}
.mod-scroll__intro__logo {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.mod-scroll__intro__logo .logo__boring {
  right: 0 !important;
  bottom: 0 !important;
  text-align: center !important;
}
`;

function hathorHrefFromClone(href: string): string | null {
  for (const [pattern, destination] of CLONE_HREF_MAP) {
    if (pattern.test(href)) return destination;
  }
  return null;
}

function tagSuiteCollectionPanels(doc: Document) {
  doc.querySelectorAll(".mod-scroll__projects__item").forEach((node, index) => {
    node.setAttribute(
      "data-suite-panel",
      SUITES_COLLECTION_PANEL_TONES[index] ?? "gold",
    );
  });
}

function retargetCloneLinks(doc: Document) {
  doc.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") || "";
    const next = hathorHrefFromClone(href);
    if (!next) return;
    anchor.setAttribute("href", next);
    anchor.setAttribute("target", "_top");
  });
  doc.querySelectorAll("[data-url]").forEach((node) => {
    const url = node.getAttribute("data-url") || "";
    const next = hathorHrefFromClone(url);
    if (next) node.setAttribute("data-url", next);
  });
}

function fitTermsToViewport(doc: Document) {
  const win = doc.defaultView;
  const terms = doc.querySelector<HTMLElement>(".mod-scroll__terms");
  if (!win || !terms || win.innerWidth < 1025) return;

  const titles = Array.from(
    terms.querySelectorAll<HTMLElement>(".mod-scroll__terms__term__title"),
  );
  if (!titles.length) return;

  const applySize = (px: number) => {
    titles.forEach((el) => {
      el.style.setProperty("font-size", `${px}px`, "important");
      el.style.setProperty("line-height", "0.8", "important");
      [el, ...Array.from(el.querySelectorAll<HTMLElement>("*"))].forEach((node) => {
        node.style.setProperty("color", "#ffffff", "important");
        node.style.setProperty("-webkit-text-fill-color", "#ffffff", "important");
        node.style.setProperty("mix-blend-mode", "normal", "important");
        node.style.setProperty("filter", "none", "important");
      });
    });
  };

  let size = Math.min(win.innerHeight * 0.082, win.innerWidth * 0.06);
  applySize(size);
  for (let i = 0; i < 24 && terms.scrollHeight > terms.clientHeight + 2; i += 1) {
    size *= 0.9;
    if (size < 28) break;
    applySize(size);
  }
}

function refreshSuitesHorizontalScroll(doc: Document) {
  const win = doc.defaultView;
  if (!win || win.innerWidth <= 1024) return;

  const host = doc.body ?? doc.documentElement;
  if (!host) return;

  const script = doc.createElement("script");
  script.textContent =
    'try{if(typeof setScrollH==="function")setScrollH();if(window.ScrollTrigger)ScrollTrigger.refresh();}catch(e){console.warn("suites scroll refresh",e)}';
  host.appendChild(script);
  script.remove();
}

function applyImages(doc: Document, images: Record<string, string>) {
  doc.querySelectorAll("img").forEach((node) => {
    const img = node as HTMLImageElement;
    const current =
      img.getAttribute("data-hathor-slot") ||
      slotNameFromSuitesImageUrl(
        img.getAttribute("src") || img.getAttribute("data-lazy-src") || "",
      );
    if (!current) return;
    const url = images[current];
    if (!url) return;
    if (img.getAttribute("data-hathor-slot") !== current) {
      img.setAttribute("data-hathor-slot", current);
    }
    if (img.getAttribute("src") !== url) img.setAttribute("src", url);
    img.removeAttribute("data-lazy-src");
    img.removeAttribute("data-lazy-srcset");
    img.removeAttribute("srcset");
    img.classList.remove("lazyload", "lazyloading");
    img.classList.add("lazyloaded");
  });
}

function prepareSuitesReferenceHero(
  iframe: HTMLIFrameElement,
  theme: string,
): { doc: Document; live: HTMLStyleElement } | null {
  const doc = iframe.contentDocument;
  if (
    !doc?.head ||
    !doc.location.pathname.endsWith("/suites-normal/index.html") ||
    !doc.querySelector(".mod-scroll__intro > .wrapper")
  ) {
    return null;
  }

  doc.documentElement.dataset.publicTheme = theme;

  if (!doc.getElementById("hathor-font-faces")) {
    const fonts = doc.createElement("link");
    fonts.id = "hathor-font-faces";
    fonts.rel = "stylesheet";
    fonts.href = "/hathor-fonts.css";
    doc.head.appendChild(fonts);
  }

  let live = doc.getElementById("hathor-suites-live") as HTMLStyleElement | null;
  if (!live) {
    live = doc.createElement("style");
    live.id = "hathor-suites-live";
    doc.head.appendChild(live);
  }
  live.textContent = buildSuitesLiveCss();

  if (!mountSuitesReferenceHero(doc)) return null;
  iframe.dataset.suitesReady = "true";
  return { doc, live };
}

export function SuitesNormalHomepagePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme } = usePublicTheme();

  const apply = useCallback(async () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const prepared = prepareSuitesReferenceHero(iframe, theme);
    if (!prepared) return;
    const { doc, live } = prepared;

    if (!doc.getElementById("hathor-bitho-ready-boot")) {
      const boot = doc.createElement("script");
      boot.id = "hathor-bitho-ready-boot";
      boot.textContent = `(function(){try{var d=document.documentElement;if(d.classList.contains("hathor-bitho-ready"))return;function done(){d.classList.add("hathor-bitho-ready");}var fail=setTimeout(done,1000);if(!document.fonts||!document.fonts.load){clearTimeout(fail);done();return;}document.fonts.load('italic 80px "Bitho Luxury"').then(function(){clearTimeout(fail);done();}).catch(function(){clearTimeout(fail);done();});}catch(e){try{document.documentElement.classList.add("hathor-bitho-ready");}catch(x){}}})();`;
      doc.head.appendChild(boot);
    }

    patchLogoWordmark(doc);
    tagSuiteCollectionPanels(doc);
    retargetCloneLinks(doc);
    const runTermsFit = () => {
      fitTermsToViewport(doc);
      refreshSuitesHorizontalScroll(doc);
    };
    runTermsFit();
    void doc.fonts?.ready.then(runTermsFit);

    if (!doc.documentElement.dataset.hathorNavBound) {
      doc.documentElement.dataset.hathorNavBound = "1";
      doc.addEventListener(
        "click",
        (event) => {
          const target = event.target;
          if (!(target instanceof Element)) return;
          const tagged = target.closest<HTMLElement>("[data-url]");
          const url = tagged?.getAttribute("data-url") || "";
          const next =
            (url && hathorHrefFromClone(url)) ||
            (url.startsWith("/") ? url : null);
          if (!next) return;
          event.preventDefault();
          event.stopPropagation();
          window.top?.location.assign(next);
        },
        true,
      );
    }

    try {
      const response = await fetch("/api/suites-config", { cache: "no-store" });
      const data = (await response.json()) as {
        css?: string;
        images?: Record<string, string>;
      };
      live.textContent = buildSuitesLiveCss(data.css ?? "");
      mountSuitesReferenceHero(doc);
      patchLogoWordmark(doc);
      tagSuiteCollectionPanels(doc);
      retargetCloneLinks(doc);
      runTermsFit();
      void doc.fonts?.ready.then(runTermsFit);
      if (data.images) applyImages(doc, data.images);
    } catch {
      /* Clip-fix still applies if CMS is unreachable. */
    } finally {
      const reveal = () => {
        iframe.dataset.suitesReady = "true";
      };
      if (doc.fonts?.ready) {
        void doc.fonts.ready.then(() => requestAnimationFrame(reveal)).catch(reveal);
      } else {
        requestAnimationFrame(reveal);
      }
    }
  }, [theme]);

  useEffect(() => {
    void apply();
  }, [apply]);

  useEffect(() => {
    let frame = 0;
    let active = true;
    let attempts = 0;

    const mountAtParseTime = () => {
      const iframe = iframeRef.current;
      if (iframe && prepareSuitesReferenceHero(iframe, theme)) return;
      attempts += 1;
      if (active && attempts < 600) frame = requestAnimationFrame(mountAtParseTime);
    };

    frame = requestAnimationFrame(mountAtParseTime);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [theme]);

  return (
    <main className="suites-normal-clone" aria-label="Hathor Suites">
      <div className="public-site suites-normal-clone__nav">
        <PublicNavbar />
      </div>
      <iframe
        ref={iframeRef}
        className="suites-normal-clone__frame"
        src="/suites-normal/index.html?v=hathor-suites-phone-tablet-20260903c"
        title="Hathor Suites"
        onLoad={() => {
          void apply();
        }}
      />
    </main>
  );
}
