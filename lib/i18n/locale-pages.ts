import type { Metadata } from "next";
import { HOME_SEO_IT } from "@/lib/i18n/home-seo";
import { CHARTER_SEO_IT, CHARTER_SEO_TITLE_IT } from "@/lib/i18n/charter-seo-it";
import { CRUISES_LIST_PAGE_IT, CRUISES_LIST_SEO_IT } from "@/lib/i18n/cruises-seo-it";
import type { TranslatedLocale } from "@/lib/i18n/locale";
import { GERMAN_PAGES } from "@/lib/i18n/pages-seo-de";
import { ITALIAN_PAGES } from "@/lib/i18n/pages-seo-it";
import type { LocaleRoomCollection } from "@/lib/i18n/rooms-seo";
import { GERMAN_ROOM_COLLECTIONS } from "@/lib/i18n/rooms-seo-de";
import { ITALIAN_ROOM_COLLECTIONS } from "@/lib/i18n/rooms-seo-it";
import {
  CHARTER_SEO_DE,
  CHARTER_SEO_TITLE_DE,
  CRUISES_LIST_PAGE_DE,
  CRUISES_LIST_SEO_DE,
  HOME_SEO_DE,
} from "@/lib/i18n/site-seo-de";
import type { LocaleVoyagePage, VoyagePageKey } from "@/lib/i18n/voyages-pages";
import { GERMAN_VOYAGE_PAGES } from "@/lib/i18n/voyages-pages-de";
import { ITALIAN_VOYAGE_PAGES } from "@/lib/i18n/voyages-pages-it";
import type { RoomCollectionVariant } from "@/lib/room-collection-editorial";

/**
 * Each added language's search and structured-data words, in one place for the
 * shared route components in components/pages/locale. Server-only.
 */

export const LOCALE_PAGES = { it: ITALIAN_PAGES, de: GERMAN_PAGES } as const;

export const LOCALE_ROOM_COLLECTIONS: Record<
  TranslatedLocale,
  Record<RoomCollectionVariant, LocaleRoomCollection>
> = { it: ITALIAN_ROOM_COLLECTIONS, de: GERMAN_ROOM_COLLECTIONS };

export const LOCALE_VOYAGE_PAGES: Record<TranslatedLocale, Record<VoyagePageKey, LocaleVoyagePage>> = {
  it: ITALIAN_VOYAGE_PAGES,
  de: GERMAN_VOYAGE_PAGES,
};

export const LOCALE_HOME_SEO: Record<TranslatedLocale, Metadata> = {
  it: HOME_SEO_IT,
  de: HOME_SEO_DE,
};

/** The first breadcrumb and structured-data words shared across a language. */
export const LOCALE_CRUMBS: Record<TranslatedLocale, { home: string; journal: string }> = {
  it: { home: "Home", journal: "Journal" },
  de: { home: "Startseite", journal: "Journal" },
};

type CharterSeo = {
  metadata: Metadata;
  title: string;
  crumb: string;
  serviceType: string;
  catalogName: string;
};

export const LOCALE_CHARTER_SEO: Record<TranslatedLocale, CharterSeo> = {
  it: {
    metadata: CHARTER_SEO_IT,
    title: CHARTER_SEO_TITLE_IT,
    crumb: "Charter privato in dahabiya",
    serviceType: "Crociera privata sul Nilo in charter",
    catalogName: "Itinerari del charter privato sul Nilo",
  },
  de: {
    metadata: CHARTER_SEO_DE,
    title: CHARTER_SEO_TITLE_DE,
    crumb: "Privater Dahabiya-Charter",
    serviceType: "Private Nilkreuzfahrt als Charter",
    catalogName: "Routen des Privatcharters auf dem Nil",
  },
};

export const LOCALE_CRUISES_SEO: Record<
  TranslatedLocale,
  {
    metadata: Metadata;
    page: { name: string; breadcrumbs: readonly { name: string; path: string }[] };
  }
> = {
  it: { metadata: CRUISES_LIST_SEO_IT, page: CRUISES_LIST_PAGE_IT },
  de: { metadata: CRUISES_LIST_SEO_DE, page: CRUISES_LIST_PAGE_DE },
};

