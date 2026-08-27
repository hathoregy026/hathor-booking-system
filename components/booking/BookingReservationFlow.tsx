"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { BookingItineraryFilter } from "@/components/booking/BookingItineraryFilter";
import { CheckoutCalendar } from "@/components/booking/CheckoutCalendar";
import { GuestPaymentForm } from "@/components/booking/GuestPaymentForm";
import { ProgressBar, type HistoriaBookingStep } from "@/components/booking/ProgressBar";
import { RoomSelection } from "@/components/booking/RoomSelection";
import { SuccessStep } from "@/components/booking/SuccessStep";
import { formatCompactStayLabel } from "@/lib/booking-modal-helpers";
import {
  fetchAvailabilitySearch,
  getAvailabilityErrorMessage,
} from "@/lib/booking-availability-client";
import { checkInIsoFromDateKey } from "@/lib/departure-dates";
import { trackGaEvent } from "@/lib/ga-browser";
import type {
  RoomSearchConfig,
  StayDurationValue,
} from "@/lib/booking-search-config";
import type { RatePlanId } from "@/lib/rate-plans";
import { useBookingStore } from "@/store/bookingStore";

function dateKeyFromCheckInIso(iso: string | null): string | null {
  if (!iso) return null;
  return iso.slice(0, 10);
}

export type RoomBookingEntry = {
  duration: StayDurationValue;
  roomConfig: RoomSearchConfig;
  roomId: string;
  roomName: string;
  cruiseId: string;
};

