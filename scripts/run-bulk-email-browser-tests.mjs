import { build } from "esbuild";
import { spawnSync } from "node:child_process";
await build({ entryPoints: ["scripts/test-bulk-emails-browser.ts"], outfile: ".tmp-bulk-email-browser-tests.cjs", platform: "node", format: "cjs", bundle: true, packages: "external", logLevel: "warning" });
const result = spawnSync(process.execPath, [".tmp-bulk-email-browser-tests.cjs"], { stdio: "inherit" });
process.exitCode = result.status ?? 1;
