"use client";

import { CheckCircle2, Ship } from "lucide-react";
import { formatPrice, formatUtcDate } from "@/lib/client-dates";
import { useBookingStore } from "@/store/bookingStore";

export function SuccessStep() {
  const {
    startDate,
    endDate,
    availableRooms,
    selectedRoomIds,
    passengerDetails,
    totalPrice,
    bookingId,
    resetBooking,
  } = useBookingStore();

  const selectedRooms = availableRooms.filter((room) =>
    selectedRoomIds.includes(room.id),
  );

  return (
    <div className="space-y-6 text-center sm:space-y-8">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: "var(--booking-cream)" }}
      >
        <CheckCircle2
          className="h-9 w-9"
          style={{ color: "var(--booking-navy)" }}
          aria-hidden
        />
      </div>

      <div className="space-y-2">
        <h2 className="booking-serif text-xl font-semibold sm:text-3xl">
          Booking confirmed!
        </h2>
        <p className="text-sm" style={{ color: "var(--booking-muted)" }}>
          Thank you, {passengerDetails.name}. Your Hathor cruise is reserved.
        </p>
        {bookingId && (
          <p className="text-xs" style={{ color: "var(--booking-muted)" }}>
            Confirmation ID:{" "}
            <span className="font-mono">{bookingId}</span>
          </p>
        )}
      </div>

      <div className="booking-card mx-auto max-w-md space-y-3 p-4 text-left sm:p-6">
        <div className="flex items-center gap-2">
          <Ship
            className="h-4 w-4"
            style={{ color: "var(--booking-navy)" }}
            aria-hidden
          />
          <span className="text-sm font-medium">
            {startDate && endDate
              ? `${formatUtcDate(startDate)} – ${formatUtcDate(endDate)}`
              : "Your selected dates"}
          </span>
        </div>

        <ul
          className="space-y-2 border-t pt-3"
          style={{ borderColor: "var(--booking-border)" }}
        >
          {selectedRooms.map((room) => (
            <li
              key={room.id}
              className="flex justify-between text-sm"
              style={{ color: "var(--booking-muted)" }}
            >
              <span>{room.name}</span>
              <span>{formatPrice(room.minPriceCents)}</span>
            </li>
          ))}
        </ul>

        <div
          className="flex justify-between border-t pt-3 font-semibold"
          style={{ borderColor: "var(--booking-border)" }}
        >
          <span>Total paid</span>
          <span className="booking-serif text-lg">{formatPrice(totalPrice)}</span>
        </div>
      </div>

      <p className="text-sm" style={{ color: "var(--booking-muted)" }}>
        A confirmation email will be sent to{" "}
        <span className="font-medium">{passengerDetails.email}</span>.
      </p>

      <button
        type="button"
        onClick={resetBooking}
        className="booking-btn-primary w-full max-w-xs px-8 py-3 text-sm sm:w-auto"
      >
        Book another cruise
      </button>
    </div>
  );
}
