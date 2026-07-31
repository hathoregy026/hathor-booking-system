"use client";

/**
 * Luxury body motion for redesigned public pages (dining / wellness / highlights / rooms / cruises sheet).
 * Ported from assets/pages redesign/venetian-scroll-clone/js/lux-body.js
 * Does NOT touch PublicSiteHero / hero-scroll-stage.
 */

import { useLayoutEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { requestScrollRefresh } from "@/lib/scroll-refresh-coordinator";

gsap.registerPlugin(ScrollTrigger);

const DESKTOP_MQ = "(min-width: 1025px)";
const NARROW_MQ = "(max-width: 1024px)";

/** Book Now stays visible like homepage — never park at opacity 0. */
function isBookNowOrPillCta(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.matches(".public-fab__book")) return true;
  return /book\s*now/i.test((el.textContent || "").trim());
}

function keepCtaVisible(el: HTMLElement) {
  gsap.set(el, { opacity: 1, y: 0, clearProps: "opacity,visibility,transform" });
}

/** Recover elements that gsap.from parked at opacity 0 after ST refresh. */
function ensureRevealVisible(targets: gsap.TweenTarget) {
  gsap.set(targets, { opacity: 1, y: 0, clearProps: "visibility" });
}

function revealOnce(
  targets: gsap.TweenTarget,
  vars: Record<string, unknown>,
  trigger: Element | string | null | undefined,
  start: string,
) {
  gsap.from(targets, {
    ...vars,
    immediateRender: false,
    scrollTrigger: {
      trigger: trigger ?? undefined,
      start,
      once: true,
      onRefresh(self: ScrollTrigger) {
        if (self.progress === 1) ensureRevealVisible(targets);
      },
    },
  });
}

function setupLuxTitlesAndReveals(root: HTMLElement, ease: string, lux: string) {
  root.querySelectorAll<HTMLElement>("[data-lux-title]").forEach((el) => {
    revealOnce(
      el,
      { y: 42, opacity: 0, duration: 1.05, ease: lux },
      el,
      "top 88%",
    );
  });

  root.querySelectorAll<HTMLElement>("[data-lux-reveal]").forEach((el, i) => {
    /* Homepage Book Now is always painted — do not hide CTAs behind lux reveals. */
    if (isBookNowOrPillCta(el)) {
      keepCtaVisible(el);
      return;
    }
    revealOnce(
      el,
      {
        y: 28,
        opacity: 0,
        duration: 0.85,
        delay: (i % 6) * 0.05,
        ease,
      },
      el,
      "top 92%",
    );
  });
}

function setupLuxBands(root: HTMLElement, ease: string, lux: string) {
  root
    .querySelectorAll<HTMLElement>(".spx-suite-card, .hlx-manifesto-item")
    .forEach((el, i) => {
      revealOnce(
        el,
        {
          y: 48,
          opacity: 0,
          duration: 0.9,
          delay: (i % 4) * 0.08,
          ease,
        },
        el,
        "top 90%",
      );
    });

  const atelier = root.querySelector<HTMLElement>(".spx-atelier-grid");
  if (atelier) {
    const media = atelier.querySelector<HTMLElement>(".spx-atelier-media");
    const copy = atelier.querySelector<HTMLElement>(".spx-atelier-copy");
    if (media) {
      revealOnce(
        media,
        { x: -40, opacity: 0, duration: 1.05, ease },
        atelier,
        "top 78%",
      );
    }
    if (copy) {
      const kids = gsap.utils
        .toArray<HTMLElement>(copy.children)
        .filter((el) => !isBookNowOrPillCta(el));
      gsap.utils
        .toArray<HTMLElement>(copy.querySelectorAll(".btn, button, a.btn"))
        .filter(isBookNowOrPillCta)
        .forEach(keepCtaVisible);
      if (kids.length) {
        revealOnce(
          kids,
          { y: 30, opacity: 0, duration: 0.8, stagger: 0.08, ease },
          atelier,
          "top 78%",
        );
      }
    }
  }

  const quote = root.querySelector<HTMLElement>(".spx-quote blockquote");
  if (quote) {
    revealOnce(
      quote,
      { y: 44, opacity: 0, duration: 1.1, ease: lux },
      root.querySelector(".spx-quote") ?? quote,
      "top 80%",
    );
  }

  root.querySelectorAll<HTMLElement>(".hlx-compare-row").forEach((row, i) => {
    revealOnce(
      row,
      { y: 18, opacity: 0, duration: 0.55, delay: i * 0.05, ease },
      row,
      "top 94%",
    );
  });

  root.querySelectorAll<HTMLElement>(".spx-metric").forEach((m, i) => {
    revealOnce(
      m,
      { y: 24, opacity: 0, duration: 0.7, delay: i * 0.08, ease },
      m,
      "top 90%",
    );
  });

  root.querySelectorAll<HTMLElement>(".cta-section .cta-inner").forEach((cta) => {
    const ctas = gsap.utils.toArray<HTMLElement>(
      cta.querySelectorAll(".btn, button, a.btn"),
    );
    ctas.forEach(keepCtaVisible);

    const copy = gsap.utils
      .toArray<HTMLElement>(cta.querySelectorAll("h2, p, a"))
      .filter((el) => !isBookNowOrPillCta(el));
    if (!copy.length) return;

    revealOnce(
      copy,
      { y: 28, opacity: 0, duration: 0.8, stagger: 0.1, ease },
      cta,
      "top 82%",
    );
  });
}

