import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { bookingQuery } from '../lib/booking-database';
import { getSailingAvailability, type SailingAvailability } from '../lib/availability-service';
import type { StayDurationValue } from '../lib/booking-search-config';

/**
 * Step 3 acceptance: every check reads through the one availability service.
 * All synthetic holds and blocks use the qa-step3 prefix and are removed in
 * cleanup(), which also runs if a check fails.
 */

const KEY_PREFIX = 'qa-step3-';
const THREE: StayDurationValue = '3-nights-aswan-luxor';
const FOUR: StayDurationValue = '4-nights-luxor-aswan';
const SEVEN: StayDurationValue = '7-nights-luxor-aswan-luxor';
const SPEC_PRICES: Record<StayDurationValue, Record<string, number>> = {
  [THREE]: { 'Luxury King Cabin': 300000, 'Luxury Twin Cabin': 300000, 'Luxury Suite': 450000, 'Royal Suite': 540000 },
  [FOUR]: { 'Luxury King Cabin': 400000, 'Luxury Twin Cabin': 400000, 'Luxury Suite': 600000, 'Royal Suite': 720000 },
  [SEVEN]: { 'Luxury King Cabin': 700000, 'Luxury Twin Cabin': 700000, 'Luxury Suite': 1050000, 'Royal Suite': 1260000 },
};
const SPEC_CABINS: Record<string, { cabins: number; size: number; max: number }> = {
  'Luxury King Cabin': { cabins: 6, size: 22, max: 2 },
  'Luxury Twin Cabin': { cabins: 2, size: 22, max: 2 },
  'Luxury Suite': { cabins: 2, size: 46, max: 4 },
  'Royal Suite': { cabins: 2, size: 56, max: 4 },
};

let passed = 0;
function pass(n: number, label: string) { passed += 1; console.log(`PASS ${n}. ${label}`); }

type Sailing = { id: string; slug: StayDurationValue; departureTime: Date; arrivalTime: Date };

async function cleanup() {
  await bookingQuery(`DELETE FROM "InventoryAllocation" WHERE "blockKey" LIKE $1`, [`${KEY_PREFIX}%`]);
  await bookingQuery(
    `DELETE FROM "Booking" b WHERE b."idempotencyKey" LIKE $1 AND NOT EXISTS (SELECT 1 FROM "BookingPayment" p WHERE p."bookingId" = b.id)`,
    [`${KEY_PREFIX}%`],
  );
}

async function hold(sailing: Sailing, roomType: string, cabins = 1, children = 0) {
  const key = KEY_PREFIX + randomUUID();
  const rooms = Array.from({ length: cabins }, () => ({ roomType, adults: 1, children }));
  const rowsPromise = bookingQuery<{ booking: unknown }>(
    'SELECT hathor_acquire_hold($1,$2::jsonb,$3,$4) AS booking',
    [sailing.id, JSON.stringify(rooms), key, key],
  );
  const rows = await rowsPromise;
  return (rows[0].booking as { id: string; bookingRooms: { roomId: string }[] });
}

async function block(sailing: Sailing, roomIds: string[], state: 'MANUAL_BLOCK' | 'MAINTENANCE' | 'CHARTER_BLOCK') {
  const key = KEY_PREFIX + randomUUID();
  await bookingQuery(
    `INSERT INTO "InventoryAllocation" ("roomId","startsAt","endsAt",state,"blockKey",reason)
     SELECT unnest($1::text[]), $2::timestamp, $3::timestamp, $4, $5, 'Step 3 acceptance'`,
    [roomIds, sailing.departureTime.toISOString(), sailing.arrivalTime.toISOString(), state, key],
  );
  return key;
}

async function availability(duration: StayDurationValue, sailing: Sailing, guests?: { adults?: number; children?: number; rooms?: number }) {
  const sailings = await getSailingAvailability({
    duration,
    departureDate: sailing.departureTime.toISOString(),
    ...guests,
  });
  const match = sailings.find(entry => entry.scheduleId === sailing.id);
  assert(match, `no availability returned for ${duration} on ${sailing.departureTime.toISOString()}`);
  return match as SailingAvailability;
}

function typeOf(sailing: SailingAvailability, roomType: string) {
  const found = sailing.types.find(type => type.roomType === roomType);
  assert(found, `room type ${roomType} missing from availability`);
  return found!;
}

async function scheduleCount() {
  const rows = await bookingQuery<{ count: string }>('SELECT count(*) AS count FROM "CruiseSchedule"');
  return Number(rows[0].count);
}

