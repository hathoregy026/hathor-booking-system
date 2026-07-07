"use client";

import { useEffect } from "react";

const SCROLL_TEXT_SELECTOR = [
  ".public-site .owo-hero [class*='__title']",
  ".public-site .owo-hero [class*='__subtitle']",
  ".public-site .owo-chapter [class*='__title']",
  ".public-site .owo-chapter .hathor-body-text",
  ".public-site .hathor-intro__paragraph",
  ".public-site .hathor-chapter-intro",
].join(",");

const SKIP_ANCESTOR_SELECTOR = [
  "[data-test-scroll-reveal]",
  "[data-page-transition]",
  ".pt-hero__copy",
  "[data-lux-scroll-reveal]",
  ".pt-sheet__landing",
  ".pt-sheet__filters",
].join(",");

function shouldSkip(el: Element): boolean {
  return Boolean(el.closest(SKIP_ANCESTOR_SELECTOR));
}

export function LuxuryTextAnimations() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const seen = new WeakSet<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("hathor-lux-text--in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    const register = () => {
      document.querySelectorAll(SCROLL_TEXT_SELECTOR).forEach((el) => {
        if (!(el instanceof HTMLElement)) return;
        if (seen.has(el)) return;
        if (shouldSkip(el)) return;
        if (el.classList.contains("hathor-lux-text")) return;

        seen.add(el);
        el.classList.add("hathor-lux-text");
        observer.observe(el);
      });
    };

    register();
    const timer = window.setTimeout(register, 400);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return null;
}
