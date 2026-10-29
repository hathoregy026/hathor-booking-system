import type { Metadata } from "next";
import { BookingSuccess, type BookingSuccessSearchParams } from "@/components/booking/BookingSuccess";

export const metadata: Metadata = {
  title: "Richiesta di prenotazione inviata",
  description:
    "Crociera sul Nilo in dahabiya privata di lusso tra Luxor e Assuan: 32 ospiti, suite vista Nilo, alta cucina e visite ai templi senza fretta, a bordo di Hathor.",
  robots: { index: false, follow: false },
};

/** The request-sent result in Italian, for bookings sent from /it/booking. */
export default function ItalianBookingSuccessPage({ searchParams }: { searchParams: BookingSuccessSearchParams }) {
  return <BookingSuccess searchParams={searchParams} locale="it" />;
}
