import { render } from "@react-email/render";
import AdminAlertEmail from "@/emails/AdminAlert";
import BookingConfirmedEmail from "@/emails/BookingConfirmed";
import BookingReceivedEmail from "@/emails/BookingReceived";
import { sampleBookingDetails, sampleGuestName } from "@/emails/sample-data";
import { pickReliableEmailImageUrl } from "@/lib/email-branding-shared";
import {
  HATHOR_EMAIL_HERO_URL,
  HATHOR_EMAIL_LOGO_URL,
} from "@/lib/email-branding-urls";
import {
  EMAIL_TEMPLATE_NAMES,
  getDefaultEmailTemplate,
  interpolateEmailText,
  isEmailTemplateName,
  withEmailCacheBust,
  type EmailTemplateName,
  type EmailTemplateOverrides,
  type EmailTemplateRecord,
} from "@/lib/email-templates";

export type EmailPreviewDraftShared = {
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  primaryColor?: string | null;
  backgroundColor?: string | null;
};

export type EmailPreviewDraftCopy = {
  name?: string;
  subject?: string | null;
  heroHeading?: string | null;
  bodyText?: string | null;
};

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const MAX_SUBJECT = 200;
const MAX_BODY = 8_000;
const MAX_HEADING = 300;

function sanitizeColor(value: string | null | undefined, fallback: string): string {
  const trimmed = value?.trim() || "";
  return HEX_COLOR.test(trimmed) ? trimmed : fallback;
}

function clip(value: string | null | undefined, max: number): string | null {
  const trimmed = value?.trim() || "";
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

/** Fresh cache-bust so dashboard preview never shows stale logo/hero bytes. */
export function buildEmailPreviewTheme(
  template: EmailTemplateRecord,
): EmailTemplateOverrides {
  const version = `${template.updatedAt ?? "draft"}-${Date.now()}`;
  const logoBase =
    pickReliableEmailImageUrl(template.logoUrl) ?? HATHOR_EMAIL_LOGO_URL;
  const heroBase =
    pickReliableEmailImageUrl(template.heroImageUrl) ?? HATHOR_EMAIL_HERO_URL;

  return {
    logoUrl: withEmailCacheBust(logoBase, version) ?? logoBase,
    heroImageUrl: withEmailCacheBust(heroBase, version) ?? heroBase,
    primaryColor: template.primaryColor,
    backgroundColor: template.backgroundColor,
    heroHeading: template.heroHeading,
    bodyText: template.bodyText,
  };
}

/**
 * Build template records from the live admin form (unsaved edits included).
 * Falls back to defaults / DB-shaped values for any missing fields.
 */
export function buildDraftEmailTemplates(
  shared: EmailPreviewDraftShared | null | undefined,
  copies: EmailPreviewDraftCopy[] | null | undefined,
  baseRows?: EmailTemplateRecord[],
): EmailTemplateRecord[] {
  const byName = new Map((baseRows ?? []).map((row) => [row.name, row]));
  const now = new Date().toISOString();

  const sharedLogo =
    pickReliableEmailImageUrl(shared?.logoUrl) ??
    pickReliableEmailImageUrl(baseRows?.[0]?.logoUrl) ??
    HATHOR_EMAIL_LOGO_URL;
  const sharedHero =
    pickReliableEmailImageUrl(shared?.heroImageUrl) ??
    pickReliableEmailImageUrl(baseRows?.[0]?.heroImageUrl) ??
    HATHOR_EMAIL_HERO_URL;

  return EMAIL_TEMPLATE_NAMES.map((name) => {
    const defaults = getDefaultEmailTemplate(name);
    const base = byName.get(name) ?? defaults;
    const patch = (copies ?? []).find(
      (entry) => entry.name && isEmailTemplateName(entry.name) && entry.name === name,
    );

    const primaryColor = sanitizeColor(
      shared?.primaryColor ?? base.primaryColor,
      defaults.primaryColor,
    );
    const backgroundColor = sanitizeColor(
      shared?.backgroundColor ?? base.backgroundColor,
      defaults.backgroundColor,
    );

    return {
      id: base.id,
      name,
      subject: clip(patch?.subject, MAX_SUBJECT) || base.subject || defaults.subject,
      logoUrl: sharedLogo,
      heroImageUrl: sharedHero,
      primaryColor,
      backgroundColor,
      heroHeading:
        clip(patch?.heroHeading, MAX_HEADING) ??
        base.heroHeading ??
        defaults.heroHeading,
      bodyText:
        clip(patch?.bodyText, MAX_BODY) ?? base.bodyText ?? defaults.bodyText,
      updatedAt: now,
    };
  });
}

async function renderTemplateHtml(
  name: EmailTemplateName,
  overrides: EmailTemplateOverrides,
): Promise<string> {
  switch (name) {
    case "BookingReceived":
      return render(
        BookingReceivedEmail({
          guestName: sampleGuestName,
          details: sampleBookingDetails,
          ...overrides,
        }),
      );
    case "BookingConfirmed":
      return render(
        BookingConfirmedEmail({
          guestName: sampleGuestName,
          details: sampleBookingDetails,
          ...overrides,
        }),
      );
    case "AdminAlert":
      return render(
        AdminAlertEmail({
          details: sampleBookingDetails,
          ...overrides,
        }),
      );
  }
}

export async function renderEmailTemplatePreview(
  template: EmailTemplateRecord,
): Promise<{ name: EmailTemplateName; subject: string; html: string }> {
  const overrides = buildEmailPreviewTheme(template);
  const subject = interpolateEmailText(template.subject, {
    guestName: sampleGuestName,
  });

  return {
    name: template.name,
    subject,
    html: await renderTemplateHtml(template.name, overrides),
  };
}

export async function renderAllEmailTemplatePreviews(
  templates: EmailTemplateRecord[],
): Promise<Array<{ name: EmailTemplateName; subject: string; html: string }>> {
  return Promise.all(templates.map((template) => renderEmailTemplatePreview(template)));
}
