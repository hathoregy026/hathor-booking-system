"use client";

import { useEffect, useRef } from "react";
import { GASTRONOMY_SPRINGS_HTML } from "@/lib/gastronomy-springs-html";
import { ensurePublicScrollController } from "@/lib/public-scroll-controller";

const STYLE_HREFS = [
  "/gastronomy-springs/assets/stylesheets/global.css",
  "/gastronomy-springs/assets/stylesheets/design.css",
  "/gastronomy-springs/hathor-remap.css",
] as const;

const SCRIPT_SRCS = [
  "/gastronomy-springs/assets/javascripts/shared.js",
  "/gastronomy-springs/assets/javascripts/design.js",
] as const;

function loadStylesheet(href: string) {
  const existing = document.querySelector(`link[data-gs-clone="${href}"]`);
  if (existing) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.gsClone = href;
  document.head.appendChild(link);
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-gs-clone="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.dataset.gsClone = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

/** Springs locomotive mode locks the first sticky panel under React — keep native sticky. */
function unlockNativeStickyScroll() {
  const root = document.documentElement;
  const body = document.body;
  root.classList.remove("has-scroll-smooth", "has-scroll-dragging");
  root.style.height = "";
  root.style.overflow = "";
  body.style.height = "";
  body.style.overflow = "";
  body.style.position = "";
  body.style.transform = "";
  const scrollEls = document.querySelectorAll<HTMLElement>(
    "[data-scroll-container], .js-page-content-wrapper, .page-content-wrapper__inner",
  );
  scrollEls.forEach((el) => {
    el.style.transform = "";
    el.style.height = "";
    el.style.overflow = "";
  });
}

/**
 * True Springs /design clone — original HTML + CSS + JS from CLONE folder,
 * with gastronomy text/images and Hathor cream/gold remaps only.
 */
export function GastronomySpringsDesignPage() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.setAttribute("data-gastronomy-mask", "");
    root.classList.add("js", "has-hover");
    root.classList.remove("no-js", "not-ready");
    body.setAttribute("data-barba", "wrapper");
    unlockNativeStickyScroll();
    ensurePublicScrollController();

    for (const href of STYLE_HREFS) loadStylesheet(href);

    const mo = new MutationObserver(() => {
      if (root.classList.contains("has-scroll-smooth")) {
        unlockNativeStickyScroll();
      }
    });
    mo.observe(root, { attributes: true, attributeFilter: ["class"] });

    let cancelled = false;
    let unlockTimer = 0;

    (async () => {
      try {
        await new Promise((r) => window.setTimeout(r, 50));
        if (cancelled) return;
        for (const src of SCRIPT_SRCS) {
          await loadScript(src);
          if (cancelled) return;
          unlockNativeStickyScroll();
        }
        body.dispatchEvent(
          new CustomEvent("DOMContentLoaded", { bubbles: true }),
        );
        unlockNativeStickyScroll();
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new Event("scroll"));
        root.classList.remove("not-ready");
        // Springs may re-enable smooth scroll a few frames later
        unlockTimer = window.setInterval(unlockNativeStickyScroll, 250);
        window.setTimeout(() => {
          window.clearInterval(unlockTimer);
          unlockTimer = 0;
        }, 4000);
      } catch (err) {
        console.error("[gastronomy-springs]", err);
      }
    })();

    return () => {
      cancelled = true;
      mo.disconnect();
      if (unlockTimer) window.clearInterval(unlockTimer);
      root.removeAttribute("data-gastronomy-mask");
      body.removeAttribute("data-barba");
      ensurePublicScrollController();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="gastronomy-springs-host"
      dangerouslySetInnerHTML={{ __html: GASTRONOMY_SPRINGS_HTML }}
    />
  );
}
