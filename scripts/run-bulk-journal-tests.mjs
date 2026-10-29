import { build } from "esbuild";
import { spawnSync } from "node:child_process";

await build({ entryPoints: ["scripts/test-bulk-journal.ts"], outfile: ".tmp-bulk-journal-tests.mjs", platform: "node", format: "esm", bundle: true, packages: "external", jsx: "automatic", logLevel: "warning", banner: { js: 'import { createRequire as testRequire } from "node:module"; const require = testRequire(import.meta.url);' } });
const result = spawnSync(process.execPath, [".tmp-bulk-journal-tests.mjs"], { stdio: "inherit", windowsHide: true, env: { ...process.env, SUPABASE_URL: "https://bulk-test.supabase.co", DATABASE_URL: "postgresql://synthetic:synthetic@localhost:55439/synthetic_test" } });
process.exitCode = result.status ?? 1;
