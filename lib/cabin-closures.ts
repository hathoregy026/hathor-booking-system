import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";

/*
 * Closing cabins on one sailing: the inventory block the booking engine already
 * honours (InventoryAllocation without a booking line). Shared by Availability
 * and by Bookings -> Add booking, which closes the cabins for a guest.
 */

export const CLOSURE_STATES = ["MANUAL_BLOCK", "MAINTENANCE", "CHARTER_BLOCK"] as const;
export type ClosureStateValue = (typeof CLOSURE_STATES)[number];
export const cabinId = z.string().regex(/^(K0[1-6]|T0[12]|S0[12]|R0[12])$/);

export type SailingResult = {
  scheduleId: string;
  departure: string | null;
  closed: string[];
  skipped: { roomId: string; why: string }[];
  error?: string;
};

/** The vessel-wide lock every booking write takes (lib/booking-engine lockVessel). */
export const VESSEL_LOCK = 734821901;

type CloseRow = {
  sailing: { id: string; departure: string } | null;
  existing: string[];
  wanted: number;
  taken: { roomId: string; state: string; booking: boolean }[];
  inserted: string[];
};

/**
 * Closes cabins on one sailing in a single atomic statement, the way this
 * codebase writes inventory: one statement per connection, so a dropped link
 * can never leave a transaction open holding the vessel lock. Inside it: take
 * the vessel lock, expire stale holds, read the sailing and what already
 * occupies each cabin, and insert blocks only for the free ones. A charter
 * inserts nothing unless every cabin is free. A retry with the same block key
 * inserts nothing and returns what the first attempt wrote. The exclusion
 * constraint still refuses any overlap a concurrent booking might create.
 */
export async function closeOnSailing(
  scheduleId: string,
  blockKey: string,
  state: ClosureStateValue,
  roomIds: string[],
  reason: string,
): Promise<SailingResult> {
  const [row] = await bookingQuery<CloseRow>(`
    WITH vessel AS MATERIALIZED (SELECT pg_advisory_xact_lock(${VESSEL_LOCK}) AS locked),
    expired AS MATERIALIZED (SELECT hathor_expire_holds() AS done FROM vessel),
    sailing AS MATERIALIZED (
      SELECT s.id, s."departureTime", s."arrivalTime", s."cruiseId"
      FROM "CruiseSchedule" s JOIN "Cruise" c ON c.id = s."cruiseId", expired
      WHERE s.id = $1 AND s."isBookable" AND s."departureTime" > clock_timestamp() AND c."deletedAt" IS NULL
    ),
    existing AS MATERIALIZED (
      SELECT a."roomId" FROM "InventoryAllocation" a, vessel WHERE a."blockKey" = $2
    ),
    wanted AS MATERIALIZED (
      SELECT r.id FROM sailing s
      JOIN "_CruiseRooms" cr ON cr."A" = s."cruiseId"
      JOIN "Room" r ON r.id = cr."B"
      WHERE r."deletedAt" IS NULL AND ($3 = 'CHARTER_BLOCK' OR r.id = ANY($4::text[]))
    ),
    taken AS MATERIALIZED (
      SELECT DISTINCT ON (a."roomId") a."roomId", a.state, a."bookingRoomId" IS NOT NULL AS booking
      FROM "InventoryAllocation" a JOIN wanted w ON w.id = a."roomId", sailing s
      WHERE a.active AND a."startsAt" < s."arrivalTime" AND a."endsAt" > s."departureTime"
        AND (a."expiresAt" IS NULL OR a."expiresAt" > clock_timestamp())
      ORDER BY a."roomId", a."bookingRoomId" NULLS LAST
    ),
    inserted AS (
      INSERT INTO "InventoryAllocation" ("roomId", "startsAt", "endsAt", state, "blockKey", reason)
      SELECT w.id, s."departureTime", s."arrivalTime", $3, $2, $5
      FROM wanted w, sailing s
      WHERE NOT EXISTS (SELECT 1 FROM existing)
        AND NOT EXISTS (SELECT 1 FROM taken t WHERE t."roomId" = w.id)
        AND NOT ($3 = 'CHARTER_BLOCK' AND EXISTS (SELECT 1 FROM taken))
      RETURNING "roomId"
    )
    SELECT
      (SELECT json_build_object('id', id, 'departure', to_char("departureTime", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) FROM sailing) AS sailing,
      (SELECT coalesce(json_agg("roomId" ORDER BY "roomId"), '[]'::json) FROM existing) AS existing,
      (SELECT count(*)::int FROM wanted) AS wanted,
      (SELECT coalesce(json_agg(json_build_object('roomId', "roomId", 'state', state, 'booking', booking)), '[]'::json) FROM taken) AS taken,
      (SELECT coalesce(json_agg("roomId" ORDER BY "roomId"), '[]'::json) FROM inserted) AS inserted
  `, [scheduleId, blockKey, state, roomIds, reason]);

  if (!row?.sailing) return { scheduleId, departure: null, closed: [], skipped: [], error: "This sailing is no longer open." };
  const departure = row.sailing.departure;
  if (row.existing.length) return { scheduleId, departure, closed: row.existing, skipped: [] };
  if (!row.wanted) return { scheduleId, departure, closed: [], skipped: [], error: "None of these cabins sails on this voyage." };
  const skipped = row.taken.map(entry => ({
    roomId: entry.roomId,
    why: entry.booking ? (entry.state === "HELD" ? "on hold for a guest" : entry.state === "CONFIRMED" ? "booked" : "requested by a guest") : "already closed",
  }));
  if (state === "CHARTER_BLOCK" && skipped.length) {
    return { scheduleId, departure, closed: [], skipped, error: "Not every cabin is free on this date, so the ship was not chartered." };
  }
  return { scheduleId, departure, closed: row.inserted, skipped };
}

