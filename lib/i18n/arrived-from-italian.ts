import { headers } from "next/headers";
import { splitLocalePath } from "@/lib/i18n/locale";

/**
 * Whether this request was a click from one of our own /it pages. The old
 * booking addresses have no language of their own, so this is what keeps an
 * Italian visitor who follows one (a stale link, a saved page) in Italian.
 * Anyone else gets the English page, exactly as before.
 */
export async function arrivedFromItalian(): Promise<boolean> {
  const request = await headers();
  const referer = request.get("referer");
  if (!referer) return false;
  try {
    const from = new URL(referer);
    return from.host === request.get("host") && splitLocalePath(from.pathname).locale === "it";
  } catch {
    return false;
  }
}
