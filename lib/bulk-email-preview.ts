import { load } from "cheerio";
import { toSameOriginEmailAssetUrl } from "@/lib/email-branding-urls";

/** Only used for server-generated React Email markup, never uploaded HTML. */
export function isolateBulkPreview(html: string, origin: string) {
  const url = new URL(origin);
  if (url.origin !== origin || !/^[a-z\d.-]+$/i.test(url.hostname) || !["https:", "http:"].includes(url.protocol)) throw new Error("Invalid preview origin.");
  const document = load(html);
  document('meta[http-equiv="Content-Security-Policy"]').remove();
  document("img[src]").each((_, image) => {
    const value = toSameOriginEmailAssetUrl(document(image).attr("src"));
    if (value?.startsWith("/email/")) document(image).attr("src", `${origin}${value}`);
  });
  const policy = `default-src 'none'; script-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src ${origin} https://*.supabase.co https://www.hathorcruise.com https://hathor-booking-system.vercel.app; connect-src 'none'; form-action 'none'; base-uri 'none'`;
  document("head").prepend(document("<meta>").attr({ "http-equiv": "Content-Security-Policy", content: policy }));
  return document.html();
}
