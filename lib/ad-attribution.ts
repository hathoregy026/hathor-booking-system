/*
 * Where a visitor came from (Google Ads click id and UTM tags), kept in this
 * browser only so a later booking request can say which campaign earned it.
 * No names, emails or phone numbers are ever stored here. Every read and
 * write is guarded: storage can be blocked, and tracking must never break a
 * page or a booking.
 */

const STORAGE_KEY = "hathor_attribution_v1";
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;
const CLICK_ID_KEYS = ["gclid", "gbraid", "wbraid", "fbclid", "msclkid"] as const;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const SAFE_VALUE = /^[\p{L}\p{N} _.\-+:|/()&%,!']{1,200}$/u;

export type AttributionTouch = {
  gclid?: string;
  gbraid?: string;
  wbraid?: string;
  fbclid?: string;
  msclkid?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  landing?: string;
  referrer?: string;
  ts: number;
};

export type StoredAttribution = { first: AttributionTouch; last: AttributionTouch };

function clean(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, 200);
  return SAFE_VALUE.test(trimmed) ? trimmed : undefined;
}

function readStored(): StoredAttribution | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAttribution;
    if (!parsed?.last?.ts || Date.now() - parsed.last.ts > MAX_AGE_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Reads the address once per page view; a tagged visit becomes the latest touch. */
export function captureAttribution(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.location.pathname.startsWith("/admin")) return;
    const params = new URLSearchParams(window.location.search);
    const touch: AttributionTouch = { ts: Date.now() };
    let tagged = false;
    for (const key of [...CLICK_ID_KEYS, ...UTM_KEYS]) {
      const value = clean(params.get(key));
      if (value) {
        touch[key] = value;
        tagged = true;
      }
    }
    const referrerHost = (() => {
      try {
        if (!document.referrer) return undefined;
        const host = new URL(document.referrer).hostname;
        return host && host !== window.location.hostname ? host : undefined;
      } catch {
        return undefined;
      }
    })();
    const stored = readStored();
    // Untagged internal page views never overwrite how the visitor arrived.
    if (!tagged && (stored || !referrerHost)) return;
    touch.landing = clean(window.location.pathname);
    touch.referrer = clean(referrerHost);
    const next: StoredAttribution = { first: stored?.first ?? touch, last: touch };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: nothing to remember */
  }
}

/** The compact record sent with a booking request (or null when unknown). */
export function readAttribution(): StoredAttribution | null {
  if (typeof window === "undefined") return null;
  return readStored();
}
