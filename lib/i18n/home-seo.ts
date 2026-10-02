import type { Metadata } from "next";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { buildPageMetadata } from "@/lib/seo/metadata";

/*
 * The Italian homepage stays out of search until the full SEO pass: noindex,
 * no sitemap entry, no hreflang. The canonical still names its own address.
 */
const HOME_SEO_IT_BASE = buildPageMetadata({
  title: "Crociera di lusso sul Nilo in dahabiya | Hathor Dahabiya",
  description:
    "Navighi sul Nilo tra Luxor e Assuan a bordo di una dahabiya privata di lusso. 32 ospiti, suite vista Nilo, alta cucina e giornate tra i templi, senza fretta.",
  path: "/it",
  index: false,
  image: {
    url: HATHOR_HERO_POSTER_SRC,
    width: 1920,
    height: 1080,
    alt: "Hathor Dahabiya, una crociera di lusso in dahabiya sul Nilo tra Luxor e Assuan",
  },
});

export const HOME_SEO_IT: Metadata = {
  ...HOME_SEO_IT_BASE,
  keywords: undefined,
  openGraph: { ...HOME_SEO_IT_BASE.openGraph, locale: "it_IT" },
};
