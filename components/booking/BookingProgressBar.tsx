"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/client-dates";
import type { RoomSearchConfig } from "@/lib/booking-search-config";

export type HistoriaBookingStep = 1 | 2 | 3 | 4;

type BookingProgressBarProps = {
  currentStep: HistoriaBookingStep;
  roomConfigs: RoomSearchConfig[];
  totalPrice?: number;
  selectedDateLabel?: string | null;
};

type SegmentConfig = {
  id: string;
  title: string;
  meta: string;
  isActive: boolean;
  isComplete: boolean;
};

export function BookingProgressBar({
  currentStep,
  roomConfigs,
  totalPrice = 0,
  selectedDateLabel,
}: BookingProgressBarProps) {
  const adults = roomConfigs.reduce((sum, room) => sum + room.adults, 0);
  const children = roomConfigs.reduce((sum, room) => sum + room.children, 0);
  const priceLabel =
    totalPrice > 0 ? formatPrice(totalPrice) : "$ 0.00";

  const segments: SegmentConfig[] = [
    {
      id: "guests",
      title: "Step 1: Adults and Children",
      meta: `${adults}/${children}`,
      isActive: currentStep === 1,
      isComplete: currentStep > 1,
    },
    {
      id: "dates",
      title: "Dates",
      meta: selectedDateLabel?.trim() || "Select",
      isActive: currentStep === 2,
      isComplete: currentStep > 2,
    },
    {
      id: "cabins",
      title: "Step 2: Cabin and Suite Selection",
      meta: currentStep > 3 ? "Selected" : "Select",
      isActive: currentStep === 3,
      isComplete: currentStep > 3,
    },
    {
      id: "confirmation",
      title: "Step 3: Confirmation Details",
      meta: priceLabel,
      isActive: currentStep === 4,
      isComplete: false,
    },
  ];

  return (
    <nav className="hathor-checkout-steps" aria-label="Booking progress">
      <div className="hathor-checkout-steps__inner">
        <Link href="/" className="hathor-checkout-steps__brand booking-serif">
          Hathor
        </Link>

        <ol className="hathor-checkout-steps__segments">
          {segments.map((segment) => (
            <li
              key={segment.id}
              className={`hathor-checkout-steps__segment${
                segment.isActive ? " hathor-checkout-steps__segment--active" : ""
              }${segment.isComplete ? " hathor-checkout-steps__segment--complete" : ""}`}
              aria-current={segment.isActive ? "step" : undefined}
            >
              <span className="hathor-checkout-steps__segment-title">
                {segment.title}
              </span>
              <span className="hathor-checkout-steps__segment-meta">
                {segment.meta}
              </span>
              {segment.isActive ? (
                <span className="hathor-checkout-steps__caret" aria-hidden />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
