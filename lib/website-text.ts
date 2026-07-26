import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
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

function readStored(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  }
  return value;
}

async function readViaSql(): Promise<WebsiteText | null> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  const result = await pool.query<{ value: string }>(
    `SELECT value FROM "SiteSetting" WHERE key = $1 LIMIT 1`,
    [WEBSITE_TEXT_KEY],
  );
  const raw = result.rows[0]?.value;
  if (!raw) return null;
  return parseWebsiteText(readStored(raw));
}

async function writeViaSql(payload: string): Promise<void> {
  const pool = getSharedPgPool(resolveDatabaseUrl());
  await pool.query(
    `INSERT INTO "SiteSetting" (key, value, "updatedAt")
     VALUES ($1, $2, NOW())
     ON CONFLICT (key) DO UPDATE
       SET value = EXCLUDED.value, "updatedAt" = NOW()`,
    [WEBSITE_TEXT_KEY, payload],
  );
}

export async function getWebsiteText(): Promise<WebsiteText> {
  try {
    const row = await withDb(() =>
      prisma.siteSetting.findUnique({
        where: { key: WEBSITE_TEXT_KEY },
        select: { value: true },
      }),
    );
    if (!row?.value) return DEFAULT_WEBSITE_TEXT;
    return parseWebsiteText(readStored(row.value));
  } catch (error) {
    logDbError("website-text.get.prisma", error);
    const viaSql = await readViaSql();
    if (viaSql) return viaSql;
    throw error;
  }
}

export async function getWebsiteTextSafe(): Promise<WebsiteText> {
  try {
    return await getWebsiteText();
  } catch (error) {
    console.error("[website-text] get failed:", error);
    try {
      const viaSql = await readViaSql();
      if (viaSql) return viaSql;
    } catch (sqlError) {
      logDbError("website-text.get.sql", sqlError);
    }
    return DEFAULT_WEBSITE_TEXT;
  }
}

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
    await writeViaSql(payload);
  }

  return safe;
}

async function getWebsiteTextByKey(key: string): Promise<WebsiteText | null> {
  try {
    const row = await withDb(() =>
      prisma.siteSetting.findUnique({
        where: { key },
        select: { value: true },
      }),
    );
    if (!row?.value) return null;
    return parseWebsiteText(readStored(row.value));
  } catch (error) {
    logDbError(`website-text.get.prisma.${key}`, error);
    const pool = getSharedPgPool(resolveDatabaseUrl());
    const result = await pool.query<{ value: string }>(
      `SELECT value FROM "SiteSetting" WHERE key = $1 LIMIT 1`,
      [key],
    );
    const raw = result.rows[0]?.value;
    if (!raw) return null;
    return parseWebsiteText(readStored(raw));
  }
}

async function saveWebsiteTextByKey(
  key: string,
  settings: WebsiteText,
): Promise<WebsiteText> {
  const safe = parseWebsiteText(settings);
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
    logDbError(`website-text.save.prisma.${key}`, error);
    const pool = getSharedPgPool(resolveDatabaseUrl());
    await pool.query(
      `INSERT INTO "SiteSetting" (key, value, "updatedAt")
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE
         SET value = EXCLUDED.value, "updatedAt" = NOW()`,
      [key, payload],
    );
  }

  return safe;
}

/** Phone website text — falls back to desktop when never saved. */
export async function getWebsiteTextMobile(): Promise<WebsiteText> {
  const mobile = await getWebsiteTextByKey(WEBSITE_TEXT_MOBILE_KEY);
  if (mobile) return mobile;
  return getWebsiteText();
}

export async function getWebsiteTextMobileSafe(): Promise<WebsiteText> {
  try {
    return await getWebsiteTextMobile();
  } catch (error) {
    console.error("[website-text-mobile] get failed:", error);
    return getWebsiteTextSafe();
  }
}

export async function saveWebsiteTextMobile(
  settings: WebsiteText,
): Promise<WebsiteText> {
  return saveWebsiteTextByKey(WEBSITE_TEXT_MOBILE_KEY, settings);
}
