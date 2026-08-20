import { prisma } from "@/lib/prisma";
import { withDb, logDbError } from "@/lib/db-safe";
import { HOME_CAROUSEL_DEFAULT_URLS } from "@/lib/home-carousel-images";
import {
  SITE_IMAGE_SLOTS,
  getDefaultSiteImage,
  getSiteImageSlot,
} from "@/lib/site-image-slots";
import {
  shouldUseDatabaseSiteImageUrl,
  type SiteImageMap,
} from "@/lib/resolve-site-images";
import { isSafeLandmarkCmsOverride } from "@/lib/landmark-image-safety";
import {
  SITE_IMAGE_CLEARED_SRC,
  canHideSiteImageOnClear,
  isSiteImageClearedSrc,
} from "@/lib/site-image-url";

/** SiteSetting key — v2 avoids a TOAST-stuck legacy row that hung full SELECT/UPDATE. */
export const SITE_IMAGE_PUBLIC_MAP_KEY = "site-image-public-map-v2";

/**
 * Soft-migrate older Homepage/Cruises/About slot uploads into dedicated
 * amenities-sequence slots until each new slot is saved on its own.
 */
const AMENITIES_SEQUENCE_LEGACY_FALLBACK: Readonly<Record<string, string>> = {
  "home-amenities-1": "cruises-hero",
  "home-amenities-2": "home-split-courtyard",
  "home-amenities-3": "about-hero",
  "home-amenities-4": "home-story-legacy-large",
  /* Older shared story slots → new unique slider / card mounts.
   * Must point at real SITE_IMAGE_SLOTS names (not removed aliases). */
  "home-amenities-5": "home-amenities-4",
  "home-amenities-6": "home-story-way-of-life",
  "home-amenities-7": "home-story-dining",
  "home-amenities-8": "home-story-legacy-large",
  /*
   * Opening card 1 — production still has legacy row home-amenities-way-of-life
   * (orphaned from SITE_IMAGE_SLOTS). Prefer that upload until home-amenities-9
   * has its own SiteImage row; also accept home-story-way-of-life.
   */
  "home-amenities-9": "home-amenities-way-of-life",
  "home-amenities-10": "home-story-dining",
  "home-amenities-11": "home-amenities-2",
  "home-amenities-13": "wellness-fitness",
  "home-amenities-12": "about-hero",
  "home-amenities-14": "gastronomy-restaurant",
  "home-amenities-15": "home-alt-dining",
};

export type StoredSiteImagePublicMap = Record<
  string,
  { src: string; alt: string }
>;

function applyLegacySlotFallbacks(
  overrides: StoredSiteImagePublicMap,
): void {
  for (const [amenitiesName, legacyName] of Object.entries(
    AMENITIES_SEQUENCE_LEGACY_FALLBACK,
  )) {
    if (overrides[amenitiesName] || !overrides[legacyName]) continue;
    overrides[amenitiesName] = { ...overrides[legacyName] };
  }

  /* Drop carousel overrides that only mirrored shared room-* uploads. */
  const sharedSrcs = new Set(
    ["room-luxury", "room-suite", "room-royal"]
      .map((name) => overrides[name]?.src)
      .filter((src): src is string => Boolean(src)),
  );
  for (const carouselName of Object.keys(HOME_CAROUSEL_DEFAULT_URLS)) {
    const entry = overrides[carouselName];
    if (entry && sharedSrcs.has(entry.src)) {
      delete overrides[carouselName];
    }
  }
}

export function defaultStoredSiteImageMap(): StoredSiteImagePublicMap {
  const map: StoredSiteImagePublicMap = {};
  for (const slot of SITE_IMAGE_SLOTS) {
    map[slot.name] = { src: slot.url, alt: slot.altText };
  }
  return map;
}

/**
 * Build overrides-only payload for SiteSetting (keeps row small enough for
 * reliable pooler transfer — full slot maps previously hung on SELECT value).
 */
export function buildSiteImageOverridesMap(
  records: Array<{ name: string; url: string; altText: string | null }>,
): StoredSiteImagePublicMap {
  const overrides: StoredSiteImagePublicMap = {};
  for (const record of records) {
    const slot = getSiteImageSlot(record.name);
    const fallbackAlt = slot?.altText || record.name;
    const alt = (record.altText || fallbackAlt).slice(0, 120);

    if (
      canHideSiteImageOnClear(record.name) &&
      isSiteImageClearedSrc(record.url)
    ) {
      overrides[record.name] = { src: SITE_IMAGE_CLEARED_SRC, alt };
      continue;
    }

    if (!shouldUseDatabaseSiteImageUrl(record.url)) continue;
    if (!isSafeLandmarkCmsOverride(record.name, record.url)) continue;
    /*
     * Persist remote CMS uploads (including Supabase storage) and any URL that
     * differs from the slot default. Skip identical /media defaults so the
     * SiteSetting row stays small enough for reliable pooler transfer.
     */
    const isRemote = /^https?:\/\//i.test(record.url);
    if (!isRemote && slot && record.url === slot.url && alt === slot.altText) {
      continue;
    }
    if (!isRemote && slot && record.url === slot.url) {
      continue;
    }
    overrides[record.name] = { src: record.url, alt };
  }

  applyLegacySlotFallbacks(overrides);

  return overrides;
}

