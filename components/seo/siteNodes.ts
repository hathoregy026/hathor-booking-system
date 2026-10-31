import { indexedSiteLanguages, type PublicLocale } from "@/lib/i18n/locale";
import {
  SEO_BRAND_NAME,
  SEO_CONTACT,
  SEO_LEGAL_NAME,
  SEO_LOGO_PATH,
  SEO_PLACE_WORDS,
  SEO_SITE_NAME,
  SEO_SOCIAL_URLS,
  seoAbsoluteUrl,
} from "@/lib/seo/site";

export function organizationNode(locale: PublicLocale = "en") {
  const origin = seoAbsoluteUrl("/");
  const place = SEO_PLACE_WORDS[locale];
  return {
    "@type": ["Organization", "TravelAgency"],
    "@id": `${origin}#organization`,
    name: SEO_BRAND_NAME,
    legalName: SEO_LEGAL_NAME,
    alternateName: ["Hathor Cruise", SEO_LEGAL_NAME],
    url: origin,
    email: SEO_CONTACT.email,
    telephone: SEO_CONTACT.telephone,
    logo: seoAbsoluteUrl(SEO_LOGO_PATH),
    image: seoAbsoluteUrl("/media/hathor/home-hero-poster.webp"),
    address: {
      "@type": "PostalAddress",
      streetAddress: place.streetAddress,
      addressLocality: place.addressLocality,
      addressCountry: SEO_CONTACT.addressCountry,
    },
    areaServed: { "@type": "Country", name: place.country },
    sameAs: SEO_SOCIAL_URLS,
  };
}

export function websiteNode() {
  const origin = seoAbsoluteUrl("/");
  return {
    "@type": "WebSite",
    "@id": `${origin}#website`,
    url: origin,
    name: SEO_SITE_NAME,
    /* Every language open to search ("en" alone until one is switched on). */
    inLanguage: indexedSiteLanguages(),
    publisher: { "@id": `${origin}#organization` },
  };
}
