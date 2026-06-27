"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/client-dates";
import type { RoomSearchConfig } from "@/lib/booking-search-config";

export type HistoriaBookingStep = 1 | 2 | 3 | 4;

type BookingProgressBarProps = {
  currentStep: HistoriaBookingStep;
  maxReachableStep: HistoriaBookingStep;
  roomConfigs: RoomSearchConfig[];
  totalPrice?: number;
  selectedDateLabel?: string | null;
  selectedRoomLabel?: string | null;
  onStepNavigate?: (step: HistoriaBookingStep) => void;
};

type SegmentConfig = {
  id: string;
  step: HistoriaBookingStep;
  title: string;
  meta: string;
  isActive: boolean;
  isComplete: boolean;
  isReachable: boolean;
};

export function BookingProgressBar({
  currentStep,
  maxReachableStep,
  roomConfigs,
  totalPrice = 0,
  selectedDateLabel,
  selectedRoomLabel,
  onStepNavigate,
}: BookingProgressBarProps) {
  const adults = roomConfigs.reduce((sum, room) => sum + room.adults, 0);
  const children = roomConfigs.reduce((sum, room) => sum + room.children, 0);
  const priceLabel = totalPrice > 0 ? formatPrice(totalPrice) : "$ 0.00";

  const cabinMeta =
    currentStep >= 3 && selectedRoomLabel ? selectedRoomLabel : "Select";

  const segments: SegmentConfig[] = [
    {
      id: "guests",
      step: 1,
      title: "Step 1: Adults and Children",
      meta: `${adults}/${children}`,
      isActive: currentStep === 1,
      isComplete: currentStep > 1,
      isReachable: maxReachableStep >= 1,
    },
    {
      id: "dates",
      step: 2,
      title: "Dates",
      meta: selectedDateLabel?.trim() || "Select",
      isActive: currentStep === 2,
      isComplete: currentStep > 2,
      isReachable: maxReachableStep >= 2,
    },
    {
      id: "cabins",
      step: 3,
      title: "Step 2: Cabin and Suite Selection",
      meta: cabinMeta,
      isActive: currentStep === 3,
      isComplete: currentStep > 3,
      isReachable: maxReachableStep >= 3,
    },
    {
      id: "confirmation",
      step: 4,
      title: "Step 3: Confirmation Details",
      meta: priceLabel,
      isActive: currentStep === 4,
      isComplete: false,
      isReachable: maxReachableStep >= 4,
    },
  ];

  return (
    <div className="hathor-checkout-chrome">
      <div className="hathor-checkout-chrome__toolbar">
        <Link href="/" className="hathor-checkout-chrome__back-home">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to main site
        </Link>
      </div>

      <nav className="hathor-checkout-steps" aria-label="Booking progress">
        <div className="hathor-checkout-steps__inner">
          <span className="hathor-checkout-steps__brand booking-serif" aria-hidden>
            Hathor
          </span>

          <ol className="hathor-checkout-steps__segments">
            {segments.map((segment) => {
              const canEdit =
                segment.isReachable &&
                !segment.isActive &&
                segment.step <= maxReachableStep &&
                Boolean(onStepNavigate);

              const content = (
                <>
                  <span className="hathor-checkout-steps__segment-title">
                    {segment.title}
                  </span>
                  <span className="hathor-checkout-steps__segment-meta">
                    {segment.meta}
                  </span>
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
                      aria-label={`Edit ${segment.title}`}
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
    </div>
  );
}
