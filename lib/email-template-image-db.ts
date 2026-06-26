import {
  EMAIL_TEMPLATE_NAMES,
  getDefaultEmailTemplate,
  type EmailTemplateName,
} from "@/lib/email-templates";
import {
  isReliableHostedEmailImageUrl,
  pickReliableEmailImageUrl,
  pickSharedEmailBrandingFromRows,
} from "@/lib/email-branding-shared";
import { prisma } from "@/lib/prisma";

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

/** Persist a new image URL on every email template (logo/hero are shared brand assets). */
export async function propagateEmailImageToAllTemplates(
  field: "logoUrl" | "heroImageUrl",
  url: string,
): Promise<void> {
  const absoluteUrl = url.trim();
  if (!isReliableHostedEmailImageUrl(absoluteUrl)) {
    throw new Error(
      "Email images must be uploaded to the Supabase email-images bucket.",
    );
  }

  const existingRows = await prisma.emailTemplate.findMany();
  const shared = pickSharedEmailBrandingFromRows(existingRows);

  await Promise.all(
    EMAIL_TEMPLATE_NAMES.map(async (name) => {
      const row = existingRows.find((entry) => entry.name === name);
      const defaults = getDefaultEmailTemplate(name);

      const logoUrl =
        field === "logoUrl"
          ? absoluteUrl
          : pickReliableEmailImageUrl(row?.logoUrl, shared.logoUrl, defaults.logoUrl);

      const heroImageUrl =
        field === "heroImageUrl"
          ? absoluteUrl
          : pickReliableEmailImageUrl(
              row?.heroImageUrl,
              shared.heroImageUrl,
              defaults.heroImageUrl,
            );

      await prisma.emailTemplate.upsert({
        where: { name },
        create: {
          name,
          subject: row?.subject ?? defaults.subject,
          logoUrl,
          heroImageUrl,
          primaryColor: row?.primaryColor ?? defaults.primaryColor,
          backgroundColor: row?.backgroundColor ?? defaults.backgroundColor,
          heroHeading: row?.heroHeading ?? defaults.heroHeading,
          bodyText: row?.bodyText ?? defaults.bodyText,
        },
        update: { [field]: absoluteUrl },
      });
    }),
  );
}
