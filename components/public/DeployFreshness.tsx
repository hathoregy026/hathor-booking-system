"use client";

import { useEffect } from "react";

const STORAGE_KEY = "hathor-deploy-id-v3";

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

async function unregisterServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((reg) => reg.unregister()));
  } catch {
    /* ignore */
  }
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
 * Keeps regular (non-Incognito) browsers on the current production build.
 * Stale HTML/JS tabs detect a deploy-id mismatch and hard-navigate after
 * the API clears the origin HTTP cache via Clear-Site-Data.
 */
export function DeployFreshness({ deployId }: { deployId: string }) {
  useEffect(() => {
    if (!deployId || deployId === "dev") return;
    let cancelled = false;

    const sync = async () => {
      await unregisterServiceWorkers();
      if (cancelled) return;

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

    void sync();

    const onVisible = () => {
      if (document.visibilityState === "visible") void sync();
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        hardNavigateToFresh(deployId);
        return;
      }
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
