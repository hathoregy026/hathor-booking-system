"use client";

import { useCallback, useEffect, useRef } from "react";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { slotNameFromSuitesImageUrl } from "@/lib/suites-normal-image-map";
import {
  SUITES_CLIP_FIX_CSS,
  SUITES_COLLECTION_PANEL_CSS,
  SUITES_COLLECTION_PANEL_TONES,
  SUITES_SPLITTEXT_TYPE_GUARD_CSS,
  SUITES_TERMS_STAGE_CSS,
} from "@/lib/suites-typography-shared";

const CLONE_HREF_MAP: ReadonlyArray<readonly [RegExp, string]> = [
  [/normalisboring\.es\/lasolana/i, "/luxury-cabins-Nile-Cruise"],
  [/normalisboring\.es\/plaza-espana/i, "/rooms"],
  [/normalisboring\.es\/rua-pexegueiro/i, "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise"],
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
    cmsCss,
    SUITES_SPLITTEXT_TYPE_GUARD_CSS,
    SUITES_TERMS_STAGE_CSS,
    SUITES_COLLECTION_PANEL_CSS,
  ].join("\n");
}

const LOGO_BORING_WORDMARK = "Hathor";

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

const CLONE_MENU_HIDE_CSS = `
#awwwards,
.header__menu,
.header__btn.btn--menu,
header .header__logo,
.mod-scroll__intro__menu {
  display: none !important;
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
  if (!win || !terms || win.innerWidth < 951) return;

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
    if (img.hasAttribute("data-lazy-src") && img.getAttribute("data-lazy-src") !== url) {
      img.setAttribute("data-lazy-src", url);
    }
    if (img.hasAttribute("srcset")) img.removeAttribute("srcset");
    if (img.hasAttribute("data-lazy-srcset")) img.removeAttribute("data-lazy-srcset");
  });
}

export function SuitesNormalHomepagePage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const apply = useCallback(async () => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc?.head) return;

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
    patchLogoWordmark(doc);
    tagSuiteCollectionPanels(doc);
    retargetCloneLinks(doc);
    const runTermsFit = () => fitTermsToViewport(doc);
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
      patchLogoWordmark(doc);
      tagSuiteCollectionPanels(doc);
      retargetCloneLinks(doc);
      fitTermsToViewport(doc);
      void doc.fonts?.ready.then(() => fitTermsToViewport(doc));
      if (data.images) {
        applyImages(doc, data.images);
        observerRef.current?.disconnect();
        let painting = false;
        const observer = new MutationObserver(() => {
          if (painting) return;
          painting = true;
          applyImages(doc, data.images ?? {});
          painting = false;
        });
        observer.observe(doc.body, {
          subtree: true,
          attributes: true,
          attributeFilter: ["src", "data-lazy-src"],
        });
        observerRef.current = observer;
      }
    } catch {
      /* Clip-fix still applies if CMS is unreachable. */
    }
  }, []);

  useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <main className="suites-normal-clone" aria-label="Hathor Suites">
      <div className="public-site suites-normal-clone__nav">
        <PublicNavbar />
      </div>
      <iframe
        ref={iframeRef}
        className="suites-normal-clone__frame"
        src="/suites-normal/index.html?v=hathor-unfreeze-20260820"
        title="Hathor Suites"
        onLoad={() => void apply()}
      />
    </main>
  );
}
