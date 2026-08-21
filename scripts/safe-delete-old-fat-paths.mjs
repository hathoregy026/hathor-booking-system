/**
 * Delete old fat SiteImage storage objects after DB points elsewhere.
 * Usage: node scripts/safe-delete-old-fat-paths.mjs
 */
import "dotenv/config";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const results = JSON.parse(
  fs.readFileSync(".tmp-compress-local-results.json", "utf8"),
).results;
const base = process.env.SUPABASE_URL?.trim().replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const report = [];
for (const r of results) {
  if (r.action !== "wrote-local" || !r.oldUrl) continue;
  const marker = "/storage/v1/object/public/website-images/";
  const i = r.oldUrl.indexOf(marker);
  if (i < 0) {
    report.push({ name: r.name, action: "skip-not-storage" });
    continue;
  }
  const objectPath = decodeURIComponent(
    r.oldUrl.slice(i + marker.length).split("?")[0],
  );
  const endpoint = `${base}/storage/v1/object/website-images/${objectPath}`;
  let ok = false;
  let last = "";
  for (let tryN = 1; tryN <= 5 && !ok; tryN++) {
    const del = spawnSync(
      "curl.exe",
      [
        "-fsS",
        "--http1.1",
        "--max-time",
        "60",
        "-X",
        "DELETE",
        "-H",
        `Authorization: Bearer ${key}`,
        "-H",
        `apikey: ${key}`,
        endpoint,
      ],
      { encoding: "utf8" },
    );
    if (del.status === 0) ok = true;
    else {
      last = del.stderr || del.stdout || String(del.status);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500 * tryN);
    }
  }
  report.push({
    name: r.name,
    objectPath,
    action: ok ? "deleted" : "failed",
    error: ok ? undefined : last.slice(0, 200),
  });
  console.log(ok ? `deleted ${objectPath}` : `FAIL ${objectPath}: ${last.slice(0, 120)}`);
}

fs.writeFileSync(
  ".tmp-delete-old-fat-report.json",
  JSON.stringify(report, null, 2),
);
