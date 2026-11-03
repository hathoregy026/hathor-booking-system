import type { Metadata } from "next";
import { LocaleCruisesListPage } from "@/components/pages/locale/LocaleMarketingPages";
import { LOCALE_CRUISES_SEO } from "@/lib/i18n/locale-pages";

export const metadata: Metadata = LOCALE_CRUISES_SEO.ru.metadata;

export default function RussianCruisesListPage() {
  return <LocaleCruisesListPage locale="ru" />;
}
