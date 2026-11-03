import type { Metadata } from "next";
import { ContactPageContent } from "@/components/pages/ContactPageContent";
import { LocaleContentPage } from "@/components/pages/locale/LocaleContentPage";
import { LOCALE_PAGES } from "@/lib/i18n/locale-pages";
import "../../../editorial-chrome.css";
import "../../../contact-editorial.css";

const PAGE = LOCALE_PAGES.ru.contact;

export const metadata: Metadata = PAGE.metadata;

export default function RussianContactPage() {
  return (
    <LocaleContentPage locale="ru" page={PAGE}>
      <ContactPageContent />
    </LocaleContentPage>
  );
}
