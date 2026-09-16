import { BookingStatus } from "@/app/generated/prisma/client";
import {
  buildRoomDisplayTitle,
} from "@/lib/booking-room-details";
import {
  findStayDurationOption,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { HATHOR_CRUISES } from "@/lib/hathor-catalog";
import { getBookingReservation } from "@/lib/booking-engine";
import { verifyBookingAccessToken } from "@/lib/booking-access-token";

export type BookingSuccessDetails = {
  bookingId: string;
  statusLabel: string;
  cruiseTitle: string;
  voyageName: string;
  durationSlug: string;
  route: string | null;
  durationMeta: string;
  checkInDate: string;
  roomType: string | null;
  guestSummary: string;
  totalPriceCents: number;
  customerEmail: string | null;
  ratePlanLabel: string;
  status: string;
  paymentMethod: string | null;
  amountPaidCents: number;
  paymentSchedule: { milestone: string; dueAt: string | null; cumulativeCents: number }[];
  emailStatus: string;
  returnDate: string;
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  [BookingStatus.REQUESTED]: "Request received",
  [BookingStatus.PENDING_HOLD]: "Temporary hold",
  [BookingStatus.CONFIRMED]: "Confirmed",
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
  const booking = await getBookingReservation(bookingId);

  if (!booking) return null;

  const cruise = booking.cruiseSchedule.cruise;
  const ports = cruise.ports;
  const primaryRoom = booking.bookingRooms[0]?.room;

  const cruiseTitle = primaryRoom
    ? buildRoomDisplayTitle(primaryRoom.name, ports)
    : cruise.name;

  const durationMeta = resolveDurationMeta(cruise.slug);

  const totalPriceCents = booking.totalPriceCents!;

  return {
    bookingId: booking.id,
    statusLabel: STATUS_LABELS[booking.status] ?? booking.status,
    cruiseTitle,
    voyageName: cruise.name,
    durationSlug: cruise.slug,
    route: ports,
    durationMeta,
    checkInDate: booking.cruiseSchedule.departureTime.toISOString(),
    roomType: booking.bookingRooms.map(r => r.room.roomType ?? r.room.name).join(", "),
    guestSummary:
      booking.adultCount !== null && booking.childCount !== null
        ? `${booking.adultCount} adult${booking.adultCount === 1 ? "" : "s"}, ${booking.childCount} child${booking.childCount === 1 ? "" : "ren"}`
        : parseGuestSummary(booking.customerName),
    totalPriceCents,
    customerEmail: booking.customerEmail,
    ratePlanLabel: "Standard Hathor rate",
    status: booking.status,
    paymentMethod: booking.paymentMethod,
    amountPaidCents: booking.payments.reduce((sum,p) => sum + (p.kind === "REFUND" ? -p.amountCents : p.amountCents), 0),
    paymentSchedule: booking.paymentSchedule.map(p => ({ milestone: p.milestone, dueAt: p.dueAt?.toISOString() ?? null, cumulativeCents: p.cumulativeCents })),
    emailStatus: booking.guestEmailStatus,
    returnDate: booking.cruiseSchedule.arrivalTime.toISOString(),
  };
}
