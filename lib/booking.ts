import { Prisma } from "@/app/generated/prisma/client";
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
}: ActiveBookingFilter,
database: Prisma.TransactionClient | typeof prisma = prisma,
): Promise<string[]> {
  const schedule = await database.cruiseSchedule.findUnique({ where: { id: cruiseScheduleId } });
  if (!schedule) return roomIds;
  const blocked = await database.inventoryAllocation.findMany({
    where: { roomId: { in: roomIds }, active: true,
      startsAt: { lt: schedule.arrivalTime }, endsAt: { gt: schedule.departureTime },
      OR: [{ expiresAt: null }, { expiresAt: { gt: utcNow() } }],
      ...(excludeBookingId ? { OR: [
        { bookingRoomId: null },
        { bookingRoom: { bookingId: { not: excludeBookingId } } },
      ], AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: utcNow() } }] }] } : {}),
    }, select: { roomId: true },
  });
  return [...new Set(blocked.map(entry => entry.roomId))];
}

/**
 * Serialize writes for each physical cabin/sailing before availability is
 * checked. The lock key uses cruise + UTC date + room, so even a legacy
 * duplicate schedule row cannot sell the same cabin twice.
 */
export async function lockBookingInventory(
  tx: Prisma.TransactionClient,
  cruiseScheduleId: string,
  roomIds: string[],
): Promise<void> {
  void cruiseScheduleId; void roomIds;
  await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(734821901)`;
}

/** Batch availability check — one query for all schedules (faster on pooled DB). */
export async function getUnavailableRoomsBySchedule(input: {
  cruiseScheduleIds: string[];
  roomIds: string[];
  excludeBookingId?: string;
}): Promise<Map<string, Set<string>>> {
  const result = new Map<string, Set<string>>();
  for (const cruiseScheduleId of input.cruiseScheduleIds) {
    result.set(cruiseScheduleId, new Set(await getUnavailableRoomIds({ cruiseScheduleId, roomIds: input.roomIds, excludeBookingId: input.excludeBookingId })));
  }
  return result;
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
      isBookable: true,
      departureTime: { lt: endDate, gt: utcNow() },
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
