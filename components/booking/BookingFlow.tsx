"use client";

import Link from "next/link";
import { useState } from "react";
import { BookingConfirmationColumns } from "@/components/booking/BookingConfirmationColumns";
import {
  BookingSearchResults,
  validateRoomSelection,
} from "@/components/booking/BookingSearchResults";
import { BookingProgressBar } from "@/components/booking/BookingProgressBar";
import { SuccessStep } from "@/components/booking/SuccessStep";
import { useBookingStore } from "@/store/bookingStore";

type FlowStep = 3 | 4;

export function BookingFlow() {
  const [flowStep, setFlowStep] = useState<FlowStep>(3);

  const {
    isSuccess,
    searchMode,
    duration,
    checkInDate,
    periodStart,
    periodEnd,
    startDate,
    endDate,
    roomConfigs,
    availableRooms,
    selectedRoomIds,
    selectedCruiseId,
    searchAttempted,
    isLoading,
    error,
    toggleRoomSelection,
    setError,
  } = useBookingStore();

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-2xl">
        <SuccessStep />
      </div>
    );
  }

  if (!searchAttempted) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="booking-card p-8">
          <h1 className="booking-serif text-2xl font-semibold">
            Start your reservation
          </h1>
          <p className="mt-3 text-sm" style={{ color: "var(--booking-muted)" }}>
            Use the Book Now button on our homepage to check availability and
            begin your Hathor journey.
          </p>
          <Link href="/" className="booking-btn-primary mt-6 inline-flex px-8 py-3 text-sm">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const handleContinueToConfirmation = () => {
    const validationError = validateRoomSelection(
      availableRooms,
      selectedRoomIds,
      roomConfigs,
    );

    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setFlowStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="hathor-booking-flow">
      <BookingProgressBar currentStep={flowStep} />

      <header className="hathor-booking-flow__header">
        <h1 className="booking-serif hathor-booking-flow__title">
          {flowStep === 3 ? "Select Your Cabin or Suite" : "Complete Your Booking"}
        </h1>
        <p className="hathor-booking-flow__subtitle">
          {flowStep === 3
            ? "Choose from available staterooms for your sailing dates."
            : "Review your reservation and enter guest details to confirm."}
        </p>
      </header>

      {flowStep === 3 ? (
        <>
          <BookingSearchResults
            searchMode={searchMode}
            cruiseId={selectedCruiseId}
            duration={duration}
            checkInDate={checkInDate}
            periodStart={periodStart}
            periodEnd={periodEnd}
            startDate={startDate}
            endDate={endDate}
            roomConfigs={roomConfigs}
            availableRooms={availableRooms}
            selectedRoomIds={selectedRoomIds}
            onToggleRoom={toggleRoomSelection}
            onContinue={handleContinueToConfirmation}
            isLoading={isLoading}
            searchAttempted={searchAttempted}
            error={error}
          />

          {error && searchAttempted && availableRooms.length > 0 && (
            <p className="hathor-checkout-alert mt-4 text-center" role="alert">
              {error}
            </p>
          )}
        </>
      ) : (
        <BookingConfirmationColumns onBack={() => setFlowStep(3)} />
      )}
    </div>
  );
}
