"use client";

import { useEffect } from "react";
import {
  getSiteImageFallbackSectionId,
  SITE_IMAGE_ANCHOR_PREFIX,
} from "@/lib/site-image-preview";

function scrollToPreviewTarget(hash: string) {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return;

  if (raw.startsWith(SITE_IMAGE_ANCHOR_PREFIX)) {
    const name = raw.slice(SITE_IMAGE_ANCHOR_PREFIX.length);
    const byId = document.getElementById(raw);
    const byData = document.querySelector<HTMLElement>(
      `[data-site-image="${CSS.escape(name)}"]`,
    );
    const target = byId ?? byData;

    if (target) {
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
      return;
    }

    const fallbackId = getSiteImageFallbackSectionId(name);
    if (fallbackId) {
      document
        .getElementById(fallbackId)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    return;
  }

  document
    .getElementById(raw)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Ensures admin “View on Live Site” hashes scroll to the image after hydration
 * (and when native hash scroll misses client-rendered media).
 */
export function SiteImagePreviewScroll() {
  useEffect(() => {
    const run = () => {
      const { hash } = window.location;
      if (!hash) return;
      // Wait a frame so layout/images have size.
      requestAnimationFrame(() => {
        window.setTimeout(() => scrollToPreviewTarget(hash), 80);
      });
    };

    run();
    window.addEventListener("hashchange", run);
    return () => window.removeEventListener("hashchange", run);
  }, []);

  return null;
}
