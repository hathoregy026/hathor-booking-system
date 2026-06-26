import "server-only";

import type {
  EmailTemplateOverrides,
  EmailTemplateRecord,
} from "@/lib/email-templates";
import {
  HATHOR_EMAIL_HERO_URL,
  HATHOR_EMAIL_LOGO_URL,
} from "@/lib/email-branding-urls";
import { pickReliableEmailImageUrl } from "@/lib/email-branding-shared";

/** Theme overrides for server-side email render/send (hosted image URLs). */
export function toEmailThemeOverridesForSend(
  template: EmailTemplateRecord | null | undefined,
): EmailTemplateOverrides | undefined {
  if (!template) return undefined;

  return {
    logoUrl:
      pickReliableEmailImageUrl(template.logoUrl) ?? HATHOR_EMAIL_LOGO_URL,
    heroImageUrl:
      pickReliableEmailImageUrl(template.heroImageUrl) ?? HATHOR_EMAIL_HERO_URL,
    primaryColor: template.primaryColor,
    backgroundColor: template.backgroundColor,
    heroHeading: template.heroHeading,
    bodyText: template.bodyText,
  };
}
