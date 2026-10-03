import type { Metadata } from "next";
import { WellnessEditorialPageContent } from "@/components/pages/WellnessEditorialPageContent";
import { LocaleWebsiteText } from "@/components/public/LocaleWebsiteText";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { ITALIAN_PAGES } from "@/lib/i18n/pages-seo-it";
import "../../../wellness-editorial.css";
import "../../../editorial-chrome.css";

const PAGE = ITALIAN_PAGES.wellness;

export const metadata: Metadata = PAGE.metadata;

export default function ItalianWellnessPage() {
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
      <LocaleWebsiteText locale="it">
        <WellnessEditorialPageContent />
      </LocaleWebsiteText>
    </>
  );
}
