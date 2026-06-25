import { EMAIL_LOGO_URL, emailColors } from "@/emails/styles";
import {
  EMAIL_LOGO_ASSET_PATH,
  isEmailImageDataUrl,
  resolveEmailLogoSrc,
} from "@/lib/email-image-shared";
import { toAbsolutePublicUrl } from "@/lib/public-url";

export const EMAIL_TEMPLATE_NAMES = [
  "BookingReceived",
  "BookingConfirmed",
  "AdminAlert",
] as const;

export type EmailTemplateName = (typeof EMAIL_TEMPLATE_NAMES)[number];

export type EmailTemplateRecord = {
  id: string | null;
  name: EmailTemplateName;
  subject: string;
  logoUrl: string | null;
  logoDataUrl: string | null;
  heroImageUrl: string | null;
  heroImageDataUrl: string | null;
  primaryColor: string;
  backgroundColor: string;
  heroHeading: string | null;
  bodyText: string | null;
  updatedAt: string | null;
};

export type EmailTemplateOverrides = {
  logoUrl?: string | null;
  logoDataUrl?: string | null;
  heroImageUrl?: string | null;
  heroImageDataUrl?: string | null;
  primaryColor?: string | null;
  backgroundColor?: string | null;
  heroHeading?: string | null;
  bodyText?: string | null;
};

export type EmailSendTemplate = EmailTemplateRecord & {
  subject: string;
};

const DEFAULT_TEMPLATES: Record<EmailTemplateName, Omit<EmailTemplateRecord, "id" | "updatedAt">> = {
  BookingReceived: {
    name: "BookingReceived",
    subject: "Your Hathor booking request has been received",
    logoUrl: EMAIL_LOGO_URL,
    logoDataUrl: null,
    heroImageUrl: null,
    heroImageDataUrl: null,
    primaryColor: emailColors.gold,
    backgroundColor: emailColors.background,
    heroHeading: "Thank You, {guestName}",
    bodyText:
      "Your booking request has been received. Our team is reviewing your reservation and will contact you within 24 hours to confirm your luxury Nile cruise experience.",
  },
  BookingConfirmed: {
    name: "BookingConfirmed",
    subject: "Your Hathor Dahabiya cruise is confirmed",
    logoUrl: EMAIL_LOGO_URL,
    logoDataUrl: null,
    heroImageUrl: null,
    heroImageDataUrl: null,
    primaryColor: emailColors.gold,
    backgroundColor: emailColors.background,
    heroHeading: "Welcome Aboard, {guestName}",
    bodyText:
      "Your Hathor Dahabiya cruise is officially confirmed. We are preparing an unforgettable journey along the Nile, just for you.",
  },
  AdminAlert: {
    name: "AdminAlert",
    subject: "New booking request — {guestName}",
    logoUrl: EMAIL_LOGO_URL,
    logoDataUrl: null,
    heroImageUrl: null,
    heroImageDataUrl: null,
    primaryColor: emailColors.gold,
    backgroundColor: emailColors.background,
    heroHeading: "New Booking Request",
    bodyText:
      "Please log in to the admin dashboard to review and confirm this booking.",
  },
};

export function isEmailTemplateName(value: string): value is EmailTemplateName {
  return EMAIL_TEMPLATE_NAMES.includes(value as EmailTemplateName);
}

export function getDefaultEmailTemplates(): EmailTemplateRecord[] {
  return EMAIL_TEMPLATE_NAMES.map((name) => ({
    id: null,
    updatedAt: null,
    ...DEFAULT_TEMPLATES[name],
  }));
}

export function getDefaultEmailTemplate(
  name: EmailTemplateName,
): EmailTemplateRecord {
  return {
    id: null,
    updatedAt: null,
    ...DEFAULT_TEMPLATES[name],
  };
}

