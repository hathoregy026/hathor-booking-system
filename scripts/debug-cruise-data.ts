import "dotenv/config";
import { prisma } from "../lib/prisma";
import { runCruiseSearch } from "../lib/cruise-search";
import { DEFAULT_ROOM_SEARCH_CONFIG } from "../lib/booking-search-config";

async function main() {
  const cruises = await prisma.cruise.findMany({
    where: { deletedAt: null },
    select: {
      slug: true,
      name: true,
      rooms: {
        where: { deletedAt: null },
        select: { name: true, roomType: true, capacity: true },
      },
      schedules: {
        select: { departureTime: true, arrivalTime: true },
        orderBy: { departureTime: "asc" },
        take: 3,
      },
    },
  });

  console.log("=== DB cruises ===");
  console.log(JSON.stringify(cruises, null, 2));

  const testDate = "2026-07-01T00:00:00.000Z";
  for (const duration of [
    "3-nights-aswan-luxor",
    "4-nights-luxor-aswan",
    "7-nights-luxor-aswan-luxor",
  ] as const) {
    const result = await runCruiseSearch(duration, testDate, [
      DEFAULT_ROOM_SEARCH_CONFIG,
    ]);
    console.log(`\n=== Search ${duration} default luxury-rooms ===`);
    console.log({
      reason: result.reason,
      roomCount: result.cruises[0]?.rooms.length ?? 0,
      scheduleCount: result.schedules.length,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
