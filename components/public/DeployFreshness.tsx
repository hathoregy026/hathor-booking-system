"use client";

import { useEffect } from "react";

const STORAGE_KEY = "hathor-deploy-id-v2";

/**
 * After a new Vercel deploy, soft-nav / SPA tabs can keep the previous
 * Flight payload and client chunks in memory ("old production flashbacks").
 * When the commit changes, force a hard reload once per tab.
 */
export function DeployFreshness({ deployId }: { deployId: string }) {
  useEffect(() => {
    if (!deployId || deployId === "dev") return;

    try {
      const prev = window.sessionStorage.getItem(STORAGE_KEY);
      window.sessionStorage.setItem(STORAGE_KEY, deployId);
      if (prev && prev !== deployId) {
        const url = new URL(window.location.href);
        url.searchParams.set("_d", deployId);
        window.location.replace(url.toString());
      }
    } catch {
      /* private mode / blocked storage */
    }
  }, [deployId]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  return null;
}
