import type { Metadata } from "next";
import { LocaleBlogIndexPage } from "@/components/pages/locale/LocaleBlogPages";
import { LOCALE_PAGES } from "@/lib/i18n/locale-pages";
import "../../../journal-editorial.css";
import "../../../editorial-chrome.css";

export const metadata: Metadata = LOCALE_PAGES.de.blogs.metadata;

export const dynamic = "force-dynamic";

export default function GermanBlogsPage() {
  return <LocaleBlogIndexPage locale="de" />;
}
