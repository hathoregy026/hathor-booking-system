import { randomUUID } from "node:crypto";
import { bookingQuery } from "@/lib/booking-database";
import { bookingReplyAddress, newBookingReplyToken, inboundBookingEmailEnabled } from "@/lib/booking-email-routing";
import type { BookingMessageDto, BookingAttachment } from "@/lib/booking-message-types";

export async function getBookingReplyAddress(bookingId: string): Promise<string | undefined> {
  if (!inboundBookingEmailEnabled()) return undefined;
  const rows = await bookingQuery<{ replyToken: string }>(
    `INSERT INTO "BookingEmailThread" ("bookingId", "replyToken") VALUES ($1, $2)
     ON CONFLICT ("bookingId") DO UPDATE SET "bookingId" = EXCLUDED."bookingId"
     RETURNING "replyToken"`,
    [bookingId, newBookingReplyToken()],
  );
  return bookingReplyAddress(rows[0]!.replyToken);
}

export async function beginOutboundBookingMessage(input: {
  bookingId: string; sender: string; recipient: string; subject: string; bodyText: string; recordedBySession?: string;
  attachments?: BookingAttachment[];
}): Promise<string> {
  const id = randomUUID();
  await bookingQuery(
    `INSERT INTO "BookingMessage" (id, "bookingId", direction, status, sender, recipient, subject, "bodyText", "recordedBySession", attachments)
     VALUES ($1, $2, 'OUTBOUND', 'PENDING', $3, $4, $5, $6, $7, $8::jsonb)`,
    [id, input.bookingId, input.sender, input.recipient, input.subject, input.bodyText.slice(0, 64000), input.recordedBySession ?? null, JSON.stringify(input.attachments ?? [])],
  );
  return id;
}

export async function finishOutboundBookingMessage(id: string, resendEmailId: string | null): Promise<void> {
  await bookingQuery(`UPDATE "BookingMessage" SET status = $2, "resendEmailId" = $3 WHERE id = $1`,
    [id, resendEmailId ? "SENT" : "FAILED", resendEmailId]);
}

export async function fetchBookingMessages(bookingId: string, before?: { createdAt: string; id: string }): Promise<BookingMessageDto[]> {
  const rows = await bookingQuery<Omit<BookingMessageDto, "createdAt"> & { createdAt: Date }>(
    `SELECT id, direction, status, sender, subject, "bodyText", "senderMatchesGuest", attachments, "createdAt"
     FROM "BookingMessage" WHERE "bookingId" = $1
     AND ($2::timestamp IS NULL OR ("createdAt", id) < ($2::timestamp, $3::text))
     ORDER BY "createdAt" DESC, id DESC LIMIT 10`,
    [bookingId, before?.createdAt ?? null, before?.id ?? null],
  );
  return rows.map(row => ({ ...row, createdAt: row.createdAt.toISOString() }));
}
