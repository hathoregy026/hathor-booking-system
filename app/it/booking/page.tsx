import { BookingRoute, type BookingSearchParams } from "@/components/booking/BookingRoute";
import { BOOKING_COPY } from "@/lib/i18n/booking-copy";

export const metadata = {
  title: BOOKING_COPY.it.meta.title,
  description: BOOKING_COPY.it.meta.description,
  robots: { index: false, follow: false },
};

/** The booking journey in this language: the same journey and booking engine as /booking. */
export default function ItalianBookingPage({ searchParams }: { searchParams: BookingSearchParams }) {
  return <BookingRoute searchParams={searchParams} locale="it" />;
}
