/**
 * The site's system screens in every public language: the page-hidden and
 * site-hidden placeholders, and the translated error screens. English has no
 * error screen of its own here: Next's default still serves it.
 */

import type { PublicLocale, TranslatedLocale } from "@/lib/i18n/locale";

export const COMING_SOON_COPY: Record<PublicLocale, string> = {
  en: "Coming Soon",
  it: "Prossimamente",
  de: "Demnächst",
};

type ErrorCopy = {
  pageTitle: string;
  eyebrow: string;
  title: string;
  lede: string;
  retry: string;
  home: string;
  reference: string;
};

export const ERROR_COPY: Record<TranslatedLocale, ErrorCopy> = {
  it: {
    pageTitle: "Si è verificato un problema | Hathor Dahabiya",
    eyebrow: "Hathor Dahabiya",
    title: "Si è verificato un problema",
    lede: "Non è stato possibile caricare questa pagina. Riprovi tra qualche istante o torni alla pagina iniziale. Se il problema persiste, ci scriva a",
    retry: "Riprova",
    home: "Torna alla home",
    reference: "Riferimento:",
  },
  de: {
    pageTitle: "Es ist ein Problem aufgetreten | Hathor Dahabiya",
    eyebrow: "Hathor Dahabiya",
    title: "Es ist ein Problem aufgetreten",
    lede: "Diese Seite konnte nicht geladen werden. Bitte versuchen Sie es in einigen Augenblicken erneut oder kehren Sie zur Startseite zurück. Besteht das Problem weiterhin, schreiben Sie uns an",
    retry: "Erneut versuchen",
    home: "Zur Startseite",
    reference: "Referenz:",
  },
};
