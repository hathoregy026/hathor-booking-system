"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { BedDouble, CalendarDays, MapPin, Minus, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSiteImage } from "@/components/public/SiteImagesProvider";
import {
  HATHOR_BRAND_NAME,
  HATHOR_ICON_GOLD_SRC,
} from "@/lib/branding";
import {
  createDefaultRoomConfigs,
  normalizeRoomConfigsForDuration,
  STAY_DURATION_OPTIONS,
  type RoomSearchConfig,
  type StayDurationValue,
} from "@/lib/booking-search-config";
import { clampRoomSearchConfig } from "@/lib/room-capacity";
import { useBookingStore } from "@/store/bookingStore";

/** Real site photo — Nile dahabiya (homepage legacy / landmarks). */
const BOOKING_MODAL_PANEL_IMAGE = "home-story-legacy-large";

/** Modal-only embarkation choice — routes to the charter page. */
const PRIVATE_CHARTER_OPTION = "private-charter" as const;
const PRIVATE_CHARTER_HREF = "/charter";

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
          <Minus className="h-3.5 w-3.5" aria-hidden strokeWidth={1.75} />
        </button>
        <span className="hathor-modal-counter__value">{value}</span>
        <button
          type="button"
          className="hathor-modal-counter__btn"
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

export function BookingModal({ open, onClose }: BookingModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const panelImage = useSiteImage(BOOKING_MODAL_PANEL_IMAGE);
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

    const scrollY = window.scrollY;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPosition = body.style.position;
    const previousTop = body.style.top;
    const previousWidth = body.style.width;
    const previousPaddingRight = body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();

    return () => {
      body.style.overflow = previousOverflow;
      body.style.position = previousPosition;
      body.style.top = previousTop;
      body.style.width = previousWidth;
      body.style.paddingRight = previousPaddingRight;
      window.scrollTo(0, scrollY);
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

  const handleEmbarkationChange = (value: string) => {
    if (value === PRIVATE_CHARTER_OPTION) {
      handleClose();
      router.push(PRIVATE_CHARTER_HREF);
      return;
    }
    handleDurationChange(value as StayDurationValue);
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
    <div className="hathor-booking-modal hathor-booking-modal--noir" role="presentation">
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
        <aside
          className="hathor-booking-modal__art hathor-booking-modal__art--photo"
          aria-hidden="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={panelImage.src}
            alt=""
            className="hathor-booking-modal__art-img"
            draggable={false}
            decoding="async"
          />
          <div className="hathor-booking-modal__art-veil" />
        </aside>

        <div className="hathor-booking-modal__main">
          <button
            type="button"
            className="hathor-booking-modal__close"
            onClick={handleClose}
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden strokeWidth={1.5} />
          </button>

          <header className="hathor-booking-modal__header">
            <div className="hathor-booking-modal__header-brand">
              <div className="hathor-booking-modal__logo-wrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={HATHOR_ICON_GOLD_SRC}
                  alt={HATHOR_BRAND_NAME}
                  className="hathor-booking-modal__logo hathor-booking-modal__logo--icon"
                  draggable={false}
                />
              </div>
              <p className="hathor-booking-modal__eyebrow">Reserve your journey</p>
              <h2 id={titleId} className="hathor-booking-modal__title">
                Book Hathor Dahabiya
              </h2>
              <div className="hathor-booking-modal__lotus" aria-hidden="true">
                <span className="hathor-booking-modal__lotus-line" />
                <span className="hathor-booking-modal__lotus-mark" />
                <span className="hathor-booking-modal__lotus-line" />
              </div>
            </div>
          </header>

          <div className="hathor-booking-modal__body">
            <div className="hathor-modal-step">
              <div className="hathor-modal-field">
                <label htmlFor="hathor-embarkation" className="hathor-modal-label">
                  Embarkation
                </label>
                <div className="hathor-modal-control">
                  <MapPin
                    className="hathor-modal-control__icon"
                    aria-hidden
                    strokeWidth={1.5}
                  />
                  <select
                    id="hathor-embarkation"
                    className="hathor-modal-select"
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

              <div className="hathor-modal-dates-grid">
                <div className="hathor-modal-field">
                  <span className="hathor-modal-label">Check-in</span>
                  <p className="hathor-modal-readonly">
                    <CalendarDays
                      className="hathor-modal-control__icon"
                      aria-hidden
                      strokeWidth={1.5}
                    />
                    <span>Choose your check-in date</span>
                  </p>
                </div>
                <div className="hathor-modal-field">
                  <span className="hathor-modal-label">Check-out</span>
                  <p className="hathor-modal-readonly">
                    <CalendarDays
                      className="hathor-modal-control__icon"
                      aria-hidden
                      strokeWidth={1.5}
                    />
                    <span>Choose your check-out date</span>
                  </p>
                </div>
              </div>

              <div className="hathor-modal-field">
                <label htmlFor="hathor-rooms" className="hathor-modal-label">
                  Rooms
                </label>
                <div className="hathor-modal-control">
                  <BedDouble
                    className="hathor-modal-control__icon"
                    aria-hidden
                    strokeWidth={1.5}
                  />
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
            <button
              type="button"
              className="hathor-modal-btn hathor-modal-btn--primary"
              onClick={handleAvailabilityCheck}
            >
              Check Availability
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
