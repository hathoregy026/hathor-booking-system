import { NextResponse } from "next/server";
import { withDb } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";
import { dashboardBookingSelect } from "@/lib/query-selects";
import { adminApiGuard } from "@/lib/admin-server-auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DashboardStats = {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalCruises: number;
  /** Booked value of every confirmed booking: website bookings plus sales closed on Availability. */
  confirmedRevenueCents: number;
  confirmedRevenueCount: number;
};

const EMPTY_STATS: DashboardStats = {
  totalBookings: 0,
  confirmedBookings: 0,
  pendingBookings: 0,
  totalCruises: 0,
  confirmedRevenueCents: 0,
  confirmedRevenueCount: 0,
};

function computeTotalCents(
  bookingTotalPriceCents: number | null,
  tickets: {
    quantity: number;
    unitPriceCents: number | null;
    ticketType: { priceCents: number };
  }[],
) {
  if (bookingTotalPriceCents !== null) return bookingTotalPriceCents;
  return tickets.reduce(
    (sum, ticket) =>
      sum +
      ticket.quantity *
        (ticket.unitPriceCents ?? ticket.ticketType.priceCents),
    0,
  );
}

export async function GET() {
  const denied = await adminApiGuard("dashboard.view");
  if (denied) return denied;

  try {
    const [statsRows, recentBookings] = await Promise.all([
      withDb(() =>
        prisma.$queryRaw<DashboardStats[]>`
        SELECT
          (SELECT COUNT(*)::int FROM "Booking" WHERE "deletedAt" IS NULL) AS "totalBookings",
          (SELECT COUNT(*)::int FROM "Booking" WHERE status = 'CONFIRMED' AND "deletedAt" IS NULL) AS "confirmedBookings",
          (SELECT COUNT(*)::int FROM "Booking" WHERE status = 'PENDING_HOLD' AND "deletedAt" IS NULL) AS "pendingBookings",
          (SELECT COUNT(*)::int FROM "Cruise" WHERE "deletedAt" IS NULL) AS "totalCruises",
          (
            (SELECT COALESCE(SUM(COALESCE(b."totalPriceCents", (SELECT SUM(br."unitPriceCents") FROM "BookingRoom" br WHERE br."bookingId" = b.id), 0)), 0)
               FROM "Booking" b WHERE b.status = 'CONFIRMED' AND b."deletedAt" IS NULL)
            +
            (SELECT COALESCE(SUM(d."totalPriceCents"), 0) FROM "ClosureBooking" d
              WHERE EXISTS (SELECT 1 FROM "InventoryAllocation" a WHERE a."blockKey" = d."blockKey" AND a.active AND a."bookingRoomId" IS NULL))
          )::float8 AS "confirmedRevenueCents",
          (
            (SELECT COUNT(*) FROM "Booking" WHERE status = 'CONFIRMED' AND "deletedAt" IS NULL)
            +
            (SELECT COUNT(*) FROM "ClosureBooking" d
              WHERE EXISTS (SELECT 1 FROM "InventoryAllocation" a WHERE a."blockKey" = d."blockKey" AND a.active AND a."bookingRoomId" IS NULL))
          )::int AS "confirmedRevenueCount"
      `,
      ),
      withDb(() =>
        prisma.booking.findMany({
          take: 5,
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          select: dashboardBookingSelect,
        }),
      ),
    ]);

    const stats = statsRows[0] ?? EMPTY_STATS;

    return NextResponse.json({
      stats,
      recentBookings: recentBookings.map((booking) => ({
        id: booking.id,
        customerName: booking.customerName ?? "—",
        cruiseName: booking.cruiseSchedule.cruise.name,
        departureTime: booking.cruiseSchedule.departureTime.toISOString(),
        status: booking.status,
        totalPriceCents: computeTotalCents(
          booking.totalPriceCents,
          booking.bookingTickets,
        ),
      })),
    });
  } catch (error) {
    console.error("Dashboard API unexpected error:", error);
    return NextResponse.json(
      {
        error: "Could not load dashboard.",
        stats: EMPTY_STATS,
        recentBookings: [],
      },
      { status: 503 },
    );
  }
}
