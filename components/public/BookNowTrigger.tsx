"use client";

import { useBookNowModal } from "@/components/booking/BookingModalProvider";

type BookNowTriggerProps = {
  className?: string;
  children: React.ReactNode;
};

export function BookNowTrigger({ className, children }: BookNowTriggerProps) {
  const { openBooking } = useBookNowModal();

  return (
    <button type="button" className={className} onClick={openBooking}>
      {children}
    </button>
  );
}

/** @deprecated Use BookNowTrigger */
export const HeroBookTrigger = BookNowTrigger;
