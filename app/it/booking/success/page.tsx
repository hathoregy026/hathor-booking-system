import { BookingSuccess, type BookingSuccessSearchParams } from "@/components/booking/BookingSuccess";

/** The request-sent result in Italian, for bookings sent from /it/booking. */
export default function ItalianBookingSuccessPage({ searchParams }: { searchParams: BookingSuccessSearchParams }) {
  return <BookingSuccess searchParams={searchParams} locale="it" />;
}
