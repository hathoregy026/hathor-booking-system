/**
 * Real HTTP login/security regression; local throwaway DB only.
 * node scripts/test-admin-login-e2e.mjs [--browser]
 * See docs/admin-login.md. Never writes bookings or sends emails.
 */
import assert from "node:assert/strict";
import http from "node:http";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomBytes } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import { withLocalAdminTest, reportLocalAdminTestFailure } from "./local-admin-test.mjs";

const execFileAsync = promisify(execFile);
let activeCheck = "fixture setup";
let passed = 0;

withLocalAdminTest(async fixture => {
  const { prisma, request, userId, email, crypto, totp, createSession, rateKey } = fixture;
  let password = fixture.password;
  let secret = fixture.totpSecret;
  let recoveryCodes = [];
  let signedIn;
  const check = async (name, run) => {
    activeCheck = name;
    await run();
    passed += 1;
    console.log("PASS: " + name);
  };
  const post = (path, body, cookie) => request(path, {
    method: "POST", headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  });
  const cookieFrom = (response, name) => {
    const header = response.headers.getSetCookie().find(value => value.startsWith(name + "="));
    assert.ok(header, "Expected cookie is present.");
    return header.split(";")[0];
  };
  const security = cookie => request("/api/admin/security", { headers: { Cookie: cookie } });
  const clearLimits = async () => {
    // Only this run's fixture buckets; do not clear anyone else's counters.
    const keys = [
      rateKey("admin-login-account", email), rateKey("admin-login-code-account", userId),
      rateKey("admin-step-up", userId),
    ];
    // IP buckets are tracked internally; use the same header identity as request().
    // An unknown account never authenticates; the fixture tracks its bucket too.
    await prisma.apiRateLimit.deleteMany({ where: { key: { in: [...keys, ...fixture.ipRateKeys] } } });
  };
  const passwordStep = async () => {
    const result = await post("/api/admin/login", { email, password });
    assert.equal(result.status, 200, "Password step succeeds.");
    return { result, cookie: cookieFrom(result, "hathor_admin_challenge"), body: await result.json() };
  };
  const freshCode = async () => {
    const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: userId } });
    // Use allowed +1 drift to keep the suite fast; wait if that step was consumed.
    const last = user.totpLastStep ?? -1;
    if (last >= totp.totpStep() + 1) await delay(Math.max(1, last * 30_000 - Date.now() + 100));
    return totp.hotp(totp.base32Decode(secret), totp.totpStep() + 1);
  };
  const invalidCode = () => {
    const key = totp.base32Decode(secret);
    const step = totp.totpStep();
    const valid = new Set([-1, 0, 1].map(drift => totp.hotp(key, step + drift)));
    for (let index = 0; index < 10; index += 1) {
      const candidate = String(index).padStart(6, "0");
      if (!valid.has(candidate)) return candidate;
    }
    throw new Error("No invalid fixture code.");
  };
  const recoveryLogin = async () => {
    await clearLimits();
    const challenge = await passwordStep();
    const response = await post("/api/admin/login/mfa", { code: recoveryCodes.shift() }, challenge.cookie);
    assert.equal(response.status, 200);
    return cookieFrom(response, "hathor_admin_session");
  };

  await check("unauthenticated security endpoint is closed", async () => {
    assert.equal((await request("/api/admin/security")).status, 401);
  });
  await check("unknown account, wrong password and disabled account use the same failure", async () => {
    const unknown = "unknown-" + userId + "@example.invalid";
    rateKey("admin-login-account", unknown);
    const wrong = await post("/api/admin/login", { email, password: "wrong-test-passphrase" });
    const missing = await post("/api/admin/login", { email: unknown, password });
    await prisma.adminUser.update({ where: { id: userId }, data: { disabledAt: new Date() } });
    const disabled = await post("/api/admin/login", { email, password });
    await prisma.adminUser.update({ where: { id: userId }, data: { disabledAt: null } });
    assert.equal(wrong.status, 401);
    assert.equal(missing.status, 401);
    assert.equal(disabled.status, 401);
    assert.deepEqual(await wrong.json(), await missing.json());
    assert.deepEqual(await disabled.json(), { error: "Email or password is incorrect." });
    await clearLimits();
  });
  let enrollment;
  await check("first password sign-in only creates an enrollment challenge", async () => {
    await prisma.adminSession.deleteMany({ where: { userId } });
    await prisma.adminUser.update({ where: { id: userId }, data: {
      mfaEnrolledAt: null, totpSecretEnc: null, totpPendingEnc: null, totpLastStep: null,
    } });
    enrollment = await passwordStep();
    assert.equal(enrollment.body.next, "enroll");
    assert.equal((await security(enrollment.cookie)).status, 401);
  });
  await check("QR enrollment creates ten single-use codes and encrypts its secret", async () => {
    const qr = await request("/api/admin/login/enroll", { headers: { Cookie: enrollment.cookie } });
    assert.equal(qr.status, 200);
    const setup = await qr.json();
    assert.match(setup.qrCode, /^data:image\/svg\+xml;base64,/);
    secret = setup.manualKey.replace(/\s/g, "");
    const code = totp.hotp(totp.base32Decode(secret), totp.totpStep());
    const result = await post("/api/admin/login/enroll", { code }, enrollment.cookie);
    assert.equal(result.status, 200);
    const data = await result.json();
    recoveryCodes = data.recoveryCodes;
    assert.equal(recoveryCodes.length, 10);
    assert.equal(new Set(recoveryCodes).size, 10);
    signedIn = cookieFrom(result, "hathor_admin_session");
    fixture.enrollmentCookieHeaders = result.headers.getSetCookie();
    const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: userId } });
    assert.ok(user.mfaEnrolledAt);
    assert.notEqual(user.totpSecretEnc, secret);
    assert.equal(crypto.decryptMfaSecret(user.totpSecretEnc, userId), secret);
    assert.equal((await post("/api/admin/login/enroll", { code }, enrollment.cookie)).status, 401);
  });
  await check("session cookie is HttpOnly, Strict and backed by a fingerprint", async () => {
    const header = fixture.enrollmentCookieHeaders.find(value => value.startsWith("hathor_admin_session="));
    assert.match(header, /HttpOnly/i);
    assert.match(header, /SameSite=Strict/i);
    assert.match(header, /Path=\//i);
    const token = signedIn.slice(signedIn.indexOf("=") + 1);
    const row = await prisma.adminSession.findUniqueOrThrow({ where: { tokenHash: crypto.readAdminToken(token, "s") } });
    assert.notEqual(row.tokenHash, token);
    assert.equal(row.stage, "ACTIVE");
    assert.equal((await security(signedIn)).status, 200);
  });
  await check("challenge tokens cannot become sessions or be redeemed twice", async () => {
    const challengeToken = enrollment.cookie.slice(enrollment.cookie.indexOf("=") + 1);
    assert.equal((await security("hathor_admin_session=" + challengeToken)).status, 401);
    assert.notEqual(signedIn.split("=")[1], challengeToken);
    assert.equal((await post("/api/admin/login/mfa", { code: invalidCode() }, enrollment.cookie)).status, 401);
  });
  await check("logout revokes a copied session cookie", async () => {
    assert.equal((await post("/api/admin/logout", {}, signedIn)).status, 200);
    assert.equal((await security(signedIn)).status, 401);
  });
  await check("authenticator replay is rejected; a fresh code succeeds", async () => {
    await clearLimits();
    const challenge = await passwordStep();
    const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: userId } });
    const replay = totp.hotp(totp.base32Decode(secret), user.totpLastStep);
    assert.equal((await post("/api/admin/login/mfa", { code: replay }, challenge.cookie)).status, 401);
    const result = await post("/api/admin/login/mfa", { code: await freshCode() }, challenge.cookie);
    assert.equal(result.status, 200);
    signedIn = cookieFrom(result, "hathor_admin_session");
  });
  await check("recovery code works once only", async () => {
    await clearLimits();
    const code = recoveryCodes.shift();
    const challenge = await passwordStep();
    const result = await post("/api/admin/login/mfa", { code }, challenge.cookie);
    assert.equal(result.status, 200);
    assert.equal((await result.json()).recoveryCodesLeft, 9);
    const retry = await passwordStep();
    assert.equal((await post("/api/admin/login/mfa", { code }, retry.cookie)).status, 401);
  });
  await check("five wrong codes retire the challenge", async () => {
    await clearLimits();
    const challenge = await passwordStep();
    for (let index = 0; index < 5; index += 1) {
      const result = await post("/api/admin/login/mfa", { code: invalidCode() }, challenge.cookie);
      assert.equal(result.status, 401);
      const data = await result.json();
      if (index === 4) assert.equal(data.restart, true);
      else assert.equal(data.attemptsLeft, 4 - index);
    }
    assert.equal((await post("/api/admin/login/mfa", { code: recoveryCodes[0] }, challenge.cookie)).status, 401);
  });
  await check("account throttle blocks the sixth password attempt; CLI unlock restores it", async () => {
    await clearLimits();
    for (let index = 0; index < 5; index += 1) {
      assert.equal((await post("/api/admin/login", { email, password: "wrong-test-passphrase" })).status, 401);
    }
    const limited = await post("/api/admin/login", { email, password });
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get("retry-after")) > 0);
    await execFileAsync(process.execPath, ["--import", "tsx", "scripts/admin-users.ts", "unlock", "--email", email],
      { cwd: process.cwd(), env: process.env, timeout: 30_000 });
    assert.equal((await post("/api/admin/login", { email, password })).status, 200);
    await clearLimits();
  });
  await check("cross-site navigation bounces without granting API access", async () => {
    // fetch overwrites Sec-Fetch-Mode with "cors"; use a loopback HTTP GET
    // to reproduce the browser's real navigation headers without following redirects.
    const response = await new Promise((resolve, reject) => {
      const req = http.get(new URL("/admin/settings", fixture.baseUrl), { headers: {
        "Sec-Fetch-Site": "cross-site", "Sec-Fetch-Mode": "navigate",
      } }, result => {
        let body = "";
        result.setEncoding("utf8");
        result.on("data", chunk => {
          body += chunk;
          if (body.length > 65_536) req.destroy(new Error("Navigation response exceeds test cap."));
        });
        result.on("end", () => resolve({ status: result.statusCode, body, headers: result.headers }));
        result.on("error", reject);
      });
      req.setTimeout(90_000, () => req.destroy(new Error("Local navigation timed out.")));
      req.on("error", reject);
    });
    assert.equal(response.status, 200);
    assert.match(response.body, /http-equiv="refresh"/);
    assert.match(response.headers["cache-control"], /no-store/);
    const denied = await post("/api/admin/security", { action: "revoke-others" }, signedIn);
    assert.equal(denied.status, 200);
    assert.equal((await request("/api/admin/security", { headers: {
      Cookie: signedIn, "Sec-Fetch-Site": "cross-site",
    } })).status, 403);
  });
  await check("sign out everywhere else revokes only the other device", async () => {
    const first = await recoveryLogin();
    const second = await recoveryLogin();
    const response = await post("/api/admin/security", { action: "revoke-others" }, first);
    assert.equal(response.status, 200);
    assert.ok((await response.json()).revoked >= 1);
    assert.equal((await security(first)).status, 200);
    assert.equal((await security(second)).status, 401);
  });
  await check("idle timeout invalidates an otherwise signed cookie", async () => {
    const session = await createSession();
    await prisma.adminSession.update({ where: { id: session.id }, data: { idleExpiresAt: new Date(Date.now() - 1_000) } });
    assert.equal((await security(session.cookie)).status, 401);
  });
  await check("tampered session cookie is refused", async () => {
    const session = await createSession();
    const token = session.token.slice(0, -2) + (session.token.endsWith("aa") ? "bb" : "aa");
    assert.equal((await security("hathor_admin_session=" + token)).status, 401);
  });
  await check("password change needs both proofs and signs out every session", async () => {
    await clearLimits();
    const first = await createSession();
    const second = await createSession();
    const nextPassword = randomBytes(32).toString("base64url");
    const code = recoveryCodes.shift();
    assert.equal((await post("/api/admin/security", {
      action: "change-password", currentPassword: "wrong-test-passphrase", newPassword: nextPassword, code,
    }, first.cookie)).status, 400);
    assert.equal((await post("/api/admin/security", {
      action: "change-password", currentPassword: password, newPassword: nextPassword, code: invalidCode(),
    }, first.cookie)).status, 400);
    assert.equal((await post("/api/admin/security", {
      action: "change-password", currentPassword: password, newPassword: nextPassword, code,
    }, first.cookie)).status, 200);
    assert.equal((await security(first.cookie)).status, 401);
    assert.equal((await security(second.cookie)).status, 401);
    assert.equal((await post("/api/admin/login", { email, password })).status, 401);
    password = nextPassword;
    await passwordStep();
  });
  await check("disabling an account immediately invalidates its session", async () => {
    const session = await createSession();
    await prisma.adminUser.update({ where: { id: userId }, data: { disabledAt: new Date() } });
    assert.equal((await security(session.cookie)).status, 401);
    assert.equal((await post("/api/admin/login", { email, password })).status, 401);
    await prisma.adminUser.update({ where: { id: userId }, data: { disabledAt: null } });
  });
  await check("audit events contain no passwords, codes or cookie tokens", async () => {
    const events = await prisma.adminAuthEvent.findMany({ where: { userId } });
    assert.ok(events.some(event => event.type === "PASSWORD_CHANGED"));
    assert.ok(events.some(event => event.type === "MFA_ENROLLED"));
    const serialized = JSON.stringify(events);
    for (const value of [password, fixture.password, secret, signedIn.split("=")[1], ...recoveryCodes]) {
      assert.ok(!serialized.includes(value), "Audit records never include credentials.");
    }
  });

  if (process.argv.includes("--browser")) {
    await check("desktop, tablet and phone show the real enrollment and saved-code flow", async () => {
      await clearLimits();
      await prisma.adminUser.update({ where: { id: userId }, data: {
        mfaEnrolledAt: null, totpSecretEnc: null, totpPendingEnc: null, totpLastStep: null,
      } });
      const { chromium } = await import("playwright");
      const browser = await chromium.launch({ channel: "msedge", headless: true });
      try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
        const errors = [];
        page.on("pageerror", error => errors.push(error.name));
        await page.route("**/*", route => {
          const url = new URL(route.request().url());
          if (url.protocol === "http:" && url.origin === fixture.baseUrl) return route.continue({ headers: { ...route.request().headers(), "x-vercel-forwarded-for": fixture.ip } });
          return route.abort();
        });
        await page.goto(fixture.baseUrl + "/admin/login");
        await page.getByLabel("Email", { exact: true }).fill(email);
        await page.getByLabel("Password", { exact: true }).fill(password);
        await page.getByRole("button", { name: "Continue", exact: true }).click();
        await page.getByRole("img", { name: /QR code/ }).waitFor();
        for (const [width, height] of [[1440, 900], [768, 1024], [390, 844]]) {
          await page.setViewportSize({ width, height });
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
          assert.equal(await page.getByRole("img", { name: /QR code/ }).isVisible(), true);
          assert.equal(await page.getByLabel("Code from your app").isVisible(), true);
        }
        const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: userId } });
        const pending = crypto.decryptMfaSecret(user.totpPendingEnc, userId);
        await page.getByLabel("Code from your app").fill(totp.hotp(totp.base32Decode(pending), totp.totpStep()));
        await page.getByRole("button", { name: "Confirm and continue", exact: true }).click();
        await page.getByRole("list", { name: "Recovery codes" }).waitFor();
        assert.equal(await page.getByRole("list", { name: "Recovery codes" }).getByRole("listitem").count(), 10);
        assert.equal(await page.getByRole("button", { name: "Go to the dashboard", exact: true }).isEnabled(), false);
        await page.getByRole("checkbox").check();
        assert.equal(await page.getByRole("button", { name: "Go to the dashboard", exact: true }).isEnabled(), true);
        assert.equal(errors.length, 0);
      } finally {
        await browser.close();
      }
    });
  }
  console.log(String(passed) + " local login/security checks passed.");
}).catch(error => {
  console.error("Failed check: " + activeCheck);
  if (typeof error.actual === "number" && typeof error.expected === "number") {
    console.error("Expected status/count: " + error.expected + "; received: " + error.actual);
  }
  const location = error.stack?.split("\n").find(line => line.trim().startsWith("at ") && line.includes("test-admin-login-e2e.mjs:"));
  if (location) console.error(location.trim());
  reportLocalAdminTestFailure(error);
});
