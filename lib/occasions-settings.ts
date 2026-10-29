import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { prisma } from "@/lib/prisma";
import { OCCASIONS_SETTINGS_KEY, type OccasionsSettings } from "@/lib/occasions";
import { occasionsSettingsSchema, parseOccasionsSettings } from "@/lib/occasions-schema";

/** The dashboard reads the row directly, so an edit is never hidden by the public cache. */
export async function getOccasionsSettings(): Promise<OccasionsSettings> {
  const row = await withDb(() =>
    prisma.siteSetting.findUnique({
      where: { key: OCCASIONS_SETTINGS_KEY },
      select: { value: true },
    }),
  );
  if (!row) return parseOccasionsSettings(null);
  try {
    return parseOccasionsSettings(JSON.parse(row.value) as unknown);
  } catch {
    return parseOccasionsSettings(null);
  }
}

async function writeSettingsViaSql(payload: string): Promise<void> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  await pool.query(
    `INSERT INTO "SiteSetting" (key, value, "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [OCCASIONS_SETTINGS_KEY, payload],
  );
}

/** Strict: throws a ZodError the route turns into a readable message. */
export async function saveOccasionsSettings(input: unknown): Promise<OccasionsSettings> {
  const safe = occasionsSettingsSchema.parse(input);
  const payload = JSON.stringify(safe);

  try {
    await withDb(() =>
      prisma.siteSetting.upsert({
        where: { key: OCCASIONS_SETTINGS_KEY },
        create: { key: OCCASIONS_SETTINGS_KEY, value: payload },
        update: { value: payload },
      }),
    );
  } catch (error) {
    logDbError("occasions-settings.save.prisma", error);
    await writeSettingsViaSql(payload);
  }

  return safe;
}
