import "server-only";

import type { CreateEmailOptions } from "resend";
import {
  HATHOR_EMAIL_HERO_URL,
  HATHOR_EMAIL_LOGO_URL,
} from "@/lib/email-branding-urls";
import { pickReliableEmailImageUrl } from "@/lib/email-branding-shared";
import type { EmailTemplateOverrides } from "@/lib/email-templates";

export const EMAIL_LOGO_CID = "hathor-email-logo";
export const EMAIL_HERO_CID = "hathor-email-hero";

const FETCH_TIMEOUT_MS = 20_000;

type ResendAttachment = NonNullable<CreateEmailOptions["attachments"]>[number];

function extensionFromContentType(contentType: string | null): string {
  switch (contentType?.split(";")[0]?.trim()) {
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/png":
    default:
      return "png";
  }
}

async function fetchImageAttachment(
  url: string,
  contentId: string,
  preferredFilename: string,
): Promise<ResendAttachment | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { Accept: "image/*" },
    });

    if (!response.ok) {
      console.warn(
        `[email] image fetch failed (${response.status}) for ${url}`,
      );
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length === 0) {
      console.warn(`[email] empty image response for ${url}`);
      return null;
    }

    const contentType =
      response.headers.get("content-type")?.split(";")[0]?.trim() ||
      "image/png";
    const extension = extensionFromContentType(contentType);
    const filename = preferredFilename.includes(".")
      ? preferredFilename
      : `${preferredFilename}.${extension}`;

    return {
      content: buffer,
      filename,
      contentType,
      contentId,
    };
  } catch (error) {
    console.warn(`[email] image fetch error for ${url}:`, error);
    return null;
  }
}

async function resolveInlineAttachment(
  candidates: Array<string | null | undefined>,
  contentId: string,
  preferredFilename: string,
): Promise<ResendAttachment | null> {
  const seen = new Set<string>();

  for (const candidate of candidates) {
    const url = pickReliableEmailImageUrl(candidate);
    if (!url || seen.has(url)) continue;
    seen.add(url);

    const attachment = await fetchImageAttachment(
      url,
      contentId,
      preferredFilename,
    );
    if (attachment) {
      return attachment;
    }
  }

  return null;
}

/** Embed logo/hero as CID attachments so images render in all email clients. */
export async function prepareEmailSendImages(
  theme: EmailTemplateOverrides | undefined,
): Promise<{
  theme: EmailTemplateOverrides | undefined;
  attachments: ResendAttachment[];
}> {
  if (!theme) {
    return { theme, attachments: [] };
  }

  const [logoAttachment, heroAttachment] = await Promise.all([
    resolveInlineAttachment(
      [theme.logoUrl, HATHOR_EMAIL_LOGO_URL],
      EMAIL_LOGO_CID,
      "hathor-logo",
    ),
    resolveInlineAttachment(
      [theme.heroImageUrl, HATHOR_EMAIL_HERO_URL],
      EMAIL_HERO_CID,
      "hathor-hero",
    ),
  ]);

  const attachments = [logoAttachment, heroAttachment].filter(
    (item): item is ResendAttachment => item !== null,
  );

  return {
    theme: {
      ...theme,
      logoUrl: logoAttachment ? `cid:${EMAIL_LOGO_CID}` : theme.logoUrl,
      heroImageUrl: heroAttachment ? `cid:${EMAIL_HERO_CID}` : theme.heroImageUrl,
    },
    attachments,
  };
}
