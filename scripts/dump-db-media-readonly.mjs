/**
 * READ-ONLY: dump media URLs from Postgres + storage.objects into .tmp-db-media-dump.json
 * Does not mutate anything.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outPath = path.join(root, ".tmp-db-media-dump.json");

const url = process.env.DATABASE_URL || process.env.DIRECT_URL;
if (!url) {
  console.error("No DATABASE_URL / DIRECT_URL");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();
  const siteImages = (
    await client.query(
      `SELECT name, "pagePath", "isActive", url, category FROM "SiteImage" ORDER BY name`,
    )
  ).rows;

  const other = (
    await client.query(`
      SELECT 'SiteContent' AS src, id::text AS id, COALESCE("imageUrl",'') AS url FROM "SiteContent" WHERE COALESCE("imageUrl",'') <> ''
      UNION ALL SELECT 'Cruise', id::text, COALESCE("imageUrl",'') FROM "Cruise" WHERE COALESCE("imageUrl",'') <> ''
      UNION ALL SELECT 'EmailTemplate_logo', id::text, COALESCE("logoUrl",'') FROM "EmailTemplate" WHERE COALESCE("logoUrl",'') <> ''
      UNION ALL SELECT 'EmailTemplate_hero', id::text, COALESCE("heroImageUrl",'') FROM "EmailTemplate" WHERE COALESCE("heroImageUrl",'') <> ''
      UNION ALL SELECT 'AdminProfile', id::text, COALESCE("avatarUrl",'') FROM "AdminProfile" WHERE COALESCE("avatarUrl",'') <> ''
    `)
  ).rows;

  const settings = (
    await client.query(
      `SELECT key, value FROM "SiteSetting" WHERE key IN ('site-image-public-map-v2','site-image-public-map')`,
    )
  ).rows;

  let mapV2 = {};
  let mapLegacy = {};
  for (const row of settings) {
    try {
      const parsed = JSON.parse(row.value);
      if (row.key === "site-image-public-map-v2") mapV2 = parsed;
      if (row.key === "site-image-public-map") mapLegacy = parsed;
    } catch {
      /* ignore */
    }
  }

  const storageObjects = (
    await client.query(`
      SELECT bucket_id, name, (metadata->>'size')::bigint AS bytes, created_at
      FROM storage.objects
      ORDER BY bytes DESC NULLS LAST
    `)
  ).rows;

  const urls = [
    ...siteImages.map((r) => r.url),
    ...other.map((r) => r.url),
    ...Object.values(mapV2),
    ...Object.values(mapLegacy),
  ].filter((u) => typeof u === "string" && u.length > 0);

  const dump = {
    generatedAt: new Date().toISOString(),
    readOnly: true,
    siteImages,
    other,
    mapV2,
    mapLegacy,
    storageObjects,
    urls: [...new Set(urls)],
  };

  fs.writeFileSync(outPath, JSON.stringify(dump, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        siteImages: siteImages.length,
        other: other.length,
        storageObjects: storageObjects.length,
        urls: dump.urls.length,
        mapV2Keys: Object.keys(mapV2).length,
        mapLegacyKeys: Object.keys(mapLegacy).length,
        outPath,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await client.end().catch(() => {});
  });
