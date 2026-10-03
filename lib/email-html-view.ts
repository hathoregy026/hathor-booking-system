import { load } from "cheerio";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";
import { bookingQuery } from "@/lib/booking-database";
import type { InboxSource } from "@/lib/inbox-types";
import { resendApiRequest } from "@/lib/resend-inbound";
import { PublicRequestError } from "@/lib/public-api-security";

const color = /^(?:#[a-f0-9]{3,8}|[a-z]{1,20}|rgba?\([\d.,% ]{1,60}\))$/i;
const size = /^(?:\d{1,4}(?:\.\d{1,2})?(?:px|%|em|rem)|auto)$/;
const spacing = /^(?:\d{1,3}(?:\.\d{1,2})?(?:px|em|rem|%)?|auto)(?: (?:\d{1,3}(?:\.\d{1,2})?(?:px|em|rem|%)?|auto)){0,3}$/;
const border = /^\d{1,2}px (?:solid|dashed|dotted) (?:#[a-f0-9]{3,8}|[a-z]{1,20})$/i;

function publicHttpsUrl(value: string | undefined): string | undefined {
  if (!value || value.length > 4096) return;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443")) return;
    if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(url.hostname)) return;
    if (/\.(?:localhost|local|internal|lan|test|invalid|example)$/i.test(url.hostname)) return;
    return url.href;
  } catch { return; }
}

export function emailFrameHeaders(images: boolean): Record<string, string> {
  return {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "private, no-store",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "X-DNS-Prefetch-Control": "off",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Content-Security-Policy": `default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src ${images ? "https:" : "'none'"}; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'; sandbox allow-popups allow-popups-to-escape-sandbox`,
  };
}

