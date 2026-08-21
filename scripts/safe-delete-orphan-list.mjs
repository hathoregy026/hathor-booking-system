/**
 * Delete known orphan storage objects (from audited SQL anti-join).
 * node scripts/safe-delete-orphan-list.mjs [--dry-run]
 */
import "dotenv/config";
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const DRY = process.argv.includes("--dry-run");
const orphans = JSON.parse(
  fs.readFileSync(".tmp-orphan-objects.json", "utf8"),
);
const sb = createClient(
  process.env.SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
  { auth: { persistSession: false } },
);

let freed = 0;
const report = [];
for (const obj of orphans) {
  const key = `${obj.bucket_id}/${obj.name}`;
  const bytes = Number(obj.bytes || 0);
  if (DRY) {
    report.push({ key, bytes, action: "dry-run" });
    freed += bytes;
    continue;
  }
  const { error } = await sb.storage.from(obj.bucket_id).remove([obj.name]);
  if (error) {
    report.push({ key, bytes, action: "failed", error: error.message });
    console.error("FAIL", key, error.message);
  } else {
    report.push({ key, bytes, action: "deleted" });
    freed += bytes;
    console.log(`deleted ${(bytes / 1048576).toFixed(2)}MB ${key}`);
  }
}
fs.writeFileSync(
  ".tmp-orphan-delete-report.json",
  JSON.stringify({ dryRun: DRY, freed, report }, null, 2),
);
console.log(
  JSON.stringify(
    { count: report.length, freedMB: +(freed / 1048576).toFixed(2), dryRun: DRY },
    null,
    2,
  ),
);
