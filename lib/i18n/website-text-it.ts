/**
 * Italian versions of the dashboard ("Website Text") page sections.
 *
 * Each section is translated from the live dashboard copy (SiteSetting
 * "website-text"), not the code defaults, and replaces that section on Italian
 * pages only. Sections are added as their pages are translated; until then a
 * section keeps the dashboard's English. A later step can move these into the
 * dashboard itself, one tab per language.
 */

import type { PublicLocale } from "@/lib/i18n/locale";
import type { WebsiteText } from "@/lib/website-text-shared";

type Pages = WebsiteText["pages"];

const PAGES_IT: Partial<Pages> = {
  cruises: {
    overviewTitle: "Le crociere in dahabiya",
    overviewIntro:
      "Scopra itinerari esclusivi: navigazioni intime, approdi leggendari e un lusso senza compromessi.",
    continueTitle: "Continui a esplorare\na bordo di Hathor",
    continueBody: "Scopra le Luxury Rooms, le Suite, le Royal Suite e la cucina di Hathor Flavors.",
    ctaTitle: "Prenoti il Suo viaggio",
    ctaBody:
      "Scopra itinerari esclusivi: navigazioni intime, approdi leggendari e un lusso senza compromessi.",
  },
  voyages: {
    heroLabel: "I viaggi di Hathor",
    heroSupport:
      "Itinerari privati in dahabiya: navigazioni intime, approdi leggendari e il ritmo senza fretta del fiume.",
    scrollHint: "Scorri per salpare",
    statementLabel: "Lo stile Hathor",
    statementTitle: "Navigare lenti\nScoprire a fondo\nRicordare per sempre",
    statementBody:
      "Ogni viaggio di Hathor è pensato per scoprire senza fretta: templi all’ora dorata, serate illuminate dal tramonto sul fiume ed escursioni a terra su misura per il Suo gruppo.",
    openingScript: "Quattro giorni sul Nilo. Una vita di luce dorata.",
    promiseLabel: "La promessa",
    manifesto: [
      {
        title: "Dimensione intima",
        body: "Poche cabine, mai un hotel galleggiante. Hathor segue la corrente, non la folla.",
      },
      {
        title: "Eleganza tutto incluso",
        body: "Alta cucina, bevande selezionate ed escursioni a terra, parte di ogni navigazione.",
      },
      {
        title: "Ritmo privato",
        body: "I templi quando la luce è quella giusta. Il ponte quando il fiume La invita a restare.",
      },
    ],
    itinerariesLabel: "Scelga la Sua traversata",
    itinerariesTitle: "Il Nilo\nIl Suo ritmo",
    itinerariesBody:
      "Dalle intime traversate di tre notti al giro completo di sette notti, ogni itinerario mantiene la stessa promessa: lusso tutto incluso, escursioni private e un equipaggio che conosce il Nilo a memoria.",
    itineraries: [
      {
        slug: "3-nights-aswan-luxor",
        title: "Da Assuan a Luxor",
        durationLabel: "3 notti / 4 giorni",
        meta: "Assuan → Luxor",
        body: "Una traversata intima da sud a nord: File, Kom Ombo ed Edfu si svelano al passo senza fretta di una dahabiya, fino ai templi di Luxor.",
        cta: "Scopri il viaggio",
      },
      {
        slug: "4-nights-luxor-aswan",
        title: "Da Luxor ad Assuan",
        durationLabel: "4 notti / 5 giorni",
        meta: "Luxor → Assuan",
        body: "Il classico viaggio sul Nilo, dalle rive monumentali di Luxor alla grazia quieta di Assuan: templi, feluche e serate illuminate dal tramonto sul fiume.",
        cta: "Scopri il viaggio",
      },
      {
        slug: "7-nights-luxor-aswan-luxor",
        title: "Da Luxor ad Assuan e ritorno",
        durationLabel: "7 notti / 8 giorni",
        meta: "Luxor → Assuan → Luxor",
        body: "Il circuito completo del Nilo tra Luxor e Assuan: tempo per i templi, per la luce del fiume e per giornate più tranquille a bordo di Hathor.",
        cta: "Scopri il viaggio",
      },
      {
        slug: "nile-majesty",
        title: "Nile Majesty",
        durationLabel: "Charter privato",
        meta: "Itinerario su misura",
        body: "Il charter privato riserva Hathor in esclusiva al Suo gruppo, con la libertà di modellare itinerario, cucina ed escursioni a terra su misura per Lei.",
        cta: "Scopri il charter",
      },
    ],
    charterLabel: "Charter privato",
    charterTitle: "Il Suo fiume\nIl Suo ritmo",
    charterScript: "Il Suo fiume. Il Suo ritmo. Tutto per Lei.",
    charterBody:
      "Il charter privato riserva Hathor in esclusiva al Suo gruppo, con la libertà di modellare il viaggio secondo il ritmo, la cucina e le escursioni a terra che preferisce.",
    charterCta: "Scopri il charter",
    reserveLabel: "Inizi il Suo viaggio",
    ctaTitle: "Prenoti il Suo viaggio",
    ctaBody: "Scelga l’itinerario, selezioni la Sua suite e salga a bordo di Hathor.",
    ctaPrimary: "Prenota ora",
    ctaSecondary: "Partenze programmate",
  },
};

const PAGES_BY_LOCALE: Record<PublicLocale, Partial<Pages>> = {
  en: {},
  it: PAGES_IT,
};

/** The dashboard text for a language: its translated sections over the live English. */
export function localizeWebsiteText(text: WebsiteText, locale: PublicLocale): WebsiteText {
  const pages = PAGES_BY_LOCALE[locale];
  if (!Object.keys(pages).length) return text;
  return { ...text, pages: { ...text.pages, ...pages } };
}
