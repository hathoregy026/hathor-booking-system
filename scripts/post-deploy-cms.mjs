/**
 * Post-deploy CMS warm: ensure map + call secured revalidate endpoint.
 *
 * Usage:
 *   DEPLOY_BASE_URL=https://hathor-booking-system.vercel.app npm run postdeploy:cms
 *
 * Requires CRON_SECRET in env (same as Vercel production).
 * Never prints secrets.
 */
import fs from "node:fs";

function loadEnv() {
  const env = { ...process.env };
  for (const file of [".env.local", ".env"]) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!m) continue;
      let v = m[2];
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!env[m[1]]) env[m[1]] = v;
    }
  }
  return env;
}

const env = loadEnv();
const base = (
  env.DEPLOY_BASE_URL ||
  env.NEXT_PUBLIC_SITE_URL ||
  "https://hathor-booking-system.vercel.app"
).replace(/\/$/, "");
const secret = env.CRON_SECRET?.trim();
const bypass = env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();

if (!secret) {
  console.error(JSON.stringify({ ok: false, error: "CRON_SECRET missing" }));
  process.exit(1);
}

const headers = {
  "content-type": "application/json",
  authorization: `Bearer ${secret}`,
};
if (bypass) {
  headers["x-vercel-protection-bypass"] = bypass;
  headers["x-vercel-set-bypass-cookie"] = "true";
}

const res = await fetch(`${base}/api/internal/revalidate-public-cms`, {
  method: "POST",
  headers,
  body: JSON.stringify({}),
});
const text = await res.text();
let body;
try {
  body = JSON.parse(text);
} catch {
  body = { raw: text.slice(0, 200) };
}

console.log(
  JSON.stringify({
    ok: res.ok,
    status: res.status,
    base,
    result: body,
  }),
);
process.exit(res.ok ? 0 : 1);
