"use client";

import { useEffect } from "react";
import { reportBookingConversion } from "@/lib/booking-conversion";

/** Success page: reports a booking request once, only right after this browser sent it. */
export function BookingConversionPing({ bookingId }: { bookingId: string | null | undefined }) {
  useEffect(() => {
    if (bookingId) reportBookingConversion(bookingId);
  }, [bookingId]);
  return null;
}
