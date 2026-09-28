import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import { assertBookingAdmin } from "@/lib/booking-admin-api";
import { bookingCode } from "@/lib/booking-code";
import { readPublicJsonBody, requireIdempotencyKey } from "@/lib/public-api-security";
import { handleRouteError } from "@/lib/api";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/admin-auth";
import { SHIP_EXPERIENCE_KEY } from "@/lib/ship-experience";
import { DEFAULT_SHIP_EXPERIENCE, shipRoomNames } from "@/lib/ship-experience-shared";
import { parseShipExperience } from "@/lib/ship-experience-schema";

/*
 * Dashboard → Availability. Closing a cabin writes the same inventory block the
 * booking engine already honours (InventoryAllocation without a booking line):
 * the public availability skips it, a hold cannot take it, and the database's
 * exclusion constraint keeps it from ever overlapping a booking. Blocks cover a
 * sailing's exact time window, so on this one boat the same cabin also becomes
 * unavailable on any overlapping sailing of another voyage.
 */

const VOYAGES = ["3-nights-aswan-luxor", "4-nights-luxor-aswan", "7-nights-luxor-aswan-luxor"] as const;
const CLOSURE_STATES = ["MANUAL_BLOCK", "MAINTENANCE", "CHARTER_BLOCK"] as const;
const STATE_LABEL: Record<(typeof CLOSURE_STATES)[number], string> = {
  MANUAL_BLOCK: "Closed from the dashboard",
  MAINTENANCE: "Maintenance",
  CHARTER_BLOCK: "Private charter",
};
const cabinId = z.string().regex(/^(K0[1-6]|T0[12]|S0[12]|R0[12])$/);
const voyageSchema = z.enum(VOYAGES);
const monthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

const closeSchema = z.object({
  scheduleIds: z.array(z.string().min(1).max(128)).min(1).max(60),
  roomIds: z.array(cabinId).min(1).max(12),
  state: z.enum(CLOSURE_STATES),
  note: z.string().trim().max(300).optional(),
}).strict();

const reopenSchema = z.object({
  blockKey: z.string().min(16).max(160),
  roomIds: z.array(cabinId).min(1).max(12).optional(),
}).strict();

type RoomRow = { id: string; name: string; roomType: string | null; capacity: number };
type SailingRow = { id: string; departureTime: Date; arrivalTime: Date };
type OccupancyRow = {
  scheduleId: string;
  roomId: string;
  state: string;
  blockKey: string | null;
  reason: string | null;
  createdAt: Date;
  startsAt: Date;
  endsAt: Date;
  expiresAt: Date | null;
  bookingId: string | null;
  bookingStatus: string | null;
  guestName: string | null;
  sourceVoyage: string | null;
  sourceSlug: string | null;
};
type OverlapRow = { scheduleId: string; voyage: string; slug: string; departureTime: Date; arrivalTime: Date };
type ClosureRow = {
  blockKey: string;
  state: string;
  reason: string | null;
  createdAt: Date;
  startsAt: Date;
  endsAt: Date;
  roomIds: string[];
  voyage: string | null;
  slug: string | null;
};

