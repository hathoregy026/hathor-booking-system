import { parseToUtcDate } from "@/lib/dates";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { prisma } from "@/lib/prisma";

export async function ensureDefaultTicketType(
  cruiseId: string,
  basePriceCents = 0,
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

  return prisma.ticketType.create({
    data: {
      cruiseId,
      name: "Standard",
      description: "Standard cabin fare",
      priceCents: basePriceCents,
    },
    select: {
      id: true,
      name: true,
      description: true,
      priceCents: true,
    },
  });
}

export async function ensureScheduleForCheckIn(
  cruiseId: string,
  checkInDateIso: string,
  nights: number,
) {
  const checkIn = parseToUtcDate(checkInDateIso);
  const arrival = new Date(checkIn);
  arrival.setUTCDate(arrival.getUTCDate() + nights);

  const onOrAfter = await prisma.cruiseSchedule.findFirst({
    where: {
      cruiseId,
      departureTime: { gte: checkIn },
    },
    orderBy: { departureTime: "asc" },
    select: {
      id: true,
      departureTime: true,
      arrivalTime: true,
    },
  });

  if (onOrAfter) return onOrAfter;

  const cruise = await prisma.cruise.findUnique({
    where: { id: cruiseId },
    select: { slug: true },
  });

  const seed = HATHOR_CRUISES.find((entry) => entry.slug === cruise?.slug);
  const departureDay = seed?.departureDay ?? "Saturday";
  const targetDow = departureDay === "Wednesday" ? 3 : 6;

  let departure = new Date(checkIn);
  for (let offset = 0; offset < 14; offset += 1) {
    const candidate = new Date(checkIn);
    candidate.setUTCDate(candidate.getUTCDate() + offset);
    if (candidate.getUTCDay() === targetDow) {
      departure = candidate;
      break;
    }
  }

  const arrivalTime = new Date(departure);
  arrivalTime.setUTCDate(arrivalTime.getUTCDate() + nights);

  return prisma.cruiseSchedule.create({
    data: {
      cruiseId,
      departureTime: departure,
      arrivalTime,
    },
    select: {
      id: true,
      departureTime: true,
      arrivalTime: true,
    },
  });
}

export async function ensureScheduleForDateRange(
  cruiseId: string,
  startDateIso: string,
  endDateIso: string,
) {
  const startDate = parseToUtcDate(startDateIso);
  const endDate = parseToUtcDate(endDateIso);

  const existing = await prisma.cruiseSchedule.findFirst({
    where: {
      cruiseId,
      departureTime: { lt: endDate },
      arrivalTime: { gt: startDate },
    },
    orderBy: { departureTime: "asc" },
    select: {
      id: true,
      departureTime: true,
      arrivalTime: true,
    },
  });

  if (existing) return existing;

  return prisma.cruiseSchedule.create({
    data: {
      cruiseId,
      departureTime: startDate,
      arrivalTime: endDate,
    },
    select: {
      id: true,
      departureTime: true,
      arrivalTime: true,
    },
  });
}
