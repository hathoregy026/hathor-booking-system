import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import pg from "pg";
import { resolveDatabaseUrl } from "../lib/database-config";
import { deleteDashboardEmail, fetchDashboardInbox, fetchInboxDetail, inboxQuerySchema, setInboxRead } from "../lib/dashboard-inbox";
import type { bookingQuery } from "../lib/booking-database";
import { EMAIL_MAILBOXES } from "../lib/email-mailboxes";
import { applyDashboardEmailAction } from "../lib/dashboard-email-actions";
import { dismissNotifications, fetchAdminNotifications } from "../lib/admin-notifications";

async function main() {
  config({ path: ".env.local", quiet: true });
  config({ path: ".env", quiet: true });
  const client = new pg.Client({
    connectionString: resolveDatabaseUrl(), ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000, query_timeout: 20000,
    types: { getTypeParser: (oid: number) => oid === 1114 ? (value: string) => new Date(value.replace(" ", "T") + "Z") : pg.types.getTypeParser(oid) },
  });
  client.on("error", () => {});
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query(`CREATE TEMP TABLE "DashboardEmailDeletion" (source TEXT, "messageId" TEXT, "deletedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (source, "messageId")) ON COMMIT DROP`);
    await client.query(`CREATE TEMP TABLE "DashboardEmailPlacement" (source TEXT, "messageId" TEXT, "mailboxId" TEXT, "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (source, "messageId")) ON COMMIT DROP`);
    await client.query(`CREATE TEMP TABLE "DashboardNotificationSeen" (kind TEXT, source TEXT, "messageId" TEXT, "seenAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (kind, source, "messageId")) ON COMMIT DROP`);
    await client.query(`CREATE TEMP TABLE "SiteSetting" (key TEXT PRIMARY KEY, value TEXT, "updatedAt" TIMESTAMP(3)) ON COMMIT DROP`);
    await client.query(`CREATE TEMP TABLE "Booking" (
      id TEXT PRIMARY KEY, "customerName" TEXT, "firstName" TEXT, "lastName" TEXT
    ) ON COMMIT DROP`);
    await client.query(`INSERT INTO pg_temp."Booking" VALUES ('11111111-1111-4111-8111-111111111111', 'Nile Guest', 'Nile', 'Guest')`);
    await client.query(`CREATE TEMP TABLE "InboxMessage" (
      id TEXT PRIMARY KEY, "resendEmailId" TEXT, sender TEXT, recipient TEXT, subject TEXT, "bodyText" TEXT,
      attachments JSONB DEFAULT '[]'::jsonb, "createdAt" TIMESTAMP(3), "readAt" TIMESTAMP(3),
      direction TEXT DEFAULT 'INBOUND', status TEXT DEFAULT 'RECEIVED', "correspondentName" TEXT, "mailboxId" TEXT DEFAULT 'reservations',
      folder TEXT DEFAULT 'inbox', "screeningReasons" JSONB DEFAULT '[]'::jsonb
    ) ON COMMIT DROP`);
    await client.query(`CREATE TEMP TABLE "BookingMessage" (
      id TEXT PRIMARY KEY, "bookingId" TEXT, direction TEXT, sender TEXT, recipient TEXT, subject TEXT, "bodyText" TEXT,
      attachments JSONB DEFAULT '[]'::jsonb, "senderMatchesGuest" BOOLEAN, "createdAt" TIMESTAMP(3), "readAt" TIMESTAMP(3), status TEXT DEFAULT 'RECEIVED',
      folder TEXT DEFAULT 'inbox', "screeningReasons" JSONB DEFAULT '[]'::jsonb
    ) ON COMMIT DROP`);
    const bookingId = randomUUID();
    const sentId = randomUUID();
    await client.query(`INSERT INTO pg_temp."BookingMessage" (id, "bookingId", direction, sender, recipient, subject, "bodyText", "senderMatchesGuest", "createdAt", status)
      VALUES ($1, '11111111-1111-4111-8111-111111111111', 'INBOUND', 'guest@example.com', 'reply@example.com', 'Booking reply', 'Synthetic body', FALSE, '2026-10-02 12:00:00', 'RECEIVED'),
      ($2, '11111111-1111-4111-8111-111111111111', 'OUTBOUND', 'team@example.com', 'guest@example.com', 'Sent booking email', 'Synthetic body', TRUE, '2026-10-02 12:00:00', 'SENT')`, [bookingId, sentId]);
    const general = Array.from({ length: 27 }, (_, index) => ({ id: randomUUID(), emailId: randomUUID(), subject: index === 0 ? "Literal 100% inquiry" : `Inquiry ${index}` }));
    await client.query(`INSERT INTO pg_temp."InboxMessage" (id, "resendEmailId", sender, recipient, subject, "bodyText", "createdAt")
      SELECT id, "emailId", 'customer@example.com', 'reservations@hathorcruise.com', subject, 'Synthetic body', '2026-10-02 12:00:00'::timestamp
      FROM jsonb_to_recordset($1::jsonb) AS fixture(id text, "emailId" text, subject text)`, [JSON.stringify(general)]);
    const query = (async (sql: string, values: unknown[] = []) => (await client.query(sql, values)).rows) as typeof bookingQuery;
    for (const statement of [
      `CREATE TEMP TABLE "AdminProfile" (id TEXT PRIMARY KEY, "lastSeenBookingAt" TIMESTAMP(3)) ON COMMIT DROP`,
      `CREATE TEMP TABLE "Cruise" (id TEXT PRIMARY KEY, name TEXT) ON COMMIT DROP`,
      `CREATE TEMP TABLE "CruiseSchedule" (id TEXT PRIMARY KEY, "cruiseId" TEXT) ON COMMIT DROP`,
      `ALTER TABLE pg_temp."Booking" ADD COLUMN "cruiseScheduleId" TEXT, ADD COLUMN status TEXT,
        ADD COLUMN "deletedAt" TIMESTAMP(3), ADD COLUMN "requestedAt" TIMESTAMP(3)`,
      `INSERT INTO pg_temp."Cruise" VALUES ('synthetic-cruise', 'Synthetic cruise')`,
      `INSERT INTO pg_temp."CruiseSchedule" VALUES ('synthetic-schedule', 'synthetic-cruise')`,
      `UPDATE pg_temp."Booking" SET "cruiseScheduleId" = 'synthetic-schedule', status = 'REQUESTED', "requestedAt" = '2026-10-01 12:00:00'`,
    ]) await client.query(statement);
    const notifications = await fetchAdminNotifications(query);
    assert.equal(notifications.bookingCount, 1);
    assert.equal(notifications.emailCount, 28);
    assert.equal(notifications.items.filter(item => item.kind === "booking").length, 1);
    assert.equal(notifications.items.filter(item => item.kind === "email").length, 10);
    const seenEmail = { notifications: [{ id: general[0].id, kind: "email" as const, source: "general" as const }] };
    await dismissNotifications(seenEmail, query);
    await dismissNotifications(seenEmail, query);
    await dismissNotifications({ notifications: [{ id: "11111111-1111-4111-8111-111111111111", kind: "booking", source: "booking" }] }, query);
    const dismissed = await fetchAdminNotifications(query);
    assert.equal(dismissed.bookingCount, 0);
    assert.equal(dismissed.emailCount, 27);
    assert.equal(dismissed.items.some(item => item.id === general[0].id), false);
    assert.equal((await fetchInboxDetail("general", general[0].id, query))?.readAt, null);
    const lateEmail = randomUUID();
    await client.query(`INSERT INTO pg_temp."InboxMessage" (id, sender, recipient, subject, "bodyText", "createdAt")
      VALUES ($1, 'late@example.com', 'info@hathorcruise.com', 'Late delivery', 'Original late body', '2026-09-01 12:00:00')`, [lateEmail]);
    assert.equal((await fetchAdminNotifications(query)).emailCount, 28, "Late forwarded email must notify even when its original date precedes acknowledgments");
    await client.query(`DELETE FROM pg_temp."InboxMessage" WHERE id = $1`, [lateEmail]);
    await setInboxRead("general", general[0].id, true, query);
    await setInboxRead("general", general[0].id, false, query);
    assert.equal((await fetchAdminNotifications(query)).emailCount, 27, "Marking an email unread must not resurrect a dismissed notification");
    const first = await fetchDashboardInbox(inboxQuerySchema.parse({}), query);
    assert.equal(first.messages.length, 25);
    assert.equal(first.unreadCount, 28);
    assert.equal(first.hasOlder, true);
    const last = first.messages[first.messages.length - 1];
    const second = await fetchDashboardInbox(inboxQuerySchema.parse({ before: last.createdAt, cursorId: last.id, cursorSource: last.source }), query);
    assert.equal(second.messages.length, 4);
    assert.equal(second.hasOlder, false);
    assert.equal(new Set([...first.messages, ...second.messages].map(message => `${message.source}/${message.id}`)).size, 29);
    assert.deepEqual(first.counts, { all: 29, unread: 28, received: 28, sent: 1 });
    const sent = await fetchDashboardInbox(inboxQuerySchema.parse({ filter: "sent" }), query);
    assert.equal(sent.messages.length, 1);
    assert.equal(sent.messages[0].correspondentName, "Nile Guest");
    assert.equal((await fetchDashboardInbox(inboxQuerySchema.parse({ q: "Nile Guest" }), query)).messages.length, 1);
    assert.equal((await fetchDashboardInbox(inboxQuerySchema.parse({ filter: "received" }), query)).messages.every(message => message.direction === "INBOUND"), true);
    assert.equal(await setInboxRead("booking", sentId, true, query), false);
    assert.equal((await fetchDashboardInbox(inboxQuerySchema.parse({ q: "100%" }), query)).messages.length, 1);
    assert.equal((await fetchDashboardInbox(inboxQuerySchema.parse({ q: "%' OR 1=1 --" }), query)).messages.length, 0);
    const detail = await fetchInboxDetail("booking", bookingId, query);
    assert.equal(detail?.senderMatchesGuest, false);
    assert.equal(detail?.bodyText, "Synthetic body");
    assert.equal(await setInboxRead("booking", bookingId, true, query), true);
    assert.ok((await fetchInboxDetail("booking", bookingId, query))?.readAt);
    assert.equal((await fetchDashboardInbox(inboxQuerySchema.parse({ filter: "unread" }), query)).unreadCount, 27);
    assert.equal(await setInboxRead("booking", bookingId, false, query), true);
    assert.equal((await fetchDashboardInbox(inboxQuerySchema.parse({}), query)).unreadCount, 28);
    assert.equal(await setInboxRead("general", bookingId, true, query), false);
    assert.equal((await fetchDashboardInbox(inboxQuerySchema.parse({ mailbox: "ceo" }), query)).messages.length, 0);
    await client.query(`UPDATE pg_temp."InboxMessage" SET "mailboxId" = 'ceo' WHERE id = $1`, [general[0].id]);
    const ceo = await fetchDashboardInbox(inboxQuerySchema.parse({ mailbox: "ceo" }), query);
    assert.equal(ceo.messages.length, 1);
    assert.equal(ceo.counts.unread, 1);
    assert.equal(await deleteDashboardEmail("general", general[0].id, query), true);
    assert.equal((await fetchDashboardInbox(inboxQuerySchema.parse({ mailbox: "ceo" }), query)).counts.all, 0);
    assert.equal((await client.query(`SELECT id FROM pg_temp."InboxMessage" WHERE id = $1`, [general[0].id])).rows.length, 1);
    for (const mailbox of EMAIL_MAILBOXES) {
      const ids = [randomUUID(), randomUUID(), randomUUID()];
      await client.query(`INSERT INTO pg_temp."InboxMessage" (id, "resendEmailId", sender, recipient, subject, "bodyText", "createdAt", "readAt", direction, status, "mailboxId")
        VALUES ($1, $1, 'partner@example.com', $4, 'Routing fixture unread', 'Synthetic body', '2026-10-03 12:00:00', NULL, 'INBOUND', 'RECEIVED', $5),
          ($2, $2, 'partner@example.com', $4, 'Routing fixture read', 'Synthetic body', '2026-10-03 12:00:00', '2026-10-03 13:00:00', 'INBOUND', 'RECEIVED', $5),
          ($3, $3, $4, 'partner@example.com', 'Routing fixture sent', 'Synthetic body', '2026-10-03 12:00:00', NULL, 'OUTBOUND', 'SENT', $5)`, [...ids, mailbox.address, mailbox.id]);
      for (const [filter, expectedIds] of [["all", ids], ["unread", ids.slice(0, 1)], ["received", ids.slice(0, 2)], ["sent", ids.slice(2)]] as const) {
        const page = await fetchDashboardInbox(inboxQuerySchema.parse({ mailbox: mailbox.id, filter, q: "Routing fixture" }), query);
        assert.deepEqual(new Set(page.messages.map(message => message.id)), new Set(expectedIds), `${mailbox.label}: ${filter} must return only its matching emails`);
        assert.ok(page.messages.every(message => message.mailboxId === mailbox.id));
      }
    }
    const selected = [{ source: "booking" as const, id: bookingId }, { source: "general" as const, id: general[1].id }];
    const originalBodies = (await client.query(`SELECT id, "bodyText" FROM pg_temp."InboxMessage" UNION ALL SELECT id, "bodyText" FROM pg_temp."BookingMessage" ORDER BY id`)).rows;
    assert.equal((await applyDashboardEmailAction({ action: "move", messages: selected, mailboxId: "info" }, query)).affected, 2);
    for (const message of selected) assert.equal((await fetchInboxDetail(message.source, message.id, query))?.mailboxId, "info");
    assert.equal((await client.query(`SELECT "mailboxId" FROM pg_temp."InboxMessage" WHERE id = $1`, [general[1].id])).rows[0].mailboxId, "reservations", "Moving preserves original receiving/deduplication routing");
    assert.equal((await applyDashboardEmailAction({ action: "move", messages: selected, mailboxId: "ceo" }, query)).affected, 2);
    for (const message of selected) assert.equal((await fetchInboxDetail(message.source, message.id, query))?.mailboxId, "ceo");
    await assert.rejects(applyDashboardEmailAction({ action: "move", messages: [selected[0], { source: "general", id: randomUUID() }], mailboxId: "sales" }, query));
    assert.equal((await fetchInboxDetail("booking", bookingId, query))?.mailboxId, "ceo", "A stale batch must not partially move valid emails");
    await client.query(`UPDATE pg_temp."BookingMessage" SET status = 'PENDING' WHERE id = $1`, [sentId]);
    await assert.rejects(applyDashboardEmailAction({ action: "delete", messages: [selected[0], { source: "booking", id: sentId }], confirm: true }, query));
    assert.ok(await fetchInboxDetail("booking", bookingId, query), "Pending sends must block the whole batch, not delete other selected emails");
    assert.equal((await applyDashboardEmailAction({ action: "delete", messages: selected, confirm: true }, query)).affected, 2);
    for (const message of selected) assert.equal(await fetchInboxDetail(message.source, message.id, query), null);
    assert.deepEqual((await client.query(`SELECT id, "bodyText" FROM pg_temp."InboxMessage" UNION ALL SELECT id, "bodyText" FROM pg_temp."BookingMessage" ORDER BY id`)).rows, originalBodies);
    console.log("Inbox PostgreSQL tests passed: all mailbox/status filters, safe pagination/search, bulk moves with intact origin/body/booking links, atomic stale/pending rejection, and dashboard-only deletion. Only temporary synthetic tables used.");
  } finally {
    await client.query("ROLLBACK").catch(() => {});
    await client.end();
  }
}

main().catch(error => {
  const diagnostic = error instanceof assert.AssertionError ? error.message : (error as { code?: string; name?: string }).code ?? (error as Error).name;
  console.error(`Inbox PostgreSQL tests failed (${diagnostic}); no permanent records were changed.`);
  process.exitCode = 1;
});
