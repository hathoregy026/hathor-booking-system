import { prisma } from "@/lib/prisma";
import {
  DEFAULT_EMAIL_FOOTER,
  EMAIL_FOOTER_KEY,
  parseEmailFooter,
  type EmailFooterSettings,
} from "@/lib/email-footer";

/** The saved footer wording; the defaults if none is saved or the read fails. */
export async function loadEmailFooter(): Promise<EmailFooterSettings> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: EMAIL_FOOTER_KEY },
      select: { value: true },
    });
    return setting ? parseEmailFooter(JSON.parse(setting.value)) : { ...DEFAULT_EMAIL_FOOTER };
  } catch (error) {
    /* An email must still go out with its footer, even if the setting cannot be read. */
    console.error("[email] footer setting unavailable, using defaults:", error);
    return { ...DEFAULT_EMAIL_FOOTER };
  }
}

export async function saveEmailFooter(raw: unknown): Promise<EmailFooterSettings> {
  const footer = parseEmailFooter(raw);
  const value = JSON.stringify(footer);
  await prisma.siteSetting.upsert({
    where: { key: EMAIL_FOOTER_KEY },
    create: { key: EMAIL_FOOTER_KEY, value },
    update: { value },
  });
  return footer;
}
