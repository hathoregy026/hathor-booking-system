import type { Metadata } from "next";
import { ContactPageContent } from "@/components/pages/ContactPageContent";
import { LocaleContentPage } from "@/components/pages/locale/LocaleContentPage";
import { LOCALE_PAGES } from "@/lib/i18n/locale-pages";
import "../../../editorial-chrome.css";
import "../../../contact-editorial.css";

const PAGE = LOCALE_PAGES.it.contact;

export const metadata: Metadata = PAGE.metadata;

export default function ItalianContactPage() {
  return (
    <LocaleContentPage locale="it" page={PAGE}>
      <ContactPageContent />
    </LocaleContentPage>
  );
}
