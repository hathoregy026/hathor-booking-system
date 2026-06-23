"use client";

import { useCallback } from "react";
import { useBookingStore } from "@/store/bookingStore";
import { CountdownTimer } from "./CountdownTimer";
import { PassengerDetailsStep } from "./PassengerDetailsStep";
import { ReviewStep } from "./ReviewStep";
import { SearchStep } from "./SearchStep";
import { SuccessStep } from "./SuccessStep";

const STEPS = [
  { number: 1, label: "Search" },
  { number: 2, label: "Details" },
  { number: 3, label: "Review" },
] as const;

type BookingWizardProps = {
  heroImageUrl?: string | null;
};

export function BookingWizard({ heroImageUrl = null }: BookingWizardProps) {
  const { step, isSuccess, holdExpiresAt, resetBooking, setError } =
    useBookingStore();

  const handleHoldExpired = useCallback(() => {
    setError("Your room hold has expired. Please start a new booking.");
    resetBooking();
  }, [resetBooking, setError]);

  if (isSuccess) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <SuccessStep />
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {step > 1 && (
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((item) => {
            const isActive = step === item.number;
            const isComplete = step > item.number;

            return (
              <div
                key={item.number}
                className={`booking-step-dot ${
                  isActive
                    ? "booking-step-dot--active"
                    : isComplete
                      ? "booking-step-dot--done"
                      : ""
                }`}
                aria-hidden
              />
            );
          })}
        </div>
      )}

      {holdExpiresAt && step < 3 && (
        <CountdownTimer onExpired={handleHoldExpired} />
      )}

      {step === 1 && <SearchStep heroImageUrl={heroImageUrl} />}
      {step === 2 && <PassengerDetailsStep />}
      {step === 3 && <ReviewStep />}

      {step > 1 && (
        <p
          className="text-center text-xs"
          style={{ color: "var(--booking-muted)" }}
        >
          All dates are processed in UTC for accurate scheduling worldwide.
        </p>
      )}
    </div>
  );
}
