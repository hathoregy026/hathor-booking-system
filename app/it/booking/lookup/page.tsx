import type { Metadata } from "next";
import { LOCALE_BOOKING_META } from "@/lib/i18n/locale-pages";

/** Booking lookup in this language: the same form, worded by the address. */
export { default } from "../../../booking/lookup/page";

export const metadata: Metadata = {
  ...LOCALE_BOOKING_META.it.lookup,
  robots: { index: false, follow: false },
};
