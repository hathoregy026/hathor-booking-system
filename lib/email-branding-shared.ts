import { toAbsolutePublicUrl, VERCEL_PRODUCTION_ORIGIN } from "@/lib/public-url";

export type SharedEmailBranding = {
  logoUrl: string | null;
  heroImageUrl: string | null;
};

const SITE_EMAIL_ASSET_PATH = /\/email\/hathor-email-(logo|hero)\./i;
const LEGACY_SUPABASE_EMAIL_IMAGES_PATH =
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

/** Outbound email images: prefer site-hosted `/email/*`, allow legacy Supabase. */
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

  return LEGACY_SUPABASE_EMAIL_IMAGES_PATH.test(resolved);
}

export function pickReliableEmailImageUrl(
  ...candidates: Array<string | null | undefined>
): string | null {
  /* Prefer site-hosted /email assets over legacy Supabase. */
  let legacy: string | null = null;
  for (const candidate of candidates) {
    const resolved = toAbsolutePublicUrl(candidate?.trim() || null);
    if (!resolved || !isReliableHostedEmailImageUrl(resolved)) continue;
    if (SITE_EMAIL_ASSET_PATH.test(resolved)) return resolved;
    if (!legacy && LEGACY_SUPABASE_EMAIL_IMAGES_PATH.test(resolved)) {
      legacy = resolved;
    }
  }
  return legacy;
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
