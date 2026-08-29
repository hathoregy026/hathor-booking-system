import {
  TERMS_CANONICAL_PATH,
  TERMS_PRODUCTION_URL,
} from "@/lib/terms-and-conditions-content";

const PAGE_TITLE = "Hathor Dahabiya Terms & Conditions | Booking Policies";
const PAGE_DESCRIPTION =
  "Read Hathor Dahabiya's booking, payment, cancellation, inclusions, guest responsibilities and travel policies for Nile voyages between Luxor and Aswan.";

export function TermsStructuredData() {
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${TERMS_PRODUCTION_URL}#webpage`,
    url: TERMS_PRODUCTION_URL,
    name: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    inLanguage: "en",
    isPartOf: {
      "@type": "WebSite",
      "@id": "https://www.hathorcruise.com/#website",
      url: "https://www.hathorcruise.com/",
      name: "Hathor Dahabiya",
    },
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.hathorcruise.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Terms & Conditions",
        item: TERMS_PRODUCTION_URL,
      },
    ],
  };

  const payload = [webPage, breadcrumb];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

export const termsPageMetadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  canonicalPath: TERMS_CANONICAL_PATH,
} as const;
