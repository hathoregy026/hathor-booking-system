"use client";

import { ScrollTrigger } from "gsap/ScrollTrigger";

type PendingReason = string;

const ACTIVE_SCROLL_IDLE_MS = 180;
const REFRESH_DEBOUNCE_MS = 140;

let pendingReasons = new Set<PendingReason>();
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let lastActiveAt = 0;
let initialized = false;
let refreshRequestCount = 0;
let refreshActualCount = 0;

function publishDebug() {
  if (typeof window === "undefined" || process.env.NODE_ENV === "production") {
    return;
  }
  (
    window as Window & {
      __hathorRefreshDebug?: {
        requests: number;
        actual: number;
        lastActiveAt: number;
      };
    }
  ).__hathorRefreshDebug = {
    requests: refreshRequestCount,
    actual: refreshActualCount,
    lastActiveAt,
  };
}

function markActiveScroll() {
  lastActiveAt = Date.now();
  publishDebug();
}

function isScrollIdle() {
  return Date.now() - lastActiveAt > ACTIVE_SCROLL_IDLE_MS;
}

function flushRefresh() {
  refreshTimer = null;
  if (!pendingReasons.size) return;
  if (!isScrollIdle()) {
    scheduleRefresh();
    return;
  }
  pendingReasons.clear();
  try {
    ScrollTrigger.refresh();
    ScrollTrigger.update();
    refreshActualCount += 1;
    publishDebug();
  } catch {
    // noop
  }
}

function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(flushRefresh, REFRESH_DEBOUNCE_MS);
}

export function initScrollRefreshCoordinator() {
  if (initialized || typeof window === "undefined") return () => {};
  initialized = true;

  const onWheel = () => markActiveScroll();
  const onTouch = () => markActiveScroll();
  const onScroll = () => markActiveScroll();
  const onPointer = () => markActiveScroll();

  window.addEventListener("wheel", onWheel, { passive: true });
  window.addEventListener("touchstart", onTouch, { passive: true });
  window.addEventListener("touchmove", onTouch, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("pointerdown", onPointer, { passive: true });
  window.addEventListener("pointermove", onPointer, { passive: true });

  return () => {
    initialized = false;
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouch);
    window.removeEventListener("touchmove", onTouch);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointerdown", onPointer);
    window.removeEventListener("pointermove", onPointer);
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = null;
    pendingReasons.clear();
  };
}

export function requestScrollRefresh(reason: PendingReason) {
  pendingReasons.add(reason);
  refreshRequestCount += 1;
  publishDebug();
  scheduleRefresh();
}
