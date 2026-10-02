import { randomUUID } from "node:crypto";
import { load } from "cheerio";
import { Resend } from "resend";
import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import { bookingCode } from "@/lib/booking-code";
import { BOOKING_MAIL_ORIGIN, bookingReplyInbox, bookingReplyToken, mailboxAddress } from "@/lib/booking-email-routing";
import { getResendFromAddress } from "@/lib/resend-config";
import type { BookingAttachment } from "@/lib/booking-message-types";

export class EmailBodyTooLargeError extends Error {}

export async function readLimitedEmailBody(response: Request | Response, limit: number): Promise<string> {
  if (Number(response.headers.get("content-length")) > limit) throw new EmailBodyTooLargeError();
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > limit) {
        await reader.cancel();
        throw new EmailBodyTooLargeError();
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    return text + decoder.decode();
  } finally { reader.releaseLock(); }
}

export function verifyResendWebhook(payload: string, headers: Headers, secret: string): unknown {
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");
  if (!id || !timestamp || !signature || !secret) throw new Error("Invalid webhook signature");
  return new Resend("webhook-verification-only").webhooks.verify({
    payload, headers: { id, timestamp, signature }, webhookSecret: secret,
  });
}

export const receivedEmailEventSchema = z.object({
  type: z.literal("email.received"),
  data: z.object({ email_id: z.uuid(), to: z.array(z.string().max(512)).max(100) }),
});

const incomingEmailSchema = z.object({
  id: z.uuid(),
  from: z.string().max(512),
  to: z.array(z.string().max(512)).max(100),
  subject: z.string().max(2000),
  text: z.string().nullable(),
  html: z.string().nullable(),
  message_id: z.string().max(998),
  created_at: z.iso.datetime({ offset: true }),
  headers: z.record(z.string(), z.string()).nullable(),
  attachments: z.array(z.object({
    id: z.uuid(), filename: z.string().max(512).nullable(), content_type: z.string().max(255),
  })).max(100),
});

export function incomingBodyText(text: string | null, html: string | null): string {
  let body = text;
  if (!body && html) {
    const document = load(html);
    document("script, style, head, iframe, object, embed").remove();
    document("br").replaceWith("\n");
    document("p, div, tr, li").append("\n");
    body = document.root().text();
  }
  return (body ?? "").replace(/\u0000/g, "").trim().slice(0, 64000);
}

export function isAutomaticEmail(headers: Record<string, string> | null): boolean {
  const normalized = Object.fromEntries(Object.entries(headers ?? {}).map(([key, value]) => [key.toLowerCase(), value]));
  return Boolean(normalized["auto-submitted"] && normalized["auto-submitted"].toLowerCase() !== "no")
    || /^(bulk|junk|list)$/i.test(normalized.precedence ?? "");
}

export async function resendApiRequest(path: string, body?: unknown, idempotencyKey?: string): Promise<unknown> {
  const key = process.env.RESEND_RECEIVING_API_KEY?.trim() || process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error("Email service is not configured");
  const response = await fetch(`https://api.resend.com${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(15000),
    redirect: "error",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Email service request failed (${response.status})`);
  return JSON.parse(await readLimitedEmailBody(response, 2 * 1024 * 1024)) as unknown;
}

type StoredIncomingMessage = {
  id: string; bookingId: string; sender: string; subject: string; bodyText: string;
  attachments: BookingAttachment[]; notificationSentAt: Date | null;
};

