"use client";

import { useCallback, useEffect, useRef } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { usePublicTheme } from "@/components/public/PublicThemeProvider";
import { EMBEDDED_PUBLIC_THEME_CSS } from "@/lib/embedded-public-theme";
import { slotNameFromSuitesImageUrl } from "@/lib/suites-normal-image-map";
import {
  applySuitesReferenceHeroImages,
  layoutSuitesConnectors,
  mountSuitesReferenceHero,
  neutralizeSuitesCloneIntroMotion,
  observeSuitesConnectors,
  SUITES_REFERENCE_HERO_CSS,
  SUITES_REFERENCE_HERO_IMAGE_DEFAULTS,
} from "@/lib/suites-reference-hero";
import {
  injectSuitesLuxFooter,
  layoutSuitesCollectionRail,
  neutralizeSuitesCircleButtons,
  stripParenthesesFromSuitesCopy,
  SUITES_CLONE_LAYOUT_FIX_CSS,
} from "@/lib/suites-clone-layout-fix";
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
  [/^https?:\/\/contacto\/?$/i, "/suites?book=1"],
  [/^contacto\/?$/i, "/suites?book=1"],
  [/^https?:\/\/disponibilidad\/?$/i, "/suites?book=1"],
  [/^https?:\/\/(www\.)?normalisboring\.es\/?$/i, "/"],
  [/^https?:\/\/www\.awwwards\.com/i, "/"],
];

/*
 * The stylesheet is split into three <style> elements kept in this DOM order so
 * the cascade is byte-for-byte what a single concatenated sheet produced. Only
 * the middle one carries CMS css and is ever rewritten; the hero's own rules
 * live in the tail and are written once. Replacing a <style> restarts every CSS
 * animation under it, and /api/suites-config can take its full 8s timeout to
 * answer, which is what made the hero replay its arrival long after landing.
 */
function suitesCssHead() {
  return [
    SUITES_CLIP_FIX_CSS,
    CLONE_MENU_HIDE_CSS,
    SUITES_LOADER_HIDE_CSS,
    SUITES_SCROLL_RESTORE_CSS,
  ].join("\n");
}

function suitesCssTail() {
  return [
    SUITES_SPLITTEXT_TYPE_GUARD_CSS,
    SUITES_TERMS_STAGE_CSS,
    SUITES_COLLECTION_PANEL_CSS,
    SUITES_EDITORIAL_CHROME_CSS,
    SUITES_DNA_COLOR_CSS,
    EMBEDDED_PUBLIC_THEME_CSS,
    SUITES_RESPONSIVE_CHOREOGRAPHY_CSS,
    SUITES_REFERENCE_HERO_CSS,
    SUITES_CLONE_LAYOUT_FIX_CSS,
  ].join("\n");
}

