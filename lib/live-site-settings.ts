import { cache } from "react";
import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import {
  DEFAULT_LIVE_SITE_SETTINGS,
  LIVE_SITE_SETTINGS_KEY,
  liveSiteSettingsSchema,
  type LiveSiteSettings,
} from "@/lib/live-site-settings-shared";
import { prisma } from "@/lib/prisma";

export {
  DEFAULT_LIVE_SITE_SETTINGS,
  LIVE_SITE_SETTINGS_KEY,
  parseLiveSiteSettings,
  liveSiteSettingsSchema,
  isLiveSiteSettingsEqual,
  type LiveSiteSettings,
} from "@/lib/live-site-settings-shared";

async function writeSettingsViaSql(payload: string): Promise<void> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  await pool.query(
    `INSERT INTO "SiteSetting" (key, value, "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [LIVE_SITE_SETTINGS_KEY, payload],
  );
}

export const getLiveSiteSettings = cache(async (): Promise<LiveSiteSettings> => {
  const cms = await loadPublicCmsBundle();
  return cms.liveSite;
});

export const getLiveSiteSettingsSafe = cache(
  async (): Promise<LiveSiteSettings> => {
    try {
      return await getLiveSiteSettings();
    } catch (error) {
      console.error("[live-site-settings] get failed:", error);
      return DEFAULT_LIVE_SITE_SETTINGS;
    }
  },
);

export async function saveLiveSiteSettings(
  settings: LiveSiteSettings,
): Promise<LiveSiteSettings> {
  const safe = liveSiteSettingsSchema.parse(settings);
  const payload = JSON.stringify(safe);

  try {
    await withDb(() =>
      prisma.siteSetting.upsert({
        where: { key: LIVE_SITE_SETTINGS_KEY },
        create: { key: LIVE_SITE_SETTINGS_KEY, value: payload },
        update: { value: payload },
      }),
    );
  } catch (error) {
    logDbError("live-site-settings.save.prisma", error);
    await writeSettingsViaSql(payload);
  }

  return safe;
}
