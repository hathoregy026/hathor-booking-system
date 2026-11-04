import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/lib/api";
import { CLOSURE_SALE_SOURCES, closureSaleFromJson, type AdminClosureBooking } from "@/lib/admin-bookings";
import { VESSEL_LOCK, cabinId, closeOnSailing } from "@/lib/cabin-closures";
import { assertBookingAdmin } from "@/lib/booking-admin-api";
import { bookingQuery } from "@/lib/booking-database";
import { adminApiGuard } from "@/lib/admin-server-auth";
import { readPublicJsonBody, requireIdempotencyKey } from "@/lib/public-api-security";
import { readShipRoomNames } from "@/lib/ship-room-names";

/*
 * Dashboard → Bookings → Via Availability. A cabin closed on Availability for a
 * sale made outside the website is one of these. Maintenance is not a sale, so
 * it stays on Availability. A closure with no sale details lists until it has
 * sailed; once it has a guest and a price it stays on record.
 */

const SHIP_CABINS = 12;

const saleFields = {
  guestName: z.string().trim().min(1).max(160),
  source: z.enum(CLOSURE_SALE_SOURCES),
  customerEmail: z.string().trim().max(200).nullable(),
  customerPhone: z.string().trim().max(40).nullable(),
  country: z.string().trim().max(80).nullable().optional(),
  adults: z.number().int().min(0).max(60).nullable().optional(),
  children: z.number().int().min(0).max(60).nullable().optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
  totalPriceCents: z.number().int().positive().max(20_000_000),
  receivedCents: z.number().int().nonnegative().max(20_000_000),
};
const receivedWithinPrice = (sale: { receivedCents: number; totalPriceCents: number }) => sale.receivedCents <= sale.totalPriceCents;
const RECEIVED_MESSAGE = "The amount received cannot be more than the agreed price.";

const saleSchema = z.object({ blockKey: z.string().min(16).max(160), ...saleFields }).strict().refine(receivedWithinPrice, RECEIVED_MESSAGE);

/** Bookings -> Add booking: close free cabins on one sailing for a guest, with their details. */
const manualSchema = z.object({
  scheduleId: z.string().min(1).max(128),
  roomIds: z.array(cabinId).min(1).max(12),
  ...saleFields,
}).strict().refine(receivedWithinPrice, RECEIVED_MESSAGE);

type Sale = z.infer<typeof saleSchema>;

/** Saves the sale behind an active closure; nothing when the closure is gone. */
async function saveSale(sale: Sale, session: string | null) {
  const saved = await bookingQuery<{ blockKey: string }>(`
    INSERT INTO "ClosureBooking" ("blockKey", "guestName", source, "customerEmail", "customerPhone", country, adults, children, notes,
      "totalPriceCents", "receivedCents", "updatedBySession")
    SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
    WHERE EXISTS (SELECT 1 FROM "InventoryAllocation" a WHERE a."blockKey" = $1 AND a."bookingRoomId" IS NULL AND a.active)
    ON CONFLICT ("blockKey") DO UPDATE SET "guestName" = $2, source = $3, "customerEmail" = $4, "customerPhone" = $5,
      country = $6, adults = $7, children = $8, notes = $9,
      "totalPriceCents" = $10, "receivedCents" = $11, "updatedBySession" = $12, "updatedAt" = clock_timestamp()
    RETURNING "blockKey"
  `, [sale.blockKey, sale.guestName, sale.source, sale.customerEmail || null, sale.customerPhone || null, sale.country || null,
    sale.adults ?? null, sale.children ?? null, sale.notes || null, sale.totalPriceCents, sale.receivedCents, session]);
  return saved.length > 0;
}

type Row = {
  blockKey: string;
  state: string;
  reason: string | null;
  createdAt: Date;
  startsAt: Date;
  endsAt: Date;
  roomIds: string[];
  voyage: string | null;
  sale: Record<string, unknown> | null;
};

