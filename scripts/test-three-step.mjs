import "dotenv/config";
import { prisma } from "../lib/prisma.ts";

const booking = await prisma.booking.create({
  data: {
    cruiseScheduleId: "cm0seed0001schedule00001",
    status: "PENDING_HOLD",
    holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
  },
});
console.log("step1", booking.id);

await prisma.bookingRoom.createMany({
  data: [
    {
      bookingId: booking.id,
      roomId: "cm0seed0001room0000001",
      cruiseScheduleId: "cm0seed0001schedule00001",
    },
  ],
});
console.log("step2 createMany ok");

const updated = await prisma.booking.update({
  where: { id: booking.id },
  data: { status: "CONFIRMED" },
});
console.log("step3 update", updated.status);

await prisma.bookingRoom.deleteMany({ where: { bookingId: booking.id } });
await prisma.booking.delete({ where: { id: booking.id } });
await prisma.$disconnect();
