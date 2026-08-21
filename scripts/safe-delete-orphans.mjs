/**
 * Delete storage objects not in .tmp-live-storage-keys.json
 * Objects listed in .tmp-all-storage-objects.json
 */
import "dotenv/config";
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const DRY = process.argv.includes("--dry-run");
const live = new Set(
  JSON.parse(fs.readFileSync(".tmp-live-storage-keys.json", "utf8")),
);
const all = JSON.parse(fs.readFileSync(".tmp-all-storage-objects.json", "utf8"));
const sb = createClient(
  process.env.SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim(),
  { auth: { persistSession: false } },
);

let freed = 0;
const deleted = [];
for (const obj of all) {
  const key = `${obj.bucket_id}/${obj.name}`;
  if (live.has(key)) continue;
  const bytes = Number(obj.bytes || 0);
  if (DRY) {
    deleted.push({ key, bytes, action: "dry-run" });
    freed += bytes;
    continue;
  }
  const { error } = await sb.storage.from(obj.bucket_id).remove([obj.name]);
  if (error) {
    deleted.push({ key, bytes, action: "failed", error: error.message });
  } else {
    deleted.push({ key, bytes, action: "deleted" });
    freed += bytes;
    console.log(`deleted ${(bytes / 1048576).toFixed(2)}MB ${key}`);
  }
}
fs.writeFileSync(
  ".tmp-orphan-delete-report.json",
  JSON.stringify({ dryRun: DRY, freed, deleted }, null, 2),
);
console.log(
  JSON.stringify(
    {
      candidates: deleted.length,
      freedMB: +(freed / 1048576).toFixed(2),
      dryRun: DRY,
    },
    null,
    2,
  ),
);
