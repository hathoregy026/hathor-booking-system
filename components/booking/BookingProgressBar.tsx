"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { HathorBrandMark } from "@/components/booking/HathorBrandMark";
import { formatPrice } from "@/lib/client-dates";
import { computeBookingTotals } from "@/lib/booking-pricing";
import type { RoomSearchConfig, StayDurationValue } from "@/lib/booking-search-config";
import type { AvailableRoom } from "@/lib/booking-types";
import { getSelectedRooms } from "@/store/bookingStore";

export type HistoriaBookingStep = 1 | 2 | 3 | 4;

const ROOM_THUMB_PLACEHOLDER =
  "linear-gradient(135deg, #0a0a0a 0%, #2a2218 45%, #c9a96e 100%)";

type BookingProgressBarProps = {
  currentStep: HistoriaBookingStep;
  maxReachableStep: HistoriaBookingStep;
  roomConfigs: RoomSearchConfig[];
  availableRooms?: AvailableRoom[];
  selectedRoomIds?: string[];
  checkInDate?: string | null;
  duration?: StayDurationValue | "";
  totalPrice?: number;
  selectedDateLabel?: string | null;
  onStepNavigate?: (step: HistoriaBookingStep) => void;
};

type SegmentConfig = {
  id: string;
  step: HistoriaBookingStep;
  label: string;
  value: string;
  isActive: boolean;
  isComplete: boolean;
  isReachable: boolean;
  hasRoomDropdown: boolean;
};

function formatRoomCountLabel(count: number): string {
  return `${count} ${count === 1 ? "Room" : "Rooms"}`;
}

function buildRoomDetailsHref(
  room: AvailableRoom,
  checkInDate: string | null | undefined,
  duration: StayDurationValue | "" | undefined,
  roomConfigs: RoomSearchConfig[],
): string {
  const adults = roomConfigs.reduce((sum, cfg) => sum + cfg.adults, 0);
  const children = roomConfigs.reduce((sum, cfg) => sum + cfg.children, 0);
  const params = new URLSearchParams();
  if (checkInDate) params.set("checkInDate", checkInDate);
  if (duration) params.set("duration", duration);
  if (room.cruiseId) params.set("cruiseId", room.cruiseId);
  params.set("scheduleId", room.scheduleId);
  params.set("adults", String(adults));
  params.set("children", String(children));
  return `/booking/cruise/${room.id}?${params.toString()}`;
}

function PickArrow() {
  return <span className="hathor-checkout-steps__pick-arrow" aria-hidden />;
}