/** The vessel-wide lock every booking write takes (lib/booking-engine lockVessel). */
const VESSEL_LOCK = 734821901;

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
async function closeOnSailing(
  scheduleId: string,
  blockKey: string,
  state: (typeof CLOSURE_STATES)[number],
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

function requireSession(request: NextRequest) {
  return verifySessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

function monthWindow(month: string) {
  const [year, number] = month.split("-").map(Number);
  return [new Date(Date.UTC(year, number - 1, 1)), new Date(Date.UTC(year, number, 1))] as const;
}

const iso = (date: Date) => date.toISOString();

/** The voyage's 12 cabins, from the same link the public availability reads. */
async function readRooms(slug: string) {
  return bookingQuery<RoomRow>(`
    SELECT r.id, r.name, r."roomType", r.capacity
    FROM "Cruise" c
    JOIN "_CruiseRooms" cr ON cr."A" = c.id
    JOIN "Room" r ON r.id = cr."B"
    WHERE c.slug = $1 AND c."deletedAt" IS NULL AND r."deletedAt" IS NULL
    ORDER BY r.id
  `, [slug]);
}

/** Each cabin's name on the ship map, from the same settings the homepage map reads. */
async function readShipNames(): Promise<Record<string, string>> {
  const rows = await bookingQuery<{ value: string }>(`SELECT value FROM "SiteSetting" WHERE key = $1`, [SHIP_EXPERIENCE_KEY]);
  try {
    return shipRoomNames(rows[0] ? parseShipExperience(JSON.parse(rows[0].value)) : DEFAULT_SHIP_EXPERIENCE);
  } catch {
    return shipRoomNames(DEFAULT_SHIP_EXPERIENCE);
  }
}

/** One voyage's future sailings in a month, each with what occupies every cabin. */
async function readBoard(slug: string, month: string) {
  const [from, to] = monthWindow(month);
  const [rooms, sailings, voyage, shipNames] = await Promise.all([
    readRooms(slug),
    bookingQuery<SailingRow>(`
      SELECT s.id, s."departureTime", s."arrivalTime"
      FROM "CruiseSchedule" s JOIN "Cruise" c ON c.id = s."cruiseId"
      WHERE c.slug = $1 AND c."deletedAt" IS NULL AND s."isBookable"
        AND s."departureTime" > clock_timestamp()
        AND s."departureTime" >= $2 AND s."departureTime" < $3
      ORDER BY s."departureTime"
    `, [slug, from, to]),
    bookingQuery<{ name: string }>(`SELECT name FROM "Cruise" WHERE slug = $1 AND "deletedAt" IS NULL`, [slug]),
    readShipNames(),
  ]);
  const ids = sailings.map(sailing => sailing.id);
  const [occupancy, overlaps] = ids.length
    ? await Promise.all([
        bookingQuery<OccupancyRow>(`
          SELECT s.id AS "scheduleId", a."roomId", a.state, a."blockKey", a.reason, a."createdAt",
                 a."startsAt", a."endsAt", a."expiresAt",
                 b.id AS "bookingId", b.status::text AS "bookingStatus",
                 COALESCE(NULLIF(trim(concat_ws(' ', b."firstName", b."lastName")), ''), b."customerName") AS "guestName",
                 src.name AS "sourceVoyage", src.slug AS "sourceSlug"
          FROM "CruiseSchedule" s
          JOIN "InventoryAllocation" a
            ON a.active AND a."startsAt" < s."arrivalTime" AND a."endsAt" > s."departureTime"
           AND (a."expiresAt" IS NULL OR a."expiresAt" > clock_timestamp())
          LEFT JOIN "BookingRoom" br ON br.id = a."bookingRoomId"
          LEFT JOIN "Booking" b ON b.id = br."bookingId"
          LEFT JOIN LATERAL (
            SELECT c2.name, c2.slug FROM "CruiseSchedule" s2 JOIN "Cruise" c2 ON c2.id = s2."cruiseId"
            WHERE s2."departureTime" = a."startsAt" AND s2."arrivalTime" = a."endsAt"
            ORDER BY (c2.slug = $2) DESC, c2."deletedAt" NULLS FIRST
            LIMIT 1
          ) src ON true
          WHERE s.id = ANY($1::text[])
          ORDER BY a."startsAt"
        `, [ids, slug]),
        bookingQuery<OverlapRow>(`
          SELECT s.id AS "scheduleId", c2.name AS voyage, c2.slug, s2."departureTime", s2."arrivalTime"
          FROM "CruiseSchedule" s
          JOIN "CruiseSchedule" s2
            ON s2.id <> s.id AND s2."isBookable"
           AND s2."departureTime" < s."arrivalTime" AND s2."arrivalTime" > s."departureTime"
          JOIN "Cruise" c2 ON c2.id = s2."cruiseId" AND c2."deletedAt" IS NULL
          WHERE s.id = ANY($1::text[])
          ORDER BY s2."departureTime"
        `, [ids]),
      ])
    : [[], []];

  return {
    voyage: { slug, name: voyage[0]?.name ?? slug },
    month,
    /* The type is always the booking catalogue's; the name is the room's on the ship. */
    rooms: rooms.map(room => ({ id: room.id, name: room.name, roomType: room.roomType ?? "Cabin", capacity: room.capacity, shipName: shipNames[room.id] ?? null })),
    sailings: sailings.map(sailing => {
      const cabins: Record<string, ReturnType<typeof toOccupancy>[]> = {};
      for (const row of occupancy.filter(entry => entry.scheduleId === sailing.id)) {
        (cabins[row.roomId] ??= []).push(toOccupancy(row, sailing));
      }
      return {
        scheduleId: sailing.id,
        departure: iso(sailing.departureTime),
        arrival: iso(sailing.arrivalTime),
        overlaps: overlaps.filter(entry => entry.scheduleId === sailing.id).map(entry => ({
          voyage: entry.voyage, slug: entry.slug, departure: iso(entry.departureTime), arrival: iso(entry.arrivalTime),
        })),
        cabins,
      };
    }),
  };
}

function toOccupancy(row: OccupancyRow, sailing: SailingRow) {
  const booking = row.bookingId !== null;
  return {
    kind: booking ? "booking" as const : "closure" as const,
    state: row.state,
    blockKey: booking ? null : row.blockKey,
    reason: booking ? null : row.reason,
    createdAt: iso(row.createdAt),
    expiresAt: row.expiresAt ? iso(row.expiresAt) : null,
    bookingId: row.bookingId,
    bookingCode: row.bookingId ? bookingCode(row.bookingId) : null,
    bookingStatus: row.bookingStatus,
    guestName: row.guestName,
    sameSailing: row.startsAt.getTime() === sailing.departureTime.getTime() && row.endsAt.getTime() === sailing.arrivalTime.getTime(),
    source: { voyage: row.sourceVoyage, slug: row.sourceSlug, departure: iso(row.startsAt), arrival: iso(row.endsAt) },
  };
}

/** Every dashboard closure still ahead, newest block per sailing window. */
async function readUpcoming() {
  const rows = await bookingQuery<ClosureRow>(`
    SELECT a."blockKey", a.state, a.reason, min(a."createdAt") AS "createdAt", a."startsAt", a."endsAt",
           array_agg(a."roomId" ORDER BY a."roomId") AS "roomIds",
           src.name AS voyage, src.slug
    FROM "InventoryAllocation" a
    LEFT JOIN LATERAL (
      SELECT c2.name, c2.slug FROM "CruiseSchedule" s2 JOIN "Cruise" c2 ON c2.id = s2."cruiseId"
      WHERE s2."departureTime" = a."startsAt" AND s2."arrivalTime" = a."endsAt"
      ORDER BY c2."deletedAt" NULLS FIRST
      LIMIT 1
    ) src ON true
    WHERE a.active AND a."bookingRoomId" IS NULL AND a."blockKey" IS NOT NULL
      AND a."endsAt" > clock_timestamp()
    GROUP BY a."blockKey", a.state, a.reason, a."startsAt", a."endsAt", src.name, src.slug
    ORDER BY a."startsAt", min(a."createdAt")
    LIMIT 400
  `);
  return rows.map(row => ({
    blockKey: row.blockKey,
    state: row.state,
    reason: row.reason,
    createdAt: iso(row.createdAt),
    startsAt: iso(row.startsAt),
    endsAt: iso(row.endsAt),
    roomIds: row.roomIds,
    voyage: row.voyage,
    slug: row.slug,
  }));
}

/** The voyage's next departures, for closing the same cabins on several dates. */
async function readDates(slug: string) {
  const rows = await bookingQuery<SailingRow>(`
    SELECT s.id, s."departureTime", s."arrivalTime"
    FROM "CruiseSchedule" s JOIN "Cruise" c ON c.id = s."cruiseId"
    WHERE c.slug = $1 AND c."deletedAt" IS NULL AND s."isBookable" AND s."departureTime" > clock_timestamp()
    ORDER BY s."departureTime"
    LIMIT 60
  `, [slug]);
  return rows.map(row => ({ scheduleId: row.id, departure: iso(row.departureTime), arrival: iso(row.arrivalTime) }));
}

export async function GET(request: NextRequest) {
  try {
    if (!requireSession(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const params = request.nextUrl.searchParams;
    const headers = { "Cache-Control": "no-store" };
    if (params.get("view") === "upcoming") {
      return NextResponse.json({ closures: await readUpcoming() }, { headers });
    }
    const slug = voyageSchema.parse(params.get("voyage"));
    if (params.get("view") === "dates") {
      return NextResponse.json({ dates: await readDates(slug) }, { headers });
    }
    const month = monthSchema.parse(params.get("month"));
    return NextResponse.json(await readBoard(slug, month), { headers });
  } catch (error) {
    return handleRouteError(error);
  }
}

type SailingResult = {
  scheduleId: string;
  departure: string | null;
  closed: string[];
  skipped: { roomId: string; why: string }[];
  error?: string;
};

/**
 * Closes the chosen cabins on each chosen sailing, one atomic statement per
 * sailing under the vessel lock. A cabin already booked, held or closed there
 * is left as it is and reported; it is already off sale.
 */
export async function POST(request: NextRequest) {
  try {
    assertBookingAdmin(request);
    const operation = requireIdempotencyKey(request);
    const input = closeSchema.parse(await readPublicJsonBody(request));
    const reason = input.note?.trim() || STATE_LABEL[input.state];
    const results: SailingResult[] = [];

    for (const [index, scheduleId] of [...new Set(input.scheduleIds)].entries()) {
      const blockKey = `${operation.slice(0, 120)}.${index}`;
      try {
        results.push(await closeOnSailing(scheduleId, blockKey, input.state, input.roomIds, reason));
      } catch (error) {
        console.error("[cabin-closures] close failed", scheduleId, error);
        results.push({ scheduleId, departure: null, closed: [], skipped: [], error: "Could not close these cabins. Nothing changed on this date." });
      }
    }
    return NextResponse.json({ results });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** Reopens a closure: all of its cabins, or only the ones named. Never a booking. */
export async function DELETE(request: NextRequest) {
  try {
    assertBookingAdmin(request);
    const input = reopenSchema.parse(await readPublicJsonBody(request));
    // One statement under the vessel lock; never touches a booking's allocation.
    const rows = await bookingQuery<{ id: string }>(`
      WITH vessel AS MATERIALIZED (SELECT pg_advisory_xact_lock(${VESSEL_LOCK}) AS locked)
      UPDATE "InventoryAllocation" a SET active = false
      FROM vessel
      WHERE a."blockKey" = $1 AND a."bookingRoomId" IS NULL AND a.active
        AND ($2::text[] IS NULL OR a."roomId" = ANY($2::text[]))
      RETURNING a.id
    `, [input.blockKey, input.roomIds ?? null]);
    const released = rows.length;
    return NextResponse.json({ released });
  } catch (error) {
    return handleRouteError(error);
  }
}
