import { NextRequest, NextResponse } from "next/server";
import { BookingStatus } from "@/app/generated/prisma/client";
import { handleRouteError } from "@/lib/api";
import {
  BookingConflictError,
  getUnavailableRoomIds,
  InvalidBookingError,
} from "@/lib/booking";
import { buildBookingCustomerName } from "@/lib/booking-guest-details";
import { buildCheckoutEmailDetails } from "@/lib/booking-email-details";
import { ensureDefaultTicketType } from "@/lib/cruise-setup";
import { withDb } from "@/lib/db-safe";
import {
  sendAdminAlertEmail,
  sendBookingReceivedEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { validateRoomGuestCapacityForDbRoom } from "@/lib/room-capacity";
import { checkoutBookingSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutBookingSchema.parse(body);

    const result = await withDb(async () => {
      const schedule = await prisma.cruiseSchedule.findFirst({
        where: {
          id: parsed.cruiseScheduleId,
          cruiseId: parsed.cruiseId,
        },
        select: {
          id: true,
          departureTime: true,
          arrivalTime: true,
          cruise: { select: { name: true } },
        },
      });

      if (!schedule) {
        return { notFound: true as const };
      }

      const room = await prisma.room.findFirst({
        where: {
          id: parsed.roomId,
          cruiseId: parsed.cruiseId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          roomType: true,
          capacity: true,
          priceMultiplier: true,
          cruise: { select: { basePriceCents: true } },
        },
      });

      if (!room) {
        throw new InvalidBookingError("Room not found for this cruise");
      }

      const capacityError = validateRoomGuestCapacityForDbRoom(
        room.roomType,
        parsed.adults,
        parsed.children,
      );
      if (capacityError) {
        throw new InvalidBookingError(capacityError);
      }

      const guestTotal = parsed.adults + parsed.children;
      if (guestTotal > room.capacity) {
        throw new InvalidBookingError(
          `This room allows a maximum of ${room.capacity} guests.`,
        );
      }

      const multiplier = room.priceMultiplier > 0 ? room.priceMultiplier : 1;
      const expectedPriceCents = Math.round(
        room.cruise.basePriceCents * multiplier,
      );

      if (parsed.priceCents && parsed.priceCents !== expectedPriceCents) {
        throw new InvalidBookingError(
          "Price has changed. Please review your booking.",
        );
      }

      const unavailableRoomIds = await getUnavailableRoomIds({
        cruiseScheduleId: parsed.cruiseScheduleId,
        roomIds: [parsed.roomId],
      });

      if (unavailableRoomIds.length > 0) {
        throw new BookingConflictError(
          "This room is no longer available for the selected departure",
        );
      }

      const ticketType = await ensureDefaultTicketType(
        parsed.cruiseId,
        room.cruise.basePriceCents,
      );

      const customerName = buildBookingCustomerName({
        fullName: parsed.fullName,
        phone: parsed.phone,
        adults: parsed.adults,
        children: parsed.children,
        specialRequests: parsed.specialRequests,
      });

      const booking = await prisma.$transaction(async (tx) => {
        const created = await tx.booking.create({
          data: {
            cruiseScheduleId: parsed.cruiseScheduleId,
            status: BookingStatus.PENDING_HOLD,
            holdExpiresAt: null,
            customerName,
            customerEmail: parsed.email,
          },
          select: { id: true, status: true },
        });

        await tx.bookingRoom.create({
          data: {
            bookingId: created.id,
            roomId: parsed.roomId,
            cruiseScheduleId: parsed.cruiseScheduleId,
          },
        });

        await tx.bookingTicket.create({
          data: {
            bookingId: created.id,
            ticketTypeId: ticketType.id,
            quantity: 1,
          },
        });

        return created;
      });

      return { notFound: false as const, booking, schedule, room, expectedPriceCents };
    });

    if (result.notFound) {
      return NextResponse.json(
        { error: "Cruise schedule not found for this cruise" },
        { status: 404 },
      );
    }

    const { booking, schedule, room, expectedPriceCents } = result;

    try {
      const emailDetails = buildCheckoutEmailDetails({
        bookingId: booking.id,
        checkout: parsed,
        cruiseName: schedule.cruise.name,
        departureTime: schedule.departureTime,
        arrivalTime: schedule.arrivalTime,
        roomLabel: room.roomType ?? room.name,
        totalPriceCents: expectedPriceCents,
      });

      try {
        console.log("[email] triggering guest booking received email");
        await sendBookingReceivedEmail(
          parsed.email,
          parsed.fullName.trim(),
          emailDetails,
        );
      } catch (emailError) {
        console.error("[email] guest booking received email failed:", emailError);
      }

      try {
        console.log("[email] triggering admin alert email");
        await sendAdminAlertEmail(emailDetails);
      } catch (emailError) {
        console.error("[email] admin alert email failed:", emailError);
      }
    } catch (emailError) {
      console.error("[email] checkout email setup failed:", emailError);
    }

    return NextResponse.json(
      {
        bookingId: booking.id,
        status: booking.status,
      },
      { status: 201 },
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
