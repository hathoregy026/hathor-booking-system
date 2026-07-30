import { cache } from "react";
import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import {
  DEFAULT_TYPOGRAPHY_SETTINGS,
  TYPOGRAPHY_SETTINGS_KEY,
  TYPOGRAPHY_SETTINGS_MOBILE_KEY,
  typographySettingsSchema,
  parseTypographySettings,
  type TypographySettings,
} from "@/lib/typography-settings-shared";
import { prisma } from "@/lib/prisma";

export {
  DEFAULT_TYPOGRAPHY_SETTINGS,
  TYPOGRAPHY_SETTINGS_KEY,
  TYPOGRAPHY_SETTINGS_MOBILE_KEY,
  typographySettingsSchema,
  typographyToCssVars,
  typographyToImportantCss,
  typographyToInlineStyle,
  parseTypographySettings,
  type TypographySettings,
  type TypographyTextStyle,
  type TypographyRole,
  HATHOR_LUXURY_FONTS,
} from "@/lib/typography-settings-shared";

async function writeViaSql(key: string, payload: string): Promise<void> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  await pool.query(
    `INSERT INTO "SiteSetting" (key, value, "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [key, payload],
  );
}

export const getTypographySettings = cache(
  async (): Promise<TypographySettings> => {
    const cms = await loadPublicCmsBundle();
    return cms.typography;
  },
);

export const getTypographySettingsSafe = cache(
  async (): Promise<TypographySettings> => {
    try {
      return await getTypographySettings();
    } catch (error) {
      console.error("[typography-settings] get failed:", error);
      return DEFAULT_TYPOGRAPHY_SETTINGS;
    }
  },
);

export async function saveTypographySettings(
  settings: TypographySettings,
): Promise<TypographySettings> {
  const safe = typographySettingsSchema.parse(settings);
  const payload = JSON.stringify(safe);

  try {
    await withDb(() =>
      prisma.siteSetting.upsert({
        where: { key: TYPOGRAPHY_SETTINGS_KEY },
        create: {
          key: TYPOGRAPHY_SETTINGS_KEY,
          value: payload,
        },
        update: {
          value: payload,
        },
      }),
    );
  } catch (error) {
    logDbError("typography-settings.save.prisma", error);
    await writeViaSql(TYPOGRAPHY_SETTINGS_KEY, payload);
  }

  return safe;
}

export const getTypographySettingsMobile = cache(
  async (): Promise<TypographySettings> => {
    const cms = await loadPublicCmsBundle();
    return cms.typographyMobile;
  },
);

export const getTypographySettingsMobileSafe = cache(
  async (): Promise<TypographySettings> => {
    try {
      return await getTypographySettingsMobile();
    } catch (error) {
      console.error("[typography-settings-mobile] get failed:", error);
      return DEFAULT_TYPOGRAPHY_SETTINGS;
    }
  },
);

export async function saveTypographySettingsMobile(
  settings: TypographySettings,
): Promise<TypographySettings> {
  const safe = typographySettingsSchema.parse(settings);
  const payload = JSON.stringify(safe);

  try {
    await withDb(() =>
      prisma.siteSetting.upsert({
        where: { key: TYPOGRAPHY_SETTINGS_MOBILE_KEY },
        create: { key: TYPOGRAPHY_SETTINGS_MOBILE_KEY, value: payload },
        update: { value: payload },
      }),
    );
  } catch (error) {
    logDbError("typography-settings.save.prisma.mobile", error);
    await writeViaSql(TYPOGRAPHY_SETTINGS_MOBILE_KEY, payload);
  }

  return safe;
}
