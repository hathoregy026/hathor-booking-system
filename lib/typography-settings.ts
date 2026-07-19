import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import {
  DEFAULT_TYPOGRAPHY_SETTINGS,
  TYPOGRAPHY_SETTINGS_KEY,
  typographySettingsSchema,
  parseTypographySettings,
  type TypographySettings,
} from "@/lib/typography-settings-shared";
import { prisma } from "@/lib/prisma";

export {
  DEFAULT_TYPOGRAPHY_SETTINGS,
  TYPOGRAPHY_SETTINGS_KEY,
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

async function readViaSql(): Promise<TypographySettings | null> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  const result = await pool.query<{ value: string }>(
    `SELECT value FROM "SiteSetting" WHERE key = $1 LIMIT 1`,
    [TYPOGRAPHY_SETTINGS_KEY],
  );
  const raw = result.rows[0]?.value;
  if (!raw) return null;
  return parseTypographySettings(readStored(raw));
}

async function writeViaSql(payload: string): Promise<void> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  await pool.query(
    `INSERT INTO "SiteSetting" (key, value, "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [TYPOGRAPHY_SETTINGS_KEY, payload],
  );
}

export async function getTypographySettings(): Promise<TypographySettings> {
  try {
    const row = await withDb(() =>
      prisma.siteSetting.findUnique({
        where: { key: TYPOGRAPHY_SETTINGS_KEY },
        select: { value: true },
      }),
    );
    if (!row?.value) return DEFAULT_TYPOGRAPHY_SETTINGS;
    return parseTypographySettings(readStored(row.value));
  } catch (error) {
    logDbError("typography-settings.get.prisma", error);
    const viaSql = await readViaSql();
    if (viaSql) return viaSql;
    throw error;
  }
}

export async function getTypographySettingsSafe(): Promise<TypographySettings> {
  try {
    return await getTypographySettings();
  } catch (error) {
    console.error("[typography-settings] get failed:", error);
    try {
      const viaSql = await readViaSql();
      if (viaSql) return viaSql;
    } catch (sqlError) {
      logDbError("typography-settings.get.sql", sqlError);
    }
    return DEFAULT_TYPOGRAPHY_SETTINGS;
  }
}

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
    await writeViaSql(payload);
  }

  return safe;
}
