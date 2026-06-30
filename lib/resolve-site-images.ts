import { logDbError } from "@/lib/db-safe";
import { listSiteImages } from "@/lib/image-management";
import {
  SITE_IMAGE_SLOTS,
  getDefaultSiteImage,
  getSiteImageSlot,
  type SiteImageName,
} from "@/lib/site-image-slots";

export type ResolvedSiteImage = {
  src: string;
  alt: string;
};

export type SiteImageMap = Record<string, ResolvedSiteImage>;

/** Direct Supabase DB hosts are often unreachable; slot defaults already use local media. */
function prefersStaticSiteImageDefaults(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return /db\.[a-z0-9-]+\.supabase\.co(?::5432)?/i.test(url);
}

/** DB URLs starting with /media/hathor/ work on Vercel and locally. */
export function shouldUseDatabaseSiteImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("/media/hathor/")) return true;
  if (trimmed.includes("supabase.co/storage/v1/object/public/")) return true;
  return false;
}

export async function resolveSiteImageMap(): Promise<SiteImageMap> {
  const map: SiteImageMap = {};

  for (const slot of SITE_IMAGE_SLOTS) {
    map[slot.name] = { src: slot.url, alt: slot.altText };
  }

  if (prefersStaticSiteImageDefaults()) {
    return map;
  }

  try {
    const records = await listSiteImages();
    for (const record of records) {
      if (!record.isActive) continue;
      const slot = getSiteImageSlot(record.name);
      const fallback = slot
        ? { src: slot.url, alt: slot.altText }
        : getDefaultSiteImage(record.name);

      if (shouldUseDatabaseSiteImageUrl(record.url)) {
        map[record.name] = { src: record.url, alt: record.altText || fallback.alt };
      } else {
        map[record.name] = fallback;
      }
    }
  } catch (error) {
    logDbError("resolveSiteImageMap", error);
  }

  return map;
}

export function resolveSiteImageFromMap(
  map: SiteImageMap,
  name: SiteImageName | string,
): ResolvedSiteImage {
  return map[name] ?? getDefaultSiteImage(name);
}
