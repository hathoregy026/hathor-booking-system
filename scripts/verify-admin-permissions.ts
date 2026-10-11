import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { ADMIN_PERMISSIONS, adminApiRequirement, adminPageRequirement, hasAdminPermission, canVisitAdminPage } from "../lib/admin-permissions";
let checked = 0;
const none = { isOwner: false, permissions: [] };
for (const permission of ADMIN_PERMISSIONS) {
  assert.equal(hasAdminPermission(none, permission), false);
  assert.equal(hasAdminPermission({ isOwner: true, permissions: [] }, permission), true);
}
assert.equal(hasAdminPermission({ isOwner: false, permissions: ["administrator", "*"] }, "administrator"), false);
assert.equal(hasAdminPermission({ isOwner: false, permissions: ["bookings.view"] }, "bookings.manage"), false);
assert.equal(hasAdminPermission({ isOwner: false, permissions: ["bookings.manage"] }, "bookings.view"), true);
assert.equal(adminApiRequirement("/api/admin/future-route", "GET"), null);
assert.equal(canVisitAdminPage({ isOwner: true, permissions: [] }, "/admin/future-page"), false);
assert.equal(adminApiRequirement("/api/admin/test-email", "GET"), "templates.manage");
assert.equal(adminApiRequirement("/api/admin/email-templates/preview", "POST"), "templates.view");
assert.equal(adminApiRequirement("/api/admin/email-templates", "PUT"), "templates.manage");
function files(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
}
const publicSections = new Set(["login", "logout", "accept-invite"]);
for (const filename of files("app/api/admin").filter(file => file.endsWith("route.ts"))) {
  const relative = path.relative("app/api/admin", filename).replaceAll("\\", "/").replace(/\/route.ts$/, "");
  const section = relative.split("/")[0];
  if (publicSections.has(section)) continue;
  const source = ts.createSourceFile(filename, readFileSync(filename, "utf8"), ts.ScriptTarget.Latest, true);
  for (const statement of source.statements) {
    if (!ts.isFunctionDeclaration(statement) || !statement.name ||
        !["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"].includes(statement.name.text)) continue;
    const requirement = adminApiRequirement("/api/admin/" + relative, statement.name.text);
    assert.ok(requirement, "Mapped route: " + filename);
    let guarded = false;
    function inspect(node: ts.Node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        if (node.expression.text === "adminApiGuard") {
          assert.ok(ts.isAwaitExpression(node.parent), "Permission guard must be awaited: " + filename);
          assert.equal((node.arguments[0] as ts.StringLiteral)?.text, requirement, filename);
          guarded = true;
        }
        if (["access", "security"].includes(section) && node.expression.text === "adminIdentityFromRequest") guarded = true;
      }
      ts.forEachChild(node, inspect);
    }
    if (statement.body) inspect(statement.body);
    assert.equal(guarded, true, "Independent server guard: " + filename);
    checked++;
  }
}
for (const filename of files("app/admin/(panel)").filter(file => file.endsWith("page.tsx"))) {
  const relative = path.relative("app/admin/(panel)", filename).replaceAll("\\", "/").replace(/(^|\/)page.tsx$/, "");
  const url = "/admin" + (relative ? "/" + relative : "");
  assert.ok(adminPageRequirement(url), "Mapped page: " + filename);
  const source = readFileSync(filename, "utf8");
  assert.equal(source.startsWith('"use client"'), false, "Page must enforce access before rendering: " + filename);
  assert.ok(source.includes("requireAdminPage("), "Page guard: " + filename);
}
const actions = readFileSync("app/admin/(panel)/blogs/actions.ts", "utf8");
assert.equal((actions.match(/assertAdminSession\("blogs.manage"\)/g) ?? []).length, 3);
console.log("PASS: deny-by-default role policy, " + checked + " protected API handlers, all dashboard pages and blog actions.");
