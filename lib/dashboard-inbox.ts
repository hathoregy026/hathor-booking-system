import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import type { InboxDetail, InboxPage, InboxSource } from "@/lib/inbox-types";

export const inboxIdentitySchema = z.object({ source: z.enum(["booking", "general"]), id: z.uuid() });
export const inboxQuerySchema = z.object({
  q: z.string().trim().max(120).default(""),
  filter: z.enum(["all", "unread"]).default("all"),
  before: z.iso.datetime().optional(),
  cursorId: z.uuid().optional(),
  cursorSource: z.enum(["booking", "general"]).optional(),
}).refine(value => [value.before, value.cursorId, value.cursorSource].filter(Boolean).length % 3 === 0, { message: "Invalid cursor" });

const receivedMessages = `
  SELECT id, 'booking'::text AS source, "bookingId", sender, recipient, subject, "bodyText", attachments,
    "senderMatchesGuest", "readAt", "createdAt" FROM "BookingMessage" WHERE direction = 'INBOUND'
  UNION ALL
  SELECT id, 'general'::text AS source, NULL::text AS "bookingId", sender, recipient, subject, "bodyText", attachments,
    TRUE AS "senderMatchesGuest", "readAt", "createdAt" FROM "InboxMessage"`;

type InboxRow = Omit<InboxDetail, "createdAt" | "readAt"> & { createdAt: Date; readAt: Date | null };
function dates(row: InboxRow): InboxDetail {
  return { ...row, createdAt: row.createdAt.toISOString(), readAt: row.readAt?.toISOString() ?? null };
}

export async function fetchDashboardInbox(input: z.infer<typeof inboxQuerySchema>, query = bookingQuery): Promise<InboxPage> {
  const pattern = `%${input.q.replace(/[\\%_]/g, "\\$&")}%`;
  const rows = await query<InboxRow>(
    `WITH received AS (${receivedMessages})
     SELECT id, source, "bookingId", sender, subject, LEFT("bodyText", 160) AS preview,
       jsonb_array_length(attachments) AS "attachmentCount", "createdAt", "readAt"
     FROM received WHERE (sender ILIKE $1 OR subject ILIKE $1)
       AND ($2::boolean = FALSE OR "readAt" IS NULL)
       AND ($3::timestamp IS NULL OR ("createdAt", source, id) < ($3::timestamp, $4::text, $5::text))
     ORDER BY "createdAt" DESC, source DESC, id DESC LIMIT 26`,
    [pattern, input.filter === "unread", input.before ?? null, input.cursorSource ?? null, input.cursorId ?? null]);
  const [count] = await query<{ count: number }>(`WITH received AS (${receivedMessages}) SELECT COUNT(*)::int AS count FROM received WHERE "readAt" IS NULL`);
  return { messages: rows.slice(0, 25).map(dates), hasOlder: rows.length > 25, unreadCount: count?.count ?? 0 };
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
    : await query(`UPDATE "InboxMessage" SET "readAt" = CASE WHEN $2 THEN NOW() END WHERE id = $1 RETURNING id`, [id, read]);
  return rows.length > 0;
}
