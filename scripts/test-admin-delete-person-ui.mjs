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
const posts = [];
const server = createServer(async (request, response) => {
  if (request.url === '/api/admin/people') {
    response.setHeader('Content-Type', 'application/json');
    if (request.method === 'POST') {
      let data = ''; for await (const chunk of request) data += chunk;
      const body = JSON.parse(data); posts.push(body);
      if (body.code !== '123456') { response.statusCode = 400; response.end(JSON.stringify({ error: 'Your password or code is incorrect.' })); return; }
      users = users.filter(user => user.id !== body.id); response.end('{"ok":true}'); return;
    }
    response.end(JSON.stringify({ users, roles: [], events: [] })); return;
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
  assert.equal(await ownerRow.getByRole('button', { name: 'Delete person', exact: true }).isDisabled(), true);
  await staffRow.getByRole('button', { name: 'Delete person', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('heading', { name: 'Permanently delete Fixture staff?' }).waitFor();
  assert.match(await dialog.textContent(), /cannot be undone/);
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  assert.equal(posts.length, 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await staffRow.getByRole('button', { name: 'Delete person', exact: true }).click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await dialog.getByLabel('Your password').fill('synthetic-password');
  await dialog.getByLabel('Your code').fill('000000');
  await dialog.getByRole('button', { name: 'Delete person', exact: true }).click();
  await dialog.getByRole('alert').waitFor();
  assert.equal(await staffRow.count(), 1);
  await dialog.getByLabel('Your code').fill('123456');
  await dialog.getByRole('button', { name: 'Delete person', exact: true }).click();
  await page.getByRole('status').filter({ hasText: 'Person deleted.' }).waitFor();
  assert.equal(await staffRow.count(), 0);
  assert.equal(await ownerRow.count(), 1);
  assert.deepEqual(posts[1], { action: 'delete-person', id: 'target', confirm: true, currentPassword: 'synthetic-password', code: '123456' });
  assert.deepEqual(errors, []);
  console.log('PASS: self-deletion disabled; named confirmation; cancel sends nothing; mobile layout; invalid proof retains account; confirmed deletion removes only selected person. Synthetic browser fixture only.');
} finally { await browser.close(); await new Promise(resolve => server.close(resolve)); }
