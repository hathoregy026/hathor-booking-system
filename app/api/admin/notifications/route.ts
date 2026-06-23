import { NextResponse } from "next/server";
import { BookingStatus } from "@/app/generated/prisma/client";
import { markBookingsSeenNow } from "@/lib/admin-profile-pg";
import { ADMIN_PROFILE_ID } from "@/lib/admin-profile-constants";
import { logDbError, withDb } from "@/lib/db-safe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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

const NOTIFICATION_WHERE = (lastSeenBookingAt: Date) => ({
  status: BookingStatus.CONFIRMED,
  deletedAt: null,
  createdAt: { gt: lastSeenBookingAt },
});

export async function GET() {
  try {
    const profile = await withDb(() =>
      prisma.adminProfile.findUnique({
        where: { id: ADMIN_PROFILE_ID },
      }),
    );

    const lastSeenBookingAt = profile?.lastSeenBookingAt ?? new Date(0);
    const where = NOTIFICATION_WHERE(lastSeenBookingAt);

    const [unreadCount, bookings] = await Promise.all([
      withDb(() => prisma.booking.count({ where })),
      withDb(() =>
        prisma.booking.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 20,
          select: {
            id: true,
            customerName: true,
            createdAt: true,
            cruiseSchedule: {
              select: {
                cruise: { select: { name: true } },
              },
            },
            bookingTickets: {
              select: {
                quantity: true,
                ticketType: { select: { priceCents: true } },
              },
            },
          },
        }),
      ),
    ]);

    const items = bookings.map((booking) => ({
      id: booking.id,
      customerName: booking.customerName ?? "Guest",
      cruiseName: booking.cruiseSchedule.cruise.name,
      createdAt: booking.createdAt.toISOString(),
      totalPriceCents: computeTotalCents(booking.bookingTickets),
    }));

    return NextResponse.json({
      unreadCount,
      items,
    });
  } catch (error) {
    logDbError("admin.notifications.GET", error);
    return NextResponse.json(
      {
        error: "Could not load notifications.",
        unreadCount: 0,
        items: [],
      },
      { status: 503 },
    );
  }
}

export async function POST() {
  try {
    await markBookingsSeenNow();
    return NextResponse.json({ ok: true });
  } catch (error) {
    logDbError("admin.notifications.POST", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 },
    );
  }
}
