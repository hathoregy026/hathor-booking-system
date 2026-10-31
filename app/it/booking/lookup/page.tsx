import type { Metadata } from "next";

/** Booking lookup in Italian: the same form, worded by the address. */
export { default } from "../../../booking/lookup/page";

export const metadata: Metadata = {
  title: "Segua la Sua prenotazione",
  description:
    "Inserisca il codice di prenotazione e l’email usata per ritrovare la Sua richiesta di viaggio a bordo di Hathor Dahabiya.",
  robots: { index: false, follow: false },
};
