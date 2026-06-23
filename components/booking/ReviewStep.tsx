"use client";

import { ArrowLeft, CalendarDays, Loader2, Ship } from "lucide-react";
import { formatPrice, formatUtcDate } from "@/lib/client-dates";
import { useBookingStore, getSelectedRooms } from "@/store/bookingStore";
import { getSelectedRoomIdsForCheckout } from "./BookingSearchResults";
import { CountdownTimer } from "./CountdownTimer";

export function ReviewStep() {
  const {
    selectedCruiseId,
    startDate,
    endDate,
    availableRooms,
    selectedRoomIds,
    selectedScheduleId,
    passengerDetails,
    totalPrice,
    isLoading,
    error,
    holdExpiresAt,
    setStep,
    setIsLoading,
    setError,
    setHoldExpiresAt,
    setBookingId,
    setSuccess,
  } = useBookingStore();

  const selectedRooms = getSelectedRooms(availableRooms, selectedRoomIds);
  const checkoutRoomIds = getSelectedRoomIdsForCheckout(
    availableRooms,
    selectedRoomIds,
  );

  const handleConfirmAndPay = async () => {
    if (
      !selectedCruiseId ||
      !startDate ||
      !endDate ||
      !selectedScheduleId ||
      checkoutRoomIds.length === 0
    ) {
      setError("Booking details are incomplete. Please start over.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const holdResponse = await fetch("/api/bookings/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cruiseId: selectedCruiseId,
          cruiseScheduleId: selectedScheduleId,
          roomIds: checkoutRoomIds,
          startDate,
          endDate,
        }),
      });

      const holdData = await holdResponse.json();

      if (holdResponse.status === 409) {
        setError(
          "Sorry, one of your selected rooms was just booked by someone else. Please select a different room.",
        );
        return;
      }

      if (!holdResponse.ok) {
        throw new Error(holdData.error ?? "Failed to hold rooms");
      }

      setBookingId(holdData.bookingId);
      setHoldExpiresAt(holdData.holdExpiresAt);

      const tickets = selectedRooms
        .map((room) => ({
          ticketTypeId: room.prices[0]?.ticketTypeId,
          quantity: 1,
        }))
        .filter((ticket) => ticket.ticketTypeId);

      const confirmResponse = await fetch("/api/bookings/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: holdData.bookingId,
          customerName: passengerDetails.name,
          customerEmail: passengerDetails.email,
          roomIds: checkoutRoomIds,
          tickets,
        }),
      });

      const confirmData = await confirmResponse.json();

      if (confirmResponse.status === 409) {
        setError(
          "Sorry, one of your selected rooms was just booked by someone else. Please select a different room.",
        );
        return;
      }

      if (!confirmResponse.ok) {
        throw new Error(
          confirmData.error ??
            (confirmResponse.status === 503
              ? "Database is busy. Please wait a moment and try again."
              : "Failed to confirm booking"),
        );
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-20 sm:space-y-8 sm:pb-0">
      <div className="space-y-2 text-center">
        <h2 className="booking-serif text-xl font-semibold sm:text-3xl">
          Review your booking
        </h2>
        <p className="text-sm" style={{ color: "var(--booking-muted)" }}>
          Confirm your selections before completing your reservation.
        </p>
      </div>

      {holdExpiresAt && (
        <CountdownTimer
          onExpired={() => {
            setError("Your room hold has expired. Please start a new booking.");
          }}
        />
      )}

      <div className="booking-card space-y-5 p-4 sm:p-8">
        <div
          className="flex items-start gap-3 border-b pb-4"
          style={{ borderColor: "var(--booking-border)" }}
        >
          <Ship
            className="mt-0.5 h-5 w-5"
            style={{ color: "var(--booking-navy)" }}
            aria-hidden
          />
          <div>
            <p
              className="text-xs uppercase tracking-wide"
              style={{ color: "var(--booking-muted)" }}
            >
              Cruise
            </p>
            <p className="font-medium">Selected cruise</p>
          </div>
        </div>

        <div
          className="flex items-start gap-3 border-b pb-4"
          style={{ borderColor: "var(--booking-border)" }}
        >
          <CalendarDays
            className="mt-0.5 h-5 w-5"
            style={{ color: "var(--booking-navy)" }}
            aria-hidden
          />
          <div>
            <p
              className="text-xs uppercase tracking-wide"
              style={{ color: "var(--booking-muted)" }}
            >
              Travel dates
            </p>
            <p className="font-medium">
              {startDate && endDate
                ? `${formatUtcDate(startDate)} – ${formatUtcDate(endDate)}`
                : "—"}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <p
            className="text-xs uppercase tracking-wide"
            style={{ color: "var(--booking-muted)" }}
          >
            Selected rooms
          </p>
          <ul className="space-y-2">
            {selectedRooms.map((room) => (
              <li
                key={room.id}
                className="flex items-center justify-between rounded-xl px-4 py-3 text-sm"
                style={{ background: "var(--booking-surface)" }}
              >
                <span className="font-medium">{room.name}</span>
                <span style={{ color: "var(--booking-muted)" }}>
                  {formatPrice(room.minPriceCents)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="flex items-center justify-between border-t pt-4"
          style={{ borderColor: "var(--booking-border)" }}
        >
          <span className="text-sm font-medium" style={{ color: "var(--booking-muted)" }}>
            Passenger
          </span>
          <span className="text-sm font-medium">{passengerDetails.name}</span>
        </div>

        <div
          className="flex items-center justify-between rounded-xl px-4 py-4"
          style={{ background: "var(--booking-cream)" }}
        >
          <span className="booking-serif text-base font-semibold">Total price</span>
          <span className="booking-serif text-2xl font-semibold">
            {formatPrice(totalPrice)}
          </span>
        </div>
      </div>

      {error && (
        <p
          className="rounded-2xl border px-4 py-3 text-center text-sm"
          style={{
            borderColor: "#fecaca",
            background: "#fef2f2",
            color: "#b91c1c",
          }}
        >
          {error}
        </p>
      )}

      <div className="hidden flex-col-reverse gap-3 md:flex md:flex-row md:justify-between">
        <button
          type="button"
          onClick={() => setStep(2)}
          disabled={isLoading}
          className="booking-btn-outline inline-flex items-center justify-center gap-2 px-6 py-3 text-sm disabled:opacity-60"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back
        </button>

        <button
          type="button"
          onClick={handleConfirmAndPay}
          disabled={isLoading}
          className="booking-btn-primary inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Processing...
            </>
          ) : (
            "Confirm & Pay"
          )}
        </button>
      </div>

      <div className="booking-mobile-sticky-bar md:hidden">
        <button
          type="button"
          onClick={handleConfirmAndPay}
          disabled={isLoading}
          className="booking-btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Processing...
            </>
          ) : (
            "Confirm & Pay"
          )}
        </button>
      </div>
    </div>
  );
}
