import { bookingStage, type AdminBookingCabin, type AdminBookingDto } from "@/lib/admin-bookings";
import { bookingCode } from "@/lib/booking-code";
import { bookingQuery } from "@/lib/booking-database";
import { parseBookingCustomerName } from "@/lib/booking-guest-details";
import { withDbRetry } from "@/lib/db-retry";

type SqlRow = {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  adultCount: number | null;
  childCount: number | null;
  specialRequests: string | null;
  country: string | null;
  paymentMethod: string | null;
  status: string;
  requestedAt: Date | null;
  acceptedAt: Date | null;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  guestEmailStatus: string;
  adminEmailStatus: string;
  deletedAt: Date | null;
  createdAt: Date;
  departureTime: Date;
  arrivalTime: Date;
  cruiseName: string;
  roomNames: string[] | null;
  roomTypes: string[] | null;
  cabins: AdminBookingCabin[] | null;
  totalPriceCents: number;
  paidCents: number;
  depositCents: number | null;
};

const LIST_SQL = `
  SELECT
    b.id,
    b."customerName",
    b."customerEmail",
    b."customerPhone",
    b."adultCount",
    b."childCount",
    b."specialRequests",
    b.country,
    b."paymentMethod",
    b.status::text AS status,
    b."requestedAt",
    b."acceptedAt",
    b."confirmedAt",
    b."cancelledAt",
    b."cancellationReason",
    b."guestEmailStatus",
    b."adminEmailStatus",
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
    (SELECT json_agg(json_build_object(
        'type', COALESCE(r."roomType", r.name),
        'adults', br.adults,
        'children', br.children,
        'unitPriceCents', COALESCE(br."unitPriceCents", 0)
      ) ORDER BY br."roomIndex")
     FROM "BookingRoom" br
     JOIN "Room" r ON r.id = br."roomId"
     WHERE br."bookingId" = b.id) AS cabins,
    COALESCE(
      b."totalPriceCents",
      (SELECT SUM(br."unitPriceCents")::int
       FROM "BookingRoom" br
       WHERE br."bookingId" = b.id),
      (SELECT SUM(bt.quantity * COALESCE(bt."unitPriceCents", tt."priceCents"))::int
       FROM "BookingTicket" bt
       JOIN "TicketType" tt ON tt.id = bt."ticketTypeId"
       WHERE bt."bookingId" = b.id),
      0
    ) AS "totalPriceCents",
    COALESCE(
      (SELECT SUM(CASE WHEN p.kind = 'REFUND' THEN -p."amountCents" ELSE p."amountCents" END)::int
       FROM "BookingPayment" p
       WHERE p."bookingId" = b.id),
      0
    ) AS "paidCents",
    (SELECT MIN(s."cumulativeCents")::int
     FROM "BookingPaymentSchedule" s
     WHERE s."bookingId" = b.id) AS "depositCents"
  FROM "Booking" b
  INNER JOIN "CruiseSchedule" cs ON cs.id = b."cruiseScheduleId"
  INNER JOIN "Cruise" c ON c.id = cs."cruiseId"
`;

const iso = (value: Date | null) => value?.toISOString() ?? null;

function mapRow(row: SqlRow): AdminBookingDto {
  const departureTime = row.departureTime.toISOString();
  const arrivalTime = row.arrivalTime.toISOString();
  const customerName = row.customerName ?? "—";
  const parsed = parseBookingCustomerName(customerName);
  const totalPriceCents = row.totalPriceCents ?? 0;
  const paidCents = row.paidCents ?? 0;

  return {
    id: row.id,
    code: bookingCode(row.id),
    stage: bookingStage({
      status: row.status,
      acceptedAt: row.acceptedAt,
      cancellationReason: row.cancellationReason,
      paidCents,
      totalPriceCents,
    }),
    customerName,
    guestName: parsed.guestName,
    guestPhone: row.customerPhone ?? parsed.guestPhone,
    partyLabel:
      row.adultCount !== null && row.childCount !== null
        ? `${row.adultCount} adult${row.adultCount === 1 ? "" : "s"}, ${row.childCount} child${row.childCount === 1 ? "" : "ren"}`
        : parsed.partyLabel,
    partySize:
      row.adultCount !== null && row.childCount !== null
        ? row.adultCount + row.childCount
        : parsed.partySize,
    specialRequests: row.specialRequests ?? parsed.specialRequests,
    customerEmail: row.customerEmail ?? "—",
    country: row.country,
    status: row.status,
    cruiseName: row.cruiseName,
    checkInDate: departureTime,
    checkOutDate: arrivalTime,
    departureTime,
    arrivalTime,
    rooms: row.roomNames ?? [],
    roomTypes: row.roomTypes ?? [],
    cabins: row.cabins ?? [],
    totalPriceCents,
    paidCents,
    depositCents: row.depositCents,
    paymentMethod: row.paymentMethod,
    requestedAt: iso(row.requestedAt),
    acceptedAt: iso(row.acceptedAt),
    confirmedAt: iso(row.confirmedAt),
    cancelledAt: iso(row.cancelledAt),
    cancellationReason: row.cancellationReason,
    guestEmailStatus: row.guestEmailStatus,
    adminEmailStatus: row.adminEmailStatus,
    createdAt: row.createdAt.toISOString(),
    deletedAt: iso(row.deletedAt),
  };
}