async function main() {
  await cleanup();

  const rows = await bookingQuery<{ id: string; slug: StayDurationValue; departureTime: Date; arrivalTime: Date }>(
    `SELECT s.id, c.slug, s."departureTime", s."arrivalTime"
     FROM "CruiseSchedule" s JOIN "Cruise" c ON c.id = s."cruiseId"
     WHERE s."isBookable" AND s."departureTime" IN ('2026-10-17','2026-10-21')`,
  );
  const four = rows.find(r => r.slug === FOUR)!;
  const seven = rows.find(r => r.slug === SEVEN)!;
  const three = rows.find(r => r.slug === THREE)!;
  assert(four && seven && three, 'need the aligned 4N/3N/7N sailings from 2026-10-17');

  // 1-3. Availability, prices, size, occupancy and sold-out state per voyage.
  for (const [duration, sailing] of [[THREE, three], [FOUR, four], [SEVEN, seven]] as const) {
    const result = await availability(duration, sailing);
    assert.equal(result.types.length, 4);
    for (const [roomType, expected] of Object.entries(SPEC_CABINS)) {
      const type = typeOf(result, roomType);
      assert.equal(type.priceCents, SPEC_PRICES[duration][roomType], `${duration} ${roomType} price`);
      assert.equal(type.totalCabins, expected.cabins, `${duration} ${roomType} cabins`);
      assert.equal(type.availableCabins, expected.cabins, `${duration} ${roomType} available`);
      assert.equal(type.sizeSqm, expected.size);
      assert.equal(type.maxOccupancy, expected.max);
      assert.equal(type.soldOut, false);
    }
    assert.equal(result.arrivalTime, sailing.arrivalTime.toISOString());
    assert.equal(result.nights, duration === THREE ? 3 : duration === FOUR ? 4 : 7);
    pass(duration === THREE ? 1 : duration === FOUR ? 2 : 3, `${duration}: valid sailing, end date, 4 room types, quantities and server prices`);
  }

  // 4. A child inside King/Twin capacity stays bookable at the per-cabin rate.
  const withChild = await availability(FOUR, four, { adults: 1, children: 1, rooms: 1 });
  for (const roomType of ['Luxury King Cabin', 'Luxury Twin Cabin']) {
    const type = typeOf(withChild, roomType);
    assert.equal(type.fitsOccupancy, true, `${roomType} must accept 1 adult + 1 child`);
    assert.equal(type.status, 'AVAILABLE');
    assert.equal(type.priceCents, SPEC_PRICES[FOUR][roomType], 'children do not change the cabin price');
  }
  pass(4, 'children within King/Twin capacity remain available at the per-cabin price');

  // 5. Three guests exceed King/Twin capacity; suites still fit.
  const overCapacity = await availability(FOUR, four, { adults: 2, children: 1, rooms: 1 });
  assert.equal(typeOf(overCapacity, 'Luxury King Cabin').status, 'OVER_OCCUPANCY');
  assert.equal(typeOf(overCapacity, 'Luxury Twin Cabin').fitsOccupancy, false);
  assert.equal(typeOf(overCapacity, 'Luxury Suite').status, 'AVAILABLE');
  assert.equal(typeOf(overCapacity, 'Royal Suite').status, 'AVAILABLE');
  await assert.rejects(hold(four, 'Luxury King Cabin', 1, 2), 'the hold function must refuse 3 guests in a King');
  pass(5, 'over-capacity requests are rejected by the service and by the hold function');

  // 6. An active hold removes that physical cabin.
  const held = await hold(four, 'Luxury King Cabin');
  const afterHold = await availability(FOUR, four);
  assert.equal(typeOf(afterHold, 'Luxury King Cabin').availableCabins, 5);
  assert.equal(typeOf(afterHold, 'Luxury King Cabin').freeCabins.some(c => c.id === held.bookingRooms[0].roomId), false);
  pass(6, 'an active hold reduces availability by exactly one cabin');

  // 7. Once the hold expires the cabin returns, before and after the sweeper.
  await bookingQuery(`UPDATE "Booking" SET "holdExpiresAt" = clock_timestamp() - interval '1 second' WHERE id = $1`, [held.id]);
  assert.equal(typeOf(await availability(FOUR, four), 'Luxury King Cabin').availableCabins, 6);
  await bookingQuery('SELECT hathor_expire_holds()');
  const expired = await bookingQuery<{ status: string }>('SELECT status FROM "Booking" WHERE id = $1', [held.id]);
  assert.equal(expired[0].status, 'EXPIRED');
  assert.equal(typeOf(await availability(FOUR, four), 'Luxury King Cabin').availableCabins, 6);
  pass(7, 'an expired hold restores availability and the booking is EXPIRED');
  await cleanup();

  // 8. A 4N allocation blocks the overlapping 7N but leaves the later 3N free.
  await hold(four, 'Royal Suite', 2);
  assert.equal(typeOf(await availability(SEVEN, seven), 'Royal Suite').soldOut, true);
  assert.equal(typeOf(await availability(THREE, three), 'Royal Suite').availableCabins, 2);
  pass(8, '4N allocation blocks the overlapping 7N and not the following 3N');
  await cleanup();

  // 9. A 3N allocation blocks the overlapping 7N but leaves the earlier 4N free.
  await hold(three, 'Royal Suite', 2);
  assert.equal(typeOf(await availability(SEVEN, seven), 'Royal Suite').soldOut, true);
  assert.equal(typeOf(await availability(FOUR, four), 'Royal Suite').availableCabins, 2);
  pass(9, '3N allocation blocks the overlapping 7N and not the preceding 4N');
  await cleanup();

  // 10. The same physical cabin may serve a separate 4N and 3N booking.
  const fourHold = await hold(four, 'Royal Suite', 2);
  const threeHold = await hold(three, 'Royal Suite', 2);
  assert.deepEqual(
    fourHold.bookingRooms.map(r => r.roomId).sort(),
    threeHold.bookingRooms.map(r => r.roomId).sort(),
    'compatible sectors should reuse the same cabins',
  );
  assert.equal(typeOf(await availability(SEVEN, seven), 'Royal Suite').availableCabins, 0);
  pass(10, 'compatible 4N + 3N bookings share the same physical cabins');
  await cleanup();

  // 11. A 7N allocation blocks both shorter sectors.
  await hold(seven, 'Royal Suite', 2);
  assert.equal(typeOf(await availability(FOUR, four), 'Royal Suite').availableCabins, 0);
  assert.equal(typeOf(await availability(THREE, three), 'Royal Suite').availableCabins, 0);
  pass(11, '7N allocation blocks both the 4N and 3N sectors');
  await cleanup();

  // 12. Operational blocks count as allocations.
  await block(four, ['K01'], 'MANUAL_BLOCK');
  const blocked = await availability(FOUR, four);
  assert.equal(typeOf(blocked, 'Luxury King Cabin').availableCabins, 5);
  assert.equal(typeOf(blocked, 'Luxury King Cabin').freeCabins.some(c => c.id === 'K01'), false);
  await block(four, ['K02'], 'MAINTENANCE');
  assert.equal(typeOf(await availability(FOUR, four), 'Luxury King Cabin').availableCabins, 4);
  pass(12, 'manual and maintenance blocks reduce availability');
  await cleanup();

  // 13. A charter takes the whole vessel for that sailing.
  await block(four, ['K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'T01', 'T02', 'S01', 'S02', 'R01', 'R02'], 'CHARTER_BLOCK');
  const chartered = await availability(FOUR, four);
  assert.equal(chartered.soldOut, true);
  assert.equal(chartered.availableCabins, 0);
  assert.equal(chartered.types.every(type => type.soldOut), true);
  assert.equal(typeOf(await availability(THREE, three), 'Royal Suite').availableCabins, 2, 'a 4N charter must not close the later 3N sector');
  pass(13, 'a charter block makes every cabin unavailable for that sailing');
  await cleanup();

  // 14. Availability is read-only, including for days that have no sailing.
  const before = await scheduleCount();
  await getSailingAvailability({ duration: FOUR });
  await getSailingAvailability({ duration: FOUR, departureDate: '2026-10-19', adults: 2, children: 2, rooms: 2 });
  await getSailingAvailability({ duration: SEVEN, departureDate: '2030-01-01' });
  assert.equal(await scheduleCount(), before, 'availability must never create a sailing');
  pass(14, 'availability requests never create or repair sailing records');

  // 15. Concurrency cannot oversell the two Royal Suites.
  const attempts = await Promise.allSettled([
    hold(four, 'Royal Suite'), hold(four, 'Royal Suite'), hold(four, 'Royal Suite'), hold(four, 'Royal Suite'),
  ]);
  const won = attempts.filter(a => a.status === 'fulfilled').length;
  assert.equal(won, 2, `only two Royal Suites exist, ${won} requests succeeded`);
  assert.equal(attempts.filter(a => a.status === 'rejected').every(a => (a as PromiseRejectedResult).reason?.code === 'HB409'), true);
  assert.equal(typeOf(await availability(FOUR, four), 'Royal Suite').availableCabins, 0);
  pass(15, 'simultaneous requests cannot overstate bookable physical inventory');

  await cleanup();
  const leftovers = await bookingQuery<{ bookings: string; blocks: string }>(
    `SELECT (SELECT count(*) FROM "Booking" WHERE "idempotencyKey" LIKE $1) AS bookings,
            (SELECT count(*) FROM "InventoryAllocation" WHERE "blockKey" LIKE $1) AS blocks`,
    [`${KEY_PREFIX}%`],
  );
  assert.equal(Number(leftovers[0].bookings) + Number(leftovers[0].blocks), 0, 'synthetic records remain');
  console.log(`\n${passed}/15 availability checks passed; synthetic holds and blocks removed`);
}

main()
  .catch(async error => {
    console.error('FAIL', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup().catch(() => undefined);
    process.exit(process.exitCode ?? 0);
  });
