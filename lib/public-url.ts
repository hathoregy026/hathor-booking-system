/** Hash-only Vercel deployment URLs (not git branch previews). */
export const STALE_VERCEL_DEPLOYMENT_HOST =
  /^hathor-booking-system-(?!git-)[a-z0-9]+-hathor1\.vercel\.app$/i;

/** Canonical Vercel production host while the custom domain still points elsewhere. */
export const VERCEL_PRODUCTION_ORIGIN =
  "https://hathor-booking-system.vercel.app";

/**
 * Canonical production origin for redirects and absolute links.
 * Prefer the live Vercel production alias — never the old Bluehost custom domain.
 */
export function getProductionOrigin(): string {
  const fromVercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (fromVercel) {
    const origin = fromVercel.startsWith("http")
      ? fromVercel.replace(/\/$/, "")
      : `https://${fromVercel.replace(/\/$/, "")}`;
    /* Ignore custom domains that are not actually served by this Vercel project. */
    if (origin.includes("vercel.app")) {
      return origin;
    }
  }

  return VERCEL_PRODUCTION_ORIGIN;
}

/** True when this host is a one-off Vercel deploy URL that should bounce to production. */
export function isStaleVercelDeploymentHost(hostname: string): boolean {
  return STALE_VERCEL_DEPLOYMENT_HOST.test(hostname);
}

/**
 * Public site base URL for absolute links (emails, uploads, OG tags).
 * Prefer an explicit site URL only when it is actually this Vercel deployment.
 */
export function getSiteBaseUrl(): string {
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();

  if (explicit) {
    const cleaned = explicit.replace(/\/$/, "");
    /* Custom domain still points at Bluehost — never use it as the live origin. */
    if (
      !/hathorcruise\.com$/i.test(new URL(cleaned.includes("://") ? cleaned : `https://${cleaned}`).hostname)
    ) {
      return cleaned;
    }
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
