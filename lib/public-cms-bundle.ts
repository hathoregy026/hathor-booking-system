import { cache } from "react";
import { unstable_cache } from "next/cache";
import { connection } from "next/server";
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
import {
  DEFAULT_PAGE_VISIBILITY_SETTINGS,
  PAGE_VISIBILITY_KEY,
  parsePageVisibilitySettings,
  type PageVisibilitySettings,
} from "@/lib/page-visibility-shared";
import {
  DEFAULT_WELCOME_SPLASH_SETTINGS,
  WELCOME_SPLASH_SETTINGS_KEY,
  parseWelcomeSplashSettings,
  type WelcomeSplashSettings,
} from "@/lib/welcome-splash-settings-shared";
import {
  DEFAULT_LIVE_SITE_SETTINGS,
  LIVE_SITE_SETTINGS_KEY,
  parseLiveSiteSettings,
  type LiveSiteSettings,
} from "@/lib/live-site-settings-shared";
import {
  DEFAULT_WHEEL_STAGE_SETTINGS,
  WHEEL_STAGE_SETTINGS_KEY,
  parseWheelStageSettings,
  type WheelStageSettings,
} from "@/lib/wheel-stage-settings-shared";
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
/** Bumped so prior build-time default entries are never reused. */
export const PUBLIC_CMS_CACHE_KEY = "public-cms-bundle-v11";
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
  WELCOME_SPLASH_SETTINGS_KEY,
  LIVE_SITE_SETTINGS_KEY,
  WHEEL_STAGE_SETTINGS_KEY,
  PAGE_VISIBILITY_KEY,
] as const;

/** Keys known to exceed ~2KB — full SELECT value hangs on some pooler paths. */
const CHUNKED_SETTING_KEYS = new Set<string>([SITE_IMAGE_PUBLIC_MAP_KEY]);
/** Max expected public image-map payload (src-only overrides). */
const IMAGE_MAP_MAX_CHARS = 12_000;

const CMS_BUILD_SKIP = "CMS_SKIP_BUILD_RESOLUTION";

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
  welcomeSplash: WelcomeSplashSettings;
  liveSite: LiveSiteSettings;
  wheelStage: WheelStageSettings;
  pageVisibility: PageVisibilitySettings;
};

/** Internal only — never serialized into public HTML. */
export type PublicCmsLoadStatus = "success" | "fallback" | "stale";

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

  const welcomeSplash = byKey.has(WELCOME_SPLASH_SETTINGS_KEY)
    ? parseWelcomeSplashSettings(
        readStored(byKey.get(WELCOME_SPLASH_SETTINGS_KEY)),
      )
    : DEFAULT_WELCOME_SPLASH_SETTINGS;

  const liveSite = byKey.has(LIVE_SITE_SETTINGS_KEY)
    ? parseLiveSiteSettings(readStored(byKey.get(LIVE_SITE_SETTINGS_KEY)))
    : DEFAULT_LIVE_SITE_SETTINGS;

  const wheelStage = byKey.has(WHEEL_STAGE_SETTINGS_KEY)
    ? parseWheelStageSettings(readStored(byKey.get(WHEEL_STAGE_SETTINGS_KEY)))
    : DEFAULT_WHEEL_STAGE_SETTINGS;

  const pageVisibility = byKey.has(PAGE_VISIBILITY_KEY)
    ? parsePageVisibilitySettings(readStored(byKey.get(PAGE_VISIBILITY_KEY)))
    : DEFAULT_PAGE_VISIBILITY_SETTINGS;

  return {
    siteImages,
    typography,
    typographyMobile,
    websiteText,
    websiteTextMobile,
    heroLogoTune,
    heroLogoTuneMobile,
    hieroglyphTune,
    welcomeSplash,
    liveSite,
    wheelStage,
    pageVisibility,
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
    welcomeSplash: DEFAULT_WELCOME_SPLASH_SETTINGS,
    liveSite: DEFAULT_LIVE_SITE_SETTINGS,
    wheelStage: DEFAULT_WHEEL_STAGE_SETTINGS,
    pageVisibility: DEFAULT_PAGE_VISIBILITY_SETTINGS,
  };
}

function countImageOverrides(bundle: PublicCmsBundle): number {
  const defaults = defaultSiteImageMap();
  let imagesCount = 0;
  for (const [name, img] of Object.entries(bundle.siteImages)) {
    if (defaults[name] && defaults[name].src !== img.src) imagesCount += 1;
  }
  return imagesCount;
}

/**
 * One short-lived pooler checkout, chunked read for large image map.
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
  const imagesCount = countImageOverrides(parsed);

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

/**
 * ONLY successful DB reads may return from this function.
 * Throws on build-phase skip and on DB failure so unstable_cache never
 * persists slot defaults / empty override maps as authoritative.
 */
async function loadPublicCmsBundleUncached(): Promise<PublicCmsBundle> {
  ensureCmsWarmup();

  if (process.env.NEXT_PHASE === "phase-production-build") {
    throw new Error(CMS_BUILD_SKIP);
  }

  return singleFlightCms(async () => {
    const { bundle, timing } = await fetchPublicCmsBundleFromDb();
    setCmsLastGood(bundle);
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[public-cms-bundle] ok ${timing.totalMs}ms (settings=${timing.settingsCount}, imageOverrides=${timing.imagesCount}, connect=${timing.connectMs}ms)`,
      );
    }
    return bundle;
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

function isBuildSkipError(error: unknown): boolean {
  return error instanceof Error && error.message === CMS_BUILD_SKIP;
}

/**
 * Request-scoped CMS bundle.
 *
 * - `connection()` defers resolution to request time so build never bakes
 *   slot defaults into route HTML / Data Cache.
 * - `unstable_cache` stores ONLY successful DB bundles.
 * - Failures use in-process lastGood or one-shot defaults for that request;
 *   they are never written into unstable_cache.
 */
export const loadPublicCmsBundle = cache(async (): Promise<PublicCmsBundle> => {
  /* Defer until an actual request — prevents ISR shells with defaults. */
  await connection();

  try {
    return await loadPublicCmsBundleCached();
  } catch (error) {
    if (!isBuildSkipError(error)) {
      logDbError("public-cms-bundle.cache", error);
    }
    const stale = getCmsLastGood<PublicCmsBundle>();
    if (stale) return stale;
    return defaultPublicCmsBundle();
  }
});
