import { z } from "zod";
import { EMAIL_TEMPLATE_NAMES } from "@/lib/email-templates";
import { EMAIL_FOOTER_LIMITS } from "@/lib/email-footer";
import { PublicRequestError } from "@/lib/public-api-security";

const text = (max: number) => z.string().max(max).nullable().optional();
const footerSchema = z.object({
  tagline: text(EMAIL_FOOTER_LIMITS.tagline), email: text(EMAIL_FOOTER_LIMITS.email),
  phone: text(EMAIL_FOOTER_LIMITS.phone), replyNote: text(EMAIL_FOOTER_LIMITS.replyNote),
  copyright: text(EMAIL_FOOTER_LIMITS.copyright), adminTitle: text(EMAIL_FOOTER_LIMITS.adminTitle),
}).strict();
const schema = z.object({
  name: z.enum(EMAIL_TEMPLATE_NAMES).optional(),
  shared: z.object({ logoUrl: text(2048), heroImageUrl: text(2048), primaryColor: text(64), backgroundColor: text(64) }).strict().optional(),
  templates: z.array(z.object({ name: z.enum(EMAIL_TEMPLATE_NAMES), subject: text(200), heroHeading: text(300), bodyText: text(8000) }).strict()).max(EMAIL_TEMPLATE_NAMES.length).optional(),
  footer: footerSchema.optional(),
}).strict();

/** Bounded streaming read also covers requests without Content-Length. */
export async function readEmailPreviewDraft(request: Request) {
  const limit = 96 * 1024;
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") throw new PublicRequestError("JSON required", 415);
  const origin = request.headers.get("origin");
  // Next's internal request URL can use localhost behind a proxy. Compare the
  // browser Origin to the actual Host and the proxy's transport scheme.
  const requestUrl = new URL(request.url);
  const scheme = request.headers.get("x-forwarded-proto") ?? requestUrl.protocol.slice(0, -1);
  const host = request.headers.get("host") ?? requestUrl.host;
  if (!['http', 'https'].includes(scheme) || request.headers.get("sec-fetch-site") === "cross-site" ||
      (origin && origin !== new URL(`${scheme}://${host}`).origin)) throw new PublicRequestError("Cross-origin request rejected", 403);
  if (Number(request.headers.get("content-length")) > limit) throw new PublicRequestError("Preview draft is too large", 413);
  if (!request.body) throw new PublicRequestError("Invalid preview draft", 400);
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let size = 0;
  let raw = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) { await reader.cancel(); throw new PublicRequestError("Preview draft is too large", 413); }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) throw new PublicRequestError("Invalid preview draft", 400);
    return parsed.data;
  } catch (error) {
    if (error instanceof PublicRequestError) throw error;
    throw new PublicRequestError("Invalid preview draft", 400);
  } finally { reader.releaseLock(); }
}

/** A complete selected draft never needs a database read on each keystroke. */
export function isCompleteEmailPreviewDraft(body: Awaited<ReturnType<typeof readEmailPreviewDraft>>) {
  const copy = body.templates?.find(template => template.name === body.name);
  return Boolean(body.name && body.shared && body.footer && copy &&
    [body.shared.logoUrl, body.shared.heroImageUrl, body.shared.primaryColor, body.shared.backgroundColor,
      copy.subject, copy.heroHeading, copy.bodyText, ...Object.values(body.footer)].every(value => typeof value === "string" || value === null) &&
    Object.keys(body.footer).length === 6);
}
