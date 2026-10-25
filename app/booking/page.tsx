import { BookingRoute, type BookingSearchParams } from "@/components/booking/BookingRoute";
import { BOOKING_COPY } from "@/lib/i18n/booking-copy";

export const metadata = {
  title: BOOKING_COPY.en.meta.title,
  description: BOOKING_COPY.en.meta.description,
  robots: { index: false, follow: false },
};

/** A room page can start the journey on its voyage and cabin type. */
export default function BookingPage({ searchParams }: { searchParams: BookingSearchParams }) {
  return <BookingRoute searchParams={searchParams} locale="en" />;
}
