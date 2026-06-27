import "server-only";

import { withEmailImageCacheBust } from "@/lib/email-image-cache";
import { pickReliableEmailImageUrl } from "@/lib/email-branding-shared";
import type { EmailTemplateOverrides, EmailTemplateRecord } from "@/lib/email-templates";

/** Email clients fail on multi-MB remote images — stay well under this. */
export const MAX_EMAIL_IMAGE_BYTES = 1.5 * 1024 * 1024;

const FETCH_TIMEOUT_MS = 12_000;

function parseContentLength(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

async function isPublicImageReachable(
  url: string,
  cacheBustVersion?: string | null,
): Promise<boolean> {
  const candidates = [
    url,
    withEmailImageCacheBust(url, cacheBustVersion),
  ].filter((value, index, array): value is string => {
    return Boolean(value) && array.indexOf(value) === index;
  });

  for (const candidate of candidates) {
    try {
      const head = await fetch(candidate, {
        method: "HEAD",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { Accept: "image/*" },
      });

      if (!head.ok) {
        continue;
      }

      const contentLength = parseContentLength(head.headers.get("content-length"));
      if (contentLength !== null && contentLength > MAX_EMAIL_IMAGE_BYTES) {
        console.warn(
          `[email] skipping oversized image (${(contentLength / 1024 / 1024).toFixed(1)} MB): ${candidate}`,
        );
        continue;
      }

      const sample = await fetch(candidate, {
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: { Accept: "image/*", Range: "bytes=0-16383" },
      });

      if (!sample.ok && sample.status !== 206) {
        continue;
      }

      const bytes = await sample.arrayBuffer();
      if (bytes.byteLength > 0) {
        return true;
      }
    } catch (error) {
      console.warn(`[email] image reachability check failed for ${candidate}:`, error);
    }
  }

  return false;
}

/** Pick the first Supabase URL that email clients can actually load. */
export async function resolveAccessibleEmailImageUrl(
  cacheBustVersion: string | null | undefined,
  ...candidates: Array<string | null | undefined>
): Promise<string | null> {
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const url = pickReliableEmailImageUrl(candidate);
    if (!url || seen.has(url)) continue;
    seen.add(url);

    if (await isPublicImageReachable(url, cacheBustVersion)) {
      return withEmailImageCacheBust(url, cacheBustVersion) ?? url;
    }
  }

  return null;
}

/** Hosted HTTPS logo/hero for the luxury email layout (standard <img src> URLs). */
export async function toEmailThemeOverridesForSend(
  template: EmailTemplateRecord | null | undefined,
  defaults: { logoUrl: string; heroImageUrl: string },
): Promise<EmailTemplateOverrides | undefined> {
  if (!template) return undefined;

  const cacheVersion = template.updatedAt ?? new Date().toISOString();

  const [logoUrl, heroImageUrl] = await Promise.all([
    resolveAccessibleEmailImageUrl(cacheVersion, template.logoUrl, defaults.logoUrl),
    resolveAccessibleEmailImageUrl(cacheVersion, template.heroImageUrl, defaults.heroImageUrl),
  ]);

  return {
    logoUrl:
      logoUrl ??
      withEmailImageCacheBust(defaults.logoUrl, cacheVersion) ??
      defaults.logoUrl,
    heroImageUrl:
      heroImageUrl ??
      withEmailImageCacheBust(defaults.heroImageUrl, cacheVersion) ??
      defaults.heroImageUrl,
    primaryColor: template.primaryColor,
    backgroundColor: template.backgroundColor,
    heroHeading: template.heroHeading,
    bodyText: template.bodyText,
  };
}
