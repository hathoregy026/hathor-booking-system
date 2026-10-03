/**
 * Words in the site chrome — header, menu, phone dock, floating actions,
 * footer and the save / My Voyage controls — in every public language.
 *
 * English is the live copy, word for word. Italian uses the formal register
 * ("Lei") in sentences; short buttons keep the usual Italian web form
 * ("Prenota ora"). Product names stay in English: Hathor, Dahabiya, Seneb Spa,
 * Luxury Suite, Royal Suite.
 */

import { localizedHref, type PublicLocale } from "@/lib/i18n/locale";
import { PUBLIC_CONTACT } from "@/lib/public-contact";
import type { HeaderNavItem } from "@/lib/public-nav";

type Link = { href: string; label: string };

export type ChromeCopy = {
  nav: {
    /** Group labels by group id; link labels and descriptions by href. */
    groups: Record<string, string>;
    links: Record<string, { label: string; description?: string }>;
  };
  header: {
    openMenu: string;
    closeMenu: string;
    phoneTools: string;
    showGroupPages: (group: string) => string;
    groupPages: (group: string) => string;
  };
  menu: {
    kicker: string;
    siteMenu: string;
    primary: string;
    closeMenu: string;
    privacy: string;
    terms: string;
    bookNow: string;
  };
  language: {
    eyebrow: string;
    /** The two-letter mark on the toggle. */
    code: string;
    activeName: string;
    names: Record<"AR" | "EN" | "DE" | "IT" | "RU", string>;
    comingSoon: (name: string) => string;
    toggleLabel: (active: string) => string;
    closeMenu: string;
  };
  hero: {
    discover: string;
    scrollHint: string;
    location: readonly [string, string];
    playFilm: string;
    pauseFilm: string;
    filmAlt: string;
    /** Hero CTA when a page does not set its own. Null keeps the page's default. */
    bookNow: string | null;
  };
  contact: {
    bookNow: string;
    contact: string;
    openLinks: string;
    closeLinks: string;
    call: (phone: string) => string;
  };
  selection: {
    save: string;
    saved: string;
    saveLabel: (name: string) => string;
    savedLabel: (name: string) => string;
    addToVoyage: string;
    inVoyage: string;
    addToVoyageLabel: (name: string) => string;
    inVoyageLabel: (name: string) => string;
    myFavorites: string;
    myVoyage: string;
    favoritesCount: (count: number) => string;
    voyageCount: (count: number) => string;
  };
  footer: {
    titleLines: readonly [string, string];
    script: string;
    eyebrow: string;
    bookNow: string;
    charter: string;
    address: string;
    workingHours: string;
    columns: readonly { id: string; title: string; links: readonly Link[] }[];
    utility: readonly Link[];
    utilityLabel: string;
    country: string;
    backToTop: string;
  };
};

