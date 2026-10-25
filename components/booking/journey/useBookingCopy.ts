import { usePublicLocale } from "@/hooks/usePublicLocale";
import { BOOKING_COPY, type BookingCopy } from "@/lib/i18n/booking-copy";

/** The journey's words in the visitor's language (`/it/booking` is Italian). */
export function useBookingCopy(): BookingCopy {
  return BOOKING_COPY[usePublicLocale()];
}
