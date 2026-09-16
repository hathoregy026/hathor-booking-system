import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { bookingQuery } from '../lib/booking-database';
import { acquireBookingHold, submitBookingRequest, paymentSchedule, type GuestRequest } from '../lib/booking-engine';
import { getSailingAvailability } from '../lib/availability-service';
import { bookingRequestSchema } from '../lib/booking-request-validation';
import type { StayDurationValue } from '../lib/booking-search-config';

/**
 * Step 4 request-side acceptance. Nothing here records a payment, so every
 * synthetic booking is removable; cleanup() runs even when a check fails.
 */

const KEY_PREFIX = 'qa-step4-';
let passed = 0;
function pass(n: number, label: string) { passed += 1; console.log(`PASS ${n}. ${label}`); }

type Sailing = { id: string; slug: StayDurationValue; departureTime: Date; days: number };

async function cleanup() {
  await bookingQuery(
    `DELETE FROM "Booking" b WHERE b."idempotencyKey" LIKE $1 AND NOT EXISTS (SELECT 1 FROM "BookingPayment" p WHERE p."bookingId" = b.id)`,
    [`${KEY_PREFIX}%`],
  );
}

function guestFor(bookingId: string, method: 'VISA' | 'BANK_TRANSFER'): GuestRequest {
  return {
    bookingId,
    firstName: 'QA', lastName: 'Step Four',
    email: 'qa-step4@example.invalid', phone: '+201234567890', country: 'Egypt',
    paymentMethod: method,
    specialRequests: 'Synthetic Step 4 request test',
    marketingOptIn: false,
    passengers: [{ fullName: 'QA Adult', isChild: false, roomIndex: 0 }],
  };
}

async function holdOne(sailing: Sailing, roomType = 'Luxury King Cabin') {
  const key = KEY_PREFIX + randomUUID();
  const booking = await acquireBookingHold({
    cruiseScheduleId: sailing.id,
    idempotencyKey: key,
    rooms: [{ roomType: roomType as 'Luxury King Cabin', adults: 1, children: 0 }],
  });
  return { booking, key };
}

async function scheduleRowsOf(bookingId: string) {
  return bookingQuery<{ milestone: string; dueAt: Date | null; cumulativeCents: number }>(
    `SELECT milestone, "dueAt", "cumulativeCents" FROM "BookingPaymentSchedule" WHERE "bookingId" = $1 ORDER BY "cumulativeCents"`,
    [bookingId],
  );
}

