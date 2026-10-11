import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { currentLiveDeployment, assertCurrentBaseline, inspectReleaseSource } from "./bulk-release-safety.mjs";
import { applyEmailEditorToRelease } from "./apply-email-editor-to-release.mjs";

// Local source preparation only. No deploy, push, migrate, or mail operations.
const root = process.cwd();
const live = JSON.parse(readFileSync(".tmp-bulk-release-live.json", "utf8"));
if (live.state !== "READY" || !/^[a-f\d]{40}$/.test(live.sha || "")) throw new Error("A verified live revision is required.");
// Re-read the actual public-domain target, including before auditing an older copy.
assertCurrentBaseline(live, await currentLiveDeployment(root));
const release = path.join(root, ".tmp-bulk-release-source");
const auditOnly = process.argv.includes("--audit-only");
if (existsSync(release) && !auditOnly) throw new Error("Release snapshot already exists; preserve it and inspect before rebuilding.");
if (!auditOnly) {
mkdirSync(release);
const archive = path.join(root, ".tmp-bulk-release-baseline.tar");
execFileSync("git", ["-c", "core.autocrlf=false", "archive", "--format=tar", `--output=${archive}`, live.sha], { stdio: "pipe" });
execFileSync("tar", ["-xf", archive, "-C", release], { stdio: "pipe" });
const copy = file => { mkdirSync(path.dirname(path.join(release, file)), { recursive: true }); cpSync(path.join(root, file), path.join(release, file), { recursive: true }); };
const bulkFiles = [
  "app/admin/(panel)/bulk-emails", "app/api/admin/bulk-emails", "app/bulk-email",
  "components/admin/BulkEmails.tsx", "emails/BulkMessage.tsx", "scripts/bulk-email-import-worker.mjs",
  "docs/bulk-email-setup.sql", "docs/bulk-emails.md", "tsconfig.bulk-emails.json",
  "scripts/test-bulk-emails.ts", "scripts/run-bulk-email-tests.mjs", "scripts/test-bulk-emails-browser.ts", "scripts/run-bulk-email-browser-tests.mjs",
  "scripts/test-public-cms-https.ts", "scripts/run-public-cms-https-tests.mjs",
  ...readdirSync(path.join(root, "lib")).filter(file => file.startsWith("bulk-email")).map(file => `lib/${file}`),
  "lib/public-cms-https.ts", "lib/public-cms-bundle.ts", "lib/blog-posts.ts",
  "lib/database-tls.ts", "lib/supabase-database-ca.ts", "lib/booking-database.ts", "lib/pg-pool.ts", "lib/public-cms-client.ts", "instrumentation.ts",
];
for (const file of bulkFiles) copy(file);
function edit(file, before, after) {
  const target = path.join(release, file);
  const text = readFileSync(target, "utf8").replaceAll("\r\n", "\n");
  if (!text.includes(before)) throw new Error(`Live source did not match the reviewed insertion: ${file}`);
  writeFileSync(target, text.replace(before, after));
}
edit("components/admin/Sidebar.tsx", "  Inbox,\n", "  Inbox,\n  Mails,\n");
edit("components/admin/Sidebar.tsx", '  { href: "/admin/inbox", label: "Emails", icon: Inbox },', '  { href: "/admin/inbox", label: "Emails", icon: Inbox },\n  { href: "/admin/bulk-emails", label: "Bulk emails", icon: Mails },');
edit("components/admin/Header.tsx", '  "/admin/inbox": { section: "Manage", title: "Emails" },', '  "/admin/inbox": { section: "Manage", title: "Emails" },\n  "/admin/bulk-emails": { section: "Manage", title: "Bulk emails" },');
const nextConfig = readFileSync(path.join(root, "next.config.ts"), "utf8");
const additions = nextConfig.match(/  \/\/ Unsubscribe URLs[\s\S]*?\n  images: \{/)[0].replace(/  images: \{$/, "");
edit("next.config.ts", "const nextConfig: NextConfig = {\n", `const nextConfig: NextConfig = {\n${additions}`);
const baselinePackage = JSON.parse(readFileSync(path.join(release, "package.json"), "utf8"));
const rootPackage = JSON.parse(readFileSync("package.json", "utf8"));
const differences = [];
for (const group of ["dependencies", "devDependencies", "scripts"]) {
  for (const [key, value] of Object.entries(rootPackage[group])) {
    if (baselinePackage[group][key] !== value) differences.push(`${group}:${key}`);
  }
  for (const key of Object.keys(baselinePackage[group])) if (!(key in rootPackage[group])) throw new Error(`Root removed a live package entry: ${group}:${key}`);
}
const allowed = new Set(["dependencies:next", "dependencies:pdfjs-dist", "dependencies:read-excel-file", "dependencies:yauzl", "devDependencies:eslint-config-next", "scripts:build"]);
if (differences.some(key => !allowed.has(key))) throw new Error(`Unrelated package differences: ${differences.join(", ")}`);
copy("package.json"); copy("package-lock.json");
const envHelp = readFileSync(".env.example", "utf8").match(/# Bulk emails defaults[\s\S]*?(?=# Receives new-booking)/)[0];
edit(".env.example", "RESEND_API_KEY=\"re_xxxxxxxx\"\n", `RESEND_API_KEY="re_xxxxxxxx"\n${envHelp}`);
edit(".vercelignore", ".env*\n", ".env*\n_tmp_*\nscripts/_tmp-*\n");
applyEmailEditorToRelease(root, release);
}
const tree = execFileSync("git", ["ls-tree", "-r", "-z", live.sha], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }).split("\0").filter(Boolean);
const blobHash = bytes => createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
const changed = [];
const tracked = new Set();
for (const entry of tree) {
  const [metadata, file] = entry.split("\t"); tracked.add(file);
  const target = path.join(release, file);
  if (!existsSync(target)) throw new Error(`Live file removed: ${file}`);
  const bytes = readFileSync(target);
  const expected = metadata.split(" ")[2];
  if (blobHash(bytes) !== expected) {
    // Git for Windows may export CRLF text. Restore only when the normalized
    // bytes exactly match the source blob; this never guesses at content.
    const normalized = Buffer.from(bytes.toString("utf8").replaceAll("\r\n", "\n"));
    if (blobHash(normalized) === expected) writeFileSync(target, normalized);
    else changed.push(file);
  }
}
const added = [];
function walk(directory, prefix = "") {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const name = prefix + entry.name;
    if (["node_modules", ".next", ".vercel", "output"].includes(entry.name) || entry.name.startsWith(".tmp-") || entry.name.endsWith("tsbuildinfo") || name === "next-env.d.ts") continue;
    if (entry.isDirectory()) walk(path.join(directory, entry.name), `${name}/`);
    else if (!tracked.has(name)) added.push(name);
  }
}
walk(release);
const protectedChanges = changed.filter(file => /^(app\/test-scroll-reveal\/|components\/booking\/|app\/api\/bookings\/|components\/pages\/|prisma\/|public\/)/.test(file));
if (protectedChanges.length) throw new Error(`A protected live feature changed: ${protectedChanges.join(", ")}`);
const migrationHashes = readdirSync(path.join(release, "prisma/migrations"), { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => {
  const bytes = readFileSync(path.join(release, "prisma/migrations", entry.name, "migration.sql"));
  return { name: entry.name, checksum: createHash("sha256").update(bytes).digest("hex") };
});
const generatedChanges = changed.filter(file => file.startsWith("app/generated/prisma/"));
const featureChanges = changed.filter(file => !file.startsWith("app/generated/prisma/"));
const allowedChanges = new Set([".env.example", ".vercelignore", "components/admin/Header.tsx", "components/admin/Sidebar.tsx", "instrumentation.ts", "lib/blog-posts.ts", "lib/booking-database.ts", "lib/pg-pool.ts", "lib/public-cms-bundle.ts", "lib/public-cms-client.ts", "next.config.ts", "package-lock.json", "package.json"]);
allowedChanges.add("app/admin/(panel)/email-templates/page.tsx");
allowedChanges.add("app/api/admin/email-templates/preview/route.ts");
if (featureChanges.some(file => !allowedChanges.has(file))) throw new Error("Unreviewed existing-file change in release copy.");
inspectReleaseSource(root, live);
const manifest = { preparedAt: new Date().toISOString(), baseline: live, sourceDirectory: release, changed: featureChanges, generatedChanges, added, migrationHashes, sendingEnabled: false, deployed: false };
writeFileSync(".tmp-bulk-release-manifest.json", JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ baseline: live.sha, changed: featureChanges, addedCount: added.length, migrationsPreserved: migrationHashes.length, sourceDirectory: release, deployed: false }));
