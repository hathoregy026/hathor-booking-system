import type { Metadata } from "next";
import { PartnersPageContent } from "@/components/pages/PartnersPageContent";
import { LocaleContentPage } from "@/components/pages/locale/LocaleContentPage";
import { LOCALE_PAGES } from "@/lib/i18n/locale-pages";
import "../../../partners-editorial.css";
import "../../../editorial-chrome.css";
import "../../../partners-company-strip.css";

const PAGE = LOCALE_PAGES.it.partners;

export const metadata: Metadata = PAGE.metadata;

export default function ItalianPartnersPage() {
  return (
    <LocaleContentPage locale="it" page={PAGE}>
      <PartnersPageContent />
    </LocaleContentPage>
  );
}
