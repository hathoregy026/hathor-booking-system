#!/usr/bin/env node
/**
 * Audit whether production is serving the latest deploy and which hostname is live.
 * Usage: node scripts/check-production-deploy.mjs [baseUrl]
 */
import { execSync } from "node:child_process";

const base =
  process.argv[2]?.replace(/\/$/, "") ||
  "https://www.easytravegypt.com";

const localHead = execSync("git rev-parse --short=12 HEAD", {
  encoding: "utf8",
}).trim();

console.log("Local git HEAD:", localHead);
console.log("Checking:", base, "\n");

let deploy;
try {
  const res = await fetch(`${base}/api/deploy-id`, {
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  deploy = await res.json();
  console.log("Live deploy id:", deploy.id);
  console.log("Production URL (from API):", deploy.productionUrl);
  console.log(
    deploy.id?.startsWith(localHead.slice(0, 12))
      ? "✓ Deploy matches local HEAD"
      : "✗ Deploy does NOT match local HEAD — push may be missing or DNS points elsewhere",
  );
} catch (error) {
  console.error("✗ Could not read /api/deploy-id:", error.message);
  process.exit(1);
}

const paths = ["/", "/luxury-cabins-Nile-Cruise", "/contact"];
for (const path of paths) {
  try {
    const res = await fetch(`${base}${path}`, {
      headers: { "Cache-Control": "no-cache" },
      signal: AbortSignal.timeout(30000),
    });
    const html = await res.text();
    const deployHeader = res.headers.get("x-hathor-deploy");
    console.log(
      path,
      res.status,
      "X-Hathor-Deploy:",
      deployHeader || "(none)",
      "boot:",
      html.includes("hathor-reload-guard"),
      "accom:",
      html.includes("accom-editorial-shell"),
    );
  } catch (error) {
    console.log(path, "ERROR", error.message);
  }
}

console.log("\n--- Host note ---");
console.log(
  "easytravegypt.com and *.vercel.app bypass CMS page gates (team preview hosts).",
);
