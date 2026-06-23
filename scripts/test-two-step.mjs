import "dotenv/config";
import { prisma } from "../lib/prisma.ts";

const booking = await prisma.booking.create({
  data: {
    cruiseScheduleId: "cm0seed0001schedule00001",
    status: "PENDING_HOLD",
    holdExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
  },
});
console.log("step1 create", booking.id);

const updated = await prisma.booking.update({
  where: { id: booking.id },
  data: { status: "CONFIRMED", customerName: "Test" },
});
console.log("step2 update", updated.status);

await prisma.booking.delete({ where: { id: booking.id } });
console.log("step3 delete ok");
await prisma.$disconnect();
