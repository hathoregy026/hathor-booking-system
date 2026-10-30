"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import {
  findOccasion,
  findScheduledOccasion,
  isOccasionExcludedPath,
  OCCASION_FRAME_MESSAGES,
  OCCASION_FRAME_PARAM,
  OCCASION_PREVIEW_PARAM,
  OCCASION_PREVIEW_STORAGE_KEY,
  type Occasion,
} from "@/lib/occasions";
import { getPublicLenis } from "@/lib/public-scroll-controller";
import { useOccasions } from "@/components/occasions/OccasionsProvider";

/** `draft`: the unsaved occasion streamed in by the Admin → Occasions live preview. */
export type ActiveOccasion = { occasion: Occasion; now: number; draft?: boolean };

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

let adminLookup: Promise<Occasion[] | null> | null = null;

/**
 * Saved occasions, drafts included, from the admin API — or null without a
 * dashboard session. One request per page load, reused as the tab moves between pages.
 */
function loadAdminOccasions(): Promise<Occasion[] | null> {
  adminLookup ??= fetch("/api/admin/occasions", { credentials: "include", cache: "no-store" })
    .then(async (response) => {
      if (response.status !== 200) return null;
      const body = (await response.json()) as { settings?: { occasions?: Occasion[] } };
      return body.settings?.occasions ?? [];
    })
    .catch(() => null);
  return adminLookup;
}

/**
 * Previews are for signed-in dashboard users only. Public pages carry
 * switched-on occasions alone, so the occasion comes from the admin API;
 * anything but a 200 holding that id drops the preview for the tab.
 */
async function loadPreviewOccasion(id: string): Promise<Occasion | null> {
  const found = findOccasion((await loadAdminOccasions()) ?? [], id);
  try {
    if (found) window.sessionStorage.setItem(OCCASION_PREVIEW_STORAGE_KEY, id);
    else window.sessionStorage.removeItem(OCCASION_PREVIEW_STORAGE_KEY);
  } catch {
    /* storage blocked: the preview holds for this page only */
  }
  return found;
}

let frameCheck: Promise<boolean> | null = null;

/**
 * The live-preview frame inside Admin → Occasions (`?occasion-frame=1`, framed,
 * dashboard session confirmed). Remembered for the page so links clicked
 * inside the frame stay in preview.
 */
function previewFrameCheck(): Promise<boolean> | null {
  if (frameCheck) return frameCheck;
  try {
    if (window.parent === window) return null;
    if (new URLSearchParams(window.location.search).get(OCCASION_FRAME_PARAM) !== "1") return null;
  } catch {
    return null;
  }
  frameCheck = loadAdminOccasions().then((occasions) => occasions !== null);
  return frameCheck;
}

type FrameMessage = { type: string; occasion?: Occasion | null; scrolled?: boolean };

/** Only the same-origin page embedding this frame may drive it. */
function readFrameMessage(event: MessageEvent): FrameMessage | null {
  if (event.source !== window.parent || event.origin !== window.location.origin) return null;
  const data: unknown = event.data;
  if (!data || typeof data !== "object" || typeof (data as { type?: unknown }).type !== "string") {
    return null;
  }
  return data as FrameMessage;
}

/** Top of the page, or far enough down for the compact menu bar. */
function scrollFrame(scrolled: boolean) {
  const top = scrolled ? Math.round(window.innerHeight * 0.8) : 0;
  const lenis = getPublicLenis();
  if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo(0, top);
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
    if (isOccasionExcludedPath(pathname)) {
      const clear = window.setTimeout(() => setActive(null), 0);
      return () => window.clearTimeout(clear);
    }
    let stopped = false;
    let timer = 0;
    let draft = false;
    let pick = (now: number): Occasion | null => findScheduledOccasion(occasions, now);
    const tick = () => {
      window.clearTimeout(timer);
      if (stopped) return;
      const now = Date.now();
      const occasion = pick(now);
      setActive(occasion ? { occasion, now, draft } : null);
      timer = window.setTimeout(tick, occasion ? 1000 - (now % 1000) : 60_000);
    };
    const stop = () => {
      stopped = true;
      window.clearTimeout(timer);
    };

    const frame = previewFrameCheck();
    if (frame) {
      let streamed: Occasion | null = null;
      const onMessage = (event: MessageEvent) => {
        const message = readFrameMessage(event);
        if (message?.type === OCCASION_FRAME_MESSAGES.draft) {
          streamed = message.occasion ?? null;
          tick();
        } else if (message?.type === OCCASION_FRAME_MESSAGES.view) {
          scrollFrame(Boolean(message.scrolled));
        }
      };
      void frame.then((confirmed) => {
        if (stopped) return;
        if (confirmed) {
          draft = true;
          pick = () => streamed;
          window.addEventListener("message", onMessage);
          window.parent.postMessage({ type: OCCASION_FRAME_MESSAGES.ready }, window.location.origin);
        }
        tick();
      });
      return () => {
        stop();
        window.removeEventListener("message", onMessage);
      };
    }

    const previewId = readPreviewRequest();
    if (!previewId && occasions.length === 0) {
      const clear = window.setTimeout(() => setActive(null), 0);
      return () => window.clearTimeout(clear);
    }
    if (previewId) {
      void loadPreviewOccasion(previewId).then((preview) => {
        if (preview) pick = () => preview;
        tick();
      });
    } else {
      timer = window.setTimeout(tick, 0);
    }
    return stop;
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
