import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import {
  DEFAULT_HIEROGLYPH_TUNE,
  HIEROGLYPH_TUNE_KEY,
  hieroglyphTuneSchema,
  parseHieroglyphTune,
  type HieroglyphTune,
} from "@/lib/hieroglyph-tune-shared";
import { prisma } from "@/lib/prisma";

export {
  DEFAULT_HIEROGLYPH_TUNE,
  HIEROGLYPH_TUNE_KEY,
  hieroglyphTuneSchema,
  hieroglyphTuneToImportantCss,
  parseHieroglyphTune,
  type HieroglyphTune,
} from "@/lib/hieroglyph-tune-shared";

function readStoredTune(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  }
  return value;
}

async function readTuneViaSql(): Promise<HieroglyphTune | null> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  const result = await pool.query<{ value: string }>(
    `SELECT value FROM "SiteSetting" WHERE key = $1 LIMIT 1`,
    [HIEROGLYPH_TUNE_KEY],
  );
  const raw = result.rows[0]?.value;
  if (!raw) return null;
  return parseHieroglyphTune(readStoredTune(raw));
}

async function writeTuneViaSql(payload: string): Promise<void> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  await pool.query(
    `INSERT INTO "SiteSetting" (key, value, "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [HIEROGLYPH_TUNE_KEY, payload],
  );
}

export async function getHieroglyphTune(): Promise<HieroglyphTune> {
  try {
    const row = await withDb(() =>
      prisma.siteSetting.findUnique({
        where: { key: HIEROGLYPH_TUNE_KEY },
        select: { value: true },
      }),
    );
    if (!row?.value) return DEFAULT_HIEROGLYPH_TUNE;
    return parseHieroglyphTune(readStoredTune(row.value));
  } catch (error) {
    logDbError("hieroglyph-tune.get.prisma", error);
    const viaSql = await readTuneViaSql();
    return viaSql ?? DEFAULT_HIEROGLYPH_TUNE;
  }
}

export async function getHieroglyphTuneSafe(): Promise<HieroglyphTune> {
  try {
    return await getHieroglyphTune();
  } catch (error) {
    console.error("[hieroglyph-tune] get failed:", error);
    try {
      const viaSql = await readTuneViaSql();
      if (viaSql) return viaSql;
    } catch (sqlError) {
      logDbError("hieroglyph-tune.get.sql", sqlError);
    }
    return DEFAULT_HIEROGLYPH_TUNE;
  }
}

export async function saveHieroglyphTune(
  tune: HieroglyphTune,
): Promise<HieroglyphTune> {
  const safe = hieroglyphTuneSchema.parse(tune);
  const payload = JSON.stringify(safe);

  try {
    await withDb(() =>
      prisma.siteSetting.upsert({
        where: { key: HIEROGLYPH_TUNE_KEY },
        create: { key: HIEROGLYPH_TUNE_KEY, value: payload },
        update: { value: payload },
      }),
    );
  } catch (error) {
    logDbError("hieroglyph-tune.save.prisma", error);
    await writeTuneViaSql(payload);
  }

  return safe;
}
