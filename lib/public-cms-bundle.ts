import { cache } from "react";
import { unstable_cache } from "next/cache";
import { logDbError } from "@/lib/db-safe";
import {
  DEFAULT_HERO_LOGO_TUNE,
  DEFAULT_HERO_LOGO_TUNE_MOBILE,
  HERO_LOGO_TUNE_KEY,
  HERO_LOGO_TUNE_MOBILE_KEY,
  ensurePhoneHeroLogoVisible,
  parseHeroLogoTune,
  type HeroLogoTune,
} from "@/lib/hero-logo-tune-shared";
import {
  DEFAULT_HIEROGLYPH_TUNE,
  HIEROGLYPH_TUNE_KEY,
  parseHieroglyphTune,
  type HieroglyphTune,
} from "@/lib/hieroglyph-tune-shared";
import {
  DEFAULT_TYPOGRAPHY_SETTINGS,
  TYPOGRAPHY_SETTINGS_KEY,
  TYPOGRAPHY_SETTINGS_MOBILE_KEY,
  parseTypographySettings,
  type TypographySettings,
} from "@/lib/typography-settings-shared";
import {
  DEFAULT_WEBSITE_TEXT,
  WEBSITE_TEXT_KEY,
  WEBSITE_TEXT_MOBILE_KEY,
  parseWebsiteText,
  type WebsiteText,
} from "@/lib/website-text-shared";
import type { SiteImageMap } from "@/lib/resolve-site-images";
import {
  SITE_IMAGE_PUBLIC_MAP_KEY,
  defaultStoredSiteImageMap,
  parseStoredSiteImageMap,
  storedMapToSiteImageMap,
} from "@/lib/site-image-public-map";
import type { Client } from "pg";
import {
  ensureCmsWarmup,
  getCmsLastGood,
  setCmsLastGood,
  singleFlightCms,
  withPublicCmsClient,
  withTimeout,
  CMS_QUERY_TIMEOUT_MS,
  type CmsTimingStages,
} from "@/lib/public-cms-client";

export const PUBLIC_CMS_CACHE_TAG = "public-cms";
export const PUBLIC_CMS_CACHE_KEY = "public-cms-bundle-v6";
export const PUBLIC_CMS_REVALIDATE_SECONDS = 300;

const PUBLIC_CMS_KEYS = [
  HERO_LOGO_TUNE_KEY,
  HERO_LOGO_TUNE_MOBILE_KEY,
  HIEROGLYPH_TUNE_KEY,
  TYPOGRAPHY_SETTINGS_KEY,
  TYPOGRAPHY_SETTINGS_MOBILE_KEY,
  WEBSITE_TEXT_KEY,
  WEBSITE_TEXT_MOBILE_KEY,
  SITE_IMAGE_PUBLIC_MAP_KEY,
] as const;

/** Keys known to exceed ~2KB — full SELECT value hangs on some pooler paths. */
const CHUNKED_SETTING_KEYS = new Set<string>([SITE_IMAGE_PUBLIC_MAP_KEY]);
/** Max expected public image-map payload (src-only overrides). */
const IMAGE_MAP_MAX_CHARS = 12_000;

async function readSettingValue(
  client: Client,
  key: string,
): Promise<string | null> {
  if (!CHUNKED_SETTING_KEYS.has(key)) {
    const result = await withTimeout(
      client.query<{ value: string }>(
        `SELECT value::text AS value FROM "SiteSetting" WHERE key = $1`,
        [key],
      ),
      `setting:${key}`,
      CMS_QUERY_TIMEOUT_MS,
    );
    return result.rows[0]?.value ?? null;
  }

  /*
   * Prefer a single compact left() under the known max — avoids multi-substr
   * response stalls observed on the Supabase transaction pooler under Next.
   */
  const result = await withTimeout(
    client.query<{ v: string | null; len: number }>(
      `SELECT left(value::text, $2) AS v, length(value::text)::int AS len
       FROM "SiteSetting" WHERE key = $1`,
      [key, IMAGE_MAP_MAX_CHARS],
    ),
    `setting-map:${key}`,
    CMS_QUERY_TIMEOUT_MS,
  );
  const row = result.rows[0];
  if (!row?.v) return null;
  return row.v.slice(0, Number(row.len) || row.v.length);
}

