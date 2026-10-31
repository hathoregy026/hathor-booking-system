import { BookingSuccess, type BookingSuccessSearchParams } from "@/components/booking/BookingSuccess";

/** Request-sent result — never implied as confirmed unless the booking status is CONFIRMED. */
export default function BookingSuccessPage({ searchParams }: { searchParams: BookingSuccessSearchParams }) {
  return <BookingSuccess searchParams={searchParams} locale="en" />;
}
