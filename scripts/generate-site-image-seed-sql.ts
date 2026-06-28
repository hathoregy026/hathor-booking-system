import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE_IMAGE_SLOTS } from "../lib/site-image-slots";

const root = dirname(fileURLToPath(import.meta.url));

function esc(value: string): string {
  return value.replace(/'/g, "''");
}

const rows = SITE_IMAGE_SLOTS.map((slot) => {
  return `(
    gen_random_uuid()::text,
    '${esc(slot.name)}',
    '${esc(slot.altText)}',
    '${esc(slot.url)}',
    '${esc(slot.category)}',
    '${esc(slot.pagePath)}',
    ${slot.displayOrder},
    true,
    NOW(),
    NOW()
  )`;
});

const sql = `
INSERT INTO "SiteImage" (
  id, name, "altText", url, category, "pagePath", "displayOrder", "isActive", "updatedAt", "createdAt"
)
SELECT v.id, v.name, v."altText", v.url, v.category, v."pagePath", v."displayOrder", v."isActive", v."updatedAt", v."createdAt"
FROM (VALUES
${rows.join(",\n")}
) AS v(id, name, "altText", url, category, "pagePath", "displayOrder", "isActive", "updatedAt", "createdAt")
WHERE NOT EXISTS (
  SELECT 1 FROM "SiteImage" si WHERE si.name = v.name
);
`.trim();

const outPath = join(root, "site-image-seed.sql");
writeFileSync(outPath, sql, "utf8");
console.log(`Wrote ${outPath} (${SITE_IMAGE_SLOTS.length} slots)`);
