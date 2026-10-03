import type { Metadata } from "next";
import { MaskRevealPageContent } from "@/components/pages/MaskRevealPageContent";
import { LocaleWebsiteText } from "@/components/public/LocaleWebsiteText";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { CRUISES_LIST_PAGE_IT, CRUISES_LIST_SEO_IT } from "@/lib/i18n/cruises-seo-it";

export const metadata: Metadata = CRUISES_LIST_SEO_IT;

export default function ItalianCruisesListPage() {
  return (
    <>
      <PageStructuredData
        path="/it/cruises-list"
        name={CRUISES_LIST_PAGE_IT.name}
        description={
          typeof CRUISES_LIST_SEO_IT.description === "string"
            ? CRUISES_LIST_SEO_IT.description
            : ""
        }
        breadcrumbs={[...CRUISES_LIST_PAGE_IT.breadcrumbs]}
      />
      <LocaleWebsiteText locale="it">
        <MaskRevealPageContent />
      </LocaleWebsiteText>
    </>
  );
}
