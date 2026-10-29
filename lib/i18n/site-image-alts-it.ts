/**
 * Italian alt text for the shared site-image slots, keyed by the English alt
 * the slot carries (the dashboard default or the stored one). An alt edited in
 * the dashboard to a sentence not listed here stays as written.
 */

import type { PublicLocale } from "@/lib/i18n/locale";

const SITE_IMAGE_ALTS_IT: Record<string, string> = {
  "3 Nights / 4 Days Aswan to Luxor voyage aboard Hathor":
    "Viaggio di 3 notti e 4 giorni da Assuan a Luxor a bordo di Hathor",
  "4 Nights / 5 Days Luxor to Aswan voyage aboard Hathor":
    "Viaggio di 4 notti e 5 giorni da Luxor ad Assuan a bordo di Hathor",
  "7 Nights / 8 Days Luxor to Aswan to Luxor voyage aboard Hathor":
    "Viaggio di 7 notti e 8 giorni da Luxor ad Assuan e ritorno a bordo di Hathor",
  "A guest in a robe by the window, unwinding aboard Hathor":
    "Un ospite in accappatoio accanto alla finestra, in pieno relax a bordo di Hathor",
  "A guest reading in an armchair beside the Nile window":
    "Un ospite legge in poltrona accanto alla finestra sul Nilo",
  "A table for two on the open deck of Hathor at sunset":
    "Un tavolo per due sul ponte aperto di Hathor al tramonto",
  "A voyage composed around your itinerary":
    "Un viaggio costruito intorno al Suo itinerario",
  "Accessible Hathor Suite aboard Hathor Dahabiya":
    "Suite accessibile a bordo di Hathor Dahabiya",
  "Amenities sequence — fullscreen intro aboard Hathor":
    "I servizi a bordo di Hathor",
  "Amenities sequence — opening card, fourth photo":
    "Un momento di comfort a bordo di Hathor",
  "Ancient landmarks along the Nile": "Antichi monumenti lungo il Nilo",
  "Breakfast in a Royal Suite aboard Hathor Dahabiya":
    "Colazione in una Royal Suite a bordo di Hathor Dahabiya",
  "Burger menu — right panel photo": "Hathor Dahabiya sul Nilo",
  "Cabin bathroom with Nile view": "Bagno di una cabina con vista sul Nilo",
  "Cabins and suites aboard Hathor Dahabiya":
    "Cabine e suite a bordo di Hathor Dahabiya",
  "Call to action — Hathor Dahabiya on the Nile at golden hour":
    "Hathor Dahabiya sul Nilo all’ora dorata",
  "Candlelit private dining table aboard Hathor Dahabiya":
    "Tavola privata a lume di candela a bordo di Hathor Dahabiya",
  "Dahabiya sailing past ancient Egyptian monuments":
    "Una dahabiya naviga accanto agli antichi monumenti egizi",
  "Dedicated hospitality and service aboard Hathor":
    "Ospitalità e servizio attento a bordo di Hathor",
  "Dining — Celebration panel": "Una cena di festa a bordo di Hathor",
  "Dining — Closing scene": "La fine di una cena a bordo di Hathor",
  "Dining — Course layers": "Le portate di un menu degustazione a bordo di Hathor",
  "Dining — First light plate": "Un piatto servito alla prima luce a bordo di Hathor",
  "Dining — Intro hero": "L’alta cucina a bordo di Hathor",
  "Dining — Lounge panel": "Il salone di Hathor",
  "Dining — Private menu panel": "Un menu privato a bordo di Hathor",
  "Dining — Wine pairing": "Vini in abbinamento a bordo di Hathor",
  "Dinner on the open deck of Hathor at dusk":
    "Cena sul ponte aperto di Hathor al crepuscolo",
  "Evening celebration dining aboard Hathor Dahabiya":
    "Una cena di festa la sera a bordo di Hathor Dahabiya",
  "Fine dining aboard Hathor Dahabiya": "Alta cucina a bordo di Hathor Dahabiya",
  "Fine dining table detail aboard Hathor Dahabiya":
    "Dettaglio di una tavola elegante a bordo di Hathor Dahabiya",
  "Fitness and active wellness aboard Hathor":
    "Fitness e benessere attivo a bordo di Hathor",
  "Guests at the circular bar on the Hathor sun deck at sunset":
    "Ospiti al bar circolare sul ponte sole di Hathor al tramonto",
  "Guests enjoying a Nile sunset moment aboard Hathor Dahabiya":
    "Ospiti al tramonto sul Nilo a bordo di Hathor Dahabiya",
  "Guests served at breakfast in the Hathor restaurant":
    "Ospiti serviti a colazione nel ristorante di Hathor",
  "Guests under the woven pergola on the Hathor sun deck":
    "Ospiti sotto la pergola intrecciata del ponte sole di Hathor",
  "Guests welcomed at the reception desk aboard Hathor":
    "Ospiti accolti alla reception a bordo di Hathor",
  "Hathor Dahabiya blog — stories from the Nile":
    "Il journal di Hathor Dahabiya, storie dal Nilo",
  "Hathor Dahabiya hero video cover": "Hathor Dahabiya in navigazione sul Nilo",
  "Hathor Dahabiya on the Nile": "Hathor Dahabiya sul Nilo",
  "Hathor Dahabiya sailing a luxury Nile cruise between Luxor and Aswan":
    "Hathor Dahabiya in crociera di lusso sul Nilo tra Luxor e Assuan",
  "Hathor Dahabiya sailing on the Nile": "Hathor Dahabiya in navigazione sul Nilo",
  "Hathor Dahabiya sailing the Nile": "Hathor Dahabiya in navigazione sul Nilo",
  "Hathor plated course 1": "Una portata servita a bordo di Hathor",
  "Hathor plated course 2": "Una portata servita a bordo di Hathor",
  "Hathor plated course 3": "Una portata servita a bordo di Hathor",
  "Hathor plated course 4": "Una portata servita a bordo di Hathor",
  "Hathor plated course 5": "Una portata servita a bordo di Hathor",
  "Hathor plated course 6": "Una portata servita a bordo di Hathor",
  "Hathor plated course 7": "Una portata servita a bordo di Hathor",
  "King cabin on the 4-night Luxor to Aswan itinerary":
    "Cabina King sull’itinerario di 4 notti da Luxor ad Assuan",
  "King cabin on the 7-night round-trip itinerary":
    "Cabina King sull’itinerario di 7 notti andata e ritorno",
  "Long table set for a private party aboard Hathor":
    "Una lunga tavola apparecchiata per un evento privato a bordo di Hathor",
  "Luxury Dahabiya cruise on the Nile": "Crociera di lusso in dahabiya sul Nilo",
  "Luxury King Bed cabin aboard Hathor Dahabiya":
    "Cabina Luxury King Bed a bordo di Hathor Dahabiya",
  "Luxury King cabin on the 3-night Aswan to Luxor itinerary":
    "Cabina Luxury King sull’itinerario di 3 notti da Assuan a Luxor",
  "Luxury Nile cruise room aboard Hathor Dahabiya":
    "Cabina di lusso a bordo di Hathor Dahabiya",
  "Luxury Rooms aboard Hathor Dahabiya": "Le Luxury Rooms a bordo di Hathor Dahabiya",
  "Luxury Royal Suites aboard Hathor Dahabiya":
    "Le Luxury Royal Suites a bordo di Hathor Dahabiya",
  "Luxury Suite on the 3-night Aswan to Luxor itinerary":
    "Luxury Suite sull’itinerario di 3 notti da Assuan a Luxor",
  "Luxury Suite on the 4-night Luxor to Aswan itinerary":
    "Luxury Suite sull’itinerario di 4 notti da Luxor ad Assuan",
  "Luxury Suite on the 7-night round-trip itinerary":
    "Luxury Suite sull’itinerario di 7 notti andata e ritorno",
  "Luxury Suites aboard Hathor Dahabiya": "Le Luxury Suites a bordo di Hathor Dahabiya",
  "Luxury Twin Bed cabin aboard Hathor Dahabiya":
    "Cabina Luxury Twin Bed a bordo di Hathor Dahabiya",
  "Luxury Twin cabin on the 3-night Aswan to Luxor itinerary":
    "Cabina Luxury Twin sull’itinerario di 3 notti da Assuan a Luxor",
  "Luxury cabin aboard Hathor Dahabiya": "Cabina di lusso a bordo di Hathor Dahabiya",
  "Luxury cabin bathroom aboard Hathor Dahabiya":
    "Bagno di una cabina di lusso a bordo di Hathor Dahabiya",
  "Luxury cabin interior aboard Hathor Dahabiya":
    "Interno di una cabina di lusso a bordo di Hathor Dahabiya",
  "Luxury cabin with Nile view aboard Hathor Dahabiya":
    "Cabina di lusso con vista sul Nilo a bordo di Hathor Dahabiya",
  "Luxury suite aboard Hathor Dahabiya": "Suite di lusso a bordo di Hathor Dahabiya",
  "Luxury suite aboard Hathor": "Suite di lusso a bordo di Hathor",
  "Luxury suite bathroom aboard Hathor Dahabiya":
    "Bagno di una suite di lusso a bordo di Hathor Dahabiya",
  "Luxury suite bedroom aboard Hathor Dahabiya":
    "Camera da letto di una suite di lusso a bordo di Hathor Dahabiya",
  "Luxury suite bedroom with Nile light":
    "Camera da letto di una suite di lusso nella luce del Nilo",
  "Luxury suite interior aboard Hathor Dahabiya":
    "Interno di una suite di lusso a bordo di Hathor Dahabiya",
  "Luxury suite lounge aboard Hathor Dahabiya":
    "Salotto di una suite di lusso a bordo di Hathor Dahabiya",
  "Master bedroom cabin aboard Hathor Dahabiya":
    "Cabina matrimoniale a bordo di Hathor Dahabiya",
  "Moving tilted card — gastronomy on the Nile": "La gastronomia sul Nilo",
  "Nile Majesty voyage aboard Hathor": "Il viaggio Nile Majesty a bordo di Hathor",
  "Nile chart wallpaper aboard Hathor Dahabiya":
    "Carta da parati con la mappa del Nilo a bordo di Hathor Dahabiya",
  "Ornate interior corridor aboard a luxury Dahabiya":
    "Un corridoio decorato a bordo di una dahabiya di lusso",
  "Private charter on the Hathor Dahabiya": "Charter privato a bordo di Hathor Dahabiya",
  "Private sun deck reserved exclusively for your party":
    "Il ponte sole riservato in esclusiva al Suo gruppo",
  "Royal Suite on the 3-night Aswan to Luxor itinerary":
    "Royal Suite sull’itinerario di 3 notti da Assuan a Luxor",
  "Royal Suite on the 4-night Luxor to Aswan itinerary":
    "Royal Suite sull’itinerario di 4 notti da Luxor ad Assuan",
  "Royal Suite on the 7-night round-trip itinerary":
    "Royal Suite sull’itinerario di 7 notti andata e ritorno",
  "Royal suite aboard Hathor Dahabiya": "Royal Suite a bordo di Hathor Dahabiya",
  "Royal suite bathroom with Nile view": "Bagno della Royal Suite con vista sul Nilo",
  "Royal suite bedroom aboard Hathor Dahabiya":
    "Camera da letto della Royal Suite a bordo di Hathor Dahabiya",
  "Royal suite jacuzzi aboard Hathor Dahabiya":
    "Jacuzzi della Royal Suite a bordo di Hathor Dahabiya",
  "Royal suite living space aboard Hathor Dahabiya":
    "Zona giorno della Royal Suite a bordo di Hathor Dahabiya",
  "Royal suite lounge aboard Hathor Dahabiya":
    "Salotto della Royal Suite a bordo di Hathor Dahabiya",
  "Scenic Nile views from Hathor Dahabiya": "Panorami sul Nilo da Hathor Dahabiya",
  "Seneb Spa wellness aboard Hathor Dahabiya":
    "Benessere alla Seneb Spa a bordo di Hathor Dahabiya",
  "Sun loungers and parasols on the Hathor deck at sunset":
    "Lettini e ombrelloni sul ponte di Hathor al tramonto",
  "Sunset Nile view from a Royal Suite": "Il Nilo al tramonto visto da una Royal Suite",
  "Temple of Hatshepsut": "Tempio di Hatshepsut",
  "The chef at work in the galley aboard Hathor":
    "Lo chef al lavoro nella cucina di bordo di Hathor",
  "The lounge aboard Hathor, sofas and bar counter beside the windows":
    "Il salone di Hathor, con divani e bancone bar accanto alle finestre",
  "The two pools on the Hathor sun deck at golden hour":
    "Le due piscine sul ponte sole di Hathor all’ora dorata",
  "Treadmill, elliptical trainer and bike aboard Hathor, beside the Nile":
    "Tapis roulant, ellittica e cyclette a bordo di Hathor, accanto al Nilo",
  "Twin cabin on the 4-night Luxor to Aswan itinerary":
    "Cabina Twin sull’itinerario di 4 notti da Luxor ad Assuan",
  "Twin cabin on the 7-night round-trip itinerary":
    "Cabina Twin sull’itinerario di 7 notti andata e ritorno",
  "Twin cabin with panoramic Nile window":
    "Cabina Twin con finestra panoramica sul Nilo",
  "Unfinished Obelisk, Aswan": "L’obelisco incompiuto, Assuan",
  "Unhurried sailing rhythm along the Nile": "Navigazione senza fretta lungo il Nilo",
  "Valley of the Kings, Luxor": "La Valle dei Re, Luxor",
  "Wheel portal — Hathor Dahabiya on the Nile at golden hour":
    "Hathor Dahabiya sul Nilo all’ora dorata",
  "Wine and crystal in warm light aboard Hathor":
    "Vino e cristalli nella luce calda a bordo di Hathor",
};

/** A site-image alt in the visitor's language; unknown alts pass through. */
export function siteImageAltIn(locale: PublicLocale, alt: string): string {
  if (locale !== "it") return alt;
  return SITE_IMAGE_ALTS_IT[alt.trim()] ?? alt;
}
