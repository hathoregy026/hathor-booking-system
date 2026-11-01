import { headers } from "next/headers";
import { splitLocalePath, type PublicLocale } from "@/lib/i18n/locale";

/**
 * The language of the page this request was a click from, when it is one of
 * ours. The old booking addresses have no language of their own, so this is
 * what keeps a translated-site visitor who follows one (a stale link, a saved
 * page) in their language. Anyone else gets the English page, exactly as before.
 */
export async function arrivedLanguage(): Promise<PublicLocale> {
  const request = await headers();
  const referer = request.get("referer");
  if (!referer) return "en";
  try {
    const from = new URL(referer);
    return from.host === request.get("host") ? splitLocalePath(from.pathname).locale : "en";
  } catch {
    return "en";
  }
}
