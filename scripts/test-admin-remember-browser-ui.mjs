/** Browser checks of the actual login form with synthetic login responses only. */
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { chromium } from 'playwright';
import postcss from 'postcss';
import tailwind from '@tailwindcss/postcss';
import { createServer } from 'node:http';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const bundle = await build({ stdin: { contents: 'import React from "react"; import {createRoot} from "react-dom/client"; import {LoginForm} from "./components/admin/LoginForm"; createRoot(document.getElementById("root")).render(<LoginForm/>);',
  resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic' });
const css = await postcss([tailwind()]).process(`@import "tailwindcss" source(none);
@source "./components/admin/LoginForm.tsx";
@source "./components/admin/ThemeToggle.tsx";
${readFileSync('app/admin.css', 'utf8')}
${readFileSync('app/admin-shell.css', 'utf8')}`, { from: path.join(process.cwd(), '.tmp-login-ui.css') });
const posts = [];
const server = createServer(async (request, response) => {
  if (request.url === '/bundle.js') { response.setHeader('Content-Type', 'application/javascript'); response.end(bundle.outputFiles[0].text); return; }
  if (request.url === '/style.css') { response.setHeader('Content-Type', 'text/css'); response.end(css.css); return; }
  if (request.url === '/api/admin/login' || request.url === '/api/admin/login/mfa') {
    let data = ''; for await (const chunk of request) data += chunk;
    posts.push({ url: request.url, body: JSON.parse(data) });
    response.setHeader('Content-Type', 'application/json');
    response.end(request.url.endsWith('/mfa') ? '{"ok":true,"recoveryCodesLeft":4}' : '{"next":"code"}'); return;
  }
  if (request.url === '/admin/login') {
    response.setHeader('Content-Type', 'text/html');
    response.end('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/style.css"></head><body><div id="root"></div><script src="/bundle.js"></script></body></html>'); return;
  }
  response.statusCode = 404; response.end();
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const errors = [];
  page.on('pageerror', error => errors.push(error.name));
  await page.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
  for (const [width, height] of [[1440, 900], [768, 1024], [390, 844], [320, 640]]) {
    await page.setViewportSize({ width, height });
    await page.goto(origin + '/admin/login');
    const remember = page.getByRole('checkbox', { name: 'Remember this browser for 7 days', exact: true });
    await remember.waitFor();
    assert.equal(await remember.isChecked(), true);
    assert.equal(await remember.isVisible(), true);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    const box = await remember.locator('..').boundingBox();
    assert.ok(box.height >= 44, 'checkbox label provides a touch target');
    await remember.focus(); await page.keyboard.press('Space');
    assert.equal(await remember.isChecked(), false);
  }
  await page.getByRole('checkbox', { name: 'Remember this browser for 7 days', exact: true }).check();
  const fill = async () => {
    await page.getByLabel('Email', { exact: true }).fill('fixture@example.invalid');
    await page.getByLabel('Password', { exact: true }).fill('synthetic-password-only');
  };
  await fill();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('heading', { name: 'Two-step verification' }).waitFor();
  assert.equal(posts.at(-1).body.rememberBrowser, true);
  await page.getByLabel('Authentication code', { exact: true }).fill('123456');
  await page.getByRole('button', { name: 'Verify and sign in', exact: true }).click();
  await page.getByRole('heading', { name: 'Recovery code accepted' }).waitFor();
  assert.deepEqual(Object.keys(posts.at(-1).body), ['code'], 'MFA does not resubmit a mutable remember preference');
  await page.goto(origin + '/admin/login'); await fill();
  await page.getByRole('checkbox', { name: 'Remember this browser for 7 days', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('heading', { name: 'Two-step verification' }).waitFor();
  assert.equal(posts.at(-1).body.rememberBrowser, false);
  assert.deepEqual(errors, []);
  console.log('PASS: actual login form at desktop/tablet/390px/320px; default on; keyboard/touch access; remembered and shared-device requests; MFA retains server-side choice. Synthetic responses only.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
