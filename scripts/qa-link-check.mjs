#!/usr/bin/env node
/**
 * Phase 5 — smoke-check public routes and nav hrefs.
 * Usage: node scripts/qa-link-check.mjs [baseUrl]
 */
const base = (process.argv[2] ?? "http://localhost:3002").replace(/\/$/, "");

const NAV_HREFS = [
  "/",
  "/cruises",
  "/rooms",
  "/highlights",
  "/about",
  "/contact",
  "/blogs",
  "/wellness",
  "/gastronomy",
  "/charter",
  "/luxury-cabins-Nile-Cruise",
  "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise",
  "/book",
];

const SAMPLE_BLOG_SLUGS = [
  "secret-spots-between-luxor-and-aswan",
  "untouched-nature-along-the-nile-river",
  "the-magic-of-sleeping-on-the-nile-river",
];

async function check(path) {
  const url = `${base}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    return { path, status: res.status, ok: res.ok };
  } catch (error) {
    return {
      path,
      status: 0,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

const paths = [
  ...NAV_HREFS,
  ...SAMPLE_BLOG_SLUGS.map((slug) => `/blogs/${slug}`),
];

const results = await Promise.all(paths.map(check));
const failed = results.filter((r) => !r.ok);

console.log(`\nLink check — ${base}`);
console.log(`Checked ${results.length} routes`);
for (const r of results) {
  const mark = r.ok ? "OK" : "FAIL";
  console.log(`  [${mark}] ${r.status} ${r.path}${r.error ? ` — ${r.error}` : ""}`);
}

if (failed.length) {
  console.log(`\n${failed.length} broken route(s)`);
  process.exit(1);
}

console.log("\nAll routes returned 2xx");
