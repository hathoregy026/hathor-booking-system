import { BookingStatus } from "@/app/generated/prisma/client";
import {
  buildRoomDisplayTitle,
} from "@/lib/booking-room-details";
import {
  findStayDurationOption,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { prisma } from "@/lib/prisma";
import { verifyBookingAccessToken } from "@/lib/booking-access-token";

export type BookingSuccessDetails = {
  bookingId: string;
  statusLabel: string;
  cruiseTitle: string;
  durationMeta: string;
  checkInDate: string;
  roomType: string | null;
  guestSummary: string;
  totalPriceCents: number;
  customerEmail: string | null;
  ratePlanLabel: string;
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.PENDING_HOLD]: "Pending Confirmation",
  [BookingStatus.CONFIRMED]: "Confirmed · Payment Pending",
  [BookingStatus.CANCELLED]: "Cancelled",
  [BookingStatus.EXPIRED]: "Expired",
};

function resolveDurationMeta(slug: string): string {
  const fromCatalog = HATHOR_CRUISES.find((cruise) => cruise.slug === slug);
  if (fromCatalog) {
    const parts = [
      `${fromCatalog.nights} Nights / ${fromCatalog.days} Days`,
      fromCatalog.departureDay ? `Departs: ${fromCatalog.departureDay}` : null,
    ].filter(Boolean);
    return parts.join(" ");
  }

  const fromDuration = findStayDurationOption(slug as StayDurationValue);
  if (fromDuration) {
    return `${fromDuration.nights} Nights / ${fromDuration.nights + 1} Days`;
  }

  return "";
}

export function parseGuestSummary(customerName: string | null): string {
  if (!customerName) return "—";

  const guestsLine = customerName
    .split("\n")
    .find((line) => line.startsWith("Guests:"));

  if (!guestsLine) return "—";

  return guestsLine.replace(/^Guests:\s*/, "").trim();
}

export async function getBookingSuccessDetails(
  bookingId: string,
  accessToken: string,
): Promise<BookingSuccessDetails | null> {
  if (!verifyBookingAccessToken(bookingId, accessToken)) return null;
  const booking = await prisma.booking.findFirst({
    where: {
      id: bookingId,
      deletedAt: null,
    },
    select: {
      id: true,
      totalPriceCents: true,
      status: true,
      customerName: true,
      customerEmail: true,
      adultCount: true,
      childCount: true,
      ratePlan: true,
      cruiseSchedule: {
        select: {
          departureTime: true,
          cruise: {
            select: {
              name: true,
              slug: true,
              ports: true,
              basePriceCents: true,
            },
          },
        },
      },
      bookingRooms: {
        select: {
          unitPriceCents: true,
          room: {
            select: {
              name: true,
              roomType: true,
              priceMultiplier: true,
            },
          },
        },
      },
      bookingTickets: {
        select: {
          quantity: true,
          unitPriceCents: true,
          ticketType: { select: { priceCents: true } },
        },
      },
    },
  });

  if (!booking) return null;

  const cruise = booking.cruiseSchedule.cruise;
  const ports = cruise.ports;
  const primaryRoom = booking.bookingRooms[0]?.room;

  const cruiseTitle = primaryRoom
    ? buildRoomDisplayTitle(primaryRoom.name, ports)
    : cruise.name;

  const durationMeta = resolveDurationMeta(cruise.slug);

  const roomPriceCents = booking.bookingRooms.reduce((sum, entry) => {
    if (entry.unitPriceCents !== null) return sum + entry.unitPriceCents;
    const multiplier =
      entry.room.priceMultiplier > 0 ? entry.room.priceMultiplier : 1;
    return sum + Math.round(cruise.basePriceCents * multiplier);
  }, 0);

  const ticketPriceCents = booking.bookingTickets.reduce(
    (sum, ticket) =>
      sum +
      ticket.quantity *
        (ticket.unitPriceCents ?? ticket.ticketType.priceCents),
    0,
  );

  const totalPriceCents =
    booking.totalPriceCents ??
    (roomPriceCents > 0 ? roomPriceCents : ticketPriceCents);

  return {
    bookingId: booking.id,
    statusLabel: STATUS_LABELS[booking.status] ?? booking.status,
    cruiseTitle,
    durationMeta,
    checkInDate: booking.cruiseSchedule.departureTime.toISOString(),
    roomType: primaryRoom?.roomType ?? null,
    guestSummary:
      booking.adultCount !== null && booking.childCount !== null
        ? `${booking.adultCount} adult${booking.adultCount === 1 ? "" : "s"}, ${booking.childCount} child${booking.childCount === 1 ? "" : "ren"}`
        : parseGuestSummary(booking.customerName),
    totalPriceCents,
    customerEmail: booking.customerEmail,
    ratePlanLabel:
      booking.ratePlan === "NON_REFUNDABLE"
        ? "Non-refundable rate · 10% saving"
        : "Standard flexible rate",
  };
}
