"use client";

import { useEffect } from "react";
import {
  getSiteImageFallbackSectionId,
  readSiteImagePreviewName,
  siteImageAnchorId,
  SITE_IMAGE_VIEW_PARAM,
} from "@/lib/site-image-preview";

function findPreviewTarget(name: string): HTMLElement | null {
  const anchorId = siteImageAnchorId(name);
  const byId = document.getElementById(anchorId);
  if (byId) return byId;

  try {
    const byData = document.querySelector<HTMLElement>(
      `[data-site-image="${CSS.escape(name)}"]`,
    );
    if (byData) return byData;
  } catch {
    /* ignore invalid selector */
  }

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

function scrollToPreviewName(name: string) {
  try {
    const target = findPreviewTarget(name);
    if (!target) return;

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

    target.scrollIntoView({ behavior: "smooth", block: "center" });
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

      // Keep a clean shareable URL without forcing a hash fight on reload.
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has(SITE_IMAGE_VIEW_PARAM)) {
          // Keep the param so refresh still lands on the same image.
        }
      } catch {
        /* ignore */
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