function setupDesktopLuxMasks(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".lux-mask").forEach((mask) => {
    if (
      mask.closest(".spx-frame-media") ||
      mask.closest(".hlx-panel-media") ||
      mask.closest(".dnx-chapter-media") ||
      mask.closest(".acc-fs-media")
    ) {
      return;
    }
    const img = mask.querySelector("img");
    if (!img) return;
    gsap
      .timeline({
        scrollTrigger: { trigger: mask, start: "top 84%", once: true },
      })
      .fromTo(
        mask,
        { clipPath: "inset(10% 10% 10% 10% round 4px)" },
        {
          clipPath: "inset(0% 0% 0% 0% round 4px)",
          duration: 1.1,
          ease: "power2.out",
        },
      )
      .fromTo(
        img,
        { scale: 1.24 },
        { scale: 1, duration: 1.2, ease: "power2.out" },
        0,
      );
  });
}

function setupDesktopWellnessPins(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".spx-frame").forEach((frame) => {
    const img = frame.querySelector<HTMLElement>(".spx-frame-media img");
    const shade = frame.querySelector<HTMLElement>(".spx-frame-shade");
    const ui = frame.querySelector<HTMLElement>(".spx-frame-ui");
    const bits = ui
      ? gsap.utils
          .toArray<HTMLElement>(
            ui.querySelectorAll(
              ".lux-kicker, .lux-gold, .lux-lead, .lux-copy, .btn, a, button",
            ),
          )
          .filter((el) => !isBookNowOrPillCta(el))
      : [];
    const frameCtas = ui
      ? gsap.utils
          .toArray<HTMLElement>(ui.querySelectorAll(".btn, button, a.btn"))
          .filter(isBookNowOrPillCta)
      : [];
    frameCtas.forEach(keepCtaVisible);

    if (bits.length) gsap.set(bits, { y: 42, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: frame,
        start: "top top",
        end: "+=145%",
        scrub: 0.3,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    if (img) {
      tl.fromTo(
        img,
        { scale: 1.28, yPercent: 4 },
        { scale: 1, yPercent: 0, ease: "none", duration: 1 },
        0,
      );
    }
    if (shade) {
      tl.fromTo(
        shade,
        { opacity: 0.75 },
        { opacity: 1, duration: 0.35, ease: "none" },
        0,
      );
    }
    bits.forEach((el, i) => {
      tl.to(
        el,
        { y: 0, opacity: 1, duration: 0.18, ease: "none" },
        0.1 + i * 0.07,
      );
    });
    if (img) {
      tl.to(
        img,
        { yPercent: -8, scale: 1.04, duration: 0.4, ease: "none" },
        0.62,
      );
    }
    tl.to({}, { duration: 0.12 });
  });
}

function setupNarrowWellnessFrames(root: HTMLElement, ease: string) {
  root.querySelectorAll<HTMLElement>(".spx-frame").forEach((frame) => {
    const ui = frame.querySelector<HTMLElement>(".spx-frame-ui");
    if (!ui) return;

    gsap.utils
      .toArray<HTMLElement>(ui.querySelectorAll(".btn, button, a.btn"))
      .filter(isBookNowOrPillCta)
      .forEach(keepCtaVisible);

    const bits = gsap.utils
      .toArray<HTMLElement>(
        ui.querySelectorAll(
          ".lux-kicker, .lux-gold, .lux-lead, .lux-copy, .btn, a, button",
        ),
      )
      .filter((el) => !isBookNowOrPillCta(el));
    if (!bits.length) return;

    gsap.from(bits, {
      y: 24,
      opacity: 0,
      duration: 0.75,
      stagger: 0.06,
      ease,
      immediateRender: false,
      scrollTrigger: {
        trigger: frame,
        start: "top 88%",
        once: true,
        onRefresh(self) {
          if (self.progress === 1) gsap.set(bits, { opacity: 1, y: 0 });
        },
      },
    });
  });
}

function setupDesktopHighlightsPin(root: HTMLElement, ease: string) {
  const pin = root.querySelector<HTMLElement>(".hlx-pin");
  const track = root.querySelector<HTMLElement>("#hlx-track");
  const segs = root.querySelectorAll<HTMLElement>(".hlx-progress span i");
  if (!pin || !track) return;

  const getScroll = () => {
    const total = track.scrollWidth - window.innerWidth;
    return Math.max(window.innerWidth * 0.9, total + 100);
  };

  gsap.set(track, { x: 0 });
  gsap.to(track, {
    x: () => -getScroll(),
    ease: "none",
    scrollTrigger: {
      id: "hlx-horiz",
      trigger: pin,
      start: "top top",
      end: () => `+=${getScroll()}`,
      scrub: 0.25,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        const panels = track.querySelectorAll(".hlx-panel").length || 1;
        const raw = self.progress * panels;
        const active = Math.min(panels - 1, Math.floor(raw));
        const seg = raw - active;
        segs.forEach((fill, i) => {
          let sx = 0;
          if (i < active) sx = 1;
          else if (i === active) sx = seg;
          gsap.set(fill, { scaleX: sx });
        });
      },
    },
  });

  root.querySelectorAll<HTMLElement>(".hlx-panel").forEach((panel, i) => {
    revealOnce(
      panel,
      {
        y: 50,
        opacity: 0,
        duration: 0.9,
        delay: Math.min(i, 2) * 0.08,
        ease,
      },
      pin,
      "top 85%",
    );
  });
}

