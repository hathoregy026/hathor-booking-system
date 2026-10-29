"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  findOccasion,
  findScheduledOccasion,
  isOccasionExcludedPath,
  OCCASION_PREVIEW_PARAM,
  OCCASION_PREVIEW_STORAGE_KEY,
  type Occasion,
} from "@/lib/occasions";
import { useOccasions } from "@/components/occasions/OccasionsProvider";

export type ActiveOccasion = { occasion: Occasion; now: number };

/** `?occasion=<id>` previews an occasion for this tab; `?occasion=off` clears it. */
function readPreviewOccasion(occasions: Occasion[]): Occasion | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get(OCCASION_PREVIEW_PARAM);
    if (fromUrl === "off") {
      window.sessionStorage.removeItem(OCCASION_PREVIEW_STORAGE_KEY);
      return null;
    }
    if (fromUrl && findOccasion(occasions, fromUrl)) {
      window.sessionStorage.setItem(OCCASION_PREVIEW_STORAGE_KEY, fromUrl);
      return findOccasion(occasions, fromUrl);
    }
    return findOccasion(occasions, window.sessionStorage.getItem(OCCASION_PREVIEW_STORAGE_KEY));
  } catch {
    return null;
  }
}

/**
 * The occasion dressing the current page, re-read every second so countdowns
 * tick and the layer leaves on time. Client-only: the first render is null,
 * so cached HTML never disagrees with the visitor's clock.
 */
export function useActiveOccasion(): ActiveOccasion | null {
  const pathname = usePathname();
  const occasions = useOccasions();
  const [active, setActive] = useState<ActiveOccasion | null>(null);

  useEffect(() => {
    if (isOccasionExcludedPath(pathname) || occasions.length === 0) {
      const clear = window.setTimeout(() => setActive(null), 0);
      return () => window.clearTimeout(clear);
    }
    const preview = readPreviewOccasion(occasions);
    let timer = 0;
    const tick = () => {
      const now = Date.now();
      const occasion = preview ?? findScheduledOccasion(occasions, now);
      setActive(occasion ? { occasion, now } : null);
      timer = window.setTimeout(tick, occasion ? 1000 - (now % 1000) : 60_000);
    };
    timer = window.setTimeout(tick, 0);
    return () => window.clearTimeout(timer);
  }, [pathname, occasions]);

  return active;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}
