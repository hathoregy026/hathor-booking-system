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

/**
 * True Springs /design clone — original HTML + CSS + JS from CLONE folder,
 * with gastronomy text/images and Hathor cream/gold remaps only.
 */
export function GastronomySpringsDesignPage() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-gastronomy-mask", "");
    root.classList.add("js", "has-hover");
    root.classList.remove("no-js", "not-ready");
    ensurePublicScrollController();

    for (const href of STYLE_HREFS) loadStylesheet(href);

    let cancelled = false;

    (async () => {
      try {
        // Give styles a tick, then mount Springs engine (same order as design/index.html)
        await new Promise((r) => window.setTimeout(r, 50));
        if (cancelled) return;
        for (const src of SCRIPT_SRCS) {
          await loadScript(src);
          if (cancelled) return;
        }
        // Springs plugins often boot on DOMContentLoaded — nudge a resize/scroll
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new Event("scroll"));
      } catch (err) {
        console.error("[gastronomy-springs]", err);
      }
    })();

    return () => {
      cancelled = true;
      root.removeAttribute("data-gastronomy-mask");
      ensurePublicScrollController();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="gastronomy-springs-host"
      // Exact Springs design markup (transformed text/images only)
      dangerouslySetInnerHTML={{ __html: GASTRONOMY_SPRINGS_HTML }}
    />
  );
}
