type GtagFn = (...args: unknown[]) => void;

function getGtag(): GtagFn | null {
  if (typeof window === "undefined") return null;
  const gtag = (window as Window & { gtag?: GtagFn }).gtag;
  return typeof gtag === "function" ? gtag : null;
}

const EVENT_NAME = /^[a-z][a-z0-9_]{1,39}$/;

/** Fire a GA4 event if gtag is present. Never throws. No PII. */
export function trackGaEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): void {
  if (!EVENT_NAME.test(name)) return;
  try {
    const gtag = getGtag();
    if (!gtag) return;
    if (params) gtag("event", name, params);
    else gtag("event", name);
  } catch {
    /* tracking must never break checkout */
  }
}
