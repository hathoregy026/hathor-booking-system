import type { Metadata } from "next";
import { PUBLIC_LOCALE_OG, type TranslatedLocale } from "@/lib/i18n/locale";

export type NotFoundCopy = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lede: string;
  home: string;
  voyages: string;
};

export const NOT_FOUND_COPY: Record<TranslatedLocale, NotFoundCopy> = {
  it: {
    metaTitle: "Pagina non trovata | Hathor Dahabiya",
    metaDescription:
      "L’indirizzo che ha aperto non esiste o è stato spostato. Torni alla pagina iniziale di Hathor Dahabiya o scelga il Suo viaggio sul Nilo.",
    eyebrow: "Errore 404",
    title: "Pagina non trovata",
    lede: "L’indirizzo che ha aperto non esiste o è stato spostato. Può tornare alla pagina iniziale o scegliere il Suo viaggio sul Nilo.",
    home: "Pagina iniziale",
    voyages: "I viaggi",
  },
  de: {
    metaTitle: "Seite nicht gefunden | Hathor Dahabiya",
    metaDescription:
      "Die aufgerufene Adresse existiert nicht oder wurde verschoben. Kehren Sie zur Startseite der Hathor Dahabiya zurück oder wählen Sie Ihre Nilreise.",
    eyebrow: "Fehler 404",
    title: "Seite nicht gefunden",
    lede: "Die aufgerufene Adresse existiert nicht oder wurde verschoben. Sie können zur Startseite zurückkehren oder Ihre Nilreise wählen.",
    home: "Startseite",
    voyages: "Die Reisen",
  },
};

/**
 * Metadata for a language's 404. Used by the 404 itself and by the language's
 * catch-all route, whose metadata Next shows once the page has hydrated.
 */
export function notFoundMetadata(locale: TranslatedLocale): Metadata {
  const { metaTitle: title, metaDescription: description } = NOT_FOUND_COPY[locale];
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: true },
    openGraph: { title, description, locale: PUBLIC_LOCALE_OG[locale] },
    twitter: { title, description },
  };
}
