import { NextRequest, NextResponse } from "next/server";
import {
  BookingStatus,
  Prisma,
} from "@/app/generated/prisma/client";
import { handleRouteError } from "@/lib/api";
import {
  BookingConflictError,
  InvalidBookingError,
  lockBookingInventory,
  lockBookingRow,
} from "@/lib/booking";
import {
  assertBookingAccessTokenConfiguration,
  createBookingAccessToken,
} from "@/lib/booking-access-token";
import {
  UnauthorizedBookingError,
  verifyHoldToken,
} from "@/lib/booking-hold-token";
import { assertHoldBookingRequest } from "@/lib/booking-validation";
import { buildEmailDetailsFromConfirmBooking } from "@/lib/booking-email-details";
import { withDb } from "@/lib/db-safe";
import { utcNow } from "@/lib/dates";
import {
  sendAdminAlertEmail,
  sendBookingConfirmedEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getSiteBaseUrl } from "@/lib/public-url";
import { validateRoomGuestCapacityForDbRoom } from "@/lib/room-capacity";
import {
  assertTrustedPublicJsonRequest,
  enforcePublicRateLimit,
  requireIdempotencyKey,
} from "@/lib/public-api-security";
import { confirmBookingSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type TicketInput = {
  ticketTypeId: string;
  quantity: number;
};

type ResolvedTicketLine = TicketInput & {
  unitPriceCents: number;
};

function roomIdsMatch(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((roomId, index) => roomId === sortedRight[index]);
}

async function resolveTicketLines(
  tx: Prisma.TransactionClient,
  cruiseId: string,
  roomCount: number,
  tickets: TicketInput[],
): Promise<ResolvedTicketLine[]> {
  let cruiseTicketTypes = await tx.ticketType.findMany({
    where: { cruiseId },
    orderBy: [{ priceCents: "asc" }, { id: "asc" }],
    select: { id: true, priceCents: true },
  });

  let defaultType = cruiseTicketTypes[0];
  if (!defaultType) {
    const cruise = await tx.cruise.findUnique({
      where: { id: cruiseId },
      select: { basePriceCents: true },
    });
    if (!cruise) throw new InvalidBookingError("Cruise not found");

    defaultType = await tx.ticketType.create({
      data: {
        cruiseId,
        name: "Standard",
        description: "Standard cabin fare",
        priceCents: cruise.basePriceCents,
      },
      select: { id: true, priceCents: true },
    });
    cruiseTicketTypes = [defaultType];
  }

  const pricesById = new Map(
    cruiseTicketTypes.map((ticket) => [ticket.id, ticket.priceCents]),
  );
  const aggregated = new Map<string, number>();

  for (const ticket of tickets) {
    const ticketTypeId = pricesById.has(ticket.ticketTypeId)
      ? ticket.ticketTypeId
      : defaultType.id;
    aggregated.set(
      ticketTypeId,
      (aggregated.get(ticketTypeId) ?? 0) + ticket.quantity,
    );
  }

  if (aggregated.size === 0) {
    aggregated.set(defaultType.id, Math.max(roomCount, 1));
  }

  return [...aggregated.entries()].map(([ticketTypeId, quantity]) => ({
    ticketTypeId,
    quantity,
    unitPriceCents: pricesById.get(ticketTypeId) ?? defaultType.priceCents,
  }));
}

export async function POST(request: NextRequest) {
  try {
    assertTrustedPublicJsonRequest(request);
    await enforcePublicRateLimit({
      request,
      scope: "booking-confirm",
      limit: 12,
      windowMs: 10 * 60_000,
    });
    const idempotencyKey = requireIdempotencyKey(request);
    const body = await request.json();
    const parsed = confirmBookingSchema.parse(body);

    if (!verifyHoldToken(parsed.bookingId, parsed.holdSecret)) {
      throw new UnauthorizedBookingError();
    }
    assertBookingAccessTokenConfiguration();
    const accessToken = createBookingAccessToken(parsed.bookingId);
    const bookingUrl = `${getSiteBaseUrl()}/booking/success?bookingId=${encodeURIComponent(parsed.bookingId)}&token=${encodeURIComponent(accessToken)}`;

    const confirmationResult = await withDb(async () =>
      prisma.$transaction(async (tx) => {
        const booking = await lockBookingRow(tx, parsed.bookingId);

        if (!booking || booking.idempotencyKey !== idempotencyKey) {
          throw new InvalidBookingError();
        }

        const include = {
          bookingRooms: {
            select: {
              unitPriceCents: true,
              room: { select: { name: true, roomType: true } },
            },
          },
          bookingTickets: {
            select: {
              quantity: true,
              unitPriceCents: true,
              ticketType: { select: { priceCents: true } },
            },
          },
          cruiseSchedule: {
            select: {
              departureTime: true,
              arrivalTime: true,
              cruise: { select: { name: true } },
            },
          },
        } as const;

        if (booking.status === BookingStatus.CONFIRMED) {
          const confirmed = await tx.booking.findUniqueOrThrow({
            where: { id: booking.id },
            include,
          });
          return { booking: confirmed, alreadyConfirmed: true };
        }

        if (booking.status !== BookingStatus.PENDING_HOLD) {
          throw new InvalidBookingError();
        }

        if (booking.holdExpiresAt && booking.holdExpiresAt <= utcNow()) {
          await tx.booking.update({
            where: { id: parsed.bookingId },
            data: { status: BookingStatus.EXPIRED },
          });
          throw new BookingConflictError("Hold has expired");
        }

        const heldRooms = await tx.bookingRoom.findMany({
          where: { bookingId: parsed.bookingId },
          select: {
            roomId: true,
            unitPriceCents: true,
            room: { select: { capacity: true, roomType: true } },
          },
        });

        const heldRoomIds = heldRooms.map((entry) => entry.roomId);

        if (heldRoomIds.length === 0) {
          throw new InvalidBookingError("Hold has no reserved rooms");
        }

        if (!roomIdsMatch(heldRoomIds, parsed.roomIds)) {
          throw new InvalidBookingError(
            "Room selection does not match the active hold",
          );
        }

        const heldRoom = heldRooms[0];
        if (!heldRoom || parsed.adults + parsed.children > heldRoom.room.capacity) {
          throw new InvalidBookingError("Guest count exceeds room capacity");
        }
        const capacityError = validateRoomGuestCapacityForDbRoom(
          heldRoom.room.roomType,
          parsed.adults,
          parsed.children,
        );
        if (capacityError) throw new InvalidBookingError(capacityError);

        await lockBookingInventory(tx, booking.cruiseScheduleId, heldRoomIds);

        const overlap = await tx.bookingRoom.findFirst({
          where: {
            roomId: { in: heldRoomIds },
            cruiseScheduleId: booking.cruiseScheduleId,
            bookingId: { not: parsed.bookingId },
            booking: {
              deletedAt: null,
              OR: [
                { status: BookingStatus.CONFIRMED },
                {
                  status: BookingStatus.PENDING_HOLD,
                  OR: [
                    { holdExpiresAt: null },
                    { holdExpiresAt: { gt: utcNow() } },
                  ],
                },
              ],
            },
          },
          select: { id: true },
        });

        if (overlap) {
          throw new BookingConflictError();
        }

        const schedule = await tx.cruiseSchedule.findUnique({
          where: { id: booking.cruiseScheduleId },
          select: {
            cruiseId: true,
            departureTime: true,
            arrivalTime: true,
          },
        });

        if (!schedule) {
          throw new InvalidBookingError("Cruise schedule not found");
        }

        await assertHoldBookingRequest(tx, {
          cruiseId: schedule.cruiseId,
          cruiseScheduleId: booking.cruiseScheduleId,
          roomIds: heldRoomIds,
          startDate: schedule.departureTime.toISOString(),
          endDate: schedule.arrivalTime.toISOString(),
          excludeBookingId: parsed.bookingId,
        });

        const ticketLines = await resolveTicketLines(
          tx,
          schedule.cruiseId,
          heldRoomIds.length,
          parsed.tickets,
        );

        await tx.bookingTicket.deleteMany({
          where: { bookingId: parsed.bookingId },
        });

        await tx.bookingTicket.createMany({
          data: ticketLines.map((ticket) => ({
            bookingId: parsed.bookingId,
            ticketTypeId: ticket.ticketTypeId,
            quantity: ticket.quantity,
            unitPriceCents: ticket.unitPriceCents,
          })),
        });

        const totalPriceCents = heldRooms.reduce(
          (sum, room) => sum + (room.unitPriceCents ?? 0),
          0,
        );

        const confirmed = await tx.booking.update({
          where: { id: parsed.bookingId },
          data: {
            status: BookingStatus.CONFIRMED,
            customerName: parsed.customerName,
            customerEmail: parsed.customerEmail,
            customerPhone: parsed.customerPhone,
            adultCount: parsed.adults,
            childCount: parsed.children,
            specialRequests: parsed.specialRequests || null,
            marketingOptIn: parsed.marketingOptIn,
            marketingOptInAt: parsed.marketingOptIn ? new Date() : null,
            termsAcceptedAt: new Date(),
            holdExpiresAt: null,
            ...(booking.totalPriceCents === null
              ? {
                  totalPriceCents,
                  currency: "USD",
                  priceSnapshotAt: new Date(),
                }
              : {}),
          },
          include,
        });
        return { booking: confirmed, alreadyConfirmed: false };
      }),
    );

    const confirmedBooking = confirmationResult.booking;

    const emailDetails = buildEmailDetailsFromConfirmBooking({
      id: confirmedBooking.id,
      customerName: confirmedBooking.customerName,
      customerEmail: confirmedBooking.customerEmail,
      customerPhone: confirmedBooking.customerPhone,
      adultCount: confirmedBooking.adultCount,
      childCount: confirmedBooking.childCount,
      specialRequests: confirmedBooking.specialRequests,
      ratePlan: confirmedBooking.ratePlan,
      cruiseSchedule: confirmedBooking.cruiseSchedule,
      bookingRooms: confirmedBooking.bookingRooms,
      bookingTickets: confirmedBooking.bookingTickets,
      totalPriceCents: confirmedBooking.totalPriceCents,
      bookingUrl,
    });

    if (emailDetails && !confirmationResult.alreadyConfirmed) {
      try {
        console.log("[email] confirm: sending guest booking email");
        await sendBookingConfirmedEmail(
          emailDetails.guestEmail,
          emailDetails.guestName,
          emailDetails,
        );
        console.log("[email] confirm: guest confirmation email sent");
      } catch (emailError) {
        console.error(
          "[email] confirm: guest confirmation email failed:",
          emailError,
        );
      }

      try {
        console.log("[email] confirm: sending admin alert email");
        await sendAdminAlertEmail(emailDetails);
        console.log("[email] confirm: admin alert email sent");
      } catch (emailError) {
        console.error("[email] confirm: admin alert email failed:", emailError);
      }
    } else {
      console.warn(
        "[email] confirm: skipped emails — no guest email on booking",
        confirmedBooking.id,
      );
    }

    return NextResponse.json({
      bookingId: confirmedBooking.id,
      accessToken,
      status: confirmedBooking.status,
      rooms: confirmedBooking.bookingRooms,
      tickets: confirmedBooking.bookingTickets,
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
