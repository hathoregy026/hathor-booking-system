import type { Metadata } from "next";
import { LocaleCharterPage } from "@/components/pages/locale/LocaleMarketingPages";
import { LOCALE_CHARTER_SEO } from "@/lib/i18n/locale-pages";
import "../../../charter-editorial.css";
import "../../../editorial-chrome.css";

export const metadata: Metadata = LOCALE_CHARTER_SEO.it.metadata;

export default function ItalianCharterPage() {
  return <LocaleCharterPage locale="it" />;
}