function ensureStyle(doc: Document, id: string, css: string) {
  let el = doc.getElementById(id) as HTMLStyleElement | null;
  if (!el) {
    el = doc.createElement("style");
    el.id = id;
    doc.head.appendChild(el);
  }
  if (el.textContent !== css) el.textContent = css;
  return el;
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

/** Returns true when at least one non-hero image source actually changed. */
function applyImages(doc: Document, images: Record<string, string>) {
  let changed = false;
  doc.querySelectorAll("img").forEach((node) => {
    const img = node as HTMLImageElement;
    // Hero collage is soft-swapped separately so a late CMS response never
    // blanks a painted frame back to the old scraped decode.
    if (img.closest(".srh-canvas")) return;
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
    if (img.getAttribute("src") !== url) {
      img.setAttribute("src", url);
      changed = true;
    }
    img.removeAttribute("data-lazy-src");
    img.removeAttribute("data-lazy-srcset");
    img.removeAttribute("srcset");
    img.classList.remove("lazyload", "lazyloading");
    img.classList.add("lazyloaded");
  });
  return changed;
}

function prepareSuitesReferenceHero(
  iframe: HTMLIFrameElement,
  theme: string,
  images?: Record<string, string> | null,
  css?: string | null,
): { doc: Document; cms: HTMLStyleElement } | null {
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

  // Appended in cascade order: head, CMS overrides, tail.
  ensureStyle(doc, "hathor-suites-live", suitesCssHead());
  // Seed CMS typography from the server so a late /api/suites-config answer
  // does not rewrite the sheet after the first paint (that rewrite + refresh
  // is the "lands, holds, loads again" jump).
  const cms = ensureStyle(doc, "hathor-suites-cms", css ?? "");
  ensureStyle(doc, "hathor-suites-tail", suitesCssTail());

  if (!mountSuitesReferenceHero(doc, images)) return null;
  neutralizeSuitesCloneIntroMotion(doc);
  return { doc, cms };
}

/** The faces the hero composition is set in; the reveal waits on these. */
const HERO_FONT_SPECS = [
  '400 80px "Italiana"',
  '100 16px "Piloner Thin"',
  '600 12px "Piloner Semibold"',
];

function waitForHeroFonts(doc: Document, timeoutMs = 1200) {
  const fonts = doc.fonts;
  if (!fonts?.load) return Promise.resolve();
  return Promise.race([
    Promise.all(HERO_FONT_SPECS.map((spec) => fonts.load(spec).catch(() => undefined))).then(
      () => undefined,
    ),
    new Promise<void>((resolve) => {
      doc.defaultView?.setTimeout(resolve, timeoutMs);
    }),
  ]);
}

function waitForCloneBoot(doc: Document, timeoutMs = 1800) {
  if (doc.documentElement.dataset.suitesCloneBooted === "1") {
    return Promise.resolve();
  }
  const win = doc.defaultView;
  if (!win) return Promise.resolve();

  return new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      win.clearInterval(poll);
      win.clearTimeout(fail);
      win.removeEventListener("message", onMessage);
      resolve();
    };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== win) return;
      const data = event.data as { type?: string } | null;
      if (data?.type === "hathor-suites-clone-booted") finish();
    };
    // The clone posts to parent; listen on the parent window.
    window.addEventListener("message", onMessage);
    const poll = win.setInterval(() => {
      if (doc.documentElement.dataset.suitesCloneBooted === "1") finish();
    }, 50);
    const fail = win.setTimeout(finish, timeoutMs);
  });
}

function markHeroSettled(doc: Document) {
  doc.querySelector(".srh-canvas")?.setAttribute("data-srh-settled", "true");
}

type SuitesConfig = { css?: string; images?: Record<string, string> };

function syncCloneTheme(iframe: HTMLIFrameElement | null, theme: string) {
  const root = iframe?.contentDocument?.documentElement;
  if (root) root.dataset.publicTheme = theme;
}