export function BookingReservationFlow({
  initialRoomBooking = null,
}: {
  initialRoomBooking?: RoomBookingEntry | null;
}) {
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
    preferredRoomId,
    preferredRoomName,
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
    selectRoomForCheckout,
    hydrateFromModal,
    totalPrice,
  } = useBookingStore();

  const [pendingDateKey, setPendingDateKey] = useState<string | null>(() =>
    dateKeyFromCheckInIso(checkInDate),
  );
  const [isUpdatingDates, setIsUpdatingDates] = useState(false);

  const selectedDateKey = pendingDateKey;
  const [roomEntryReady, setRoomEntryReady] = useState(!initialRoomBooking);

  useEffect(() => {
    if (!initialRoomBooking) return;

    const current = useBookingStore.getState();
    if (
      current.preferredRoomId !== initialRoomBooking.roomId ||
      !current.itineraryConfigured
    ) {
      useBookingStore.setState({
        duration: initialRoomBooking.duration,
        roomConfigs: [initialRoomBooking.roomConfig],
        itineraryConfigured: true,
        checkoutStep: 2,
        checkInDate: null,
        startDate: null,
        endDate: null,
        searchAttempted: false,
        availableSchedules: [],
        availableRooms: [],
        selectedRoomIds: [],
        selectedRatePlan: "standard",
        selectedScheduleId: null,
        selectedCruiseId: initialRoomBooking.cruiseId,
        preferredRoomId: initialRoomBooking.roomId,
        preferredRoomName: initialRoomBooking.roomName,
        totalPrice: 0,
        error: null,
      });
    }
    const frame = requestAnimationFrame(() => setRoomEntryReady(true));
    return () => cancelAnimationFrame(frame);
  }, [initialRoomBooking]);

  const trackedFunnelSteps = useRef(new Set<number>());
  useEffect(() => {
    if (isSuccess || trackedFunnelSteps.current.has(checkoutStep)) return;
    trackedFunnelSteps.current.add(checkoutStep);
    if (checkoutStep === 1) trackGaEvent("booking_itinerary");
    else if (checkoutStep === 2) trackGaEvent("booking_dates");
    else if (checkoutStep === 3) trackGaEvent("booking_suite");
    else if (checkoutStep === 4) trackGaEvent("begin_checkout");
  }, [checkoutStep, isSuccess]);

  const stepTitles = useMemo(
    () =>
      ({
        1: "Adults, Children & Itinerary",
        2: "Select Your Sailing Dates",
        3: "Select Your Cabin or Suite",
        4: "Complete Your Booking",
      }) as const,
    [],
  );

  /**
   * MUST stay above the early returns below.
   *
   * React requires every render to call the same hooks in the same order.
   * This useMemo previously sat *after* `if (isSuccess) return ...`, so the
   * moment a booking succeeded the component returned early, ran one fewer
   * hook than the previous render, and React threw error #300 ("Rendered
   * fewer hooks than expected") — which surfaced to the guest as
   * "This page couldn't load", immediately after their booking was saved.
   */
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

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-2xl">
        <SuccessStep />
      </div>
    );
  }

  if (!roomEntryReady) {
    return (
      <div className="hathor-booking-gate" aria-busy="true">
        <div className="hathor-booking-gate__panel">
          <p className="hathor-booking-gate__eyebrow">Hathor Dahabiya</p>
          <h1 className="hathor-booking-gate__title">Preparing available dates</h1>
        </div>
      </div>
    );
  }

  if (!itineraryConfigured || !duration) {
    return (
      <div className="hathor-booking-gate">
        <div className="hathor-booking-gate__back">
          <Link href="/" className="hathor-booking-gate__back-link">
            Back to Hathor
          </Link>
        </div>
        <div className="hathor-booking-gate__panel">
          <p className="hathor-booking-gate__eyebrow">Hathor Dahabiya</p>
          <h1 className="hathor-booking-gate__title">Continue your reservation</h1>
          <p className="hathor-booking-gate__copy">
            Open Book Now on the homepage to choose guests and sailing length,
            then return here to pick dates and cabins.
          </p>
          <Link href="/?book=1" className="public-btn-gold">
            Book Now
          </Link>
        </div>
      </div>
    );
  }

  const handleGoBackFromDates = () => {
    if (preferredRoomId) {
      router.push(`/booking/cruise/${encodeURIComponent(preferredRoomId)}`);
      return;
    }
    setCheckoutStep(1);
  };

  const handleApplyItineraryFilter = (input: {
    duration: StayDurationValue;
    roomConfigs: typeof roomConfigs;
  }) => {
    hydrateFromModal(input);
    setPendingDateKey(null);
    setError(null);
  };

  const handleUpdateDates = async () => {
    if (!duration || !selectedDateKey) {
      setError("Please pick a sailing date to continue.");
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
        preferredRoomId,
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
      if (preferredRoomId) {
        selectRoomForCheckout(preferredRoomId);
      } else {
        setCheckoutStep(3);
      }
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

  const handleStepNavigate = (step: HistoriaBookingStep) => {
    if (step > maxReachableStep || step === checkoutStep) return;

    setError(null);

    if (step === 1) {
      setCheckoutStep(1);
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

  const activeTitle =
    stepTitles[checkoutStep as 1 | 2 | 3 | 4] ?? "Your Reservation";

  return (
    <div
      className={`hathor-booking-flow${
        checkoutStep === 1 ? " hathor-booking-flow--voyage" : ""
      }`}
    >
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

      {checkoutStep !== 1 ? (
        <header className="hathor-booking-flow__header">
          <h1 className="booking-serif hathor-booking-flow__title">{activeTitle}</h1>
          <p className="hathor-booking-flow__subtitle">
            {checkoutStep === 2
              ? preferredRoomName
                ? `Choose from dates when ${preferredRoomName} is available.`
                : "Choose your check-in date from available sailings."
              : checkoutStep === 3
                ? "Choose from available staterooms for your sailing dates."
                : "Review your reservation and enter guest details to confirm."}
          </p>
        </header>
      ) : null}

      {checkoutStep === 1 && duration ? (
        <BookingItineraryFilter
          initialDuration={duration}
          initialRoomConfigs={roomConfigs}
          onApply={handleApplyItineraryFilter}
          onCancel={() => setCheckoutStep(2)}
        />
      ) : null}

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
          preferredRoomId={preferredRoomId}
          actionLabel={preferredRoomId ? "Continue with selected date" : undefined}
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
