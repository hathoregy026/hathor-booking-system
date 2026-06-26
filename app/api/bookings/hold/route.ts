import { NextRequest, NextResponse } from "next/server";
import { BookingStatus } from "@/app/generated/prisma/client";
import { handleRouteError } from "@/lib/api";
import {
  BookingConflictError,
  InvalidBookingError,
} from "@/lib/booking";
import { createHoldToken } from "@/lib/booking-hold-token";
import { resolveDatabaseUrl } from "@/lib/database-config";
import { withDb } from "@/lib/db-safe";
import { addUtcMinutes, utcNow } from "@/lib/dates";
import { getSharedPgPool } from "@/lib/pg-pool";
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

      const holdExpiresAt = addUtcMinutes(15);
      const now = utcNow();

      const blocked = await prisma.bookingRoom.findMany({
        where: {
          cruiseScheduleId: parsed.cruiseScheduleId,
          roomId: { in: parsed.roomIds },
          booking: {
            deletedAt: null,
            OR: [
              { status: BookingStatus.CONFIRMED },
              {
                status: BookingStatus.PENDING_HOLD,
                OR: [
                  { holdExpiresAt: null },
                  { holdExpiresAt: { gt: now } },
                ],
              },
            ],
          },
        },
        select: { roomId: true },
      });

      if (blocked.length > 0) {
        throw new BookingConflictError(
          "One or more rooms are no longer available",
        );
      }

      const booking = await prisma.booking.create({
        data: {
          cruiseScheduleId: parsed.cruiseScheduleId,
          status: BookingStatus.PENDING_HOLD,
          holdExpiresAt,
        },
        select: { id: true, status: true },
      });

      try {
        await prisma.bookingRoom.createMany({
          data: parsed.roomIds.map((roomId) => ({
            bookingId: booking.id,
            roomId,
            cruiseScheduleId: parsed.cruiseScheduleId,
          })),
        });
      } catch (error) {
        try {
          const pool = getSharedPgPool(resolveDatabaseUrl());
          await pool.query(`DELETE FROM "Booking" WHERE id = $1`, [booking.id]);
        } catch {
          // Best-effort rollback; expired-hold cron will purge orphans.
        }
        throw error;
      }

      const holdSecret = createHoldToken(booking.id, holdExpiresAt);

      return {
        bookingId: booking.id,
        holdSecret,
        holdExpiresAt: holdExpiresAt.toISOString(),
        status: booking.status,
        roomIds: parsed.roomIds,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
