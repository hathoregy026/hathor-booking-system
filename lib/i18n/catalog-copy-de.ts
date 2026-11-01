/** German catalog words; see lib/i18n/catalog-copy.ts for how they are used. */
import type { AmenityCaption } from "@/lib/i18n/catalog-copy";

export const VOYAGE_NAMES_DE: Record<string, string> = {
  "3-nights-aswan-luxor": "3 Nächte / 4 Tage — von Assuan nach Luxor",
  "4-nights-luxor-aswan": "4 Nächte / 5 Tage — von Luxor nach Assuan",
  "7-nights-luxor-aswan-luxor": "7 Nächte / 8 Tage — von Luxor nach Assuan und zurück",
  "nile-majesty": "Privatcharter — Nile Majesty",
};

export const PLACES_DE: Record<string, string> = { Aswan: "Assuan", Cairo: "Kairo" };

export const WEEKDAYS_DE: Record<string, string> = {
  Monday: "Montag",
  Tuesday: "Dienstag",
  Wednesday: "Mittwoch",
  Thursday: "Donnerstag",
  Friday: "Freitag",
  Saturday: "Samstag",
  Sunday: "Sonntag",
};

export const AMENITIES_DE: Record<string, string> = {
  "LED Satellite Screen": "LED-Bildschirm mit Satellitenempfang",
  "Bathtub or Walk-In Shower": "Badewanne oder begehbare Dusche",
  "Safe box": "Safe",
  "Tea & Coffee Facilities": "Tee- und Kaffeezubereitung",
  Telephone: "Telefon",
  "High-Speed Internet Access": "Highspeed-Internet",
  "All cabins are non-smoking areas": "Alle Kabinen sind Nichtraucherkabinen",
  "Panoramic Nile view": "Panoramablick auf den Nil",
  "22 Square Metres": "22 Quadratmeter",
  Minibar: "Minibar",
  "Laundry Service": "Wäscheservice",
  "Smart System": "Smart-System",
  "Doctor On Call": "Arzt auf Abruf",
  "Room Service": "Zimmerservice",
  "Air Conditioner": "Klimaanlage",
  "Hair Dryer": "Haartrockner",
  "Jacuzzi & dual toilets": "Jacuzzi und zwei Toiletten",
  "Hair dryer & mini bar": "Haartrockner und Minibar",
  "Smart entertainment system": "Smart-Entertainment-System",
  "Room & laundry service": "Zimmer- und Wäscheservice",
  "Air conditioning & high-speed Wi-Fi": "Klimaanlage und schnelles WLAN",
  "Jacuzzi & two luxurious bathrooms": "Jacuzzi und zwei luxuriöse Badezimmer",
  "Coffee machine, mini bar, air conditioning": "Kaffeemaschine, Minibar, Klimaanlage",
};

export const AMENITY_KIND_CAPTIONS_DE: Record<string, AmenityCaption> = {
  screen: { wide: "TV", tight: "TV" },
  bath: { wide: "Bad / Dusche", tight: "Bad" },
  safe: { wide: "Safe", tight: "Safe" },
  coffee: { wide: "Tee und Kaffee", tight: "Kaffee" },
  wifi: { wide: "WLAN", tight: "WLAN" },
  phone: { wide: "Telefon", tight: "Telefon" },
  minibar: { wide: "Minibar", tight: "Minibar" },
  laundry: { wide: "Wäscheservice", tight: "Wäsche" },
  smart: { wide: "Smart-Steuerung", tight: "Smart" },
  doctor: { wide: "Arzt", tight: "Arzt" },
  service: { wide: "Zimmerservice", tight: "Service" },
  ac: { wide: "Klimaanlage", tight: "Klima" },
  hair: { wide: "Haartrockner", tight: "Föhn" },
  view: { wide: "Nilblick", tight: "Nilblick" },
  jacuzzi: { wide: "Jacuzzi", tight: "Jacuzzi" },
  smoke: { wide: "Nichtraucher", tight: "Rauchfrei" },
  space: { wide: "Wohnfläche", tight: "Fläche" },
  default: { wide: "", tight: "" },
};

export const AMENITY_CAPTION_OVERRIDES_DE: Record<string, AmenityCaption> = {
  "jacuzzi & dual toilets": { wide: "Jacuzzi und 2 WCs", tight: "Jacuzzi, WC" },
  "jacuzzi & two luxurious bathrooms": { wide: "Jacuzzi und Bäder", tight: "Jacuzzi, Bad" },
  "hair dryer & mini bar": { wide: "Föhn und Minibar", tight: "Föhn, Bar" },
  "smart entertainment system": { wide: "Smart-System", tight: "Smart" },
  "room & laundry service": { wide: "Zimmer und Wäsche", tight: "Wäsche" },
  "air conditioning & high-speed wi-fi": { wide: "Klima und WLAN", tight: "Klima, WLAN" },
  "coffee machine, mini bar, air conditioning": {
    wide: "Kaffee · Bar · Klima",
    tight: "Kaffee, Bar",
  },
};
