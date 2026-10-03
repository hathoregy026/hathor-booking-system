import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import type { InboxDetail, InboxPage, InboxSource } from "@/lib/inbox-types";
import { emailDisplayPreview } from "@/lib/email-display";

export const inboxIdentitySchema = z.object({ source: z.enum(["booking", "general"]), id: z.uuid() });
export const inboxQuerySchema = z.object({
  q: z.string().trim().max(120).default(""),
  filter: z.enum(["all", "unread", "received", "sent"]).default("all"),
  before: z.iso.datetime().optional(),
  cursorId: z.uuid().optional(),
  cursorSource: z.enum(["booking", "general"]).optional(),
}).refine(value => [value.before, value.cursorId, value.cursorSource].filter(Boolean).length % 3 === 0, { message: "Invalid cursor" });

const receivedMessages = `
  SELECT m.id, 'booking'::text AS source, m."bookingId", m.sender, m.recipient, m.subject, m."bodyText", m.attachments,
    m."senderMatchesGuest", m."readAt", m."createdAt", m.direction, m.status,
    CASE WHEN m.direction = 'OUTBOUND' OR m."senderMatchesGuest" THEN
      COALESCE(NULLIF(TRIM(b."customerName"), ''), NULLIF(TRIM(CONCAT_WS(' ', b."firstName", b."lastName")), ''))
      ELSE NULL END AS "correspondentName"
    FROM "BookingMessage" m JOIN "Booking" b ON b.id = m."bookingId"
  UNION ALL
  SELECT id, 'general'::text AS source, NULL::text AS "bookingId", sender, recipient, subject, "bodyText", attachments,
    TRUE AS "senderMatchesGuest", "readAt", "createdAt", direction, status, "correspondentName" FROM "InboxMessage"`;

type InboxRow = Omit<InboxDetail, "createdAt" | "readAt"> & { createdAt: Date; readAt: Date | null };
function dates(row: InboxRow): InboxDetail {
  return { ...row, createdAt: row.createdAt.toISOString(), readAt: row.readAt?.toISOString() ?? null };
}

export async function fetchDashboardInbox(input: z.infer<typeof inboxQuerySchema>, query = bookingQuery): Promise<InboxPage> {
  const pattern = `%${input.q.replace(/[\\%_]/g, "\\$&")}%`;
  const rows = await query<InboxRow>(
    `WITH received AS (${receivedMessages})
     SELECT id, source, "bookingId", sender, recipient, "correspondentName", direction, status, subject, LEFT("bodyText", 160) AS preview,
       jsonb_array_length(attachments) AS "attachmentCount", "createdAt", "readAt"
     FROM received WHERE (sender ILIKE $1 OR recipient ILIKE $1 OR "correspondentName" ILIKE $1 OR subject ILIKE $1)
       AND ($2 = 'all' OR ($2 = 'unread' AND direction = 'INBOUND' AND "readAt" IS NULL)
         OR ($2 = 'received' AND direction = 'INBOUND') OR ($2 = 'sent' AND direction = 'OUTBOUND'))
       AND ($3::timestamp IS NULL OR ("createdAt", source, id) < ($3::timestamp, $4::text, $5::text))
     ORDER BY "createdAt" DESC, source DESC, id DESC LIMIT 26`,
    [pattern, input.filter, input.before ?? null, input.cursorSource ?? null, input.cursorId ?? null]);
  const [count] = await query<{ all: number; unread: number; received: number; sent: number }>(`WITH received AS (${receivedMessages})
    SELECT COUNT(*)::int AS "all", COUNT(*) FILTER (WHERE direction = 'INBOUND' AND "readAt" IS NULL)::int AS unread,
      COUNT(*) FILTER (WHERE direction = 'INBOUND')::int AS received, COUNT(*) FILTER (WHERE direction = 'OUTBOUND')::int AS sent FROM received`);
  const counts = count ?? { all: 0, unread: 0, received: 0, sent: 0 };
  return { messages: rows.slice(0, 25).map(row => ({ ...dates(row), preview: emailDisplayPreview(row.preview) })), hasOlder: rows.length > 25, unreadCount: counts.unread, counts };
}

export async function fetchInboxDetail(source: InboxSource, id: string, query = bookingQuery): Promise<InboxDetail | null> {
  const [row] = await query<InboxRow>(
    `WITH received AS (${receivedMessages}) SELECT *, LEFT("bodyText", 160) AS preview,
      jsonb_array_length(attachments) AS "attachmentCount" FROM received WHERE source = $1 AND id = $2`, [source, id]);
  return row ? dates(row) : null;
}

export async function setInboxRead(source: InboxSource, id: string, read: boolean, query = bookingQuery): Promise<boolean> {
  const rows = source === "booking"
    ? await query(`UPDATE "BookingMessage" SET "readAt" = CASE WHEN $2 THEN NOW() END WHERE id = $1 AND direction = 'INBOUND' RETURNING id`, [id, read])
    : await query(`UPDATE "InboxMessage" SET "readAt" = CASE WHEN $2 THEN NOW() END WHERE id = $1 AND direction = 'INBOUND' RETURNING id`, [id, read]);
  return rows.length > 0;
}
