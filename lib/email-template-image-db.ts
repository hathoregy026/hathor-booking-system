import {
  EMAIL_TEMPLATE_NAMES,
  getDefaultEmailTemplate,
  type EmailTemplateName,
} from "@/lib/email-templates";
import {
  emailImagesObjectPathFromUrl,
  isReliableHostedEmailImageUrl,
  isSupabaseEmailImageUrl,
  pickSharedEmailBrandingFromRows,
} from "@/lib/email-branding-shared";
import { HATHOR_EMAIL_LOGO_URL } from "@/lib/email-branding-urls";
import { EMAIL_IMAGE_BUCKET } from "@/lib/image-upload";
import { prisma } from "@/lib/prisma";
import { createSupabaseStorageAdminClient } from "@/lib/supabase-server";

export function isEmailTemplateImageField(
  value: string,
): value is "logoUrl" | "heroImageUrl" {
  return value === "logoUrl" || value === "heroImageUrl";
}

export function isEmailTemplateImageFieldName(
  value: string,
): value is EmailTemplateName {
  return EMAIL_TEMPLATE_NAMES.includes(value as EmailTemplateName);
}

export async function loadSharedEmailBranding() {
  try {
    const rows = await prisma.emailTemplate.findMany({
      select: { logoUrl: true, heroImageUrl: true },
    });
    return pickSharedEmailBrandingFromRows(rows);
  } catch (error) {
    console.error("[email] failed to load shared branding:", error);
    return { logoUrl: null, heroImageUrl: null };
  }
}

/**
 * Delete every hero-* object in email-images except the one we just uploaded.
 * Also removes an explicit previous path when provided.
 */
export async function deleteReplacedEmailHeroObjects(options: {
  keepPath: string;
  previousUrls?: Array<string | null | undefined>;
}): Promise<void> {
  const supabase = createSupabaseStorageAdminClient();
  const keep = options.keepPath.replace(/^\/+/, "");
  const toRemove = new Set<string>();

  for (const url of options.previousUrls ?? []) {
    const path = emailImagesObjectPathFromUrl(url);
    if (path && path !== keep) {
      toRemove.add(path);
    }
  }

  try {
    const { data, error } = await supabase.storage
      .from(EMAIL_IMAGE_BUCKET)
      .list("", { limit: 200 });
    if (error) {
      console.warn("[email] list email-images failed:", error.message);
    } else {
      for (const entry of data ?? []) {
        const name = entry.name?.trim();
        if (!name) continue;
        if (/^hero-/i.test(name) && name !== keep) {
          toRemove.add(name);
        }
      }
    }
  } catch (error) {
    console.warn("[email] list email-images threw:", error);
  }

  const paths = [...toRemove];
  if (!paths.length) return;

  const { error: removeError } = await supabase.storage
    .from(EMAIL_IMAGE_BUCKET)
    .remove(paths);

  if (removeError) {
    console.warn("[email] failed to delete old hero objects:", removeError.message);
  } else {
    console.log("[email] deleted old hero objects:", paths.join(", "));
  }
}

/**
 * Persist a new hero image URL on every email template.
 * Logo stays locked to the site icon — only heroImageUrl is accepted.
 */
export async function propagateEmailImageToAllTemplates(
  field: "logoUrl" | "heroImageUrl",
  url: string,
): Promise<{ previousHeroUrls: string[] }> {
  if (field !== "heroImageUrl") {
    throw new Error("Email logo is locked. Only the hero image can be changed.");
  }

  const absoluteUrl = url.trim();
  if (!isReliableHostedEmailImageUrl(absoluteUrl)) {
    throw new Error(
      "Hero image must be stored in the Supabase email-images bucket.",
    );
  }
  if (!isSupabaseEmailImageUrl(absoluteUrl)) {
    throw new Error(
      "Hero image must be uploaded to the Supabase email-images bucket.",
    );
  }

  const existingRows = await prisma.emailTemplate.findMany();
  const previousHeroUrls = existingRows
    .map((row) => row.heroImageUrl)
    .filter((value): value is string => Boolean(value?.trim()));

  await Promise.all(
    EMAIL_TEMPLATE_NAMES.map(async (name) => {
      const row = existingRows.find((entry) => entry.name === name);
      const defaults = getDefaultEmailTemplate(name);

      await prisma.emailTemplate.upsert({
        where: { name },
        create: {
          name,
          subject: row?.subject ?? defaults.subject,
          logoUrl: HATHOR_EMAIL_LOGO_URL,
          heroImageUrl: absoluteUrl,
          primaryColor: row?.primaryColor ?? defaults.primaryColor,
          backgroundColor: row?.backgroundColor ?? defaults.backgroundColor,
          heroHeading: row?.heroHeading ?? defaults.heroHeading,
          bodyText: row?.bodyText ?? defaults.bodyText,
        },
        update: {
          logoUrl: HATHOR_EMAIL_LOGO_URL,
          heroImageUrl: absoluteUrl,
        },
      });
    }),
  );

  return { previousHeroUrls };
}

/** @deprecated Prefer propagateEmailImageToAllTemplates for hero only. */
export async function propagateEmailHeroAndCleanup(
  publicUrl: string,
  objectPath: string,
): Promise<string> {
  const { previousHeroUrls } = await propagateEmailImageToAllTemplates(
    "heroImageUrl",
    publicUrl,
  );
  await deleteReplacedEmailHeroObjects({
    keepPath: objectPath,
    previousUrls: previousHeroUrls,
  });
  return publicUrl;
}
