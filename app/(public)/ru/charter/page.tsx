import type { Metadata } from "next";
import { LocaleCharterPage } from "@/components/pages/locale/LocaleMarketingPages";
import { LOCALE_CHARTER_SEO } from "@/lib/i18n/locale-pages";
import "../../../charter-editorial.css";
import "../../../editorial-chrome.css";

export const metadata: Metadata = LOCALE_CHARTER_SEO.ru.metadata;

export default function RussianCharterPage() {
  return <LocaleCharterPage locale="ru" />;
}
