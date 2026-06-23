"use client";

import { useEffect, useRef } from "react";
import {
  fetchAvailabilitySearch,
  fetchPeriodAvailabilitySearch,
  getAvailabilityErrorMessage,
} from "@/lib/booking-availability-client";
import {
  STAY_DURATION_OPTIONS,
  normalizeRoomConfigsForDuration,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { useBookingStore } from "@/store/bookingStore";
import { BookingSearchBar } from "./BookingSearchBar";
import {
  BookingSearchResults,
  validateRoomSelection,
} from "./BookingSearchResults";

type SearchStepProps = {
  heroImageUrl?: string | null;
};

export function SearchStep({ heroImageUrl = null }: SearchStepProps) {
  const resultsRef = useRef<HTMLDivElement>(null);

  const {
    searchMode,
    duration,
    checkInDate,
    periodStart,
    periodEnd,
    roomConfigs,
    startDate,
    endDate,
    availableRooms,
    selectedRoomIds,
    selectedCruiseId,
    searchAttempted,
    isLoading,
    error,
    setSearchMode,
    setDuration,
    setCheckInDate,
    setPeriodStart,
    setPeriodEnd,
    setRoomConfigs,
    setSelectedCruiseId,
    setStartDate,
    setEndDate,
    setAvailability,
    setPeriodAvailability,
    setStep,
    setIsLoading,
    setError,
    setSearchAttempted,
    toggleRoomSelection,
  } = useBookingStore();

  useEffect(() => {
    if (searchMode === "exact" && !duration && STAY_DURATION_OPTIONS[2]) {
      setDuration(STAY_DURATION_OPTIONS[2].value);
    }
  }, [duration, searchMode, setDuration]);

  const handleDurationChange = (nextDuration: StayDurationValue) => {
    if (!nextDuration) return;
    setDuration(nextDuration);
    setRoomConfigs(normalizeRoomConfigsForDuration(nextDuration, roomConfigs));
  };

  const handlePeriodChange = (start: string | null, end: string | null) => {
    setPeriodStart(start);
    setPeriodEnd(end);
  };

  const handleCheckAvailability = async () => {
    if (roomConfigs.length === 0) {
      setError("Please complete all search fields.");
      return;
    }

    if (searchMode === "exact") {
      if (!duration || !checkInDate) {
        setError("Please complete all search fields.");
        return;
      }
    } else if (!periodStart || !periodEnd) {
      setError("Please select your full travel period.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSearchAttempted(true);

    try {
      if (searchMode === "period") {
        const availability = await fetchPeriodAvailabilitySearch(
          periodStart!,
          periodEnd!,
          roomConfigs,
        );

        if ((availability.availableRooms?.length ?? 0) === 0) {
          setPeriodAvailability({
            ...availability,
            schedules: [],
            cruises: [],
          });
          setError(getAvailabilityErrorMessage(availability.reason));
          return;
        }

        setPeriodAvailability(availability);

        requestAnimationFrame(() => {
          resultsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
        return;
      }

      const availability = await fetchAvailabilitySearch(
        duration as StayDurationValue,
        checkInDate!,
        roomConfigs,
      );

      const totalRooms = availability.schedules.reduce(
        (count, schedule) => count + schedule.availableRooms.length,
        0,
      );

      if (totalRooms === 0) {
        setAvailability({
          ...availability,
          schedules: [],
        });
        setError(
          getAvailabilityErrorMessage(availability.reason, duration as StayDurationValue),
        );
        return;
      }

      setSelectedCruiseId(availability.cruiseId);
      setStartDate(availability.startDate);
      setEndDate(availability.endDate);
      setAvailability(availability);

      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch (err) {
      setAvailability({
        cruiseId: "",
        startDate: checkInDate ?? "",
        endDate: checkInDate ?? "",
        schedules: [],
      });
      setError(
        err instanceof Error
          ? err.message
          : "Could not search sailings. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
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
    setStep(2);
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-10">
      <BookingSearchBar
        searchMode={searchMode}
        onSearchModeChange={setSearchMode}
        duration={duration}
        onDurationChange={handleDurationChange}
        checkInDate={checkInDate}
        onCheckInDateChange={setCheckInDate}
        periodStart={periodStart}
        periodEnd={periodEnd}
        onPeriodChange={handlePeriodChange}
        rooms={roomConfigs}
        onRoomsChange={setRoomConfigs}
        onSearch={handleCheckAvailability}
        isLoading={isLoading}
        searchLabel="Find Now"
      />

      {error && !searchAttempted && (
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

      <div ref={resultsRef}>
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
          onContinue={handleContinue}
          isLoading={isLoading}
          searchAttempted={searchAttempted}
          error={searchAttempted ? error : null}
          heroImageUrl={heroImageUrl}
        />
      </div>
    </div>
  );
}