function setupNarrowHighlightsPanels(root: HTMLElement, ease: string) {
  root.querySelectorAll<HTMLElement>(".hlx-panel").forEach((panel, i) => {
    revealOnce(
      panel,
      {
        y: 32,
        opacity: 0,
        duration: 0.8,
        delay: Math.min(i, 2) * 0.05,
        ease,
      },
      panel,
      "top 92%",
    );
  });
}

function setupDesktopDiningChapters(
  root: HTMLElement,
  ease: string,
  lux: string,
) {
  root.querySelectorAll<HTMLElement>(".dnx-chapter").forEach((ch) => {
    const panel = ch.querySelector<HTMLElement>(".dnx-panel");
    const media = ch.querySelector<HTMLElement>(".dnx-chapter-media img");
    const shade = ch.querySelector<HTMLElement>(".dnx-chapter-shade");
    const allBits = panel
      ? gsap.utils.toArray<HTMLElement>(
          panel.querySelectorAll(
            ".lux-kicker, .lux-gold, .lux-copy, .lux-lead, .btn, a, button",
          ),
        )
      : [];
    const bits = allBits.filter((el) => !isBookNowOrPillCta(el));
    const chapterCtas = allBits.filter(isBookNowOrPillCta);
    chapterCtas.forEach(keepCtaVisible);

    if (bits.length) gsap.set(bits, { y: 28, opacity: 0 });

    if (media) {
      gsap.fromTo(
        media,
        { scale: 1.22 },
        {
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: ch,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }

    if (shade) {
      gsap.fromTo(
        shade,
        { opacity: 0.7 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: ch,
            start: "top 80%",
            end: "top 20%",
            scrub: true,
          },
        },
      );
    }

    if (panel) {
      gsap.from(panel, {
        y: 60,
        opacity: 0,
        duration: 1.05,
        ease: lux,
        immediateRender: false,
        scrollTrigger: {
          trigger: ch,
          start: "top 72%",
          once: true,
          onEnter: () => {
            gsap.to(bits, {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.08,
              ease,
              delay: 0.12,
            });
            chapterCtas.forEach(keepCtaVisible);
          },
          onRefresh(self) {
            if (self.progress === 1) {
              gsap.set(bits, { opacity: 1, y: 0 });
              chapterCtas.forEach(keepCtaVisible);
            }
          },
        },
      });
    }
  });
}

function setupNarrowDiningChapters(
  root: HTMLElement,
  ease: string,
  lux: string,
) {
  root.querySelectorAll<HTMLElement>(".dnx-chapter").forEach((ch) => {
    const panel = ch.querySelector<HTMLElement>(".dnx-panel");
    if (!panel) return;

    const allBits = gsap.utils.toArray<HTMLElement>(
      panel.querySelectorAll(
        ".lux-kicker, .lux-gold, .lux-copy, .lux-lead, .btn, a, button",
      ),
    );
    const bits = allBits.filter((el) => !isBookNowOrPillCta(el));
    const chapterCtas = allBits.filter(isBookNowOrPillCta);
    chapterCtas.forEach(keepCtaVisible);

    gsap.from(panel, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: lux,
      immediateRender: false,
      scrollTrigger: {
        trigger: ch,
        start: "top 82%",
        once: true,
        onEnter: () => {
          if (bits.length) {
            gsap.to(bits, {
              y: 0,
              opacity: 1,
              duration: 0.65,
              stagger: 0.07,
              ease,
              delay: 0.1,
            });
          }
          chapterCtas.forEach(keepCtaVisible);
        },
        onRefresh(self) {
          if (self.progress === 1) {
            gsap.set(bits, { opacity: 1, y: 0 });
            chapterCtas.forEach(keepCtaVisible);
          }
        },
      },
    });
  });
}

