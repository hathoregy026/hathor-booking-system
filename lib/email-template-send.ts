import {
  getDefaultEmailTemplate,
  interpolateEmailText,
  mergeEmailTemplate,
  type EmailTemplateName,
  type EmailTemplateRecord,
} from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";

/** Fetch template for sending — always returns usable values (defaults on failure). */
export async function getEmailTemplateForSend(
  name: EmailTemplateName,
): Promise<EmailTemplateRecord> {
  try {
    const row = await prisma.emailTemplate.findUnique({ where: { name } });
    return mergeEmailTemplate(name, row ? {
      id: row.id,
      name: name as EmailTemplateName,
      subject: row.subject,
      logoUrl: row.logoUrl,
      heroImageUrl: row.heroImageUrl,
      primaryColor: row.primaryColor,
      backgroundColor: row.backgroundColor,
      heroHeading: row.heroHeading,
      bodyText: row.bodyText,
      updatedAt: row.updatedAt.toISOString(),
    } : null);
  } catch (error) {
    console.error(`[email] failed to load template ${name}, using defaults:`, error);
    return getDefaultEmailTemplate(name);
  }
}

export function resolveEmailSubject(
  template: EmailTemplateRecord,
  vars: Record<string, string>,
): string {
  return interpolateEmailText(template.subject, vars);
}