export function buildEmailHtmlDocument(html: string, images = false, inlineImages: ReadonlyMap<string, string> = new Map()): string {
  if (Buffer.byteLength(html, "utf8") > 512 * 1024) throw new PublicRequestError("This email is too large for formatted view. Please use the text view.", 413);
  const document = load(html);
  document("script, style, head, iframe, object, embed, svg, math, form, input, button, textarea, select, template, noscript").remove();
  document("[hidden], [aria-hidden=true]").remove();
  document("[style]").each((_, element) => {
    if (/(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden)\s*(?:!important)?\s*(?:;|$)/i.test(document(element).attr("style") ?? "")) document(element).remove();
  });
  const content = sanitizeHtml(document("body").html() ?? "", {
    allowedTags: ["p", "br", "div", "span", "table", "thead", "tbody", "tfoot", "tr", "td", "th", "col", "colgroup", "caption", "blockquote", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "pre", "code", "b", "strong", "em", "i", "u", "s", "small", "sub", "sup", "hr", "a", "img", "address", "center"],
    allowedAttributes: {
      "*": ["style", { name: "dir", values: ["ltr", "rtl", "auto"] }],
      a: ["href", "target", "rel"], img: ["src", "alt", "width", "height", "referrerpolicy"],
      table: ["width", "cellpadding", "cellspacing"], td: ["colspan", "rowspan", "width"], th: ["colspan", "rowspan", "width"],
    },
    allowedSchemes: ["https"], allowProtocolRelative: false, nestingLimit: 60,
    allowedStyles: { "*": {
      color: [color], "background-color": [color], "font-family": [/^[\w\s,'"-]{1,160}$/], "font-size": [size],
      "font-weight": [/^(?:normal|bold|[1-9]00)$/], "font-style": [/^(?:normal|italic)$/],
      "text-align": [/^(?:left|center|right|justify)$/], "text-decoration": [/^(?:none|underline|line-through)$/],
      "line-height": [/^(?:\d(?:\.\d{1,2})?|\d{1,3}(?:px|%|em|rem))$/],
      width: [size], "max-width": [size], height: [size], padding: [spacing], margin: [spacing],
      "padding-top": [size], "padding-right": [size], "padding-bottom": [size], "padding-left": [size],
      border: [border], "border-top": [border], "border-bottom": [border], "border-radius": [spacing],
      "border-collapse": [/^(?:collapse|separate)$/], "vertical-align": [/^(?:top|middle|bottom)$/],
    } },
    transformTags: {
      a: (_, attributes) => ({ tagName: "a", attribs: { ...attributes, href: publicHttpsUrl(attributes.href) ?? "", target: "_blank", rel: "noopener noreferrer" } }),
      img: (_, attributes) => {
        const source = attributes.src?.startsWith("cid:") ? inlineImages.get(attributes.src.slice(4)) : attributes.src;
        const url = images ? publicHttpsUrl(source) : undefined;
        return url ? { tagName: "img", attribs: { ...attributes, src: url, referrerpolicy: "no-referrer" } }
          : { tagName: "span", attribs: {}, text: attributes.alt ? `[Image: ${attributes.alt}]` : "[Image blocked]" };
      },
    },
  });
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Protected email view</title><style>html{color-scheme:light}body{margin:0;padding:20px;background:#fff;color:#2c2824;font:15px/1.65 Georgia,serif;overflow-wrap:anywhere}img,table{max-width:100%!important}img{height:auto}pre{white-space:pre-wrap}a{overflow-wrap:anywhere}blockquote{border-left:2px solid #b69f64;margin-left:0;padding-left:16px}td,th{overflow-wrap:anywhere}</style></head><body>${content}</body></html>`;
}

export async function receivedEmailHtmlDocument(source: InboxSource, id: string, images: boolean, dependencies: { query?: typeof bookingQuery; request?: typeof resendApiRequest } = {}): Promise<string> {
  const query = dependencies.query ?? bookingQuery;
  const request = dependencies.request ?? resendApiRequest;
  const [message] = source === "booking"
    ? await query<{ resendEmailId: string | null }>(`SELECT "resendEmailId" FROM "BookingMessage" WHERE id = $1 AND direction = 'INBOUND'`, [id])
    : await query<{ resendEmailId: string | null; direction: string; bodyHtml: string | null }>(`SELECT "resendEmailId", direction, "bodyHtml" FROM "InboxMessage" WHERE id = $1`, [id]);
  if (!message) throw new PublicRequestError("Email not found.", 404);
  if ("direction" in message && message.direction === "OUTBOUND") {
    if (!("bodyHtml" in message) || typeof message.bodyHtml !== "string") throw new PublicRequestError("This email has no formatted version. Please use the text view.", 404);
    return buildEmailHtmlDocument(message.bodyHtml, images);
  }
  const emailId = z.uuid().parse(message.resendEmailId);
  const email = z.object({ id: z.uuid(), html: z.string().nullable(), attachments: z.array(z.object({ id: z.uuid() })).max(100) }).parse(await request(`/emails/receiving/${emailId}?html_format=cid`));
  if (email.id !== emailId) throw new Error("Email mismatch");
  if (!email.html) throw new PublicRequestError("This email has no formatted version. Please use the text view.", 404);
  const inlineImages = new Map<string, string>();
  if (images && email.html.includes("cid:") && email.attachments.length) {
    try {
      const files = z.object({ data: z.array(z.object({ id: z.uuid(), content_id: z.string().max(998).nullable(), content_type: z.string().max(255), download_url: z.url() })).max(100) }).parse(await request(`/emails/receiving/${emailId}/attachments`));
      for (const file of files.data) {
        const url = new URL(file.download_url);
        if (file.content_id && /^(?:image\/png|image\/jpeg|image\/gif|image\/webp)$/.test(file.content_type)
          && email.attachments.some(attachment => attachment.id === file.id) && url.hostname === "inbound-cdn.resend.com" && publicHttpsUrl(file.download_url)) inlineImages.set(file.content_id, file.download_url);
      }
    } catch { console.warn("[email-view] inline images unavailable; text retained"); }
  }
  return buildEmailHtmlDocument(email.html, images, inlineImages);
}
