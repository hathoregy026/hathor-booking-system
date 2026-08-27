import * as cheerio from "cheerio";

const ALLOWED_TAGS = new Set([
  "h2",
  "h3",
  "h4",
  "p",
  "a",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "b",
  "i",
  "br",
  "img",
  "span",
  "blockquote",
  "figure",
  "figcaption",
]);

const ALLOWED_ATTR = new Set([
  "href",
  "src",
  "alt",
  "title",
  "class",
  "target",
  "rel",
]);

const BLOCKED_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "object",
  "embed",
  "form",
  "input",
  "textarea",
  "button",
  "link",
  "meta",
]);

const INTERNAL_HOSTS = new Set(["hathorcruise.com", "www.hathorcruise.com"]);

const CANONICAL_PATH_ALIASES: Readonly<Record<string, string>> = {
  "/Luxury-Royal-Suites-Nile-Dahabiya-Cruise": "/charter",
  "/cruises": "/cruises-list",
  "/blog": "/blogs",
  "/journal": "/blogs",
};

function isUnsafeUrl(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.startsWith("javascript:") ||
    normalized.startsWith("data:text/html") ||
    normalized.startsWith("vbscript:")
  );
}

function normalizeInternalHref(value: string): string {
  try {
    const url = new URL(value, "https://www.hathorcruise.com");
    const isRelative = value.startsWith("/") && !value.startsWith("//");
    if (!isRelative && !INTERNAL_HOSTS.has(url.hostname.toLowerCase())) {
      return value;
    }

    const pathname = CANONICAL_PATH_ALIASES[url.pathname] ?? url.pathname;
    return `${pathname}${url.search}${url.hash}`;
  } catch {
    return value;
  }
}

export function isBlogHtmlContent(content: string): boolean {
  return /<\s*(p|h2|h3|h4|ul|ol|li|img|a|blockquote)\b/i.test(content);
}

export function sanitizeBlogHtml(html: string): string {
  const $ = cheerio.load(html, null, false);

  $("*").each((_, element) => {
    if (element.type !== "tag") return;

    const tagName = element.name.toLowerCase();

    if (BLOCKED_TAGS.has(tagName)) {
      $(element).remove();
      return;
    }

    if (!ALLOWED_TAGS.has(tagName)) {
      $(element).replaceWith($(element).contents());
      return;
    }

    for (const attr of Object.keys(element.attribs)) {
      if (!ALLOWED_ATTR.has(attr.toLowerCase())) {
        $(element).removeAttr(attr);
      }
    }

    if (tagName === "a") {
      const href = element.attribs.href?.trim() ?? "";
      if (!href || isUnsafeUrl(href)) {
        $(element).removeAttr("href");
      } else {
        const normalizedHref = normalizeInternalHref(href);
        $(element).attr("href", normalizedHref);

        if (!/^https?:\/\//i.test(normalizedHref)) {
          $(element).removeAttr("target");
          $(element).removeAttr("rel");
        } else {
          $(element).attr("rel", "noopener noreferrer");
          $(element).attr("target", "_blank");
        }
      }
    }

    if (tagName === "img") {
      const src = element.attribs.src?.trim() ?? "";
      if (!src || isUnsafeUrl(src)) {
        $(element).remove();
      }
    }
  });

  return $.root().html() ?? "";
}

export function plainTextToBlogHtml(content: string, excerpt: string): string {
  const source = content.trim() || excerpt;
  const paragraphs = source
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function prepareBlogContentForRender(content: string, excerpt: string): string {
  const raw = isBlogHtmlContent(content)
    ? content
    : plainTextToBlogHtml(content, excerpt);
  return sanitizeBlogHtml(raw);
}
