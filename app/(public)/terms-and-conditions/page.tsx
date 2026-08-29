import type { Metadata } from "next";
import { TermsAndConditionsPageContent } from "@/components/pages/TermsAndConditionsPageContent";
import {
  TermsStructuredData,
  termsPageMetadata,
} from "@/components/seo/TermsStructuredData";
import "../../terms-and-conditions-editorial.css";
import "../../editorial-chrome.css";

export const metadata: Metadata = {
  title: {
    absolute: termsPageMetadata.title,
  },
  description: termsPageMetadata.description,
  alternates: {
    canonical: termsPageMetadata.canonicalPath,
  },
  openGraph: {
    title: termsPageMetadata.title,
    description: termsPageMetadata.description,
    type: "website",
    url: termsPageMetadata.canonicalPath,
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
