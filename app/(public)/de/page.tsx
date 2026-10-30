import type { Metadata } from "next";
import { LocaleHomePage } from "@/components/pages/locale/LocaleMarketingPages";
import { LOCALE_HOME_SEO } from "@/lib/i18n/locale-pages";
import "../home-experience.css";
import "../home-responsive.css";
import "../home-3/home-three.css";
import "../../partners-company-strip.css";

export const revalidate = 300;

/*
 * The same page as `/`, its words in this language. The components read the
 * language from the address; search settings (hreflang, sitemap, indexing
 * switch) come from lib/i18n/locale.ts.
 */
export const metadata: Metadata = LOCALE_HOME_SEO.de;

export default function GermanHomePage() {
  return <LocaleHomePage locale="de" />;
}
