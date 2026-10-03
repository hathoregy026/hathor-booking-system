import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * Italian scheduled sailings (/it/cruises-list): search settings and the
 * structured-data words. Language, hreflang and the search switch come from
 * the shared builder.
 */
export const CRUISES_LIST_SEO_IT: Metadata = buildPageMetadata({
  title: "Date e cabine delle crociere sul Nilo | Hathor Dahabiya",
  description:
    "Consulti le partenze e le cabine disponibili di Hathor Dahabiya: crociere sul Nilo di tre, quattro e sette notti tra Luxor e Assuan.",
  path: "/it/cruises-list",
});

export const CRUISES_LIST_PAGE_IT = {
  name: "Partenze programmate di Hathor | Prenoti una crociera sul Nilo in dahabiya",
  breadcrumbs: [
    { name: "Home", path: "/it" },
    { name: "Viaggi", path: "/it/voyages" },
    { name: "Partenze programmate", path: "/it/cruises-list" },
  ],
} as const;
