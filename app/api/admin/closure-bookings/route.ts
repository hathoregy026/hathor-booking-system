import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError } from "@/lib/api";
import { CLOSURE_SALE_SOURCES, type AdminClosureBooking } from "@/lib/admin-bookings";
import { assertBookingAdmin } from "@/lib/booking-admin-api";
import { bookingQuery } from "@/lib/booking-database";
import { adminApiGuard } from "@/lib/admin-server-auth";
import { readPublicJsonBody } from "@/lib/public-api-security";
import { readShipRoomNames } from "@/lib/ship-room-names";

/*
 * Dashboard → Bookings → Via Availability. A cabin closed on Availability for a
 * sale made outside the website is one of these. Maintenance is not a sale, so
 * it stays on Availability. A closure with no sale details lists until it has
 * sailed; once it has a guest and a price it stays on record.
 */

const SHIP_CABINS = 12;

const saleSchema = z.object({
  blockKey: z.string().min(16).max(160),
  guestName: z.string().trim().min(1).max(160),
  source: z.enum(CLOSURE_SALE_SOURCES),
  customerEmail: z.string().trim().max(200).nullable(),
  customerPhone: z.string().trim().max(40).nullable(),
  totalPriceCents: z.number().int().positive().max(20_000_000),
  receivedCents: z.number().int().nonnegative().max(20_000_000),
}).strict().refine(sale => sale.receivedCents <= sale.totalPriceCents, "The amount received cannot be more than the agreed price.");

type Row = {
  blockKey: string;
  state: string;
  reason: string | null;
  createdAt: Date;
  startsAt: Date;
  endsAt: Date;
  roomIds: string[];
  voyage: string | null;
  guestName: string | null;
  source: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  totalPriceCents: number | null;
  receivedCents: number | null;
};

const LIST_SQL = `
  SELECT a."blockKey", a.state, a.reason, min(a."createdAt") AS "createdAt", a."startsAt", a."endsAt",
         array_agg(a."roomId" ORDER BY a."roomId") AS "roomIds", src.name AS voyage,
         d."guestName", d.source, d."customerEmail", d."customerPhone", d."totalPriceCents", d."receivedCents"
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
    sale: row.guestName === null ? null : {
      guestName: row.guestName,
      source: row.source ?? "Other",
      customerEmail: row.customerEmail,
      customerPhone: row.customerPhone,
      totalPriceCents: row.totalPriceCents ?? 0,
      receivedCents: row.receivedCents ?? 0,
    },
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
    const saved = await bookingQuery<{ blockKey: string }>(`
      INSERT INTO "ClosureBooking" ("blockKey", "guestName", source, "customerEmail", "customerPhone", "totalPriceCents", "receivedCents", "updatedBySession")
      SELECT $1, $2, $3, $4, $5, $6, $7, $8
      WHERE EXISTS (SELECT 1 FROM "InventoryAllocation" a WHERE a."blockKey" = $1 AND a."bookingRoomId" IS NULL AND a.active)
      ON CONFLICT ("blockKey") DO UPDATE SET "guestName" = $2, source = $3, "customerEmail" = $4, "customerPhone" = $5,
        "totalPriceCents" = $6, "receivedCents" = $7, "updatedBySession" = $8, "updatedAt" = clock_timestamp()
      RETURNING "blockKey"
    `, [sale.blockKey, sale.guestName, sale.source, sale.customerEmail, sale.customerPhone, sale.totalPriceCents, sale.receivedCents, admin.sessionId]);
    if (!saved.length) return NextResponse.json({ error: "This closure is no longer active." }, { status: 404 });
    return NextResponse.json({ saved: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
