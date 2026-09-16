import { Prisma } from "@/app/generated/prisma/client";

/**
 * Availability is no longer computed here. Every caller reads free cabins from
 * `lib/availability-service`, which is the one place that counts inventory.
 */

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

/**
 * Serialize writes for the vessel before inventory changes. The database
 * functions that allocate cabins take this same lock.
 */
export async function lockBookingInventory(
  tx: Prisma.TransactionClient,
  cruiseScheduleId: string,
  roomIds: string[],
): Promise<void> {
  void cruiseScheduleId; void roomIds;
  await tx.$queryRaw`SELECT 1 AS locked FROM pg_advisory_xact_lock(734821901)`;
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
