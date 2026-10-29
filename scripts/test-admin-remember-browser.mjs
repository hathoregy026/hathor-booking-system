/** Real login/session handlers with an in-memory database boundary. No network or live data. */
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire, Module } from 'node:module';
import { randomBytes } from 'node:crypto';
import path from 'node:path';

process.env.NODE_ENV = 'production';
process.env.ADMIN_SESSION_SECRET = randomBytes(32).toString('hex');
process.env.ADMIN_MFA_ENCRYPTION_KEY = randomBytes(32).toString('hex');
const require = createRequire(import.meta.url);
const { NextRequest } = require('next/server');
const RealDate = Date;
let now = Date.now();
globalThis.Date = class extends RealDate {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
};
let state;
const match = (row, where) => Object.entries(where ?? {}).every(([key, value]) => {
  if (key === 'OR') return value.some(condition => match(row, condition));
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return (!('not' in value) || row[key] !== value.not)
      && (!('gt' in value) || row[key] > value.gt)
      && (!('lt' in value) || row[key] < value.lt);
  }
  return row[key] === value;
});
const update = (row, data) => {
  for (const [key, value] of Object.entries(data)) row[key] = value?.increment ? row[key] + value.increment : value;
  return row;
};
const prisma = {
  adminSession: {
    create: async ({ data }) => {
      const row = { id: `session-${state.sessions.length}`, createdAt: new Date(), lastSeenAt: new Date(),
        rememberBrowser: false, mfaAttempts: 0, revokedAt: null, ...data };
      state.sessions.push(row); return { ...row };
    },
    findUnique: async ({ where }) => {
      const row = state.sessions.find(row => match(row, where));
      return row ? { ...row, user: { ...state.user } } : null;
    },
    updateMany: async ({ where, data }) => {
      const rows = state.sessions.filter(row => match(row, where));
      rows.forEach(row => update(row, data)); return { count: rows.length };
    },
    update: async ({ where, data }) => {
      const row = state.sessions.find(row => match(row, where)); assert.ok(row); return update(row, data);
    },
  },
  adminUser: {
    findUnique: async ({ where }) => match(state.user, where) ? { ...state.user } : null,
    findUniqueOrThrow: async () => ({ ...state.user }),
    update: async ({ data }) => update(state.user, data),
    updateMany: async ({ where, data }) => {
      if (!match(state.user, where)) return { count: 0 };
      update(state.user, data); return { count: 1 };
    },
  },
  adminRecoveryCode: {
    count: async () => state.recovery.length,
    updateMany: async ({ where }) => {
      const index = state.recovery.indexOf(where.codeHash);
      if (index < 0) return { count: 0 }; state.recovery.splice(index, 1); return { count: 1 };
    },
    deleteMany: async () => { state.recovery = []; },
    createMany: async ({ data }) => { state.recovery = data.map(row => row.codeHash); },
  },
  adminAuthEvent: { create: async ({ data }) => { state.events.push(data); } },
  $transaction: async operation => Array.isArray(operation) ? Promise.all(operation) : operation(prisma),
  $queryRaw: async () => [{ count: 1, resetAt: new Date(now + 60_000) }],
  $executeRaw: async () => 1,
};
globalThis.__rememberBrowserFixture = prisma;
const bundle = await build({ stdin: { resolveDir: process.cwd(), contents: `
  export * as auth from './lib/admin-auth';
  export * as crypto from './lib/admin-auth-crypto';
  export * as totp from './lib/admin-totp';
  export * as password from './lib/admin-password';
  export * as login from './app/api/admin/login/route';
  export * as mfa from './app/api/admin/login/mfa/route';
  export * as enroll from './app/api/admin/login/enroll/route';
  export * as logout from './app/api/admin/logout/route';
  export * as security from './app/api/admin/security/route';
` }, bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', plugins: [{
  name: 'no-database', setup(builder) {
    builder.onResolve({ filter: /^@\/app\/generated\/prisma\/client$/ }, args => ({ path: args.path, namespace: 'fixture' }));
    builder.onResolve({ filter: /^@\/lib\/(prisma|booking-database)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: args.path.endsWith('/client')
      ? 'import { sqltag } from "@prisma/client/runtime/client"; export const Prisma = { sql: sqltag };'
      : args.path.endsWith('/prisma')
      ? 'export const prisma = globalThis.__rememberBrowserFixture;'
      : 'export const bookingQuery = async () => { throw new Error("Database access forbidden in this fixture"); };', resolveDir: process.cwd() }));
  },
}] });
const filename = path.join(process.cwd(), 'scripts', 'remember-browser-fixture.cjs');
const compiled = new Module(filename);
compiled.filename = filename;
compiled.paths = Module._nodeModulePaths(process.cwd());
compiled._compile(bundle.outputFiles[0].text, filename);
const { auth, crypto, totp, password: passwords, ...routes } = compiled.exports;
const password = randomBytes(32).toString('base64url');
const passwordHash = await passwords.hashAdminPassword(password);
const secret = totp.generateTotpSecret();
const reset = () => {
  now = RealDate.now();
  state = { sessions: [], events: [], recovery: [], user: { id: 'fixture-user', email: 'fixture@example.invalid',
    displayName: 'Fixture person', isOwner: true, permissions: [], mailboxViewIds: [], mailboxSendIds: [], role: null,
    disabledAt: null, passwordHash, passwordChangedAt: new Date(now - 1000), mfaEnrolledAt: new Date(now - 1000),
    totpSecretEnc: crypto.encryptMfaSecret(secret, 'fixture-user'), totpPendingEnc: null, totpLastStep: null } };
};
const post = (route, body, cookie, extraHeaders = {}) => routes[route].POST(new NextRequest(`https://www.hathorcruise.com/api/admin/${route === 'login' || route === 'logout' || route === 'security' ? route : `login/${route}`}`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://www.hathorcruise.com',
    'Sec-Fetch-Site': 'same-origin', ...(cookie ? { Cookie: cookie } : {}), ...extraHeaders }, body: JSON.stringify(body),
}));
const cookieFrom = (response, name) => {
  const cookie = response.headers.getSetCookie().find(value => value.startsWith(`${name}=`));
  assert.ok(cookie); return cookie.split(';')[0];
};
const code = () => totp.hotp(totp.base32Decode(secret), totp.totpStep());
const start = async rememberBrowser => {
  const result = await post('login', { email: state.user.email, password, ...(rememberBrowser === undefined ? {} : { rememberBrowser }) });
  assert.equal(result.status, 200); return cookieFrom(result, auth.ADMIN_CHALLENGE_COOKIE);
};
const complete = async rememberBrowser => {
  const challenge = await start(rememberBrowser);
  const result = await post('mfa', { code: code() }, challenge);
  assert.equal(result.status, 200);
  const cookie = cookieFrom(result, auth.ADMIN_SESSION_COOKIE);
  const token = cookie.slice(cookie.indexOf('=') + 1);
  const row = state.sessions.find(row => row.tokenHash === crypto.readAdminToken(token, 's'));
  return { result, cookie, token, row };
};
let passed = 0;
async function check(name, run) { reset(); await run(); passed++; console.log(`PASS: ${name}`); }
try {
  await check('new logins default to seven days; invalid remember values and cross-origin requests fail', async () => {
    for (const rememberBrowser of ['true', 1, null, {}, []]) {
      assert.equal((await post('login', { email: state.user.email, password, rememberBrowser })).status, 400);
    }
    assert.equal((await post('login', { email: state.user.email, password, rememberBrowser: true }, null, { Origin: 'https://other.example' })).status, 403);
    const session = await complete(undefined);
    assert.equal(session.row.rememberBrowser, true);
    assert.equal(session.row.expiresAt.getTime() - now, 7 * 24 * 60 * 60_000);
    assert.equal(session.row.idleExpiresAt.getTime(), session.row.expiresAt.getTime());
    now += 31 * 60_000;
    assert.ok(await auth.getAdminIdentity(session.token));
  });
  await check('existing and explicitly unchecked sessions keep the thirty-minute idle limit', async () => {
    const session = await complete(false);
    assert.equal(session.row.rememberBrowser, false);
    assert.equal(session.row.expiresAt.getTime() - now, 12 * 60 * 60_000);
    assert.equal(session.row.idleExpiresAt.getTime() - now, 30 * 60_000);
    const existing = structuredClone(session.row);
    now += 30 * 60_000;
    assert.equal(await auth.getAdminIdentity(session.token), null);
    assert.equal(session.row.expiresAt.getTime(), existing.expiresAt.getTime());
    assert.equal(session.row.idleExpiresAt.getTime(), existing.idleExpiresAt.getTime());
  });
  await check('remember choice is server-side and does not bypass MFA or extend challenges', async () => {
    const challengeCookie = await start(true);
    const challengeToken = challengeCookie.slice(challengeCookie.indexOf('=') + 1);
    assert.equal(state.sessions[0].rememberBrowser, true);
    assert.equal(state.sessions[0].expiresAt.getTime() - now, 5 * 60_000);
    assert.equal(await auth.getAdminIdentity(challengeToken), null);
    assert.equal((await post('mfa', { code: 'not-a-code' }, challengeCookie)).status, 401);
    assert.equal(state.sessions.some(row => row.stage === 'ACTIVE'), false);
    assert.equal((await post('mfa', { code: code(), rememberBrowser: true }, challengeCookie)).status, 400);
    now += 5 * 60_000;
    assert.equal((await post('mfa', { code: code() }, challengeCookie)).status, 401);
  });
  await check('remembered sessions last seven fixed days through inactivity and retain secure cookies', async () => {
    const session = await complete(true);
    const deadline = now + 7 * 24 * 60 * 60_000;
    assert.equal(session.row.rememberBrowser, true);
    assert.equal(session.row.expiresAt.getTime(), deadline);
    assert.equal(session.row.idleExpiresAt.getTime(), deadline);
    const header = session.result.headers.getSetCookie().find(value => value.startsWith(`${auth.ADMIN_SESSION_COOKIE}=`));
    for (const rule of [/^__Host-/, /HttpOnly/i, /Secure/i, /SameSite=Strict/i, /Path=\//i, /Max-Age=604800/i]) assert.match(header, rule);
    assert.doesNotMatch(header, /Domain=/i);
    for (const time of [31 * 60_000, 13 * 60 * 60_000, 6 * 24 * 60 * 60_000]) {
      now = deadline - 7 * 24 * 60 * 60_000 + time;
      assert.ok(await auth.getAdminIdentity(session.token));
      assert.equal(session.row.idleExpiresAt.getTime(), deadline, 'session touch must not shrink remembered lifetime');
      assert.equal(session.row.expiresAt.getTime(), deadline, 'activity must not extend the deadline');
    }
    now = deadline;
    assert.equal(await auth.getAdminIdentity(session.token), null);
  });
  await check('unchecked activity extends idle time only up to its twelve-hour deadline', async () => {
    const session = await complete(false);
    now += 29 * 60_000;
    assert.ok(await auth.getAdminIdentity(session.token));
    assert.equal(session.row.idleExpiresAt.getTime(), now + 30 * 60_000);
    now = session.row.expiresAt.getTime() - 60_000;
    session.row.idleExpiresAt = session.row.expiresAt;
    session.row.lastSeenAt = new Date(now - 120_000);
    assert.ok(await auth.getAdminIdentity(session.token));
    assert.equal(session.row.idleExpiresAt.getTime(), session.row.expiresAt.getTime());
    now = session.row.expiresAt.getTime();
    assert.equal(await auth.getAdminIdentity(session.token), null);
  });
  await check('remember preference also survives first-time enrollment', async () => {
    state.user.mfaEnrolledAt = null; state.user.totpSecretEnc = null;
    state.user.totpPendingEnc = crypto.encryptMfaSecret(secret, state.user.id);
    const challenge = await start(true);
    const result = await post('enroll', { code: code() }, challenge);
    assert.equal(result.status, 200);
    assert.equal((await result.json()).recoveryCodes.length, 10);
    assert.ok(state.sessions.find(row => row.stage === 'ACTIVE').rememberBrowser);
    assert.match(result.headers.getSetCookie().join(';'), /Max-Age=604800/i);
  });
  await check('normal MFA request cannot upgrade an unchecked challenge', async () => {
    const challenge = await start(false);
    assert.equal((await post('mfa', { code: code(), rememberBrowser: true }, challenge)).status, 400);
    const result = await post('mfa', { code: code() }, challenge);
    assert.equal(result.status, 200);
    assert.equal(state.sessions.find(row => row.stage === 'ACTIVE').rememberBrowser, false);
  });
  await check('logout revokes a copied remembered cookie and clears browser credentials', async () => {
    const session = await complete(true);
    const result = await post('logout', {}, session.cookie);
    assert.equal(result.status, 200);
    assert.equal(await auth.getAdminIdentity(session.token), null);
    assert.equal(session.row.revokedReason, 'logout');
    assert.match(result.headers.getSetCookie().join(';'), /Max-Age=0/);
  });
  for (const [name, invalidate] of [
    ['session revocation', async session => auth.revokeAdminSession(session.row.id, 'fixture')],
    ['all-session revocation', async () => auth.revokeAllAdminSessions(state.user.id, 'fixture')],
    ['account disablement', async () => { state.user.disabledAt = new Date(); }],
    ['password change', async () => { state.user.passwordChangedAt = new Date(now + 1); }],
    ['MFA reset', async () => { state.user.mfaEnrolledAt = null; }],
  ]) await check(`${name} immediately invalidates remembered access`, async () => {
    const session = await complete(true); await invalidate(session);
    assert.equal(await auth.getAdminIdentity(session.token), null);
  });
  await check('sensitive security changes still require fresh proof after a remembered login', async () => {
    const session = await complete(true); now += 2 * 24 * 60 * 60_000;
    assert.ok(await auth.getAdminIdentity(session.token));
    assert.equal((await post('security', { action: 'regenerate-recovery-codes' }, session.cookie)).status, 400);
    assert.equal((await post('security', { action: 'regenerate-recovery-codes', code: 'wrong-code' }, session.cookie)).status, 400);
    assert.equal((await post('security', { action: 'change-password', currentPassword: 'wrong', newPassword: randomBytes(32).toString('base64url'), code: code() }, session.cookie)).status, 400);
    assert.equal((await post('security', { action: 'regenerate-recovery-codes', code: code() }, session.cookie)).status, 200);
    assert.ok(await auth.getAdminIdentity(session.token));
  });
  console.log(`${passed} isolated login/session checks passed. No database or external service contacted.`);
} finally {
  globalThis.Date = RealDate;
  delete globalThis.__rememberBrowserFixture;
}
