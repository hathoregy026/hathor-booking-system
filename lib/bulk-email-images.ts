import { BULK_JOURNAL_IMAGE_PATHS } from "@/lib/bulk-email-journal";

const JOURNAL_PATHS = new Set<string>(Object.values(BULK_JOURNAL_IMAGE_PATHS));
const HATHOR_ASSET_ORIGINS = new Set(["https://hathor-booking-system.vercel.app", "https://www.hathorcruise.com", "https://hathorcruise.com"]);
const isBundledEmailAsset = (path: string) => JOURNAL_PATHS.has(path) || path === "/email/bulk-journal/icon.png" || /^\/email\/hathor-email-(?:icon|logo|hero)\.[a-z0-9]+$/i.test(path);

/** Only fixed bundled paths on known Hathor origins can become same-origin assets. */
export function toSameOriginBulkEmailAssetUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim() || "";
  if (isBundledEmailAsset(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    return HATHOR_ASSET_ORIGINS.has(url.origin) && !url.username && !url.password && !url.search && !url.hash && isBundledEmailAsset(url.pathname) ? url.pathname : null;
  } catch { return null; }
}

/** Safe image address for the bulk editor thumbnail. Never accepts scripts or tracking query strings. */
export function bulkBannerPreviewSrc(value: string | null | undefined): string {
  const trimmed = value?.trim() || "";
  if (!trimmed) return "";
  const sameOrigin = toSameOriginBulkEmailAssetUrl(trimmed);
  if (sameOrigin && (JOURNAL_PATHS.has(sameOrigin) || /^\/email\/hathor-email-hero\.[a-z0-9]+$/i.test(sameOrigin))) return sameOrigin;
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
