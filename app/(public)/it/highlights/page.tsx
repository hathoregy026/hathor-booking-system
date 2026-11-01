import type { Metadata } from "next";
import { HighlightsPageContent } from "@/components/pages/highlights/HighlightsPageContent";
import { LocaleContentPage } from "@/components/pages/locale/LocaleContentPage";
import { LOCALE_PAGES } from "@/lib/i18n/locale-pages";
import "../../../editorial-chrome.css";
import "../../../highlights-editorial.css";

const PAGE = LOCALE_PAGES.it.highlights;

export const metadata: Metadata = PAGE.metadata;

export default function ItalianHighlightsPage() {
  return (
    <LocaleContentPage locale="it" page={PAGE} image="/media/hathor/r2/highlights-hero.webp">
      <HighlightsPageContent />
    </LocaleContentPage>
  );
}
