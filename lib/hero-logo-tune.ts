import { withDb } from "@/lib/db-safe";
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

export async function getHeroLogoTune(): Promise<HeroLogoTune> {
  const row = await withDb(() =>
    prisma.siteSetting.findUnique({
      where: { key: HERO_LOGO_TUNE_KEY },
      select: { value: true },
    }),
  );
  if (!row?.value) return DEFAULT_HERO_LOGO_TUNE;
  return parseHeroLogoTune(readStoredTune(row.value));
}

/** Homepage-safe read — never throws; logs and falls back. */
export async function getHeroLogoTuneSafe(): Promise<HeroLogoTune> {
  try {
    return await getHeroLogoTune();
  } catch (error) {
    console.error("[hero-logo-tune] get failed:", error);
    return DEFAULT_HERO_LOGO_TUNE;
  }
}

export async function saveHeroLogoTune(tune: HeroLogoTune): Promise<HeroLogoTune> {
  const safe = heroLogoTuneSchema.parse(tune);
  const payload = JSON.stringify(safe);
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
  try {
    return await getHeroLogoTune();
  } catch {
    /* Upsert already succeeded — don't wipe the dashboard with defaults. */
    return safe;
  }
}
