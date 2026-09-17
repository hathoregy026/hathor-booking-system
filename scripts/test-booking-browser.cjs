require('dotenv').config({ quiet: true });
const { chromium } = require('playwright');
const pg = require('pg');
const fs = require('fs');

/**
 * Walks the booking journey in a real browser at desktop, tablet (night mode)
 * and phone widths: journey → guests & suites → details → Confirm request.
 *
 * - All 12 cabins are listed, each its own card; a type filter lists that type's cabins.
 * - Guests are created in Who Is Travelling, then placed by drag (desktop, tablet),
 *   tap (phone) or a cabin's menus — one shared count that never passes the cabin's limit.
 * - Arrange for me asks which cabin types to use.
 * - The country menu opens below its field, inside the window, and supplies the phone code.
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

/** On tablet/phone, cabins after the first of a type sit behind a collapsed
 *  toggle; open it before touching one. No-op on desktop, where the toggle
 *  is hidden and every cabin is already shown. */
async function expandCabinGroup(page, typeNamePattern) {
  const toggle = page.locator('.hj-cabin-more__toggle').filter({ hasText: typeNamePattern });
  if ((await toggle.count()) > 0 && (await toggle.first().isVisible())) {
    await centre(toggle.first());
    await toggle.first().click();
    await page.waitForTimeout(250);
  }
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

  // Cabin collapse: desktop keeps every cabin flat (a display:contents group
  // reports a zero-size rect); tablet/phone collapse cabins after the first
  // of a type into a "N more" toggle, closed by default.
  const collapseState = await page.evaluate(() => Array.from(document.querySelectorAll('.hj-cabin-more')).map(group => {
    const list = group.querySelector('.hj-cabin-more__list');
    const input = group.querySelector('.hj-cabin-more__input');
    return { checked: input ? input.checked : null, listHeight: list ? list.getBoundingClientRect().height : null };
  }));
  if (label === 'desktop') {
    if (collapseState.some(group => group.listHeight !== 0)) problems.push(`${label}: desktop should render every cabin flat, not behind a toggle (${JSON.stringify(collapseState)})`);
  } else {
    if (collapseState.length !== 4) problems.push(`${label}: expected 4 collapsible cabin groups (King, Twin, Luxury Suite, Royal Suite), found ${collapseState.length}`);
    if (collapseState.some(group => group.checked || group.listHeight > 0)) problems.push(`${label}: extra cabins should start collapsed (${JSON.stringify(collapseState)})`);
  }

  const allCount = Number(await page.getByRole('button', { name: /^All rooms/ }).locator('.hj-filter__count').innerText());
  const cards = page.locator('.hj-cabin-card');
  if (allCount !== 12 || (await cards.count()) !== 12) problems.push(`${label}: All rooms should list all 12 cabins (badge ${allCount}, cards ${await cards.count()})`);
  await page.getByRole('button', { name: /^King Cabin/ }).click();
  const kingCards = await cards.count();
  const onlyKings = await cards.evaluateAll(list => list.every(card => card.getAttribute('aria-label').startsWith('Luxury King Cabin')));
  if (kingCards !== 6 || !onlyKings) problems.push(`${label}: the King Cabin filter should list its 6 cabins, found ${kingCards}`);
  await page.getByRole('button', { name: /^All rooms/ }).click();
  if ((await cards.count()) !== 12) problems.push(`${label}: All rooms did not bring back all 12 cabins`);
  if ((await page.locator('.hj-cabin-card .hathor-fav').count()) !== 12) problems.push(`${label}: every cabin card should have a favourite button`);
  if ((await page.getByRole('button', { name: /add another/i }).count()) !== 0) problems.push(`${label}: an Add another button is still shown`);
  const body = await page.locator('body').innerText();
  if (/\bK0[1-6]\b|\bT0[12]\b|\bS0[12]\b|\bR0[12]\b/.test(body)) problems.push(`${label}: an internal cabin number is visible to the guest`);

  // Guests are created in Who Is Travelling and wait there.
  const poolTiles = page.locator('.hj-pool:visible .hj-tile');
  await page.getByRole('button', { name: 'One more adults' }).first().click();
  await page.getByRole('button', { name: 'One more children' }).first().click();
  await page.getByRole('button', { name: 'One more children' }).first().click();
  await page.waitForTimeout(300);
  if ((await poolTiles.count()) !== 5) problems.push(`${label}: 3 adults and 2 children should wait in Who Is Travelling, found ${await poolTiles.count()}`);
  if ((await page.locator('.hj-cabin-card .hj-tile').count()) !== 0) problems.push(`${label}: guests were placed without the guest placing them`);
  await shot('02-guests-waiting');

  // One shared count: Adult 1 dragged (or tapped) into King Cabin 3, then its menu set to 2.
  await expandCabinGroup(page, /King Cabin/);
  if (label !== 'desktop') {
    const kingGroupHeight = await page.evaluate(() => document.querySelector('.hj-cabin-more')?.querySelector('.hj-cabin-more__list')?.getBoundingClientRect().height ?? 0);
    if (kingGroupHeight <= 0) problems.push(`${label}: opening "more King Cabins" did not reveal the rest of the type`);
  }
  const kingThree = page.locator('.hj-cabin-card[aria-label^="Luxury King Cabin, cabin 3,"]');
  const placeInto = async (guestId, card, cardName) => {
    if (mode === 'drag') {
      await centre(card);
      await dragTo(page, page.locator(`.hj-pool:visible .hj-tile[data-guest="${guestId}"]`), card);
    } else {
      const tile = page.locator(`.hj-tile[data-guest="${guestId}"]:visible`).first();
      await centre(tile);
      await tile.click();
      const place = page.getByRole('button', { name: `Place ${guestId.replace('adult-', 'Adult ').replace('child-', 'Child ')} in ${cardName}` });
      if (await place.count()) await place.click();
    }
    await page.waitForTimeout(250);
  };
  await placeInto('adult-1', kingThree, 'King Cabin 3');
  if ((await kingThree.locator('.hj-tile').count()) !== 1) problems.push(`${label}: Adult 1 did not land in King Cabin 3 (${mode})`);
  const kingThreeAdults = page.getByRole('combobox', { name: 'Adults in King Cabin 3' });
  if ((await kingThreeAdults.inputValue()) !== '1') problems.push(`${label}: King Cabin 3's menu does not show the dragged guest`);
  await kingThreeAdults.selectOption('2');
  await page.waitForTimeout(250);
  const kingThreeGuests = await kingThree.locator('.hj-tile').evaluateAll(tiles => tiles.map(tile => tile.dataset.guest));
  if (kingThreeGuests.length !== 2 || !kingThreeGuests.includes('adult-1')) problems.push(`${label}: dragging one and choosing 2 should give 2 including Adult 1, got ${kingThreeGuests}`);
  if ((await kingThreeAdults.locator('option').count()) !== 3) problems.push(`${label}: a 2-guest cabin's menu should stop at 2`);
  await placeInto('adult-3', kingThree, 'King Cabin 3');
  if ((await kingThree.locator('.hj-tile').count()) !== 2) problems.push(`${label}: a third guest got into a 2-guest cabin (${mode})`);

  // Arrange for me asks which types, then uses only those.
  if (mode === 'tap') await page.keyboard.press('Escape');
  const arrange = page.getByRole('button', { name: 'Arrange for me' });
  await centre(arrange);
  await arrange.click();
  const chooser = page.getByRole('group', { name: 'Which cabins would you like?' });
  await chooser.waitFor({ timeout: 5000 });
  await chooser.getByRole('checkbox', { name: /King Cabin/ }).check();
  await chooser.getByRole('checkbox', { name: /Luxury Suite/ }).check();
  await chooser.getByRole('button', { name: 'Arrange my guests' }).click();
  await page.waitForTimeout(300);
  const placedTypes = await page.locator('.hj-cabin-card--used').evaluateAll(list => list.map(card => card.getAttribute('aria-label').split(',')[0]));
  if ((await poolTiles.count()) !== 0) problems.push(`${label}: Arrange for me left guests waiting`);
  if (placedTypes.some(type => type !== 'Luxury King Cabin' && type !== 'Luxury Suite')) problems.push(`${label}: Arrange for me used a type that was not chosen: ${placedTypes}`);
  await shot('03-arranged');

  // Cart: checks live availability, then keeps sailing and party.
  if (label === 'desktop') {
    const availabilityChecks = [];
    const listener = request => { if (request.url().includes('/api/booking/availability')) availabilityChecks.push(request.url()); };
    page.on('request', listener);
    const cart = page.locator('.hj-cabin-card[aria-label^="Luxury Suite, cabin 1,"] .hathor-atv');
    await centre(cart);
    await cart.click();
    await page.waitForFunction(() => {
      try { return JSON.parse(localStorage.getItem('hathor:voyage:v2'))?.residenceSlug === 'luxury-suite'; } catch { return false; }
    }, null, { timeout: 30000 }).catch(() => problems.push('desktop: the Luxury Suite never reached the cart'));
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
    if ((await page.locator('.hj-cabin-card .hj-tile').count()) !== 5) problems.push('desktop: continuing from the cart did not place the party of 5');
    const resumedTypes = await page.locator('.hj-cabin-card--used').evaluateAll(list => list.map(card => card.getAttribute('aria-label').split(',')[0]));
    if (resumedTypes.length === 0 || resumedTypes.some(type => type !== 'Luxury Suite')) problems.push(`desktop: continuing from the cart did not use the Luxury Suite from the cart (${resumedTypes})`);
    await shot('05-resumed-from-cart');
  }

  // Cards far apart on the page: tap Adult 1, then the Twin Cabin (drag is covered above).
  const twinOne = page.locator('.hj-cabin-card[aria-label^="Luxury Twin Cabin, cabin 1,"]');
  const adultOneTile = page.locator('.hj-cabin-card .hj-tile[data-guest="adult-1"]');
  await centre(adultOneTile);
  await adultOneTile.click();
  const placeTwin = page.getByRole('button', { name: 'Place Adult 1 in Twin Cabin 1' });
  await centre(placeTwin);
  await placeTwin.click();
  await page.waitForTimeout(300);
  if ((await twinOne.locator('.hj-tile[data-guest="adult-1"]').count()) !== 1) problems.push(`${label}: Adult 1 did not move into Twin Cabin 1 (${mode})`);
  const continueDetails = page.getByRole('button', { name: /continue to details/i });
  if (await continueDetails.isDisabled()) problems.push(`${label}: Continue stayed disabled with everyone placed`);
  await centre(twinOne);
  await page.screenshot({ path: `${OUT}/${label}-04-cabins-moved.png`, fullPage: false });
  await continueDetails.click();

  // Step 3 — details and payment.
  await page.getByLabel(/first name/i).waitFor({ timeout: 60000 });
  if ((await guideItems()) !== 4) problems.push(`${label}: details step should show a 4-point map`);
  if (holdCalls.length > 0) problems.push(`${label}: a cabin was held before the guest confirmed`);
  const nameFields = page.getByLabel(/full name/i);
  if ((await nameFields.count()) !== 5) problems.push(`${label}: expected 5 passenger name fields, found ${await nameFields.count()}`);
  await page.getByLabel(/first name/i).fill('QA');
  await page.getByLabel(/last name/i).fill('Allocation');
  await page.getByLabel(/^email/i).fill('qa-allocation@example.invalid');
  const country = page.getByRole('combobox', { name: /^Country/ });
  await country.click();
  const list = page.locator('.hj-country__list');
  await list.waitFor({ timeout: 5000 });
  if ((await page.locator('.hj-country__option').count()) < 200) problems.push(`${label}: the country menu does not list every country`);
  await page.waitForTimeout(500);
  // Field and list measured in the same frame, once the page has settled.
  const geometry = await page.evaluate(() => {
    const field = document.querySelector('.hj-country input').getBoundingClientRect();
    const list = document.querySelector('.hj-country__list').getBoundingClientRect();
    return { fieldBottom: field.bottom, listTop: list.top, listBottom: list.bottom, listLeft: list.left, listRight: list.right, width: innerWidth, height: innerHeight };
  });
  if (geometry.listTop < geometry.fieldBottom - 1) problems.push(`${label}: the country list did not open below its field (${JSON.stringify(geometry)})`);
  if (geometry.listBottom > geometry.height) problems.push(`${label}: the country list runs past the bottom of the screen`);
  if (geometry.listLeft < 0 || geometry.listRight > geometry.width) problems.push(`${label}: the country list runs past the side of the screen`);
  await page.screenshot({ path: `${OUT}/${label}-05-country-open.png`, fullPage: false });
  await country.fill('Egy');
  await page.keyboard.press('Enter');
  if ((await page.locator('.hj-phone__code').innerText()).trim() !== '+20') problems.push(`${label}: choosing Egypt did not show +20 for the phone`);
  await page.locator('.hj-phone input').fill('010 1234 5678');
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
    if (confirmBody.phone !== '+201012345678' || confirmBody.country !== 'Egypt') problems.push(`${label}: sent phone ${confirmBody.phone} / country ${confirmBody.country}`);
    const byRoom = confirmBody.passengers.reduce((map, passenger) => map.set(passenger.roomIndex, (map.get(passenger.roomIndex) ?? 0) + 1), new Map());
    held.forEach((room, index) => {
      if ((byRoom.get(index) ?? 0) !== room.adults + room.children) problems.push(`${label}: passengers for room ${index} do not match the hold`);
    });
  }

  console.log(`${label} (${theme}): all ${allCount} cabins listed; guests placed by ${mode}, cabin menus and Arrange for me; country list below its field; hold at confirm released (${releaseCalls.length})`);
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
