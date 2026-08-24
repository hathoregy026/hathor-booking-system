/**
 * Runs the app's REAL Prisma client + pool, outside Next.js.
 *
 * Established so far:
 *   - database executes the calendar query in 0.086 ms
 *   - a plain pg.Client on this machine connects in ~330 ms, any URL variant
 *   - the same work inside Next.js takes ~20 s
 *
 * This narrows the remaining gap. It imports lib/prisma.ts exactly as the app
 * does, so if it is FAST the problem is Next.js; if it is SLOW the problem is
 * the Prisma/adapter/pool setup itself.
 *
 * Run:  npx tsx scripts/diagnose-prisma-vs-next.ts
 *
 * Read-only. Prints timings only, no credentials.
 */
import { performance } from "node:perf_hooks";

const CRUISE_ID = "e75271baa58a416f93a7626cf"; // 7 Nights — the failing one

function mark() {
  const t = performance.now();
  return () => `${(performance.now() - t).toFixed(0)} ms`;
}

async function main() {
  console.log("Importing lib/prisma.ts (this is where the app builds its client)...");
  const tImport = mark();
  const { prisma } = await import("../lib/prisma");
  console.log(`  import + client construction: ${tImport()}`);
  console.log("");

  // First query pays any lazy connection/handshake cost.
  const tFirst = mark();
  await prisma.$queryRaw`select 1`;
  console.log(`first query  (select 1):        ${tFirst()}`);

  const tSecond = mark();
  await prisma.$queryRaw`select 1`;
  console.log(`second query (select 1):        ${tSecond()}`);
  console.log("");

  // The exact four queries lib/cruise-calendar.ts runs, in the same order.
  const tCruise = mark();
  const cruise = await prisma.cruise.findFirst({
    where: { id: CRUISE_ID, deletedAt: null },
    select: {
      id: true,
      basePriceCents: true,
      rooms: { where: { deletedAt: null }, select: { id: true, name: true } },
    },
  });
  console.log(`cruise.findFirst (+rooms):      ${tCruise()}  rooms=${cruise?.rooms.length ?? 0}`);

  const tTicket = mark();
  const tickets = await prisma.ticketType.findMany({
    where: { cruiseId: CRUISE_ID },
    select: { id: true },
  });
  console.log(`ticketType.findMany:            ${tTicket()}  rows=${tickets.length}`);

  const tSched = mark();
  const schedules = await prisma.cruiseSchedule.findMany({
    where: { cruiseId: CRUISE_ID },
    select: { id: true },
  });
  console.log(`cruiseSchedule.findMany:        ${tSched()}  rows=${schedules.length}`);

  const tBlocked = mark();
  const blocked = await prisma.bookingRoom.findMany({
    where: { cruiseScheduleId: { in: schedules.map((s) => s.id) } },
    select: { roomId: true },
  });
  console.log(`bookingRoom.findMany:           ${tBlocked()}  rows=${blocked.length}`);
  console.log("");

  console.log("Interpretation:");
  console.log("  all fast (<1s total)  -> Prisma is fine; Next.js is adding the ~20s");
  console.log("  import slow           -> client construction / engine startup");
  console.log("  first query slow only -> lazy connect; pool warm-up on each cold client");
  console.log("  every query slow      -> the adapter or pool is the bottleneck");

  process.exit(0);
}

main().catch((error) => {
  console.error("FAILED:", error instanceof Error ? error.message : error);
  process.exit(1);
});
