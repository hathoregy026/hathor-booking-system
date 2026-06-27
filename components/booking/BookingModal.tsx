"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { AvailabilityCalendar } from "@/components/booking/AvailabilityCalendar";
import { GuestRoomSelector } from "@/components/booking/GuestRoomSelector";
import {
  fetchAvailabilitySearch,
  getAvailabilityErrorMessage,
} from "@/lib/booking-availability-client";
import {
  BOOKING_MODAL_YEARS,
  type BookingModalYear,
  formatCheckInFromDateKey,
  formatCheckoutFromDateKey,
} from "@/lib/booking-modal-helpers";
import {
  createDefaultRoomConfigs,
  normalizeRoomConfigsForDuration,
  STAY_DURATION_OPTIONS,
  type RoomSearchConfig,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { checkInIsoFromDateKey } from "@/lib/departure-dates";
import { clampRoomSearchConfig } from "@/lib/room-capacity";
import { useBookingStore } from "@/store/bookingStore";

type ModalStep = 1 | 2 | 3;

type BookingModalProps = {
  open: boolean;
  onClose: () => void;
};

const STEP_LABELS: Record<ModalStep, string> = {
  1: "Itinerary",
  2: "Dates",
  3: "Guests",
};

function CounterField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="hathor-modal-counter">
      <span className="hathor-modal-counter__label">{label}</span>
      <div className="hathor-modal-counter__controls">
        <button
          type="button"
          className="hathor-modal-counter__btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3.5 w-3.5" aria-hidden />
        </button>
        <span className="hathor-modal-counter__value">{value}</span>
        <button
          type="button"
          className="hathor-modal-counter__btn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function BookingModal({ open, onClose }: BookingModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    setSearchMode,
    setDuration: setStoreDuration,
    setCheckInDate,
    setSelectedCruiseId,
    setStartDate,
    setEndDate,
    setRoomConfigs: setStoreRoomConfigs,
    setAvailability,
    setSearchAttempted,
    setError: setStoreError,
    setIsLoading: setStoreLoading,
  } = useBookingStore();

  const [step, setStep] = useState<ModalStep>(1);
  const [duration, setDuration] = useState<StayDurationValue>(
    STAY_DURATION_OPTIONS[2]?.value ?? "7-nights-luxor-aswan-luxor",
  );
  const [roomCount, setRoomCount] = useState(1);
  const [roomConfigs, setRoomConfigs] = useState<RoomSearchConfig[]>(() =>
    createDefaultRoomConfigs(1),
  );
  const [checkInDateKey, setCheckInDateKey] = useState<string | null>(null);
  const [yearTab, setYearTab] = useState<BookingModalYear>(BOOKING_MODAL_YEARS[0]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetModal = useCallback(() => {
    setStep(1);
    setDuration(STAY_DURATION_OPTIONS[2]?.value ?? "7-nights-luxor-aswan-luxor");
    setRoomCount(1);
    setRoomConfigs(createDefaultRoomConfigs(1));
    setCheckInDateKey(null);
    setYearTab(BOOKING_MODAL_YEARS[0]);
    setError(null);
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    resetModal();
    onClose();
  }, [onClose, resetModal]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, handleClose]);

  const handleDurationChange = (nextDuration: StayDurationValue) => {
    setDuration(nextDuration);
    setRoomConfigs((current) =>
      normalizeRoomConfigsForDuration(nextDuration, current),
    );
    setCheckInDateKey(null);
    setError(null);
  };

  const handleRoomCountChange = (count: number) => {
    setRoomCount(count);
    setRoomConfigs((current) => {
      if (count > current.length) {
        const extra = createDefaultRoomConfigs(count - current.length);
        return [...current, ...extra];
      }
      return current.slice(0, count);
    });
  };

  const updatePrimaryRoomGuests = (patch: Partial<RoomSearchConfig>) => {
    setRoomConfigs((current) => {
      const next = [...current];
      next[0] = clampRoomSearchConfig({ ...next[0], ...patch });
      return next;
    });
  };

  const handleAvailabilityCheck = () => {
    if (!duration) {
      setError("Please select an embarkation itinerary.");
      return;
    }
    if (roomConfigs.length === 0) {
      setError("Please configure at least one room.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleDateSelect = (dateKey: string) => {
    setCheckInDateKey(dateKey);
    setError(null);
    setStep(3);
  };

  const handleFindRooms = async () => {
    if (!duration || !checkInDateKey) {
      setError("Please select a departure date.");
      return;
    }

    const normalizedRooms = normalizeRoomConfigsForDuration(duration, roomConfigs);
    setIsSubmitting(true);
    setError(null);
    setStoreLoading(true);
    setStoreError(null);

    try {
      const checkInIso = checkInIsoFromDateKey(checkInDateKey);
      const availability = await fetchAvailabilitySearch(
        duration,
        checkInIso,
        normalizedRooms,
      );

      if (!availability.schedules?.length) {
        const message = getAvailabilityErrorMessage(availability.reason, duration);
        setError(message);
        setStoreError(message);
        return;
      }

      setSearchMode("exact");
      setStoreDuration(duration);
      setCheckInDate(checkInIso);
      setSelectedCruiseId(availability.cruiseId);
      setStartDate(availability.startDate);
      setEndDate(availability.endDate);
      setStoreRoomConfigs(normalizedRooms);
      setAvailability(availability);
      setSearchAttempted(true);
      handleClose();
      router.push("/booking");
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to check availability";
      setError(message);
      setStoreError(message);
    } finally {
      setIsSubmitting(false);
      setStoreLoading(false);
    }
  };

  if (!open) return null;

  const primaryRoom = roomConfigs[0];
  const maxGuestsRoom1 = 4;

  return (
    <div className="hathor-booking-modal" role="presentation">
      <button
        type="button"
        className="hathor-booking-modal__backdrop"
        aria-label="Close booking modal"
        onClick={handleClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="hathor-booking-modal__dialog"
      >
        <header className="hathor-booking-modal__header">
          <div>
            <p className="hathor-booking-modal__eyebrow">Reserve Your Journey</p>
            <h2 id={titleId} className="hathor-booking-modal__title public-serif">
              Book Hathor Dahabiya
            </h2>
          </div>
          <button
            type="button"
            className="hathor-booking-modal__close"
            onClick={handleClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <nav className="hathor-booking-modal__steps" aria-label="Booking progress">
          {([1, 2, 3] as ModalStep[]).map((stepNumber) => (
            <div
              key={stepNumber}
              className={`hathor-booking-modal__step${
                step === stepNumber ? " hathor-booking-modal__step--active" : ""
              }${step > stepNumber ? " hathor-booking-modal__step--done" : ""}`}
            >
              <span className="hathor-booking-modal__step-num">{stepNumber}</span>
              <span className="hathor-booking-modal__step-label">
                {STEP_LABELS[stepNumber]}
              </span>
            </div>
          ))}
        </nav>

        <div className="hathor-booking-modal__body">
          {step === 1 ? (
            <div className="hathor-modal-step">
              <div className="hathor-modal-field">
                <label htmlFor="hathor-embarkation" className="hathor-modal-label">
                  Embarkation
                </label>
                <select
                  id="hathor-embarkation"
                  className="hathor-modal-select"
                  value={duration}
                  onChange={(event) =>
                    handleDurationChange(event.target.value as StayDurationValue)
                  }
                >
                  {STAY_DURATION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label.replace(/^⛵\s*/, "")}
                    </option>
                  ))}
                </select>
              </div>

              <div className="hathor-modal-dates-grid">
                <div className="hathor-modal-field">
                  <span className="hathor-modal-label">Check-in</span>
                  <p className="hathor-modal-readonly">
                    {formatCheckInFromDateKey(checkInDateKey)}
                  </p>
                </div>
                <div className="hathor-modal-field">
                  <span className="hathor-modal-label">Check-out</span>
                  <p className="hathor-modal-readonly">
                    {formatCheckoutFromDateKey(checkInDateKey, duration)}
                  </p>
                </div>
              </div>

              <div className="hathor-modal-field">
                <label htmlFor="hathor-rooms" className="hathor-modal-label">
                  Rooms
                </label>
                <select
                  id="hathor-rooms"
                  className="hathor-modal-select"
                  value={roomCount}
                  onChange={(event) =>
                    handleRoomCountChange(Number(event.target.value))
                  }
                >
                  {[1, 2, 3, 4].map((count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? "Room" : "Rooms"}
                    </option>
                  ))}
                </select>
              </div>

              {primaryRoom ? (
                <div className="hathor-modal-guests">
                  <CounterField
                    label="Adults"
                    value={primaryRoom.adults}
                    min={1}
                    max={Math.max(1, maxGuestsRoom1 - primaryRoom.children)}
                    onChange={(adults) => updatePrimaryRoomGuests({ adults })}
                  />
                  <CounterField
                    label="Children"
                    value={primaryRoom.children}
                    min={0}
                    max={Math.max(0, maxGuestsRoom1 - primaryRoom.adults)}
                    onChange={(children) => updatePrimaryRoomGuests({ children })}
                  />
                </div>
              ) : null}

              {roomCount > 1 ? (
                <p className="hathor-modal-hint">
                  Additional rooms can be configured in the next step.
                </p>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <AvailabilityCalendar
              duration={duration}
              roomConfigs={roomConfigs}
              selectedDateKey={checkInDateKey}
              onSelectDate={handleDateSelect}
              year={yearTab}
              onYearChange={setYearTab}
            />
          ) : null}

          {step === 3 ? (
            <>
              <div className="hathor-modal-summary">
                <p>
                  <strong>Check-in:</strong> {formatCheckInFromDateKey(checkInDateKey)}
                </p>
                <p>
                  <strong>Check-out:</strong>{" "}
                  {formatCheckoutFromDateKey(checkInDateKey, duration)}
                </p>
              </div>
              <GuestRoomSelector
                rooms={roomConfigs}
                onChange={(rooms) =>
                  setRoomConfigs(normalizeRoomConfigsForDuration(duration, rooms))
                }
                onConfirm={() => void handleFindRooms()}
                isLoading={isSubmitting}
              />
            </>
          ) : null}

          {error ? (
            <p className="hathor-booking-modal__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="hathor-booking-modal__footer">
          {step > 1 ? (
            <button
              type="button"
              className="hathor-modal-btn hathor-modal-btn--ghost"
              onClick={() => setStep((current) => (current - 1) as ModalStep)}
              disabled={isSubmitting}
            >
              Back
            </button>
          ) : (
            <span />
          )}

          {step === 1 ? (
            <button
              type="button"
              className="hathor-modal-btn hathor-modal-btn--primary"
              onClick={handleAvailabilityCheck}
            >
              Availability Check
            </button>
          ) : step === 2 ? (
            <p className="hathor-booking-modal__footer-hint">
              Select an available date to continue
            </p>
          ) : null}
        </footer>
      </div>
    </div>
  );
}
