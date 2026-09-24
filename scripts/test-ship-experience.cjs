/* Read-only local UI regression. Browser API fixtures never write booking/CMS data.
 * Usage: node scripts/test-ship-experience.cjs [--browser] (localhost:3000 running).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

function loadLocalTS(relative) {
  const filename = path.resolve(relative);
  const source = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const local = new Module(filename, module);
  local.paths = Module._nodeModulePaths(path.dirname(filename));
  local._compile(source, filename);
  return local.exports;
}
const { DEFAULT_SHIP_EXPERIENCE: defaults, SHIP_REGIONS: regions, SHIP_ROOM_IDS: ids, shipExperienceSchema, parseShipExperience } = loadLocalTS('lib/ship-experience-shared.ts');
assert.equal(shipExperienceSchema.safeParse(defaults).success, true);
assert.equal(defaults.rooms.length, 13);
assert.equal(defaults.rooms.filter(room => room.roomId).length, 12);
assert.equal(defaults.rooms.find(room => room.slotId === 'ROOM09').roomId, null);
assert.equal(regions.R02.deck, 'main');
assert.ok(regions.R02.y < regions.R01.y, 'Royal Suite 2 above Royal Suite 1');
assert.equal(Object.values(regions).filter(region => region.deck === 'sun').length, 0);
for (const region of Object.values(regions)) {
  assert.ok(region.x >= 0 && region.y >= 0 && region.x + region.width <= 1774 && region.y + region.height <= 887);
}
const duplicate = structuredClone(defaults);
duplicate.rooms[12].roomId = 'K01';
assert.equal(shipExperienceSchema.safeParse(duplicate).success, false, 'Reject duplicate cabin links');
const badSlot = structuredClone(defaults);
badSlot.rooms[0].slotId = 'kitchen';
assert.equal(shipExperienceSchema.safeParse(badSlot).success, false, 'Reject clickable facilities');
const longName = structuredClone(defaults);
longName.rooms[12].name = 'x'.repeat(81);
assert.equal(shipExperienceSchema.safeParse(longName).success, false);
const hidden = structuredClone(defaults);
hidden.decks.forEach(deck => { deck.visible = false; });
assert.equal(shipExperienceSchema.safeParse(hidden).success, false);
const legacy = { eyebrow: 'Saved eyebrow', title: 'Saved title', introduction: 'Saved introduction', decks: defaults.decks, rooms: ids.map(roomId => ({ roomId, visible: roomId !== 'S01', x: 50, y: 50, label: 'Old map label', deckId: 'lower' })), spaces: [{ id: 'restaurant' }] };
const migrated = parseShipExperience(legacy);
assert.equal(migrated.title, legacy.title);
assert.equal(migrated.rooms[0].visible, false);
assert.equal(migrated.version, 2);
assert.equal('spaces' in migrated, false);
console.log('PASS: schema, 13 plan rooms / 12 cabins, royal suite placement, legacy upgrade and validation.');

async function browserTests() {
  require('dotenv').config({ path: '.env.local', quiet: true });
  require('dotenv').config({ quiet: true });
  const { chromium } = require('playwright');
  const { createSessionToken, ADMIN_SESSION_COOKIE } = loadLocalTS('lib/admin-auth.ts');
  const out = path.resolve('_local/ship-plan-qa');
  fs.mkdirSync(out, { recursive: true });
  const roomType = id => id.startsWith('R') ? 'Royal Suite' : id.startsWith('S') ? 'Luxury Suite' : id.startsWith('T') ? 'Luxury Twin Cabin' : 'Luxury King Cabin';
  const rooms = ids.map(id => ({ id, name: regions[id].name, roomNumber: regions[id].number, roomType: roomType(id), description: 'A private room aboard Hathor with views of the Nile.', capacity: id.startsWith('S') || id.startsWith('R') ? 4 : 2, sizeSqm: id.startsWith('R') ? 56 : id.startsWith('S') ? 46 : 22 }));
  let config = structuredClone(defaults);
  let responseMode = 'normal';
  let saved = false;
  const sailings = [{ scheduleId: 'qa-sailing', cruiseId: 'qa-cruise', duration: '7-nights-luxor-aswan-luxor', voyage: 'Round trip', route: 'Luxor–Aswan–Luxor', nights: 7, departureTime: '2026-10-03T12:00:00Z', arrivalTime: '2026-10-10T12:00:00Z', availableCabins: 11, soldOut: false, matchesRequest: true, types: [...new Set(rooms.map(room => room.roomType))].map(type => ({ roomType: type, sizeSqm: 22, maxOccupancy: 4, priceCents: 700000, ticketTypeId: type, ticketName: type, ticketDescription: null, totalCabins: rooms.filter(room => room.roomType === type).length, availableCabins: rooms.filter(room => room.roomType === type && room.id !== 'K02').length, freeCabins: rooms.filter(room => room.roomType === type && room.id !== 'K02').map(room => ({ ...room, priceMultiplier: 1 })), soldOut: false, fitsOccupancy: true, hasRequestedQuantity: true, status: 'AVAILABLE' })) }];
  const browser = await chromium.launch();
  const errors = [];
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    await context.route('**/api/ship-experience?**', route => responseMode === 'error' ? route.fulfill({ status: 503, json: { error: 'unavailable' } }) : route.fulfill({ json: { config, rooms, sailings: responseMode === 'empty' ? [] : sailings } }));
    await context.route('**/api/admin/ship-experience', async route => {
      if (route.request().method() === 'PUT') {
        const body = route.request().postDataJSON();
        config = shipExperienceSchema.parse(body.config);
        for (const edit of body.rooms) Object.assign(rooms.find(room => room.id === edit.id), edit);
        saved = true;
        await route.fulfill({ json: { ok: true } });
      } else await route.fulfill({ json: { config, rooms } });
    });
    // Block all other browser-side mutations, including telemetry and bookings.
    await context.route('**/api/**', async route => {
      if (route.request().method() !== 'GET' && !route.request().url().endsWith('/api/admin/ship-experience')) return route.abort();
      return route.fallback();
    });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 90000 });
    const section = page.locator('#explore-hathor');
    await section.waitFor({ timeout: 30000 });
    await page.waitForFunction(() => document.querySelectorAll('#explore-hathor .ship-plan__room[data-state="open"]').length === 9);
    await page.waitForTimeout(4500); // Existing homepage scroll engine finishes measuring its hero.
    assert.equal(await section.locator('.h3-ship__theatre').getAttribute('data-sailing-in'), null, 'Reduced-motion visit skips the sailing entrance');
    assert.equal(await page.locator('.h3-images--secundario').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(236, 232, 223)', 'Photo chapter matches the ship cream');
    async function reveal(locator, offset = 80) {
      await locator.evaluate((element, topOffset) => {
        const y = element.getBoundingClientRect().top + scrollY - topOffset;
        if (window.__hathorLenis) window.__hathorLenis.scrollTo(y, { immediate: true, force: true });
        window.scrollTo(0, y);
      }, offset);
      await page.waitForTimeout(400);
    }
    await reveal(section);
    console.log('Homepage hydrated; checking room-only interactions.');
    assert.equal(await section.locator('.ship-plan__room').count(), 11);
    await reveal(section.locator('[data-slot="K01"]'), 260);
    await section.locator('[data-slot="K01"]').click();
    await page.waitForFunction(() => document.querySelector('.h3-ship__book')?.getAttribute('href')?.includes('roomId=K01'));
    assert.match(await section.locator('.h3-ship__book').getAttribute('href'), /sailing=2026-10-03/);
    await section.locator('[data-slot="K02"]').evaluate(element => element.click());
    assert.equal(await section.locator('.h3-ship__book').count(), 0, 'Unavailable cabin cannot continue');
    await section.locator('[data-slot="ROOM09"]').evaluate(element => element.click());
    assert.equal(await section.locator('.h3-ship__book').getAttribute('href'), '/contact');
    await section.locator('.h3-ship__deck-tabs button').nth(1).evaluate(element => element.click());
    assert.equal(await section.locator('.ship-plan__room').count(), 2);
    for (const id of ['R01', 'R02']) {
      await reveal(section.locator(`[data-slot="${id}"]`), 260);
      await section.locator(`[data-slot="${id}"]`).click();
      assert.match(await section.locator('.h3-ship__book').getAttribute('href'), new RegExp(`roomId=${id}`));
    }
    await reveal(section.locator('.h3-ship__theatre'));
    await section.locator('.h3-ship__theatre').screenshot({ path: path.join(out, 'main-desktop.png') });
    await section.locator('.h3-ship__deck-tabs button').nth(2).evaluate(element => element.click());
    assert.equal(await section.locator('.ship-plan__room').count(), 0);
    await section.locator('.h3-ship__theatre').screenshot({ path: path.join(out, 'sun-desktop.png') });
    await section.locator('.h3-ship__deck-tabs button').first().evaluate(element => element.click());
    await section.locator('[data-slot="K01"]').evaluate(element => element.click());
    await reveal(section);
    await section.screenshot({ path: path.join(out, 'lower-desktop-full.png') });
    await page.setViewportSize({ width: 1920, height: 900 });
    await page.waitForTimeout(300);
    await reveal(section);
    const largeDesktopHeight = await section.evaluate(element => Math.round(element.getBoundingClientRect().height));
    console.log(`large desktop layout: ${largeDesktopHeight}px at 1920 × 900`);
    assert.ok(largeDesktopHeight <= 850, '1920 × 900: the explorer fits below the navigation in one screen');
    await section.screenshot({ path: path.join(out, 'lower-desktop-1920.png') });
    for (const [name, width, height] of [['tablet', 768, 1024], ['phone', 390, 844], ['small-phone', 320, 750]]) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(600);
      await reveal(section.locator('.h3-ship__theatre'));
      const bounds = await section.evaluate(element => ({ width: element.getBoundingClientRect().width, scrollWidth: element.scrollWidth }));
      assert.ok(bounds.scrollWidth <= width + 2, `${name}: no section overflow`);
      assert.equal(await page.locator('.h3-images--secundario').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(236, 232, 223)', `${name}: cream continues into photo chapter`);
      const target = section.locator('[data-slot="K01"]');
      const rect = await target.boundingBox();
      if (width <= 700) assert.ok(rect.width >= 44 && rect.height >= 44, `${name}: comfortable room hit area`);
      await target.focus();
      await page.keyboard.press('Enter');
      assert.equal(await target.getAttribute('aria-pressed'), 'true');
      await reveal(section.locator('.h3-ship__theatre'));
      await section.locator('.h3-ship__theatre').screenshot({ path: path.join(out, `lower-${name}.png`) });
      const layout = await section.evaluate(element => ({ sectionHeight: Math.round(element.getBoundingClientRect().height), mapHeight: Math.round(element.querySelector('.ship-plan').getBoundingClientRect().height), detailTop: Math.round(element.querySelector('.h3-ship__detail').getBoundingClientRect().top - element.getBoundingClientRect().top), actionBottom: Math.round(element.querySelector('.h3-ship__book').getBoundingClientRect().bottom - element.getBoundingClientRect().top) }));
      console.log(`${name} layout: ${JSON.stringify(layout)}`);
      if (width <= 700) assert.ok(layout.actionBottom <= height - 50 - 64, `${name}: selected room action fits above the phone dock`);
      if (name === 'phone') {
        await reveal(section);
        await section.screenshot({ path: path.join(out, 'lower-phone-full.png') });
        assert.ok(await section.locator('.h3-ship__deck-reveal').evaluate(element => element.scrollWidth > element.clientWidth), 'Phone plan can be swiped across');
        await section.locator('.h3-ship__deck-reveal').evaluate(element => { element.scrollLeft = element.scrollWidth; });
        await section.locator('[data-slot="ROOM09"]').click();
        assert.equal(await section.locator('.h3-ship__book').getAttribute('href'), '/contact');
        await section.screenshot({ path: path.join(out, 'lower-phone-room9.png') });
      }
    }
    console.log('PASS: desktop/tablet/phone, keyboard, both Royal Suites, exact cabin links, unavailable/unlinked rooms.');
    await page.setViewportSize({ width: 1440, height: 1000 });
    responseMode = 'error';
    await section.locator('select').first().selectOption('3-nights-aswan-luxor');
    await section.locator('[role="alert"]').waitFor();
    assert.equal(await section.locator('.ship-plan__room[data-state="open"]').count(), 0);
    assert.equal(await section.locator('.h3-ship__book').count(), 0);
    responseMode = 'empty';
    await section.getByRole('button', { name: 'Try again' }).click({ force: true });
    await page.waitForFunction(() => document.querySelector('.h3-ship__notice')?.textContent?.includes('No scheduled departures'));
    responseMode = 'normal';
    await section.locator('select').first().selectOption('7-nights-luxor-aswan-luxor');
    await page.waitForFunction(() => document.querySelectorAll('.ship-plan__room[data-state="open"]').length === 9);
    assert.equal(await section.locator('.h3-ship__deck-reveal').evaluate(element => getComputedStyle(element).animationName), 'none');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    assert.equal(await section.locator('.h3-ship__deck-reveal').evaluate(element => getComputedStyle(element).animationName), 'ship-deck-arrive');
    console.log('PASS: failed/empty/loading availability fails closed; reduced-motion support.');
    let failImage = true;
    await page.route('**/media/hathor/ship/main-deck.webp*', route => failImage ? route.abort() : route.continue());
    await section.locator('.h3-ship__deck-tabs button').nth(1).evaluate(element => element.click());
    await section.locator('.ship-plan__error').waitFor();
    assert.equal(await section.locator('.ship-plan__room').count(), 0, 'No floating hit areas when artwork fails');
    failImage = false;
    await section.getByRole('button', { name: 'Reload illustration' }).click();
    await section.locator('.ship-plan__canvas[data-ready="true"]').waitFor();
    assert.equal(await section.locator('.ship-plan__room').count(), 2);
    console.log('PASS: illustration failure and successful retry.');

    await context.addCookies([{ name: ADMIN_SESSION_COOKIE, value: createSessionToken(), domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Strict' }]);
    const admin = await context.newPage();
    admin.on('pageerror', error => errors.push(error.message));
    await admin.goto('http://localhost:3000/admin/ship-experience', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await admin.locator('.sx-admin__map').waitFor({ timeout: 30000 });
    await admin.locator('[data-slot="K01"]').click();
    await admin.getByLabel('Room name', { exact: true }).fill('Nile Room');
    await admin.getByLabel('Room number', { exact: true }).fill('101');
    await admin.getByRole('button', { name: 'Save changes', exact: true }).click();
    await admin.waitForFunction(() => document.querySelector('.sx-admin__save')?.textContent?.includes('Everything is up to date'));
    assert.equal(saved, true);
    await admin.locator('.sx-admin__deck-tabs button').nth(1).click();
    assert.equal(await admin.locator('.ship-plan__room').count(), 2);
    await admin.locator('[data-slot="R02"]').click();
    assert.equal(await admin.getByLabel('Room name', { exact: true }).inputValue(), 'Royal Suite 2');
    await admin.locator('.sx-admin').screenshot({ path: path.join(out, 'dashboard-main.png') });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForFunction(() => document.querySelector('[data-slot="K01"]')?.getAttribute('aria-label')?.includes('Nile Room'));
    assert.match(await page.locator('[data-slot="K01"]').getAttribute('aria-label'), /number 101/);
    assert.equal(errors.length, 0, `Browser errors: ${errors.join('; ')}`);
    console.log('PASS: dashboard edit/save → public map name and number, using intercepted APIs (no database writes).');
    const anonymous = await browser.newContext();
    for (const method of ['get', 'put']) {
      const response = await anonymous.request[method]('http://localhost:3000/api/admin/ship-experience', method === 'put' ? { data: {} } : {});
      assert.equal(response.status(), 401);
    }
    console.log('PASS: unauthenticated admin GET and PUT rejected. Screenshots: _local/ship-plan-qa/');

    const motionContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
    await motionContext.route('**/api/ship-experience?**', route => route.fulfill({ json: { config, rooms, sailings } }));
    await motionContext.route('**/api/**', route => route.request().method() === 'GET' ? route.fallback() : route.abort());
    const motionPage = await motionContext.newPage();
    await motionPage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 90000 });
    const theatre = motionPage.locator('#explore-hathor .h3-ship__theatre');
    const plan = theatre.locator('.h3-ship__deck-reveal');
    await theatre.waitFor();
    await motionPage.waitForTimeout(4500);
    assert.equal(await theatre.getAttribute('data-sailing-in'), null, 'Entrance waits until the ship reaches the viewport');
    await plan.evaluate(element => {
      const y = element.getBoundingClientRect().top + scrollY - (innerHeight - 80);
      if (window.__hathorLenis) window.__hathorLenis.scrollTo(y, { immediate: true, force: true });
      window.scrollTo(0, y);
    });
    await motionPage.waitForTimeout(300);
    assert.equal(await theatre.getAttribute('data-sailing-in'), null, 'A glimpse at the viewport edge does not start the ship');
    await plan.evaluate(element => {
      const y = element.getBoundingClientRect().top + scrollY - 100;
      if (window.__hathorLenis) window.__hathorLenis.scrollTo(y, { immediate: true, force: true });
      window.scrollTo(0, y);
    });
    await motionPage.waitForFunction(() => document.querySelector('#explore-hathor .h3-ship__theatre')?.getAttribute('data-sailing-in') === 'true');
    assert.equal(await theatre.locator('.ship-plan--compact').evaluate(element => getComputedStyle(element).animationName), 'ship-sail-in');
    assert.equal(await motionPage.locator('#explore-hathor .h3-ship__water-surface').count(), 0, 'No water overlay remains');
    await motionPage.waitForTimeout(1500);
    await motionPage.locator('#explore-hathor').screenshot({ path: path.join(out, 'ship-sailing-entrance.png') });
    await motionPage.waitForFunction(() => !document.querySelector('#explore-hathor .h3-ship__theatre')?.hasAttribute('data-sailing-in'));
    assert.equal(await theatre.locator('.ship-plan--compact').evaluate(element => getComputedStyle(element).animationName), 'none', 'Animation finishes without leaving a transform on room targets');
    const motionPhone = await motionContext.newPage();
    await motionPhone.setViewportSize({ width: 390, height: 844 });
    await motionPhone.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await motionPhone.waitForTimeout(4500);
    const phonePlan = motionPhone.locator('#explore-hathor .h3-ship__deck-reveal');
    await phonePlan.evaluate(element => {
      const y = element.getBoundingClientRect().top + scrollY - 100;
      if (window.__hathorLenis) window.__hathorLenis.scrollTo(y, { immediate: true, force: true });
      window.scrollTo(0, y);
    });
    await motionPhone.waitForFunction(() => document.querySelector('#explore-hathor .h3-ship__theatre')?.getAttribute('data-sailing-in') === 'true');
    await motionPhone.waitForTimeout(1500);
    await motionPhone.locator('#explore-hathor').screenshot({ path: path.join(out, 'ship-sailing-entrance-phone.png') });
    assert.ok(await motionPhone.locator('#explore-hathor').evaluate(element => element.scrollWidth <= innerWidth + 2), 'Phone entrance does not widen the page');
    await motionContext.close();
    console.log('PASS: ship arrives without water effects on desktop and phone.');
  } finally { await browser.close(); }
}
if (process.argv.includes('--browser')) browserTests().catch(error => { console.error(error); process.exitCode = 1; });