export async function processReceivedBookingEmail(
  event: z.infer<typeof receivedEmailEventSchema>,
  dependencies: { query?: typeof bookingQuery; request?: typeof resendApiRequest } = {},
): Promise<void> {
  const query = dependencies.query ?? bookingQuery;
  const request = dependencies.request ?? resendApiRequest;
  const token = bookingReplyToken(event.data.to);
  if (!token) return;
  const [thread] = await query<{ bookingId: string; customerEmail: string | null }>(
    `SELECT t."bookingId", b."customerEmail" FROM "BookingEmailThread" t
     JOIN "Booking" b ON b.id = t."bookingId" WHERE t."replyToken" = $1`, [token]);
  if (!thread) return;

  let [message] = await query<StoredIncomingMessage>(
    `SELECT id, "bookingId", sender, subject, "bodyText", attachments, "notificationSentAt"
     FROM "BookingMessage" WHERE "resendEmailId" = $1 AND "bookingId" = $2 AND direction = 'INBOUND'`,
    [event.data.email_id, thread.bookingId]);

  if (!message) {
    const email = incomingEmailSchema.parse(await request(`/emails/receiving/${event.data.email_id}?html_format=cid`));
    if (email.id !== event.data.email_id || bookingReplyToken(email.to) !== token) throw new Error("Incoming email routing mismatch");
    if (isAutomaticEmail(email.headers)) return;
    const sender = mailboxAddress(email.from);
    if (!sender) return;
    const attachments = email.attachments.map(attachment => ({
      id: attachment.id, filename: attachment.filename || "Attachment", contentType: attachment.content_type,
    }));
    const suppressNotification = sender === bookingReplyInbox();
    const rows = await query<StoredIncomingMessage>(
      `INSERT INTO "BookingMessage" (id, "bookingId", direction, status, sender, recipient, subject, "bodyText",
        "resendEmailId", "internetMessageId", attachments, "senderMatchesGuest", "createdAt", "notificationSentAt")
       VALUES ($1, $2, 'INBOUND', 'RECEIVED', $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, CASE WHEN $12 THEN NOW() END)
       ON CONFLICT ("resendEmailId") DO NOTHING
       RETURNING id, "bookingId", sender, subject, "bodyText", attachments, "notificationSentAt"`,
      [randomUUID(), thread.bookingId, sender, email.to.join(", "), email.subject.replace(/[\r\n\u0000]/g, " "),
        incomingBodyText(email.text, email.html), email.id, email.message_id, JSON.stringify(attachments),
        sender === thread.customerEmail?.toLowerCase(), new Date(email.created_at), suppressNotification]);
    message = rows[0];
    if (!message) {
      [message] = await query<StoredIncomingMessage>(
        `SELECT id, "bookingId", sender, subject, "bodyText", attachments, "notificationSentAt"
         FROM "BookingMessage" WHERE "resendEmailId" = $1 AND "bookingId" = $2`, [email.id, thread.bookingId]);
    }
  }
  if (!message || message.notificationSentAt) return;

  const claimed = await query<{ id: string }>(
    `UPDATE "BookingMessage" SET "notificationLeaseUntil" = NOW() + INTERVAL '60 seconds'
     WHERE id = $1 AND "notificationSentAt" IS NULL
     AND ("notificationLeaseUntil" IS NULL OR "notificationLeaseUntil" < NOW()) RETURNING id`, [message.id]);
  if (!claimed.length) throw new Error("Notification is being processed");
  try {
    const adminUrl = `${BOOKING_MAIL_ORIGIN}/admin/bookings/${encodeURIComponent(message.bookingId)}`;
    const files = message.attachments.map(attachment => attachment.filename).join(", ");
    await request("/emails", {
      from: getResendFromAddress(), to: [bookingReplyInbox()],
      subject: `Guest reply · ${bookingCode(message.bookingId)} · ${message.subject}`.slice(0, 240),
      reply_to: bookingReplyInbox(),
      text: `Guest reply from ${message.sender}\nBooking: ${bookingCode(message.bookingId)}\n\n${message.bodyText}\n\n${files ? `Attachments available in dashboard: ${files}\n\n` : ""}Read and reply in your dashboard:\n${adminUrl}\n\nUse the dashboard to reply so your message is saved in the conversation.`,
    }, `booking-reply-notification/${event.data.email_id}`);
    await query(`UPDATE "BookingMessage" SET "notificationSentAt" = NOW(), "notificationLeaseUntil" = NULL WHERE id = $1`, [message.id]);
  } catch {
    await query(`UPDATE "BookingMessage" SET "notificationLeaseUntil" = NULL WHERE id = $1`, [message.id]);
    throw new Error("Guest reply notification could not be completed");
  }
}
