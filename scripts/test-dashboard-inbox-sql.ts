import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { config } from "dotenv";
import pg from "pg";
import { resolveDatabaseUrl } from "../lib/database-config";
import { fetchDashboardInbox, fetchInboxDetail, inboxQuerySchema, setInboxRead } from "../lib/dashboard-inbox";
import type { bookingQuery } from "../lib/booking-database";

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
    await client.query(`CREATE TEMP TABLE "Booking" (
      id TEXT PRIMARY KEY, "customerName" TEXT, "firstName" TEXT, "lastName" TEXT
    ) ON COMMIT DROP`);
    await client.query(`INSERT INTO pg_temp."Booking" VALUES ('synthetic-booking', 'Nile Guest', 'Nile', 'Guest')`);
    await client.query(`CREATE TEMP TABLE "InboxMessage" (
      id TEXT PRIMARY KEY, "resendEmailId" TEXT, sender TEXT, recipient TEXT, subject TEXT, "bodyText" TEXT,
      attachments JSONB DEFAULT '[]'::jsonb, "createdAt" TIMESTAMP(3), "readAt" TIMESTAMP(3),
      direction TEXT DEFAULT 'INBOUND', status TEXT DEFAULT 'RECEIVED', "correspondentName" TEXT
    ) ON COMMIT DROP`);
    await client.query(`CREATE TEMP TABLE "BookingMessage" (
      id TEXT PRIMARY KEY, "bookingId" TEXT, direction TEXT, sender TEXT, recipient TEXT, subject TEXT, "bodyText" TEXT,
      attachments JSONB DEFAULT '[]'::jsonb, "senderMatchesGuest" BOOLEAN, "createdAt" TIMESTAMP(3), "readAt" TIMESTAMP(3), status TEXT DEFAULT 'RECEIVED'
    ) ON COMMIT DROP`);
    const bookingId = randomUUID();
    const sentId = randomUUID();
    await client.query(`INSERT INTO pg_temp."BookingMessage" (id, "bookingId", direction, sender, recipient, subject, "bodyText", "senderMatchesGuest", "createdAt", status)
      VALUES ($1, 'synthetic-booking', 'INBOUND', 'guest@example.com', 'reply@example.com', 'Booking reply', 'Synthetic body', FALSE, '2026-10-02 12:00:00', 'RECEIVED'),
      ($2, 'synthetic-booking', 'OUTBOUND', 'team@example.com', 'guest@example.com', 'Sent booking email', 'Synthetic body', TRUE, '2026-10-02 12:00:00', 'SENT')`, [bookingId, sentId]);
    const general = Array.from({ length: 27 }, (_, index) => ({ id: randomUUID(), emailId: randomUUID(), subject: index === 0 ? "Literal 100% inquiry" : `Inquiry ${index}` }));
    await client.query(`INSERT INTO pg_temp."InboxMessage" (id, "resendEmailId", sender, recipient, subject, "bodyText", "createdAt")
      SELECT id, "emailId", 'customer@example.com', 'reservations@hathorcruise.com', subject, 'Synthetic body', '2026-10-02 12:00:00'::timestamp
      FROM jsonb_to_recordset($1::jsonb) AS fixture(id text, "emailId" text, subject text)`, [JSON.stringify(general)]);
    const query = (async (sql: string, values: unknown[] = []) => (await client.query(sql, values)).rows) as typeof bookingQuery;
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
    console.log("Inbox PostgreSQL tests passed: union, tied-timestamp pagination, literal search, detail binding, unread counts and read toggles. Only temporary synthetic tables used.");
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
