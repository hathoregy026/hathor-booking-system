import type { Metadata } from "next";

const TITLE = "Pagina non trovata | Hathor Dahabiya";
const DESCRIPTION =
  "L’indirizzo che ha aperto non esiste o è stato spostato. Torni alla pagina iniziale di Hathor Dahabiya o scelga il Suo viaggio sul Nilo.";

/**
 * Metadata for the Italian 404. Used by the 404 itself and by the /it
 * catch-all route, whose metadata Next shows once the page has hydrated.
 */
export const NOT_FOUND_METADATA_IT: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  openGraph: { title: TITLE, description: DESCRIPTION, locale: "it_IT" },
  twitter: { title: TITLE, description: DESCRIPTION },
};
