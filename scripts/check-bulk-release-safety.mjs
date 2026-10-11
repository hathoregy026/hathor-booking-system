import { readFileSync, writeFileSync } from "node:fs";
import { currentLiveDeployment, assertCurrentBaseline, inspectReleaseSource, assertSealedSource } from "./bulk-release-safety.mjs";

// Read-only Vercel GETs and local source verification. No deployment, settings,
// database or email operations. A successful check is not release approval.
const root = process.cwd();
const manifest = JSON.parse(readFileSync(".tmp-bulk-release-manifest.json", "utf8"));
const current = await currentLiveDeployment(root);
assertCurrentBaseline(manifest.baseline, current);
const source = inspectReleaseSource(root, current);
if (process.argv.includes("--seal")) {
  writeFileSync(".tmp-bulk-release-verified-source.json", JSON.stringify({ verifiedAt: new Date().toISOString(), baseline: current, sourceHashes: source.sourceHashes }, null, 2));
} else {
  const seal = JSON.parse(readFileSync(".tmp-bulk-release-verified-source.json", "utf8"));
  assertSealedSource(seal, current, source.sourceHashes);
}
console.log(JSON.stringify({ liveCommit: current.sha, liveDeployment: current.id, liveFilesPreserved: true, reviewedExistingChanges: source.changed, newFeatureFiles: source.added.length, sourceFileCount: source.fileCount, deployed: false, mailSent: false }));
