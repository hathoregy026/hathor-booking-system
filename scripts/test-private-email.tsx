import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { render } from "@react-email/render";
import PrivateMessageEmail from "../emails/PrivateMessage";
import { getDefaultEmailTemplate, buildEmailSendTheme } from "../lib/email-templates";
import { privateEmailSendSchema, privateEmailContentSchema, sendPrivateEmail, PrivateEmailDeliveryError, readPrivateEmailJson, deliverPrivateEmail } from "../lib/private-email";
import { buildEmailHtmlDocument, receivedEmailHtmlDocument } from "../lib/email-html-view";
import { mailboxDisplayName, correspondentLabel } from "../lib/email-correspondent";
import { POST as sendPOST } from "../app/api/admin/inbox/send/route";
import { POST as previewPOST } from "../app/api/admin/inbox/preview/route";
import type { bookingQuery } from "../lib/booking-database";
import { privateEmailAttachmentScope, type PrivateEmailAttachment } from "../lib/mail-attachments";
import { POST as uploadPOST } from "../app/api/admin/inbox/attachments/route";

function fixture(options: { uncertain?: boolean; failed?: boolean; noLease?: boolean; finishFails?: boolean; attachments?: boolean } = {}) {
  const draftId = randomUUID();
  const fileId = randomUUID();
  const file = { path: `bookings/${privateEmailAttachmentScope("session", draftId)}/${fileId}-receipt.pdf`, name: "receipt.pdf" };
  const input = privateEmailSendSchema.parse({ requestId: randomUUID(), to: "guest@example.com", recipientName: "Amira", subject: "Your Hathor note", message: "Hello\n\nYour private message.", ...(options.attachments ? { draftId, attachments: [file] } : {}) });
  let row: Record<string, unknown> | undefined;
  let calls = 0;
  const payloads: unknown[] = [];
  const query = (async (sql: string, values: unknown[] = []) => {
    assert.ok(!/UPDATE "Booking"|DELETE|TRUNCATE/.test(sql));
    if (sql.startsWith("SELECT")) return row ? [row] : [];
    if (sql.startsWith("INSERT")) {
      row ??= { id: values[0], direction: "OUTBOUND", status: "PENDING", sender: values[1], recipient: values[2], correspondentName: values[3], subject: values[4], bodyText: values[5], bodyHtml: values[6], requestFingerprint: values[7], recordedBySession: values[8], attachments: JSON.parse(values[10] as string), createdAt: new Date() };
      return [];
    }
    if (sql.includes("INTERVAL '60 seconds'")) { assert.match(sql, /INTERVAL '23 hours'/); return options.noLease ? [] : [{ id: values[0] }]; }
    if (sql.includes("status = 'SENT'")) { if (options.finishFails) throw new Error("Unavailable history"); row!.status = "SENT"; return []; }
    if (sql.includes("status = 'FAILED'")) { row!.status = "FAILED"; return []; }
    throw new Error("Unexpected statement");
  }) as typeof bookingQuery;
  const deliver = async (payload: unknown, key: string) => {
    assert.equal(key, input.requestId);
    calls += 1;
    payloads.push(payload);
    if (options.failed) throw new PrivateEmailDeliveryError(true);
    if (options.uncertain && calls === 1) throw new Error("Unconfirmed network");
    return randomUUID();
  };
  const resolveAttachments = async (scope: string, refs: { path: string; name: string }[]): Promise<PrivateEmailAttachment[]> => {
    assert.equal(scope, privateEmailAttachmentScope("session", draftId));
    assert.deepEqual(refs, [file]);
    return [{ id: fileId, filename: file.name, storagePath: file.path, path: `https://example.com/refreshed-${randomUUID()}`, contentType: "application/pdf", content: Buffer.from("%PDF-1.4\nSynthetic receipt").toString("base64"), contentHash: "synthetic-content-hash" }];
  };
  return { input, query, deliver, resolveAttachments, render: async () => "<p>Immutable branded email</p>", calls: () => calls, payloads, row: () => row };
}

