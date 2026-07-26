"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  bindScrollPositionPersistence,
  getDocumentLoadPathname,
  isReloadNavigation,
  restoreScrollPositionIfReload,
  setScrollRestorationManual,
} from "@/lib/scroll-position-restore";

type HathorWindow = Window & {
  __hathorLenis?: {
    scrollTo: (
      target: number | string | HTMLElement,
      options?: { immediate?: boolean; force?: boolean },
    ) => void;
  } | null;
};

function normalizePath(pathname: string): string {
  if (!pathname || pathname === "") return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function isSoftClientNavigation(pathname: string): boolean {
  if (!isReloadNavigation()) return true;
  return normalizePath(getDocumentLoadPathname()) !== normalizePath(pathname);
}

/**
 * Paths whose GSAP boot owns hard-refresh scroll restore.
 * ScrollPositionRestore still persists Y — it must not race ST mount.
 */
const GSAP_OWNED_SCROLL_RESTORE = new Set(["/"]);

/**
 * On hard refresh of the current path, land at the last scroll position.
 * Soft navigations always reset to top so GSAP pages never boot mid-scrub.
 */
export function ScrollPositionRestore() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    setScrollRestorationManual();
    const path = normalizePath(pathname);
    const gsapOwnsRestore = GSAP_OWNED_SCROLL_RESTORE.has(path);

    if (isSoftClientNavigation(pathname)) {
      try {
        const lenis = (window as HathorWindow).__hathorLenis;
        if (lenis?.scrollTo) {
          lenis.scrollTo(0, { immediate: true, force: true });
        }
      } catch {
        /* ignore */
      }
      window.scrollTo(0, 0);
    }

    const unbind = bindScrollPositionPersistence(pathname);

    if (gsapOwnsRestore) {
      return () => {
        unbind();
      };
    }

    const restore = () => {
      if (restoreScrollPositionIfReload(pathname)) {
        try {
          ScrollTrigger.refresh();
        } catch {
          /* ignore */
        }
      }
    };

    const timers = [0, 60, 180, 400, 900, 1600].map((ms) =>
      window.setTimeout(restore, ms),
    );

    const onLoad = () => {
      restore();
      window.setTimeout(restore, 50);
    };
    window.addEventListener("load", onLoad);

    return () => {
      unbind();
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener("load", onLoad);
    };
  }, [pathname]);

  return null;
}
