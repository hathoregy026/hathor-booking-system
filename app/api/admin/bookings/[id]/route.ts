import { NextRequest, NextResponse } from "next/server";
import { BookingStatus } from "@/app/generated/prisma/client";
import { handleRouteError, jsonError } from "@/lib/api";
import {
  normalizeAdminBookingStatus,
  serializeAdminBooking,
} from "@/lib/admin-bookings";
import { buildEmailDetailsFromAdminBooking } from "@/lib/booking-email-details";
import { withDb } from "@/lib/db-safe";
import { sendBookingConfirmedEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { bookingListSelect } from "@/lib/query-selects";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { status?: string };

    if (!body.status) {
      return jsonError("status is required", 400);
    }

    const normalized = normalizeAdminBookingStatus(body.status);
    if (!normalized) {
      return jsonError(
        "status must be CONFIRMED, CANCELLED, or PENDING",
        400,
      );
    }

    const allowedStatuses = new Set<BookingStatus>([
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED,
      BookingStatus.PENDING_HOLD,
    ]);

    if (!allowedStatuses.has(normalized as BookingStatus)) {
      return jsonError(
        "status must be CONFIRMED, CANCELLED, or PENDING",
        400,
      );
    }

    const booking = await withDb(async () => {
      const existing = await prisma.booking.findUnique({
        where: { id },
        select: { id: true, deletedAt: true },
      });

      if (!existing) {
        return { notFound: true as const };
      }

      if (existing.deletedAt) {
        return { inBin: true as const };
      }

      return prisma.booking.update({
        where: { id },
        data: {
          status: normalized as BookingStatus,
          ...(normalized === BookingStatus.CANCELLED
            ? { holdExpiresAt: null }
            : {}),
        },
        select: bookingListSelect,
      });
    });

    if ("notFound" in booking) {
      return jsonError("Booking not found", 404);
    }

    if ("inBin" in booking) {
      return jsonError(
        "Restore booking from recycle bin before changing status",
        400,
      );
    }

    const serialized = serializeAdminBooking(booking);

    if (normalized === BookingStatus.CONFIRMED) {
      const emailDetails = buildEmailDetailsFromAdminBooking(serialized);
      if (emailDetails) {
        try {
          console.log(
            "[email] sending booking confirmed email to",
            emailDetails.guestEmail,
          );
          await sendBookingConfirmedEmail(
            emailDetails.guestEmail,
            emailDetails.guestName,
            emailDetails,
          );
          console.log("[email] booking confirmed email sent");
        } catch (emailError) {
          console.error("[email] confirmation email failed:", emailError);
        }
      } else {
        console.warn(
          "[email] skipped confirmation email — no guest email on booking",
          id,
        );
      }
    }

    return NextResponse.json({
      booking: serialized,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
