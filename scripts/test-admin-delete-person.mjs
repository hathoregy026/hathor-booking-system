import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Exercise the real management handler with isolated database/security boundaries.
// No database connection, real account or credential is used by this test.
const directory = mkdtempSync(path.join(tmpdir(), 'hathor-delete-person-'));
let state;
const actor = { id: 'actor', isOwner: true, disabledAt: null, mfaEnrolledAt: new Date(), passwordHash: 'fixture', passwordChangedAt: new Date(0) };
const target = { id: 'target', email: 'fixture@example.invalid', isOwner: false, disabledAt: null, mfaEnrolledAt: new Date(), roleId: 'shared-role' };
const reset = () => { state = { actor: { ...actor }, target: { ...target }, otherOwners: 1, passwordOk: true, codeOk: true, sessionOk: true, deleted: [], events: [], revoked: [], locks: 0, failAudit: false }; };
const tx = () => ({
  $queryRaw: async () => { state.locks++; },
  adminSession: { findUnique: async () => state.sessionOk ? { userId: 'actor', stage: 'ACTIVE', revokedAt: null, expiresAt: new Date(Date.now() + 60_000), idleExpiresAt: new Date(Date.now() + 60_000), createdAt: new Date(), user: state.actor } : null,
    updateMany: async ({ where, data }) => { assert.equal(where.userId, 'target'); assert.ok(data.revokedAt); state.revoked.push(where.userId); },
  },
  adminUser: {
    findUnique: async ({ where }) => where.id === 'actor' ? state.actor : state.target,
    count: async () => state.otherOwners,
    update: async ({ where, data }) => { assert.equal(where.id, 'target'); Object.assign(state.target, data); },
    delete: async ({ where }) => { assert.equal(where.id, 'target'); assert.ok(state.locks); state.deleted.push(where.id); state.target = null; },
  },
  adminRole: { findUnique: async () => ({ id: "shared-role" }) },
  adminAuthEvent: { create: async ({ data }) => { if (state.failAudit) throw new Error('fixture audit failure'); state.events.push(data); } },
});
globalThis.__deletePersonFixture = {
  prisma: {
    adminUser: { findUnique: async () => state.actor },
    $transaction: async callback => { const before = structuredClone(state); try { return await callback(tx()); } catch (error) { state = before; throw error; } },
  },
  verifyPassword: async () => state.passwordOk,
  verifyCode: async () => state.codeOk,
};
const mocks = {
  '@/lib/prisma': 'export const prisma = globalThis.__deletePersonFixture.prisma;',
  '@/lib/admin-auth': 'export const verifySecondFactor = (...args) => globalThis.__deletePersonFixture.verifyCode(...args); export const adminRequestContext = () => ({});',
  '@/lib/admin-password': 'export const verifyAdminPassword = (...args) => globalThis.__deletePersonFixture.verifyPassword(...args); export const hashAdminPassword = async () => "fixture"; export const displayNameError = () => null;',
  '@/lib/public-api-security': 'export const enforceKeyedRateLimit = async () => {}; export class PublicRequestError extends Error { constructor(message, status) { super(message); this.status = status; } }',
};
try {
  const output = path.join(directory, 'management.mjs');
  await build({ entryPoints: ['lib/admin-management.ts'], outfile: output, bundle: true, platform: 'node', format: 'esm', plugins: [{ name: 'isolated-boundaries', setup(builder) {
    builder.onResolve({ filter: /^@\/lib\// }, args => args.path in mocks ? { path: args.path, namespace: 'fixture' } : undefined);
    builder.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ contents: mocks[args.path], loader: 'js' }));
  } }] });
  const { managementActionSchema, administerPeople } = await import(pathToFileURL(output));
  const body = { action: 'delete-person', id: 'target', confirm: true, currentPassword: 'synthetic-password', code: '123456' };
  const run = value => administerPeople({ userId: 'actor', sessionId: 'session' }, new Request('https://example.invalid/api/admin/people'), managementActionSchema.parse(value ?? body));
  let count = 0;
  async function check(name, callback) { reset(); await callback(); count++; console.log('PASS: ' + name); }
  const deny = async status => { await assert.rejects(run(), error => error.status === status); assert.deepEqual(state.deleted, []); assert.deepEqual(state.events, []); };
  await check('deletion requires explicit confirmation and rejects extra fields', () => {
    for (const value of [{ ...body, confirm: false }, { ...body, confirm: undefined }, { ...body, isOwner: true }, { ...body, currentPassword: '' }, { ...body, code: '' }]) assert.equal(managementActionSchema.safeParse(value).success, false);
  });
  await check('staff cannot delete accounts', async () => { state.actor.isOwner = false; await deny(403); });
  await check('disabled administrator cannot delete accounts', async () => { state.actor.disabledAt = new Date(); await deny(403); });
  await check('administrator must have enrolled MFA', async () => { state.actor.mfaEnrolledAt = null; await deny(403); });
  await check('wrong password prevents deletion', async () => { state.passwordOk = false; await deny(400); });
  await check('wrong second factor prevents deletion', async () => { state.codeOk = false; await deny(400); });
  await check('session is revalidated inside membership lock', async () => { state.sessionOk = false; await deny(403); });
  await check('administrator cannot delete themselves', async () => { state.target.id = 'actor'; await deny(409); });
  await check('missing account is rejected', async () => { state.target = null; await deny(404); });
  await check('last enabled enrolled administrator is protected', async () => { state.target.isOwner = true; state.otherOwners = 0; await deny(409); });
  for (const [name, values] of [['staff', {}], ['administrator with another administrator', { isOwner: true }], ['pending invitation', { mfaEnrolledAt: null }], ['disabled administrator', { isOwner: true, disabledAt: new Date() }]]) {
    await check(name + ' can be permanently deleted and audited', async () => {
      Object.assign(state.target, values);
      assert.deepEqual(await run(), { ok: true });
      assert.equal(state.target, null); assert.deepEqual(state.deleted, ['target']);
      assert.deepEqual(state.events, [{ userId: 'actor', type: 'MANAGEMENT_DELETE_PERSON', detail: 'target' }]);
    });
  }
  await check('audit failure rolls back deletion', async () => { state.failAudit = true; await assert.rejects(run(), /fixture audit failure/); assert.deepEqual(state.deleted, []); assert.equal(state.target.id, 'target'); });
  await check('schema cascades login materials and retains historical audit/shared roles', () => {
    const schema = readFileSync('prisma/schema.prisma', 'utf8');
    const model = name => schema.match(new RegExp('model ' + name + ' \\{([\\s\\S]*?)\\n\\}'))?.[1] ?? '';
    for (const name of ['AdminSession', 'AdminInvitation', 'AdminRecoveryCode']) assert.match(model(name), /references: \[id\], onDelete: Cascade/);
    assert.match(model('AdminAuthEvent'), /references: \[id\], onDelete: SetNull/);
    assert.match(model('AdminUser'), /role\s+AdminRole\?[^\n]*onDelete: SetNull/);
  });
  await check('saved individual permissions replace role access and revoke old sessions immediately', async () => {
    const value = { action: 'set-access', id: 'target', isOwner: false, roleId: null,
      permissions: ['bookings.view', 'website.images', 'inbox.view'], mailboxViewIds: ['reservations'], mailboxSendIds: [],
      currentPassword: 'synthetic-password', code: '123456' };
    assert.deepEqual(await run(value), { ok: true });
    assert.deepEqual(state.target.permissions, value.permissions); assert.equal(state.target.roleId, null);
    assert.deepEqual(state.target.mailboxViewIds, ['reservations']); assert.deepEqual(state.target.mailboxSendIds, []);
    assert.deepEqual(state.revoked, ['target']); assert.equal(state.actor.isOwner, true);
    assert.deepEqual(state.events, [{ userId: 'actor', type: 'MANAGEMENT_SET_ACCESS', detail: 'target' }]);
  });
  await check('removing every permission still saves and revokes existing sessions', async () => {
    await run({ action: 'set-access', id: 'target', roleId: null, isOwner: false, permissions: [], mailboxViewIds: [], mailboxSendIds: [], currentPassword: 'synthetic-password', code: '123456' });
    assert.deepEqual(state.target.permissions, []); assert.deepEqual(state.revoked, ['target']);
  });
  await check('permission update rolls back if audit write fails', async () => {
    state.failAudit = true;
    await assert.rejects(run({ action: 'set-access', id: 'target', roleId: null, isOwner: false, permissions: ['bookings.view'], currentPassword: 'synthetic-password', code: '123456' }), /fixture audit failure/);
    assert.equal(state.target.roleId, 'shared-role'); assert.deepEqual(state.revoked, []);
  });
  console.log(`${count} people management checks passed. No real accounts accessed.`);
} finally { delete globalThis.__deletePersonFixture; rmSync(directory, { recursive: true, force: true }); }

