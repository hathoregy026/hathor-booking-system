"use client";

import { useSyncExternalStore } from "react";
import { PUBLIC_PHONE_MAX_WIDTH } from "@/lib/admin-device-preview";

const PHONE_MQ = `(max-width: ${PUBLIC_PHONE_MAX_WIDTH}px)`;

function readForcePhoneFromUrl(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("adminPhonePreview") === "1";
  } catch {
    return false;
  }
}

function subscribe(onStoreChange: () => void): () => void {
  const mq = window.matchMedia(PHONE_MQ);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
  return readForcePhoneFromUrl() || window.matchMedia(PHONE_MQ).matches;
}

/** SSR / first server render — unknown; CSS @media still applies sizes. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * True on phone viewports (≤767px) and when `?adminPhonePreview=1` (admin iframes).
 * Uses useSyncExternalStore so the first client paint matches the real viewport
 * (avoids a desktop→phone flash that made mobile CMS edits look “stuck”).
 */
export function useIsPhoneViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
