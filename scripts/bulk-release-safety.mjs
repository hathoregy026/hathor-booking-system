import { readFileSync, readdirSync, realpathSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";

// This scope deliberately excludes the separate login/roles branch.
export const allowedExisting = new Set([
  ".env.example", ".vercelignore", "components/admin/Header.tsx", "components/admin/Sidebar.tsx",
  "instrumentation.ts", "lib/blog-posts.ts", "lib/booking-database.ts", "lib/pg-pool.ts",
  "lib/public-cms-bundle.ts", "lib/public-cms-client.ts", "next.config.ts", "package-lock.json", "package.json",
  "app/generated/prisma/internal/class.ts", "app/generated/prisma/internal/prismaNamespace.ts",
  "app/admin/(panel)/email-templates/page.tsx", "app/api/admin/email-templates/preview/route.ts",
]);
export const allowedAdded = new Set([
  "app/admin/(panel)/bulk-emails/bulk-emails.css", "app/admin/(panel)/bulk-emails/page.tsx",
  "app/api/admin/bulk-emails/import/route.ts", "app/api/admin/bulk-emails/preview/route.ts",
  "app/api/admin/bulk-emails/route.ts", "app/api/admin/bulk-emails/[id]/preview/route.ts", "app/api/admin/bulk-emails/[id]/route.ts",
  "app/bulk-email/unsubscribe/route.ts", "components/admin/BulkEmails.tsx", "docs/bulk-email-setup.sql", "docs/bulk-emails.md", "emails/BulkMessage.tsx",
  "lib/bulk-email-api.ts", "lib/bulk-email-import.ts", "lib/bulk-email-preview.ts", "lib/bulk-email-recipient-sources.ts",
  "lib/bulk-email-render.tsx", "lib/bulk-email-service.ts", "lib/bulk-email-store.ts", "lib/bulk-email-types.ts", "lib/bulk-email-validation.ts",
  "lib/database-tls.ts", "lib/public-cms-https.ts", "lib/supabase-database-ca.ts", "scripts/bulk-email-import-worker.mjs",
  "scripts/run-bulk-email-browser-tests.mjs", "scripts/run-bulk-email-tests.mjs", "scripts/run-public-cms-https-tests.mjs",
  "scripts/test-bulk-emails-browser.ts", "scripts/test-bulk-emails.ts", "scripts/test-public-cms-https.ts", "tsconfig.bulk-emails.json",
  "components/admin/EmailTemplateLivePreview.tsx", "components/admin/email-template-editor.css", "lib/email-preview-draft.ts",
]);
export function assertCurrentBaseline(expected, current) {
  if (!/^[a-f\d]{40}$/.test(expected.sha || "") || expected.state !== "READY" ||
      current.state !== "READY" || current.id !== expected.id || current.sha !== expected.sha) {
    throw new Error("Live deployment changed. Rebuild the feature release from the current live source; never promote the older preview.");
  }
}
export async function currentLiveDeployment(root) {
  const project = JSON.parse(readFileSync(path.join(root, ".vercel/project.json"), "utf8"));
  const { token } = JSON.parse(readFileSync(path.join(process.env.APPDATA, "xdg.data/com.vercel.cli/auth.json"), "utf8"));
  if (!token) throw new Error("Vercel read access is required to verify the live baseline.");
  const get = async endpoint => {
    const url = new URL(endpoint, "https://api.vercel.com");
    url.searchParams.set("teamId", project.orgId);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`Live baseline verification failed (${response.status}).`);
    return response.json();
  };
  const aliases = await Promise.all(["www.hathorcruise.com", "hathorcruise.com"].map(alias => get(`/v4/aliases/${alias}?projectId=${project.projectId}`)));
  if (aliases.some(alias => alias.projectId !== project.projectId || alias.deploymentId !== aliases[0].deploymentId || (alias.redirect && alias.redirect !== "www.hathorcruise.com"))) throw new Error("Production domains do not identify one live deployment.");
  const live = await get(`/v13/deployments/${aliases[0].deploymentId}`);
  if (live.projectId !== project.projectId || live.target !== "production") throw new Error("Unexpected production project or target.");
  return { id: live.id, state: live.readyState, sha: live.meta?.githubCommitSha || null, url: live.url };
}
const hash = bytes => createHash("sha256").update(bytes).digest("hex");
const blobHash = bytes => createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
export function assertReleaseScope({ removed, changed, added }) {
  if (removed.length) throw new Error(`A live file was removed: ${removed.join(", ")}`);
  const unexpected = [...changed.filter(file => !allowedExisting.has(file)), ...added.filter(file => !allowedAdded.has(file))];
  if (unexpected.length) throw new Error(`Unrelated release changes blocked: ${unexpected.join(", ")}`);
}
export function inspectReleaseSource(root, baseline) {
  if (!/^[a-f\d]{40}$/.test(baseline.sha || "")) throw new Error("Invalid live commit.");
  const source = realpathSync(path.join(root, ".tmp-bulk-release-source"));
  if (path.relative(realpathSync(root), source).startsWith("..")) throw new Error("Release source escaped the project.");
  const git = args => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 25 * 1024 * 1024 });
  const entries = git(["ls-tree", "-r", "-z", baseline.sha]).split("\0").filter(Boolean);
  const baselineFiles = new Map(entries.map(entry => { const [metadata, file] = entry.split("\t"); return [file, metadata.split(" ")[2]]; }));
  const files = new Map();
  const ignored = new Set(["node_modules", ".next", ".vercel", "output"]);
  function walk(directory, prefix = "") {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = prefix + entry.name;
      if (ignored.has(entry.name) || entry.name.startsWith(".tmp-") || entry.name.endsWith("tsbuildinfo") || file === "next-env.d.ts") continue;
      if (file.startsWith(".env") && file !== ".env.example") throw new Error("Local credentials must not enter the release source.");
      const target = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Unexpected source link: ${file}`);
      if (entry.isDirectory()) walk(target, file + "/");
      else if (entry.isFile()) files.set(file, readFileSync(target));
    }
  }
  walk(source);
  const removed = [...baselineFiles.keys()].filter(file => !files.has(file));
  const changed = [...baselineFiles].filter(([file, expected]) => {
    const bytes = files.get(file);
    return bytes && blobHash(bytes) !== expected && blobHash(Buffer.from(bytes.toString("utf8").replaceAll("\r\n", "\n"))) !== expected;
  }).map(([file]) => file);
  const added = [...files.keys()].filter(file => !baselineFiles.has(file));
  assertReleaseScope({ removed, changed, added });
  // Hash every deployable source file, including unchanged live features.
  const sourceHashes = Object.fromEntries([...files].sort(([a], [b]) => a.localeCompare(b)).map(([file, bytes]) => [file, hash(bytes)]));
  return { changed, added, sourceHashes, fileCount: files.size };
}
export function assertSealedSource(seal, baseline, sourceHashes) {
  assertCurrentBaseline(seal.baseline, baseline);
  if (JSON.stringify(seal.sourceHashes) !== JSON.stringify(sourceHashes)) throw new Error("Prepared source changed after verification. Review and test it again before releasing.");
}