export function SuitesNormalHomepagePage({
  images: serverImages,
  css: serverCss = "",
}: {
  images?: Record<string, string>;
  css?: string;
} = {}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { theme } = usePublicTheme();

  const themeRef = useRef(theme);
  const imagesRef = useRef<Record<string, string>>({
    ...SUITES_REFERENCE_HERO_IMAGE_DEFAULTS,
    ...(serverImages ?? {}),
  });
  const cssRef = useRef(serverCss);
  const configRef = useRef<Promise<SuitesConfig> | null>(null);
  const revealedRef = useRef(false);
  const settledRef = useRef(false);
  const applyLockRef = useRef(false);

  const loadSuitesConfig = useCallback(() => {
    if (!configRef.current) {
      configRef.current = fetch("/api/suites-config", { cache: "no-store" })
        .then((response) => response.json() as Promise<SuitesConfig>)
        .catch(() => ({}) as SuitesConfig);
    }
    return configRef.current;
  }, []);

  const softApplyConfig = useCallback(
    async (doc: Document, cms: HTMLStyleElement, data: SuitesConfig) => {
      const nextCss = data.css ?? "";
      if (nextCss && cms.textContent !== nextCss) {
        // Typography-only sheet; never touch the hero tail sheet that owns
        // arrival keyframes.
        cms.textContent = nextCss;
        cssRef.current = nextCss;
      }
      if (data.images) {
        imagesRef.current = { ...imagesRef.current, ...data.images };
        await applySuitesReferenceHeroImages(doc, imagesRef.current);
        applyImages(doc, data.images);
      }
    },
    [],
  );

  const apply = useCallback(async () => {
    const iframe = iframeRef.current;
    if (!iframe || applyLockRef.current) return;
    applyLockRef.current = true;
    try {
      const prepared = prepareSuitesReferenceHero(
        iframe,
        themeRef.current,
        imagesRef.current,
        cssRef.current,
      );
      if (!prepared) return;
      const { doc, cms } = prepared;

      if (!doc.getElementById("hathor-bitho-ready-boot")) {
        const boot = doc.createElement("script");
        boot.id = "hathor-bitho-ready-boot";
        boot.textContent = `(function(){try{var d=document.documentElement;if(d.classList.contains("hathor-bitho-ready"))return;function done(){d.classList.add("hathor-bitho-ready");}var fail=setTimeout(done,1000);if(!document.fonts||!document.fonts.load){clearTimeout(fail);done();return;}document.fonts.load('italic 80px "Bitho Luxury"').then(function(){clearTimeout(fail);done();}).catch(function(){clearTimeout(fail);done();});}catch(e){try{document.documentElement.classList.add("hathor-bitho-ready");}catch(x){}}})();`;
        doc.head.appendChild(boot);
      }

      // After the first settle, only soft-apply CMS updates. Re-running
      // ScrollTrigger.refresh / footer reinject / terms fit is what made the
      // page look like it loaded a second time.
      if (settledRef.current) {
        try {
          const data = await loadSuitesConfig();
          await softApplyConfig(doc, cms, data);
        } catch {
          /* ignore */
        }
        return;
      }

      patchLogoWordmark(doc);
      tagSuiteCollectionPanels(doc);
      layoutSuitesCollectionRail(doc);
      retargetCloneLinks(doc);
      stripParenthesesFromSuitesCopy(doc);
      neutralizeSuitesCircleButtons(doc);
      injectSuitesLuxFooter(doc);
      neutralizeSuitesCloneIntroMotion(doc);

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

      if (revealedRef.current) return;
      revealedRef.current = true;

      await waitForHeroFonts(doc);
      // Wait for the clone's own boot (restInit → ScrollTrigger.refresh) so
      // that refresh happens while the iframe is still opacity:0.
      await waitForCloneBoot(doc);

      try {
        const data = await Promise.race([
          loadSuitesConfig(),
          new Promise<SuitesConfig>((resolve) => {
            window.setTimeout(() => resolve({}), 400);
          }),
        ]);
        await softApplyConfig(doc, cms, data);
      } catch {
        /* Clip-fix still applies if CMS is unreachable. */
      }

      fitTermsToViewport(doc);
      // One ScrollTrigger refresh while still hidden — never again on arrival.
      refreshSuitesHorizontalScroll(doc);
      layoutSuitesConnectors(doc);
      neutralizeSuitesCloneIntroMotion(doc);
      // Freeze arrival keyframes to their end state while still opacity:0, then
      // reveal once. Prevents a mid-animation land that later "finishes again".
      markHeroSettled(doc);
      settledRef.current = true;
      iframe.dataset.suitesReady = "true";

      // Late config may still arrive; soft-apply only, no layout re-seat.
      void loadSuitesConfig()
        .then((data) => softApplyConfig(doc, cms, data))
        .catch(() => undefined);
    } finally {
      applyLockRef.current = false;
    }
  }, [loadSuitesConfig, softApplyConfig]);

  useEffect(() => {
    let dispose: (() => void) | undefined;
    let frame = 0;
    let active = true;

    const bind = () => {
      const doc = iframeRef.current?.contentDocument;
      if (doc?.querySelector(".srh-canvas")) {
        dispose = observeSuitesConnectors(doc);
        return;
      }
      if (active) frame = requestAnimationFrame(bind);
    };

    frame = requestAnimationFrame(bind);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      dispose?.();
    };
  }, []);

  useEffect(() => {
    void apply();
  }, [apply]);

  useEffect(() => {
    let frame = 0;
    let active = true;
    let attempts = 0;

    const mountAtParseTime = () => {
      const iframe = iframeRef.current;
      if (
        iframe &&
        prepareSuitesReferenceHero(
          iframe,
          themeRef.current,
          imagesRef.current,
          cssRef.current,
        )
      ) {
        return;
      }
      attempts += 1;
      if (active && attempts < 600) frame = requestAnimationFrame(mountAtParseTime);
    };

    frame = requestAnimationFrame(mountAtParseTime);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    themeRef.current = theme;
    syncCloneTheme(iframeRef.current, theme);
  }, [theme]);

  return (
    <main className="suites-normal-clone" aria-label="Hathor Suites">
      <div className="public-site suites-normal-clone__nav">
        <PublicNavbar />
      </div>
      <iframe
        ref={iframeRef}
        className="suites-normal-clone__frame"
        src="/suites-normal/index.html?v=hathor-suites-phone-polish-20260909a"
        title="Hathor Suites"
        onLoad={() => {
          void apply();
        }}
      />
    </main>
  );
}

