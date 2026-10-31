/**
 * The site's system screens in every public language: the page-hidden and
 * site-hidden placeholders, and the Italian 404 and error screens. English
 * has no 404 or error screen of its own here: Next's defaults still serve it.
 */

import type { PublicLocale } from "@/lib/i18n/locale";

export const COMING_SOON_COPY: Record<PublicLocale, string> = {
  en: "Coming Soon",
  it: "Prossimamente",
};

export const NOT_FOUND_COPY_IT = {
  eyebrow: "Errore 404",
  title: "Pagina non trovata",
  lede: "La pagina che cerca non esiste o è stata spostata. Può tornare alla pagina iniziale o scegliere il Suo viaggio sul Nilo.",
  home: "Torna alla home",
  voyages: "Scopri i viaggi",
};

export const ERROR_COPY_IT = {
  pageTitle: "Si è verificato un problema | Hathor Dahabiya",
  eyebrow: "Hathor Dahabiya",
  title: "Si è verificato un problema",
  lede: "Non è stato possibile caricare questa pagina. Riprovi tra qualche istante o torni alla pagina iniziale. Se il problema persiste, ci scriva a",
  retry: "Riprova",
  home: "Torna alla home",
  reference: "Riferimento:",
};
