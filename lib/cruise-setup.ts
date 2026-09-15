import { parseToUtcDate, exactUtcDayBounds } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

async function findScheduleOnUtcDay(cruiseId: string, dayStart: Date, dayEnd: Date) {
  return prisma.cruiseSchedule.findFirst({
    where: {
      cruiseId,
      isBookable: true,
      departureTime: { gte: dayStart, lt: dayEnd },
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: {
      id: true,
      departureTime: true,
      arrivalTime: true,
    },
  });
}

export async function ensureDefaultTicketType(
  cruiseId: string,
  _basePriceCents = 0,
) {
  const existing = await prisma.ticketType.findFirst({
    where: { cruiseId },
    orderBy: { priceCents: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
    },
  });

  if (existing) return existing;

  throw new Error("Missing configured accommodation rate");
}

/** Compatibility helpers only read existing operational sailings. */
export async function ensureScheduleForCheckIn(cruiseId: string, checkInDateIso: string, _nights: number) {
  const { dayStart, dayEnd } = exactUtcDayBounds(checkInDateIso);
  return findScheduleOnUtcDay(cruiseId, dayStart, dayEnd);
}
export async function ensureScheduleForDateRange(cruiseId: string, startDateIso: string, endDateIso: string) {
  return prisma.cruiseSchedule.findFirst({
    where: { cruiseId, isBookable: true, departureTime: { gte: parseToUtcDate(startDateIso), lt: parseToUtcDate(endDateIso), gt: new Date() } },
    orderBy: { departureTime: "asc" }, select: { id: true, departureTime: true, arrivalTime: true },
  });
}
