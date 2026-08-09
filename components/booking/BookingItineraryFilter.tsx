"use client";

import { useEffect, useState } from "react";
import { BedDouble, CalendarDays, MapPin, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createDefaultRoomConfigs,
  normalizeRoomConfigsForDuration,
  STAY_DURATION_OPTIONS,
  type RoomSearchConfig,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { clampRoomSearchConfig } from "@/lib/room-capacity";

const PRIVATE_CHARTER_OPTION = "private-charter" as const;
const PRIVATE_CHARTER_HREF = "/charter";

type BookingItineraryFilterProps = {
  initialDuration: StayDurationValue;
  initialRoomConfigs: RoomSearchConfig[];
  onApply: (input: {
    duration: StayDurationValue;
    roomConfigs: RoomSearchConfig[];
  }) => void;
  onCancel: () => void;
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
    <div className="hathor-booking-filter__counter">
      <span className="hathor-booking-filter__counter-label">{label}</span>
      <div className="hathor-booking-filter__counter-controls">
        <button
          type="button"
          className="hathor-booking-filter__counter-btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3.5 w-3.5" aria-hidden strokeWidth={1.75} />
        </button>
        <span className="hathor-booking-filter__counter-value">{value}</span>
        <button
          type="button"
          className="hathor-booking-filter__counter-btn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3.5 w-3.5" aria-hidden strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

/**
 * On-page itinerary filter — same options as the homepage Book Now modal,
 * styled for the booking shell (does not open the homepage popup).
 */
export function BookingItineraryFilter({
  initialDuration,
  initialRoomConfigs,
  onApply,
  onCancel,
}: BookingItineraryFilterProps) {
  const router = useRouter();
  const [duration, setDuration] = useState<StayDurationValue>(initialDuration);
  const [roomCount, setRoomCount] = useState(initialRoomConfigs.length || 1);
  const [roomConfigs, setRoomConfigs] = useState<RoomSearchConfig[]>(
    initialRoomConfigs.length > 0
      ? initialRoomConfigs
      : createDefaultRoomConfigs(1),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDuration(initialDuration);
    setRoomConfigs(
      initialRoomConfigs.length > 0
        ? initialRoomConfigs
        : createDefaultRoomConfigs(1),
    );
    setRoomCount(Math.max(1, initialRoomConfigs.length || 1));
    setError(null);
  }, [initialDuration, initialRoomConfigs]);

  const handleDurationChange = (nextDuration: StayDurationValue) => {
    setDuration(nextDuration);
    setRoomConfigs((current) =>
      normalizeRoomConfigsForDuration(nextDuration, current),
    );
    setError(null);
  };

  const handleEmbarkationChange = (value: string) => {
    if (value === PRIVATE_CHARTER_OPTION) {
      router.push(PRIVATE_CHARTER_HREF);
      return;
    }
    handleDurationChange(value as StayDurationValue);
  };

  const handleRoomCountChange = (count: number) => {
    setRoomCount(count);
    setRoomConfigs((current) => {
      if (count > current.length) {
        return [...current, ...createDefaultRoomConfigs(count - current.length)];
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

  const handleApply = () => {
    if (!duration) {
      setError("Please select an embarkation itinerary.");
      return;
    }
    if (roomConfigs.length === 0) {
      setError("Please configure at least one room.");
      return;
    }
    onApply({
      duration,
      roomConfigs: normalizeRoomConfigsForDuration(duration, roomConfigs),
    });
  };

  const primaryRoom = roomConfigs[0];
  const maxGuestsRoom1 = 4;

  return (
    <section className="hathor-booking-filter" aria-label="Guests and itinerary">
      <div className="hathor-booking-filter__card">
        <div className="hathor-booking-filter__field">
          <label htmlFor="booking-filter-embarkation" className="hathor-booking-filter__label">
            Embarkation
          </label>
          <div className="hathor-booking-filter__control">
            <MapPin className="hathor-booking-filter__icon" aria-hidden strokeWidth={1.5} />
            <select
              id="booking-filter-embarkation"
              className="hathor-booking-filter__select"
              value={duration}
              onChange={(event) => handleEmbarkationChange(event.target.value)}
            >
              {STAY_DURATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label.replace(/^⛵\s*/, "")}
                </option>
              ))}
              <option value={PRIVATE_CHARTER_OPTION}>Private Charter</option>
            </select>
          </div>
        </div>

        <div className="hathor-booking-filter__dates">
          <div className="hathor-booking-filter__field">
            <span className="hathor-booking-filter__label">Check-in</span>
            <p className="hathor-booking-filter__readonly">
              <CalendarDays
                className="hathor-booking-filter__icon"
                aria-hidden
                strokeWidth={1.5}
              />
              <span>Choose your check-in date</span>
            </p>
          </div>
          <div className="hathor-booking-filter__field">
            <span className="hathor-booking-filter__label">Check-out</span>
            <p className="hathor-booking-filter__readonly">
              <CalendarDays
                className="hathor-booking-filter__icon"
                aria-hidden
                strokeWidth={1.5}
              />
              <span>Choose your check-out date</span>
            </p>
          </div>
        </div>

        <div className="hathor-booking-filter__field">
          <label htmlFor="booking-filter-rooms" className="hathor-booking-filter__label">
            Rooms
          </label>
          <div className="hathor-booking-filter__control">
            <BedDouble className="hathor-booking-filter__icon" aria-hidden strokeWidth={1.5} />
            <select
              id="booking-filter-rooms"
              className="hathor-booking-filter__select"
              value={roomCount}
              onChange={(event) => handleRoomCountChange(Number(event.target.value))}
            >
              {[1, 2, 3, 4].map((count) => (
                <option key={count} value={count}>
                  {count} {count === 1 ? "Room" : "Rooms"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {primaryRoom ? (
          <div className="hathor-booking-filter__guests">
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
          <p className="hathor-booking-filter__hint">
            Additional rooms use default guest settings until configured at cabin
            selection.
          </p>
        ) : null}

        {error ? (
          <p className="hathor-booking-filter__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="hathor-booking-filter__actions">
          <button type="button" className="public-btn-outline-gold" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="public-btn-gold" onClick={handleApply}>
            Update Guests
          </button>
        </div>
      </div>
    </section>
  );
}
