import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";

/**
 * Italian private charter (/it/charter): search settings and structured-data
 * words. Language, hreflang and the search switch come from the shared builder.
 */
export const CHARTER_SEO_TITLE_IT =
  "Charter privato in dahabiya | Crociera privata sul Nilo | Hathor";

export const CHARTER_SEO_IT: Metadata = buildPageMetadata({
  title: CHARTER_SEO_TITLE_IT,
  description:
    "Noleggi in esclusiva una dahabiya di lusso: tutta Hathor per un massimo di 32 ospiti, con equipaggio e chef dedicati, per una crociera privata sul Nilo da Luxor ad Assuan.",
  path: "/it/charter",
  image: {
    url: "/media/hathor/r2/charter-hero.webp",
    width: 1920,
    height: 1280,
    alt: "Charter privato di Hathor Dahabiya in navigazione sul Nilo, in Egitto",
  },
});
