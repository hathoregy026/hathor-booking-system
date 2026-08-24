import { spawnSync } from "node:child_process";

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

run(process.execPath, ["scripts/verify-production-migration-baseline.mjs"]);

for (const migration of [
  "20250620120000_add_blog_post",
  "20250623151000_booking_list_indexes",
  "20250628120000_add_site_image",
  "20260718190000_add_site_setting",
  "20260823120000_add_booking_price_snapshots",
]) {
  run(npx, ["prisma", "migrate", "resolve", "--applied", migration]);
}

run(npx, ["prisma", "migrate", "deploy"]);
run(npm, ["run", "build"]);
