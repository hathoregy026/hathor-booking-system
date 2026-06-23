import { NextRequest, NextResponse } from "next/server";
import { BookingStatus } from "@/app/generated/prisma/client";
import { handleRouteError } from "@/lib/api";
import {
  BookingConflictError,
  getUnavailableRoomIds,
  InvalidBookingError,
} from "@/lib/booking";
import { withDb } from "@/lib/db-safe";
import { addUtcMinutes } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { createHoldSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createHoldSchema.parse(body);

    const result = await withDb(async () => {
        const schedule = await prisma.cruiseSchedule.findFirst({
          where: {
            id: parsed.cruiseScheduleId,
            cruiseId: parsed.cruiseId,
          },
          select: { id: true },
        });

        if (!schedule) {
          throw new InvalidBookingError("Cruise schedule not found for this cruise");
        }

        const rooms = await prisma.room.findMany({
          where: {
            id: { in: parsed.roomIds },
            cruiseId: parsed.cruiseId,
            deletedAt: null,
          },
          select: { id: true },
        });

        if (rooms.length !== parsed.roomIds.length) {
          throw new InvalidBookingError(
            "One or more rooms are invalid for this cruise",
          );
        }

        const unavailableRoomIds = await getUnavailableRoomIds({
          cruiseScheduleId: parsed.cruiseScheduleId,
          roomIds: parsed.roomIds,
        });

        if (unavailableRoomIds.length > 0) {
          throw new BookingConflictError(
            "One or more rooms are no longer available",
          );
        }

        const holdExpiresAt = addUtcMinutes(15);

        const booking = await prisma.booking.create({
          data: {
            cruiseScheduleId: parsed.cruiseScheduleId,
            status: BookingStatus.PENDING_HOLD,
            holdExpiresAt,
          },
          select: { id: true, status: true },
        });

        return {
          bookingId: booking.id,
          holdExpiresAt: holdExpiresAt.toISOString(),
          status: booking.status,
          requestedRoomIds: parsed.roomIds,
        };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
