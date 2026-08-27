/**
 * Suites anima__title scroll: clipped lines, letters rise/fall in opposing
 * directions, 0.75s / stagger 0.05 / power3.out, play once when in view.
 */

import gsap from "gsap";
import SplitType from "split-type";
import { shouldLightenMotionForDevice } from "@/lib/touch-device";

const TITLE_SELECTORS = [
  "[data-anima-title]",
  ".mr-explore__title",
  ".mr-cta__title",
  "[data-lux-title]",
  ".nib-intro__titles",
  ".nib-statement__title",
  ".nib-atelier__copy > h2",
  ".nib-story > h2",
  ".nib-story-end > h2",
  ".nib-contact > h2",
  ".nib-lines",
  ".nib-value > h2",
  ".ce-intro__title",
  ".ab-intro__title",
  ".vb-intro__title",
  ".wb-intro__title",
  ".hl-intro__title",
  ".cr-intro__titles",
  ".ce-manifesto__headline",
  ".ab-manifesto__headline",
  ".vb-manifesto__headline",
  ".wb-manifesto__headline",
  ".hl-manifesto__headline",
  ".ce-ledger__title h2",
  ".ab-big-title",
  ".ce-big-title",
  ".vb-big-title",
  ".wb-big-title",
  ".ce-epilogue__title h2",
  ".ab-epilogue__title h2",
  ".vb-epilogue__title h2",
  ".wb-epilogue__title h2",
  ".hl-epilogue__head h2",
  ".ce-epilogue__statement",
  ".ab-epilogue__statement",
  ".vb-epilogue__statement",
  ".wb-epilogue__statement",
  ".hl-epilogue__statement",
  ".cp-title",
  ".lux-gold-lg",
  ".lux-gold-xl",
] as const;

const SKIP_CLOSEST = [
  ".nav-bar",
  ".site-nav",
  ".public-navbar",
  "header.public-navbar",
  ".hathor-page-hero",
  ".home-hero-container",
  ".lux-footer",
  "footer",
  ".booking-modal",
  ".admin-shell",
  "button",
  "input",
  "textarea",
  "select",
  "a.btn",
  ".btn",
  ".mr-explore-card",
  ".luxury-marquee",
].join(",");

export type AnimaTitleSplitHandle = {
  destroy: () => void;
};

function shouldSkip(el: HTMLElement): boolean {
  if (el.dataset.animaBound === "1") return true;
  if (el.closest("[data-anima-bound='1']")) return true;
  if (el.closest(SKIP_CLOSEST)) return true;
  if (!(el.textContent || "").trim()) return true;
  return false;
}

function playPreparedLines(
  host: HTMLElement,
  lines: HTMLElement[],
  light: boolean,
) {
  const timeline = gsap.timeline({ paused: true });

  lines.forEach((line, index) => {
    const units = light
      ? line.querySelectorAll<HTMLElement>(
          ".anima-split-word, .anima-title-word, .word",
        )
      : line.querySelectorAll<HTMLElement>(
          ".anima-split-char, .anima-title-char, .char",
        );
    const targets = units.length
      ? Array.from(units)
      : [line];
    const fromY = index % 2 !== 0 ? "-110%" : "110%";
    targets.forEach((unit) => {
      unit.style.setProperty("--char-direction", index % 2 !== 0 ? "-1" : "1");
    });
    gsap.set(targets, { y: fromY });
    timeline.fromTo(
      targets,
      { y: fromY },
      {
        y: 0,
        duration: 0.75,
        stagger: light ? 0.04 : 0.05,
        ease: "power3.out",
      },
      index === 0 ? 0 : "-=0.4",
    );
  });

  const play = () => {
    if (host.dataset.animaPlayed === "1") return;
    host.dataset.animaPlayed = "1";
    timeline.play();
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        play();
        io.disconnect();
        break;
      }
    },
    { threshold: 0.18, rootMargin: "0px 0px -12% 0px" },
  );

  io.observe(host);
  requestAnimationFrame(() => {
    const rect = host.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const vw = window.innerWidth || 1;
    if (
      rect.bottom > vh * 0.12 &&
      rect.top < vh * 0.88 &&
      rect.right > vw * 0.08 &&
      rect.left < vw * 0.92
    ) {
      play();
      io.disconnect();
    }
  });

  const fallback = window.setTimeout(() => {
    if (host.dataset.animaPlayed === "1") return;
    host.dataset.animaPlayed = "1";
    lines.forEach((line) => {
      gsap.set(
        line.querySelectorAll(
          ".anima-split-char, .anima-split-word, .anima-title-char, .anima-title-word, .char, .word",
        ),
        { y: 0 },
      );
    });
    io.disconnect();
  }, 4000);

  return () => {
    window.clearTimeout(fallback);
    io.disconnect();
    timeline.kill();
  };
}

