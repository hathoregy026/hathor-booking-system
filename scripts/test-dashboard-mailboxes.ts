import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { EMAIL_MAILBOXES, emailMailbox, mailboxSettingsSchema } from "../lib/email-mailboxes";
import { fetchMailboxHandlers, saveMailboxHandler } from "../lib/email-mailbox-settings";
import { processReceivedDashboardEmail } from "../lib/dashboard-inbound";
import { deleteDashboardEmail, inboxQuerySchema } from "../lib/dashboard-inbox";
import { privateEmailSendSchema, sendPrivateEmail } from "../lib/private-email";
import { DELETE } from "../app/api/admin/inbox/[source]/[id]/route";
import { PATCH } from "../app/api/admin/inbox/mailboxes/route";
import type { bookingQuery } from "../lib/booking-database";

async function main() {
  assert.deepEqual(EMAIL_MAILBOXES.map(mailbox => mailbox.label), ["CEO", "ACC", "SALES", "RESERVATIONS", "RECEPTION", "INFO"]);
  assert.equal(new Set(EMAIL_MAILBOXES.map(mailbox => mailbox.color)).size, 6);
  for (const mailbox of EMAIL_MAILBOXES) {
    assert.equal(inboxQuerySchema.parse({ mailbox: mailbox.id }).mailbox, mailbox.id);
    assert.equal(emailMailbox(mailbox.id).address, `${mailbox.id}@hathorcruise.com`);
  }
  assert.equal(inboxQuerySchema.safeParse({ mailbox: "attacker" }).success, false);
  assert.equal(mailboxSettingsSchema.safeParse({ mailboxId: "ceo", handlerName: "Amira" }).success, true);
  for (const handlerName of ["x".repeat(81), "Name\r\nBcc: other@example.com", "<script>"]) {
    assert.equal(mailboxSettingsSchema.safeParse({ mailboxId: "ceo", handlerName }).success, false);
  }
  const settings: { key: string; value: string }[] = [];
  const settingsQuery = (async (sql: string, values: unknown[]) => {
    if (sql.startsWith("SELECT")) return settings;
    assert.match(sql, /ON CONFLICT \(key\) DO UPDATE/);
    settings.push({ key: values[0] as string, value: values[1] as string });
    return [];
  }) as typeof bookingQuery;
  await saveMailboxHandler({ mailboxId: "ceo", handlerName: "Nile Director" }, settingsQuery);
  assert.equal((await fetchMailboxHandlers(settingsQuery)).ceo, "Nile Director");
  assert.equal((await fetchMailboxHandlers(settingsQuery)).sales, "");

  const emailId = randomUUID();
  const saved = new Set<string>();
  const event = { type: "email.received" as const, data: { email_id: emailId, to: EMAIL_MAILBOXES.map(mailbox => mailbox.forwardingAddress) } };
  let reads = 0;
  const query = (async (sql: string, values: unknown[]) => {
    if (sql.startsWith("SELECT")) return [...saved].map(mailboxId => ({ mailboxId }));
    assert.match(sql, /ON CONFLICT \("resendEmailId", "mailboxId"\) DO NOTHING/);
    assert.equal(values[1], emailId);
    saved.add(values[9] as string);
    return [];
  }) as typeof bookingQuery;
  const request = async () => {
    reads++;
    return { id: emailId, from: "Guest <guest@example.com>", to: ["original-bcc@example.com"],
      subject: "For several teams", text: "A shared inquiry", html: null, message_id: "<shared@example.com>",
      created_at: "2026-10-03T12:00:00Z", headers: {}, attachments: [] };
  };
  await processReceivedDashboardEmail(event, { query, request });
  await processReceivedDashboardEmail(event, { query, request });
  assert.equal(reads, 1);
  assert.equal(saved.size, 6);
  saved.delete("sales");
  await processReceivedDashboardEmail(event, { query, request });
  assert.equal(saved.size, 6, "Partial webhook retries fill only missing groups");
  await processReceivedDashboardEmail({ ...event, data: { ...event.data, to: ["ceo@other.example"] } }, { query, request });
  assert.equal(reads, 2, "Untrusted domains must not trigger a fetch");

  for (const mailbox of EMAIL_MAILBOXES) {
    const routed: string[] = [];
    const deliveryId = randomUUID();
    const singleQuery = (async (sql: string, values: unknown[]) => {
      if (sql.startsWith("SELECT")) return routed.map(mailboxId => ({ mailboxId }));
      assert.equal(values[1], deliveryId);
      routed.push(values[9] as string);
      return [];
    }) as typeof bookingQuery;
    const singleEvent = { type: "email.received" as const, data: { email_id: deliveryId, to: [`Hathor <${mailbox.forwardingAddress}>`] } };
    const singleRequest = async () => ({ ...await request(), id: deliveryId, to: ["Unrelated original recipient <external@example.com>"] });
    await processReceivedDashboardEmail(singleEvent, { query: singleQuery, request: singleRequest });
    await processReceivedDashboardEmail(singleEvent, { query: singleQuery, request: singleRequest });
    assert.deepEqual(routed, [mailbox.id], "Each forwarding destination must arrive only in its matching group, regardless of original headers");
  }

  const messageId = randomUUID();
  const deletionQuery = (async (sql: string) => {
    assert.ok(!/DELETE FROM|TRUNCATE|UPDATE "Booking"/.test(sql));
    if (sql.includes('INSERT INTO "DashboardEmailDeletion"')) return [{ messageId }];
    return [{ id: messageId, source: "general", mailboxId: "ceo", direction: "INBOUND", status: "RECEIVED", createdAt: new Date(), readAt: null }];
  }) as typeof bookingQuery;
  assert.equal(await deleteDashboardEmail("general", messageId, deletionQuery), true);
  const pendingQuery = (async () => [{ id: messageId, direction: "OUTBOUND", status: "PENDING", createdAt: new Date(), readAt: null }]) as typeof bookingQuery;
  await assert.rejects(deleteDashboardEmail("general", messageId, pendingQuery));

  process.env.RESEND_FROM_EMAIL = "Hathor Dahabiya <reservations@hathorcruise.com>";
  for (const mailbox of EMAIL_MAILBOXES) {
    let stored: Record<string, unknown> | null = null;
    const input = privateEmailSendSchema.parse({ requestId: randomUUID(), mailboxId: mailbox.id, to: "guest@example.com", subject: "Mailbox note", message: "Hello" });
    const sendingQuery = (async (sql: string, values: unknown[]) => {
      if (sql.includes('FROM "SiteSetting"')) return [{ key: `email-mailbox-handler/${mailbox.id}`, value: "Team Handler" }];
      if (sql.startsWith("SELECT")) return stored ? [stored] : [];
      if (sql.startsWith("INSERT")) {
        stored = { id: values[0], status: "PENDING", sender: values[1], recipient: values[2], correspondentName: values[3], subject: values[4], bodyText: values[5], bodyHtml: values[6], requestFingerprint: values[7], recordedBySession: values[8], mailboxId: values[9] };
        return [];
      }
      if (sql.includes("INTERVAL '60 seconds'")) return [{ id: input.requestId }];
      if (sql.includes("status = 'SENT'")) { stored!.status = "SENT"; return []; }
      throw new Error("Unexpected SQL");
    }) as typeof bookingQuery;
    let delivered = 0;
    const result = await sendPrivateEmail(input, "synthetic-session", { query: sendingQuery, render: async () => "<p>Stored branding</p>", deliver: async payload => {
      delivered++;
      assert.match(payload.from, new RegExp(`<${mailbox.address.replace(/\./g, "\\.")}>`));
      assert.equal(payload.reply_to, mailbox.address);
      assert.match(payload.text, /Team Handler/);
      return randomUUID();
    } });
    assert.equal(result.status, "SENT");
    assert.equal((await sendPrivateEmail(input, "synthetic-session", { query: sendingQuery })).status, "SENT");
    assert.equal(delivered, 1);
    const other = mailbox.id === "ceo" ? "sales" : "ceo";
    await assert.rejects(sendPrivateEmail({ ...input, mailboxId: other }, "synthetic-session", { query: sendingQuery }));
  }
  const context = { params: Promise.resolve({ source: "general", id: messageId }) };
  assert.equal((await DELETE(new NextRequest("https://www.hathorcruise.com/api/admin/inbox/general/" + messageId, { method: "DELETE" }), context)).status, 401);
  assert.equal((await PATCH(new NextRequest("https://www.hathorcruise.com/api/admin/inbox/mailboxes", { method: "PATCH" }))).status, 401);
  console.log("Mailbox tests passed: six roles, safe names, signed routing/BCC, multi-mailbox deduplication and partial retries, mailbox sending, dashboard-only deletion, pending-send safeguards and authorization. No live emails sent.");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
