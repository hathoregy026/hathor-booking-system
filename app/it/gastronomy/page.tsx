import type { Metadata } from "next";
import { LocaleGastronomyPage } from "@/components/pages/locale/LocaleMarketingPages";
import { LOCALE_PAGES } from "@/lib/i18n/locale-pages";
import "../../page-visibility.css";
import "../../site-coming-soon.css";

export const metadata: Metadata = LOCALE_PAGES.it.gastronomy.metadata;

export default function ItalianGastronomyPage() {
  return <LocaleGastronomyPage locale="it" />;
}
