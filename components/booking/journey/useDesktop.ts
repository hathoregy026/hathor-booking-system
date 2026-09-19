"use client";

import { useSyncExternalStore } from "react";

/** The journey's desktop layout starts where the tablet one ends (see booking-journey.css). */
const DESKTOP = "(min-width: 1081px)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(DESKTOP);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True on the full-screen desktop layout; false on the server and on tablet and phone. */
export function useDesktop(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP).matches, () => false);
}
