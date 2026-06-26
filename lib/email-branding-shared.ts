import { toAbsolutePublicUrl } from "@/lib/public-url";

export type SharedEmailBranding = {
  logoUrl: string | null;
  heroImageUrl: string | null;
};

const SUPABASE_EMAIL_IMAGES_PATH =
  /\/storage\/v1\/object\/public\/email-images\//i;

/** Outbound email images must be HTTPS Supabase `email-images` bucket URLs. */
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

  return SUPABASE_EMAIL_IMAGES_PATH.test(resolved);
}

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