export type PublicCmsBundle = {
  siteImages: SiteImageMap;
  typography: TypographySettings;
  typographyMobile: TypographySettings;
  heroLogoTune: HeroLogoTune;
  heroLogoTuneMobile: HeroLogoTune;
  hieroglyphTune: HieroglyphTune;
  websiteText: WebsiteText;
  websiteTextMobile: WebsiteText;
};

type SettingRow = { key: string; value: string };

function readStored(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  }
  return value;
}

export function defaultSiteImageMap(): SiteImageMap {
  return storedMapToSiteImageMap(defaultStoredSiteImageMap());
}

function parseSettingMap(rows: SettingRow[]) {
  const byKey = new Map(rows.map((row) => [row.key, row.value]));

  const typography = byKey.has(TYPOGRAPHY_SETTINGS_KEY)
    ? parseTypographySettings(readStored(byKey.get(TYPOGRAPHY_SETTINGS_KEY)))
    : DEFAULT_TYPOGRAPHY_SETTINGS;
  const typographyMobile = byKey.has(TYPOGRAPHY_SETTINGS_MOBILE_KEY)
    ? parseTypographySettings(
        readStored(byKey.get(TYPOGRAPHY_SETTINGS_MOBILE_KEY)),
      )
    : typography;

  const websiteText = byKey.has(WEBSITE_TEXT_KEY)
    ? parseWebsiteText(readStored(byKey.get(WEBSITE_TEXT_KEY)))
    : DEFAULT_WEBSITE_TEXT;
  const websiteTextMobile = byKey.has(WEBSITE_TEXT_MOBILE_KEY)
    ? parseWebsiteText(readStored(byKey.get(WEBSITE_TEXT_MOBILE_KEY)))
    : websiteText;

  const heroLogoTune = byKey.has(HERO_LOGO_TUNE_KEY)
    ? parseHeroLogoTune(readStored(byKey.get(HERO_LOGO_TUNE_KEY)))
    : DEFAULT_HERO_LOGO_TUNE;
  const heroLogoTuneMobile = byKey.has(HERO_LOGO_TUNE_MOBILE_KEY)
    ? ensurePhoneHeroLogoVisible(
        parseHeroLogoTune(readStored(byKey.get(HERO_LOGO_TUNE_MOBILE_KEY))),
      )
    : DEFAULT_HERO_LOGO_TUNE_MOBILE;

  const hieroglyphTune = byKey.has(HIEROGLYPH_TUNE_KEY)
    ? parseHieroglyphTune(readStored(byKey.get(HIEROGLYPH_TUNE_KEY)))
    : DEFAULT_HIEROGLYPH_TUNE;

  let siteImages = defaultSiteImageMap();
  if (byKey.has(SITE_IMAGE_PUBLIC_MAP_KEY)) {
    siteImages = storedMapToSiteImageMap(
      parseStoredSiteImageMap(readStored(byKey.get(SITE_IMAGE_PUBLIC_MAP_KEY))),
    );
  }

  return {
    siteImages,
    typography,
    typographyMobile,
    websiteText,
    websiteTextMobile,
    heroLogoTune,
    heroLogoTuneMobile,
    hieroglyphTune,
  };
}

export function defaultPublicCmsBundle(): PublicCmsBundle {
  return {
    siteImages: defaultSiteImageMap(),
    typography: DEFAULT_TYPOGRAPHY_SETTINGS,
    typographyMobile: DEFAULT_TYPOGRAPHY_SETTINGS,
    heroLogoTune: DEFAULT_HERO_LOGO_TUNE,
    heroLogoTuneMobile: DEFAULT_HERO_LOGO_TUNE_MOBILE,
    hieroglyphTune: DEFAULT_HIEROGLYPH_TUNE,
    websiteText: DEFAULT_WEBSITE_TEXT,
    websiteTextMobile: DEFAULT_WEBSITE_TEXT,
  };
}

/**
 * One short-lived pool checkout, chunked read for large image map.
 * SiteImage table is not scanned on the public request path.
 */
