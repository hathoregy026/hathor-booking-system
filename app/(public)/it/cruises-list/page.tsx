import type { Metadata } from "next";
import { LocaleCruisesListPage } from "@/components/pages/locale/LocaleMarketingPages";
import { LOCALE_CRUISES_SEO } from "@/lib/i18n/locale-pages";

export const metadata: Metadata = LOCALE_CRUISES_SEO.it.metadata;

export default function ItalianCruisesListPage() {
  return <LocaleCruisesListPage locale="it" />;
}
