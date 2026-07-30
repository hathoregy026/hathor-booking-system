import { cache } from "react";
import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import {
  DEFAULT_HERO_LOGO_TUNE,
  DEFAULT_HERO_LOGO_TUNE_MOBILE,
  ensurePhoneHeroLogoVisible,
  HERO_LOGO_TUNE_KEY,
  HERO_LOGO_TUNE_MOBILE_KEY,
  heroLogoTuneSchema,
  parseHeroLogoTune,
  type HeroLogoTune,
} from "@/lib/hero-logo-tune-shared";
import { prisma } from "@/lib/prisma";

export {
  DEFAULT_HERO_LOGO_TUNE,
  DEFAULT_HERO_LOGO_TUNE_MOBILE,
  ensurePhoneHeroLogoVisible,
  HERO_LOGO_TUNE_KEY,
  HERO_LOGO_TUNE_MOBILE_KEY,
  heroLogoTuneSchema,
  heroLogoTuneToCssVars,
  heroLogoTuneToImportantCss,
  applyHeroLogoTuneToElement,
  parseHeroLogoTune,
  type HeroLogoTune,
} from "@/lib/hero-logo-tune-shared";

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

/** Request-memoized — shares the public CMS bundle with the layout. */
export const getHeroLogoTune = cache(async (): Promise<HeroLogoTune> => {
  const cms = await loadPublicCmsBundle();
  return cms.heroLogoTune;
});

/** Homepage-safe read — never throws; logs and falls back. */
export const getHeroLogoTuneSafe = cache(async (): Promise<HeroLogoTune> => {
  try {
    return await getHeroLogoTune();
  } catch (error) {
    console.error("[hero-logo-tune] get failed:", error);
    return DEFAULT_HERO_LOGO_TUNE;
  }
});

export async function saveHeroLogoTune(tune: HeroLogoTune): Promise<HeroLogoTune> {
  return saveTuneByKey(HERO_LOGO_TUNE_KEY, tune);
}

export const getHeroLogoTuneMobile = cache(async (): Promise<HeroLogoTune> => {
  const cms = await loadPublicCmsBundle();
  return ensurePhoneHeroLogoVisible(cms.heroLogoTuneMobile);
});

export const getHeroLogoTuneMobileSafe = cache(async (): Promise<HeroLogoTune> => {
  try {
    return await getHeroLogoTuneMobile();
  } catch (error) {
    console.error("[hero-logo-tune-mobile] get failed:", error);
    return DEFAULT_HERO_LOGO_TUNE_MOBILE;
  }
});

export async function saveHeroLogoTuneMobile(
  tune: HeroLogoTune,
): Promise<HeroLogoTune> {
  return saveTuneByKey(HERO_LOGO_TUNE_MOBILE_KEY, tune);
}
