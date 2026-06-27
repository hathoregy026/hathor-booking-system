"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { HathorBrandMark } from "@/components/booking/HathorBrandMark";
import { formatPrice } from "@/lib/client-dates";
import { computeBookingTotals } from "@/lib/booking-pricing";
import type { RoomSearchConfig } from "@/lib/booking-search-config";

export type HistoriaBookingStep = 1 | 2 | 3 | 4;

type BookingProgressBarProps = {
  currentStep: HistoriaBookingStep;
  maxReachableStep: HistoriaBookingStep;
  roomConfigs: RoomSearchConfig[];
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
};

function formatRoomCountLabel(count: number): string {
  return `${count} ${count === 1 ? "Room" : "Rooms"}`;
}

export function BookingProgressBar({
  currentStep,
  maxReachableStep,
  roomConfigs,
  totalPrice = 0,
  selectedDateLabel,
  onStepNavigate,
}: BookingProgressBarProps) {
  const adults = roomConfigs.reduce((sum, room) => sum + room.adults, 0);
  const children = roomConfigs.reduce((sum, room) => sum + room.children, 0);
  const roomCount = roomConfigs.length;
  const grandTotal = computeBookingTotals(totalPrice).totalCents;
  const priceLabel =
    grandTotal > 0
      ? formatPrice(grandTotal).replace("$", "$ ")
      : "$ 0.00";

  const segments: SegmentConfig[] = [
    {
      id: "guests",
      step: 1,
      label: "Step 1: Adults and Children",
      value: `${adults}/${children}`,
      isActive: currentStep === 1,
      isComplete: currentStep > 1,
      isReachable: maxReachableStep >= 1,
    },
    {
      id: "dates",
      step: 2,
      label: "Dates",
      value: selectedDateLabel?.trim() || "Select",
      isActive: currentStep === 2,
      isComplete: currentStep > 2,
      isReachable: maxReachableStep >= 2,
    },
    {
      id: "cabins",
      step: 3,
      label: "Step 2: Cabin and Suite Selection",
      value:
        currentStep > 3 || (currentStep === 3 && maxReachableStep >= 3)
          ? formatRoomCountLabel(roomCount)
          : "Select",
      isActive: currentStep === 3,
      isComplete: currentStep > 3,
      isReachable: maxReachableStep >= 3,
    },
    {
      id: "confirmation",
      step: 4,
      label: currentStep === 4 ? "All Rooms" : "Step 3: Confirmation Details",
      value: priceLabel,
      isActive: currentStep === 4,
      isComplete: false,
      isReachable: maxReachableStep >= 4,
    },
  ];

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
              const canEdit =
                segment.isReachable &&
                !segment.isActive &&
                segment.step <= maxReachableStep &&
                Boolean(onStepNavigate);

              const content = (
                <>
                  <span className="hathor-checkout-steps__label">{segment.label}</span>
                  <span className="hathor-checkout-steps__value booking-serif">
                    {segment.value}
                  </span>
                  {canEdit ? (
                    <ChevronDown
                      className="hathor-checkout-steps__chevron"
                      strokeWidth={2}
                      aria-hidden
                    />
                  ) : null}
                  {segment.isActive ? (
                    <span className="hathor-checkout-steps__caret" aria-hidden />
                  ) : null}
                </>
              );

              return (
                <li
                  key={segment.id}
                  className={`hathor-checkout-steps__segment${
                    segment.isActive ? " hathor-checkout-steps__segment--active" : ""
                  }${segment.isComplete ? " hathor-checkout-steps__segment--complete" : ""}${
                    canEdit ? " hathor-checkout-steps__segment--clickable" : ""
                  }${!segment.isReachable ? " hathor-checkout-steps__segment--locked" : ""}`}
                  aria-current={segment.isActive ? "step" : undefined}
                >
                  {canEdit ? (
                    <button
                      type="button"
                      className="hathor-checkout-steps__segment-btn"
                      onClick={() => onStepNavigate?.(segment.step)}
                      aria-label={`Edit ${segment.label}`}
                    >
                      {content}
                    </button>
                  ) : (
                    <div className="hathor-checkout-steps__segment-content">
                      {content}
                    </div>
                  )}
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
