import type { Metadata } from "next";
import { ContactPageContent } from "@/components/pages/ContactPageContent";
import { LocaleWebsiteText } from "@/components/public/LocaleWebsiteText";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { ITALIAN_PAGES } from "@/lib/i18n/pages-seo-it";
import "../../../editorial-chrome.css";
import "../../../contact-editorial.css";

const PAGE = ITALIAN_PAGES.contact;

export const metadata: Metadata = PAGE.metadata;

export default function ItalianContactPage() {
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
        <ContactPageContent />
      </LocaleWebsiteText>
    </>
  );
}
