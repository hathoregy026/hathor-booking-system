/** Hash-only Vercel deployment URLs (not git branch previews). */
export const STALE_VERCEL_DEPLOYMENT_HOST =
  /^hathor-booking-system-(?!git-)[a-z0-9]+-hathor1\.vercel\.app$/i;

/**
 * Canonical production origin for redirects and absolute links.
 * Prefer custom domain when configured so hash/preview hosts never stay sticky.
 */
export function getProductionOrigin(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (fromVercel) {
    return fromVercel.startsWith("http")
      ? fromVercel.replace(/\/$/, "")
      : `https://${fromVercel.replace(/\/$/, "")}`;
  }

  return "https://hathor-booking-system.vercel.app";
}

/** True when this host is a one-off Vercel deploy URL that should bounce to production. */
export function isStaleVercelDeploymentHost(hostname: string): boolean {
  if (STALE_VERCEL_DEPLOYMENT_HOST.test(hostname)) return true;

  /* Also catch accidental opens of old alias hosts that aren't the production project URL. */
  if (!hostname.endsWith(".vercel.app")) return false;
  try {
    const prodHost = new URL(getProductionOrigin()).hostname;
    if (hostname === prodHost) return false;
    /* Keep git branch preview URLs usable for review. */
    if (hostname.includes("-git-")) return false;
    return hostname.startsWith("hathor-booking-system-");
  } catch {
    return false;
  }
}

/**
 * Public site base URL for absolute links (emails, uploads, OG tags).
 * Prefer NEXT_PUBLIC_SITE_URL or SITE_URL in production.
 */
export function getSiteBaseUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "");
    if (!isStaleVercelDeploymentHost(host)) {
      return `https://${host}`;
    }
  }

  if (process.env.NODE_ENV === "production") {
    return getProductionOrigin();
  }

  const port = process.env.PORT?.trim() || "3000";
  return `http://localhost:${port}`;
}

/**
 * Email clients and external apps require fully qualified HTTPS URLs.
 * Converts relative paths (/uploads/..., /assets/...) to absolute URLs.
 */
export function toAbsolutePublicUrl(
  url: string | null | undefined,
): string | null {
  if (!url?.trim()) return null;

  const trimmed = url.trim();

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const base = getSiteBaseUrl();
  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${path}`;
}
