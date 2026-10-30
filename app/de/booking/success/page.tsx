import type { Metadata } from "next";
import { BookingSuccess, type BookingSuccessSearchParams } from "@/components/booking/BookingSuccess";
import { LOCALE_BOOKING_META } from "@/lib/i18n/locale-pages";

export const metadata: Metadata = {
  ...LOCALE_BOOKING_META.de.success,
  robots: { index: false, follow: false },
};

/** The request-sent result, for bookings sent from /de/booking. */
export default function GermanBookingSuccessPage({ searchParams }: { searchParams: BookingSuccessSearchParams }) {
  return <BookingSuccess searchParams={searchParams} locale="de" />;
}
