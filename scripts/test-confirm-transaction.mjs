import "dotenv/config";
import { prisma } from "../lib/prisma.ts";

const scheduleId = "cm0seed0001schedule00001";
const roomId = "cm0seed0001room0000003";

try {
  const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const booking = await prisma.booking.create({
    data: {
      cruiseScheduleId: scheduleId,
      status: "PENDING_HOLD",
      holdExpiresAt,
    },
  });

  await prisma.bookingRoom.createMany({
    data: [{ bookingId: booking.id, roomId, cruiseScheduleId: scheduleId }],
  });

  const confirmed = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "CONFIRMED",
      customerName: "KHLID",
      customerEmail: "test@example.com",
      holdExpiresAt: null,
    },
    include: { bookingRooms: true },
  });

  console.log("CONFIRMED:", confirmed.id, confirmed.status);

  await prisma.bookingRoom.deleteMany({ where: { bookingId: booking.id } });
  await prisma.booking.delete({ where: { id: booking.id } });
  console.log("Cleaned up");
} catch (error) {
  console.error("FAILED:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
