/**
 * Test fixtures only. Never import from application code.
 * Requires a loopback dev server and disposable DB named hathor_admin_auth_test.
 */
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { isLocalDatabase } from "../lib/database-tls.mjs";

export class LocalAdminTestError extends Error {
  constructor(message) {
    super(message);
    this.name = "LocalAdminTestError";
  }
}

export function assertLocalAdminTestEnvironment(env = process.env) {
  if (env.NODE_ENV === "production" || env.VERCEL) {
    throw new LocalAdminTestError("These helpers only run outside production and Vercel.");
  }
  let base;
  try {
    base = new URL(env.TEST_BASE_URL || "http://localhost:3000");
  } catch {
    throw new LocalAdminTestError("TEST_BASE_URL must be a loopback HTTP origin.");
  }
  if (
    base.protocol !== "http:" ||
    !["localhost", "127.0.0.1", "[::1]"].includes(base.hostname) ||
    base.port === "3847" || base.username || base.password ||
    base.pathname !== "/" || base.search || base.hash
  ) {
    throw new LocalAdminTestError("TEST_BASE_URL must be a loopback HTTP origin (port 3847 is forbidden).");
  }
  for (const name of ["DATABASE_URL", "DIRECT_URL", "DATABASE_DIRECT_URL"]) {
    const value = env[name];
    if (!value && name !== "DATABASE_URL") continue;
    let database;
    try {
      database = new URL(value);
    } catch {
      throw new LocalAdminTestError(name + " must point to the disposable local test database.");
    }
    if (
      !["postgres:", "postgresql:"].includes(database.protocol) ||
      !isLocalDatabase(value) || database.pathname !== "/hathor_admin_auth_test" ||
      database.hash ||
      [...database.searchParams.keys()].some(key =>
        !["connection_limit", "pool_timeout", "connect_timeout", "pgbouncer"].includes(key))
    ) {
      throw new LocalAdminTestError(name + " must use loopback and the database hathor_admin_auth_test, without connection overrides.");
    }
  }
  return { baseUrl: base.origin };
}

export async function localAdminTestFetch(baseUrl, pathname, options = {}) {
  const { baseUrl: checked } = assertLocalAdminTestEnvironment({ ...process.env, TEST_BASE_URL: baseUrl });
  const url = new URL(pathname, checked);
  if (url.origin !== checked) throw new LocalAdminTestError("Remote requests are forbidden.");
  const headers = new Headers(options.headers);
  if (!headers.has("Origin")) headers.set("Origin", checked);
  if (!headers.has("Sec-Fetch-Site")) headers.set("Sec-Fetch-Site", "same-origin");
  return fetch(url, { ...options, headers, redirect: "error", signal: AbortSignal.timeout(90_000) });
}

/** Creates synthetic auth rows; removes its own rows even on failure. */
export async function withLocalAdminTest(run) {
  const { config } = await import("dotenv");
  config({ path: [".env.local", ".env"], quiet: true });
  const { baseUrl } = assertLocalAdminTestEnvironment();
  await import("tsx");
  const crypto = await import("../lib/admin-auth-crypto.ts");
  crypto.assertAdminAuthConfigured();
  const passwordTools = await import("../lib/admin-password.ts");
  const totp = await import("../lib/admin-totp.ts");
  const { PrismaClient } = await import("../app/generated/prisma/client.ts");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { default: pg } = await import("pg");
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL, ssl: false, max: 2, connectionTimeoutMillis: 5_000,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool, { disposeExternalPool: false }), log: [] });
  const userId = randomUUID();
  const email = "local-" + userId + "@example.invalid";
  const password = randomBytes(32).toString("base64url");
  const totpSecret = totp.generateTotpSecret();
  const ip = "local-admin-test-" + randomUUID();
  const trackedKeys = new Set();
  const rateKey = (scope, value) => {
    const key = createHash("sha256").update(scope + ":" + value).digest("hex");
    trackedKeys.add(key);
    return key;
  };
  for (const scope of ["admin-login-ip", "admin-login-code-ip"]) rateKey(scope, ip);
  rateKey("admin-login-account", email);
  rateKey("admin-login-code-account", userId);
  for (const scope of ["admin-step-up", "admin-management-proof", "admin-people-read", "admin-access-read"]) rateKey(scope, userId);
  let created = false;
  try {
    const result = await pool.query("SELECT current_database() AS name, host(inet_server_addr()) AS address, current_setting('TimeZone') AS timezone");
    if (result.rows[0]?.name !== "hathor_admin_auth_test" ||
        !["127.0.0.1", "::1"].includes(result.rows[0]?.address)) {
      throw new LocalAdminTestError("The database did not confirm a loopback test connection.");
    }
    if (result.rows[0]?.timezone !== "UTC") {
      throw new LocalAdminTestError("The disposable PostgreSQL server must use timezone=UTC (Docker defaults to UTC).");
    }
    await prisma.adminUser.create({
      data: {
        id: userId, email, displayName: "Local test account", isOwner: true,
        passwordHash: await passwordTools.hashAdminPassword(password),
        totpSecretEnc: crypto.encryptMfaSecret(totpSecret, userId), mfaEnrolledAt: new Date(),
      },
    });
    created = true;
    const createSession = async () => {
      const expiresAt = new Date(Date.now() + 10 * 60_000);
      const { token, tokenHash } = crypto.issueAdminToken("s", expiresAt);
      const row = await prisma.adminSession.create({
        data: { tokenHash, userId, stage: "ACTIVE", idleExpiresAt: expiresAt, expiresAt },
      });
      return { token, cookie: "hathor_admin_session=" + token, id: row.id };
    };
    const request = (pathname, options = {}) => {
      const headers = new Headers(options.headers);
      headers.set("x-vercel-forwarded-for", ip);
      return localAdminTestFetch(baseUrl, pathname, { ...options, headers });
    };
    // Confirm the server uses this DB/key before any HTTP write.
    const session = await createSession();
    const probe = await request("/api/admin/security", { headers: { Cookie: session.cookie } });
    const identity = await probe.json().catch(() => null);
    if (!probe.ok || identity?.user?.email !== email ||
        !identity.sessions?.some(row => row.id === session.id && row.current)) {
      throw new LocalAdminTestError("The dev server must use the same disposable database and auth secrets.");
    }
    await run({ baseUrl, prisma, crypto, totp, passwordTools, userId, email, password,
      totpSecret, session, createSession, request, rateKey, ip,
      ipRateKeys: [rateKey("admin-login-ip", ip), rateKey("admin-login-code-ip", ip)] });
  } finally {
    try {
      if (created) {
        await prisma.$transaction([
          prisma.adminAuthEvent.deleteMany({ where: { OR: [{ userId }, { ip }] } }),
          prisma.apiRateLimit.deleteMany({ where: { key: { in: [...trackedKeys] } } }),
          prisma.adminUser.delete({ where: { id: userId } }),
        ]);
      }
    } finally {
      try { await prisma.$disconnect(); } finally { await pool.end(); }
    }
  }
}

export function reportLocalAdminTestFailure(error) {
  console.error(error instanceof LocalAdminTestError ? error.message :
    "Local test failed (" + (error instanceof Error ? error.name : "unknown error") +
    "). No credentials or response bodies are printed.");
  process.exitCode = 1;
}