const EN: ChromeCopy = {
  nav: { groups: {}, links: {} },
  header: {
    openMenu: "Open menu",
    closeMenu: "Close menu",
    phoneTools: "Phone tools",
    showGroupPages: (group) => `Show ${group} pages`,
    groupPages: (group) => `${group} pages`,
  },
  menu: {
    kicker: "Luxury voyages on the Nile",
    siteMenu: "Site menu",
    primary: "Primary",
    closeMenu: "Close menu",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
    bookNow: "Book Now",
  },
  language: {
    eyebrow: "Language",
    code: "En",
    activeName: "English",
    names: {
      AR: "Arabic",
      EN: "English",
      DE: "German",
      /* A live language is always named in itself, so its speakers find it. */
      IT: "Italiano",
      RU: "Russian",
    },
    comingSoon: (name) => `${name} — coming soon`,
    toggleLabel: (active) => `Language: ${active}. Choose a language`,
    closeMenu: "Close language menu",
  },
  hero: {
    discover: "Enter the extraordinary",
    scrollHint: "Scroll",
    location: ["LUXOR", "ASWAN"],
    playFilm: "Play background film",
    pauseFilm: "Pause background film",
    filmAlt: "Hathor Dahabiya sailing on the Nile",
    bookNow: null,
  },
  contact: {
    bookNow: "Book now",
    contact: "Contact",
    openLinks: "Open contact links",
    closeLinks: "Close contact links",
    call: (phone) => `Call ${phone}`,
  },
  selection: {
    save: "Save",
    saved: "Saved",
    saveLabel: (name) => `Save ${name} to Favorites`,
    savedLabel: (name) => `Saved — remove ${name} from Favorites`,
    addToVoyage: "Add to My Voyage",
    inVoyage: "In My Voyage",
    addToVoyageLabel: (name) => `Add ${name} to My Voyage`,
    inVoyageLabel: (name) => `${name} is in My Voyage`,
    myFavorites: "My Favorites",
    myVoyage: "My Voyage",
    favoritesCount: (count) =>
      count > 0
        ? `My Favorites, ${count} saved`
        : "My Favorites, nothing saved yet",
    voyageCount: (count) =>
      count > 0
        ? `My Voyage, ${count} ${count === 1 ? "selection" : "selections"}`
        : "My Voyage, nothing selected yet",
  },
  footer: {
    titleLines: ["YOUR NILE STORY", "BEGINS HERE"],
    script: "Adventures the Nile",
    eyebrow: "Private Reservations",
    bookNow: "Book Now",
    charter: "Charter the Boat",
    address: PUBLIC_CONTACT.address,
    workingHours: PUBLIC_CONTACT.workingHours,
    columns: [
      {
        id: "explore",
        title: "Explore",
        links: [
          { href: "/cruises-list", label: "Cruises" },
          { href: "/suites", label: "Suites" },
          { href: "/luxury-cabins-Nile-Cruise", label: "Cabins" },
          { href: "/charter", label: "Private Charter" },
        ],
      },
      {
        id: "aboard",
        title: "Aboard",
        links: [
          { href: "/gastronomy", label: "Gastronomy" },
          { href: "/wellness", label: "Seneb Spa" },
          { href: "/royal-suites", label: "Royal Suites" },
          { href: "/about", label: "About" },
        ],
      },
      {
        id: "route",
        title: "Route",
        links: [
          { href: "/voyages", label: "All Voyages" },
          { href: "/voyages/luxor-to-aswan", label: "Luxor to Aswan" },
          { href: "/voyages/aswan-to-luxor", label: "Aswan to Luxor" },
          { href: "/highlights", label: "Highlights" },
        ],
      },
    ],
    utility: [
      { href: "/contact", label: "Contact" },
      { href: "/blogs", label: "Journal" },
      { href: "/partners", label: "Partners" },
      { href: "/terms-and-conditions", label: "Terms" },
    ],
    utilityLabel: "Legal and contact",
    country: "Egypt",
    backToTop: "Back to top of page",
  },
};

