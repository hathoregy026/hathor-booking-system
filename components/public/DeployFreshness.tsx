"use client";

import { useEffect } from "react";

const STORAGE_KEY = "hathor-deploy-id-v4";
/** A returning tab checks at most this often — the endpoint is a cold function. */
const CHECK_INTERVAL_MS = 60_000;

function hardNavigateToFresh(deployId: string) {
  try {
    const guardKey = `hathor-reload-guard-${deployId}`;
    if (window.sessionStorage.getItem(guardKey) === "1") return;
    window.sessionStorage.setItem(guardKey, "1");
  } catch {
    /* continue */
  }
  const url = new URL(window.location.href);
  url.searchParams.set("_d", deployId);
  /* Bust any intermediary cache and drop soft-nav state. */
  window.location.replace(url.toString());
}

async function fetchLiveDeployId(pageDeployId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/deploy-id?t=${Date.now()}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "x-hathor-page-deploy": pageDeployId,
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id?: string; stale?: boolean };
    return data.id?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Keeps long-lived tabs on the current production build.
 *
 * The inline boot script already checks once on every full page load, so this
 * only re-checks when a tab comes back into view (throttled). A mismatch
 * reloads the page — hashed chunks and must-revalidate HTML make that enough,
 * so browser caches and storage are left alone.
 */
export function DeployFreshness({ deployId }: { deployId: string }) {
  useEffect(() => {
    if (!deployId || deployId === "dev") return;
    let cancelled = false;
    let lastCheck = Date.now();

    const sync = async () => {
      const now = Date.now();
      if (now - lastCheck < CHECK_INTERVAL_MS) return;
      lastCheck = now;
      const liveId = await fetchLiveDeployId(deployId);
      if (cancelled || !liveId || liveId === "dev") return;

      try {
        const prev = window.sessionStorage.getItem(STORAGE_KEY);
        window.sessionStorage.setItem(STORAGE_KEY, liveId);
        if (liveId !== deployId || (prev && prev !== liveId)) {
          hardNavigateToFresh(liveId);
        }
      } catch {
        if (liveId !== deployId) hardNavigateToFresh(liveId);
      }
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") void sync();
    };
    /* A back/forward restore only reloads if production actually moved on. */
    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      lastCheck = 0;
      void sync();
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [deployId]);

  return null;
}
