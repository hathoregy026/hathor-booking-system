import { NextRequest, NextResponse } from "next/server";
import { adminApiGuard, adminIdentityFromRequest } from "@/lib/admin-server-auth";
import { allowedMailboxIds } from "@/lib/admin-mailbox-access";
import { bookingQuery } from "@/lib/booking-database";
import { logDbError } from "@/lib/db-safe";
import type { CharterManualDto, CharterRequestDto } from "@/lib/admin-charters";

/*
 * Charters, for the header alert and the Bookings → Charters list: requests
 * sent through the website's charter form (kept as emails), and whole-ship
 * charters closed by hand on Availability. Requests only show to people who
 * may read the mailbox they arrived in.
 */

export const dynamic = "force-dynamic";
const NO_STORE = { "Cache-Control": "private, no-store" };

type RequestRow = { id: string; name: string | null; sender: string; subject: string | null; preview: string | null; createdAt: Date; readAt: Date | null };
type ManualRow = { blockKey: string; createdAt: Date; startsAt: Date; endsAt: Date; reason: string | null; guestName: string | null; voyage: string | null };


export async function GET(request: NextRequest) {
  const denied = await adminApiGuard("bookings.view");
  if (denied) return denied;
  try {
    const identity = await adminIdentityFromRequest(request);
    const mailboxes = identity ? allowedMailboxIds(identity) : [];
    const [requests, manual] = await Promise.all([
      mailboxes.length
        ? bookingQuery<RequestRow>(`
            SELECT m.id, m."correspondentName" AS name, m.sender, m.subject, left(m."bodyText", 240) AS preview, m."createdAt", m."readAt"
              FROM "InboxMessage" m
             WHERE m.origin = 'CHARTER_FORM' AND m.direction = 'INBOUND'
               AND COALESCE(m.folder, 'inbox') = 'inbox'
               AND m."createdAt" > clock_timestamp() - interval '180 days'
               AND NOT EXISTS (SELECT 1 FROM "DashboardEmailDeletion" d WHERE d.source = 'general' AND d."messageId" = m.id)
               AND COALESCE((SELECT p."mailboxId" FROM "DashboardEmailPlacement" p WHERE p.source = 'general' AND p."messageId" = m.id), m."mailboxId") = ANY($1::text[])
             ORDER BY m."createdAt" DESC
             LIMIT 50`, [mailboxes])
        : Promise.resolve([] as RequestRow[]),
      bookingQuery<ManualRow>(`
        SELECT a."blockKey", min(a."createdAt") AS "createdAt", a."startsAt", a."endsAt", a.reason, d."guestName", src.name AS voyage
          FROM "InventoryAllocation" a
          LEFT JOIN "ClosureBooking" d ON d."blockKey" = a."blockKey"
          LEFT JOIN LATERAL (
            SELECT c2.name FROM "CruiseSchedule" s2 JOIN "Cruise" c2 ON c2.id = s2."cruiseId"
             WHERE s2."departureTime" = a."startsAt" AND s2."arrivalTime" = a."endsAt"
             ORDER BY c2."deletedAt" NULLS FIRST LIMIT 1
          ) src ON true
         WHERE a.active AND a."bookingRoomId" IS NULL AND a."blockKey" IS NOT NULL AND a.state = 'CHARTER_BLOCK'
           AND (a."endsAt" > clock_timestamp() OR d."blockKey" IS NOT NULL)
         GROUP BY a."blockKey", a."startsAt", a."endsAt", a.reason, d."guestName", src.name
         ORDER BY min(a."createdAt") DESC
         LIMIT 50`),
    ]);
    return NextResponse.json({
      requests: requests.map(row => ({
        id: row.id,
        name: row.name?.trim() || row.sender,
        email: row.sender,
        subject: row.subject?.trim() || "Charter request",
        preview: (row.preview ?? "").replace(/\s+/g, " ").trim(),
        createdAt: row.createdAt.toISOString(),
        read: row.readAt !== null,
      })) satisfies CharterRequestDto[],
      manual: manual.map(row => ({
        blockKey: row.blockKey,
        name: row.guestName?.trim() || row.reason?.replace(/^(booked for|charter for)\s+/i, "").trim() || "Private charter",
        voyage: row.voyage,
        startsAt: row.startsAt.toISOString(),
        endsAt: row.endsAt.toISOString(),
        createdAt: row.createdAt.toISOString(),
      })) satisfies CharterManualDto[],
    }, { headers: NO_STORE });
  } catch (error) {
    logDbError("admin.charters.GET", error);
    return NextResponse.json({ error: "Could not load charters.", requests: [], manual: [] }, { status: 503, headers: NO_STORE });
  }
}
