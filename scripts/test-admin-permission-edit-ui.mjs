import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';

// Render the actual People component against synthetic accounts only.
const css = readFileSync('app/admin/(panel)/people/people.css', 'utf8');
const bundle = await build({ stdin: { contents: 'import React from "react"; import {createRoot} from "react-dom/client"; import {AdminPeoplePanel} from "./components/admin/AdminPeoplePanel"; createRoot(document.getElementById("root")).render(<AdminPeoplePanel/>);', resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', plugins: [{ name: 'fixture-identity', setup(builder) {
  builder.onResolve({ filter: /AdminAccessProvider$/ }, () => ({ path: 'identity', namespace: 'fixture' }));
  builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const useAdminAccess = () => ({userId:"actor", isOwner:true});' }));
} }] });
const base = { permissions: [], mailboxViewIds: [], mailboxSendIds: [], disabledAt: null, mfaEnrolledAt: '2026-01-01', invitation: null, roleId: null };
let users = [{ ...base, id: 'actor', displayName: 'Fixture administrator', email: 'actor@example.invalid', isOwner: true }, { ...base, id: 'target', displayName: 'Fixture staff', email: 'target@example.invalid', isOwner: false }];
const roles = [{ id: 'shared-role', name: 'Fixture role', permissions: ['website.manage', 'bookings.manage'], _count: { users: 1 } }];
users[1].roleId = 'shared-role';
users.push({ ...base, id: 'other-owner', displayName: 'Other administrator', email: 'other@example.invalid', isOwner: true });
const posts = [];
const server = createServer(async (request, response) => {
  if (request.url === '/api/admin/people') {
    response.setHeader('Content-Type', 'application/json');
    if (request.method === 'POST') {
      let data = ''; for await (const chunk of request) data += chunk;
      const body = JSON.parse(data); posts.push(body);
      if (body.code !== '123456') { response.statusCode = 400; response.end(JSON.stringify({ error: 'Your password or code is incorrect.' })); return; }
      Object.assign(users.find(user => user.id === body.id), body); response.end('{"ok":true}'); return;
    }
    response.end(JSON.stringify({ users, roles, events: [] })); return;
  }
  if (request.url === '/bundle.js') { response.setHeader('Content-Type', 'application/javascript'); response.end(bundle.outputFiles[0].text); return; }
  response.setHeader('Content-Type', 'text/html');
  response.end(`<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{--accent:#b5a169;--danger:#ee7777;--border:#333;--bg-primary:#171717;--bg-glass:#1d1d1d;--text-primary:#eee;--text-secondary:#aaa}*{box-sizing:border-box}body{margin:0;padding:16px;background:#101010;color:#eee}button,input,select{padding:10px;background:#222;color:#eee;border:1px solid #444}button:disabled{opacity:.4}${css}</style></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>`);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const ownerRow = page.locator('article').filter({ hasText: 'Fixture administrator' });
  const staffRow = page.locator('article').filter({ hasText: 'Fixture staff' });
  await staffRow.waitFor();
  assert.equal(await ownerRow.getByRole('button', { name: 'Edit permissions', exact: true }).isDisabled(), true);
  const invite = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Invite a person', exact: true }) });
  await invite.getByRole('checkbox', { name: 'Choose all permissions', exact: true }).check();
  assert.equal(await invite.locator('input[type=checkbox]:not(:checked)').count(), 0);
  await invite.getByRole('checkbox', { name: 'Choose all permissions', exact: true }).uncheck();
  assert.equal(await invite.locator('input[type=checkbox]:checked').count(), 0);
  const createRole = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Create a role', exact: true }) });
  await createRole.getByRole('checkbox', { name: 'Choose all role permissions', exact: true }).check();
  for (const option of await createRole.locator('select').all()) assert.equal(await option.inputValue(), 'edit');
  await createRole.getByRole('checkbox', { name: 'Choose all role permissions', exact: true }).uncheck();
  for (const option of await createRole.locator('select').all()) assert.equal(await option.inputValue(), 'hidden');
  assert.equal(posts.length, 0, 'choosing all does not save any existing account/role');
  await staffRow.getByRole('button', { name: 'Edit permissions', exact: true }).click();
  let editor = page.getByRole('region', { name: 'Permissions for Fixture staff', exact: true });
  assert.equal(await editor.getByRole('checkbox', { name: 'Website: Edit text', exact: true }).isChecked(), true);
  assert.equal(await editor.getByRole('checkbox', { name: 'Bookings: Accept bookings', exact: true }).isChecked(), true);
  assert.equal(await editor.getByRole('checkbox', { name: 'Media storage: View', exact: true }).isChecked(), false, 'editing existing website rights must not add media browsing');
  await editor.getByRole('checkbox', { name: 'Website: Edit text', exact: true }).uncheck();
  assert.equal(await editor.getByRole('checkbox', { name: 'Website: Full website settings', exact: true }).isChecked(), false);
  assert.equal(await editor.getByRole('checkbox', { name: 'Website: Edit images', exact: true }).isChecked(), true);
  await editor.getByRole('checkbox', { name: 'Choose all permissions', exact: true }).check();
  assert.equal(await editor.locator('input[type=checkbox]:not(:checked)').count(), 0);
  await editor.getByRole('checkbox', { name: 'Bookings: View', exact: true }).uncheck();
  assert.equal(await editor.getByRole('checkbox', { name: 'Bookings: Manage', exact: true }).isChecked(), false);
  assert.equal(await editor.getByRole('checkbox', { name: 'Bookings: Accept bookings', exact: true }).isChecked(), false);
  await editor.getByRole('checkbox', { name: 'View RESERVATIONS', exact: true }).uncheck();
  assert.equal(await editor.getByRole('checkbox', { name: 'Send from RESERVATIONS', exact: true }).isChecked(), false);
  await page.setViewportSize({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await editor.getByRole('button', { name: 'Save permissions', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.equal(posts.length, 0);
  await editor.getByRole('button', { name: 'Save permissions', exact: true }).click();
  await dialog.getByLabel('Your password').fill('synthetic-password');
  await dialog.getByLabel('Your code').fill('000000');
  await dialog.getByRole('button', { name: 'Confirm change', exact: true }).click();
  await dialog.getByRole('alert').waitFor();
  assert.equal(users[1].roleId, 'shared-role');
  await dialog.getByLabel('Your code').fill('123456');
  await dialog.getByRole('button', { name: 'Confirm change', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Permissions updated immediately.' }).waitFor();
  const saved = posts[1]; assert.equal(saved.action, 'set-access'); assert.equal(saved.id, 'target'); assert.equal(saved.isOwner, false); assert.equal(saved.roleId, null);
  assert.equal(saved.permissions.some(permission => permission.startsWith('bookings.')), false);
  assert.equal(saved.mailboxViewIds.includes('reservations'), false); assert.equal(saved.mailboxSendIds.includes('reservations'), false);
  assert.equal(saved.permissions.includes('website.text'), true);
  assert.deepEqual(roles[0].permissions, ['website.manage', 'bookings.manage']);
  await staffRow.getByRole('button', { name: 'Edit permissions', exact: true }).click();
  editor = page.getByRole('region', { name: 'Permissions for Fixture staff', exact: true });
  assert.equal(await editor.getByRole('checkbox', { name: 'Bookings: View', exact: true }).isChecked(), false);
  assert.equal(await editor.getByRole('checkbox', { name: 'Website: Edit text', exact: true }).isChecked(), true);
  await editor.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.locator('article').filter({ hasText: 'Other administrator' }).getByRole('button', { name: 'Edit permissions', exact: true }).click();
  const ownerEditor = page.getByRole('region', { name: 'Permissions for Other administrator', exact: true });
  assert.equal(await ownerEditor.locator('input[type=checkbox]:not(:checked)').count(), 0);
  assert.match(await ownerEditor.textContent(), /changes this administrator to a staff account/);
  assert.equal(posts.length, 2, 'opening editors never saves changes');
  assert.deepEqual(errors, []);
  console.log('PASS: choose all for invitations and roles; inline editing; inherited access removable; mailbox dependency; cancel; proof failure; save/reopen; shared roles preserved; mobile; administrator warning. Synthetic accounts only.');
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
