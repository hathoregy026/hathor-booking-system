import { toSameOriginEmailAssetUrl } from "@/lib/email-branding-urls";

/** Safe image address for the bulk editor thumbnail. Never accepts scripts or tracking query strings. */
export function bulkBannerPreviewSrc(value: string | null | undefined): string {
  const trimmed = value?.trim() || "";
  if (!trimmed) return "";
  const sameOrigin = toSameOriginEmailAssetUrl(trimmed);
  if (sameOrigin && /^\/email\/hathor-email-hero\.[a-z0-9]+$/i.test(sameOrigin)) return sameOrigin;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) return "";
    if (!/^[a-z0-9-]+\.supabase\.co$/i.test(url.hostname)) return "";
    if (!/^\/storage\/v1\/object\/public\/email-images\/[a-z0-9/_-]{1,180}\.(?:jpg|jpeg|png|webp)$/i.test(url.pathname)) return "";
    return `${url.origin}${url.pathname}`;
  } catch { return ""; }
}

/** The shared Hathor banner, reduced to a same-origin path or this project's image bucket. */
export function standardBulkBannerPreviewUrl(value: string | null | undefined): string {
  const preview = bulkBannerPreviewSrc(value);
  if (!preview || preview.startsWith("/email/")) return preview;
  try {
    const base = new URL(process.env.SUPABASE_URL || "");
    return new URL(preview).origin === base.origin ? preview : "";
  } catch { return ""; }
}

/** Accept only new bulk-campaign objects in the configured image bucket. */
export function isBulkEmailBannerUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const base = new URL(process.env.SUPABASE_URL || "");
    return url.protocol === "https:" && url.origin === base.origin &&
      !url.username && !url.password && !url.search && !url.hash &&
      /^\/storage\/v1\/object\/public\/email-images\/bulk-campaigns\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.jpg$/.test(url.pathname);
  } catch { return false; }
}
