import type { Metadata } from "next";
import { TermsAndConditionsPageContent } from "@/components/pages/TermsAndConditionsPageContent";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { ITALIAN_PAGES } from "@/lib/i18n/pages-seo-it";
import "../../../terms-and-conditions-editorial.css";
import "../../../editorial-chrome.css";

const PAGE = ITALIAN_PAGES.terms;

export const metadata: Metadata = PAGE.metadata;

export default function ItalianTermsAndConditionsPage() {
  return (
    <>
      <PageStructuredData
        path={PAGE.path}
        name={PAGE.name}
        description={PAGE.description}
        breadcrumbs={[
          { name: "Home", path: "/it" },
          { name: PAGE.crumb, path: PAGE.path },
        ]}
      />
      <TermsAndConditionsPageContent locale="it" />
    </>
  );
}
