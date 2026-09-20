"use client";

import { useEffect } from "react";
import {
  getSiteImageFallbackSectionId,
  readSiteImagePreviewName,
  siteImageAnchorId,
} from "@/lib/site-image-preview";

/** Pages that clone a scraped document keep their photos in a same-origin frame. */
function findInFrames(selector: string): HTMLElement | null {
  for (const frame of Array.from(document.querySelectorAll("iframe"))) {
    try {
      const inner = frame.contentDocument?.querySelector<HTMLElement>(selector);
      if (inner) return frame;
    } catch {
      /* cross-origin frame — nothing to read */
    }
  }
  return null;
}

function findPreviewTarget(name: string): HTMLElement | null {
  const anchorId = siteImageAnchorId(name);
  const byId = document.getElementById(anchorId);
  if (byId) return byId;

  const selector = `[data-site-image="${CSS.escape(name)}"]`;
  try {
    const byData = document.querySelector<HTMLElement>(selector);
    if (byData) return byData;
    const inFrame = findInFrames(selector);
    if (inFrame) return inFrame;
  } catch {
    /* ignore invalid selector */
  }

  /* Only fall back for slots that actually live on this page — never for orphans */
  const fallbackId = getSiteImageFallbackSectionId(name);
  if (fallbackId) {
    return document.getElementById(fallbackId);
  }
  return null;
}

function waitForMotionReady(): Promise<void> {
  return new Promise((resolve) => {
    const heavy =
      document.documentElement.hasAttribute("data-ex-experience") ||
      Boolean(document.querySelector("[data-highlights-editorial]")) ||
      Boolean(document.querySelector("[data-cruises-hero]"));

    if (!heavy) {
      window.setTimeout(resolve, 120);
      return;
    }

    const started = Date.now();
    const tick = () => {
      const ready =
        document.documentElement.classList.contains("has-ex-scroll-motion") ||
        document.documentElement.classList.contains("cruises-scroll-ready") ||
        document.body.classList.contains("has-ex-scroll-motion") ||
        Date.now() - started > 1600;
      if (ready) {
        window.setTimeout(resolve, 280);
        return;
      }
      window.requestAnimationFrame(tick);
    };
    tick();
  });
}

function scrollToElement(target: HTMLElement) {
  const pinIndex = target.dataset.siteImagePinIndex;
  const pinTotal = target.dataset.siteImagePinTotal;
  const pinSection = target.closest<HTMLElement>("[data-site-image-pin-root]");

  if (
    pinSection &&
    pinIndex != null &&
    pinTotal != null &&
    Number(pinTotal) > 0
  ) {
    const scrollable = pinSection.offsetHeight - window.innerHeight;
    const progress = (Number(pinIndex) + 0.45) / Number(pinTotal);
    const top =
      pinSection.getBoundingClientRect().top +
      window.scrollY +
      Math.max(0, scrollable) * Math.min(1, Math.max(0, progress));
    window.scrollTo({ top, behavior: "smooth" });
    return;
  }

  const rect = target.getBoundingClientRect();
  const top = Math.max(0, rect.top + window.scrollY - 88);
  window.scrollTo({ top, behavior: "smooth" });
}

function scrollToPreviewName(name: string) {
  try {
    const target = findPreviewTarget(name);
    if (!target) return;
    scrollToElement(target);
  } catch (error) {
    console.warn("[SiteImagePreviewScroll] scroll failed", error);
  }
}

/**
 * Scrolls admin “View on Live Site” targets after page motion has booted.
 * Uses ?viewImage= so GSAP/Lenis pages are not crashed by hash jumps.
 */
export function SiteImagePreviewScroll() {
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const name = readSiteImagePreviewName(
        window.location.search,
        window.location.hash,
      );
      if (!name) return;

      await waitForMotionReady();
      if (cancelled) return;
      scrollToPreviewName(name);

      // Retry after layout/images settle (homepage gallery, pinned stacks).
      window.setTimeout(() => {
        if (!cancelled) scrollToPreviewName(name);
      }, 900);
      window.setTimeout(() => {
        if (!cancelled) scrollToPreviewName(name);
      }, 2200);
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
