import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { processReceivedDashboardEmail } from "../lib/dashboard-inbound";
import { fetchDashboardInbox, fetchInboxDetail, inboxIdentitySchema, inboxQuerySchema, setInboxRead } from "../lib/dashboard-inbox";
import { DASHBOARD_INBOX_ADDRESS } from "../lib/inbox-types";
import { GET as inboxGET } from "../app/api/admin/inbox/route";
import { GET as detailGET, PATCH as detailPATCH } from "../app/api/admin/inbox/[source]/[id]/route";
import { GET as attachmentGET } from "../app/api/admin/inbox/[source]/[id]/attachments/[attachmentId]/route";
import { assertTrustedPublicJsonRequest } from "../lib/public-api-security";
import type { bookingQuery } from "../lib/booking-database";

function fixture(options: { automatic?: boolean; recipient?: string; wrongId?: boolean; failInsert?: boolean } = {}) {
  const emailId = randomUUID();
  const event = { type: "email.received" as const, data: { email_id: emailId, to: [DASHBOARD_INBOX_ADDRESS] } };
  let saved = false;
  let reads = 0;
  const inserts: unknown[][] = [];
  const query = (async (sql: string, values: unknown[]) => {
    if (sql.startsWith("SELECT")) return saved ? [{ mailboxId: "reservations" }] : [];
    assert.match(sql, /INSERT INTO "InboxMessage"/);
    if (options.failInsert) throw new Error("Unavailable database");
    inserts.push(values);
    saved = true;
    return [];
  }) as typeof bookingQuery;
  const request = async (path: string, body?: unknown) => {
    assert.equal(body, undefined, "General mail must not trigger notification or forwarding loops");
    assert.match(path, /^\/emails\/receiving\//);
    reads += 1;
    return {
      id: options.wrongId ? randomUUID() : emailId, from: "Customer <guest@example.com>",
      to: [options.recipient ?? DASHBOARD_INBOX_ADDRESS], subject: "Nile inquiry\r\n",
      text: null, html: "<p>Hello &amp; welcome</p><script>doNotRun()</script>", message_id: "<mail@example.com>",
      created_at: "2026-10-02T12:00:00Z", headers: options.automatic ? { "Auto-Submitted": "auto-generated" } : {},
      attachments: [{ id: randomUUID(), filename: "brochure.pdf", content_type: "application/pdf" }],
    };
  };
  return { event, query, request, inserts, reads: () => reads };
}

async function main() {
  const normal = fixture();
  await processReceivedDashboardEmail(normal.event, normal);
  await processReceivedDashboardEmail(normal.event, normal);
  assert.equal(normal.reads(), 1);
  assert.equal(normal.inserts.length, 1);
  assert.equal(normal.inserts[0][2], "guest@example.com");
  assert.equal(normal.inserts[0][8], "Customer");
  assert.equal(normal.inserts[0][4], "Nile inquiry  ");
  assert.equal(normal.inserts[0][5], "Hello & welcome");
  assert.equal(JSON.parse(normal.inserts[0][6] as string)[0].filename, "brochure.pdf");
  const forwarded = fixture({ recipient: "reservations@hathorcruise.com" });
  await processReceivedDashboardEmail(forwarded.event, forwarded);
  assert.equal(forwarded.inserts.length, 1, "Forwarded original To header is supported");
  const bccForwarded = fixture({ recipient: "outside@example.com" });
  await processReceivedDashboardEmail(bccForwarded.event, bccForwarded);
  assert.equal(bccForwarded.inserts[0][9], "reservations", "Verified delivery recipient owns routing even with a preserved original To header");
  for (const options of [{ wrongId: true }, { failInsert: true }]) {
    const invalid = fixture(options);
    await assert.rejects(processReceivedDashboardEmail(invalid.event, invalid));
    assert.equal(invalid.inserts.length, 0);
  }
  const automatic = fixture({ automatic: true });
  await processReceivedDashboardEmail(automatic.event, automatic);
  assert.equal(automatic.inserts.length, 1, "General mail includes automated invoices, receipts, and forwarding verification messages");
  await processReceivedDashboardEmail(automatic.event, automatic);
  assert.equal(automatic.inserts.length, 1, "Automated mail is stored once without generating another email");
  const unrelated = fixture();
  await processReceivedDashboardEmail({ ...unrelated.event, data: { ...unrelated.event.data, to: ["reservations@other.example"] } }, unrelated);
  assert.equal(unrelated.reads(), 0);
  const tokenMail = fixture();
  const tokenQuery = (async (sql: string) => { assert.match(sql, /BookingEmailThread/); return []; }) as typeof bookingQuery;
  await processReceivedDashboardEmail({ ...tokenMail.event, data: { ...tokenMail.event.data, to: [`r-${"a".repeat(48)}@reply.hathorcruise.com`] } }, { ...tokenMail, query: tokenQuery });
  assert.equal(tokenMail.reads(), 0, "Booking routes stay independent of general mail");

  assert.equal(inboxQuerySchema.safeParse({ before: new Date().toISOString() }).success, false);
  assert.equal(inboxQuerySchema.safeParse({ q: "x".repeat(121) }).success, false);
  assert.equal(inboxIdentitySchema.safeParse({ source: "BookingMessage", id: randomUUID() }).success, false);
  const messageId = randomUUID();
  const statements: { sql: string; values: unknown[] }[] = [];
  const listQuery = (async (sql: string, values: unknown[] = []) => {
    statements.push({ sql, values });
    if (sql.includes('FROM "SiteSetting"')) return [];
    if (sql.includes('GROUP BY "mailboxId"')) return [{ mailboxId: "reservations", total: 26, unread: 4 }];
    if (sql.includes("COUNT(*)")) return [{ all: 26, unread: 4, received: 20, sent: 6 }];
    return Array.from({ length: 26 }, () => ({ id: randomUUID(), source: "general", bookingId: null, sender: "guest@example.com", recipient: DASHBOARD_INBOX_ADDRESS, correspondentName: "Customer", direction: "INBOUND", status: "RECEIVED", subject: "Hello", preview: "Text", attachmentCount: 0, createdAt: new Date("2026-10-02T12:00:00Z"), readAt: null }));
  }) as typeof bookingQuery;
  const page = await fetchDashboardInbox(inboxQuerySchema.parse({ q: "%' OR 1=1 --", filter: "unread", before: "2026-10-02T13:00:00.000Z", cursorId: messageId, cursorSource: "general" }), listQuery);
  assert.equal(page.messages.length, 25);
  assert.equal(page.hasOlder, true);
  assert.equal(page.unreadCount, 4);
  assert.deepEqual(page.counts, { all: 26, unread: 4, received: 20, sent: 6 });
  assert.equal(page.messages[0].createdAt, "2026-10-02T12:00:00.000Z");
  assert.ok(!statements[0].sql.includes("OR 1=1"));
  assert.equal(statements[0].values[0], "%\\%' OR 1=1 --%");
  assert.deepEqual(statements[0].values.slice(1), ["unread", "2026-10-02T13:00:00.000Z", "general", messageId, "all", "inbox"]);
  assert.match(statements[0].sql, /recipient ILIKE \$1/);
  assert.match(statements[0].sql, /"correspondentName" ILIKE \$1/);
  for (const filter of ["sent", "received"]) {
    const index = statements.length;
    await fetchDashboardInbox(inboxQuerySchema.parse({ filter }), listQuery);
    assert.equal(statements[index].values[1], filter);
  }
  const emptyQuery = (async () => []) as typeof bookingQuery;
  assert.equal(await fetchInboxDetail("general", messageId, emptyQuery), null);
  assert.equal(await setInboxRead("booking", messageId, true, emptyQuery), false);
  const updateQuery = (async (sql: string, values: unknown[]) => {
    assert.match(sql, /direction = 'INBOUND'/);
    assert.ok(!sql.includes('UPDATE "Booking"'));
    assert.deepEqual(values, [messageId, false]);
    return [{ id: messageId }];
  }) as typeof bookingQuery;
  assert.equal(await setInboxRead("booking", messageId, false, updateQuery), true);
  assert.equal(await setInboxRead("general", messageId, false, updateQuery), true);

  const url = "https://www.hathorcruise.com/api/admin/inbox";
  const params = Promise.resolve({ source: "general", id: messageId });
  assert.equal((await inboxGET(new NextRequest(url))).status, 401);
  assert.equal((await detailGET(new NextRequest(`${url}/general/${messageId}`), { params })).status, 401);
  assert.equal((await detailPATCH(new NextRequest(`${url}/general/${messageId}`, { method: "PATCH", body: '{"read":true}', headers: { "Content-Type": "application/json" } }), { params })).status, 401);
  assert.equal((await attachmentGET(new NextRequest(`${url}/general/${messageId}/attachments/file`), { params: Promise.resolve({ source: "general", id: messageId, attachmentId: randomUUID() }) })).status, 401);
  assert.throws(() => assertTrustedPublicJsonRequest(new Request(url, { method: "PATCH", headers: { "Content-Type": "application/json", Origin: "https://untrusted.example" } })));
  console.log("Dashboard Inbox tests passed: receiving, routing, deduplication, safe body text, search/cursors, read status, authentication and CSRF.");
}

main().catch(() => { console.error("Dashboard Inbox tests failed"); process.exitCode = 1; });
