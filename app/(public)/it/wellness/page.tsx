import type { Metadata } from "next";
import { WellnessEditorialPageContent } from "@/components/pages/WellnessEditorialPageContent";
import { LocaleContentPage } from "@/components/pages/locale/LocaleContentPage";
import { LOCALE_PAGES } from "@/lib/i18n/locale-pages";
import "../../../wellness-editorial.css";
import "../../../editorial-chrome.css";

const PAGE = LOCALE_PAGES.it.wellness;

export const metadata: Metadata = PAGE.metadata;

export default function ItalianWellnessPage() {
  return (
    <LocaleContentPage locale="it" page={PAGE}>
      <WellnessEditorialPageContent />
    </LocaleContentPage>
  );
}
