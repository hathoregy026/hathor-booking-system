import { cache } from "react";
import { unstable_cache } from "next/cache";
import pg from "pg";
import { logDbError } from "@/lib/db-safe";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { SITE_IMAGE_SLOTS } from "@/lib/site-image-slots";
import type { SiteImageMap } from "@/lib/resolve-site-images";
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

export const PUBLIC_CMS_CACHE_TAG = "public-cms";

const PUBLIC_CMS_KEYS = [
  HERO_LOGO_TUNE_KEY,
  HERO_LOGO_TUNE_MOBILE_KEY,
  HIEROGLYPH_TUNE_KEY,
  TYPOGRAPHY_SETTINGS_KEY,
  TYPOGRAPHY_SETTINGS_MOBILE_KEY,
  WEBSITE_TEXT_KEY,
  WEBSITE_TEXT_MOBILE_KEY,
] as const;

const CMS_QUERY_TIMEOUT_MS = 5_000;

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

function defaultSiteImageMap(): SiteImageMap {
  const map: SiteImageMap = {};
  for (const slot of SITE_IMAGE_SLOTS) {
    map[slot.name] = { src: slot.url, alt: slot.altText };
  }
  return map;
}

function parseSettingMap(rows: Array<{ key: string; value: string }>) {
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

  return {
    typography,
    typographyMobile,
    websiteText,
    websiteTextMobile,
    heroLogoTune,
    heroLogoTuneMobile,
    hieroglyphTune,
  };
}

function defaultBundle(siteImages: SiteImageMap): PublicCmsBundle {
  return {
    siteImages,
    typography: DEFAULT_TYPOGRAPHY_SETTINGS,
    typographyMobile: DEFAULT_TYPOGRAPHY_SETTINGS,
    heroLogoTune: DEFAULT_HERO_LOGO_TUNE,
    heroLogoTuneMobile: DEFAULT_HERO_LOGO_TUNE_MOBILE,
    hieroglyphTune: DEFAULT_HIEROGLYPH_TUNE,
    websiteText: DEFAULT_WEBSITE_TEXT,
    websiteTextMobile: DEFAULT_WEBSITE_TEXT,
  };
}

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `[public-cms-bundle] ${label} timed out after ${CMS_QUERY_TIMEOUT_MS}ms`,
        ),
      );
    }, CMS_QUERY_TIMEOUT_MS);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

type SettingRow = { key: string; value: string };

/**
 * Dedicated short-lived client — avoids the process-wide Prisma/pg Pool,
 * which intermittently stalls under Next SSR against the transaction pooler.
 */
async function fetchSettingsRows(): Promise<SettingRow[]> {
  const connectionString = resolveDatabaseUrl();
  const client = new pg.Client({
    connectionString,
    connectionTimeoutMillis: CMS_QUERY_TIMEOUT_MS,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
  });
  try {
    await withTimeout(client.connect(), "connect");
    const result = await withTimeout(
      client.query<SettingRow>(
        `SELECT key, value FROM "SiteSetting" WHERE key = ANY($1::text[])`,
        [[...PUBLIC_CMS_KEYS]],
      ),
      "settings",
    );
    return result.rows;
  } finally {
    await client.end().catch(() => {});
  }
}

/**
 * Cross-request cached CMS load (ISR 300s). Request-scoped via React cache().
 *
 * Critical path: SiteSetting only via a dedicated client.
 * SiteImage SSR uses slot defaults — full-table scans stall under Next+pooler.
 * During `next build`, skip live DB (parallel workers thrash the pooler) and
 * use defaults — runtime ISR refreshes from DB after deploy.
 */
const loadPublicCmsBundleCached = unstable_cache(
  async (): Promise<PublicCmsBundle> => {
    if (process.env.NEXT_PHASE === "phase-production-build") {
      return defaultBundle(defaultSiteImageMap());
    }
    const t0 = Date.now();
    try {
      const settings = await fetchSettingsRows();
      if (process.env.NODE_ENV === "development") {
        console.log(
          `[public-cms-bundle] ok ${Date.now() - t0}ms (settings=${settings.length}, images=defaults)`,
        );
      }
      return {
        siteImages: defaultSiteImageMap(),
        ...parseSettingMap(settings),
      };
    } catch (error) {
      logDbError("public-cms-bundle", error);
      return defaultBundle(defaultSiteImageMap());
    }
  },
  ["public-cms-bundle-v2"],
  { revalidate: 300, tags: [PUBLIC_CMS_CACHE_TAG] },
);

export const loadPublicCmsBundle = cache(async (): Promise<PublicCmsBundle> => {
  return loadPublicCmsBundleCached();
});
