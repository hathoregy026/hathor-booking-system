type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

/**
 * Drop expired entries so the Map cannot grow without bound.
 * Cheap: only runs when the store gets large, and only walks it once.
 */
const MAX_ENTRIES_BEFORE_SWEEP = 5_000;

function sweepExpired(now: number): void {
  if (store.size < MAX_ENTRIES_BEFORE_SWEEP) return;

  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  sweepExpired(now);

  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Clear a key's counter. Use after a *successful* auth attempt so a
 * legitimate user who fat-fingered their password a few times is not
 * left throttled for the rest of the window.
 */
export function resetRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Resolve the caller's IP for rate-limiting/abuse-tracking purposes.
 *
 * `x-vercel-forwarded-for` is stamped by Vercel's own edge network and is
 * NOT something a client can set — Vercel strips any client-supplied copy
 * of this exact header before the request reaches our code. Use it first.
 *
 * The generic `x-forwarded-for` header, by contrast, is only "append the
 * real IP to whatever the client already sent" at most proxies, so the
 * *first* hop (`split(",")[0]`) is attacker-controlled — a client can send
 * `X-Forwarded-For: <anything>` and have that value read back as "their"
 * IP, minting a fresh rate-limit bucket on every request. Off Vercel (e.g.
 * local dev behind a single reverse proxy) the last hop is the one our own
 * proxy observed directly, so it is the one to trust.
 */
export function getClientIp(request: Request): string {
  const vercelIp = request.headers.get("x-vercel-forwarded-for");
  if (vercelIp) {
    return vercelIp.split(",")[0]?.trim() || "unknown";
  }

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((hop) => hop.trim())
      .filter(Boolean);
    if (hops.length > 0) {
      return hops[hops.length - 1];
    }
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}
