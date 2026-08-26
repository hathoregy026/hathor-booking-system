import { toAbsolutePublicUrl, VERCEL_PRODUCTION_ORIGIN } from "@/lib/public-url";
import { EMAIL_IMAGE_BUCKET } from "@/lib/image-upload";

export type SharedEmailBranding = {
  logoUrl: string | null;
  heroImageUrl: string | null;
};

/** Site-hosted email assets under /email/* (locked logo icon + fallback hero). */
const SITE_EMAIL_ASSET_PATH = /\/email\/hathor-email-(icon|logo|hero)\./i;
const SUPABASE_EMAIL_IMAGES_PATH =
  /\/storage\/v1\/object\/public\/email-images\//i;

function isTrustedEmailHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (host === "hathor-booking-system.vercel.app") return true;
  if (host.endsWith(".vercel.app") && host.includes("hathor-booking-system")) {
    return true;
  }
  try {
    return host === new URL(VERCEL_PRODUCTION_ORIGIN).hostname;
  } catch {
    return false;
  }
}

/** True for site `/email/*` or Supabase `email-images` public URLs. */
export function isReliableHostedEmailImageUrl(
  url: string | null | undefined,
): boolean {
  const resolved = toAbsolutePublicUrl(url?.trim() || null);
  if (!resolved || !/^https:\/\//i.test(resolved)) {
    return false;
  }

  if (/localhost|127\.0\.0\.1/i.test(resolved)) {
    return false;
  }

  if (/\/uploads\//i.test(resolved)) {
    return false;
  }

  try {
    const parsed = new URL(resolved);
    if (
      isTrustedEmailHost(parsed.hostname) &&
      SITE_EMAIL_ASSET_PATH.test(parsed.pathname)
    ) {
      return true;
    }
  } catch {
    return false;
  }

  return SUPABASE_EMAIL_IMAGES_PATH.test(resolved);
}

/**
 * First reliable candidate wins (order matters).
 * Dashboard Supabase hero uploads must beat the static site fallback.
 */
export function pickReliableEmailImageUrl(
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    const resolved = toAbsolutePublicUrl(candidate?.trim() || null);
    if (resolved && isReliableHostedEmailImageUrl(resolved)) {
      return resolved;
    }
  }
  return null;
}

/** Object key inside the email-images bucket, or null if not a bucket URL. */
export function emailImagesObjectPathFromUrl(
  url: string | null | undefined,
): string | null {
  const resolved = toAbsolutePublicUrl(url?.trim() || null);
  if (!resolved) return null;
  const match = resolved.match(
    /\/storage\/v1\/object\/public\/email-images\/([^?&#]+)/i,
  );
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function isSupabaseEmailImageUrl(
  url: string | null | undefined,
): boolean {
  return Boolean(emailImagesObjectPathFromUrl(url));
}

export function buildEmailImagesPublicUrl(objectPath: string): string | null {
  const base = process.env.SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const clean = objectPath.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${EMAIL_IMAGE_BUCKET}/${clean}`;
}

/** Collect the best logo/hero URLs from any template row (shared branding). */
export function pickSharedEmailBrandingFromRows(
  rows: Array<{ logoUrl: string | null; heroImageUrl: string | null }>,
): SharedEmailBranding {
  let logoUrl: string | null = null;
  let heroImageUrl: string | null = null;

  for (const row of rows) {
    if (!logoUrl) {
      logoUrl = pickReliableEmailImageUrl(row.logoUrl);
    }
    if (!heroImageUrl) {
      heroImageUrl = pickReliableEmailImageUrl(row.heroImageUrl);
    }
    if (logoUrl && heroImageUrl) {
      break;
    }
  }

  return { logoUrl, heroImageUrl };
}
