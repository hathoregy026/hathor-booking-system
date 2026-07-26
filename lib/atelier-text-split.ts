/**
 * Atelier masked letter rise/fall — shared across public pages.
 * Text only: does not alter layout, scroll engines, or media.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SELECTORS = [
  /* Typography roles */
  ".public-site .typo-page-title",
  ".public-site .typo-page-subtitle",
  ".public-site .typo-sub-subtitle",
  ".public-site .typo-body-text",
  ".public-site .typo-on-images-title",
  ".public-site .typo-on-images-indication",
  ".public-site .typo-on-images-body",
  ".public-site .typo-our-voyages-title",
  ".public-site .typo-our-voyages-indication",
  /* Shared page chrome */
  ".public-site .hathor-page-hero__title",
  ".public-site .hathor-page-hero__subtitle",
  ".public-site .hathor-section-title",
  ".public-site .hathor-section-eyebrow",
  ".public-site .hathor-section-subtitle",
  ".public-site .hathor-chapter-title",
  ".public-site .hathor-chapter-eyebrow",
  ".public-site .hathor-body-text",
  ".public-site .hathor-intro__paragraph",
  ".public-site .hathor-chapter-intro",
  ".public-site .lux-section-title",
  ".public-site .lux-section-eyebrow",
  ".public-site .lux-kicker",
  ".public-site .lux-lead",
  ".public-site .lux-gold",
  ".public-site .lux-copy p",
  ".public-site .lux-prose p",
  ".public-site .lux-cta-band__title",
  ".public-site .lux-testimonials__quote",
  ".public-site .lux-testimonials__name",
  ".public-site .owo-hero [class*='__title']",
  ".public-site .owo-hero [class*='__subtitle']",
  ".public-site .owo-chapter [class*='__title']",
  ".public-site .owo-chapter .hathor-body-text",
  ".public-site .owo-bento__title",
  ".public-site .owo-bento__text",
  ".public-site .hathor-full-media__title",
  ".public-site .hathor-full-media__text",
  ".public-site .acc-intro-copy",
  ".public-site .acc-eyebrow",
  ".public-site .room-fs-desc",
  ".public-site .room-fs-label",
  ".public-site .room-fs-route",
  ".public-site .room-fs-meta",
  ".public-site .room-interstitial__body",
  ".public-site .room-interstitial__eyebrow",
  ".public-site .room-interstitial__script",
  ".public-site .cta-inner h2",
  ".public-site .cta-inner p",
  ".public-site .public-page-body p",
  /* Homepage */
  ".public-site .ex-root .radius-heading h2",
  ".public-site .ex-root .radius-sub-heading h3",
  ".public-site .ex-root .radius-p p",
  ".public-site .ex-root .home-carousel-h2 h2",
  ".public-site .ex-root .home-carousel-h3 h3",
  ".public-site .ex-root .home-carousel .carousel-heading h2",
  ".public-site .ex-root .home-text-h2 h2",
  ".public-site .ex-root .home-text-p p",
  ".public-site .ex-root .gallery-h2 h2",
  ".public-site .ex-root .instagram-follow__eyebrow",
  ".public-site .ex-root .gallery-ig-link__handle",
  ".public-site .ex-root .testimonial-h2 h2",
  ".public-site .ex-root .testimonial-card h3",
  ".public-site .ex-root .testimonial-card p",
  /* Cruises — body/copy only (intro lines keep cruises SplitType) */
  ".public-site .cruise-intro-copy",
  ".public-site .cruise-exp-copy",
  ".public-site .cruises-sheet p",
] as const;

const SKIP_CLOSEST = [
  ".nav-bar",
  ".site-nav",
  ".public-navbar",
  "header",
  "nav",
  ".luxury-marquee",
  ".ex-stack-scroll",
  ".home-hero-container",
  "[data-test-scroll-reveal]",
  "[data-page-transition] .pt-hero__copy",
  ".pt-hero__copy",
  ".pt-sheet__landing",
  ".pt-sheet__filters",
  "[data-kinetic-title]",
  "[data-rooms-intro-line]",
  "[data-rooms-editorial] [data-kinetic-title]",
  ".cruise-intro-line",
  ".cruise-intro-title",
  ".cruise-exp-title",
  ".booking-modal",
  ".admin-shell",
  ".campaign-section",
  "button",
  "input",
  "textarea",
  "select",
  "label",
  "a.btn",
  ".btn",
].join(",");