async function main() {
  await cleanup();

  const sailings = await bookingQuery<Sailing>(`
    SELECT s.id, c.slug, s."departureTime",
      (s."departureTime"::date - (clock_timestamp() AT TIME ZONE 'UTC')::date)::int AS days
    FROM "CruiseSchedule" s JOIN "Cruise" c ON c.id = s."cruiseId"
    WHERE s."isBookable" AND s."departureTime" > clock_timestamp()
    ORDER BY s."departureTime"
  `);
  const farAhead = sailings.find(s => s.days > 60);
  const midRange = sailings.find(s => s.days > 45 && s.days <= 60);
  const lastMinute = sailings.find(s => s.days <= 45);
  assert(farAhead, 'need a sailing more than 60 days out');
  assert(lastMinute, 'need a sailing within 45 days');

  // 1-3. Confirm Request submits a request and stores the preferred method.
  for (const method of ['VISA', 'BANK_TRANSFER'] as const) {
    const { booking, key } = await holdOne(farAhead);
    assert.equal(booking.status, 'PENDING_HOLD');
    const { booking: submitted } = await submitBookingRequest(guestFor(booking.id, method), key);
    assert.equal(submitted.status, 'REQUESTED', 'a submitted request must never be CONFIRMED');
    assert.equal(submitted.confirmedAt, null);
    assert.equal(submitted.acceptedAt, null);
    assert.equal(submitted.holdExpiresAt, null);
    assert.equal(submitted.paymentMethod, method);
    assert.equal(submitted.customerEmail, 'qa-step4@example.invalid');
    assert.equal(submitted.country, 'Egypt');
    assert.equal(submitted.guests.length, 1);
    assert.equal(submitted.guests[0].fullName, 'QA Adult');
    assert.notEqual(submitted.termsAcceptedAt, null);
    if (method === 'VISA') pass(2, 'Visa preference stores correctly');
    else pass(3, 'Bank Transfer preference stores correctly');
  }
  pass(1, 'Confirm Request creates REQUESTED with guest and passenger details, never CONFIRMED');

  // 4. No card data is accepted or stored anywhere.
  const cardAttempt = bookingRequestSchema.safeParse({
    bookingId: 'x'.repeat(20), accessToken: 'token', firstName: 'QA', lastName: 'Card',
    email: 'qa-step4@example.invalid', phone: '+201234567890', country: 'Egypt',
    paymentMethod: 'VISA', specialRequests: '', marketingOptIn: false, termsAccepted: true,
    passengers: [{ fullName: 'QA Adult', isChild: false, roomIndex: 0 }],
    cardNumber: '4111111111111111', cvv: '123',
  });
  assert.equal(cardAttempt.success, false, 'card fields must be rejected by the request schema');
  const cardColumns = await bookingQuery<{ column_name: string }>(`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public'
      AND (column_name ILIKE '%card%' OR column_name ILIKE '%cvv%' OR column_name ILIKE '%pan%'
        OR column_name ILIKE '%cardholder%' OR column_name ILIKE '%expiry%')
  `);
  assert.equal(cardColumns.length, 0, `unexpected card-like columns: ${cardColumns.map(c => c.column_name).join(', ')}`);
  pass(4, 'no card fields are accepted by the request and none exist in the database');

  // 5-7. The stored schedule stages follow the booking date.
  const bands: [number, Sailing | undefined, { milestone: string; percent: number }[]][] = [
    [5, farAhead, [{ milestone: 'INITIAL', percent: 30 }, { milestone: 'DAY_60', percent: 50 }, { milestone: 'DAY_45', percent: 100 }]],
    [6, midRange, [{ milestone: 'INITIAL', percent: 50 }, { milestone: 'DAY_45', percent: 100 }]],
    [7, lastMinute, [{ milestone: 'INITIAL', percent: 100 }]],
  ];
  for (const [check, sailing, expected] of bands) {
    if (!sailing) { console.log(`SKIP ${check}. no open sailing in this band`); continue; }
    const { booking } = await holdOne(sailing);
    const total = booking.totalPriceCents!;
    const rows = await scheduleRowsOf(booking.id);
    assert.deepEqual(rows.map(r => r.milestone), expected.map(e => e.milestone), `stages for a booking ${sailing.days} days ahead`);
    rows.forEach((row, index) => {
      assert.equal(row.cumulativeCents, Math.ceil((total * expected[index].percent) / 100), `${row.milestone} amount`);
      if (row.milestone === 'INITIAL') assert.equal(row.dueAt, null, 'the first stage is due when Hathor invoices');
      else {
        const offsetDays = row.milestone === 'DAY_60' ? 60 : 45;
        assert.equal(row.dueAt!.toISOString(), new Date(sailing.departureTime.getTime() - offsetDays * 86_400_000).toISOString(), `${row.milestone} due date`);
      }
    });
    const server = paymentSchedule(total, sailing.departureTime);
    assert.deepEqual(server.milestones.map(m => [m.milestone, m.cumulativeCents]), rows.map(r => [r.milestone, r.cumulativeCents]), 'server helper must match the stored stages');
    assert.equal(server.requiredCents, rows[0].cumulativeCents, 'amount required now is the first stage');
    const label = check === 5 ? 'more than 60 days ahead: 30% / 20% / 50%'
      : check === 6 ? '46-60 days ahead: 50% now, rest at 45 days'
        : '45 days or less: 100% required';
    pass(check, `${label} (booked ${sailing.days} days before departure)`);
  }

  // 13. A submitted request keeps its cabin out of availability.
  const kingOn = async () => (await getSailingAvailability({ duration: farAhead.slug, departureDate: farAhead.departureTime.toISOString() }))[0]
    .types.find(t => t.roomType === 'Luxury King Cabin')!;
  const kingBefore = await kingOn();
  const { booking: blocking, key: blockingKey } = await holdOne(farAhead);
  const cabinId = blocking.bookingRooms[0].roomId;
  await submitBookingRequest(guestFor(blocking.id, 'BANK_TRANSFER'), blockingKey);
  const kingType = await kingOn();
  assert.equal(kingType.freeCabins.some(c => c.id === cabinId), false, 'the requested cabin must stay out of availability');
  assert.equal(kingType.availableCabins, kingBefore.availableCabins - 1, 'exactly one more cabin is taken');
  const allocation = await bookingQuery<{ state: string; active: boolean; expiresAt: Date | null }>(
    `SELECT a.state, a.active, a."expiresAt" FROM "InventoryAllocation" a JOIN "BookingRoom" br ON br.id = a."bookingRoomId" WHERE br."bookingId" = $1`,
    [blocking.id],
  );
  assert.equal(allocation[0].state, 'REQUESTED');
  assert.equal(allocation[0].active, true);
  assert.equal(allocation[0].expiresAt, null, 'a submitted request must not expire like a hold');
  pass(13, 'a submitted request keeps its physical cabin protected, with no expiry');

  // 15. Repeating the same attempt returns the same booking.
  const { booking: retried, key: retryKey } = await holdOne(farAhead);
  const first = await submitBookingRequest(guestFor(retried.id, 'VISA'), retryKey);
  const second = await submitBookingRequest(guestFor(retried.id, 'VISA'), retryKey);
  assert.equal(first.replay, false);
  assert.equal(second.replay, true, 'a resubmitted request must be reported as a replay');
  assert.equal(second.booking.id, retried.id);
  const sameHold = await acquireBookingHold({ cruiseScheduleId: farAhead.id, idempotencyKey: retryKey, rooms: [{ roomType: 'Luxury King Cabin', adults: 1, children: 0 }] });
  assert.equal(sameHold.id, retried.id, 'refreshing checkout must not start a second booking');
  const copies = await bookingQuery<{ count: string }>(`SELECT count(*) AS count FROM "Booking" WHERE "idempotencyKey" = $1`, [retryKey]);
  assert.equal(Number(copies[0].count), 1);
  pass(15, 'retry and refresh never create a second request');

  await cleanup();
  const leftovers = await bookingQuery<{ count: string }>(`SELECT count(*) AS count FROM "Booking" WHERE "idempotencyKey" LIKE $1`, [`${KEY_PREFIX}%`]);
  assert.equal(Number(leftovers[0].count), 0, 'synthetic requests remain');
  console.log(`\n${passed} request-side checks passed; synthetic requests removed`);
}

main()
  .catch(error => {
    console.error('FAIL', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await cleanup().catch(() => undefined);
    process.exit(process.exitCode ?? 0);
  });
