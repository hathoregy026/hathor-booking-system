"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Minus, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
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
import { clampRoomSearchConfig } from "@/lib/room-capacity";
import { useBookingStore } from "@/store/bookingStore";

type BookingModalProps = {
  open: boolean;
  onClose: () => void;
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
  const hydrateFromModal = useBookingStore((state) => state.hydrateFromModal);
  const storeDuration = useBookingStore((state) => state.duration);
  const storeRoomConfigs = useBookingStore((state) => state.roomConfigs);
  const itineraryConfigured = useBookingStore((state) => state.itineraryConfigured);

  const [duration, setDuration] = useState<StayDurationValue>(
    STAY_DURATION_OPTIONS[2]?.value ?? "7-nights-luxor-aswan-luxor",
  );
  const [roomCount, setRoomCount] = useState(1);
  const [roomConfigs, setRoomConfigs] = useState<RoomSearchConfig[]>(() =>
    createDefaultRoomConfigs(1),
  );
  const [error, setError] = useState<string | null>(null);

  const resetModal = useCallback(() => {
    setDuration(STAY_DURATION_OPTIONS[2]?.value ?? "7-nights-luxor-aswan-luxor");
    setRoomCount(1);
    setRoomConfigs(createDefaultRoomConfigs(1));
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    if (itineraryConfigured && storeDuration) {
      setDuration(storeDuration);
      setRoomConfigs(storeRoomConfigs);
      setRoomCount(storeRoomConfigs.length);
      setError(null);
    } else {
      resetModal();
    }

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
  }, [open, handleClose, itineraryConfigured, resetModal, storeDuration, storeRoomConfigs]);

  const handleDurationChange = (nextDuration: StayDurationValue) => {
    setDuration(nextDuration);
    setRoomConfigs((current) =>
      normalizeRoomConfigsForDuration(nextDuration, current),
    );
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

    const normalizedRooms = normalizeRoomConfigsForDuration(duration, roomConfigs);
    hydrateFromModal({ duration, roomConfigs: normalizedRooms });
    handleClose();
    router.push("/booking");
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

        <div className="hathor-booking-modal__body">
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
                <p className="hathor-modal-readonly">Select on next step</p>
              </div>
              <div className="hathor-modal-field">
                <span className="hathor-modal-label">Check-out</span>
                <p className="hathor-modal-readonly">
                  {formatCheckoutFromDateKey(null, duration)}
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
                Additional rooms use default guest settings until configured on the
                checkout page.
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="hathor-booking-modal__error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="hathor-booking-modal__footer">
          <span />
          <button
            type="button"
            className="hathor-modal-btn hathor-modal-btn--primary"
            onClick={handleAvailabilityCheck}
          >
            Availability Check
          </button>
        </footer>
      </div>
    </div>
  );
}