export function storedMapToSiteImageMap(
  stored: StoredSiteImagePublicMap | null | undefined,
): SiteImageMap {
  const map: SiteImageMap = {};
  for (const slot of SITE_IMAGE_SLOTS) {
    map[slot.name] = { src: slot.url, alt: slot.altText };
  }
  if (!stored || typeof stored !== "object") return map;
  for (const [name, value] of Object.entries(stored)) {
    if (!value || typeof value.src !== "string") continue;
    if (
      canHideSiteImageOnClear(name) &&
      isSiteImageClearedSrc(value.src)
    ) {
      const slot = getSiteImageSlot(name);
      map[name] = {
        src: "",
        alt:
          typeof value.alt === "string" && value.alt
            ? value.alt
            : slot?.altText || name,
      };
      continue;
    }
    if (!shouldUseDatabaseSiteImageUrl(value.src)) continue;
    if (!isSafeLandmarkCmsOverride(name, value.src)) continue;
    const slot = getSiteImageSlot(name);
    const fallback = slot
      ? { src: slot.url, alt: slot.altText }
      : getDefaultSiteImage(name);
    map[name] = {
      src: value.src,
      alt: typeof value.alt === "string" && value.alt ? value.alt : fallback.alt,
    };
  }

  /*
   * Never let itinerary carousel cards share the Suites/rooms room-* photos.
   * Old soft-migrate copies are discarded in favor of each card’s unique default
   * until that carousel slot has its own distinct CMS upload.
   */
  const sharedSrcs = new Set(
    ["room-luxury", "room-suite", "room-royal"]
      .map((name) => map[name]?.src)
      .filter((src): src is string => Boolean(src)),
  );
  for (const carouselName of Object.keys(HOME_CAROUSEL_DEFAULT_URLS)) {
    const slot = getSiteImageSlot(carouselName);
    if (!slot) continue;
    if (sharedSrcs.has(map[carouselName]?.src)) {
      map[carouselName] = { src: slot.url, alt: slot.altText };
    }
  }

  return map;
}

export function parseStoredSiteImageMap(raw: unknown): StoredSiteImagePublicMap {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      return {};
    }
  }
  if (!value || typeof value !== "object") return {};
  const out: StoredSiteImagePublicMap = {};
  for (const [name, entry] of Object.entries(
    value as Record<string, unknown>,
  )) {
    /* Compact form: { "slot": "https://..." } */
    if (typeof entry === "string") {
      if (canHideSiteImageOnClear(name) && isSiteImageClearedSrc(entry)) {
        const slot = getSiteImageSlot(name);
        out[name] = { src: SITE_IMAGE_CLEARED_SRC, alt: slot?.altText ?? name };
        continue;
      }
      if (!shouldUseDatabaseSiteImageUrl(entry)) continue;
      if (!isSafeLandmarkCmsOverride(name, entry)) continue;
      const slot = getSiteImageSlot(name);
      out[name] = { src: entry, alt: slot?.altText ?? name };
      continue;
    }
    if (!entry || typeof entry !== "object") continue;
    const src = (entry as { src?: unknown }).src;
    const alt = (entry as { alt?: unknown }).alt;
    if (typeof src !== "string") continue;
    if (canHideSiteImageOnClear(name) && isSiteImageClearedSrc(src)) {
      const slot = getSiteImageSlot(name);
      out[name] = {
        src: SITE_IMAGE_CLEARED_SRC,
        alt:
          typeof alt === "string" && alt
            ? alt
            : slot?.altText ?? name,
      };
      continue;
    }
    if (!shouldUseDatabaseSiteImageUrl(src)) continue;
    if (!isSafeLandmarkCmsOverride(name, src)) continue;
    const slot = getSiteImageSlot(name);
    out[name] = {
      src,
      alt:
        typeof alt === "string" && alt
          ? alt
          : slot?.altText ?? name,
    };
  }
  return out;
}

/**
 * Rebuild denormalized public image overrides (admin mutation path).
 * Public SSR reads only SiteSetting and never scans SiteImage.
 *
 * Also used by `npm run rebuild:site-image-map` (raw pg) for deploy bootstrap.
 * Admin image create/update/delete always calls this before revalidateTag.
 */
export async function rebuildSiteImagePublicMap(): Promise<StoredSiteImagePublicMap> {
  try {
    const records = await withDb(() =>
      prisma.siteImage.findMany({
        where: { isActive: true },
        select: { name: true, url: true, altText: true },
      }),
    );
    const overrides = buildSiteImageOverridesMap(records);
    /* Compact: slot → src string (alt resolved from slots at read time). */
    const compact: Record<string, string> = {};
    for (const [name, entry] of Object.entries(overrides)) {
      compact[name] = entry.src;
    }
    const payload = JSON.stringify(compact);
    await withDb(() =>
      prisma.siteSetting.upsert({
        where: { key: SITE_IMAGE_PUBLIC_MAP_KEY },
        create: { key: SITE_IMAGE_PUBLIC_MAP_KEY, value: payload },
        update: { value: payload },
      }),
    );
    return overrides;
  } catch (error) {
    logDbError("site-image-public-map.rebuild", error);
    return {};
  }
}

/**
 * Create the public image map only when missing or empty.
 * Does not clobber a non-empty map (admin edits stay intact).
 */
export async function ensureSiteImagePublicMap(): Promise<{
  created: boolean;
  overrideCount: number;
}> {
  try {
    const existing = await withDb(() =>
      prisma.siteSetting.findUnique({
        where: { key: SITE_IMAGE_PUBLIC_MAP_KEY },
        select: { value: true },
      }),
    );
    const parsed = parseStoredSiteImageMap(existing?.value);
    const overrideCount = Object.keys(parsed).length;
    if (overrideCount > 0) {
      return { created: false, overrideCount };
    }
    const rebuilt = await rebuildSiteImagePublicMap();
    return { created: true, overrideCount: Object.keys(rebuilt).length };
  } catch (error) {
    logDbError("site-image-public-map.ensure", error);
    return { created: false, overrideCount: 0 };
  }
}
