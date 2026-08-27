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

/**
 * Split sanitised article HTML into N roughly equal runs of top-level blocks.
 *
 * The article layout threads photographs between the text, so the body has to
 * be broken at element boundaries — never mid-tag. cheerio gives us the real
 * top-level children, so a run can never end inside an open element and the
 * markup stays balanced no matter how the CMS authored it.
 *
 * Blocks are balanced by rendered text length rather than element count, so a
 * short heading does not consume a whole run and leave one image stranded
 * against a wall of prose.
 */
export function splitBlogHtmlIntoBlocks(html: string, parts: number): string[] {
  const wanted = Math.max(1, Math.floor(parts));
  if (wanted === 1) return [html];

  const $ = cheerio.load(html, null, false);
  const nodes = $.root().children().toArray();
  if (nodes.length <= 1) return [html];

  const rendered = nodes.map((node) => {
    const el = $(node);
    return { html: $.html(el), weight: Math.max(1, el.text().trim().length) };
  });

  const total = rendered.reduce((sum, item) => sum + item.weight, 0);
  const target = total / wanted;

  const blocks: string[] = [];
  let current = "";
  let carried = 0;

  rendered.forEach((item, index) => {
    current += item.html;
    carried += item.weight;

    const remainingNodes = rendered.length - index - 1;
    const remainingBlocks = wanted - blocks.length - 1;

    // Close this run once it has met its share — but never leave a later run
    // without at least one node to hold.
    if (
      remainingBlocks > 0 &&
      remainingNodes >= remainingBlocks &&
      carried >= target
    ) {
      blocks.push(current);
      current = "";
      carried = 0;
    }
  });

  if (current) blocks.push(current);
  return blocks.filter(Boolean);
}