function splitUnits(el: HTMLElement, light: boolean) {
  return new SplitType(el, {
    types: light ? "words" : "chars",
    tagName: "span",
    wordClass: "anima-title-word",
    charClass: "anima-title-char",
  });
}

function collectLines(el: HTMLElement, light: boolean): HTMLElement[] {
  const prepared = el.querySelectorAll<HTMLElement>(".anima-split-line");
  if (prepared.length) return Array.from(prepared);

  const kids = Array.from(el.children).filter(
    (node): node is HTMLElement =>
      node instanceof HTMLElement && !!(node.textContent || "").trim(),
  );
  const lineHosts =
    kids.length >= 2
      ? kids.flatMap((kid) => {
          const bits = Array.from(kid.children).filter(
            (node): node is HTMLElement =>
              node instanceof HTMLElement &&
              !!(node.textContent || "").trim() &&
              node.matches("span, em, strong"),
          );
          if (bits.length >= 2) return bits;
          return [kid];
        })
      : kids;
  if (
    lineHosts.length >= 2 &&
    lineHosts.every((kid) => kid.matches("span, h1, h2, em, strong"))
  ) {
    lineHosts.forEach((kid) => {
      kid.classList.add("anima-title-line");
      if (!kid.querySelector(".anima-split-char, .anima-title-char, .char")) {
        splitUnits(kid, light);
      }
    });
    return lineHosts;
  }

  const split = new SplitType(el, {
    types: light ? "lines,words" : "lines,chars",
    tagName: "span",
    lineClass: "anima-title-line",
    wordClass: "anima-title-word",
    charClass: "anima-title-char",
  });

  return (split.lines || []).filter(
    (node): node is HTMLElement => node instanceof HTMLElement,
  );
}

function bindTitle(el: HTMLElement, light: boolean): () => void {
  el.dataset.animaBound = "1";
  const lines = collectLines(el, light);
  if (!lines.length) return () => undefined;
  return playPreparedLines(el, lines, light);
}

/**
 * Mount the Suites clip-letter title animation on matching headings in `root`.
 */
export function mountAnimaTitleSplit(
  root: ParentNode | null = typeof document !== "undefined"
    ? document.querySelector(".public-site") || document.body
    : null,
): AnimaTitleSplitHandle {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const light =
    typeof window !== "undefined" && shouldLightenMotionForDevice();

  const cleanups: Array<() => void> = [];
  let cancelled = false;

  const run = () => {
    if (cancelled || prefersReduced || !root) return;
    const seen = new Set<HTMLElement>();

    TITLE_SELECTORS.forEach((sel) => {
      root.querySelectorAll(sel).forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (seen.has(node)) return;
        if (shouldSkip(node)) return;
        seen.add(node);
        cleanups.push(bindTitle(node, light));
      });
    });
  };

  const start = () => {
    window.setTimeout(run, 80);
    window.setTimeout(run, 480);
  };

  if (typeof document !== "undefined" && document.fonts?.ready) {
    void document.fonts.ready.then(start);
  } else {
    start();
  }

  return {
    destroy: () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    },
  };
}
