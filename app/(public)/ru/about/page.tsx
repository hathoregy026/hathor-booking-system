import type { Metadata } from "next";
import { AboutPageContent } from "@/components/pages/AboutPageContent";
import { LocaleContentPage } from "@/components/pages/locale/LocaleContentPage";
import { LOCALE_PAGES } from "@/lib/i18n/locale-pages";
import "../../../about-editorial.css";
import "../../../editorial-chrome.css";

const PAGE = LOCALE_PAGES.ru.about;

export const metadata: Metadata = PAGE.metadata;

export default function RussianAboutPage() {
  return (
    <LocaleContentPage locale="ru" page={PAGE}>
      <AboutPageContent />
    </LocaleContentPage>
  );
}
