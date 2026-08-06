import { cache } from "react";
import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import {
  DEFAULT_WELCOME_SPLASH_SETTINGS,
  WELCOME_SPLASH_SETTINGS_KEY,
  welcomeSplashSettingsSchema,
  type WelcomeSplashSettings,
} from "@/lib/welcome-splash-settings-shared";
import { prisma } from "@/lib/prisma";

export {
  DEFAULT_WELCOME_SPLASH_SETTINGS,
  WELCOME_SPLASH_SETTINGS_KEY,
  parseWelcomeSplashSettings,
  welcomeSplashSettingsSchema,
  isWelcomeSplashSettingsEqual,
  type WelcomeSplashSettings,
} from "@/lib/welcome-splash-settings-shared";

async function writeSettingsViaSql(payload: string): Promise<void> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  await pool.query(
    `INSERT INTO "SiteSetting" (key, value, "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [WELCOME_SPLASH_SETTINGS_KEY, payload],
  );
}

export const getWelcomeSplashSettings = cache(
  async (): Promise<WelcomeSplashSettings> => {
    const cms = await loadPublicCmsBundle();
    return cms.welcomeSplash;
  },
);

export const getWelcomeSplashSettingsSafe = cache(
  async (): Promise<WelcomeSplashSettings> => {
    try {
      return await getWelcomeSplashSettings();
    } catch (error) {
      console.error("[welcome-splash-settings] get failed:", error);
      return DEFAULT_WELCOME_SPLASH_SETTINGS;
    }
  },
);

export async function saveWelcomeSplashSettings(
  settings: WelcomeSplashSettings,
): Promise<WelcomeSplashSettings> {
  const safe = welcomeSplashSettingsSchema.parse(settings);
  const payload = JSON.stringify(safe);

  try {
    await withDb(() =>
      prisma.siteSetting.upsert({
        where: { key: WELCOME_SPLASH_SETTINGS_KEY },
        create: { key: WELCOME_SPLASH_SETTINGS_KEY, value: payload },
        update: { value: payload },
      }),
    );
  } catch (error) {
    logDbError("welcome-splash-settings.save.prisma", error);
    await writeSettingsViaSql(payload);
  }

  return safe;
}