export function BookingProgressBar({
  currentStep,
  maxReachableStep,
  roomConfigs,
  availableRooms = [],
  selectedRoomIds = [],
  checkInDate = null,
  duration = "",
  totalPrice = 0,
  selectedDateLabel,
  onStepNavigate,
}: BookingProgressBarProps) {
  const [openRoomDropdown, setOpenRoomDropdown] = useState(false);
  const cabinsRef = useRef<HTMLLIElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const adults = roomConfigs.reduce((sum, room) => sum + room.adults, 0);
  const children = roomConfigs.reduce((sum, room) => sum + room.children, 0);
  const roomCount = roomConfigs.length;
  const selectedRooms = getSelectedRooms(availableRooms, selectedRoomIds);
  const hasSelectedRooms = selectedRooms.length > 0;
  const grandTotal = computeBookingTotals(totalPrice).totalCents;
  const priceLabel =
    grandTotal > 0 ? formatPrice(grandTotal).replace("$", "$ ") : "$ 0.00";

  const cabinsValue =
    hasSelectedRooms || currentStep > 3
      ? formatRoomCountLabel(hasSelectedRooms ? selectedRooms.length : roomCount)
      : "Select";

  const segments: SegmentConfig[] = [
    {
      id: "guests",
      step: 1,
      label: "Step 1: Adults and Children",
      value: `${adults}/${children}`,
      isActive: currentStep === 1,
      isComplete: currentStep > 1,
      isReachable: maxReachableStep >= 1,
      hasRoomDropdown: false,
    },
    {
      id: "dates",
      step: 2,
      label: "Dates",
      value: selectedDateLabel?.trim() || "Select",
      isActive: currentStep === 2,
      isComplete: currentStep > 2,
      isReachable: maxReachableStep >= 2,
      hasRoomDropdown: false,
    },
    {
      id: "cabins",
      step: 3,
      label: "Step 2: Cabin and Suite Selection",
      value: cabinsValue,
      isActive: currentStep === 3,
      isComplete: currentStep > 3,
      isReachable: maxReachableStep >= 3,
      hasRoomDropdown: hasSelectedRooms,
    },
    {
      id: "confirmation",
      step: 4,
      label: currentStep === 4 ? "All Rooms" : "Step 3: Confirmation Details",
      value: priceLabel,
      isActive: currentStep === 4,
      isComplete: false,
      isReachable: maxReachableStep >= 4,
      hasRoomDropdown: false,
    },
  ];

  const closeRoomDropdown = useCallback(() => setOpenRoomDropdown(false), []);

  useEffect(() => {
    if (!openRoomDropdown) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (
        cabinsRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      closeRoomDropdown();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeRoomDropdown();
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeRoomDropdown, openRoomDropdown]);

  useEffect(() => {
    if (!hasSelectedRooms) setOpenRoomDropdown(false);
  }, [hasSelectedRooms]);

  const handleCabinsClick = () => {
    if (hasSelectedRooms) {
      setOpenRoomDropdown((open) => !open);
      return;
    }
    if (maxReachableStep >= 3 && currentStep !== 3) {
      onStepNavigate?.(3);
    }
  };

  return (
    <div className="hathor-checkout-chrome">
      <nav className="hathor-checkout-steps" aria-label="Booking progress">
        <div className="hathor-checkout-steps__inner">
          <Link href="/" className="hathor-checkout-steps__logo" aria-label="Hathor home">
            <HathorBrandMark
              variant="on-dark"
              className="hathor-checkout-steps__logo-img"
            />
          </Link>

          <ol className="hathor-checkout-steps__segments">
            {segments.map((segment) => {
              const canNavigate =
                segment.isReachable &&
                !segment.isActive &&
                segment.step <= maxReachableStep &&
                Boolean(onStepNavigate) &&
                !segment.hasRoomDropdown;

              const showPickArrow = canNavigate || segment.hasRoomDropdown;

              const isCabins = segment.id === "cabins";
              const cabinsDropdown = isCabins && segment.hasRoomDropdown;
              const cabinsNavigate =
                isCabins &&
                !segment.hasRoomDropdown &&
                segment.isReachable &&
                !segment.isActive &&
                Boolean(onStepNavigate);

              const cabinsInteractive = cabinsDropdown || cabinsNavigate;

              const content = (
                <>
                  <span className="hathor-checkout-steps__label">{segment.label}</span>
                  <span className="hathor-checkout-steps__value booking-serif">
                    {segment.value}
                  </span>
                  {showPickArrow && !segment.isActive ? <PickArrow /> : null}
                  {segment.isActive ? (
                    <span className="hathor-checkout-steps__caret" aria-hidden />
                  ) : null}
                </>
              );

              return (
                <li
                  key={segment.id}
                  ref={isCabins ? cabinsRef : undefined}
                  className={`hathor-checkout-steps__segment${
                    segment.isActive ? " hathor-checkout-steps__segment--active" : ""
                  }${segment.isComplete ? " hathor-checkout-steps__segment--complete" : ""}${
                    canNavigate || cabinsInteractive
                      ? " hathor-checkout-steps__segment--clickable"
                      : ""
                  }${!segment.isReachable ? " hathor-checkout-steps__segment--locked" : ""}${
                    isCabins && openRoomDropdown
                      ? " hathor-checkout-steps__segment--dropdown-open"
                      : ""
                  }`}
                  aria-current={segment.isActive ? "step" : undefined}
                >
                  {canNavigate ? (
                    <button
                      type="button"
                      className="hathor-checkout-steps__segment-btn"
                      onClick={() => onStepNavigate?.(segment.step)}
                      aria-label={`Edit ${segment.label}`}
                    >
                      {content}
                    </button>
                  ) : cabinsDropdown ? (
                    <button
                      type="button"
                      className="hathor-checkout-steps__segment-btn"
                      onClick={handleCabinsClick}
                      aria-expanded={openRoomDropdown}
                      aria-haspopup="true"
                      aria-label="View selected rooms"
                    >
                      {content}
                    </button>
                  ) : cabinsNavigate ? (
                    <button
                      type="button"
                      className="hathor-checkout-steps__segment-btn"
                      onClick={() => onStepNavigate?.(3)}
                      aria-label={`Edit ${segment.label}`}
                    >
                      {content}
                    </button>
                  ) : (
                    <div className="hathor-checkout-steps__segment-content">
                      {content}
                    </div>
                  )}

                  {isCabins && openRoomDropdown && hasSelectedRooms ? (
                    <div
                      ref={dropdownRef}
                      className="hathor-checkout-room-dropdown"
                      role="region"
                      aria-label="Selected rooms"
                    >
                      {selectedRooms.map((room) => {
                        const meta = [
                          room.roomType ?? "Stateroom",
                          `up to ${room.capacity} guests`,
                        ].join(" · ");

                        return (
                          <article
                            key={room.selectionKey ?? room.id}
                            className="hathor-checkout-room-dropdown__item"
                          >
                            <div
                              className="hathor-checkout-room-dropdown__thumb"
                              style={{ background: ROOM_THUMB_PLACEHOLDER }}
                              role="img"
                              aria-label={room.name}
                            />
                            <div className="hathor-checkout-room-dropdown__body">
                              <p className="hathor-checkout-room-dropdown__name">
                                {room.name}
                              </p>
                              <p className="hathor-checkout-room-dropdown__meta">{meta}</p>
                            </div>
                            <Link
                              href={buildRoomDetailsHref(
                                room,
                                checkInDate,
                                duration,
                                roomConfigs,
                              )}
                              className="hathor-checkout-room-dropdown__view"
                              onClick={closeRoomDropdown}
                            >
                              View
                            </Link>
                          </article>
                        );
                      })}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      <div className="hathor-checkout-chrome__footer">
        <Link href="/" className="hathor-checkout-chrome__back-home">
          Back to main site
        </Link>
      </div>
    </div>
  );
}
