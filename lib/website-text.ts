import { cache } from "react";
import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { loadPublicCmsBundle } from "@/lib/public-cms-bundle";
import {
  DEFAULT_WEBSITE_TEXT,
  WEBSITE_TEXT_KEY,
  WEBSITE_TEXT_MOBILE_KEY,
  parseWebsiteText,
  type WebsiteText,
} from "@/lib/website-text-shared";
import { prisma } from "@/lib/prisma";

export {
  DEFAULT_WEBSITE_TEXT,
  WEBSITE_TEXT_KEY,
  WEBSITE_TEXT_MOBILE_KEY,
  WEBSITE_TEXT_NAV,
  deepMergeWebsiteText,
  parseWebsiteText,
  paragraphsToText,
  textToParagraphs,
  type WebsiteText,
  type WebsiteTextNavItem,
} from "@/lib/website-text-shared";

async function writeViaSql(key: string, payload: string): Promise<void> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  await pool.query(
    `INSERT INTO "SiteSetting" (key, value, "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [key, payload],
  );
}

export const getWebsiteText = cache(async (): Promise<WebsiteText> => {
  const cms = await loadPublicCmsBundle();
  return cms.websiteText;
});

export const getWebsiteTextSafe = cache(async (): Promise<WebsiteText> => {
  try {
    return await getWebsiteText();
  } catch (error) {
    console.error("[website-text] get failed:", error);
    return DEFAULT_WEBSITE_TEXT;
  }
});

export async function saveWebsiteText(
  settings: WebsiteText,
): Promise<WebsiteText> {
  const safe = parseWebsiteText(settings);
  const payload = JSON.stringify(safe);

  try {
    await withDb(() =>
      prisma.siteSetting.upsert({
        where: { key: WEBSITE_TEXT_KEY },
        create: {
          key: WEBSITE_TEXT_KEY,
          value: payload,
        },
        update: {
          value: payload,
        },
      }),
    );
  } catch (error) {
    logDbError("website-text.save.prisma", error);
    await writeViaSql(WEBSITE_TEXT_KEY, payload);
  }

  return safe;
}

export const getWebsiteTextMobile = cache(async (): Promise<WebsiteText> => {
  const cms = await loadPublicCmsBundle();
  return cms.websiteTextMobile;
});

export const getWebsiteTextMobileSafe = cache(async (): Promise<WebsiteText> => {
  try {
    return await getWebsiteTextMobile();
  } catch (error) {
    console.error("[website-text-mobile] get failed:", error);
    return DEFAULT_WEBSITE_TEXT;
  }
});

export async function saveWebsiteTextMobile(
  settings: WebsiteText,
): Promise<WebsiteText> {
  const safe = parseWebsiteText(settings);
  const payload = JSON.stringify(safe);

  try {
    await withDb(() =>
      prisma.siteSetting.upsert({
        where: { key: WEBSITE_TEXT_MOBILE_KEY },
        create: { key: WEBSITE_TEXT_MOBILE_KEY, value: payload },
        update: { value: payload },
      }),
    );
  } catch (error) {
    logDbError("website-text.save.prisma.mobile", error);
    await writeViaSql(WEBSITE_TEXT_MOBILE_KEY, payload);
  }

  return safe;
}