type RoomPageWords = {
  /** Each room's collection page, for the breadcrumb trail. */
  parents: Record<string, { name: string; path: string }>;
  /** What the room is, in search words, after its product name. */
  kinds: Record<string, string>;
  fallbackKind: string;
  imageAlt: (room: string) => string;
};

export const LOCALE_ROOM_PAGE_WORDS: Record<TranslatedLocale, RoomPageWords> = {
  it: {
    parents: {
      "luxury-king-room": { name: "Cabine", path: "/it/luxury-cabins-Nile-Cruise" },
      "luxury-twin-room": { name: "Cabine", path: "/it/luxury-cabins-Nile-Cruise" },
      "luxury-suite": { name: "Luxury Suite", path: "/it/rooms" },
      "royal-suite": { name: "Royal Suite", path: "/it/royal-suites" },
    },
    kinds: {
      "luxury-king-room": "cabina con vista sul Nilo",
      "luxury-twin-room": "cabina con vista sul Nilo",
      "luxury-suite": "suite con vista sul Nilo",
      "royal-suite": "suite sul ponte principale",
    },
    fallbackKind: "a bordo",
    imageAlt: (room) => `${room} a bordo di Hathor Dahabiya`,
  },
  de: {
    parents: {
      "luxury-king-room": { name: "Kabinen", path: "/de/luxury-cabins-Nile-Cruise" },
      "luxury-twin-room": { name: "Kabinen", path: "/de/luxury-cabins-Nile-Cruise" },
      "luxury-suite": { name: "Luxury Suite", path: "/de/rooms" },
      "royal-suite": { name: "Royal Suite", path: "/de/royal-suites" },
    },
    kinds: {
      "luxury-king-room": "Kabine mit Nilblick",
      "luxury-twin-room": "Kabine mit Nilblick",
      "luxury-suite": "Suite mit Nilblick",
      "royal-suite": "Suite auf dem Hauptdeck",
    },
    fallbackKind: "an Bord",
    imageAlt: (room) => `${room} an Bord der Hathor Dahabiya`,
  },
};

export const LOCALE_SUITES_WORDS: Record<
  TranslatedLocale,
  { pageLabel: string; roomName: string; roomDescription: string }
> = {
  it: {
    pageLabel: "Suite",
    roomName: "Le suite di lusso di Hathor per la crociera sul Nilo",
    roomDescription:
      "Suite con vista sul Nilo a bordo di Hathor Dahabiya, una navigazione di lusso per 32 ospiti tra Luxor e Assuan.",
  },
  de: {
    pageLabel: "Suiten",
    roomName: "Die Luxussuiten der Hathor für die Nilkreuzfahrt",
    roomDescription:
      "Suiten mit Nilblick an Bord der Hathor Dahabiya, einer Luxusfahrt für 32 Gäste zwischen Luxor und Assuan.",
  },
};

export const LOCALE_BLOG_WORDS: Record<TranslatedLocale, { notFound: string }> = {
  it: { notFound: "Articolo non trovato" },
  de: { notFound: "Artikel nicht gefunden" },
};

export const LOCALE_BOOKING_META: Record<
  TranslatedLocale,
  { lookup: { title: string; description: string }; success: { title: string; description: string } }
> = {
  it: {
    lookup: {
      title: "Segua la Sua prenotazione",
      description:
        "Inserisca il codice di prenotazione e l’email usata per ritrovare la Sua richiesta di viaggio a bordo di Hathor Dahabiya.",
    },
    success: {
      title: "Richiesta di prenotazione inviata",
      description:
        "La Sua richiesta di prenotazione per Hathor Dahabiya è stata inviata: qui trova il riepilogo del viaggio e i prossimi passi.",
    },
  },
  de: {
    lookup: {
      title: "Verfolgen Sie Ihre Buchung",
      description:
        "Geben Sie Buchungscode und E-Mail-Adresse ein, um Ihre Reiseanfrage an Bord der Hathor Dahabiya wiederzufinden.",
    },
    success: {
      title: "Buchungsanfrage gesendet",
      description:
        "Ihre Buchungsanfrage für die Hathor Dahabiya wurde gesendet: Hier finden Sie die Zusammenfassung Ihrer Reise und die nächsten Schritte.",
    },
  },
};
