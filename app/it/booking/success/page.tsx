import type { Metadata } from "next";
import { BookingSuccess, type BookingSuccessSearchParams } from "@/components/booking/BookingSuccess";

export const metadata: Metadata = {
  title: "Richiesta di prenotazione inviata",
  description:
    "La Sua richiesta di prenotazione per Hathor Dahabiya è stata inviata: qui trova il riepilogo del viaggio e i prossimi passi.",
  robots: { index: false, follow: false },
};

/** The request-sent result in Italian, for bookings sent from /it/booking. */
export default function ItalianBookingSuccessPage({ searchParams }: { searchParams: BookingSuccessSearchParams }) {
  return <BookingSuccess searchParams={searchParams} locale="it" />;
}
