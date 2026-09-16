require('dotenv').config({ quiet: true });
const { chromium } = require('playwright');
const pg = require('pg');
const fs = require('fs');

/**
 * Walks the four booking screens in a real browser at desktop, tablet and phone
 * widths. It stops at the review screen: pressing Confirm Request would email
 * the reservations inbox. Every hold it takes is removed afterwards.
 */

const OUT = '_local/step5-ui';
const VIEWPORTS = [
  ['desktop', 1440, 900],
  ['tablet', 1024, 1366],
  ['phone', 390, 844],
];

const keys = [];
const problems = [];

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
      'DELETE FROM "Booking" b WHERE b."idempotencyKey" = ANY($1::text[]) AND NOT EXISTS (SELECT 1 FROM "BookingPayment" p WHERE p."bookingId" = b.id) RETURNING b.id',
      [keys],
    );
    console.log(`\ncleanup: removed ${result.rowCount} synthetic hold(s)`);
  } finally {
    await client.end().catch(() => undefined);
  }
}

async function walk(browser, label, width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on('pageerror', error => problems.push(`${label} page error: ${error.message}`));
  const shot = async name => {
    // Land where the app lands: the flow scrolls the band to the top of the
    // viewport, while filling a field can leave the page anywhere.
    await page.evaluate(() => document.getElementById('hj-band-top')?.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(350);
    await page.screenshot({ path: `${OUT}/${label}-${name}.png`, fullPage: false });
  };

  await page.goto('http://localhost:3000/booking', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Expand all' }).waitFor({ timeout: 90000 });

  // Screen 01 — journey, itinerary, dates, guests, cabins and one availability action.
  const checkButtons = await page.getByRole('button', { name: /check availability/i }).count();
  if (checkButtons !== 1) problems.push(`${label}: expected one Check availability action, found ${checkButtons}`);
  await page.locator('.hj-sailing').first().waitFor({ timeout: 60000 });
  await page.waitForTimeout(600);
  await shot('01-journey');

  // Itinerary switches with the voyage and keeps the right number of days.
  for (const [pattern, expected] of [[/3 Nights/, 4], [/4 Nights/, 5], [/7 Nights/, 8]]) {
    await page.getByRole('radio', { name: pattern }).click();
    await page.waitForTimeout(250);
    const days = await page.locator('.hj-day').count();
    if (days !== expected) problems.push(`${label}: ${pattern} showed ${days} days, expected ${expected}`);
    const open = await page.locator('.hj-day--open').count();
    if (open !== 0) problems.push(`${label}: days were not collapsed after switching voyage`);
  }

  await page.getByRole('button', { name: 'Expand all' }).click();
  await page.waitForTimeout(200);
  const expandedLinks = await page.locator('.hj-day__body a[href*="hathorcruise.com"]').count();
  if (expandedLinks === 0) problems.push(`${label}: expanded itinerary has no Hathor blog links`);
  console.log(`${label}: ${expandedLinks} Hathor links inside the expanded itinerary`);
  await shot('02-itinerary');
  await page.getByRole('button', { name: 'Collapse all' }).click();

  // Real sailing dates only.
  const sailings = page.locator('.hj-sailing');
  await sailings.first().waitFor({ timeout: 60000 });
  console.log(`${label}: ${await sailings.count()} bookable sailings offered`);
  await sailings.first().click();
  await page.getByRole('button', { name: /check availability/i }).click();

  // Screen 02 — cabins with live availability. Only the selectable cards carry
  // role=radio; the journey screen's price list is plain list items.
  await page.getByRole('heading', { name: /select your cabin or suite/i }).waitFor({ timeout: 60000 });
  const cabinTypes = await page.locator('.hj-cabin:not(.hj-cabin--static) .hj-cabin__name').allInnerTexts();
  if (cabinTypes.length !== 4) problems.push(`${label}: expected 4 cabin types, found ${cabinTypes.length}`);
  const body = await page.locator('body').innerText();
  if (/\bK0[1-6]\b|\bT0[12]\b|\bS0[12]\b|\bR0[12]\b/.test(body)) problems.push(`${label}: an internal cabin number is visible to the guest`);
  await shot('03-cabins');

  // Whichever cabin is genuinely available: earlier passes may be holding some.
  const openCabin = page.locator('.hj-cabin:not(.hj-cabin--static):not(.hj-cabin--off)').first();
  await openCabin.waitFor({ timeout: 30000 });
  console.log(`${label}: choosing ${(await openCabin.locator('.hj-cabin__name').innerText()).trim()}`);
  await openCabin.click();
  await page.getByRole('button', { name: /continue to guest details/i }).click();

  // Screen 03 — my voyage and guest details.
  await page.getByLabel(/first name/i).waitFor({ timeout: 60000 });
  const key = await page.evaluate(() => {
    try { return JSON.parse(localStorage.getItem('hathor-journey-attempt-v1'))?.key ?? null; } catch { return null; }
  });
  if (key) keys.push(key);

  await page.getByLabel(/first name/i).fill('QA');
  await page.getByLabel(/last name/i).fill('Step Five');
  await page.getByLabel(/^email/i).fill('qa-step5@example.invalid');
  await page.getByRole('textbox', { name: 'Phone *' }).fill('+201234567890');
  await page.getByLabel(/^country/i).fill('Egypt');
  const guestNames = page.getByLabel(/full name/i);
  const guestCount = await guestNames.count();
  for (let i = 0; i < guestCount; i += 1) await guestNames.nth(i).fill(`QA Guest ${i + 1}`);
  await shot('04-guest-details');

  await page.getByRole('button', { name: /continue to review/i }).click();

  // Screen 04 (pre-send) — review, payment preference, terms.
  await page.getByRole('button', { name: /confirm request/i }).waitFor({ timeout: 60000 });
  const review = (await page.locator('body').innerText()).toLowerCase();
  for (const needed of ['preferred payment method', 'visa', 'bank transfer', 'no payment is collected at this step']) {
    if (!review.includes(needed)) problems.push(`${label}: review screen is missing "${needed}"`);
  }
  const cardFields = await page.locator('input[name*="card" i], input[autocomplete*="cc-" i], input[type="password"]').count();
  if (cardFields > 0) problems.push(`${label}: review screen exposes ${cardFields} card field(s)`);
  if (!review.includes('no card number')) problems.push(`${label}: review screen does not state that no card details are collected`);
  await shot('05-review');

  console.log(`${label}: walked journey → cabin → guest details → review`);
  await page.close();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [label, width, height] of VIEWPORTS) {
      await walk(browser, label, width, height);
    }
  } catch (error) {
    problems.push(`run failed: ${error.message}`);
  } finally {
    await browser.close();
    await cleanup().catch(error => console.error('cleanup failed', error.message));
  }

  if (problems.length > 0) {
    console.error('\nPROBLEMS');
    for (const problem of problems) console.error(` - ${problem}`);
    process.exitCode = 1;
  } else {
    console.log('\nAll four screens behaved correctly at desktop, tablet and phone.');
  }
})();
