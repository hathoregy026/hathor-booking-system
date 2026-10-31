import { redirect } from "next/navigation";
import { arrivedLanguage } from "@/lib/i18n/arrived-language";
import { localizedHref } from "@/lib/i18n/locale";

export default async function LegacyBookPage() {
  redirect(localizedHref("/booking", await arrivedLanguage()));
}