export async function fetchPublicCmsBundleFromDb(): Promise<{
  bundle: PublicCmsBundle;
  timing: CmsTimingStages;
}> {
  const t0 = Date.now();
  let connectMs = 0;
  let settingsMs = 0;
  let settingsCount = 0;
  let imagesCount = 0;

  const smallRows = await withPublicCmsClient(async (client) => {
    connectMs = Date.now() - t0;
    const tSettings = Date.now();
    const smallKeys = PUBLIC_CMS_KEYS.filter(
      (key) => !CHUNKED_SETTING_KEYS.has(key),
    );
    const smallResult = await withTimeout(
      client.query<SettingRow>(
        `SELECT key, value::text AS value FROM "SiteSetting" WHERE key = ANY($1::text[])`,
        [[...smallKeys]],
      ),
      "settings-small",
      CMS_QUERY_TIMEOUT_MS,
    );
    settingsMs = Date.now() - tSettings;
    return smallResult.rows;
  });

  const collected: SettingRow[] = [...smallRows];

  /* Fresh client for the image map — second query on the same pooler session was stalling. */
  for (const key of CHUNKED_SETTING_KEYS) {
    const value = await withPublicCmsClient((client) =>
      readSettingValue(client, key),
    );
    if (value != null) collected.push({ key, value });
  }

  settingsCount = collected.length;
  const rows = collected;
  const hasImageMap = rows.some((row) => row.key === SITE_IMAGE_PUBLIC_MAP_KEY);
  if (!hasImageMap && process.env.NODE_ENV === "development") {
    console.warn(
      `[public-cms-bundle] missing ${SITE_IMAGE_PUBLIC_MAP_KEY}; using slot defaults until admin rebuild`,
    );
  }

  const parsed = parseSettingMap(rows);
  const defaults = defaultSiteImageMap();
  for (const [name, img] of Object.entries(parsed.siteImages)) {
    if (defaults[name] && defaults[name].src !== img.src) imagesCount += 1;
  }

  return {
    bundle: parsed,
    timing: {
      connectMs,
      settingsMs,
      imagesMs: 0,
      totalMs: Date.now() - t0,
      settingsCount,
      imagesCount,
      fromStale: false,
      fromDefaults: false,
    },
  };
}

async function loadPublicCmsBundleUncached(): Promise<PublicCmsBundle> {
  ensureCmsWarmup();

  if (process.env.NEXT_PHASE === "phase-production-build") {
    /* Build-time: never hit the pooler; prefer last-good over fake empty maps. */
    return getCmsLastGood<PublicCmsBundle>() ?? defaultPublicCmsBundle();
  }

  return singleFlightCms(async () => {
    try {
      const { bundle, timing } = await fetchPublicCmsBundleFromDb();
      setCmsLastGood(bundle);
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[public-cms-bundle] ok ${timing.totalMs}ms (settings=${timing.settingsCount}, imageOverrides=${timing.imagesCount}, connect=${timing.connectMs}ms)`,
        );
      }
      return bundle;
    } catch (error) {
      logDbError("public-cms-bundle.fetch", error);
      const stale = getCmsLastGood<PublicCmsBundle>();
      if (stale) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[public-cms-bundle] serving in-process last-good after DB failure",
          );
        }
        return stale;
      }
      /*
       * First-ever miss with no valid cache: slot defaults only.
       * Do not invent CMS overrides; admin rebuild seeds site-image-public-map.
       */
      throw error;
    }
  });
}

const loadPublicCmsBundleCached = unstable_cache(
  loadPublicCmsBundleUncached,
  [PUBLIC_CMS_CACHE_KEY],
  {
    revalidate: PUBLIC_CMS_REVALIDATE_SECONDS,
    tags: [PUBLIC_CMS_CACHE_TAG],
  },
);

export const loadPublicCmsBundle = cache(async (): Promise<PublicCmsBundle> => {
  try {
    return await loadPublicCmsBundleCached();
  } catch (error) {
    logDbError("public-cms-bundle.cache", error);
    const stale = getCmsLastGood<PublicCmsBundle>();
    if (stale) return stale;
    return defaultPublicCmsBundle();
  }
});
