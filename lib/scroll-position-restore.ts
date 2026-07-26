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

function normalizePath(pathname: string): string {
  if (!pathname || pathname === "") return "/";
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/** Path the document was first loaded on (hard navigation / reload). */
export function getDocumentLoadPathname(): string {
  try {
    const nav = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming | undefined;
    if (nav?.name) {
      return normalizePath(new URL(nav.name, window.location.origin).pathname);
    }
  } catch {
    /* ignore */
  }
  return normalizePath(window.location.pathname || "/");
}

/**
 * True only for the initial hard load/reload of this pathname — not for later
 * App Router soft navigations (performance.navigation.type stays "reload" for
 * the whole SPA session, which previously restored mid-page scroll on Home).
 */
const restoredThisDocument = new Set<string>();

export function shouldRestoreScrollOnMount(pathname: string): boolean {
  if (typeof window === "undefined") return false;
  if (!isReloadNavigation()) return false;
  const path = normalizePath(pathname);
  if (restoredThisDocument.has(path)) return false;
  if (normalizePath(getDocumentLoadPathname()) !== path) return false;
  return readSavedScrollY(path) > 0;
}

/** Claim restore ownership so competing callers cannot race this path. */
export function claimScrollRestore(pathname: string): void {
  restoredThisDocument.add(normalizePath(pathname));
}

/** Jump to an absolute Y (Lenis if present). Does not touch the once-gate. */
export function applyScrollY(y: number): void {
  if (typeof window === "undefined") return;
  const target = Math.max(0, Math.round(y));
  const lenis = (window as HathorWindow).__hathorLenis;
  try {
    if (lenis?.scrollTo) {
      lenis.scrollTo(target, { immediate: true, force: true });
    } else {
      window.scrollTo(0, target);
    }
  } catch {
    window.scrollTo(0, target);
  }

  try {
    ScrollTrigger.update();
  } catch {
    /* ScrollTrigger may not be ready yet */
  }
}

/** Restore only on hard refresh of this path — not on client navigations back. */
export function restoreScrollPositionIfReload(pathname: string): boolean {
  if (typeof window === "undefined") return false;
  if (!shouldRestoreScrollOnMount(pathname)) return false;

  const path = normalizePath(pathname);
  const y = readSavedScrollY(path);
  if (y <= 0) return false;

  claimScrollRestore(path);
  applyScrollY(y);
  return true;
}
