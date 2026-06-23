import "dotenv/config";
import { prisma } from "../lib/prisma.ts";

const booking = await prisma.booking.create({
  data: {
    cruiseScheduleId: "cm0seed0001schedule00001",
    status: "PENDING_HOLD",
    holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
  },
});
console.log("created", booking.id);
await prisma.booking.delete({ where: { id: booking.id } });
console.log("deleted");
await prisma.$disconnect();
