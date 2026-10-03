import type { Metadata } from "next";
import { HATHOR_HERO_POSTER_SRC } from "@/lib/branding";
import { buildPageMetadata } from "@/lib/seo/metadata";

/*
 * The Italian homepage. Language, hreflang, og:locale and the search switch
 * (LOCALE_INDEXED in lib/i18n/locale.ts) all come from the shared builder.
 * Title leads with the Italian head term, "crociera sul Nilo".
 */
export const HOME_SEO_IT: Metadata = buildPageMetadata({
  title: "Crociera sul Nilo in dahabiya di lusso | Hathor Dahabiya",
  description:
    "Crociera sul Nilo in dahabiya privata di lusso tra Luxor e Assuan: 32 ospiti, suite vista Nilo, alta cucina e visite ai templi senza fretta, a bordo di Hathor.",
  path: "/it",
  image: {
    url: HATHOR_HERO_POSTER_SRC,
    width: 1920,
    height: 1080,
    alt: "Hathor Dahabiya, crociera di lusso in dahabiya sul Nilo tra Luxor e Assuan",
  },
});
