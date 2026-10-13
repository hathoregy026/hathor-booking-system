/** Real permissions and people/invitation tests. Disposable local DB only. */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { withLocalAdminTest, reportLocalAdminTestFailure } from "./local-admin-test.mjs";
let active = "fixture";
let count = 0;
withLocalAdminTest(async fixture => {
  const { prisma, request, crypto, userId, password, totpSecret, totp, session, rateKey, baseUrl } = fixture;
  const createdUsers = [];
  const createdRoles = [];
  const headers = { Cookie: session.cookie, "Content-Type": "application/json" };
  const check = async (name, run) => { active = name; await run(); count++; console.log("PASS: " + name); };
  const issue = async targetId => {
    const expiresAt = new Date(Date.now() + 10 * 60_000);
    const token = crypto.issueAdminToken("s", expiresAt);
    await prisma.adminSession.create({ data: { userId: targetId, tokenHash: token.tokenHash, stage: "ACTIVE", idleExpiresAt: expiresAt, expiresAt } });
    return "hathor_admin_session=" + token.token;
  };
  const proof = async () => {
    // Private fixtures can reset their clock step; replay protection is tested in the login suite.
    await prisma.adminUser.update({ where: { id: userId }, data: { totpLastStep: null } });
    await prisma.apiRateLimit.deleteMany({ where: { key: rateKey("admin-management-proof", userId) } });
    return { currentPassword: password, code: totp.hotp(totp.base32Decode(totpSecret), totp.totpStep()) };
  };
  const manage = async (body, cookie = session.cookie, withProof = true) => request("/api/admin/people", {
    method: "POST", headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, ...(withProof ? await proof() : {}) }),
  });
  const newStaff = async (roleId = null) => {
    const id = crypto.generateRecoveryCodes()[0].replace("-", "") + randomBytes(8).toString("hex");
    createdUsers.push(id);
    rateKey("admin-access-read", id);
    await prisma.adminUser.create({ data: { id, email: "staff-" + id + "@example.invalid", displayName: "Permission test person",
      passwordHash: await fixture.passwordTools.hashAdminPassword(randomBytes(32).toString("base64url")),
      roleId, totpSecretEnc: crypto.encryptMfaSecret(totpSecret, id), mfaEnrolledAt: new Date() } });
    return id;
  };
  let roleId, staffId, staffCookie;
  const beforeBookings = await prisma.booking.count();
  try {
    await check("only administrators can see people, even with a signed staff cookie", async () => {
      staffId = await newStaff();
      staffCookie = await issue(staffId);
      assert.equal((await request("/api/admin/people", { headers: { Cookie: staffCookie } })).status, 403);
      assert.equal((await manage({ action: "create-role", name: "Escalated", permissions: ["bookings.manage"] }, staffCookie)).status, 403);
      assert.equal((await request("/api/admin/security", { headers: { Cookie: staffCookie } })).status, 200);
      assert.equal((await request("/api/admin/bookings", { headers: { Cookie: staffCookie } })).status, 403);
    });
    await check("a role with no access is blocked by every protected API handler", async () => {
      const { adminApiRequirement } = await import("../lib/admin-permissions.ts");
      const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
        entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
      let checked = 0;
      for (const file of walk("app/api/admin").filter(file => file.endsWith("route.ts"))) {
        const url = "/api/admin/" + path.relative("app/api/admin", file).replaceAll("\\", "/").replace(/\/route.ts$/, "").replace(/\[[^\]]+\]/g, "missing");
        const source = readFileSync(file, "utf8");
        for (const match of source.matchAll(/export async function (GET|HEAD|POST|PUT|PATCH|DELETE)\(/g)) {
          const method = match[1];
          const requirement = adminApiRequirement(url, method);
          if (!requirement || requirement === "signed-in") continue;
          const response = await request(url, { method, headers: { Cookie: staffCookie, "Content-Type": "application/json" },
            ...(["GET", "HEAD"].includes(method) ? {} : { body: "{}" }) });
          assert.equal(response.status, 403, method + " " + url + " must deny this role");
          checked++;
        }
      }
      assert.ok(checked >= 90, "Protect every dashboard handler.");
    });
    await check("administrator changes need password and second-factor proof", async () => {
      const denied = await manage({ action: "create-role", name: "Missing proof", permissions: [] }, session.cookie, false);
      assert.equal(denied.status, 400);
      const validProof = await proof();
      for (const credentials of [
        { currentPassword: "wrong-test-passphrase", code: validProof.code },
        { currentPassword: password, code: "invalid-recovery-code" },
      ]) {
        const response = await request("/api/admin/people", { method: "POST", headers,
          body: JSON.stringify({ action: "create-role", name: "Bad proof " + userId, permissions: [], ...credentials }) });
        assert.equal(response.status, 400);
      }
      assert.equal(await prisma.adminRole.count({ where: { name: "Bad proof " + userId } }), 0);
      const result = await manage({ action: "create-role", name: "Local reader " + userId, permissions: ["website.view"] });
      assert.equal(result.status, 200);
      const role = await prisma.adminRole.findUniqueOrThrow({ where: { name: "Local reader " + userId } });
      roleId = role.id; createdRoles.push(roleId);
    });
    await check("unknown permissions and unexpected privilege fields are rejected", async () => {
      for (const body of [
        { action: "update-role", id: roleId, name: "Escalated", permissions: ["people.manage"] },
        { action: "update-role", id: roleId, name: "Escalated", permissions: ["website.view"], isOwner: true },
        { action: "update-role", id: roleId, name: "Escalated", permissions: ["website.view", "website.view"] },
      ]) assert.equal((await manage(body)).status, 400);
    });
    await check("assigning a role signs out old sessions", async () => {
      assert.equal((await manage({ action: "set-access", id: staffId, roleId, isOwner: false })).status, 200);
      assert.equal((await request("/api/admin/security", { headers: { Cookie: staffCookie } })).status, 401);
      staffCookie = await issue(staffId);
      const response = await request("/api/admin/hero-logo-tune", { headers: { Cookie: staffCookie } });
      assert.equal(response.status, 200);
      assert.equal((await request("/api/admin/hero-logo-tune", { method: "PUT", headers: { Cookie: staffCookie, "Content-Type": "application/json" }, body: "{}" })).status, 403);
      assert.equal((await request("/api/admin/bookings", { headers: { Cookie: staffCookie } })).status, 403);
    });
    await check("role edits immediately revoke affected sessions", async () => {
      assert.equal((await manage({ action: "update-role", id: roleId, name: "Local reader " + userId, permissions: ["website.view", "website.manage"] })).status, 200);
      assert.equal((await request("/api/admin/security", { headers: { Cookie: staffCookie } })).status, 401);
      staffCookie = await issue(staffId);
      // Invalid data reaches validation, proving Edit access; no settings are changed.
      assert.equal((await request("/api/admin/content", { method: "PUT", headers: { Cookie: staffCookie, "Content-Type": "application/json" }, body: "{}" })).status, 400);
    });
    await check("assigned roles cannot be deleted and administrators cannot change themselves", async () => {
      assert.equal((await manage({ action: "delete-role", id: roleId })).status, 409);
      for (const body of [{ action: "set-access", id: userId, roleId, isOwner: false },
        { action: "set-enabled", id: userId, enabled: false }, { action: "reset-mfa", id: userId }]) {
        assert.equal((await manage(body)).status, 409);
      }
      const { protectLastAdministrator, lockAdminMembership } = await import("../lib/admin-management.ts");
      await assert.rejects(prisma.$transaction(async tx => {
        await lockAdminMembership(tx); await protectLastAdministrator(tx, userId);
      }));
    });
    let inviteToken, invitedId;
    await check("invitations contain one-use fingerprints rather than plaintext secrets", async () => {
      const email = "invited-" + userId + "@example.invalid";
      const response = await manage({ action: "invite", email, displayName: "Invited test person", roleId, isOwner: false });
      assert.equal(response.status, 200);
      const result = await response.json();
      inviteToken = result.setupPath.split("=")[1];
      invitedId = (await prisma.adminUser.findUniqueOrThrow({ where: { email } })).id;
      createdUsers.push(invitedId);
      const invitation = await prisma.adminInvitation.findUniqueOrThrow({ where: { userId: invitedId } });
      assert.notEqual(invitation.tokenHash, inviteToken);
      assert.equal(invitation.tokenHash.length, 64);
      assert.ok(invitation.expiresAt > new Date());
    });
    await check("password setup consumes a link once and never grants a session", async () => {
      const newPassword = randomBytes(32).toString("base64url");
      const fingerprint = (await import("../lib/admin-management.ts")).invitationFingerprint(inviteToken);
      rateKey("admin-invitation-token", fingerprint); rateKey("admin-invitation", fixture.ip);
      const rejected = await request("/api/admin/accept-invite", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: inviteToken, displayName: "Chosen dashboard name", password: newPassword, email: "other@example.invalid" }) });
      assert.equal(rejected.status, 400);
      const body = JSON.stringify({ token: inviteToken, displayName: "Chosen dashboard name", password: newPassword });
      const responses = await Promise.all([1, 2].map(() => request("/api/admin/accept-invite", {
        method: "POST", headers: { "Content-Type": "application/json" }, body })));
      assert.deepEqual(responses.map(response => response.status).sort(), [200, 400], "Only one concurrent redemption wins.");
      assert.ok(responses.every(response => response.headers.getSetCookie().length === 0));
      assert.equal((await request("/api/admin/accept-invite", { method: "POST", headers: { "Content-Type": "application/json" }, body })).status, 400);
      const target = await prisma.adminUser.findUniqueOrThrow({ where: { id: invitedId } });
      assert.equal(target.displayName, "Chosen dashboard name");
      assert.equal(target.email, "invited-" + userId + "@example.invalid");
      assert.equal(target.roleId, roleId);
      assert.equal(target.isOwner, false);
      assert.ok(await fixture.passwordTools.verifyAdminPassword(target.passwordHash, newPassword));
      const login = await request("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target.email, password: newPassword }) });
      rateKey("admin-login-account", target.email);
      assert.equal(login.status, 200); assert.equal((await login.json()).next, "enroll");
    });
    await check("disabled accounts cannot redeem setup links; old links are replaced", async () => {
      const first = await manage({ action: "password-link", id: invitedId });
      const old = (await first.json()).setupPath.split("=")[1];
      const second = await manage({ action: "password-link", id: invitedId });
      const current = (await second.json()).setupPath.split("=")[1];
      assert.notEqual(old, current);
      const accept = token => request("/api/admin/accept-invite", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, displayName: "Chosen dashboard name", password: randomBytes(32).toString("base64url") }) });
      for (const token of [old, current]) rateKey("admin-invitation-token", (await import("../lib/admin-management.ts")).invitationFingerprint(token));
      assert.equal((await accept(old)).status, 400);
      assert.equal((await manage({ action: "set-enabled", id: invitedId, enabled: false })).status, 200);
      assert.equal((await accept(current)).status, 400);
    });
    await check("expired links cannot change a password", async () => {
      assert.equal((await manage({ action: "set-enabled", id: invitedId, enabled: true })).status, 200);
      const response = await manage({ action: "password-link", id: invitedId });
      const token = (await response.json()).setupPath.split("=")[1];
      rateKey("admin-invitation-token", (await import("../lib/admin-management.ts")).invitationFingerprint(token));
      await prisma.adminInvitation.update({ where: { userId: invitedId }, data: { expiresAt: new Date(Date.now() - 1000) } });
      const before = await prisma.adminUser.findUniqueOrThrow({ where: { id: invitedId } });
      assert.equal((await request("/api/admin/accept-invite", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, displayName: "Chosen dashboard name", password: randomBytes(32).toString("base64url") }) })).status, 400);
      assert.equal((await prisma.adminUser.findUniqueOrThrow({ where: { id: invitedId } })).passwordHash, before.passwordHash);
    });
    await check("disabling a person immediately closes their session", async () => {
      assert.equal((await manage({ action: "set-enabled", id: staffId, enabled: false })).status, 200);
      assert.equal((await request("/api/admin/security", { headers: { Cookie: staffCookie } })).status, 401);
      assert.equal((await manage({ action: "set-enabled", id: staffId, enabled: true })).status, 200);
      staffCookie = await issue(staffId);
    });
    await check("unknown roles are refused and cross-site writes are closed", async () => {
      assert.equal((await manage({ action: "set-access", id: staffId, roleId: "missing", isOwner: false })).status, 404);
      const response = await request("/api/admin/people", { method: "POST",
        headers: { ...headers, Origin: "https://example.invalid", "Sec-Fetch-Site": "cross-site" },
        body: JSON.stringify({ action: "delete-role", id: roleId, ...await proof() }) });
      assert.equal(response.status, 403);
    });
    await check("access responses and audit history contain no credentials", async () => {
      const access = await request("/api/admin/access", { headers: { Cookie: staffCookie } });
      assert.equal(access.status, 200);
      const result = await access.json();
      assert.equal(result.isOwner, false);
      assert.ok(result.permissions.includes("website.manage"));
      const people = await request("/api/admin/people", { headers });
      const text = await people.text();
      for (const value of [password, totpSecret, inviteToken, session.token]) assert.ok(!text.includes(value));
      assert.ok(!text.includes("passwordHash")); assert.ok(!text.includes("tokenHash"));
    });
    if (process.argv.includes("--browser")) {
      await check("people/roles and private setup are usable on desktop, tablet and phone", async () => {
        const { chromium } = await import("playwright");
        const browser = await chromium.launch({ channel: process.platform === "win32" ? "msedge" : undefined, headless: true });
        try {
          const context = await browser.newContext();
          await context.route("**/*", route => {
            const url = new URL(route.request().url());
            return url.origin === baseUrl ? route.continue({ headers: { ...route.request().headers(), "x-vercel-forwarded-for": fixture.ip } }) : route.abort();
          });
          await context.addCookies([{ name: "hathor_admin_session", value: session.token, domain: new URL(baseUrl).hostname, path: "/", httpOnly: true, sameSite: "Strict" }]);
          const page = await context.newPage(); const errors = [];
          page.on("pageerror", error => errors.push(error.name));
          await page.goto(baseUrl + "/admin/people"); await page.getByRole("heading", { name: "People & roles", exact: true }).waitFor();
          await page.getByLabel("Role name", { exact: true }).waitFor();
          mkdirSync("output/people-qa", { recursive: true });
          for (const [width, height] of [[1440,900], [768,1024], [1024,768], [390,844], [393,852], [430,932]]) {
            await page.setViewportSize({ width, height });
            await page.waitForTimeout(600); // Let the existing sidebar width transition settle before measuring.
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
            assert.ok(await page.getByLabel("Dashboard access", { exact: true }).isVisible());
            await page.screenshot({ path: "output/people-qa/" + width + ".png" });
          }
          await page.getByRole("button", { name: "Switch to day mode", exact: true }).click();
          for (const [width, height] of [[1440,900], [768,1024], [390,844]]) {
            await page.setViewportSize({ width, height }); await page.waitForTimeout(600);
            assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
            await page.screenshot({ path: "output/people-qa/" + width + "-day.png" });
          }
          await page.getByRole("button", { name: "Switch to night mode", exact: true }).click();
          await page.getByLabel("Role name", { exact: true }).scrollIntoViewIfNeeded();
          await page.screenshot({ path: "output/people-qa/phone-roles.png" });
          await page.getByLabel("Role name", { exact: true }).fill("Browser role " + userId);
          await page.getByLabel("Dashboard access", { exact: true }).selectOption("view");
          await page.getByRole("button", { name: "Create role", exact: true }).click();
          await page.getByRole("dialog").waitFor();
          await page.getByLabel("Your password", { exact: true }).fill(password);
          await page.getByLabel("Your code", { exact: true }).fill((await proof()).code);
          await page.getByRole("button", { name: "Confirm change", exact: true }).click();
          await page.getByRole("button", { name: "Edit Browser role " + userId, exact: true }).waitFor();
          createdRoles.push((await prisma.adminRole.findUniqueOrThrow({ where: { name: "Browser role " + userId } })).id);
          const browserEmail = "browser-" + userId + "@example.invalid";
          await page.getByLabel("Full name", { exact: true }).fill("Browser invite person");
          await page.getByLabel("Email", { exact: true }).fill(browserEmail);
          await page.getByRole("button", { name: "Create setup link", exact: true }).click();
          await page.getByLabel("Your password", { exact: true }).fill(password);
          await page.getByLabel("Your code", { exact: true }).fill((await proof()).code);
          await page.getByRole("button", { name: "Confirm change", exact: true }).click();
          await page.getByLabel("Setup link", { exact: true }).waitFor();
          const setupUrl = await page.getByLabel("Setup link", { exact: true }).inputValue();
          const browserUser = await prisma.adminUser.findUniqueOrThrow({ where: { email: browserEmail } });
          createdUsers.push(browserUser.id);
          const setupToken = setupUrl.split("=")[1];
          rateKey("admin-invitation-token", (await import("../lib/admin-management.ts")).invitationFingerprint(setupToken));
          await context.clearCookies();
          await page.goto(setupUrl);
          await page.getByLabel("New password", { exact: true }).waitFor();
          assert.equal(new URL(page.url()).hash, "");
          const setupPassword = randomBytes(32).toString("base64url");
          await page.getByLabel("New password", { exact: true }).fill(setupPassword);
          await page.getByLabel("Repeat password", { exact: true }).fill(setupPassword);
          await page.getByRole("button", { name: "Set my password", exact: true }).click();
          await page.getByRole("link", { name: "Continue to sign in", exact: true }).waitFor();
          assert.equal(await prisma.adminInvitation.count({ where: { userId: browserUser.id } }), 0);
          await context.clearCookies();
          await context.addCookies([{ name: "hathor_admin_session", value: staffCookie.split("=")[1], domain: new URL(baseUrl).hostname, path: "/", httpOnly: true, sameSite: "Strict" }]);
          await page.goto(baseUrl + "/admin/hero-logo-tune");
          assert.equal(await page.locator('a[href="/admin/bookings"]').count(), 0);
          assert.equal(await page.locator('a[href="/admin/people"]').count(), 0);
          assert.equal(await page.getByLabel("Search bookings", { exact: true }).count(), 0);
          await page.getByRole("button", { name: "Open menu", exact: true }).click();
          await page.getByRole("dialog").waitFor();
          assert.equal(await page.locator('a[href="/admin/bookings"]').count(), 0);
          assert.equal(await page.locator('a[href="/admin/people"]').count(), 0);
          await page.keyboard.press("Escape");
          await page.getByRole("dialog").waitFor({ state: "hidden" });
          await page.goto(baseUrl + "/admin/bookings");
          await page.waitForURL("**/admin/access");
          assert.equal(await page.getByRole("heading", { name: "Your dashboard access" }).isVisible(), true);
          assert.equal(errors.length, 0);
        } finally { await browser.close(); }
      });
    }
    assert.equal(await prisma.booking.count(), beforeBookings, "No booking rows changed.");
    console.log(count + " local people/permissions checks passed.");
  } finally {
    await prisma.adminAuthEvent.deleteMany({ where: { userId: { in: createdUsers } } });
    await prisma.adminUser.deleteMany({ where: { id: { in: createdUsers } } });
    await prisma.adminRole.deleteMany({ where: { id: { in: createdRoles } } });
  }
}).catch(error => { console.error("Failed check: " + active); if (typeof error.actual === "number") console.error("Received status/count: " + error.actual); reportLocalAdminTestFailure(error); });
