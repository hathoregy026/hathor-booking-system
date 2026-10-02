import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { Webhook } from "standardwebhooks";
import { NextRequest } from "next/server";
import {
  BOOKING_MAIL_ORIGIN, bookingReplyAddress, bookingReplyToken, inboundBookingEmailEnabled,
  mailboxAddress, newBookingReplyToken,
} from "../lib/booking-email-routing";
import {
  EmailBodyTooLargeError, incomingBodyText, isAutomaticEmail, processReceivedBookingEmail,
  readLimitedEmailBody, receivedEmailEventSchema, verifyResendWebhook,
} from "../lib/resend-inbound";
import { POST } from "../app/api/webhooks/resend/route";
import { GET as messagesGET } from "../app/api/admin/bookings/[id]/messages/route";
import { GET as attachmentGET } from "../app/api/admin/bookings/[id]/messages/[messageId]/attachments/[attachmentId]/route";
import type { bookingQuery } from "../lib/booking-database";

const token = newBookingReplyToken();
const address = bookingReplyAddress(token);
const emailId = randomUUID();
const event = { type: "email.received" as const, data: { email_id: emailId, to: [address] } };
const secret = `whsec_${randomBytes(32).toString("base64")}`;

function signedHeaders(payload: string, date = new Date()): Headers {
  const id = randomUUID();
  return new Headers({
    "svix-id": id, "svix-timestamp": String(Math.floor(date.getTime() / 1000)),
    "svix-signature": new Webhook(secret).sign(id, date, payload),
    "content-type": "application/json",
  });
}

function processorFixture(options: { notificationFails?: boolean; wrongRecipient?: boolean; automatic?: boolean; unknownToken?: boolean } = {}) {
  let stored: Record<string, unknown> | null = null;
  let emailReads = 0;
  let notifications = 0;
  let inserts = 0;
  let failNotification = options.notificationFails ?? false;
  const query = (async (sql: string, values: unknown[] = []) => {
    if (sql.includes('FROM "BookingEmailThread"')) return options.unknownToken ? [] : [{ bookingId: "test-booking", customerEmail: "guest@example.com" }];
    if (sql.startsWith("SELECT")) return stored ? [stored] : [];
    if (sql.startsWith('INSERT INTO "BookingMessage"')) {
      inserts += 1;
      stored = {
        id: values[0], bookingId: values[1], sender: values[2], subject: values[4], bodyText: values[5],
        attachments: JSON.parse(values[8] as string), senderMatchesGuest: values[9], notificationSentAt: null,
      };
      return [stored];
    }
    if (sql.includes("INTERVAL '60 seconds'")) return [{ id: stored!.id }];
    if (sql.includes('"notificationSentAt" = NOW()')) stored!.notificationSentAt = new Date();
    return [];
  }) as typeof bookingQuery;
  const request = async (path: string, body?: unknown, idempotencyKey?: string) => {
    if (path.startsWith("/emails/receiving/")) {
      emailReads += 1;
      return {
        id: emailId, from: "Guest <guest@example.com>", to: [options.wrongRecipient ? "unknown@reply.hathorcruise.com" : address],
        subject: "My receipt", text: "Attached is the receipt.", html: null, message_id: "<guest-receipt@example.com>",
        created_at: new Date().toISOString(), headers: options.automatic ? { "Auto-Submitted": "auto-replied" } : {},
        attachments: [{ id: randomUUID(), filename: "receipt.pdf", content_type: "application/pdf" }],
      };
    }
    notifications += 1;
    assert.equal(idempotencyKey, `booking-reply-notification/${emailId}`);
    assert.deepEqual((body as { to: string[] }).to, ["reservations@hathorcruise.com"]);
    assert.match((body as { text: string }).text, /https:\/\/hathorcruise\.com\/admin\/bookings\/test-booking/);
    if (failNotification) { failNotification = false; throw new Error("Temporary email failure"); }
    return { id: randomUUID() };
  };
  return { query, request, counts: () => ({ emailReads, notifications, inserts }), message: () => stored };
}

