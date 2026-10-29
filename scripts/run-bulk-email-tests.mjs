import { build } from "esbuild";
import { spawnSync } from "node:child_process";
await build({ entryPoints: ["scripts/test-bulk-emails.ts"], outfile: ".tmp-bulk-email-tests.mjs", platform: "node", format: "esm", bundle: true, packages: "external", jsx: "automatic", logLevel: "warning", banner: { js: 'import { createRequire as testCreateRequire } from "node:module"; const require = testCreateRequire(import.meta.url);' }, plugins: [{ name: "next-node-extension", setup(build) { build.onResolve({ filter: /^next\/server$/ }, () => ({ path: "next/server.js", external: true })); } }] });
const result = spawnSync(process.execPath, [".tmp-bulk-email-tests.mjs"], { stdio: "inherit", env: { ...process.env, DATABASE_URL: "postgresql://synthetic:synthetic@localhost:5432/synthetic_test" } });
process.exitCode = result.status ?? 1;
