import type { Metadata } from "next";
import "@/app/editorial-chrome.css";
import "@/app/voyages-editorial.css";
import { LocaleVoyagesPage } from "@/components/pages/voyages/LocaleVoyagesPage";
import { LOCALE_VOYAGE_PAGES } from "@/lib/i18n/locale-pages";

export const metadata: Metadata = LOCALE_VOYAGE_PAGES.de["aswan-to-luxor"].metadata;

export default function GermanAswanToLuxorPage() {
  return <LocaleVoyagesPage locale="de" page="aswan-to-luxor" />;
}
