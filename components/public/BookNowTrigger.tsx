"use client";

import { useBookNowModal } from "@/components/booking/BookingModalProvider";

type BookNowTriggerProps = {
  className?: string;
  children: React.ReactNode;
};

export function BookNowTrigger({ className, children }: BookNowTriggerProps) {
  const { openBooking } = useBookNowModal();

  return (
    <button
      type="button"
      className={className}
      /* Book Now is the primary action everywhere it appears, so the shared
         button system paints it filled. The hero glass CTA opts out itself. */
      data-hathor-btn="primary"
      onClick={openBooking}
    >
      {children}
    </button>
  );
}

/** @deprecated Use BookNowTrigger */
export const HeroBookTrigger = BookNowTrigger;
