"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  Baby,
  BedDouble,
  CalendarDays,
  Headphones,
  Landmark,
  Lock,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createDefaultRoomConfigs,
  findStayDurationOption,
  STAY_DURATION_OPTIONS,
  type RoomSearchConfig,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import {
  clampRoomSearchConfig,
} from "@/lib/room-capacity";

const PRIVATE_CHARTER_OPTION = "private-charter" as const;
const PRIVATE_CHARTER_HREF = "/charter";
const VOYAGE_STAGE_IMAGE = "/media/hathor/booking/voyage-palace-nile.webp";

const TRUST_MARKS = [
  { label: "Best Rate Guarantee", Icon: ShieldCheck },
  { label: "Private & Secure Booking", Icon: Lock },
  { label: "Personal Travel Designer", Icon: Sparkles },
  { label: "24/7 VIP Assistance", Icon: Headphones },
] as const;

type BookingItineraryFilterProps = {
  initialDuration: StayDurationValue;
  initialRoomConfigs: RoomSearchConfig[];
  onApply: (input: {
    duration: StayDurationValue;
    roomConfigs: RoomSearchConfig[];
  }) => void;
  onCancel: () => void;
};

function journeyLabel(duration: StayDurationValue): string {
  if (duration === "3-nights-aswan-luxor") return "Aswan ↔ Luxor";
  if (duration === "4-nights-luxor-aswan") return "Luxor ↔ Aswan";
  return "Luxor ↔ Aswan";
}

function nightsLabel(duration: StayDurationValue): string {
  const option = findStayDurationOption(duration);
  if (!option) return "Flexible";
  return option.label.replace(/^⛵\s*/, "").split(" - ")[0] ?? option.label;
}

