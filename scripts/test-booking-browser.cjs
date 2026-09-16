require('dotenv').config({ quiet: true });
const { chromium } = require('playwright');
const pg = require('pg');
const fs = require('fs');

/**
 * Walks the booking journey in a real browser at desktop, tablet (night mode)
 * and phone widths: journey → guests & suites → details → Confirm request.
 *
 * - Every free cabin is listed, and the filter shows every free cabin of a type.
 * - Guests move by drag (desktop, tablet) or tap (phone), and by the menus.
 * - The cart checks availability, and continuing from it resumes the booking.
 * - Nothing is held before Confirm request. At Confirm the real hold runs, the
 *   request call is made to fail so no email is sent, and the page must release
 *   the hold at once. Every hold the walk creates is deleted afterwards.
 */

const OUT = '_local/step5-ui';
const VIEWPORTS = [
  ['desktop', 1440, 900, 'drag', 'day'],
  ['tablet', 1024, 1366, 'drag', 'night'],
  ['phone', 390, 844, 'tap', 'day'],
];

const keys = [];
const problems = [];

/** Deletes this run's holds, so each viewport starts from the same free cabins. */
async function cleanup() {
  if (keys.length === 0) return;
  const client = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    query_timeout: 15000,
  });
  try {
    await client.connect();
    const result = await client.query(
      'DELETE FROM "Booking" b WHERE b."idempotencyKey" = ANY($1::text[]) AND b.status IN (\'PENDING_HOLD\', \'EXPIRED\') AND NOT EXISTS (SELECT 1 FROM "BookingPayment" p WHERE p."bookingId" = b.id) RETURNING b.id',
      [keys],
    );
    console.log(`cleanup: removed ${result.rowCount} synthetic hold(s)`);
    keys.length = 0;
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function centre(locator) {
  await locator.evaluate(element => element.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await locator.page().waitForTimeout(200);
}

async function dragTo(page, source, target) {
  await centre(source);
  const from = await source.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) throw new Error('drag source or target is not on screen');
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 12, from.y + from.height / 2 + 8, { steps: 3 });
  await page.mouse.move(to.x + to.width / 2, to.y + Math.min(40, to.height / 2), { steps: 14 });
  await page.mouse.up();
  await page.waitForTimeout(250);
}

