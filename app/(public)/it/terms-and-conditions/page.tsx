import type { Metadata } from "next";
import { TermsAndConditionsPageContent } from "@/components/pages/TermsAndConditionsPageContent";
import { LocaleContentPage } from "@/components/pages/locale/LocaleContentPage";
import { LOCALE_PAGES } from "@/lib/i18n/locale-pages";
import "../../../terms-and-conditions-editorial.css";
import "../../../editorial-chrome.css";

const PAGE = LOCALE_PAGES.it.terms;

export const metadata: Metadata = PAGE.metadata;

export default function ItalianTermsAndConditionsPage() {
  return (
    <LocaleContentPage locale="it" page={PAGE} plainText>
      <TermsAndConditionsPageContent locale="it" />
    </LocaleContentPage>
  );
}
