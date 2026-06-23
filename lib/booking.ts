import { BookingStatus, Prisma } from "@/app/generated/prisma/client";
import { parseToUtcDate, utcNow } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

type ActiveBookingFilter = {
  cruiseScheduleId: string;
  roomIds: string[];
  excludeBookingId?: string;
};

/** Rooms blocked by CONFIRMED bookings or non-expired PENDING_HOLD bookings. */
export async function getUnavailableRoomIds({
  cruiseScheduleId,
  roomIds,
  excludeBookingId,
}: ActiveBookingFilter): Promise<string[]> {
  const now = utcNow();

  const blocked = await prisma.bookingRoom.findMany({
    where: {
      cruiseScheduleId,
      roomId: { in: roomIds },
      ...(excludeBookingId ? { bookingId: { not: excludeBookingId } } : {}),
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

  return [...new Set(blocked.map((entry) => entry.roomId))];
}

/** Batch availability check — one query for all schedules (faster on pooled DB). */
export async function getUnavailableRoomsBySchedule(input: {
  cruiseScheduleIds: string[];
  roomIds: string[];
  excludeBookingId?: string;
}): Promise<Map<string, Set<string>>> {
  const { cruiseScheduleIds, roomIds, excludeBookingId } = input;

  if (cruiseScheduleIds.length === 0 || roomIds.length === 0) {
    return new Map();
  }

  const now = utcNow();

  const blocked = await prisma.bookingRoom.findMany({
    where: {
      cruiseScheduleId: { in: cruiseScheduleIds },
      roomId: { in: roomIds },
      ...(excludeBookingId ? { bookingId: { not: excludeBookingId } } : {}),
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
    select: { roomId: true, cruiseScheduleId: true },
  });

  const bySchedule = new Map<string, Set<string>>();

  for (const entry of blocked) {
    let roomSet = bySchedule.get(entry.cruiseScheduleId);
    if (!roomSet) {
      roomSet = new Set();
      bySchedule.set(entry.cruiseScheduleId, roomSet);
    }
    roomSet.add(entry.roomId);
  }

  return bySchedule;
}

export async function getSchedulesInDateRange(
  cruiseId: string,
  startDateIso: string,
  endDateIso: string,
) {
  const startDate = parseToUtcDate(startDateIso);
  const endDate = parseToUtcDate(endDateIso);

  return prisma.cruiseSchedule.findMany({
    where: {
      cruiseId,
      departureTime: { lt: endDate },
      arrivalTime: { gt: startDate },
    },
    orderBy: { departureTime: "asc" },
    select: {
      id: true,
      departureTime: true,
      arrivalTime: true,
    },
  });
}

export class BookingConflictError extends Error {
  constructor(message = "Room no longer available") {
    super(message);
    this.name = "BookingConflictError";
  }
}

export class InvalidBookingError extends Error {
  constructor(message = "Invalid booking") {
    super(message);
    this.name = "InvalidBookingError";
  }
}

export async function lockBookingRow(
  tx: Prisma.TransactionClient,
  bookingId: string,
) {
  await tx.$executeRaw`
    SELECT id
    FROM "Booking"
    WHERE id = ${bookingId}
    FOR UPDATE
  `;

  return tx.booking.findUnique({ where: { id: bookingId } });
}
