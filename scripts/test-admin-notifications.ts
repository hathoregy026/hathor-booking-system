import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { fetchAdminNotifications, markNotificationBookingsSeen, notificationSeenSchema } from "../lib/admin-notifications";
import { NotificationTracker, notificationHref, notificationSnapshotSchema, type NotificationSnapshot } from "../lib/admin-notification-types";
import { GET, POST } from "../app/api/admin/notifications/route";
import { assertTrustedPublicJsonRequest } from "../lib/public-api-security";
import type { bookingQuery } from "../lib/booking-database";

async function main() {
  const snapshot: NotificationSnapshot = {
    unreadCount: 2, bookingCount: 1, emailCount: 1, bookingSeenThrough: "2026-10-02T12:00:00.000Z",
    items: [
      { id: "request-one", kind: "booking", source: "booking", name: "Guest", description: "Nile voyage", createdAt: "2026-10-02T12:00:00.000Z" },
      { id: "email-one", kind: "email", source: "general", name: "Guest", description: "Question", createdAt: "2026-10-02T12:00:00.000Z" },
    ], activity: [{ key: "booking/request-one", kind: "booking" }, { key: "email/general/email-one", kind: "email" }],
  };
  assert.deepEqual(notificationSnapshotSchema.parse(snapshot), snapshot);
  const tracker = new NotificationTracker();
  assert.deepEqual(tracker.update(snapshot.activity), { bookings: false, emails: false });
  const expanded = [...snapshot.activity, { key: "booking/request-two", kind: "booking" as const }, { key: "email/booking/reply-two", kind: "email" as const }];
  assert.deepEqual(tracker.update(expanded), { bookings: true, emails: true });
  assert.deepEqual(tracker.update(expanded), { bookings: false, emails: false });
  assert.deepEqual(tracker.update(snapshot.activity), { bookings: false, emails: false });
  assert.deepEqual(tracker.update(expanded), { bookings: false, emails: false });
  assert.match(notificationHref(snapshot.items[0]), /^\/admin\/bookings\/request-one$/);
  assert.match(notificationHref(snapshot.items[1]), /^\/admin\/inbox\?source=general&message=email-one$/);
  assert.equal(notificationHref({ ...snapshot.items[0], id: "../private" }), "/admin/bookings/..%2Fprivate");
  const calls: { sql: string; values: unknown[] }[] = [];
  const query = (async (sql: string, values: unknown[] = []) => {
    calls.push({ sql, values });
    return sql.includes("WITH profile") ? [snapshot] : [];
  }) as typeof bookingQuery;
  assert.deepEqual(await fetchAdminNotifications(query), snapshot);
  assert.equal(calls.length, 1, "Counts and rows must come from one database snapshot");
  assert.match(calls[0].sql, /WHERE direction = 'INBOUND'/);
  assert.match(calls[0].sql, /FROM emails WHERE "readAt" IS NULL/);
  assert.match(calls[0].sql, /FROM emails ORDER BY happened/);
  assert.match(calls[0].sql, /status IN \('REQUESTED', 'CONFIRMED'\)/);
  assert.doesNotMatch(calls[0].sql, /UPDATE|DELETE|totalPriceCents|bookingTickets/);
  await markNotificationBookingsSeen({ seenThrough: snapshot.bookingSeenThrough }, query);
  assert.match(calls[1].sql, /GREATEST/);
  assert.equal((calls[1].values[1] as Date).toISOString(), snapshot.bookingSeenThrough);
  assert.doesNotMatch(calls[1].sql, /"BookingMessage"|"InboxMessage"|UPDATE "Booking"/);
  await assert.rejects(markNotificationBookingsSeen({ seenThrough: new Date(Date.now() + 60000).toISOString() }, query));
  assert.equal(calls.length, 2);
  assert.throws(() => notificationSeenSchema.parse({ seenThrough: snapshot.bookingSeenThrough, readEmails: true }));
  assert.throws(() => assertTrustedPublicJsonRequest(new Request("https://www.hathorcruise.com/api/admin/notifications", { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://attacker.example" } })));
  assert.equal((await GET(new NextRequest("https://www.hathorcruise.com/api/admin/notifications"))).status, 401);
  assert.equal((await POST(new NextRequest("https://www.hathorcruise.com/api/admin/notifications", { method: "POST" }))).status, 401);
  console.log("Notification tests passed: booking/email counts, stable activity deduplication, snapshot consistency, scoped acknowledgment, race-safe watermark, validation and authorization. No live bookings or emails created.");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