function guestsLabel(rooms: RoomSearchConfig[]): string {
  const adults = rooms.reduce((sum, room) => sum + room.adults, 0);
  const children = rooms.reduce((sum, room) => sum + room.children, 0);
  const adultText = `${adults} ${adults === 1 ? "Adult" : "Adults"}`;
  if (children <= 0) return adultText;
  return `${adultText}, ${children} ${children === 1 ? "Child" : "Children"}`;
}

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
    <div className="hathor-voyage-counter">
      <span className="hathor-voyage-counter__label">{label}</span>
      <div className="hathor-voyage-counter__controls">
        <button
          type="button"
          className="hathor-voyage-counter__btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3.5 w-3.5" aria-hidden strokeWidth={1.75} />
        </button>
        <span className="hathor-voyage-counter__value">{value}</span>
        <button
          type="button"
          className="hathor-voyage-counter__btn"
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
        const extras = createDefaultRoomConfigs(count - current.length).map(
          (room) =>
            clampRoomSearchConfig({
              ...room,
              roomType: current[0]?.roomType ?? room.roomType,
            }),
        );
        return [...current, ...extras];
      }
      return current.slice(0, count);
    });
  };

  const updatePrimaryRoomGuests = (patch: Partial<RoomSearchConfig>) => {
    setRoomConfigs((current) => {
      const next = [...current];
      next[0] = { ...next[0], ...patch };
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
      roomConfigs,
    });
  };

  const primaryRoom = roomConfigs[0];
  const maxGuestsRoom1 = 4;

  return (
    <section className="hathor-voyage-stage" aria-label="Guests and itinerary">
      <div className="hathor-voyage-stage__media" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={VOYAGE_STAGE_IMAGE}
          alt=""
          className="hathor-voyage-stage__photo"
        />
        <div className="hathor-voyage-stage__veil" />
      </div>

      <header className="hathor-voyage-stage__intro">
        <h1 className="hathor-voyage-stage__title">
          Your Voyage, Crafted to Perfection
        </h1>
        <p className="hathor-voyage-stage__subtitle">
          Reserve your private journey on the Nile.
        </p>
      </header>

      <div className="hathor-voyage-stage__layout">
        <article className="hathor-voyage-card">
          <div className="hathor-voyage-card__body">
            <aside className="hathor-voyage-card__rail">
              <div className="hathor-voyage-card__journey">
                <Landmark className="hathor-voyage-card__rail-emblem" strokeWidth={1.25} aria-hidden />
                <p className="hathor-voyage-card__rail-label">Your Journey</p>
                <p className="hathor-voyage-card__rail-value">
                  {journeyLabel(duration)}
                </p>
                <p className="hathor-voyage-card__rail-meta">
                  {nightsLabel(duration)}
                </p>
              </div>

              <div className="hathor-voyage-card__rail-divider" aria-hidden>
                <span />
              </div>

              <div className="hathor-voyage-card__flexible">
                <CalendarDays className="hathor-voyage-card__rail-emblem" strokeWidth={1.25} aria-hidden />
                <p className="hathor-voyage-card__rail-label">Flexible Dates</p>
                <p className="hathor-voyage-card__rail-copy">
                  Your exact dates are flexible. Choose a window and we&apos;ll
                  suggest the perfect sailing.
                </p>
              </div>
            </aside>

            <div className="hathor-voyage-card__form">
              <div className="hathor-voyage-card__dates">
                <div className="hathor-voyage-field">
                  <span className="hathor-voyage-field__label">
                    Preferred Check-in Window
                  </span>
                  <p className="hathor-voyage-field__readonly">
                    <CalendarDays
                      className="hathor-voyage-field__icon"
                      aria-hidden
                      strokeWidth={1.5}
                    />
                    <span>Choose your check-in date</span>
                  </p>
                </div>
                <div className="hathor-voyage-field">
                  <span className="hathor-voyage-field__label">
                    Preferred Check-out Window
                  </span>
                  <p className="hathor-voyage-field__readonly">
                    <CalendarDays
                      className="hathor-voyage-field__icon"
                      aria-hidden
                      strokeWidth={1.5}
                    />
                    <span>Choose your check-out date</span>
                  </p>
                </div>
              </div>

              <div className="hathor-voyage-card__pair hathor-voyage-card__pair--itinerary">
                <div className="hathor-voyage-field">
                  <label
                    htmlFor="booking-filter-embarkation"
                    className="hathor-voyage-field__label"
                  >
                    Itinerary
                  </label>
                  <div className="hathor-voyage-field__control">
                    <MapPin
                      className="hathor-voyage-field__icon"
                      aria-hidden
                      strokeWidth={1.5}
                    />
                    <select
                      id="booking-filter-embarkation"
                      className="hathor-voyage-field__select"
                      value={duration}
                      onChange={(event) =>
                        handleEmbarkationChange(event.target.value)
                      }
                    >
                      {STAY_DURATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label.replace(/^⛵\s*/, "")}
                        </option>
                      ))}
                      <option value={PRIVATE_CHARTER_OPTION}>
                        Private Charter
                      </option>
                    </select>
                  </div>
                </div>

                <div className="hathor-voyage-field hathor-voyage-field--choice-note">
                  <span className="hathor-voyage-field__label">Accommodation</span>
                  <p className="hathor-voyage-field__readonly">
                    <BedDouble className="hathor-voyage-field__icon" aria-hidden strokeWidth={1.5} />
                    <span>Choose King, Twin, Suite or Royal after selecting dates</span>
                  </p>
                </div>
              </div>

              {primaryRoom ? (
                <div className="hathor-voyage-card__guest-block">
                  <p className="hathor-voyage-card__section-label">Guests</p>
                  <div className="hathor-voyage-card__guests">
                    <CounterField
                      label="Adults"
                      value={primaryRoom.adults}
                      min={1}
                      max={Math.max(1, maxGuestsRoom1 - primaryRoom.children)}
                      onChange={(adults) => updatePrimaryRoomGuests({ adults })}
                    />
                    <CounterField
                      label="Children (2–11 years)"
                      value={primaryRoom.children}
                      min={0}
                      max={Math.max(0, maxGuestsRoom1 - primaryRoom.adults)}
                      onChange={(children) =>
                        updatePrimaryRoomGuests({ children })
                      }
                    />
                    <div className="hathor-voyage-card__infant-note">
                      <span className="hathor-voyage-card__infant-icon">
                        <Baby aria-hidden strokeWidth={1.35} />
                      </span>
                      <span>
                        <strong>Add Infant</strong>
                        <small>Under 2 years</small>
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="hathor-voyage-field">
                <label
                  htmlFor="booking-filter-rooms"
                  className="hathor-voyage-field__label"
                >
                  Room Preference
                </label>
                <div className="hathor-voyage-field__control">
                  <BedDouble
                    className="hathor-voyage-field__icon"
                    aria-hidden
                    strokeWidth={1.5}
                  />
                  <select
                    id="booking-filter-rooms"
                    className="hathor-voyage-field__select"
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
              </div>

              {roomCount > 1 ? (
                <p className="hathor-voyage-card__hint">
                  Additional rooms use default guest settings until configured at
                  cabin selection.
                </p>
              ) : null}

              {error ? (
                <p className="hathor-voyage-card__error" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="hathor-voyage-card__actions">
                <button
                  type="button"
                  className="hathor-voyage-card__continue"
                  onClick={handleApply}
                >
                  <span>Continue to Suites</span>
                  <ArrowRight aria-hidden strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  className="hathor-voyage-card__cancel"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>

          <ul className="hathor-voyage-card__trust">
            {TRUST_MARKS.map(({ label, Icon }) => (
              <li key={label}>
                <Icon aria-hidden strokeWidth={1.5} />
                <span>{label}</span>
              </li>
            ))}
          </ul>
        </article>

        <aside className="hathor-voyage-select" aria-label="Your selection">
          <h2 className="hathor-voyage-select__title">Your Selection</h2>
          <dl className="hathor-voyage-select__list">
            <div>
              <dt>Journey</dt>
              <dd>{journeyLabel(duration)}</dd>
            </div>
            <div>
              <dt>Duration</dt>
              <dd>{nightsLabel(duration)}</dd>
            </div>
            <div>
              <dt>Dates</dt>
              <dd>Flexible</dd>
            </div>
            <div>
              <dt>Guests</dt>
              <dd>{guestsLabel(roomConfigs)}</dd>
            </div>
            <div>
              <dt>Accommodation</dt>
              <dd>Choose after dates</dd>
            </div>
            <div>
              <dt>Preference</dt>
              <dd>
                {roomCount} {roomCount === 1 ? "Room" : "Rooms"}
              </dd>
            </div>
          </dl>
          <p className="hathor-voyage-select__quote">
            Exceptional journeys. Timeless Egypt. Exclusively yours.
          </p>
        </aside>
      </div>
    </section>
  );
}
