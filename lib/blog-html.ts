import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
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
] as const;

const ALLOWED_ATTR = ["href", "src", "alt", "title", "class", "target", "rel"] as const;

export function isBlogHtmlContent(content: string): boolean {
  return /<\s*(p|h2|h3|h4|ul|ol|li|img|a|blockquote)\b/i.test(content);
}

export function sanitizeBlogHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...ALLOWED_TAGS],
    ALLOWED_ATTR: [...ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
  });
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
