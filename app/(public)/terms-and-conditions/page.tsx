import type { Metadata } from "next";
import { TermsAndConditionsPageContent } from "@/components/pages/TermsAndConditionsPageContent";
import {
  TermsStructuredData,
  termsPageMetadata,
} from "@/components/seo/TermsStructuredData";
import {
  hreflangAlternates,
  pageLanguageVersions,
  PUBLIC_LOCALE_OG,
} from "@/lib/i18n/locale";
import "../../terms-and-conditions-editorial.css";
import "../../editorial-chrome.css";

/* The page's other language versions, for hreflang and og:locale:alternate. */
const languages = hreflangAlternates(termsPageMetadata.canonicalPath);
const alternateLocale = pageLanguageVersions(termsPageMetadata.canonicalPath)
  .filter((version) => version.locale !== "en")
  .map((version) => PUBLIC_LOCALE_OG[version.locale]);

export const metadata: Metadata = {
  title: {
    absolute: termsPageMetadata.title,
  },
  description: termsPageMetadata.description,
  alternates: {
    canonical: termsPageMetadata.canonicalPath,
    ...(languages ? { languages } : {}),
  },
  openGraph: {
    title: termsPageMetadata.title,
    description: termsPageMetadata.description,
    type: "website",
    url: termsPageMetadata.canonicalPath,
    ...(alternateLocale.length ? { alternateLocale } : {}),
  },
  twitter: {
    card: "summary",
    title: termsPageMetadata.title,
    description: termsPageMetadata.description,
  },
};

export default function TermsAndConditionsPage() {
  return (
    <>
      <TermsStructuredData />
      <TermsAndConditionsPageContent />
    </>
  );
}
