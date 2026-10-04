import {
  getDefaultEmailTemplate,
  interpolateEmailText,
  mergeEmailTemplate,
  type EmailTemplateName,
  type EmailTemplateRecord,
} from "@/lib/email-templates";
import { pickSharedEmailBrandingFromRows } from "@/lib/email-branding-shared";
import { loadEmailFooter } from "@/lib/email-footer-db";
import { prisma } from "@/lib/prisma";

/**
 * Fetch template for sending — always returns usable values (defaults on
 * failure), with the footer wording every email shares.
 */
export async function getEmailTemplateForSend(
  name: EmailTemplateName,
): Promise<EmailTemplateRecord> {
  const [template, footer] = await Promise.all([loadTemplate(name), loadEmailFooter()]);
  return { ...template, footer };
}

async function loadTemplate(name: EmailTemplateName): Promise<EmailTemplateRecord> {
  try {
    const rows = await prisma.emailTemplate.findMany();
    const shared = pickSharedEmailBrandingFromRows(rows);
    const row = rows.find((entry) => entry.name === name);

    return mergeEmailTemplate(
      name,
      row
        ? {
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
          }
        : null,
      shared,
    );
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
