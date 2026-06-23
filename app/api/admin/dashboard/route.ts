import { NextResponse } from "next/server";
import { withDb } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";
import { dashboardBookingSelect } from "@/lib/query-selects";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DashboardStats = {
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalCruises: number;
};

const EMPTY_STATS: DashboardStats = {
  totalBookings: 0,
  confirmedBookings: 0,
  pendingBookings: 0,
  totalCruises: 0,
};

function computeTotalCents(
  tickets: {
    quantity: number;
    ticketType: { priceCents: number };
  }[],
) {
  return tickets.reduce(
    (sum, ticket) => sum + ticket.quantity * ticket.ticketType.priceCents,
    0,
  );
}

export async function GET() {
  try {
    const [statsRows, recentBookings] = await Promise.all([
      withDb(() =>
        prisma.$queryRaw<DashboardStats[]>`
        SELECT
          (SELECT COUNT(*)::int FROM "Booking" WHERE "deletedAt" IS NULL) AS "totalBookings",
          (SELECT COUNT(*)::int FROM "Booking" WHERE status = 'CONFIRMED' AND "deletedAt" IS NULL) AS "confirmedBookings",
          (SELECT COUNT(*)::int FROM "Booking" WHERE status = 'PENDING_HOLD' AND "deletedAt" IS NULL) AS "pendingBookings",
          (SELECT COUNT(*)::int FROM "Cruise" WHERE "deletedAt" IS NULL) AS "totalCruises"
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
        totalPriceCents: computeTotalCents(booking.bookingTickets),
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
