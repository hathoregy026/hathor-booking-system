import { cache } from "react";
import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import {
  DEFAULT_HIEROGLYPH_TUNE,
  HIEROGLYPH_TUNE_KEY,
  hieroglyphTuneSchema,
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

export const getHieroglyphTune = cache(async (): Promise<HieroglyphTune> => {
  const cms = await loadPublicCmsBundle();
  return cms.hieroglyphTune;
});

export const getHieroglyphTuneSafe = cache(async (): Promise<HieroglyphTune> => {
  try {
    return await getHieroglyphTune();
  } catch (error) {
    console.error("[hieroglyph-tune] get failed:", error);
    return DEFAULT_HIEROGLYPH_TUNE;
  }
});

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
