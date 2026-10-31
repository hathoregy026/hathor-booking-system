import type { Metadata } from "next";
import { HighlightsPageContent } from "@/components/pages/highlights/HighlightsPageContent";
import { LocaleWebsiteText } from "@/components/public/LocaleWebsiteText";
import { PageStructuredData } from "@/components/seo/PageStructuredData";
import { ITALIAN_PAGES } from "@/lib/i18n/pages-seo-it";
import "../../../editorial-chrome.css";
import "../../../highlights-editorial.css";

const PAGE = ITALIAN_PAGES.highlights;

export const metadata: Metadata = PAGE.metadata;

export default function ItalianHighlightsPage() {
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
        image="/media/hathor/r2/highlights-hero.webp"
      />
      <LocaleWebsiteText locale="it">
        <HighlightsPageContent />
      </LocaleWebsiteText>
    </>
  );
}
