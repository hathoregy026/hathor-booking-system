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

function fixture(options: { uncertain?: boolean; failed?: boolean; noLease?: boolean; finishFails?: boolean } = {}) {
  const input = privateEmailSendSchema.parse({ requestId: randomUUID(), to: "guest@example.com", recipientName: "Amira", subject: "Your Hathor note", message: "Hello\n\nYour private message." });
  let row: Record<string, unknown> | undefined;
  let calls = 0;
  const payloads: unknown[] = [];
  const query = (async (sql: string, values: unknown[] = []) => {
    assert.ok(!/UPDATE "Booking"|DELETE|TRUNCATE/.test(sql));
    if (sql.startsWith("SELECT")) return row ? [row] : [];
    if (sql.startsWith("INSERT")) {
      row ??= { id: values[0], direction: "OUTBOUND", status: "PENDING", sender: values[1], recipient: values[2], correspondentName: values[3], subject: values[4], bodyText: values[5], bodyHtml: values[6], requestFingerprint: values[7], recordedBySession: values[8], createdAt: new Date() };
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
  return { input, query, deliver, render: async () => "<p>Immutable branded email</p>", calls: () => calls, payloads };
}

async function main() {
  process.env.RESEND_FROM_EMAIL = "Hathor Dahabiya <reservations@hathorcruise.com>";
  const valid = { to: "guest@example.com", recipientName: "Amira", subject: "Hello", message: "Hello\nمرحبا" };
  assert.equal(privateEmailContentSchema.safeParse(valid).success, true);
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
  const leased = fixture({ noLease: true });
  assert.equal((await sendPrivateEmail(leased.input, "session", leased)).status, "PENDING");
  assert.equal(leased.calls(), 0);
  const failed = fixture({ failed: true });
  assert.equal((await sendPrivateEmail(failed.input, "session", failed)).status, "FAILED");
  const delayedHistory = fixture({ finishFails: true });
  assert.equal((await sendPrivateEmail(delayedHistory.input, "session", delayedHistory)).status, "SENT");
  const storedHtml = await receivedEmailHtmlDocument("general", randomUUID(), false, { query: (async () => [{ direction: "OUTBOUND", bodyHtml: html, resendEmailId: null }]) as typeof bookingQuery, request: async () => { throw new Error("Sent HTML must not call the received-email API"); } });
  assert.match(storedHtml, /A personal note/);
  for (const route of [sendPOST, previewPOST]) assert.equal((await route(new NextRequest("https://www.hathorcruise.com/api/admin/inbox/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(valid) }))).status, 401);
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
