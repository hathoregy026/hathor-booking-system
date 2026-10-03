import type { Metadata } from "next";
import { PartnersPageContent } from "@/components/pages/PartnersPageContent";
import { LocaleWebsiteText } from "@/components/public/LocaleWebsiteText";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { ITALIAN_PAGES } from "@/lib/i18n/pages-seo-it";
import "../../../partners-editorial.css";
import "../../../editorial-chrome.css";
import "../../../partners-company-strip.css";

const PAGE = ITALIAN_PAGES.partners;

export const metadata: Metadata = PAGE.metadata;

export default function ItalianPartnersPage() {
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
        <PartnersPageContent />
      </LocaleWebsiteText>
    </>
  );
}
