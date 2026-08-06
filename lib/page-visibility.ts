import { cache } from "react";
import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import {
  DEFAULT_PAGE_VISIBILITY_SETTINGS,
  PAGE_VISIBILITY_KEY,
  pageVisibilitySettingsSchema,
  type PageVisibilitySettings,
} from "@/lib/page-visibility-shared";
import { prisma } from "@/lib/prisma";

export {
  DEFAULT_PAGE_VISIBILITY_SETTINGS,
  PAGE_VISIBILITY_KEY,
  MANAGED_PUBLIC_PAGES,
  getManagedPageGroups,
  isPageLive,
  isPageVisibilitySettingsEqual,
  normalizePublicPath,
  parsePageVisibilitySettings,
  resolveManagedPublicPage,
  pageVisibilitySettingsSchema,
  type ManagedPublicPage,
  type ManagedPublicPageId,
  type PageVisibilityMap,
  type PageVisibilitySettings,
} from "@/lib/page-visibility-shared";

async function writeSettingsViaSql(payload: string): Promise<void> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  await pool.query(
    `INSERT INTO "SiteSetting" (key, value, "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [PAGE_VISIBILITY_KEY, payload],
  );
}

export const getPageVisibilitySettings = cache(
  async (): Promise<PageVisibilitySettings> => {
    const cms = await loadPublicCmsBundle();
    return cms.pageVisibility;
  },
);

export const getPageVisibilitySettingsSafe = cache(
  async (): Promise<PageVisibilitySettings> => {
    try {
      return await getPageVisibilitySettings();
    } catch (error) {
      console.error("[page-visibility] get failed:", error);
      return DEFAULT_PAGE_VISIBILITY_SETTINGS;
    }
  },
);

export async function savePageVisibilitySettings(
  settings: PageVisibilitySettings,
): Promise<PageVisibilitySettings> {
  const safe = pageVisibilitySettingsSchema.parse(settings);
  const payload = JSON.stringify(safe);

  try {
    await withDb(() =>
      prisma.siteSetting.upsert({
        where: { key: PAGE_VISIBILITY_KEY },
        create: { key: PAGE_VISIBILITY_KEY, value: payload },
        update: { value: payload },
      }),
    );
  } catch (error) {
    logDbError("page-visibility.save.prisma", error);
    await writeSettingsViaSql(payload);
  }

  return safe;
}
