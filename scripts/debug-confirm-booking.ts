import "dotenv/config";
import { prisma } from "../lib/prisma";
import { BookingStatus } from "../app/generated/prisma/client";
import { addUtcMinutes } from "../lib/dates";

async function main() {
  const room = await prisma.room.findFirst({
    where: {
      name: { contains: "Twin Bed" },
      deletedAt: null,
    },
    include: {
      cruise: {
        include: {
          schedules: { take: 1, orderBy: { departureTime: "asc" } },
          ticketTypes: true,
        },
      },
    },
  });

  if (!room?.cruise.schedules[0]) {
    console.log("No room/schedule found");
    return;
  }

  const schedule = room.cruise.schedules[0];
  const ticketType = room.cruise.ticketTypes[0];

  console.log("Room:", room.id, room.name);
  console.log("Schedule:", schedule.id);
  console.log("Ticket types:", room.cruise.ticketTypes);

  const holdExpiresAt = addUtcMinutes(15);
  const booking = await prisma.booking.create({
    data: {
      cruiseScheduleId: schedule.id,
      status: BookingStatus.PENDING_HOLD,
      holdExpiresAt,
    },
  });

  console.log("Created hold:", booking.id);

  try {
    await prisma.bookingRoom.create({
      data: {
        bookingId: booking.id,
        roomId: room.id,
        cruiseScheduleId: schedule.id,
      },
    });

    const ticketId = ticketType?.id ?? "standard";
    console.log("Using ticketTypeId:", ticketId);

    await prisma.bookingTicket.create({
      data: {
        bookingId: booking.id,
        ticketTypeId: ticketId,
        quantity: 1,
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.CONFIRMED,
        customerName: "Test User",
        customerEmail: "test@example.com",
        holdExpiresAt: null,
      },
    });

    console.log("Confirm simulation OK");
  } catch (error) {
    console.error("Confirm simulation FAILED:", error);
  } finally {
    await prisma.booking.delete({ where: { id: booking.id } }).catch(() => {});
  }
}

main().finally(() => prisma.$disconnect());
