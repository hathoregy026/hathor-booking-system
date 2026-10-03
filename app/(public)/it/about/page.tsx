import type { Metadata } from "next";
import { AboutPageContent } from "@/components/pages/AboutPageContent";
import { LocaleWebsiteText } from "@/components/public/LocaleWebsiteText";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { ITALIAN_PAGES } from "@/lib/i18n/pages-seo-it";
import "../../../about-editorial.css";
import "../../../editorial-chrome.css";

const PAGE = ITALIAN_PAGES.about;

export const metadata: Metadata = PAGE.metadata;

export default function ItalianAboutPage() {
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
        <AboutPageContent />
      </LocaleWebsiteText>
    </>
  );
}