const LIST_SQL = `
  SELECT a."blockKey", a.state, a.reason, min(a."createdAt") AS "createdAt", a."startsAt", a."endsAt",
         array_agg(a."roomId" ORDER BY a."roomId") AS "roomIds", src.name AS voyage,
         to_jsonb(d) AS sale
  FROM "InventoryAllocation" a
  LEFT JOIN "ClosureBooking" d ON d."blockKey" = a."blockKey"
  LEFT JOIN LATERAL (
    SELECT c2.name FROM "CruiseSchedule" s2 JOIN "Cruise" c2 ON c2.id = s2."cruiseId"
    WHERE s2."departureTime" = a."startsAt" AND s2."arrivalTime" = a."endsAt"
    ORDER BY c2."deletedAt" NULLS FIRST
    LIMIT 1
  ) src ON true
  WHERE a.active AND a."bookingRoomId" IS NULL AND a."blockKey" IS NOT NULL
    AND a.state IN ('MANUAL_BLOCK', 'CHARTER_BLOCK')
    AND (a."endsAt" > clock_timestamp() OR d."blockKey" IS NOT NULL)
  GROUP BY a."blockKey", a.state, a.reason, a."startsAt", a."endsAt", src.name, d."blockKey"
  ORDER BY a."startsAt", min(a."createdAt")
  LIMIT 400
`;

function toDto(row: Row, names: Record<string, string>): AdminClosureBooking {
  return {
    blockKey: row.blockKey,
    state: row.state,
    note: row.reason,
    createdAt: row.createdAt.toISOString(),
    startsAt: row.startsAt.toISOString(),
    endsAt: row.endsAt.toISOString(),
    roomIds: row.roomIds,
    roomNames: row.roomIds.map(id => names[id] ?? id),
    wholeShip: row.state === "CHARTER_BLOCK" || row.roomIds.length >= SHIP_CABINS,
    voyage: row.voyage,
    sale: closureSaleFromJson(row.sale),
  };
}

export async function GET() {
  const denied = await adminApiGuard("bookings.view");
  if (denied) return denied;
  try {
    const [rows, names] = await Promise.all([bookingQuery<Row>(LIST_SQL), readShipRoomNames()]);
    return NextResponse.json({ closures: rows.map(row => toDto(row, names)) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleRouteError(error);
  }
}

/** Saves the sale behind a closure. The cabins themselves stay closed either way. */
export async function PUT(request: NextRequest) {
  const denied = await adminApiGuard("bookings.manage");
  if (denied) return denied;
  try {
    const admin = await assertBookingAdmin(request);
    const sale = saleSchema.parse(await readPublicJsonBody(request));
    if (!(await saveSale(sale, admin.sessionId))) return NextResponse.json({ error: "This closure is no longer active." }, { status: 404 });
    return NextResponse.json({ saved: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

/**
 * A booking made by phone, WhatsApp or in person: closes the chosen cabins on
 * the sailing (all of them or none) and records the guest behind the closure.
 * A retry with the same Idempotency-Key finds the closure it already made.
 */
export async function POST(request: NextRequest) {
  const denied = (await adminApiGuard("bookings.manage")) ?? (await adminApiGuard("availability.manage"));
  if (denied) return denied;
  try {
    const admin = await assertBookingAdmin(request);
    const operation = requireIdempotencyKey(request);
    const { scheduleId, roomIds, ...sale } = manualSchema.parse(await readPublicJsonBody(request));
    const blockKey = `${operation.slice(0, 120)}.m`;
    const rooms = [...new Set(roomIds)];
    const result = await closeOnSailing(scheduleId, blockKey, "MANUAL_BLOCK", rooms, `Booked for ${sale.guestName}`.slice(0, 300));
    if (result.error) return NextResponse.json({ error: result.error }, { status: 409 });
    if (result.closed.length < rooms.length) {
      // Never half a booking: give back what this call closed and say what is taken.
      if (result.closed.length) {
        await bookingQuery(`
          WITH vessel AS MATERIALIZED (SELECT pg_advisory_xact_lock(${VESSEL_LOCK}) AS locked)
          UPDATE "InventoryAllocation" a SET active = false FROM vessel
          WHERE a."blockKey" = $1 AND a."bookingRoomId" IS NULL AND a.active
        `, [blockKey]);
      }
      return NextResponse.json({ error: "Some of these cabins are no longer free on this sailing. Nothing was closed.", skipped: result.skipped }, { status: 409 });
    }
    if (!(await saveSale({ blockKey, ...sale }, admin.sessionId))) {
      return NextResponse.json({ error: "The cabins closed, but the guest details could not be saved. Add them under Via Availability." }, { status: 500 });
    }
    return NextResponse.json({ blockKey, closed: result.closed, departure: result.departure });
  } catch (error) {
    return handleRouteError(error);
  }
}
