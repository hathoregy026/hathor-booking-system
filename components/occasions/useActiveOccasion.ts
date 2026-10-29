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

/** The id asked for by `?occasion=<id>` or held for this tab; `?occasion=off` clears it. */
function readPreviewRequest(): string | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get(OCCASION_PREVIEW_PARAM);
    if (fromUrl === "off") {
      window.sessionStorage.removeItem(OCCASION_PREVIEW_STORAGE_KEY);
      return null;
    }
    return fromUrl || window.sessionStorage.getItem(OCCASION_PREVIEW_STORAGE_KEY);
  } catch {
    return null;
  }
}

let previewLookup: { id: string; occasion: Promise<Occasion | null> } | null = null;

/**
 * Previews are for signed-in dashboard users only. Public pages carry
 * switched-on occasions alone, so the occasion (drafts included) comes from
 * the admin API; anything but a 200 holding that id drops the preview for the
 * tab. One lookup per page load, shared by the header and the home countdown.
 */
function loadPreviewOccasion(id: string): Promise<Occasion | null> {
  if (previewLookup?.id === id) return previewLookup.occasion;
  const occasion = fetch("/api/admin/occasions", { credentials: "include", cache: "no-store" })
    .then(async (response) => {
      if (response.status !== 200) return null;
      const body = (await response.json()) as { settings?: { occasions?: Occasion[] } };
      return findOccasion(body.settings?.occasions ?? [], id);
    })
    .catch(() => null)
    .then((found) => {
      try {
        if (found) window.sessionStorage.setItem(OCCASION_PREVIEW_STORAGE_KEY, id);
        else window.sessionStorage.removeItem(OCCASION_PREVIEW_STORAGE_KEY);
      } catch {
        /* storage blocked: the preview holds for this page only */
      }
      return found;
    });
  previewLookup = { id, occasion };
  return occasion;
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
    const previewId = isOccasionExcludedPath(pathname) ? null : readPreviewRequest();
    if (isOccasionExcludedPath(pathname) || (!previewId && occasions.length === 0)) {
      const clear = window.setTimeout(() => setActive(null), 0);
      return () => window.clearTimeout(clear);
    }
    let stopped = false;
    let timer = 0;
    const start = (preview: Occasion | null) => {
      if (stopped) return;
      const tick = () => {
        const now = Date.now();
        const occasion = preview ?? findScheduledOccasion(occasions, now);
        setActive(occasion ? { occasion, now } : null);
        timer = window.setTimeout(tick, occasion ? 1000 - (now % 1000) : 60_000);
      };
      tick();
    };
    if (previewId) void loadPreviewOccasion(previewId).then(start);
    else timer = window.setTimeout(() => start(null), 0);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
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
