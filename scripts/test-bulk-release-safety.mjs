import test from "node:test";
import assert from "node:assert/strict";
import { assertCurrentBaseline, assertReleaseScope, assertSealedSource } from "./bulk-release-safety.mjs";

const baseline = { id: "dpl_live", state: "READY", sha: "a".repeat(40) };
test("the actual ready live deployment must match both commit and identity", () => {
  assert.doesNotThrow(() => assertCurrentBaseline(baseline, { ...baseline }));
  assert.throws(() => assertCurrentBaseline(baseline, { ...baseline, sha: "b".repeat(40) }), /Live deployment changed/);
  assert.throws(() => assertCurrentBaseline(baseline, { ...baseline, id: "dpl_rebuilt" }), /Live deployment changed/);
  assert.throws(() => assertCurrentBaseline(baseline, { ...baseline, state: "ERROR" }), /Live deployment changed/);
});
test("deleting a live feature is blocked, even inside an allowed editor file", () => {
  assert.throws(() => assertReleaseScope({ removed: ["app/admin/(panel)/email-templates/page.tsx"], changed: [], added: [] }), /removed/);
});
test("unrelated booking, public site, migration, and authentication replacements are blocked", () => {
  for (const file of ["components/admin/LoginForm.tsx", "app/api/admin/login/route.ts", "prisma/schema.prisma", "components/booking/BookingForm.tsx", "public/hero.mp4", "app/admin/(panel)/inbox/page.tsx"]) {
    assert.throws(() => assertReleaseScope({ removed: [], changed: [file], added: [] }), /Unrelated/);
  }
});
test("login and role additions cannot silently enter a bulk-mail release", () => {
  for (const file of ["app/admin/(panel)/people/page.tsx", "lib/admin-management.ts", "lib/unrelated.ts"]) assert.throws(() => assertReleaseScope({ removed: [], changed: [], added: [file] }), /Unrelated/);
});
test("the requested bulk-mail and live editor additions are allowed", () => {
  assert.doesNotThrow(() => assertReleaseScope({ removed: [], changed: ["app/admin/(panel)/email-templates/page.tsx"], added: ["components/admin/BulkEmails.tsx", "components/admin/EmailTemplateLivePreview.tsx"] }));
});
test("any source change after verification invalidates the release", () => {
  const sourceHashes = { "old-live-feature": "unchanged", "bulk-mail": "reviewed" };
  const seal = { baseline, sourceHashes };
  assert.doesNotThrow(() => assertSealedSource(seal, baseline, sourceHashes));
  assert.throws(() => assertSealedSource(seal, baseline, { ...sourceHashes, "bulk-mail": "modified" }), /changed after verification/);
  assert.throws(() => assertSealedSource(seal, baseline, { "bulk-mail": "reviewed" }), /changed after verification/);
});
