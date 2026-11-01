import type { Metadata } from "next";
import { TermsAndConditionsPageContent } from "@/components/pages/TermsAndConditionsPageContent";
import { LocaleContentPage } from "@/components/pages/locale/LocaleContentPage";
import { LOCALE_PAGES } from "@/lib/i18n/locale-pages";
import "../../../terms-and-conditions-editorial.css";
import "../../../editorial-chrome.css";

const PAGE = LOCALE_PAGES.de.terms;

export const metadata: Metadata = PAGE.metadata;

export default function GermanTermsAndConditionsPage() {
  return (
    <LocaleContentPage locale="de" page={PAGE} plainText>
      <TermsAndConditionsPageContent locale="de" />
    </LocaleContentPage>
  );
}