export function splitAtelierText(el: HTMLElement): HTMLElement[] {
  if (!el || el.dataset.splitDone === "1") {
    return Array.from(el.querySelectorAll<HTMLElement>(".split-char"));
  }

  const chars: HTMLElement[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  textNodes.forEach((node) => {
    const parent = node.parentElement;
    if (!parent || parent.classList.contains("split-char")) return;
    const text = node.textContent;
    if (!text || !text.trim()) return;

    const frag = document.createDocumentFragment();
    /* Keep words intact so chars never wrap mid-word (e.g. "legendary"). */
    text.split(/(\s+)/).forEach((token) => {
      if (!token) return;
      if (/^\s+$/.test(token)) {
        frag.appendChild(document.createTextNode(token));
        return;
      }
      const word = document.createElement("span");
      word.className = "split-word";
      [...token].forEach((ch) => {
        const wrap = document.createElement("span");
        wrap.className = "split-heading";
        const span = document.createElement("span");
        span.className = "split-char";
        span.textContent = ch;
        wrap.appendChild(span);
        word.appendChild(wrap);
        chars.push(span);
      });
      frag.appendChild(word);
    });
    parent.replaceChild(frag, node);
  });

  el.dataset.splitDone = "1";
  return chars;
}

function shouldSkip(el: HTMLElement): boolean {
  if (el.closest(SKIP_CLOSEST)) return true;
  /* Titles owned by rooms / cruises SplitType engines */
  if (
    el.matches(
      ".acc-intro-title, .room-fs-title, .cruises-hero__title, .cruises-hero__subtitle, .cruise-intro-title, .cruise-exp-title, .cruise-intro-line",
    )
  ) {
    return true;
  }
  /* Already owned by another split engine */
  if (el.querySelector(".char, .rooms-split-word, .rooms-split-line")) {
    return true;
  }
  if (el.classList.contains("char") || el.classList.contains("rooms-split-word")) {
    return true;
  }
  /* Empty / whitespace-only */
  if (!(el.textContent || "").trim()) return true;
  return false;
}

function animateAtelierSplit(el: HTMLElement, triggerEl?: Element) {
  const chars = splitAtelierText(el);
  if (!chars.length) return;

  gsap.set(chars, { yPercent: 100, opacity: 0 });
  const stagger =
    chars.length > 60 ? Math.min(0.03, 1.2 / chars.length) : 0.03;

  gsap.to(chars, {
    yPercent: 0,
    opacity: 1,
    duration: 1,
    stagger,
    ease: "power3.out",
    scrollTrigger: {
      trigger: triggerEl || el,
      start: "top 85%",
      toggleActions: "play none none reverse",
      id: `atelier-split-${Math.random().toString(36).slice(2, 9)}`,
    },
    onComplete: () => {
      chars.forEach((c) => c.style.removeProperty("will-change"));
    },
  });
}

export type AtelierTextSplitHandle = {
  refresh: () => void;
  destroy: () => void;
};

/**
 * Mount letter rise/fall on matching text inside `root` (defaults to .public-site).
 * Safe to call on route changes — skips already-split nodes.
 */
export function mountAtelierTextSplit(
  root: ParentNode | null = typeof document !== "undefined"
    ? document.querySelector(".public-site")
    : null,
): AtelierTextSplitHandle {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let cancelled = false;
  const triggerIds: string[] = [];

  const run = () => {
    if (cancelled || prefersReduced || !root) return;
    const seen = new Set<HTMLElement>();

    SELECTORS.forEach((sel) => {
      root.querySelectorAll(sel).forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (seen.has(node)) return;
        if (node.dataset.splitDone === "1" && node.dataset.atelierBound === "1") {
          return;
        }
        if (shouldSkip(node)) return;
        seen.add(node);

        const trigger =
          node.closest(
            "section, article, .about-layout, .services-intro, .carousel-slide, [data-hathor-accordion], .home-text-img-copy, .gallery-header, .instagram-follow, .testimonial-card, .testimonials-header, .cta-inner, .lux-section, .owo-chapter, .hathor-chapter, .venetian-page, .cruises-sheet, .public-page-body",
          ) || node;

        animateAtelierSplit(node, trigger);
        node.dataset.atelierBound = "1";
      });
    });
  };

  const boot = () => {
    const fonts = document.fonts?.ready;
    const start = () => {
      /* Let page-local SplitType (rooms/cruises) claim titles first */
      window.setTimeout(run, 120);
      window.setTimeout(run, 500);
    };
    if (fonts) void fonts.then(start);
    else start();
  };

  boot();

  return {
    refresh: run,
    destroy: () => {
      cancelled = true;
      ScrollTrigger.getAll().forEach((st) => {
        const id = String(st.vars?.id || "");
        if (id.startsWith("atelier-split-")) st.kill();
      });
      void triggerIds;
    },
  };
}
