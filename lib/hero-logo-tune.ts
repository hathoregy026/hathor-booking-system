import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import {
  DEFAULT_HERO_LOGO_TUNE,
  HERO_LOGO_TUNE_KEY,
  HERO_LOGO_TUNE_MOBILE_KEY,
  heroLogoTuneSchema,
  parseHeroLogoTune,
  type HeroLogoTune,
} from "@/lib/hero-logo-tune-shared";
import { prisma } from "@/lib/prisma";

export {
  DEFAULT_HERO_LOGO_TUNE,
  HERO_LOGO_TUNE_KEY,
  HERO_LOGO_TUNE_MOBILE_KEY,
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

async function readTuneViaSql(key: string): Promise<HeroLogoTune | null> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  const result = await pool.query<{ value: string }>(
    `SELECT value FROM "SiteSetting" WHERE key = $1 LIMIT 1`,
    [key],
  );
  const raw = result.rows[0]?.value;
  if (!raw) return null;
  return parseHeroLogoTune(readStoredTune(raw));
}

async function writeTuneViaSql(key: string, payload: string): Promise<void> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  await pool.query(
    `INSERT INTO "SiteSetting" (key, value, "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [key, payload],
  );
}

async function getTuneByKey(key: string): Promise<HeroLogoTune | null> {
  try {
    const row = await withDb(() =>
      prisma.siteSetting.findUnique({
        where: { key },
        select: { value: true },
      }),
    );
    if (!row?.value) return null;
    return parseHeroLogoTune(readStoredTune(row.value));
  } catch (error) {
    logDbError(`hero-logo-tune.get.prisma.${key}`, error);
    return readTuneViaSql(key);
  }
}

async function saveTuneByKey(
  key: string,
  tune: HeroLogoTune,
): Promise<HeroLogoTune> {
  const safe = heroLogoTuneSchema.parse(tune);
  const payload = JSON.stringify(safe);

  try {
    await withDb(() =>
      prisma.siteSetting.upsert({
        where: { key },
        create: { key, value: payload },
        update: { value: payload },
      }),
    );
  } catch (error) {
    logDbError(`hero-logo-tune.save.prisma.${key}`, error);
    await writeTuneViaSql(key, payload);
  }

  return safe;
}

export async function getHeroLogoTune(): Promise<HeroLogoTune> {
  const tune = await getTuneByKey(HERO_LOGO_TUNE_KEY);
  return tune ?? DEFAULT_HERO_LOGO_TUNE;
}

/** Homepage-safe read — never throws; logs and falls back. */
export async function getHeroLogoTuneSafe(): Promise<HeroLogoTune> {
  try {
    return await getHeroLogoTune();
  } catch (error) {
    console.error("[hero-logo-tune] get failed:", error);
    try {
      const viaSql = await readTuneViaSql(HERO_LOGO_TUNE_KEY);
      if (viaSql) return viaSql;
    } catch (sqlError) {
      logDbError("hero-logo-tune.get.sql", sqlError);
    }
    return DEFAULT_HERO_LOGO_TUNE;
  }
}

export async function saveHeroLogoTune(tune: HeroLogoTune): Promise<HeroLogoTune> {
  return saveTuneByKey(HERO_LOGO_TUNE_KEY, tune);
}

/**
 * Phone tune. If never saved, falls back to desktop so phones match until
 * the admin saves a dedicated phone version.
 */
export async function getHeroLogoTuneMobile(): Promise<HeroLogoTune> {
  const mobile = await getTuneByKey(HERO_LOGO_TUNE_MOBILE_KEY);
  if (mobile) return mobile;
  return getHeroLogoTune();
}

export async function getHeroLogoTuneMobileSafe(): Promise<HeroLogoTune> {
  try {
    return await getHeroLogoTuneMobile();
  } catch (error) {
    console.error("[hero-logo-tune-mobile] get failed:", error);
    return getHeroLogoTuneSafe();
  }
}

export async function saveHeroLogoTuneMobile(
  tune: HeroLogoTune,
): Promise<HeroLogoTune> {
  return saveTuneByKey(HERO_LOGO_TUNE_MOBILE_KEY, tune);
}
