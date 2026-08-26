/**
 * Fetch email brand images and expose them as Resend CID attachments so
 * clients do not depend on remote hotlinking (Gmail proxy, Outlook, etc.).
 */

export const EMAIL_INLINE_LOGO_CID = "hathor-email-logo";
export const EMAIL_INLINE_HERO_CID = "hathor-email-hero";

export type EmailInlineAttachment = {
  filename: string;
  content: Buffer;
  contentId: string;
  contentType: string;
};

export type EmailInlineImageBundle = {
  /** Theme URLs rewritten to cid:… when the bytes were inlined. */
  logoUrl: string;
  heroImageUrl: string | null;
  attachments: EmailInlineAttachment[];
};

function guessFilename(url: string, fallback: string): string {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split("/").pop()?.trim();
    if (base && /\.(png|jpe?g|webp)$/i.test(base)) return base;
  } catch {
    /* ignore */
  }
  return fallback;
}

function contentTypeFromUrl(url: string, fallback: string): string {
  const lower = url.toLowerCase();
  if (lower.includes(".png")) return "image/png";
  if (lower.includes(".webp")) return "image/webp";
  if (lower.includes(".jpg") || lower.includes(".jpeg")) return "image/jpeg";
  return fallback;
}

async function fetchImageBuffer(
  url: string | null | undefined,
): Promise<{ buffer: Buffer; contentType: string } | null> {
  const trimmed = url?.trim();
  if (!trimmed || !/^https:\/\//i.test(trimmed)) return null;
  if (trimmed.startsWith("cid:")) return null;

  try {
    const response = await fetch(trimmed, {
      redirect: "follow",
      headers: { Accept: "image/*,*/*;q=0.8" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) {
      console.warn(
        `[email] inline image fetch failed (${response.status}):`,
        trimmed,
      );
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    if (!arrayBuffer.byteLength) return null;
    const headerType = response.headers.get("content-type")?.split(";")[0]?.trim();
    return {
      buffer: Buffer.from(arrayBuffer),
      contentType:
        headerType && headerType.startsWith("image/")
          ? headerType
          : contentTypeFromUrl(trimmed, "image/jpeg"),
    };
  } catch (error) {
    console.warn("[email] inline image fetch error:", trimmed, error);
    return null;
  }
}

/**
 * Download logo/hero and return CID-backed srcs + Resend attachments.
 * Falls back to the original HTTPS URLs when a fetch fails.
 */
export async function buildInlineEmailImages(input: {
  logoUrl: string;
  heroImageUrl?: string | null;
}): Promise<EmailInlineImageBundle> {
  const attachments: EmailInlineAttachment[] = [];
  let logoUrl = input.logoUrl.trim();
  let heroImageUrl = input.heroImageUrl?.trim() || null;

  const logo = await fetchImageBuffer(logoUrl);
  if (logo) {
    attachments.push({
      filename: guessFilename(logoUrl, "hathor-email-logo.png"),
      content: logo.buffer,
      contentId: EMAIL_INLINE_LOGO_CID,
      contentType: logo.contentType,
    });
    logoUrl = `cid:${EMAIL_INLINE_LOGO_CID}`;
  }

  if (heroImageUrl) {
    const hero = await fetchImageBuffer(heroImageUrl);
    if (hero) {
      attachments.push({
        filename: guessFilename(heroImageUrl, "hathor-email-hero.jpg"),
        content: hero.buffer,
        contentId: EMAIL_INLINE_HERO_CID,
        contentType: hero.contentType,
      });
      heroImageUrl = `cid:${EMAIL_INLINE_HERO_CID}`;
    }
  }

  return { logoUrl, heroImageUrl, attachments };
}
