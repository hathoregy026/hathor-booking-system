import { HATHOR_ITINERARIES, type VoyageItinerary } from "@/lib/booking-itineraries";
import type { StayDurationValue } from "@/lib/booking-search-config";
import { HATHOR_ITINERARIES_DE } from "@/lib/i18n/booking-itineraries-de";
import { HATHOR_ITINERARIES_IT } from "@/lib/i18n/booking-itineraries-it";
import type { PublicLocale } from "@/lib/i18n/locale";

const ITINERARIES: Record<PublicLocale, Record<StayDurationValue, VoyageItinerary>> = {
  en: HATHOR_ITINERARIES,
  it: HATHOR_ITINERARIES_IT,
  de: HATHOR_ITINERARIES_DE,
};

const VOYAGE_ORDER: StayDurationValue[] = ["3-nights-aswan-luxor", "4-nights-luxor-aswan", "7-nights-luxor-aswan-luxor"];

/** The voyage's itinerary in the visitor's language. */
export function bookingItinerary(duration: StayDurationValue, locale: PublicLocale): VoyageItinerary {
  return ITINERARIES[locale][duration];
}

/** The three voyages, in the order the journey offers them. */
export function bookingVoyages(locale: PublicLocale): VoyageItinerary[] {
  return VOYAGE_ORDER.map((duration) => bookingItinerary(duration, locale));
}
