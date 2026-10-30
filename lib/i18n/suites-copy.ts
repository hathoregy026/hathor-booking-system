/**
 * The words of the `/suites` iframe that the dashboard does not hold: hero
 * labels, carousel captions, the closing button and the footer. The dashboard
 * sections are in `website-text-*.ts` and the photo descriptions in
 * `site-image-alts-*.ts`. The English page ships these words in its own markup
 * and never passes through here.
 */

import { CHROME_COPY } from "@/lib/i18n/chrome-copy";
import {
  localizedHref,
  stripLocalePrefix,
  type PublicLocale,
} from "@/lib/i18n/locale";
import { siteImageAltIn } from "@/lib/i18n/site-image-alts";

/** The React page around the iframe, in every language. */
export const SUITES_PAGE_LABELS: Record<
  PublicLocale,
  { heading: string; frameTitle: string }
> = {
  en: { heading: "Nile Dahabiya Suites", frameTitle: "Hathor Suites" },
  it: { heading: "Suite in dahabiya sul Nilo", frameTitle: "Suite di Hathor" },
  de: { heading: "Dahabiya-Suiten auf dem Nil", frameTitle: "Suiten der Hathor" },
};

type SuitesCloneCopy = {
  documentTitle: string;
  kicker: { desk: readonly [string, string]; phone: string };
  actionsLabel: string;
  requestCta: string;
  captions: Record<string, { kicker?: string; title: string }>;
};

const SUITES_CLONE_COPY: Partial<Record<PublicLocale, SuitesCloneCopy>> = {
  it: {
    documentTitle: "Suite di Hathor sul Nilo",
    kicker: {
      /* Sits left of the main photo: longer lines run across it. */
      desk: ["Suite", "in dahabiya"],
      phone: "Suite in dahabiya sul Nilo",
    },
    actionsLabel: "Azioni della pagina Suite",
    requestCta: "Richiedi la disponibilità",
    captions: {
      "principal-aboard": { kicker: "A bordo di Hathor", title: "Camere pensate" },
      "secundario-river": { title: "Luce del fiume" },
      "secundario-calm": { title: "Quiete privata" },
      "images-text-craft": { kicker: "Arte", title: "Vivere il Nilo" },
    },
  },
  de: {
    documentTitle: "Suiten der Hathor auf dem Nil",
    kicker: {
      /* Sits left of the main photo: longer lines run across it. */
      desk: ["Dahabiya", "Suiten"],
      phone: "Dahabiya-Suiten auf dem Nil",
    },
    actionsLabel: "Aktionen der Suiten-Seite",
    requestCta: "Verfügbarkeit anfragen",
    captions: {
      "principal-aboard": { kicker: "An Bord der Hathor", title: "Räume für Stille" },
      "secundario-river": { title: "Flusslicht" },
      "secundario-calm": { title: "Private Ruhe" },
      "images-text-craft": { kicker: "Handwerk", title: "Leben am Nil" },
    },
  },
};

/** Clone links that reach their page through an English-only redirect. */
const CLONE_LINK_TARGETS: Record<string, string> = {
  "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise": "/royal-suites",
};

function setLines(element: Element | null, lines: readonly string[]) {
  if (!element) return;
  const doc = element.ownerDocument;
  element.replaceChildren();
  lines.forEach((line, index) => {
    if (index > 0) element.appendChild(doc.createElement("br"));
    element.appendChild(doc.createTextNode(line));
  });
}

function setTextOf(doc: Document, selector: string, value: string) {
  const element = doc.querySelector(selector);
  if (element) element.textContent = value;
}

function localizeCloneFooter(doc: Document, locale: PublicLocale) {
  const copy = CHROME_COPY[locale].footer;
  setLines(doc.querySelector(".hf__title"), copy.titleLines);
  setTextOf(doc, ".hf__script", copy.script);
  setTextOf(doc, ".hf__eyebrow", copy.eyebrow);
  setTextOf(doc, ".hf__cta--fill", copy.bookNow);
  setTextOf(doc, ".hf__cta--line", copy.charter);

  const labels = new Map(
    [...copy.columns.flatMap((column) => column.links), ...copy.utility].map(
      (link) => [link.href, link.label],
    ),
  );
  doc.querySelectorAll(".hf__link, .hf__base-link").forEach((link) => {
    const label = labels.get(stripLocalePrefix(link.getAttribute("href")));
    if (label) link.textContent = label;
  });
  copy.columns.forEach((column) => {
    setTextOf(doc, `#hf-col-${column.id}`, column.title);
  });

  const legal = doc.querySelector(".hf__legal");
  if (legal) {
    legal.textContent = (legal.textContent ?? "").replace("Egypt", copy.country);
  }
  doc.querySelector(".hf__utility")?.setAttribute("aria-label", copy.utilityLabel);
  doc.querySelector(".hf__top")?.setAttribute("aria-label", copy.backToTop);
}

function localizeCloneLinks(doc: Document, locale: PublicLocale) {
  const toLocale = (href: string) =>
    localizedHref(CLONE_LINK_TARGETS[href] ?? href, locale);
  doc.querySelectorAll("a[href]").forEach((anchor) => {
    const href = anchor.getAttribute("href") ?? "";
    const next = toLocale(href);
    if (next !== href) anchor.setAttribute("href", next);
  });
  doc.querySelectorAll("[data-url]").forEach((node) => {
    const url = node.getAttribute("data-url") ?? "";
    const next = toLocale(url);
    if (next !== url) node.setAttribute("data-url", next);
  });
}

/**
 * Put the iframe's own words into `locale`. Safe to run after every layout
 * pass, since the clone's layout code writes some English labels back.
 */
export function localizeSuitesClone(doc: Document, locale: PublicLocale) {
  const copy = SUITES_CLONE_COPY[locale];
  if (!copy) return;

  doc.documentElement.lang = locale;
  doc.title = copy.documentTitle;

  setLines(doc.querySelector(".srh-kicker--desk"), copy.kicker.desk);
  setTextOf(doc, ".srh-kicker--phone", copy.kicker.phone);
  doc.querySelector(".srh-actions")?.setAttribute("aria-label", copy.actionsLabel);
  setTextOf(doc, ".mod-content__btn", copy.requestCta);

  Object.entries(copy.captions).forEach(([id, caption]) => {
    const panel = `[data-hathor-suites-caption="${id}"]`;
    if (caption.kicker) {
      setTextOf(doc, `${panel} .suites-slide-caption__kicker`, caption.kicker);
    }
    setTextOf(doc, `${panel} .suites-slide-caption__title`, caption.title);
  });

  doc.querySelectorAll("img[alt]").forEach((img) => {
    const alt = img.getAttribute("alt") ?? "";
    const next = siteImageAltIn(locale, alt);
    if (next !== alt) img.setAttribute("alt", next);
  });

  localizeCloneFooter(doc, locale);
  localizeCloneLinks(doc, locale);
}
