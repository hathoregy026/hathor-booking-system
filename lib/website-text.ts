import { withDb, logDbError } from "@/lib/db-safe";
import { getSharedPgPool } from "@/lib/pg-pool";
import { resolveDatabaseUrl } from "@/lib/database-config";
import {
  DEFAULT_WEBSITE_TEXT,
  WEBSITE_TEXT_KEY,
  parseWebsiteText,
  type WebsiteText,
} from "@/lib/website-text-shared";
import { prisma } from "@/lib/prisma";

export {
  DEFAULT_WEBSITE_TEXT,
  WEBSITE_TEXT_KEY,
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
