import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import { ADMIN_PROFILE_ID } from "@/lib/admin-profile-constants";
import { notificationSnapshotSchema, type NotificationSnapshot } from "@/lib/admin-notification-types";
import { PublicRequestError } from "@/lib/public-api-security";

export const notificationSeenSchema = z.object({ seenThrough: z.iso.datetime() }).strict();

export async function fetchAdminNotifications(query = bookingQuery): Promise<NotificationSnapshot> {
  const [snapshot] = await query<NotificationSnapshot>(`
    WITH profile AS (
      SELECT COALESCE((SELECT "lastSeenBookingAt" FROM "AdminProfile" WHERE id = $1), '1970-01-01'::timestamp) AS seen
    ), requests AS (
      SELECT b.id, b."requestedAt" AS happened,
        COALESCE(NULLIF(TRIM(CONCAT_WS(' ', b."firstName", b."lastName")), ''), NULLIF(b."customerName", ''), 'Guest') AS name,
        c.name AS description
      FROM "Booking" b JOIN "CruiseSchedule" s ON s.id = b."cruiseScheduleId" JOIN "Cruise" c ON c.id = s."cruiseId"
      WHERE b.status IN ('REQUESTED', 'CONFIRMED') AND b."deletedAt" IS NULL AND b."requestedAt" IS NOT NULL
    ), emails AS (
      SELECT m.id, 'booking'::text AS source, m.sender AS name, m.subject AS description, m."createdAt" AS happened, m."readAt"
      FROM "BookingMessage" m JOIN "Booking" b ON b.id = m."bookingId" WHERE m.direction = 'INBOUND'
        AND NOT EXISTS (SELECT 1 FROM "DashboardEmailDeletion" d WHERE d.source = 'booking' AND d."messageId" = m.id)
      UNION ALL
      SELECT id, 'general'::text, COALESCE(NULLIF("correspondentName", ''), sender), subject, "createdAt", "readAt"
      FROM "InboxMessage" m WHERE direction = 'INBOUND'
        AND NOT EXISTS (SELECT 1 FROM "DashboardEmailDeletion" d WHERE d.source = 'general' AND d."messageId" = m.id)
    ), unseen AS (
      SELECT id, 'booking'::text AS kind, 'booking'::text AS source, name, description, happened
      FROM requests WHERE happened > (SELECT seen FROM profile)
      UNION ALL
      SELECT id, 'email'::text, source, name, description, happened FROM emails WHERE "readAt" IS NULL
    ), recent AS (
      (SELECT * FROM unseen WHERE kind = 'booking' ORDER BY happened DESC, source, id LIMIT 10)
      UNION ALL
      (SELECT * FROM unseen WHERE kind = 'email' ORDER BY happened DESC, source, id LIMIT 10)
    ), activity AS (
      (SELECT 'booking/' || id AS key, 'booking'::text AS kind FROM requests ORDER BY happened DESC, id DESC LIMIT 50)
      UNION ALL
      (SELECT 'email/' || source || '/' || id, 'email'::text FROM emails ORDER BY happened DESC, source DESC, id DESC LIMIT 50)
    )
    SELECT (SELECT COUNT(*)::int FROM unseen) AS "unreadCount",
      (SELECT COUNT(*)::int FROM unseen WHERE kind = 'booking') AS "bookingCount",
      (SELECT COUNT(*)::int FROM unseen WHERE kind = 'email') AS "emailCount",
      to_char(COALESCE((SELECT MAX(happened) FROM requests WHERE happened > (SELECT seen FROM profile)), (SELECT seen FROM profile)), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "bookingSeenThrough",
      COALESCE((SELECT jsonb_agg(jsonb_build_object('id', id, 'kind', kind, 'source', source, 'name', name, 'description', description, 'createdAt', to_char(happened, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) ORDER BY happened DESC, kind, source, id) FROM recent), '[]'::jsonb) AS items,
      COALESCE((SELECT jsonb_agg(jsonb_build_object('key', key, 'kind', kind)) FROM activity), '[]'::jsonb) AS activity
  `, [ADMIN_PROFILE_ID]);
  return notificationSnapshotSchema.parse(snapshot);
}

export async function markNotificationBookingsSeen(input: z.infer<typeof notificationSeenSchema>, query = bookingQuery): Promise<void> {
  const { seenThrough } = notificationSeenSchema.parse(input);
  const through = new Date(seenThrough);
  if (through.getTime() > Date.now()) throw new PublicRequestError("Invalid notification timestamp", 400);
  await query(`INSERT INTO "AdminProfile" (id, "displayName", "lastSeenBookingAt", "createdAt", "updatedAt")
    VALUES ($1, 'Admin', $2::timestamp, NOW(), NOW()) ON CONFLICT (id) DO UPDATE
    SET "lastSeenBookingAt" = GREATEST("AdminProfile"."lastSeenBookingAt", EXCLUDED."lastSeenBookingAt"), "updatedAt" = NOW()`, [ADMIN_PROFILE_ID, through]);
}
