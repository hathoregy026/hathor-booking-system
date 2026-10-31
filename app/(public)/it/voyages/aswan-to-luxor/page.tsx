import type { Metadata } from "next";
import "@/app/editorial-chrome.css";
import "@/app/voyages-editorial.css";
import { ItalianVoyagesPage } from "@/components/pages/voyages/ItalianVoyagesPage";
import { ITALIAN_VOYAGE_PAGES } from "@/lib/i18n/voyages-pages-it";

export const metadata: Metadata = ITALIAN_VOYAGE_PAGES["aswan-to-luxor"].metadata;

export default function ItalianAswanToLuxorPage() {
  return <ItalianVoyagesPage page="aswan-to-luxor" />;
}