async function walk(browser, label, width, height, mode, theme) {
  const context = await browser.newContext({ viewport: { width, height } });
  await context.addInitScript(value => { try { localStorage.setItem('hathor-public-theme', value); } catch {} }, theme);
  const page = await context.newPage();
  page.on('pageerror', error => problems.push(`${label} page error: ${error.message.split('\n')[0]}`));
  const holdCalls = [];
  const releaseCalls = [];
  page.on('request', request => {
    if (request.method() !== 'POST') return;
    if (request.url().includes('/api/bookings/hold')) {
      holdCalls.push({ key: request.headers()['idempotency-key'], body: request.postDataJSON() });
      if (request.headers()['idempotency-key']) keys.push(request.headers()['idempotency-key']);
    }
    if (request.url().includes('/api/bookings/release')) releaseCalls.push(request);
  });
  const shot = async name => {
    await page.evaluate(() => document.getElementById('hj-folio-top')?.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${OUT}/${label}-${name}.png`, fullPage: false });
  };
  const guideItems = async () => page.locator('.hj-guide:visible .hj-guide__item').count();

  // Step 1 — journey.
  await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Expand all' }).waitFor({ timeout: 90000 });
  await page.locator('.hj-sailing').first().waitFor({ timeout: 60000 });
  if ((await guideItems()) !== 3) problems.push(`${label}: journey step should show a 3-point map`);
  for (const [pattern, expected] of [[/3 Nights/, 4], [/4 Nights/, 5], [/7 Nights/, 8]]) {
    await page.getByRole('radio', { name: pattern }).click();
    await page.waitForTimeout(250);
    const days = await page.locator('.hj-day').count();
    if (days !== expected) problems.push(`${label}: ${pattern} showed ${days} days, expected ${expected}`);
  }
  await page.locator('.hj-sailing').first().waitFor({ timeout: 60000 });
  await page.locator('.hj-sailing').first().click();
  await shot('01-journey');
  await page.getByRole('button', { name: /continue to guests & suites/i }).click();

  // Step 2 — guests & suites.
  await page.getByRole('heading', { name: /select your cabin or suite/i }).waitFor({ timeout: 60000 });
  if ((await guideItems()) !== 3) problems.push(`${label}: guests & suites step should show a 3-point map`);

  const allCount = Number(await page.getByRole('button', { name: /^All rooms/ }).locator('.hj-filter__count').innerText());
  const cabinCards = page.locator('.hj-cab');
  if ((await cabinCards.count()) !== allCount) problems.push(`${label}: All rooms lists ${await cabinCards.count()} cabins, expected every free cabin (${allCount})`);
  if (allCount <= 4) problems.push(`${label}: expected more free cabins than the 4 room types, found ${allCount}`);
  const kingPill = page.getByRole('button', { name: /^King Cabin/ });
  const kingCount = Number(await kingPill.locator('.hj-filter__count').innerText());
  await kingPill.click();
  if ((await cabinCards.count()) !== kingCount) problems.push(`${label}: King Cabin filter lists ${await cabinCards.count()} cabins, expected ${kingCount}`);
  await page.getByRole('button', { name: /^All rooms/ }).click();
  if ((await cabinCards.count()) !== allCount) problems.push(`${label}: All rooms did not restore every cabin`);

  const types = await page.locator('.hj-rtype').count();
  if ((await page.locator('.hj-rtype .hathor-fav').count()) !== types) problems.push(`${label}: every room type should have a favourite button`);
  if ((await page.locator('.hj-rtype .hathor-atv').count()) !== types) problems.push(`${label}: every room type should have a cart button`);
  const body = await page.locator('body').innerText();
  if (/\bK0[1-6]\b|\bT0[12]\b|\bS0[12]\b|\bR0[12]\b/.test(body)) problems.push(`${label}: an internal cabin number is visible to the guest`);

  // 3 adults and 2 children, arranged automatically.
  await page.getByRole('button', { name: 'One more adults' }).first().click();
  await page.getByRole('button', { name: 'One more children' }).first().click();
  await page.getByRole('button', { name: 'One more children' }).first().click();
  await page.waitForTimeout(300);
  if ((await page.locator('.hj-cab .hj-tile').count()) !== 5) problems.push(`${label}: expected 5 guests arranged into cabins`);
  await shot('02-guests-suites');

  // Move Adult 1 into Twin Cabin 1 — by dragging, or by tapping on a phone.
  const twinOne = page.locator('.hj-cab[aria-label^="Twin Cabin 1,"]');
  const adultOne = page.locator('.hj-cab .hj-tile[data-guest="adult-1"]');
  if (mode === 'drag') {
    await centre(twinOne);
    await dragTo(page, adultOne, twinOne);
  } else {
    await centre(adultOne);
    await adultOne.click();
    await page.getByRole('button', { name: 'Place Adult 1 in Twin Cabin 1' }).click();
  }
  await page.waitForTimeout(300);
  if ((await twinOne.locator('.hj-tile[data-guest="adult-1"]').count()) !== 1) problems.push(`${label}: Adult 1 did not land in Twin Cabin 1 (${mode})`);

  // The menus do the same: out of Twin Cabin 1, then back in.
  const twinAdults = page.getByRole('combobox', { name: 'Adults in Twin Cabin 1' });
  await centre(twinAdults);
  await twinAdults.selectOption('0');
  await page.waitForTimeout(200);
  if ((await page.locator('.hj-pool:visible .hj-tile').count()) !== 1) problems.push(`${label}: lowering the Adults menu did not send a guest back to wait`);
  await twinAdults.selectOption('1');
  await page.waitForTimeout(200);
  if ((await twinOne.locator('.hj-tile').count()) !== 1) problems.push(`${label}: raising the Adults menu did not place the waiting guest`);
  const continueDetails = page.getByRole('button', { name: /continue to details/i });
  if (await continueDetails.isDisabled()) problems.push(`${label}: Continue stayed disabled after valid moves`);
  await centre(twinOne);
  await page.screenshot({ path: `${OUT}/${label}-03-cabins-moved.png`, fullPage: false });

  // Cart: checks live availability, then keeps sailing and party.
  if (label === 'desktop') {
    const availabilityChecks = [];
    const listener = request => { if (request.url().includes('/api/booking/availability')) availabilityChecks.push(request.url()); };
    page.on('request', listener);
    const cart = page.locator('.hj-rtype[aria-label="Luxury Twin Cabin"] .hathor-atv');
    await centre(cart);
    await cart.click();
    await page.waitForFunction(() => {
      try { return JSON.parse(localStorage.getItem('hathor:voyage:v2'))?.residenceSlug === 'luxury-twin-room'; } catch { return false; }
    }, null, { timeout: 30000 }).catch(() => problems.push('desktop: the Twin Cabin never reached the cart'));
    page.off('request', listener);
    if (availabilityChecks.length === 0) problems.push('desktop: the cart added a cabin without checking availability');
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('hathor:voyage:v2') || '{}'));
    if (!saved.sailingDate || saved.adults !== 3 || saved.children !== 2) problems.push(`desktop: the cart did not keep the sailing and party (${JSON.stringify(saved)})`);
    await page.screenshot({ path: `${OUT}/desktop-04-cart.png`, fullPage: false });
    const resume = page.getByRole('button', { name: 'Continue Booking' });
    await resume.waitFor({ timeout: 10000 });
    await resume.click();
    await page.waitForURL(/\/booking\?.*sailing=/, { timeout: 30000 });
    await page.getByRole('heading', { name: /select your cabin or suite/i }).waitFor({ timeout: 90000 });
    await page.waitForTimeout(500);
    if ((await page.locator('.hj-cab .hj-tile').count()) !== 5) problems.push('desktop: continuing from the cart did not bring the party of 5');
    if ((await page.locator('.hj-rtype[aria-label="Luxury Twin Cabin"] .hj-cab--used').count()) === 0) problems.push('desktop: continuing from the cart did not use the Twin Cabin from the cart');
    await shot('05-resumed-from-cart');
  }

  await page.getByRole('button', { name: /continue to details/i }).click();

  // Step 3 — details and payment.
  await page.getByLabel(/first name/i).waitFor({ timeout: 60000 });
  if ((await guideItems()) !== 4) problems.push(`${label}: details step should show a 4-point map`);
  if (holdCalls.length > 0) problems.push(`${label}: a cabin was held before the guest confirmed`);
  const nameFields = page.getByLabel(/full name/i);
  if ((await nameFields.count()) !== 5) problems.push(`${label}: expected 5 passenger name fields, found ${await nameFields.count()}`);
  await page.getByLabel(/first name/i).fill('QA');
  await page.getByLabel(/last name/i).fill('Allocation');
  await page.getByLabel(/^email/i).fill('qa-allocation@example.invalid');
  await page.getByRole('textbox', { name: 'Phone *' }).fill('+201234567890');
  await page.getByLabel(/^country/i).fill('Egypt');
  for (let i = 0; i < 5; i += 1) await nameFields.nth(i).fill(`QA Guest ${i + 1}`);
  await page.getByRole('checkbox', { name: /booking and cancellation terms/i }).check();
  if ((await page.locator('.hj-guide__item--done').count()) !== 3) problems.push(`${label}: the details map did not tick the three finished parts`);
  await shot('06-details');

  // Confirm: a real hold, a failed request (no email), and an immediate release.
  let confirmBody = null;
  await page.route('**/api/bookings/confirm', async route => {
    confirmBody = route.request().postDataJSON();
    await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'QA stop: the request was not sent.' }) });
  });
  const released = page.waitForResponse(response => response.url().includes('/api/bookings/release'), { timeout: 60000 }).catch(() => null);
  await page.getByRole('button', { name: /confirm request/i }).click();
  await page.getByText(/QA stop: the request was not sent\. Nothing is being held/).waitFor({ timeout: 60000 });
  const release = await released;
  if (holdCalls.length !== 1) problems.push(`${label}: expected exactly one hold at Confirm, saw ${holdCalls.length}`);
  if (!release) {
    problems.push(`${label}: the hold was not released after the request failed`);
  } else {
    const result = await release.json().catch(() => ({}));
    if (result.status !== 'EXPIRED') problems.push(`${label}: releasing the hold returned ${result.status}`);
  }
  if (!confirmBody) {
    problems.push(`${label}: Confirm request never reached the request call`);
  } else {
    const held = holdCalls[0]?.body.rooms ?? [];
    const adults = held.reduce((sum, room) => sum + room.adults, 0);
    const children = held.reduce((sum, room) => sum + room.children, 0);
    if (adults !== 3 || children !== 2) problems.push(`${label}: hold asked for ${adults} adults and ${children} children`);
    if (!held.some(room => room.roomType === 'Luxury Twin Cabin')) problems.push(`${label}: the Twin Cabin is missing from the hold`);
    const byRoom = confirmBody.passengers.reduce((map, passenger) => map.set(passenger.roomIndex, (map.get(passenger.roomIndex) ?? 0) + 1), new Map());
    held.forEach((room, index) => {
      if ((byRoom.get(index) ?? 0) !== room.adults + room.children) problems.push(`${label}: passengers for room ${index} do not match the hold`);
    });
  }

  console.log(`${label} (${theme}): ${allCount} free cabins listed; guests moved by ${mode} and menus; hold at confirm released (${releaseCalls.length})`);
  await context.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const stale of fs.readdirSync(OUT)) fs.rmSync(`${OUT}/${stale}`);
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [label, width, height, mode, theme] of VIEWPORTS) {
      try {
        await walk(browser, label, width, height, mode, theme);
      } finally {
        await cleanup().catch(error => problems.push(`cleanup failed: ${error.message}`));
      }
    }
  } catch (error) {
    problems.push(`run failed: ${error.message.split('\n').slice(0, 8).join(' | ')}`);
  } finally {
    await browser.close();
  }

  if (problems.length > 0) {
    console.error('\nPROBLEMS');
    for (const problem of problems) console.error(` - ${problem}`);
    process.exitCode = 1;
  } else {
    console.log('\nThe booking journey behaved correctly at desktop, tablet and phone.');
  }
})();
