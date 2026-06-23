import {
  computeStayDates,
  getSchedulesFromCheckIn,
} from "@/lib/availability-search";
import { getBookingRoomDetails } from "@/lib/booking-room-details";
import {
  findStayDurationOption,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { ensureDefaultTicketType } from "@/lib/cruise-setup";
import { prisma } from "@/lib/prisma";

export type CheckoutSummary = {
  roomId: string;
  cruiseId: string;
  scheduleId: string;
  title: string;
  meta: string;
  roomType: string | null;
  checkInDate: string | null;
  adults: number;
  children: number;
  priceCents: number;
  backHref: string;
  ticketTypeId: string | null;
};

function parseGuestCount(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function buildBackHref(
  roomId: string,
  query: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const suffix = params.toString();
  return suffix
    ? `/booking/cruise/${roomId}?${suffix}`
    : `/booking/cruise/${roomId}`;
}

async function resolveScheduleId(input: {
  cruiseId: string;
  scheduleId?: string | null;
  checkInDate?: string | null;
  duration?: string | null;
}): Promise<string | null> {
  if (input.scheduleId) {
    const schedule = await prisma.cruiseSchedule.findFirst({
      where: { id: input.scheduleId, cruiseId: input.cruiseId },
      select: { id: true },
    });
    return schedule?.id ?? null;
  }

  if (!input.checkInDate || !input.duration) return null;

  const durationOption = findStayDurationOption(
    input.duration as StayDurationValue,
  );
  if (!durationOption) return null;

  const { endDate } = computeStayDates(input.checkInDate, durationOption.value);
  const schedules = await getSchedulesFromCheckIn(
    input.cruiseId,
    input.checkInDate,
    endDate,
  );

  return schedules[0]?.id ?? null;
}

export async function getCheckoutSummary(input: {
  roomId: string;
  cruiseId: string;
  scheduleId?: string | null;
  checkInDate?: string | null;
  duration?: string | null;
  priceCents?: string | null;
  adults?: string | null;
  children?: string | null;
}): Promise<CheckoutSummary | null> {
  const roomDetails = await getBookingRoomDetails(input.roomId);
  if (!roomDetails || roomDetails.cruiseId !== input.cruiseId) {
    return null;
  }

  const scheduleId = await resolveScheduleId({
    cruiseId: input.cruiseId,
    scheduleId: input.scheduleId,
    checkInDate: input.checkInDate,
    duration: input.duration,
  });

  if (!scheduleId) return null;

  const priceFromQuery = input.priceCents
    ? Number.parseInt(input.priceCents, 10)
    : Number.NaN;
  const priceCents = Number.isFinite(priceFromQuery)
    ? priceFromQuery
    : roomDetails.priceCents;

  const ticketType = await ensureDefaultTicketType(
    input.cruiseId,
    roomDetails.priceCents,
  );

  const backQuery = {
    checkInDate: input.checkInDate ?? undefined,
    duration: input.duration ?? undefined,
    scheduleId: scheduleId,
    adults: input.adults ?? undefined,
    children: input.children ?? undefined,
  };

  return {
    roomId: roomDetails.roomId,
    cruiseId: roomDetails.cruiseId,
    scheduleId,
    title: roomDetails.title,
    meta: roomDetails.meta,
    roomType: roomDetails.roomType,
    checkInDate: input.checkInDate ?? null,
    adults: parseGuestCount(input.adults ?? undefined, 2),
    children: parseGuestCount(input.children ?? undefined, 0),
    priceCents,
    backHref: buildBackHref(roomDetails.roomId, backQuery),
    ticketTypeId: ticketType.id,
  };
}
