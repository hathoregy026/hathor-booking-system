import { NextRequest, NextResponse } from "next/server";
import { BookingStatus } from "@/app/generated/prisma/client";
import { handleRouteError } from "@/lib/api";
import { logDbError } from "@/lib/db-safe";
import { fetchAdminBookingsFast } from "@/lib/admin-bookings-fetch";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");
    const bin = searchParams.get("bin") === "true";
    const calendar = searchParams.get("calendar") === "true";

    const bookings = await fetchAdminBookingsFast({
      bin,
      calendar,
      statusFilter,
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    logDbError("admin.bookings.GET", error);
    return NextResponse.json(
      {
        error:
          "Could not load bookings. The database may be busy — wait a moment and refresh.",
        bookings: [],
      },
      { status: 503 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      id?: string;
      status?: BookingStatus;
      ids?: string[];
      action?: "soft-delete" | "restore" | "purge";
    };

    if (body.action && Array.isArray(body.ids) && body.ids.length > 0) {
      if (body.action === "soft-delete") {
        const result = await prisma.booking.updateMany({
          where: {
            id: { in: body.ids },
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            status: BookingStatus.CANCELLED,
            holdExpiresAt: null,
          },
        });

        return NextResponse.json({ updated: result.count });
      }

      if (body.action === "restore") {
        const result = await prisma.booking.updateMany({
          where: {
            id: { in: body.ids },
            deletedAt: { not: null },
          },
          data: { deletedAt: null },
        });

        return NextResponse.json({ updated: result.count });
      }

      if (body.action === "purge") {
        const result = await prisma.booking.deleteMany({
          where: {
            id: { in: body.ids },
            deletedAt: { not: null },
          },
        });

        return NextResponse.json({ deleted: result.count });
      }

      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (!body.id || !body.status) {
      return NextResponse.json(
        { error: "Booking id and status are required" },
        { status: 400 },
      );
    }

    if (!Object.values(BookingStatus).includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existing = await prisma.booking.findUnique({
      where: { id: body.id },
      select: { deletedAt: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (existing.deletedAt) {
      return NextResponse.json(
        { error: "Restore booking from recycle bin before editing status" },
        { status: 400 },
      );
    }

    const booking = await prisma.booking.update({
      where: { id: body.id },
      data: { status: body.status },
      select: { id: true, status: true },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    return handleRouteError(error);
  }
}