async function main() {
  process.env.RESEND_FROM_EMAIL = "Hathor Dahabiya <reservations@hathorcruise.com>";
  const valid = { to: "guest@example.com", recipientName: "Amira", subject: "Hello", message: "Hello\nمرحبا" };
  assert.equal(privateEmailContentSchema.safeParse(valid).success, true);
  assert.equal(privateEmailContentSchema.safeParse({ ...valid, attachments: [{ name: "file.pdf", path: "invalid" }] }).success, false);
  await assert.rejects(readPrivateEmailJson(new Request("https://www.hathorcruise.com", { method: "POST", body: "x".repeat(32 * 1024 + 1) })));
  await assert.rejects(readPrivateEmailJson(new Request("https://www.hathorcruise.com", { method: "POST", body: "invalid-json" })));
  for (const invalid of [{ ...valid, to: "a@example.com,b@example.com" }, { ...valid, to: "Name <a@example.com>" }, { ...valid, subject: "Hello\r\nBcc: other@example.com" }, { ...valid, recipientName: "Amira\nBCC" }, { ...valid, from: "attacker@example.com" }, { ...valid, message: "x".repeat(6001) }]) assert.equal(privateEmailContentSchema.safeParse(invalid).success, false);
  assert.equal(mailboxDisplayName('"Amira Nassar" <guest@example.com>'), "Amira Nassar");
  assert.equal(correspondentLabel(null, "guest@example.com"), "guest@example.com");
  const html = await render(PrivateMessageEmail({ recipientName: '<script>alert(1)</script>', subject: "A private note", message: '<img src=x onerror=alert(1)>\n\nYour message', ...buildEmailSendTheme(getDefaultEmailTemplate("BookingMessage")) }));
  assert.match(html, /Luxury Hathor Dahabiya cruise on the Nile/);
  assert.match(html, /reservations@hathorcruise.com/);
  assert.match(html, /A personal note/);
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.ok(!html.includes("<img src=x"));
  assert.ok(!buildEmailHtmlDocument(html).includes("<img"));
  const normal = fixture();
  assert.equal((await sendPrivateEmail(normal.input, "session", normal)).status, "SENT");
  assert.equal((await sendPrivateEmail(normal.input, "session", normal)).status, "SENT");
  assert.equal(normal.calls(), 1);
  assert.deepEqual((normal.payloads[0] as { to: string[] }).to, ["guest@example.com"]);
  assert.equal((normal.payloads[0] as { reply_to: string }).reply_to, "reservations@hathorcruise.com");
  await assert.rejects(sendPrivateEmail({ ...normal.input, subject: "Changed" }, "session", normal));
  await assert.rejects(sendPrivateEmail(normal.input, "other-session", normal));
  const unknown = fixture({ uncertain: true });
  assert.equal((await sendPrivateEmail(unknown.input, "session", unknown)).status, "PENDING");
  assert.equal((await sendPrivateEmail(unknown.input, "session", unknown)).status, "SENT");
  assert.deepEqual(unknown.payloads[0], unknown.payloads[1], "Retries must use the exact stored HTML and original payload");
  const withFiles = fixture({ attachments: true, uncertain: true });
  assert.equal((await sendPrivateEmail(withFiles.input, "session", withFiles)).status, "PENDING");
  assert.equal((await sendPrivateEmail(withFiles.input, "session", withFiles)).status, "SENT");
  assert.deepEqual(withFiles.payloads[0], withFiles.payloads[1], "Refreshing signed URLs must not change the idempotent attachment payload");
  assert.deepEqual((withFiles.payloads[0] as { attachments: unknown[] }).attachments, [{ filename: "receipt.pdf", content: Buffer.from("%PDF-1.4\nSynthetic receipt").toString("base64") }]);
  assert.ok(!JSON.stringify(withFiles.row()).includes("https://example.com/"), "History must not expose signed delivery URLs");
  assert.ok(!JSON.stringify(withFiles.row()).includes("Synthetic receipt"), "File content must stay out of database history");
  await assert.rejects(sendPrivateEmail({ ...withFiles.input, attachments: [] }, "session", withFiles));
  await assert.rejects(sendPrivateEmail(withFiles.input, "other-session", withFiles));
  const changedFile = fixture({ attachments: true, uncertain: true });
  assert.equal((await sendPrivateEmail(changedFile.input, "session", changedFile)).status, "PENDING");
  await assert.rejects(sendPrivateEmail(changedFile.input, "session", { ...changedFile, resolveAttachments: async (...args) => (await changedFile.resolveAttachments(...args)).map(file => ({ ...file, contentHash: "changed" })) }));
  assert.equal(changedFile.calls(), 1);
  const invalidFile = fixture({ attachments: true });
  await assert.rejects(sendPrivateEmail(invalidFile.input, "session", { ...invalidFile, resolveAttachments: async () => { throw new Error("Invalid file"); } }));
  assert.equal(invalidFile.row(), undefined, "Reject files before storing a send request");
  assert.equal(invalidFile.calls(), 0);
  const leased = fixture({ noLease: true });
  assert.equal((await sendPrivateEmail(leased.input, "session", leased)).status, "PENDING");
  assert.equal(leased.calls(), 0);
  const failed = fixture({ failed: true });
  assert.equal((await sendPrivateEmail(failed.input, "session", failed)).status, "FAILED");
  const delayedHistory = fixture({ finishFails: true });
  assert.equal((await sendPrivateEmail(delayedHistory.input, "session", delayedHistory)).status, "SENT");
  const storedHtml = await receivedEmailHtmlDocument("general", randomUUID(), false, { query: (async () => [{ direction: "OUTBOUND", bodyHtml: html, resendEmailId: null }]) as typeof bookingQuery, request: async () => { throw new Error("Sent HTML must not call the received-email API"); } });
  assert.match(storedHtml, /A personal note/);
  for (const route of [sendPOST, previewPOST, uploadPOST]) assert.equal((await route(new NextRequest("https://www.hathorcruise.com/api/admin/inbox/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(valid) }))).status, 401);
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  try {
    process.env.RESEND_API_KEY = "isolated-test-key";
    const deliveryId = randomUUID();
    globalThis.fetch = async (url, options) => {
      assert.equal(url, "https://api.resend.com/emails");
      assert.equal((options?.headers as Record<string, string>)["Idempotency-Key"], `dashboard-private/${normal.input.requestId}`);
      assert.equal((options?.headers as Record<string, string>).Authorization, "Bearer isolated-test-key");
      return new Response(JSON.stringify({ id: deliveryId }), { status: 200 });
    };
    assert.equal(await deliverPrivateEmail(normal.payloads[0] as Parameters<typeof deliverPrivateEmail>[0], normal.input.requestId), deliveryId);
    globalThis.fetch = async () => new Response("{}", { status: 422 });
    await assert.rejects(deliverPrivateEmail(normal.payloads[0] as Parameters<typeof deliverPrivateEmail>[0], normal.input.requestId), error => error instanceof PrivateEmailDeliveryError && error.definitive);
    globalThis.fetch = async () => new Response("{}", { status: 429 });
    await assert.rejects(deliverPrivateEmail(normal.payloads[0] as Parameters<typeof deliverPrivateEmail>[0], normal.input.requestId), error => error instanceof PrivateEmailDeliveryError && !error.definitive);
  } finally { globalThis.fetch = originalFetch; if (originalKey === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalKey; }
  console.log("Private email tests passed: branded escaping, input validation, fixed sender, immutable retries, session binding, lease/expiry safeguards, uncertain status, sent history and protected APIs.");
}

main().catch(error => { console.error(error instanceof assert.AssertionError ? error.message : "Private email tests failed"); process.exitCode = 1; });