async function main() {
  assert.equal(BOOKING_MAIL_ORIGIN, "https://hathorcruise.com");
  assert.match(token, /^[a-f0-9]{48}$/);
  assert.equal(bookingReplyToken([address]), token);
  assert.equal(bookingReplyToken([`Hathor <${address}>`]), token);
  assert.equal(bookingReplyToken([address, address]), token);
  assert.equal(bookingReplyToken([address, bookingReplyAddress(newBookingReplyToken())]), null);
  assert.equal(bookingReplyToken([address.replace(".com", ".com.evil.example")]), null);
  assert.equal(bookingReplyToken(["HB-123@reply.hathorcruise.com"]), null);
  assert.equal(mailboxAddress("guest@example.com\r\nBcc: injected@example.com"), null);
  assert.throws(() => bookingReplyAddress("short"));

  const payload = JSON.stringify(event);
  const headers = signedHeaders(payload);
  assert.deepEqual(verifyResendWebhook(payload, headers, secret), event);
  assert.throws(() => verifyResendWebhook(payload.replace("email.received", "email.sent"), headers, secret));
  assert.throws(() => verifyResendWebhook(payload, new Headers(), secret));
  assert.throws(() => verifyResendWebhook(payload, signedHeaders(payload, new Date(Date.now() - 10 * 60000)), secret));
  assert.equal(receivedEmailEventSchema.safeParse({ ...event, data: { ...event.data, email_id: "../../secrets" } }).success, false);

  assert.equal(incomingBodyText(null, '<script>alert(1)</script><p>Hello &amp; welcome</p><img src="https://tracker.example">'), "Hello & welcome");
  assert.equal(incomingBodyText("<script>plain text</script>", null), "<script>plain text</script>");
  assert.equal(incomingBodyText("x".repeat(64001), null).length, 64000);
  assert.equal(isAutomaticEmail({ "Auto-Submitted": "auto-replied" }), true);
  assert.equal(isAutomaticEmail({ "auto-submitted": "no" }), false);
  assert.equal(await readLimitedEmailBody(new Response("small"), 8), "small");
  await assert.rejects(readLimitedEmailBody(new Response("too large"), 4), EmailBodyTooLargeError);
  await assert.rejects(readLimitedEmailBody(new Response("ééé"), 4), EmailBodyTooLargeError);

  const originalEnv = { enabled: process.env.RESEND_INBOUND_ENABLED, secret: process.env.RESEND_WEBHOOK_SECRET, inbox: process.env.BOOKING_REPLY_NOTIFICATION_EMAIL };
  try {
    process.env.BOOKING_REPLY_NOTIFICATION_EMAIL = "reservations@hathorcruise.com";
    process.env.RESEND_INBOUND_ENABLED = "false";
    process.env.RESEND_WEBHOOK_SECRET = secret;
    assert.equal(inboundBookingEmailEnabled(), false);
    assert.equal((await POST(new Request("https://hathorcruise.com/api/webhooks/resend", { method: "POST", body: payload }))).status, 503);
    process.env.RESEND_INBOUND_ENABLED = "true";
    assert.equal(inboundBookingEmailEnabled(), true);
    assert.equal((await POST(new Request("https://hathorcruise.com/api/webhooks/resend", { method: "POST", body: payload }))).status, 400);
    const otherEvent = JSON.stringify({ type: "email.delivered" });
    assert.equal((await POST(new Request("https://hathorcruise.com/api/webhooks/resend", { method: "POST", body: otherEvent, headers: signedHeaders(otherEvent) }))).status, 200);

    const fixture = processorFixture();
    await processReceivedBookingEmail(event, fixture);
    await processReceivedBookingEmail(event, fixture);
    assert.deepEqual(fixture.counts(), { emailReads: 1, notifications: 1, inserts: 1 });
    assert.equal(fixture.message()!.senderMatchesGuest, true);

    const retry = processorFixture({ notificationFails: true });
    await assert.rejects(processReceivedBookingEmail(event, retry));
    assert.ok(retry.message(), "Reply must survive notification failure");
    await processReceivedBookingEmail(event, retry);
    assert.deepEqual(retry.counts(), { emailReads: 1, notifications: 2, inserts: 1 });

    const mismatch = processorFixture({ wrongRecipient: true });
    await assert.rejects(processReceivedBookingEmail(event, mismatch));
    assert.deepEqual(mismatch.counts(), { emailReads: 1, notifications: 0, inserts: 0 });
    const automatic = processorFixture({ automatic: true });
    await processReceivedBookingEmail(event, automatic);
    assert.equal(automatic.counts().inserts, 0);
    const unknown = processorFixture({ unknownToken: true });
    await processReceivedBookingEmail(event, unknown);
    assert.deepEqual(unknown.counts(), { emailReads: 0, notifications: 0, inserts: 0 });

    const params = Promise.resolve({ id: "test-booking" });
    assert.equal((await messagesGET(new NextRequest("https://hathorcruise.com/api/admin/bookings/test-booking/messages"), { params })).status, 401);
    const attachmentParams = Promise.resolve({ id: "test-booking", messageId: randomUUID(), attachmentId: randomUUID() });
    assert.equal((await attachmentGET(new NextRequest("https://hathorcruise.com/api/admin/bookings/test-booking/messages/file"), { params: attachmentParams })).status, 401);
  } finally {
    for (const [key, value] of Object.entries({ RESEND_INBOUND_ENABLED: originalEnv.enabled, RESEND_WEBHOOK_SECRET: originalEnv.secret, BOOKING_REPLY_NOTIFICATION_EMAIL: originalEnv.inbox })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
  console.log("PASS: reply routing, signatures/replay expiry, bounded email bodies, deduplication, notification recovery, mismatch rejection, loop prevention, and admin authorization.");
}

main().catch(error => { console.error(error); process.exitCode = 1; });
