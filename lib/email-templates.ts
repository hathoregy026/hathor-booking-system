import {
  pickReliableEmailImageUrl,
  pickSharedEmailBrandingFromRows,
} from "@/lib/email-branding-shared";
import {
  HATHOR_EMAIL_HERO_URL,
  HATHOR_EMAIL_LOGO_URL,
} from "@/lib/email-branding-urls";
import { emailColors } from "@/emails/styles";
import { HATHOR_LOGO_SRC } from "@/lib/branding";

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
  heroImageUrl: string | null;
  primaryColor: string;
  backgroundColor: string;
  heroHeading: string | null;
  bodyText: string | null;
  updatedAt: string | null;
};

export type EmailTemplateOverrides = {
  logoUrl?: string | null;
  heroImageUrl?: string | null;
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
    logoUrl: HATHOR_EMAIL_LOGO_URL,
    heroImageUrl: HATHOR_EMAIL_HERO_URL,
    primaryColor: emailColors.gold,
    backgroundColor: emailColors.background,
    heroHeading: "Thank You, {guestName}",
    bodyText:
      "Your booking request has been received. Our team is reviewing your reservation and will contact you within 24 hours to confirm your luxury Nile cruise experience.",
  },
  BookingConfirmed: {
    name: "BookingConfirmed",
    subject: "Reservation confirmed — payment pending | Hathor Dahabiya",
    logoUrl: HATHOR_EMAIL_LOGO_URL,
    heroImageUrl: HATHOR_EMAIL_HERO_URL,
    primaryColor: emailColors.gold,
    backgroundColor: emailColors.background,
    heroHeading: "Reservation Confirmed, {guestName}",
    bodyText:
      "Your cabin is reserved. No payment has been collected yet; the full balance remains pending.",
  },
  AdminAlert: {
    name: "AdminAlert",
    subject: "New confirmed reservation — {guestName}",
    logoUrl: HATHOR_EMAIL_LOGO_URL,
    heroImageUrl: HATHOR_EMAIL_HERO_URL,
    primaryColor: emailColors.gold,
    backgroundColor: emailColors.background,
    heroHeading: "New Confirmed Reservation",
    bodyText:
      "This reservation was confirmed automatically without collecting payment. Follow up through your approved payment process.",
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
  shared?: { logoUrl: string | null; heroImageUrl: string | null },
): EmailTemplateRecord {
  const defaults = getDefaultEmailTemplate(name);

  if (!row) {
    return applySharedEmailBranding(defaults, shared);
  }

  return applySharedEmailBranding(
    {
      id: row.id ?? defaults.id,
      name,
      subject: row.subject?.trim() || defaults.subject,
      logoUrl: pickReliableEmailImageUrl(row.logoUrl) || defaults.logoUrl,
      heroImageUrl:
        pickReliableEmailImageUrl(row.heroImageUrl) || defaults.heroImageUrl,
      primaryColor: row.primaryColor?.trim() || defaults.primaryColor,
      backgroundColor: row.backgroundColor?.trim() || defaults.backgroundColor,
      heroHeading: row.heroHeading?.trim() || defaults.heroHeading,
      bodyText: row.bodyText?.trim() || defaults.bodyText,
      updatedAt: row.updatedAt ?? defaults.updatedAt,
    },
    shared,
  );
}

function applySharedEmailBranding(
  template: EmailTemplateRecord,
  shared?: { logoUrl: string | null; heroImageUrl: string | null },
): EmailTemplateRecord {
  const defaults = getDefaultEmailTemplate(template.name);

  return {
    ...template,
    logoUrl: HATHOR_EMAIL_LOGO_URL,
    heroImageUrl:
      pickReliableEmailImageUrl(
        template.heroImageUrl,
        shared?.heroImageUrl,
        defaults.heroImageUrl,
      ) ?? defaults.heroImageUrl,
  };
}

export function mergeAllEmailTemplates(
  rows: Array<{
    id: string;
    name: string;
    subject: string;
    logoUrl: string | null;
    heroImageUrl: string | null;
    primaryColor: string;
    backgroundColor: string;
    heroHeading: string | null;
    bodyText: string | null;
    updatedAt: Date;
  }>,
): EmailTemplateRecord[] {
  const byName = new Map(rows.map((row) => [row.name, row]));
  const shared = pickSharedEmailBrandingFromRows(rows);

  return EMAIL_TEMPLATE_NAMES.map((name) => {
    const row = byName.get(name);
    if (!row) return mergeEmailTemplate(name, null, shared);

    return mergeEmailTemplate(
      name,
      {
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
      },
      shared,
    );
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

  return {
    logoUrl: HATHOR_EMAIL_LOGO_URL,
    heroImageUrl:
      pickReliableEmailImageUrl(template.heroImageUrl) ?? HATHOR_EMAIL_HERO_URL,
    primaryColor: template.primaryColor,
    backgroundColor: template.backgroundColor,
    heroHeading: template.heroHeading,
    bodyText: template.bodyText,
  };
}

/**
 * Hosted HTTPS image URLs for outbound mail (never CID attachments).
 * Logo is always the locked Hathor icon. Cache-bust with digits only.
 */
export function buildEmailSendTheme(
  template: EmailTemplateRecord,
): EmailTemplateOverrides {
  const version = String(
    template.updatedAt ? Date.parse(template.updatedAt) || Date.now() : Date.now(),
  );
  const heroBase =
    pickReliableEmailImageUrl(template.heroImageUrl) ?? HATHOR_EMAIL_HERO_URL;

  return {
    logoUrl: withEmailCacheBust(HATHOR_EMAIL_LOGO_URL, version) ?? HATHOR_EMAIL_LOGO_URL,
    heroImageUrl: withEmailCacheBust(heroBase, version) ?? heroBase,
    primaryColor: template.primaryColor?.trim() || emailColors.gold,
    backgroundColor: template.backgroundColor?.trim() || emailColors.background,
    heroHeading: template.heroHeading,
    bodyText: template.bodyText,
  };
}

export function withEmailCacheBust(
  url: string | null | undefined,
  version: string | null | undefined,
): string | null {
  const base = url?.trim();
  if (!base) return null;
  /* Strip prior query; attach a digits-only bust token. */
  const clean = base.split("?")[0] ?? base;
  const digits = (version?.trim() || "").replace(/\D/g, "").slice(0, 16);
  if (!digits) return clean;
  return `${clean}?v=${digits}`;
}

export function getEmailTemplatePreviewLogoSrc(
  _template: EmailTemplateRecord,
): string {
  return HATHOR_EMAIL_LOGO_URL;
}

export function getEmailTemplatePreviewLogoFallback(): string {
  return HATHOR_LOGO_SRC;
}

export function getEmailTemplatePreviewHeroSrc(
  template: EmailTemplateRecord,
): string | null {
  return pickReliableEmailImageUrl(template.heroImageUrl) ?? HATHOR_EMAIL_HERO_URL;
}
