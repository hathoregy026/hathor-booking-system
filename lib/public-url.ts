/** Hash-only Vercel deployment URLs (not git branch previews). */
export const STALE_VERCEL_DEPLOYMENT_HOST =
  /^hathor-booking-system-(?!git-)[a-z0-9]+-hathor1\.vercel\.app$/i;

/**
 * Canonical production origin for redirects and absolute links.
 */
export function getProductionOrigin(): string {
  const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (fromVercel) {
    return fromVercel.startsWith("http")
      ? fromVercel.replace(/\/$/, "")
      : `https://${fromVercel.replace(/\/$/, "")}`;
  }

  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();

  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  return "https://hathor-booking-system.vercel.app";
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
    if (!STALE_VERCEL_DEPLOYMENT_HOST.test(host)) {
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
