import { cache } from "react";
import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import {
  DEFAULT_WHEEL_STAGE_SETTINGS,
  WHEEL_STAGE_SETTINGS_KEY,
  wheelStageSettingsSchema,
  type WheelStageSettings,
} from "@/lib/wheel-stage-settings-shared";
import { prisma } from "@/lib/prisma";

export {
  DEFAULT_WHEEL_STAGE_SETTINGS,
  WHEEL_STAGE_SETTINGS_KEY,
  parseWheelStageSettings,
  wheelStageSettingsSchema,
  isWheelStageSettingsEqual,
  type WheelStageSettings,
} from "@/lib/wheel-stage-settings-shared";

async function writeSettingsViaSql(payload: string): Promise<void> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  await pool.query(
    `INSERT INTO "SiteSetting" (key, value, "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [WHEEL_STAGE_SETTINGS_KEY, payload],
  );
}

export const getWheelStageSettings = cache(
  async (): Promise<WheelStageSettings> => {
    const cms = await loadPublicCmsBundle();
    return cms.wheelStage;
  },
);

export const getWheelStageSettingsSafe = cache(
  async (): Promise<WheelStageSettings> => {
    try {
      return await getWheelStageSettings();
    } catch (error) {
      console.error("[wheel-stage-settings] get failed:", error);
      return DEFAULT_WHEEL_STAGE_SETTINGS;
    }
  },
);

export async function saveWheelStageSettings(
  settings: WheelStageSettings,
): Promise<WheelStageSettings> {
  const safe = wheelStageSettingsSchema.parse(settings);
  const payload = JSON.stringify(safe);

  try {
    await withDb(() =>
      prisma.siteSetting.upsert({
        where: { key: WHEEL_STAGE_SETTINGS_KEY },
        create: { key: WHEEL_STAGE_SETTINGS_KEY, value: payload },
        update: { value: payload },
      }),
    );
  } catch (error) {
    logDbError("wheel-stage-settings.save.prisma", error);
    await writeSettingsViaSql(payload);
  }

  return safe;
}
