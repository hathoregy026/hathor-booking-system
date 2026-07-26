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
 * Persist scroll Y everywhere. Restore on hard refresh for non-GSAP routes.
 * Homepage (`/`) restore is owned by useExScrollMotion (boot at 0 → restore → ready).
 */
export function ScrollPositionRestore() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    setScrollRestorationManual();

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

    /* `/` — persist only; GSAP owns restore after boot. */
    if (normalizePath(pathname) === "/") {
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
