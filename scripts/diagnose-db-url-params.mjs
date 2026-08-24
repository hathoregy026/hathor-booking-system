/**
 * A/B test: does the app's rewritten DATABASE_URL connect slower than the raw
 * one from .env?
 *
 * The previous script connected with the RAW url and got 290 ms consistently.
 * The app connects via normalizeDatabaseUrl(), which appends Prisma-style
 * params to a URL that is then handed to pg.Pool — which does not understand
 * them. This isolates which parameter, if any, costs the missing ~20 seconds.
 *
 * Run:  node --env-file=.env scripts/diagnose-db-url-params.mjs
 *
 * Prints timings and parameter names only. Never prints the host credentials
 * or the full connection string.
 */
import { performance } from "node:perf_hooks";
import pg from "pg";

const raw = process.env.DATABASE_URL;
if (!raw) {
  console.error("DATABASE_URL is not set. Run with: node --env-file=.env ...");
  process.exit(1);
}

const base = raw.replace(/^"|"$/g, "");

/** Build a variant of the URL with the given query params applied. */
function withParams(params) {
  const url = new URL(base);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

/** Mirrors what lib/database-config.ts normalizeDatabaseUrl() produces. */
const NORMALIZED = withParams({
  connection_limit: 10,
  pool_timeout: 15,
  connect_timeout: 10,
  pgbouncer: "true",
});

const VARIANTS = [
  ["raw .env url (no params)", base],
  ["+ pgbouncer=true only", withParams({ pgbouncer: "true" })],
  ["+ connection_limit only", withParams({ connection_limit: 10 })],
  ["+ pool_timeout only", withParams({ pool_timeout: 15 })],
  ["+ connect_timeout only", withParams({ connect_timeout: 10 })],
  ["ALL FOUR (what the app uses)", NORMALIZED],
];

console.log("Each variant: 2 fresh connections, timed separately.\n");

for (const [label, connectionString] of VARIANTS) {
  const times = [];
  let failure = null;

  for (let i = 0; i < 2; i += 1) {
    const client = new pg.Client({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 30000,
    });
    const t = performance.now();
    try {
      await client.connect();
      await client.query("select 1");
      times.push(Math.round(performance.now() - t));
      await client.end();
    } catch (error) {
      failure = error.message;
      times.push(Math.round(performance.now() - t));
      try {
        await client.end();
      } catch {}
      break;
    }
  }

  const result = failure
    ? `FAILED after ${times.join(" / ")} ms — ${failure}`
    : `${times.join(" ms, ")} ms`;
  console.log(`${label.padEnd(32)} ${result}`);
}

console.log("");
console.log("Interpretation:");
console.log("  raw fast + ALL FOUR slow  -> the rewritten URL is the problem;");
console.log("                               pg.Pool must get a clean URL.");
console.log("  one variant slow          -> that single parameter is the cause.");
console.log("  all fast                  -> the URL is innocent; the delay is");
console.log("                               elsewhere in the app (pool reuse,");
console.log("                               instrumentation, or Next itself).");
