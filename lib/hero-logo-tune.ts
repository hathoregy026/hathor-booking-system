import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import {
  DEFAULT_HERO_LOGO_TUNE,
  HERO_LOGO_TUNE_KEY,
  heroLogoTuneSchema,
  parseHeroLogoTune,
  type HeroLogoTune,
} from "@/lib/hero-logo-tune-shared";
import { prisma } from "@/lib/prisma";

export {
  DEFAULT_HERO_LOGO_TUNE,
  HERO_LOGO_TUNE_KEY,
  heroLogoTuneSchema,
  heroLogoTuneToCssVars,
  heroLogoTuneToImportantCss,
  applyHeroLogoTuneToElement,
  parseHeroLogoTune,
  type HeroLogoTune,
} from "@/lib/hero-logo-tune-shared";

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

async function readTuneViaSql(): Promise<HeroLogoTune | null> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  const result = await pool.query<{ value: string }>(
    `SELECT value FROM "SiteSetting" WHERE key = $1 LIMIT 1`,
    [HERO_LOGO_TUNE_KEY],
  );
  const raw = result.rows[0]?.value;
  if (!raw) return null;
  return parseHeroLogoTune(readStoredTune(raw));
}

async function writeTuneViaSql(payload: string): Promise<void> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  await pool.query(
    `INSERT INTO "SiteSetting" (key, value, "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [HERO_LOGO_TUNE_KEY, payload],
  );
}

export async function getHeroLogoTune(): Promise<HeroLogoTune> {
  try {
    const row = await withDb(() =>
      prisma.siteSetting.findUnique({
        where: { key: HERO_LOGO_TUNE_KEY },
        select: { value: true },
      }),
    );
    if (!row?.value) return DEFAULT_HERO_LOGO_TUNE;
    return parseHeroLogoTune(readStoredTune(row.value));
  } catch (error) {
    logDbError("hero-logo-tune.get.prisma", error);
    const viaSql = await readTuneViaSql();
    if (viaSql) return viaSql;
    throw error;
  }
}

/** Homepage-safe read — never throws; logs and falls back. */
export async function getHeroLogoTuneSafe(): Promise<HeroLogoTune> {
  try {
    return await getHeroLogoTune();
  } catch (error) {
    console.error("[hero-logo-tune] get failed:", error);
    try {
      const viaSql = await readTuneViaSql();
      if (viaSql) return viaSql;
    } catch (sqlError) {
      logDbError("hero-logo-tune.get.sql", sqlError);
    }
    return DEFAULT_HERO_LOGO_TUNE;
  }
}

export async function saveHeroLogoTune(tune: HeroLogoTune): Promise<HeroLogoTune> {
  const safe = heroLogoTuneSchema.parse(tune);
  const payload = JSON.stringify(safe);

  try {
    await withDb(() =>
      prisma.siteSetting.upsert({
        where: { key: HERO_LOGO_TUNE_KEY },
        create: {
          key: HERO_LOGO_TUNE_KEY,
          value: payload,
        },
        update: {
          value: payload,
        },
      }),
    );
  } catch (error) {
    logDbError("hero-logo-tune.save.prisma", error);
    await writeTuneViaSql(payload);
  }

  /* Return what we wrote — never block Save on a follow-up read. */
  return safe;
}
