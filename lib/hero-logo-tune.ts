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
  try {
    const row = await withDb(() =>
      prisma.siteSetting.findUnique({
        where: { key: HERO_LOGO_TUNE_KEY },
        select: { value: true },
      }),
    );
    if (!row?.value) return DEFAULT_HERO_LOGO_TUNE;
    return parseHeroLogoTune(readStoredTune(row.value));
  } catch {
    return DEFAULT_HERO_LOGO_TUNE;
  }
}

export async function saveHeroLogoTune(tune: HeroLogoTune): Promise<HeroLogoTune> {
  const safe = heroLogoTuneSchema.parse(tune);
  await withDb(() =>
    prisma.siteSetting.upsert({
      where: { key: HERO_LOGO_TUNE_KEY },
      create: {
        key: HERO_LOGO_TUNE_KEY,
        value: JSON.stringify(safe),
      },
      update: {
        value: JSON.stringify(safe),
      },
    }),
  );
  return safe;
}
