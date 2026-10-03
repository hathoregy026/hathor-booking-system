import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { sendInquiryEmail } from "../lib/inquiry-email";
import { recordInquiryInbox, type InquiryInboxMessage } from "../lib/inquiry-inbox";
import { getDefaultEmailTemplate } from "../lib/email-templates";
import { receivedEmailHtmlDocument } from "../lib/email-html-view";
import type { bookingQuery } from "../lib/booking-database";
import type { CreateEmailOptions } from "resend";

async function main() {
  process.env.RESEND_API_KEY = "re_synthetic_test_only";
  process.env.RESEND_FROM_EMAIL = "Hathor Dahabiya <reservations@hathorcruise.com>";
  process.env.ADMIN_EMAIL = "team@example.com";
  process.env.RESEND_REPLY_TO = "reservations@hathorcruise.com";
  const fixture: InquiryInboxMessage = { id: randomUUID(), type: "contact", name: "Nile Guest", email: "Guest@Example.com", subject: "Contact inquiry",
    text: "Original inquiry", html: "<p>Original inquiry</p><script>bad()</script>", createdAt: new Date() };
  const records = new Map<string, unknown[]>();
  const query = (async (sql: string, values: unknown[]) => {
    assert.match(sql, /INSERT INTO "InboxMessage"/);
    assert.match(sql, /'INBOUND', 'RECEIVED'/);
    assert.match(sql, /ON CONFLICT \(id\) DO NOTHING/);
    assert.ok(!sql.includes(fixture.email));
    assert.ok(!sql.includes('"resendEmailId"'));
    if (!records.has(values[0] as string)) records.set(values[0] as string, values);
    return [];
  }) as typeof bookingQuery;
  await recordInquiryInbox(fixture, query);
  await recordInquiryInbox({ ...fixture, text: "A replay must not overwrite the original" }, query);
  assert.equal(records.size, 1);
  const stored = records.get(fixture.id)!;
  assert.equal(stored[1], "info");
  assert.equal(stored[2], "guest@example.com");
  assert.equal(stored[3], "info@hathorcruise.com");
  assert.equal(stored[4], fixture.name);
  assert.equal(stored[6], fixture.text);
  assert.equal(stored[9], "CONTACT_FORM");
  await recordInquiryInbox({ ...fixture, id: randomUUID(), type: "charter" }, query);
  assert.equal([...records.values()][1][1], "reservations");
  assert.equal([...records.values()][1][9], "CHARTER_FORM");
  await assert.rejects(recordInquiryInbox({ ...fixture, email: "invalid" }, query));
  await assert.rejects(recordInquiryInbox({ ...fixture, name: "Name\r\nBcc: attacker@example.com" }, query));
  const document = await receivedEmailHtmlDocument("general", fixture.id, false, {
    query: (async () => [{ direction: "INBOUND", resendEmailId: null, bodyHtml: fixture.html }]) as typeof bookingQuery,
    request: async () => { throw new Error("Stored form inquiries must not call Resend Receiving"); },
  });
  assert.match(document, /Original inquiry/);
  assert.doesNotMatch(document, /bad\(\)/);
  assert.doesNotMatch(document, /<script/);
  const sent: CreateEmailOptions[] = [];
  const captured: InquiryInboxMessage[] = [];
  const sequence: string[] = [];
  const providerId = randomUUID();
  const payload = { type: "contact" as const, name: fixture.name, email: fixture.email, phone: "+201234567890", message: "Please send details <script>bad()</script>." };
  const dependencies = {
    template: async (name: Parameters<typeof getDefaultEmailTemplate>[0]) => getDefaultEmailTemplate(name),
    send: async (input: CreateEmailOptions) => { sent.push(input); sequence.push(sent.length === 1 ? "team" : "receipt"); return { data: { id: providerId }, error: null, headers: null }; },
    record: async (input: InquiryInboxMessage) => { captured.push(input); sequence.push("dashboard"); },
  };
  assert.deepEqual(await sendInquiryEmail(payload, dependencies), { receiptSent: true });
  assert.deepEqual(sequence, ["team", "dashboard", "receipt"]);
  assert.equal(sent[0].to, "team@example.com");
  assert.equal(sent[0].replyTo, payload.email);
  assert.equal(sent[0].from, process.env.RESEND_FROM_EMAIL);
  assert.equal(sent[1].replyTo, "info@hathorcruise.com");
  assert.equal(captured[0].id, providerId);
  assert.equal(captured[0].email, payload.email);
  assert.match(captured[0].text, /Phone: \+201234567890/);
  assert.match(captured[0].text, /Please send details/);
  assert.doesNotMatch(captured[0].html!, /<script>bad\(\)<\/script>/);
  let calls = 0;
  const refusal = await sendInquiryEmail(payload, { ...dependencies, send: async () => {
    calls++;
    return calls === 1 ? { data: { id: randomUUID() }, error: null, headers: null } : { data: null, error: { name: "validation_error" as const, message: "Synthetic refusal", statusCode: 422 }, headers: null };
  } });
  assert.equal(refusal.receiptSent, false);
  assert.equal(captured.length, 2);
  let savedAfterRefusal = false;
  await assert.rejects(sendInquiryEmail(payload, { ...dependencies, record: async () => { savedAfterRefusal = true; }, send: async () => ({ data: null, error: { name: "validation_error" as const, message: "Synthetic team failure", statusCode: 422 }, headers: null }) }));
  assert.equal(savedAfterRefusal, false);
  let receiptAfterStorageFailure = 0;
  await assert.rejects(sendInquiryEmail(payload, { ...dependencies, send: async () => { receiptAfterStorageFailure++; return { data: { id: randomUUID() }, error: null, headers: null }; }, record: async () => { throw new Error("Synthetic storage failure"); } }));
  assert.equal(receiptAfterStorageFailure, 1);
  console.log("Inquiry inbox tests passed: Contact → INFO, Charter → RESERVATIONS, guest reply address, preserved notifications, durable history before receipts, immutable replay, validation and protected formatted view. No live email sent.");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