export function mergeEmailTemplate(
  name: EmailTemplateName,
  row?: Partial<EmailTemplateRecord> | null,
): EmailTemplateRecord {
  const defaults = getDefaultEmailTemplate(name);

  if (!row) return defaults;

  return {
    id: row.id ?? defaults.id,
    name,
    subject: row.subject?.trim() || defaults.subject,
    logoUrl: toAbsolutePublicUrl(row.logoUrl?.trim()) || defaults.logoUrl,
    logoDataUrl: isEmailImageDataUrl(row.logoDataUrl)
      ? row.logoDataUrl!.trim()
      : defaults.logoDataUrl,
    heroImageUrl:
      toAbsolutePublicUrl(row.heroImageUrl?.trim()) || defaults.heroImageUrl,
    heroImageDataUrl: isEmailImageDataUrl(row.heroImageDataUrl)
      ? row.heroImageDataUrl!.trim()
      : defaults.heroImageDataUrl,
    primaryColor: row.primaryColor?.trim() || defaults.primaryColor,
    backgroundColor: row.backgroundColor?.trim() || defaults.backgroundColor,
    heroHeading: row.heroHeading?.trim() || defaults.heroHeading,
    bodyText: row.bodyText?.trim() || defaults.bodyText,
    updatedAt: row.updatedAt ?? defaults.updatedAt,
  };
}

export function mergeAllEmailTemplates(
  rows: Array<{
    id: string;
    name: string;
    subject: string;
    logoUrl: string | null;
    logoDataUrl: string | null;
    heroImageUrl: string | null;
    heroImageDataUrl: string | null;
    primaryColor: string;
    backgroundColor: string;
    heroHeading: string | null;
    bodyText: string | null;
    updatedAt: Date;
  }>,
): EmailTemplateRecord[] {
  const byName = new Map(rows.map((row) => [row.name, row]));

  return EMAIL_TEMPLATE_NAMES.map((name) => {
    const row = byName.get(name);
    if (!row) return getDefaultEmailTemplate(name);

    return mergeEmailTemplate(name, {
      id: row.id,
      name: name as EmailTemplateName,
      subject: row.subject,
      logoUrl: row.logoUrl,
      logoDataUrl: row.logoDataUrl,
      heroImageUrl: row.heroImageUrl,
      heroImageDataUrl: row.heroImageDataUrl,
      primaryColor: row.primaryColor,
      backgroundColor: row.backgroundColor,
      heroHeading: row.heroHeading,
      bodyText: row.bodyText,
      updatedAt: row.updatedAt.toISOString(),
    });
  });
}

export function interpolateEmailText(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

export function toEmailThemeOverrides(
  template: EmailTemplateRecord | null | undefined,
): EmailTemplateOverrides | undefined {
  if (!template) return undefined;

  const previewLogoUrl = toAbsolutePublicUrl(template.logoUrl);
  const previewHeroUrl = toAbsolutePublicUrl(template.heroImageUrl);

  return {
    logoUrl: resolveEmailLogoSrc(template.logoDataUrl, previewLogoUrl),
    logoDataUrl: template.logoDataUrl,
    heroImageUrl:
      (isEmailImageDataUrl(template.heroImageDataUrl)
        ? template.heroImageDataUrl
        : previewHeroUrl) ?? null,
    heroImageDataUrl: template.heroImageDataUrl,
    primaryColor: template.primaryColor,
    backgroundColor: template.backgroundColor,
    heroHeading: template.heroHeading,
    bodyText: template.bodyText,
  };
}

/** Logo src for admin UI preview — prefers stored preview URL, not full data URL. */
export function getEmailTemplatePreviewLogoSrc(
  template: EmailTemplateRecord,
): string {
  if (template.logoUrl) return template.logoUrl;
  if (isEmailImageDataUrl(template.logoDataUrl)) return template.logoDataUrl!;
  return EMAIL_LOGO_ASSET_PATH;
}

export function getEmailTemplatePreviewHeroSrc(
  template: EmailTemplateRecord,
): string | null {
  if (template.heroImageUrl) return template.heroImageUrl;
  if (isEmailImageDataUrl(template.heroImageDataUrl)) {
    return template.heroImageDataUrl;
  }
  return null;
}
