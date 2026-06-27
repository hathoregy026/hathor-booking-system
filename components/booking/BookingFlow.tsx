"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckoutCalendar } from "@/components/booking/CheckoutCalendar";
import { GuestPaymentForm } from "@/components/booking/GuestPaymentForm";
import { ProgressBar, type HistoriaBookingStep } from "@/components/booking/ProgressBar";
import { RoomSelection } from "@/components/booking/RoomSelection";
import { SuccessStep } from "@/components/booking/SuccessStep";
import {
  formatCheckInFromDateKey,
  formatCheckoutFromDateKey,
  formatCompactStayLabel,
} from "@/lib/booking-modal-helpers";
import {
  fetchAvailabilitySearch,
  getAvailabilityErrorMessage,
} from "@/lib/booking-availability-client";
import { checkInIsoFromDateKey } from "@/lib/departure-dates";
import type { RatePlanId } from "@/lib/rate-plans";
import { useBookingStore } from "@/store/bookingStore";

function dateKeyFromCheckInIso(iso: string | null): string | null {
  if (!iso) return null;
  return iso.slice(0, 10);
}

export function BookingFlow() {
  const router = useRouter();

  const {
    isSuccess,
    itineraryConfigured,
    checkoutStep,
    duration,
    checkInDate,
    roomConfigs,
    availableRooms,
    selectedRoomIds,
    searchAttempted,
    isLoading,
    error,
    setCheckoutStep,
    setCheckInDate,
    setSelectedCruiseId,
    setStartDate,
    setEndDate,
    setAvailability,
    setSearchAttempted,
    setError,
    setIsLoading,
    selectRoomForCheckout,
    totalPrice,
  } = useBookingStore();

  const [pendingDateKey, setPendingDateKey] = useState<string | null>(() =>
    dateKeyFromCheckInIso(checkInDate),
  );
  const [isUpdatingDates, setIsUpdatingDates] = useState(false);

  const selectedDateKey = pendingDateKey;

  const stepTitles = useMemo(
    () =>
      ({
        2: "Select Your Sailing Dates",
        3: "Select Your Cabin or Suite",
        4: "Complete Your Booking",
      }) as const,
    [],
  );

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-2xl">
        <SuccessStep />
      </div>
    );
  }

  if (!itineraryConfigured || !duration) {
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
          <Link href="/?book=1" className="booking-btn-primary mt-6 inline-flex px-8 py-3 text-sm">
            Book Now
          </Link>
        </div>
      </div>
    );
  }

  const handleGoBackFromDates = () => {
    router.push("/?book=1");
  };

  const handleUpdateDates = async () => {
    if (!duration || !selectedDateKey) {
      setError("Please select a check-in date.");
      return;
    }

    setIsUpdatingDates(true);
    setError(null);

    try {
      const checkInIso = checkInIsoFromDateKey(selectedDateKey);
      const availability = await fetchAvailabilitySearch(
        duration,
        checkInIso,
        roomConfigs,
      );

      if (!availability.schedules?.length) {
        const message = getAvailabilityErrorMessage(availability.reason, duration);
        setError(message);
        return;
      }

      setCheckInDate(checkInIso);
      setSelectedCruiseId(availability.cruiseId);
      setStartDate(availability.startDate);
      setEndDate(availability.endDate);
      setAvailability(availability);
      setSearchAttempted(true);
      setCheckoutStep(3);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to check availability",
      );
    } finally {
      setIsUpdatingDates(false);
    }
  };

  const handleBookRoom = (selectionKey: string, ratePlan: RatePlanId) => {
    selectRoomForCheckout(selectionKey, ratePlan);
  };

  const selectedDateLabel =
    selectedDateKey && duration
      ? formatCompactStayLabel(selectedDateKey, duration)
      : null;

  const maxReachableStep = useMemo((): HistoriaBookingStep => {
    if (selectedRoomIds.length > 0) return 4;
    if (searchAttempted && availableRooms.length > 0) return 3;
    if (itineraryConfigured) return 2;
    return 1;
  }, [
    availableRooms.length,
    itineraryConfigured,
    searchAttempted,
    selectedRoomIds.length,
  ]);

  const handleStepNavigate = (step: HistoriaBookingStep) => {
    if (step > maxReachableStep || step === checkoutStep) return;

    setError(null);

    if (step === 1) {
      router.push("/?book=1");
      return;
    }

    if (step === 2) {
      setPendingDateKey(dateKeyFromCheckInIso(checkInDate));
      setCheckoutStep(2);
      return;
    }

    if (step === 3) {
      setCheckoutStep(3);
      return;
    }

    setCheckoutStep(4);
  };

  const activeTitle = stepTitles[checkoutStep as 2 | 3 | 4] ?? "Your Reservation";

  return (
    <div className="hathor-booking-flow">
      <ProgressBar
        currentStep={checkoutStep}
        maxReachableStep={maxReachableStep}
        roomConfigs={roomConfigs}
        availableRooms={availableRooms}
        selectedRoomIds={selectedRoomIds}
        checkInDate={checkInDate}
        duration={duration}
        totalPrice={totalPrice}
        selectedDateLabel={selectedDateLabel}
        onStepNavigate={handleStepNavigate}
      />

      <header className="hathor-booking-flow__header">
        <h1 className="booking-serif hathor-booking-flow__title">{activeTitle}</h1>
        <p className="hathor-booking-flow__subtitle">
          {checkoutStep === 2
            ? "Choose your check-in date from available sailings."
            : checkoutStep === 3
              ? "Choose from available staterooms for your sailing dates."
              : "Review your reservation and enter guest details to confirm."}
        </p>
      </header>

      {checkoutStep === 2 ? (
        <CheckoutCalendar
          duration={duration}
          roomConfigs={roomConfigs}
          selectedDateKey={selectedDateKey}
          onSelectDate={(dateKey) => {
            setPendingDateKey(dateKey);
            setError(null);
          }}
          onGoBack={handleGoBackFromDates}
          onUpdateDates={() => void handleUpdateDates()}
          isUpdating={isUpdatingDates}
          canUpdate={Boolean(selectedDateKey)}
        />
      ) : null}

      {checkoutStep === 3 ? (
        <RoomSelection
          duration={duration}
          checkInDate={checkInDate}
          roomConfigs={roomConfigs}
          availableRooms={availableRooms}
          selectedRoomIds={selectedRoomIds}
          onBookRoom={handleBookRoom}
          onGoBack={() => setCheckoutStep(2)}
          isLoading={isLoading && !searchAttempted}
          error={error}
        />
      ) : null}

      {checkoutStep === 4 ? (
        <GuestPaymentForm onBack={() => setCheckoutStep(3)} />
      ) : null}

      {error && checkoutStep === 2 ? (
        <p className="historia-checkout-calendar__error mt-4 text-center" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
