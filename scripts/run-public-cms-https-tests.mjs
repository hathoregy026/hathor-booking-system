import { build } from "esbuild";
import { spawnSync } from "node:child_process";
await build({ entryPoints: ["scripts/test-public-cms-https.ts"], outfile: ".tmp-public-cms-https-tests.mjs", platform: "node", format: "esm", bundle: true, packages: "external", logLevel: "warning" });
process.exitCode = spawnSync(process.execPath, [".tmp-public-cms-https-tests.mjs"], { stdio: "inherit" }).status ?? 1;
