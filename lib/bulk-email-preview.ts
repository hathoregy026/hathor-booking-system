import { load } from "cheerio";
import { toSameOriginBulkEmailAssetUrl } from "@/lib/bulk-email-images";

/** Only used for server-generated React Email markup, never uploaded HTML. */
export function isolateBulkPreview(html: string, origin: string) {
  const url = new URL(origin);
  if (url.origin !== origin || !/^[a-z\d.-]+$/i.test(url.hostname) || !["https:", "http:"].includes(url.protocol)) throw new Error("Invalid preview origin.");
  const document = load(html);
  document('meta[http-equiv="Content-Security-Policy"]').remove();
  document("img[src]").each((_, image) => {
    const value = toSameOriginBulkEmailAssetUrl(document(image).attr("src"));
    if (value?.startsWith("/email/")) document(image).attr("src", `${origin}${value}`);
  });
  document("[background]").each((_, element) => {
    const path = toSameOriginBulkEmailAssetUrl(document(element).attr("background"));
    if (path) document(element).attr("background", `${origin}${path}`);
  });
  document("[style]").each((_, element) => {
    const css = document(element).attr("style") || "";
    document(element).attr("style", css.replace(/url\((["']?)([^'"\)]+)\1\)/g, (match, quote: string, value: string) => {
      const path = toSameOriginBulkEmailAssetUrl(value);
      return path ? `url(${quote}${origin}${path}${quote})` : match;
    }));
  });
  // The email's bundled font must follow the preview origin as well as its photos.
  document("style").each((_, style) => {
    const css = document(style).html() || "";
    document(style).text(css.replace(/https:\/\/(?:www\.hathorcruise\.com|hathorcruise\.com|hathor-booking-system\.vercel\.app)(\/fonts\/(?:more-fonts\/Italiana-Regular|Gamgote(?:-Regular)?)\.woff2)/g, `${origin}$1`));
  });
  const policy = `default-src 'none'; script-src 'none'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src ${origin} https://fonts.gstatic.com; img-src ${origin} https://*.supabase.co https://www.hathorcruise.com https://hathor-booking-system.vercel.app; connect-src 'none'; form-action 'none'; base-uri 'none'`;
  document("head").prepend(document("<meta>").attr({ "http-equiv": "Content-Security-Policy", content: policy }));
  return document.html();
}