function setupDesktopHighlightsParallax(root: HTMLElement) {
  root.querySelectorAll<HTMLElement>(".hlx-panel-media img").forEach((img) => {
    gsap.fromTo(
      img,
      { scale: 1.18 },
      {
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: img.closest(".hlx-panel"),
          start: "top 90%",
          end: "top 30%",
          scrub: true,
        },
      },
    );
  });
}

function setupDesktopLuxBody(root: HTMLElement) {
  const ease = "power3.out";
  const lux = "power4.out";

  setupLuxTitlesAndReveals(root, ease, lux);
  setupLuxBands(root, ease, lux);
  setupDesktopLuxMasks(root);
  setupDesktopWellnessPins(root);
  setupDesktopHighlightsPin(root, ease);
  setupDesktopDiningChapters(root, ease, lux);
  setupDesktopHighlightsParallax(root);
}

function setupNarrowLuxBody(root: HTMLElement) {
  const ease = "power3.out";
  const lux = "power4.out";

  setupLuxTitlesAndReveals(root, ease, lux);
  setupLuxBands(root, ease, lux);
  setupNarrowWellnessFrames(root, ease);
  setupNarrowHighlightsPanels(root, ease);
  setupNarrowDiningChapters(root, ease, lux);
}

export function useHathorLuxBodyMotion(
  rootRef: RefObject<HTMLElement | null>,
  enabled = true,
) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        [DESKTOP_MQ]: () => setupDesktopLuxBody(root),
        [NARROW_MQ]: () => setupNarrowLuxBody(root),
      });
    }, root);

    const onLoad = () => requestScrollRefresh("lux-body-load");
    window.addEventListener("load", onLoad);
    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(
        () => requestScrollRefresh("lux-body-resize"),
        200,
      );
    };
    window.addEventListener("resize", onResize);

    requestAnimationFrame(() => requestScrollRefresh("lux-body-mount"));

    return () => {
      window.removeEventListener("load", onLoad);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      ctx.revert();
    };
  }, [rootRef, enabled]);
}