type FetchOptions = {
  bin: boolean;
  calendar: boolean;
  statusFilter: string | null;
};

const FILTERS: Record<string, string> = {
  new: `b.status = 'REQUESTED' AND b."acceptedAt" IS NULL`,
  invoiced: `b.status = 'REQUESTED' AND b."acceptedAt" IS NOT NULL`,
  confirmed: `b.status = 'CONFIRMED'`,
  cancelled: `b.status = 'CANCELLED'`,
  expired: `b.status IN ('EXPIRED', 'PENDING_HOLD')`,
};

/**
 * Runs on the booking engine's connections: one statement per connection and
 * zone-less timestamps read as UTC, so request and confirmation times are exact.
 */
export async function fetchAdminBookingsFast(
  options: FetchOptions,
): Promise<AdminBookingDto[]> {
  let where = `WHERE b."deletedAt" IS NULL`;
  let orderBy = `ORDER BY b."createdAt" DESC`;

  if (options.bin) {
    where = `WHERE b."deletedAt" IS NOT NULL`;
    orderBy = `ORDER BY b."deletedAt" DESC`;
  } else if (options.calendar) {
    where = `WHERE b."deletedAt" IS NULL AND b.status IN ('REQUESTED', 'CONFIRMED')`;
  } else if (options.statusFilter && FILTERS[options.statusFilter]) {
    where = `WHERE b."deletedAt" IS NULL AND ${FILTERS[options.statusFilter]}`;
  }

  const sql = `${LIST_SQL} ${where} ${orderBy} LIMIT 500`;
  const rows = await withDbRetry(() => bookingQuery<SqlRow>(sql));
  return rows.map(mapRow);
}

type DetailExtras = {
  cancellationFeeCents: number | null;
  marketingOptIn: boolean;
  passengers: { id: string; roomIndex: number; fullName: string; isChild: boolean }[] | null;
  payments: { id: string; kind: string; method: string; amountCents: number; reference: string; receivedAt: string }[] | null;
  schedule: { milestone: string; dueAt: string | null; cumulativeCents: number }[] | null;
};

/** Passengers, payment entries and schedule for one booking; timestamps come back as UTC ISO text. */
export async function fetchBookingDetailExtras(id: string) {
  const rows = await withDbRetry(() =>
    bookingQuery<DetailExtras>(
      `SELECT b."cancellationFeeCents", b."marketingOptIn",
         (SELECT json_agg(json_build_object('id', g.id, 'roomIndex', g."roomIndex", 'fullName', g."fullName", 'isChild', g."isChild")
            ORDER BY g."roomIndex", g."isChild") FROM "BookingGuest" g WHERE g."bookingId" = b.id) AS passengers,
         (SELECT json_agg(json_build_object('id', p.id, 'kind', p.kind, 'method', p.method, 'amountCents', p."amountCents",
            'reference', p.reference, 'receivedAt', to_char(p."receivedAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')) ORDER BY p."receivedAt")
            FROM "BookingPayment" p WHERE p."bookingId" = b.id) AS payments,
         (SELECT json_agg(json_build_object('milestone', s.milestone, 'cumulativeCents', s."cumulativeCents",
            'dueAt', to_char(s."dueAt", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')))
            FROM "BookingPaymentSchedule" s WHERE s."bookingId" = b.id) AS schedule
       FROM "Booking" b WHERE b.id = $1`,
      [id],
    ),
  );
  const row = rows[0];
  if (!row) return null;
  return {
    cancellationFeeCents: row.cancellationFeeCents,
    marketingOptIn: row.marketingOptIn,
    passengers: row.passengers ?? [],
    payments: row.payments ?? [],
    schedule: row.schedule ?? [],
  };
}

export async function fetchBookingStatus(id: string): Promise<string> {
  const rows = await bookingQuery<{ status: string }>(`SELECT status::text AS status FROM "Booking" WHERE id = $1`, [id]);
  if (!rows[0]) throw new Error("Booking not found");
  return rows[0].status;
}

export async function fetchAdminBookingById(id: string): Promise<AdminBookingDto | null> {
  const rows = await withDbRetry(() => bookingQuery<SqlRow>(`${LIST_SQL} WHERE b.id = $1`, [id]));
  return rows[0] ? mapRow(rows[0]) : null;
}
