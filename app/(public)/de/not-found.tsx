import type { Metadata } from "next";
import { LocaleNotFound } from "@/components/pages/locale/LocaleNotFound";
import { notFoundMetadata } from "@/lib/i18n/not-found";
import "../../locale-not-found.css";

export const metadata: Metadata = notFoundMetadata("de");

export default function GermanNotFound() {
  return <LocaleNotFound locale="de" />;
}
