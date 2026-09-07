import { JsonLd } from "@/components/seo/JsonLd";
import { SEO_LOGO_PATH } from "@/lib/seo/site";
import {
  SEO_BRAND_NAME,
  SEO_CONTACT,
  SEO_LEGAL_NAME,
  SEO_SITE_NAME,
  SEO_SOCIAL_URLS,
  seoAbsoluteUrl,
} from "@/lib/seo/site";

export function organizationNode() {
  const origin = seoAbsoluteUrl("/");
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
      streetAddress: SEO_CONTACT.streetAddress,
      addressLocality: SEO_CONTACT.addressLocality,
      addressCountry: SEO_CONTACT.addressCountry,
    },
    areaServed: { "@type": "Country", name: "Egypt" },
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
    inLanguage: "en",
    publisher: { "@id": `${origin}#organization` },
  };
}

export function SiteStructuredData() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@graph": [organizationNode(), websiteNode()],
      }}
    />
  );
}
