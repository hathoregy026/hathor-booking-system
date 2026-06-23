import { NextResponse } from "next/server";
import { BookingStatus } from "@/app/generated/prisma/client";
import { handleRouteError } from "@/lib/api";
import { BIN_RETENTION_DAYS } from "@/lib/booking-retention";
import {
  purgeCruiseIfAllowed,
  purgeRoomIfAllowed,
} from "@/lib/catalog-bin";
import { utcNow } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const now = utcNow();
    const purgeBefore = new Date(now);
    purgeBefore.setUTCDate(purgeBefore.getUTCDate() - BIN_RETENTION_DAYS);

    const expiredHolds = await prisma.booking.updateMany({
      where: {
        status: BookingStatus.PENDING_HOLD,
        holdExpiresAt: { lt: now },
        deletedAt: null,
      },
      data: {
        status: BookingStatus.EXPIRED,
      },
    });

    const purgedBookings = await prisma.booking.deleteMany({
      where: {
        deletedAt: { lt: purgeBefore },
      },
    });

    const expiredCruises = await prisma.cruise.findMany({
      where: { deletedAt: { lt: purgeBefore } },
      select: { id: true },
    });

    let purgedCruises = 0;
    let skippedCruises = 0;

    for (const cruise of expiredCruises) {
      const purged = await purgeCruiseIfAllowed(cruise.id);
      if (purged) purgedCruises += 1;
      else skippedCruises += 1;
    }

    const expiredRooms = await prisma.room.findMany({
      where: { deletedAt: { lt: purgeBefore } },
      select: { id: true },
    });

    let purgedRooms = 0;
    let skippedRooms = 0;

    for (const room of expiredRooms) {
      const purged = await purgeRoomIfAllowed(room.id);
      if (purged) purgedRooms += 1;
      else skippedRooms += 1;
    }

    return NextResponse.json({
      expiredCount: expiredHolds.count,
      purgedBookingsCount: purgedBookings.count,
      purgedCruisesCount: purgedCruises,
      skippedCruisesCount: skippedCruises,
      purgedRoomsCount: purgedRooms,
      skippedRoomsCount: skippedRooms,
      processedAt: now.toISOString(),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
