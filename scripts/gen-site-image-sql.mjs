import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(
  readFileSync(join(root, "lib", "hathor-media-manifest.json"), "utf8"),
);

const values = Object.keys(manifest.images)
  .map((key) => `('${key}', '/media/hathor/${key}.webp')`)
  .join(",\n  ");

const sql = `UPDATE "SiteImage" AS s
SET url = v.url
FROM (
  VALUES
  ${values}
) AS v(name, url)
WHERE s.name = v.name;`;

writeFileSync(join(root, "scripts", "update-site-image-urls.sql"), sql);
console.log(sql);
