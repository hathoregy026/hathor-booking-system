import type { Metadata } from "next";
import { ContactPageContent } from "@/components/pages/ContactPageContent";
import { LocaleContentPage } from "@/components/pages/locale/LocaleContentPage";
import { LOCALE_PAGES } from "@/lib/i18n/locale-pages";
import "../../../editorial-chrome.css";
import "../../../contact-editorial.css";

const PAGE = LOCALE_PAGES.de.contact;

export const metadata: Metadata = PAGE.metadata;

export default function GermanContactPage() {
  return (
    <LocaleContentPage locale="de" page={PAGE}>
      <ContactPageContent />
    </LocaleContentPage>
  );
}
