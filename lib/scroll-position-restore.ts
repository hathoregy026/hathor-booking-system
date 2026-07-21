/**
 * Persist scroll Y per path and restore it on hard refresh.
 * Lenis + GSAP otherwise always land at the hero after reload.
 */

import { ScrollTrigger } from "gsap/ScrollTrigger";

type LenisLike = {
  scrollTo: (
    target: number | string | HTMLElement,
    options?: { immediate?: boolean; force?: boolean },
  ) => void;
};

type HathorWindow = Window & {
  __hathorLenis?: LenisLike | null;
};

function storageKey(pathname: string): string {
  return `hathor:scroll-y:${pathname || "/"}`;
}

export function registerHathorLenis(lenis: LenisLike | null): void {
  if (typeof window === "undefined") return;
  (window as HathorWindow).__hathorLenis = lenis;
}

export function setScrollRestorationManual(): void {
  try {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  } catch {
    /* ignore */
  }
}

export function saveScrollPosition(pathname: string): void {
  if (typeof window === "undefined") return;
  try {
    const y =
      (window as HathorWindow).__hathorLenis &&
      typeof (window as HathorWindow & { __hathorLenis?: { scroll?: number } }).__hathorLenis
        ?.scroll === "number"
        ? Math.round(
            (window as HathorWindow & { __hathorLenis?: { scroll?: number } })
              .__hathorLenis!.scroll!,
          )
        : Math.round(window.scrollY || document.documentElement.scrollTop || 0);
    sessionStorage.setItem(storageKey(pathname), String(Math.max(0, y)));
  } catch {
    /* private mode / quota */
  }
}

export function bindScrollPositionPersistence(pathname: string): () => void {
  const save = () => saveScrollPosition(pathname);
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      save();
      ticking = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pagehide", save);
  window.addEventListener("beforeunload", save);

  return () => {
    save();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pagehide", save);
    window.removeEventListener("beforeunload", save);
  };
}

export function isReloadNavigation(): boolean {
  try {
    const nav = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;
    if (nav?.type === "reload") return true;
    const legacy = (
      performance as unknown as { navigation?: { type?: number } }
    ).navigation;
    if (legacy?.type === 1) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function readSavedScrollY(pathname: string): number {
  try {
    const y = Number(sessionStorage.getItem(storageKey(pathname)) || 0);
    return Number.isFinite(y) && y > 0 ? y : 0;
  } catch {
    return 0;
  }
}

/** Restore only on hard refresh — not on normal client navigations. */
export function restoreScrollPositionIfReload(pathname: string): boolean {
  if (typeof window === "undefined") return false;
  if (!isReloadNavigation()) return false;

  const y = readSavedScrollY(pathname);
  if (y <= 0) return false;

  const lenis = (window as HathorWindow).__hathorLenis;
  try {
    if (lenis?.scrollTo) {
      lenis.scrollTo(y, { immediate: true, force: true });
    } else {
      window.scrollTo(0, y);
    }
  } catch {
    window.scrollTo(0, y);
  }

  try {
    ScrollTrigger.update();
  } catch {
    /* ScrollTrigger may not be ready yet */
  }

  return true;
}