const IT: ChromeCopy = {
  nav: {
    groups: {
      suites: "Suite",
      cruises: "Crociere",
      experiences: "Esperienze",
      about: "Chi siamo",
    },
    links: {
      "/": { label: "Home" },
      "/suites": {
        label: "Suite",
        description: "Rifugi di lusso a bordo di Hathor",
      },
      "/luxury-cabins-Nile-Cruise": {
        label: "Camere di lusso",
        description: "Cabine vista Nilo, di un’eleganza discreta",
      },
      "/rooms": {
        label: "Luxury Suite",
        description: "Ampi spazi sul ponte",
      },
      "/royal-suites": {
        label: "Royal Suite",
        description: "Le nostre stanze più belle sul Nilo",
      },
      "/voyages": {
        label: "Crociere",
        description: "Itinerari privati in dahabiya sul Nilo",
      },
      "/cruises-list": {
        label: "Partenze programmate",
        description: "Si unisca a una navigazione sul Nilo",
      },
      "/charter": {
        label: "Charter privato",
        description: "La dahabiya, tutta per Lei",
      },
      "/highlights": {
        label: "Da non perdere",
        description: "Meraviglie antiche lungo il fiume",
      },
      "/wellness": {
        label: "Benessere e spa",
        description: "Seneb Spa — un’oasi galleggiante",
      },
      "/gastronomy": {
        label: "Gastronomia",
        description: "Alta cucina sull’acqua",
      },
      "/about": {
        label: "La nostra storia",
        description: "Benvenuti a bordo di Hathor",
      },
      "/partners": {
        label: "Partner",
        description: "Chi naviga con noi",
      },
      "/blogs": { label: "Journal" },
      "/contact": { label: "Contatti" },
    },
  },
  header: {
    openMenu: "Apri il menu",
    closeMenu: "Chiudi il menu",
    phoneTools: "Strumenti",
    showGroupPages: (group) => `Mostra le pagine ${group}`,
    groupPages: (group) => `Pagine ${group}`,
  },
  menu: {
    kicker: "Viaggi di lusso sul Nilo",
    siteMenu: "Menu del sito",
    primary: "Principale",
    closeMenu: "Chiudi il menu",
    privacy: "Privacy",
    terms: "Termini e condizioni",
    bookNow: "Prenota ora",
  },
  language: {
    eyebrow: "Lingua",
    code: "It",
    activeName: "Italiano",
    names: {
      AR: "Arabo",
      EN: "English",
      DE: "Tedesco",
      IT: "Italiano",
      RU: "Russo",
    },
    comingSoon: (name) => `${name} — in arrivo`,
    toggleLabel: (active) => `Lingua: ${active}. Scelga una lingua`,
    closeMenu: "Chiudi il menu delle lingue",
  },
  hero: {
    discover: "Scopra lo straordinario",
    scrollHint: "Scorri",
    location: ["LUXOR", "ASSUAN"],
    playFilm: "Riproduci il filmato",
    pauseFilm: "Metti in pausa il filmato",
    filmAlt: "Hathor Dahabiya in navigazione sul Nilo",
    bookNow: "Prenota ora",
  },
  contact: {
    bookNow: "Prenota ora",
    contact: "Contatti",
    openLinks: "Apri i contatti",
    closeLinks: "Chiudi i contatti",
    call: (phone) => `Chiama il ${phone}`,
  },
  selection: {
    save: "Salva",
    saved: "Salvato",
    saveLabel: (name) => `Salva ${name} nei preferiti`,
    savedLabel: (name) => `Salvato — rimuovi ${name} dai preferiti`,
    /* Short form: it shares one button row with Save, Book now and Voyages. */
    addToVoyage: "Aggiungi al viaggio",
    inVoyage: "Nel mio viaggio",
    addToVoyageLabel: (name) => `Aggiungi ${name} al mio viaggio`,
    inVoyageLabel: (name) => `${name} è nel mio viaggio`,
    myFavorites: "I miei preferiti",
    myVoyage: "Il mio viaggio",
    favoritesCount: (count) =>
      count > 0
        ? `I miei preferiti, ${count} ${count === 1 ? "salvato" : "salvati"}`
        : "I miei preferiti, ancora nessun elemento salvato",
    voyageCount: (count) =>
      count > 0
        ? `Il mio viaggio, ${count} ${count === 1 ? "selezione" : "selezioni"}`
        : "Il mio viaggio, ancora nessuna selezione",
  },
  footer: {
    /* Short enough for a phone: "LA SUA STORIA SUL NILO" ran off the screen. */
    titleLines: ["IL SUO NILO", "INIZIA QUI"],
    script: "Avventure sul Nilo",
    eyebrow: "Prenotazioni private",
    bookNow: "Prenota ora",
    charter: "Noleggia la dahabiya",
    address:
      "One Kattamiya, Torre 211, 11º piano, int. 111, Ring Road, Il Cairo, Egitto",
    workingHours: "Orari: tutti i giorni 09:00 – 17:00",
    columns: [
      {
        id: "explore",
        title: "Esplora",
        links: [
          { href: "/cruises-list", label: "Crociere" },
          { href: "/suites", label: "Suite" },
          { href: "/luxury-cabins-Nile-Cruise", label: "Cabine" },
          { href: "/charter", label: "Charter privato" },
        ],
      },
      {
        id: "aboard",
        title: "A bordo",
        links: [
          { href: "/gastronomy", label: "Gastronomia" },
          { href: "/wellness", label: "Seneb Spa" },
          { href: "/royal-suites", label: "Royal Suite" },
          { href: "/about", label: "Chi siamo" },
        ],
      },
      {
        id: "route",
        title: "Rotta",
        links: [
          { href: "/voyages", label: "Tutti i viaggi" },
          { href: "/voyages/luxor-to-aswan", label: "Da Luxor ad Assuan" },
          { href: "/voyages/aswan-to-luxor", label: "Da Assuan a Luxor" },
          { href: "/highlights", label: "Da non perdere" },
        ],
      },
    ],
    utility: [
      { href: "/contact", label: "Contatti" },
      { href: "/blogs", label: "Journal" },
      { href: "/partners", label: "Partner" },
      { href: "/terms-and-conditions", label: "Condizioni" },
    ],
    utilityLabel: "Note legali e contatti",
    country: "Egitto",
    backToTop: "Torna all’inizio della pagina",
  },
};

export const CHROME_COPY: Record<PublicLocale, ChromeCopy> = { en: EN, it: IT };

/**
 * The header / menu entries in a language: translated labels, and links that
 * stay in that language wherever the page exists in it. English passes
 * through untouched.
 */
export function localizeNavItems(
  items: readonly HeaderNavItem[],
  locale: PublicLocale,
): HeaderNavItem[] {
  if (locale === "en") return [...items];
  const { groups, links } = CHROME_COPY[locale].nav;
  return items.map((item) => {
    if (item.type === "link") {
      return {
        ...item,
        href: localizedHref(item.href, locale),
        label: links[item.href]?.label ?? item.label,
      };
    }
    return {
      ...item,
      href: localizedHref(item.href, locale),
      label: groups[item.id] ?? item.label,
      links: item.links.map((link) => ({
        ...link,
        href: localizedHref(link.href, locale),
        label: links[link.href]?.label ?? link.label,
        description: links[link.href]?.description ?? link.description,
      })),
    };
  });
}
