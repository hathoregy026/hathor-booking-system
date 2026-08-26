import { NextRequest, NextResponse } from "next/server";
import {
  BookingRatePlan,
  BookingStatus,
} from "@/app/generated/prisma/client";
import { handleRouteError } from "@/lib/api";
import {
  BookingConflictError,
  getUnavailableRoomIds,
  InvalidBookingError,
  lockBookingInventory,
} from "@/lib/booking";
import { assertHoldBookingRequest } from "@/lib/booking-validation";
import {
  assertHoldTokenConfiguration,
  createHoldToken,
} from "@/lib/booking-hold-token";
import { withDb } from "@/lib/db-safe";
import { addUtcMinutes, utcNow } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import {
  assertTrustedPublicJsonRequest,
  enforcePublicRateLimit,
  requireIdempotencyKey,
} from "@/lib/public-api-security";
import { applyRatePlan } from "@/lib/rate-plans";
import { createHoldSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    assertTrustedPublicJsonRequest(request);
    await enforcePublicRateLimit({
      request,
      scope: "booking-hold",
      limit: 8,
      windowMs: 10 * 60_000,
    });
    const idempotencyKey = requireIdempotencyKey(request);
    const body = await request.json();
    const parsed = createHoldSchema.parse(body);
    assertHoldTokenConfiguration();
    const ratePlan =
      parsed.ratePlan === "non-refundable"
        ? BookingRatePlan.NON_REFUNDABLE
        : BookingRatePlan.STANDARD;

    const result = await withDb(async () => {
      return prisma.$transaction(async (tx) => {
        await tx.$queryRaw`
          SELECT pg_advisory_xact_lock(hashtextextended(${`idempotency:${idempotencyKey}`}, 0))
        `;

        const existing = await tx.booking.findUnique({
          where: { idempotencyKey },
          select: {
            id: true,
            status: true,
            holdExpiresAt: true,
            cruiseScheduleId: true,
            ratePlan: true,
            totalPriceCents: true,
            bookingRooms: { select: { roomId: true } },
          },
        });

        if (existing) {
          const existingRoomIds = existing.bookingRooms.map((entry) => entry.roomId).sort();
          const requestedRoomIds = [...parsed.roomIds].sort();
          const sameRooms =
            existingRoomIds.length === requestedRoomIds.length &&
            existingRoomIds.every((roomId, index) => roomId === requestedRoomIds[index]);
          if (
            existing.cruiseScheduleId !== parsed.cruiseScheduleId ||
            !sameRooms ||
            existing.ratePlan !== ratePlan
          ) {
            throw new InvalidBookingError("Idempotency key was already used for another booking");
          }
          if (
            existing.status === BookingStatus.PENDING_HOLD &&
            existing.holdExpiresAt &&
            existing.holdExpiresAt > utcNow()
          ) {
            return {
              bookingId: existing.id,
              holdExpiresAt: existing.holdExpiresAt,
              status: existing.status,
              roomIds: existingRoomIds,
              totalPriceCents: existing.totalPriceCents ?? 0,
              ratePlan: existing.ratePlan,
            };
          }
          throw new BookingConflictError("This booking attempt is no longer active");
        }

        await lockBookingInventory(tx, parsed.cruiseScheduleId, parsed.roomIds);
        await assertHoldBookingRequest(tx, {
          cruiseId: parsed.cruiseId,
          cruiseScheduleId: parsed.cruiseScheduleId,
          roomIds: parsed.roomIds,
          startDate: parsed.startDate,
          endDate: parsed.endDate,
        });

        const rooms = await tx.room.findMany({
          where: {
            id: { in: parsed.roomIds },
            cruiseId: parsed.cruiseId,
            deletedAt: null,
          },
          select: {
            id: true,
            priceMultiplier: true,
            cruise: { select: { basePriceCents: true } },
          },
        });

        if (rooms.length !== parsed.roomIds.length) {
          throw new InvalidBookingError("One or more rooms are invalid for this cruise");
        }

        const unavailableRoomIds = await getUnavailableRoomIds(
          {
            cruiseScheduleId: parsed.cruiseScheduleId,
            roomIds: parsed.roomIds,
          },
          tx,
        );
        if (unavailableRoomIds.length > 0) {
          throw new BookingConflictError("One or more rooms are no longer available");
        }

        const holdExpiresAt = addUtcMinutes(15);
        const now = utcNow();
        const roomPrices = new Map(
          rooms.map((room) => {
            const multiplier = room.priceMultiplier > 0 ? room.priceMultiplier : 1;
            const standardPrice = Math.round(room.cruise.basePriceCents * multiplier);
            return [room.id, applyRatePlan(standardPrice, parsed.ratePlan)] as const;
          }),
        );
        const totalPriceCents = parsed.roomIds.reduce(
          (sum, roomId) => sum + (roomPrices.get(roomId) ?? 0),
          0,
        );

        const booking = await tx.booking.create({
          data: {
            cruiseScheduleId: parsed.cruiseScheduleId,
            status: BookingStatus.PENDING_HOLD,
            ratePlan,
            idempotencyKey,
            holdExpiresAt,
            totalPriceCents,
            currency: "USD",
            priceSnapshotAt: now,
          },
          select: { id: true, status: true },
        });

        await tx.bookingRoom.createMany({
          data: parsed.roomIds.map((roomId) => ({
            bookingId: booking.id,
            roomId,
            cruiseScheduleId: parsed.cruiseScheduleId,
            unitPriceCents: roomPrices.get(roomId),
          })),
        });

        return {
          bookingId: booking.id,
          holdExpiresAt,
          status: booking.status,
          roomIds: parsed.roomIds,
          totalPriceCents,
          ratePlan,
        };
      });
    });

    const holdSecret = createHoldToken(result.bookingId, result.holdExpiresAt);

    return NextResponse.json(
      {
        ...result,
        holdSecret,
        holdExpiresAt: result.holdExpiresAt.toISOString(),
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
