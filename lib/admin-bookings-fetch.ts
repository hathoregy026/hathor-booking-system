import type { AdminBookingDto } from "@/lib/admin-bookings";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { withDbRetry } from "@/lib/db-retry";
import { getSharedPgPool } from "@/lib/pg-pool";

type SqlRow = {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  status: string;
  deletedAt: Date | null;
  createdAt: Date;
  departureTime: Date;
  arrivalTime: Date;
  cruiseName: string;
  roomNames: string[] | null;
  roomTypes: string[] | null;
  totalPriceCents: number;
};

const LIST_SQL = `
  SELECT
    b.id,
    b."customerName",
    b."customerEmail",
    b.status::text AS status,
    b."deletedAt",
    b."createdAt",
    cs."departureTime",
    cs."arrivalTime",
    c.name AS "cruiseName",
    COALESCE(
      (SELECT ARRAY_AGG(DISTINCT r.name)
       FROM "BookingRoom" br
       JOIN "Room" r ON r.id = br."roomId"
       WHERE br."bookingId" = b.id),
      ARRAY[]::text[]
    ) AS "roomNames",
    COALESCE(
      (SELECT ARRAY_AGG(DISTINCT COALESCE(r."roomType", r.name))
       FROM "BookingRoom" br
       JOIN "Room" r ON r.id = br."roomId"
       WHERE br."bookingId" = b.id),
      ARRAY[]::text[]
    ) AS "roomTypes",
    COALESCE(
      (SELECT SUM(bt.quantity * tt."priceCents")::int
       FROM "BookingTicket" bt
       JOIN "TicketType" tt ON tt.id = bt."ticketTypeId"
       WHERE bt."bookingId" = b.id),
      0
    ) AS "totalPriceCents"
  FROM "Booking" b
  INNER JOIN "CruiseSchedule" cs ON cs.id = b."cruiseScheduleId"
  INNER JOIN "Cruise" c ON c.id = cs."cruiseId"
`;

function mapRow(row: SqlRow): AdminBookingDto {
  const departureTime = row.departureTime.toISOString();
  const arrivalTime = row.arrivalTime.toISOString();

  return {
    id: row.id,
    customerName: row.customerName ?? "—",
    customerEmail: row.customerEmail ?? "—",
    status: row.status,
    cruiseName: row.cruiseName,
    checkInDate: departureTime,
    checkOutDate: arrivalTime,
    departureTime,
    arrivalTime,
    rooms: row.roomNames ?? [],
    roomTypes: row.roomTypes ?? [],
    totalPriceCents: row.totalPriceCents ?? 0,
    createdAt: row.createdAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() ?? null,
  };
}

type FetchOptions = {
  bin: boolean;
  calendar: boolean;
  statusFilter: string | null;
};

export async function fetchAdminBookingsFast(
  options: FetchOptions,
): Promise<AdminBookingDto[]> {
  const connectionString = resolveDatabaseUrl();
  const pool = getSharedPgPool(connectionString);

  let where = "";
  let orderBy = `ORDER BY b."createdAt" DESC`;

  if (options.bin) {
    where = `WHERE b."deletedAt" IS NOT NULL`;
    orderBy = `ORDER BY b."deletedAt" DESC`;
  } else if (options.calendar) {
    where = `WHERE b."deletedAt" IS NULL AND b.status IN ('PENDING_HOLD', 'CONFIRMED')`;
  } else if (options.statusFilter === "pending") {
    where = `WHERE b."deletedAt" IS NULL AND b.status = 'PENDING_HOLD'`;
  } else if (options.statusFilter === "confirmed") {
    where = `WHERE b."deletedAt" IS NULL AND b.status = 'CONFIRMED'`;
  } else if (options.statusFilter === "cancelled") {
    where = `WHERE b."deletedAt" IS NULL AND b.status = 'CANCELLED'`;
  } else if (options.statusFilter === "expired") {
    where = `WHERE b."deletedAt" IS NULL AND b.status = 'EXPIRED'`;
  } else {
    where = `WHERE b."deletedAt" IS NULL`;
  }

  const sql = `${LIST_SQL} ${where} ${orderBy} LIMIT 500`;
  const result = await withDbRetry(() => pool.query<SqlRow>(sql));
  return result.rows.map(mapRow);
}
